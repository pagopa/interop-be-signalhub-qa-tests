import pagopa from "@pagopa/eslint-config";
import globals from "globals";

export default [
  ...pagopa,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/no-empty-object-type": [
        "error",
        { allowInterfaces: "always" },
      ],
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-shadow": "off",
      "@typescript-eslint/no-use-before-define": "off",
      // Project level custom rules
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "default-case": "off",
      eqeqeq: ["error", "smart"],
      "max-lines-per-function": "off",
      "no-console": "off",
    },
  },
  {
    ignores: ["**/generated/**", "**/dist/**", "**/bin/**"],
  },
];
