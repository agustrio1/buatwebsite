// app/lib/json-ld.ts
// Escape "<" supaya data dari DB tidak bisa menutup tag <script>
export function safeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}