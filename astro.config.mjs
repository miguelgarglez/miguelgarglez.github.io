import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://miguelgarglez.com",
  integrations: [
    sitemap({
      customPages: ["https://miguelgarglez.com/cv-chat/"],
      filter: (page) => !page.includes("/404"),
    }),
  ],
});
