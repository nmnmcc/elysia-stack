import eslint from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  { ignores: [".next/", "src/components/ui/"] },
  eslint.configs.recommended,
  {
    extends: [...tseslint.configs.recommended],
    languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } },
  },
  reactHooks.configs.flat.recommended,
  nextPlugin.configs.recommended,
]);
