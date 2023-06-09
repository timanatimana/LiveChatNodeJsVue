module.exports = {
    root: true,
    env: {
        node: true,
        jquery: true,
        //browser: true,
        //commonjs: true,
        //es6: true
    },
    extends: [
        "plugin:vue/vue3-essential",
        "eslint:recommended",
        "@vue/typescript/recommended",
        "@vue/prettier",
        "@vue/prettier/@typescript-eslint",
    ],
    parserOptions: {
        ecmaVersion: 2020,
    },
    globals: {
        google: true,
    },
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/no-var-requires": 0,
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-empty-function": "off",
        "vue/no-setup-props-destructure": "off",
    },
    overrides: [
        {
            files: ["**/__tests__/*.{j,t}s?(x)", "**/tests/unit/**/*.spec.{j,t}s?(x)"],
            env: {
                jest: true,
            },
        },
    ],
};
