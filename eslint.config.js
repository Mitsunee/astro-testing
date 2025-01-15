import foxkit from "eslint-config-foxkit/flat.js";
import foxkitReact from "eslint-config-foxkit-react/flat.js";
import prettier from "eslint-config-prettier";
import * as astroPlugin from "eslint-plugin-astro";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import tsEslint from "typescript-eslint";

/**
 * @type {import("typescript-eslint").ConfigWithExtends}
 */
const ignorePaths = {
  name: "ignorePaths",
  ignores: [
    "dist",
    "public",
    ".astro",
    ".astro-cache",
    "src/env.d.ts",
    ".pnpm-store"
  ]
};

// patch astro support in foxkit configs
/**
 * @type {import("typescript-eslint").ConfigWithExtends}
 */
const foxkitTS = {
  files: foxkit.tsFiles.concat(["**/*.astro", "**/*.astro/*.ts"]),
  extends: [
    foxkit.typescript,
    foxkit.configureTS({ project: true, tsconfigRootDir: import.meta.dirname })
  ]
};

//patch astro support in foxkit-react configs
/**
 * @type {import("typescript-eslint").ConfigWithExtends}
 */
const jsxCfg = {
  files: foxkitReact.jsx.files.concat("**/*.astro"),
  extends: [foxkitReact.jsx, reactPlugin.configs.flat["jsx-runtime"]]
};

// patch astro config with typescript parserOptions additional react-plugin rules
/**
 * @type {import("typescript-eslint").ConfigArray}
 */
const astroCfg = astroPlugin.configs.recommended
  .map(cfg => {
    if (cfg.name == "astro/base" || cfg.name == "astro/base/typescript") {
      // someone put `null` here which is not valid and breaks linting
      cfg.languageOptions.parserOptions.project = true;
    }
    return cfg;
  })
  .concat({
    name: "astro/custom-react-compat",
    files: ["**/*.astro"],
    rules: {
      "react/no-unknown-property": "off",
      "react/no-unescaped-entities": "off",
      "react/jsx-key": "off",
      "react/jsx-filename-extension": "off"
    }
  });

// patch import plugin config with custom file types and some extra rules
/**
 * @type {import("typescript-eslint").ConfigWithExtends}
 */
const importCfg = {
  name: "import/custom-rules",
  files: ["**/*.?(m)js", "**/*.ts?(x)", "**/*.astro"],
  extends: [importPlugin.flatConfigs.recommended],
  rules: {
    "sort-imports": "off",
    "import/order": "off",
    "import/first": "warn",
    "import/newline-after-import": "warn",
    "import/no-unresolved": "off"
  },
  languageOptions: {
    ecmaVersion: foxkit.base.languageOptions.ecmaVersion
  }
};

export default tsEslint.config([
  ignorePaths,
  foxkit.base,
  foxkitTS,
  foxkitReact.preact,
  jsxCfg,
  astroCfg,
  importCfg,
  prettier
]);
