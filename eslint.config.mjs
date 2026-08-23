import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
export default [
  { ignores: [".next/**", "node_modules/**"] },
  js.configs.recommended,
  { files: ["**/*.ts", "**/*.tsx"], languageOptions: { parser: tsParser, parserOptions: { ecmaFeatures: { jsx: true } } }, rules: { "no-unused-vars": "off", "no-undef": "off" } }
];
