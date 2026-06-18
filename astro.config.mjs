import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://miguelgarglez.github.io",
  integrations: [
    sitemap({
      customPages: ["https://miguelgarglez.github.io/cv-chat/"],
      filter: (page) => !page.includes("/404"),
    }),
  ],
});
