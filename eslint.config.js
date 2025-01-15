import foxkit from "eslint-config-foxkit/flat.js";
import foxkitReact from "eslint-config-foxkit-react/flat.js";
import prettier from "eslint-config-prettier";
import * as astroPlugin from "eslint-plugin-astro";
import * as importPlugin from "eslint-plugin-import";
import tsEslint from "typescript-eslint";

/**
 * @type {import("typescript-eslint").ConfigWithExtends}
 */
const ignorePaths = {
  name: "ignorePaths",
  ignores: ["dist", "public", ".astro", "src/env.d.ts"]
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
  extends: [foxkitReact.jsx],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off"
  }
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
    name: "astro/custom-rules",
    files: ["**/*.astro"],
    rules: {
      "astro/no-unused-css-selector": "warn",
      "astro/prefer-object-class-list": "warn",
      "astro/no-exports-from-components": "error",
      //react-plugin compat:
      "react/no-unknown-property": "off",
      "react/no-unescaped-entities": "off",
      "react/jsx-key": "off",
      "react/jsx-filename-extension": "off"
    }
  });

//
/**
 * patch import plugin config with custom file types and configure rules
 * @type {import("typescript-eslint").ConfigWithExtends}
 */
const importCfg = {
  name: "import/custom-config",
  files: ["**/*.mjs", "**/*.js?(x)", "**/*.ts?(x)", "**/*.astro"],
  extends: [importPlugin.flatConfigs.recommended],
  rules: {
    "sort-imports": "off",
    "import/order": "off",
    "import/no-unresolved": "off",
    "import/first": "warn",
    "import/newline-after-import": "warn",
    "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
    "import/no-duplicates": "off",
    "import/no-useless-path-segments": "error",
    "import/no-self-import": "error",
    "import/no-default-export": "error"
  },
  languageOptions: {
    ecmaVersion: foxkit.base.languageOptions.ecmaVersion
  },
  settings: {
    "import/internal-regex": "^(astro:|~)",
    "import/parsers": { "@typescript-eslint/parser": [".ts", ".tsx"] },
    "import/resolver": {
      node: {
        extensions: [".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx"]
      }
    }
  }
};
/**
 * Allows config files (such as this very file) to default export again
 * @type {import("typescript-eslint").ConfigWithExtends}
 */
const importConfigsCfg = {
  name: "import/configs-may-default-export",
  files: ["**/*.config.?(m)js"],
  rules: {
    "import/no-default-export": "off"
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
  importConfigsCfg,
  prettier
]);
