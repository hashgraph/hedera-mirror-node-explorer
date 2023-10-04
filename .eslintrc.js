/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
    root: true,
    plugins: ["prettier"],
    extends: [
        "plugin:vue/vue3-essential",
        "eslint:recommended",
        "@vue/eslint-config-typescript",
    ],
    rules: {
        "prettier/prettier": "error",
    },
    overrides: [
        {
            files: ["cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}"],
            extends: ["plugin:cypress/recommended"],
        },
    ],
    parserOptions: {
        ecmaVersion: "latest",
    },
};
