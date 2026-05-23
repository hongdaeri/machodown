module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    '@electron-toolkit/eslint-config-ts/recommended',
    '@electron-toolkit/eslint-config-prettier'
  ],
  ignorePatterns: ['design/**', 'out/**', 'dist/**', '*.config.ts', '*.config.mjs'],
  rules: {
    'no-console': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      { allowExpressions: true, allowHigherOrderFunctions: true, allowTypedFunctionExpressions: true }
    ],
    '@typescript-eslint/triple-slash-reference': 'off'
  },
  overrides: [
    {
      files: ['src/**/__tests__/**/*.ts', 'src/**/__tests__/**/*.tsx'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        'no-console': 'off'
      }
    },
    {
      files: ['scripts/**/*.ts', 'scripts/**/*.js'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off'
      }
    },
    {
      files: ['src/main/**/*.js', 'src/preload/**/*.js', 'src/renderer/**/*.js'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off'
      }
    }
  ]
}
