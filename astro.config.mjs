import preact from "@astrojs/preact";
// eslint-disable-next-line import/named
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  markdown: {
    syntaxHighlight: "prism",
    gfm: true
  },
  integrations: [preact()]
});
