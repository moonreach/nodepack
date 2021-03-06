module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: [
      './tsconfig.json',
      './packages/**/tsconfig.json',
    ],
  },
  extends: [
    'standard',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: [
    '@typescript-eslint',
  ],
  env: {
    'jest': true,
  },
  // add your custom rules here
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    // trailing comma
    'comma-dangle': ['error', 'always-multiline'],
    // ts-ignore
    '@typescript-eslint/ban-ts-ignore': 1,
    // semis
    '@typescript-eslint/member-delimiter-style': [2, {
      multiline: { delimiter: 'none' },
      singleline: { delimiter: 'comma' },
    }],
    // @TODO fix the warnings below
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-use-before-define': 1,
    '@typescript-eslint/no-empty-function': 0,
  },
}
