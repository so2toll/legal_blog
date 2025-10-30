// @ts-check
// import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import vercel from '@astrojs/vercel';

import sitemap from '@astrojs/sitemap';

import partytown from '@astrojs/partytown';

import mdx from "@astrojs/mdx";


import tailwind from "@astrojs/tailwind";
import AutoImport from "astro-auto-import";
import { defineConfig } from "astro/config";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import config from "./src/config/config.json";

// https://astro.build/config
export default defineConfig({
  devToolbar: {
      enabled: false
    },
    site: config.site.base_url ? config.site.base_url : "https://example.com/",
  integrations: [// …any other integrations you have
  react(), sitemap(), partytown(),
  tailwind({
    config: {
      applyBaseStyles: false,
    },
  }),
  AutoImport({
    imports: [
      "@/shortcodes/Button",
      "@/shortcodes/Accordion",
      "@/shortcodes/Notice",
      "@/shortcodes/Video",
      "@/shortcodes/Youtube",
      "@/shortcodes/Tabs",
      "@/shortcodes/Tab",
    ],
  }),
  mdx(),

],
markdown: {
  remarkPlugins: [
    remarkToc,
    [
      remarkCollapse,
      {
        test: "Table of contents",
      },
    ],
  ],
  shikiConfig: {
    theme: "one-dark-pro",
    wrap: true,
  },
  // extendDefaultPlugins: true,
},
  output: "static",
  adapter: vercel(),
});