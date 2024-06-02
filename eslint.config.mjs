// eslint.config.mjs
import globals from "globals";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

import solidPlugin from "eslint-plugin-solid";
import importPlugin from "eslint-plugin-import";
import * as emotionPlugin from "@emotion/eslint-plugin";

export default [
  { languageOptions: { globals: globals.browser } },
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": tseslint,
      solid: solidPlugin,
      import: importPlugin,
      emotion: emotionPlugin
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": ["warn"],
      indent: ["error", 2], // Enforce 2 spaces
      quotes: ["error", "single"], // Use single quotes
      semi: ["error", "never"], // Enforce semicolons
    },
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      indent: ["error", 2], // Enforce 2 spaces
      quotes: ["error", "single"], // Use single quotes
      semi: ["error", "never"], // Enforce semicolons
    },
  },
  {
    ignores: ["**/dist/**/*"],
  },
];
