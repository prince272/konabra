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
  plugins: ["prettier-plugin-tailwindcss", "prettier-plugin-organize-imports"]
};

module.exports = config;
