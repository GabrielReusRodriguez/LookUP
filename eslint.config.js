import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        files: ["app.js"],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: "script",
            globals: {
                document: "readonly",
                window: "readonly",
                console: "readonly",
                fetch: "readonly",
                JSZip: "readonly",
            }
        },
        rules: {
            "no-unused-vars": "warn",
            "no-undef": "error",
            "eqeqeq": "warn"
        }
    }
];
