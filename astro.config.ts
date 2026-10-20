import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  site: "https://raroh73.com",
  adapter: node({
    mode: "standalone",
  }),
  fonts: [
    {
      name: "Inter",
      cssVariable: "--font-inter",
      provider: fontProviders.npm(),
      styles: ["normal"],
      weights: [400, 700],
    },
  ],
  integrations: [sitemap()],
});
