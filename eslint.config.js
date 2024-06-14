// eslint.config.js
'use strict'

// Import the ESLint plugin locally
const eslintPluginExample = require('./eslint-plugin-example')

module.exports = [
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    // Using the eslint-plugin-example plugin defined locally
    plugins: { example: eslintPluginExample },
    rules: {
      'example/enforce-foo-bar': 'error',
    },
  },
]
