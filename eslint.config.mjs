import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["dist-v2/", "node_modules/"],
  },

  js.configs.recommended,

  // Node.js files (Electron main process)
  {
    files: ["src/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      sourceType: "commonjs",
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
    },
  },
];
