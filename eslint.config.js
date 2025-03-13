// eslint.config.js
export default [
  {
    rules: {
      indent: ['error', 2],
      quotes: ['error', 'single'],
      'linebreak-style': ['error', 'unix'],
      semi: ['error', 'always'],
      strict: ['error', 'global'],
      curly: 'error',
      eqeqeq: 'error',
      'no-eval': 'error',
      'guard-for-in': 'error',
      'no-caller': 'error',
      'no-else-return': 'error',
      'no-eq-null': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-floating-decimal': 'error',
      'no-implied-eval': 'error',
      'no-labels': 'error',
      'no-with': 'error',
      'no-loop-func': 'warn',
      'no-native-reassign': 'error',
      'no-redeclare': ['error', { builtinGlobals: true }],
      'no-delete-var': 'error',
      'no-shadow-restricted-names': 'error',
      'no-undef-init': 'error',
      'no-use-before-define': 'error',
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'global-require': 'off',
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.test.js'],
    languageOptions: {
      globals: {
        setTimeout: 'readonly',
        describe: 'readonly',
        it: 'readonly',
      }
    },
    rules: {
      'no-unused-expressions': 'off',
    },
  },
]