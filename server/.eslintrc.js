module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true
  },
  extends: [
    '@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'script' // Use 'script' instead of 'module' for CommonJS
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-var-requires': 'off', // Allow require() statements
    '@typescript-eslint/no-explicit-any': 'off', // Allow any types for simplicity
    'import/no-commonjs': 'off' // Allow CommonJS
  }
}; 