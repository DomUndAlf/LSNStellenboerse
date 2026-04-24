module.exports = [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: [
      ".env",
      "**/dist/**",
      "**/build/**",
      "**/node_modules/**",
      "**/coverage/**",
      "**/swaggerDocs.yaml",
      "DatabaseHandler/Config/Migrations/**/*",
      "DatabaseHandler/Models/**/*",
    ],
    plugins: {
      prettier: require("eslint-plugin-prettier"),
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "prettier/prettier": "error",
      "@typescript-eslint/typedef": [
        "error",
        {
          arrayDestructuring: true,
          memberVariableDeclaration: true,
          parameter: true,
          propertyDeclaration: true,
          variableDeclaration: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-types": [
        "error",
        {
          types: {
            any: "Avoid using any type",
            unknown: "Avoid using unknown type",
          },
        },
      ],
      "prefer-arrow-callback": "off",
      "func-style": ["warn", "declaration", { allowArrowFunctions: false }],
      "no-restricted-syntax": [
        "warn",
        {
          selector: "ArrowFunctionExpression",
          message: "Arrow functions are not allowed.",
        },
      ],
      "no-unused-vars": "off",

      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          modifiers: ["const"],
          format: ["UPPER_CASE"],
          leadingUnderscore: "allow",
        },
        {
          selector: "interface",
          format: ["PascalCase"],
          custom: {
            regex: "^I[A-Z]",
            match: true,
          },
        },
      ],
    },
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        browser: true,
        node: true,
        es6: true,
      },
    },
  },
];
