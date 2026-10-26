import type { JSONContent } from "@tiptap/react";

export type CheckStatus = "pass" | "warn" | "fail";

export type Check = {
  id: string;
  label: string;
  status: CheckStatus;
  message: string;
  weight: number;
};

export type SeoInput = {
  focusKeyword: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  summary: string;
  contentRich: JSONContent | null | undefined;
  siteName: string;
};

export type AnalysisResult = {
  score: number;
  seoChecks: Check[];
  readabilityChecks: Check[];
};

/* ----------------------------- content extraction ----------------------------- */

type Extracted = {
  text: string;
  paragraphs: string[];
  firstParagraph: string;
  headings: { level: number; text: string }[];
  images: { hasAlt: boolean }[];
  links: { href: string; external: boolean; rel: string }[];
  wordCount: number;
};

function normalizeSpace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function nodeText(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  if (!node.content) return "";
  return node.content.map(nodeText).join("");
}

function walk(content: JSONContent | null | undefined): Extracted {
  const result: Extracted = {
    text: "",
    paragraphs: [],
    firstParagraph: "",
    headings: [],
    images: [],
    links: [],
    wordCount: 0,
  };
  if (!content || !content.content) return result;

  const visit = (node: JSONContent) => {
    switch (node.type) {
      case "heading": {
        const text = normalizeSpace(nodeText(node));
        if (text) result.headings.push({ level: (node.attrs?.level as number) ?? 2, text });
        break;
      }
      case "paragraph": {
        const text = normalizeSpace(nodeText(node));
        if (text) result.paragraphs.push(text);
        break;
      }
      case "image": {
        const alt = (node.attrs?.alt as string) ?? "";
        result.images.push({ hasAlt: alt.trim().length > 0 });
        break;
      }
    }

    // Kumpulkan tautan dari mark "link".
    if (node.type === "text" && node.marks) {
      for (const mark of node.marks) {
        if (mark.type === "link") {
          const href = (mark.attrs?.href as string) ?? "";
          const external = /^https?:\/\//i.test(href) && !href.includes("localhost");
          result.links.push({ href, external, rel: (mark.attrs?.rel as string) ?? "" });
        }
      }
    }

    node.content?.forEach(visit);
  };

  visit(content);

  result.text = result.paragraphs.join(" ");
  // Teks heading juga ikut dihitung untuk kepadatan keyword.
  const fullText = [result.text, result.headings.map((h) => h.text).join(" ")].join(" ");
  result.firstParagraph = result.paragraphs[0] ?? "";
  result.wordCount = fullText ? fullText.split(/\s+/).filter(Boolean).length : 0;
  return result;
}

/* --------------------------------- helpers --------------------------------- */

const SITE_SUFFIX_SEP = " | ";

function statusValue(status: CheckStatus): number {
  return status === "pass" ? 1 : status === "warn" ? 0.5 : 0;
}

function scoreOf(checks: Check[]): number {
  const total = checks.reduce((s, c) => s + c.weight, 0);
  if (total === 0) return 0;
  const earned = checks.reduce((s, c) => s + c.weight * statusValue(c.status), 0);
  return Math.round((earned / total) * 100);
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  let count = 0;
  let idx = h.indexOf(n);
  while (idx !== -1) {
    count += 1;
    idx = h.indexOf(n, idx + n.length);
  }
  return count;
}

// Estimasi suku kata (heuristic, cukup untuk angka Flesch relatif).
function estimateSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  const vowelGroups = w.match(/[aeiouy]+/g);
  let syllables = vowelGroups ? vowelGroups.length : 1;
  if (w.endsWith("e") && syllables > 1) syllables -= 1;
  return Math.max(1, syllables);
}

function fleschReadingEase(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter(Boolean);
  if (sentences.length === 0 || words.length === 0) return 0;
  const syllables = words.reduce((s, w) => s + estimateSyllables(w), 0);
  const asl = words.length / sentences.length; // rata-rata panjang kalimat
  const asw = syllables / words.length; // rata-rata suku kata per kata
  return 206.835 - 1.015 * asl - 84.6 * asw;
}

/* ------------------------------- on-page checks ------------------------------ */

