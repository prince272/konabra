/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  endOfLine: "auto",
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "none",
  printWidth: 100,
  plugins: ["@ianvs/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
  importOrder: [
    "^.+\\.(css|scss)$", // Styles
    "^(react|react-native)(/.*)?$", // React/React Native
    "^(next)(/.*)?$", // Next.js
    "<THIRD_PARTY_MODULES>", // Third-party packages
    "^@/configs(/.*)?$", // Local alias: config
    "^@/constants(/.*)?$", // Local alias: constants
    "^@/types(/.*)?$", // Local alias: types
    "^@/lib(/.*)?$", // Local alias: lib
    "^@/utils(/.*)?$", // Local alias: utils
    "^@/services(/.*)?$", // Local alias: services
    "^@/states(/.*)?$", // Local alias: states
    "^@/hooks(/.*)?$", // Local alias: hooks
    "^@/components/ui(/.*)?$", // Local alias: UI components
    "^@/components(/.*)?$", // Local alias: components
    "^@/app(/.*)?$", // Local alias: app
    "^[./]" // Relative imports
  ],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"]
};

module.exports = config;
