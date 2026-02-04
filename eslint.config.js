import js from '@eslint/js'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser
      }
    },
    rules: {
      // Catch real bugs
      'no-undef': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off', // Allow console for debugging
      
      // Stylistic (minimal, not annoying)
      'semi': ['warn', 'never'],
      'quotes': ['warn', 'single', { avoidEscape: true }],
      'indent': 'off', // Don't be picky about indentation
      'no-trailing-spaces': 'off'
    }
  }
]
