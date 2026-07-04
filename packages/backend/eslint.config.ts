import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  eslint.configs.recommended,
  {
    extends: [...tseslint.configs.recommended],
    languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } },
  },
  {
    rules: {
      "require-yield": "off",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: ".",
              message: "Import the specific local file instead of this directory's index.ts.",
            },
            {
              name: "./",
              message: "Import the specific local file instead of this directory's index.ts.",
            },
            {
              name: "./index",
              message: "Import the specific local file instead of this directory's index.ts.",
            },
            {
              name: "./index.ts",
              message: "Import the specific local file instead of this directory's index.ts.",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "ObjectExpression > SpreadElement[argument.type='ConditionalExpression']",
          message: "Use key: value ?? undefined instead of conditional object spread.",
        },
        {
          selector: "ObjectExpression > SpreadElement[argument.type='LogicalExpression']",
          message: "Use key: value ?? undefined instead of conditional object spread.",
        },
        {
          selector:
            "CallExpression[callee.type='MemberExpression'][callee.property.name='select'][callee.object.property.name='database']",
          message: "Prefer database.query.* for Drizzle reads.",
        },
      ],
      "no-restricted-properties": [
        "error",
        {
          object: "database",
          property: "select",
          message: "Prefer database.query.* for Drizzle reads.",
        },
      ],
      "id-denylist": ["error", "db"],
      "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "never" }],
      "@typescript-eslint/no-namespace": "off",
    },
  },
]);
