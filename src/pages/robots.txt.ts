import { EOL } from "node:os";
import type { APIRoute } from "astro";

const defaultRules = (sitemapURL: URL) => `User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = async ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site);
  const res = await fetch(
    "https://raw.githubusercontent.com/ai-robots-txt/ai.robots.txt/main/robots.txt",
  );
  if (!res.ok) {
    console.warn(`Failed to fetch ai.robots.txt: ${res.status}`);
    return new Response(defaultRules(sitemapURL));
  }
  return new Response((await res.text()) + EOL + defaultRules(sitemapURL));
};