const TRANSITION_WORDS = [
  "dan", "atau", "tetapi", "namun", "sehingga", "karena", "meskipun",
  "selain itu", "oleh karena itu", "jadi", "maka", "sedangkan", "kemudian",
  "selanjutnya", "pertama", "kedua", "ketiga", "contohnya", "misalnya",
  "singkatnya", "kesimpulannya", "di sisi lain", "akibatnya", "dengan demikian",
];

function buildSeoChecks(input: SeoInput, data: Extracted): Check[] {
  const checks: Check[] = [];
  const kw = input.focusKeyword.trim();
  const effectiveTitle = (input.metaTitle || "").trim()
    ? input.metaTitle.trim()
    : [input.title, input.siteName].filter(Boolean).join(SITE_SUFFIX_SEP);
  const description = (input.metaDescription || input.summary || "").trim();

  // Fokus keyword terisi.
  checks.push({
    id: "focus-keyword",
    label: "Kata kunci fokus",
    weight: 3,
    status: kw ? "pass" : "fail",
    message: kw ? `Kata kunci fokus: "${kw}".` : "Isi kata kunci fokus untuk memulai analisis SEO.",
  });

  if (kw) {
    const inTitle = countOccurrences(effectiveTitle, kw) > 0;
    checks.push({
      id: "kw-title",
      label: "Keyword di judul",
      weight: 3,
      status: inTitle ? "pass" : "fail",
      message: inTitle ? "Kata kunci terdapat di judul." : "Kata kunci belum ada di judul.",
    });

    const inSlug = countOccurrences(input.slug, kw) > 0;
    checks.push({
      id: "kw-slug",
      label: "Keyword di slug",
      weight: 2,
      status: inSlug ? "pass" : "warn",
      message: inSlug ? "Kata kunci terdapat di slug." : "Pertimbangkan menambahkan kata kunci ke slug.",
    });

    const inMeta = countOccurrences(input.metaDescription, kw) > 0;
    checks.push({
      id: "kw-meta",
      label: "Keyword di meta description",
      weight: 2,
      status: inMeta ? "pass" : "warn",
      message: inMeta ? "Kata kunci terdapat di meta description." : "Kata kunci belum ada di meta description.",
    });

    const inFirst = countOccurrences(data.firstParagraph, kw) > 0;
    checks.push({
      id: "kw-first",
      label: "Keyword di paragraf pertama",
      weight: 2,
      status: inFirst ? "pass" : "fail",
      message: inFirst ? "Kata kunci muncul di paragraf pertama." : "Gunakan kata kunci di paragraf pertama.",
    });

    const contentHits = countOccurrences(data.text, kw);
    checks.push({
      id: "kw-content",
      label: "Keyword di konten",
      weight: 2,
      status: contentHits > 0 ? "pass" : "fail",
      message: contentHits > 0 ? `Kata kunci muncul ${contentHits}x di konten.` : "Kata kunci belum muncul di konten.",
    });

    // Kepadatan keyword (0.5% - 3%).
    const kwWords = kw.split(/\s+/).filter(Boolean).length;
    const density = data.wordCount > 0 ? (contentHits * kwWords * 100) / data.wordCount : 0;
    let densityStatus: CheckStatus = "warn";
    let densityMsg = `Kepadatan kata kunci ${density.toFixed(2)}%. Target 0,5% - 3%.`;
    if (density === 0) densityStatus = "fail";
    else if (density >= 0.5 && density <= 3) densityStatus = "pass";
    else if (density > 3) densityMsg = `Kepadatan kata kunci ${density.toFixed(2)}% terlalu tinggi, kurangi spam.`;
    checks.push({
      id: "kw-density",
      label: "Kepadatan kata kunci",
      weight: 1,
      status: densityStatus,
      message: densityMsg,
    });
  }

  // Panjang judul (10-60).
  const titleLen = effectiveTitle.length;
  checks.push({
    id: "title-length",
    label: "Panjang judul",
    weight: 2,
    status: titleLen >= 10 && titleLen <= 60 ? "pass" : titleLen > 0 ? "warn" : "fail",
    message:
      titleLen === 0
        ? "Judul kosong."
        : titleLen >= 10 && titleLen <= 60
          ? `Panjang judul ideal (${titleLen} karakter).`
          : `Panjang judul ${titleLen} karakter, idealnya 10-60.`,
  });

  // Panjang meta description (120-160).
  const descLen = description.length;
  checks.push({
    id: "meta-length",
    label: "Panjang meta description",
    weight: 2,
    status: descLen >= 120 && descLen <= 160 ? "pass" : descLen > 0 ? "warn" : "fail",
    message:
      descLen === 0
        ? "Meta description kosong."
        : descLen >= 120 && descLen <= 160
          ? `Panjang meta ideal (${descLen} karakter).`
          : `Meta description ${descLen} karakter, idealnya 120-160.`,
  });

  // Ada H1.
  const hasH1 = data.headings.some((h) => h.level === 1);
  checks.push({
    id: "h1",
    label: "Punya H1",
    weight: 2,
    status: hasH1 ? "pass" : "warn",
    message: hasH1 ? "Konten punya satu heading H1." : "Tambahkan satu heading H1 di konten.",
  });

  // Subheading cukup (>= 2 heading selain H1) dan keyword di heading.
  const subheadings = data.headings.filter((h) => h.level >= 2);
  checks.push({
    id: "subheadings",
    label: "Subheading cukup",
    weight: 1,
    status: subheadings.length >= 2 ? "pass" : subheadings.length === 1 ? "warn" : "fail",
    message:
      subheadings.length >= 2
        ? `${subheadings.length} subheading, struktur baik.`
        : "Gunakan lebih banyak subheading (H2/H3) untuk memecah teks.",
  });

  if (kw && data.headings.length > 0) {
    const kwInHeading = data.headings.some((h) => countOccurrences(h.text, kw) > 0);
    checks.push({
      id: "kw-heading",
      label: "Keyword di subheading",
      weight: 1,
      status: kwInHeading ? "pass" : "warn",
      message: kwInHeading ? "Kata kunci muncul di salah satu heading." : "Sisipkan kata kunci pada beberapa heading.",
    });
  }

  // Panjang konten (kata).
  const wc = data.wordCount;
  checks.push({
    id: "word-count",
    label: "Jumlah kata",
    weight: 2,
    status: wc >= 900 ? "pass" : wc >= 300 ? "warn" : "fail",
    message:
      wc >= 900
        ? `Panjang konten sangat baik (${wc} kata).`
        : wc >= 600
          ? `Panjang konten cukup (${wc} kata).`
          : wc >= 300
            ? `Konten ${wc} kata, idealnya 600-900+ kata.`
            : `Konten terlalu pendek (${wc} kata), minimal 300 kata.`,
  });

  // Gambar punya alt.
  if (data.images.length > 0) {
    const withAlt = data.images.filter((i) => i.hasAlt).length;
    checks.push({
      id: "image-alt",
      label: "Alt text gambar",
      weight: 1,
      status: withAlt === data.images.length ? "pass" : "warn",
      message: `${withAlt}/${data.images.length} gambar punya alt text.`,
    });
  }

  // Internal link >= 1.
  const internalLinks = data.links.filter((l) => !l.external).length;
  checks.push({
    id: "internal-link",
    label: "Tautan internal",
    weight: 1,
    status: internalLinks >= 1 ? "pass" : "warn",
    message: internalLinks >= 1 ? `${internalLinks} tautan internal.` : "Tambahkan minimal satu tautan internal.",
  });

  // External link ber-rel.
  const external = data.links.filter((l) => l.external);
  if (external.length > 0) {
    const withRel = external.filter((l) => l.rel && l.rel.length > 0).length;
    checks.push({
      id: "external-rel",
      label: "Rel tautan eksternal",
      weight: 1,
      status: withRel === external.length ? "pass" : "warn",
      message: `${withRel}/${external.length} tautan eksternal punya atribut rel.`,
    });
  }

  return checks;
}

