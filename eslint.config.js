import foxkit from "eslint-config-foxkit/configs/base.js";
import foxkitReact from "eslint-config-foxkit-react/configs/index.js";
import astroPlugin from "eslint-plugin-astro";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";

const __dirname = new URL(".", import.meta.url).pathname.slice(0, -1);

// patch astro support in foxkit configs
foxkit.typescript.files.push("**/*.astro");
foxkitReact.jsx.files.push("**/*.astro");
foxkitReact.preact.rules["react/jsx-filename-extension"][1].extensions.push(
  ".astro"
);
const foxkitTSCfg = foxkit.configureTS({ tsconfigRootDir: __dirname });

// patch astro config with additional react-plugin rules
const astroRecommended = astroPlugin.configs.recommended.find(
  cfg => cfg.name == "astro/recommended"
);
if (!astroRecommended || typeof astroRecommended.rules != "object") {
  throw new Error("Could not find astro/recommended config");
}
Object.assign(astroRecommended.rules, {
  "react/no-unknown-property": "off",
  "react/no-unescaped-entities": "off",
  "react/jsx-key": "off"
});

// patch astro/*.ts files to have typed linting
const astroTS = astroPlugin.configs.recommended.find(
  cfg => cfg.name == "astro/base/typescript"
);
if (!astroTS || typeof astroTS.languageOptions != "object") {
  throw new Error("Could not find astro/base/typescript config");
}
Object.assign(
  astroTS.languageOptions.parserOptions,
  foxkitTSCfg.languageOptions.parserOptions
);

// patch import plugin config
Object.assign(importPlugin.flatConfigs.recommended.rules, {
  "sort-imports": "off",
  "import/order": "off",
  "import/first": "warn",
  "import/newline-after-import": "warn",
  "import/no-unresolved": "off"
});
importPlugin.flatConfigs.recommended.files = [
  "**/*.mjs",
  "**/*.ts?(x)",
  "**/*.astro"
];

export default [
  {
    ignores: [
      "dist",
      "public",
      ".astro",
      ".astro-cache",
      "src/env.d.ts",
      ".pnpm-store"
    ]
  },
  foxkit.base,
  foxkit.typescript,
  foxkitTSCfg,
  foxkitReact.jsx,
  foxkitReact.preact,
  reactPlugin.configs.flat["jsx-runtime"],
  ...astroPlugin.configs.recommended,
  importPlugin.flatConfigs.recommended
];
