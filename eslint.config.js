// eslint.config.js
const { FlatCompat } = require('@eslint/eslintrc');
const { join } = require('path');

// Initialize the compatibility layer
const compat = new FlatCompat({
    baseDirectory: __dirname // Optional, for resolving relative paths
});

module.exports = [
    // Apply configurations from plugins (compatibility layer)
    ...compat.extends('plugin:vue/vue3-essential'),
    // Your custom configuration
    {
        ignores: ['node_modules'],
        files: ['**/*.{js,vue,ts}'],
        languageOptions: {
            parser: require.resolve('./node_modules/babel/eslint-parser'),
            parserOptions: {
                requireConfigFile: false,
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true
                }
            }
        },
        plugins: {
            vue: require('eslint-plugin-vue'),
            prettier: require('eslint-plugin-prettier')
        },
        rules: {
            // Vue rules
            'vue/multi-word-component-names': 'off',
            'vue/no-reserved-component-names': 'off',
            'vue/component-tags-order': [
                'error',
                {
                    order: ['script', 'template', 'style']
                }
            ],
            // Prettier rules
            'prettier/prettier': 'error'
        }
    }
];
