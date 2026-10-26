"use client";

import { useMemo } from "react";
import type { JSONContent } from "@tiptap/react";
import { CheckCircle2, AlertTriangle, XCircle, Search, Gauge } from "lucide-react";
import { analyzeSeo, type Check, type CheckStatus } from "~/lib/seo-analysis";
import { cn } from "~/lib/cn";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";

const STATUS_ICON: Record<CheckStatus, React.ReactNode> = {
  pass: <CheckCircle2 size={16} className="text-green-600" />,
  warn: <AlertTriangle size={16} className="text-amber-500" />,
  fail: <XCircle size={16} className="text-red-500" />,
};

function scoreColor(score: number): string {
  if (score >= 75) return "bg-green-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function scoreText(score: number): string {
  if (score >= 75) return "Baik";
  if (score >= 50) return "Perlu perbaikan";
  return "Buruk";
}

function CheckRow({ check }: { check: Check }) {
  return (
    <li className="flex items-start gap-2.5 py-2">
      <span className="mt-0.5 shrink-0">{STATUS_ICON[check.status]}</span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{check.label}</span>
        <span className="block text-xs text-muted-foreground">{check.message}</span>
      </span>
    </li>
  );
}

export function SeoPanel({
  title,
  metaTitle,
  metaDescription,
  slug,
  summary,
  editorJson,
  focusKeyword,
  siteName,
}: {
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  summary: string;
  editorJson: JSONContent | null;
  focusKeyword: string;
  siteName: string;
}) {
  const result = useMemo(
    () =>
      analyzeSeo({
        focusKeyword,
        title,
        metaTitle,
        metaDescription,
        slug,
        summary,
        contentRich: editorJson,
        siteName,
      }),
    [focusKeyword, title, metaTitle, metaDescription, slug, summary, editorJson, siteName]
  );

  const seoFails = result.seoChecks.filter((c) => c.status !== "pass").length;
  const readFails = result.readabilityChecks.filter((c) => c.status !== "pass").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full text-white shadow-sm",
            scoreColor(result.score)
          )}
        >
          <span className="text-xl font-bold leading-none">{result.score}</span>
          <span className="text-[10px] uppercase tracking-wide opacity-90">/ 100</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-dark">Skor SEO</p>
          <p className="text-sm text-muted-foreground">{scoreText(result.score)}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Gauge size={13} /> Analisis bersifat bantuan saat menulis, tidak disimpan ke database.
          </p>
        </div>
      </div>

      <Tabs defaultValue="seo">
        <TabsList className="w-full">
          <TabsTrigger value="seo" className="flex-1">
            <Search size={14} /> SEO ({seoFails})
          </TabsTrigger>
          <TabsTrigger value="readability" className="flex-1">
            <Gauge size={14} /> Readability ({readFails})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="seo">
          <ul className="divide-y divide-border">
            {result.seoChecks.map((c) => (
              <CheckRow key={c.id} check={c} />
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="readability">
          <ul className="divide-y divide-border">
            {result.readabilityChecks.map((c) => (
              <CheckRow key={c.id} check={c} />
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