/* ----------------------------- readability checks ---------------------------- */

function buildReadabilityChecks(data: Extracted): Check[] {
  const checks: Check[] = [];
  const sentences = data.text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const totalSentences = sentences.length || 1;
  const longSentences = sentences.filter((s) => s.split(/\s+/).filter(Boolean).length > 20).length;
  const longRatio = (longSentences / totalSentences) * 100;
  const avgSentenceLen = data.wordCount / totalSentences;
  const flesch = fleschReadingEase(data.text);

  const words = data.text.split(/\s+/).filter(Boolean).length;

  if (words === 0) {
    checks.push({
      id: "readable-empty",
      label: "Konten terbaca",
      weight: 1,
      status: "fail",
      message: "Belum ada teks untuk dianalisis.",
    });
    return checks;
  }

  // Flesch Reading Ease.
  let fleschStatus: CheckStatus = "warn";
  let fleschMsg = `Flesch Reading Ease ${flesch.toFixed(0)} (cukup).`;
  if (flesch >= 60) {
    fleschStatus = "pass";
    fleschMsg = `Flesch Reading Ease ${flesch.toFixed(0)} — mudah dibaca.`;
  } else if (flesch < 40) {
    fleschStatus = "fail";
    fleschMsg = `Flesch Reading Ease ${flesch.toFixed(0)} — sulit dibaca, sederhanakan kalimat.`;
  }
  checks.push({ id: "flesch", label: "Kemudahan baca (Flesch)", weight: 3, status: fleschStatus, message: fleschMsg });

  // Rata-rata panjang kalimat.
  checks.push({
    id: "avg-sentence",
    label: "Panjang kalimat rata-rata",
    weight: 2,
    status: avgSentenceLen <= 20 ? "pass" : avgSentenceLen <= 25 ? "warn" : "fail",
    message: `Rata-rata ${avgSentenceLen.toFixed(1)} kata/kalimat (ideal ≤ 20).`,
  });

  // % kalimat > 20 kata.
  checks.push({
    id: "long-sentences",
    label: "Kalimat terlalu panjang",
    weight: 2,
    status: longRatio <= 25 ? "pass" : longRatio <= 40 ? "warn" : "fail",
    message: `${longRatio.toFixed(0)}% kalimat lebih dari 20 kata.`,
  });

  // Transition words (>= 20% kalimat memakainya).
  const lower = data.text.toLowerCase();
  const transitionCount = TRANSITION_WORDS.reduce((s, w) => s + countOccurrences(lower, w), 0);
  const transitionRatio = words > 0 ? (transitionCount / totalSentences) * 100 : 0;
  checks.push({
    id: "transition-words",
    label: "Kata transisi",
    weight: 1,
    status: transitionRatio >= 20 ? "pass" : transitionRatio >= 10 ? "warn" : "fail",
    message: `±${transitionRatio.toFixed(0)}% kalimat memakai kata transisi (target ≥ 20%).`,
  });

  // Panjang paragraf.
  const longParas = data.paragraphs.filter((p) => p.split(/\s+/).filter(Boolean).length > 150).length;
  checks.push({
    id: "paragraph-length",
    label: "Panjang paragraf",
    weight: 1,
    status: longParas === 0 ? "pass" : "warn",
    message:
      longParas === 0
        ? "Panjang paragraf terkendali."
        : `${longParas} paragraf terlalu panjang, pecah agar mudah dibaca.`,
  });

  // Distribusi subheading: heading per ~150-300 kata.
  const paraCount = data.headings.length;
  const expectedHeadings = Math.max(1, Math.floor(data.wordCount / 250));
  const hasPara = data.paragraphs.length > 0;
  checks.push({
    id: "heading-distribution",
    label: "Distribusi subheading",
    weight: 1,
    status: !hasPara || paraCount >= expectedHeadings ? "pass" : "warn",
    message: `${paraCount} heading untuk ${data.wordCount} kata.`,
  });

  return checks;
}

/* --------------------------------- analyze --------------------------------- */

export function analyzeSeo(input: SeoInput): AnalysisResult {
  const data = walk(input.contentRich);
  const seoChecks = buildSeoChecks(input, data);
  const readabilityChecks = buildReadabilityChecks(data);

  const all = [...seoChecks, ...readabilityChecks];
  // Skor gabungan dengan bobot SEO sedikit lebih besar.
  const seoScore = scoreOf(seoChecks);
  const readScore = scoreOf(readabilityChecks);
  const score = Math.round(seoScore * 0.6 + readScore * 0.4);
  void all;

  return { score, seoChecks, readabilityChecks };
}
