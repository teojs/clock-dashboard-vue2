import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  vue: true,

},

/**
 * 通用配置
 * @see https://typescript-eslint.io/rules
 * @see https://eslint.org/docs/latest/rules
 */
{
  files: ['**/*.{js,mjs,cjs,ts,tsx,vue}'],
  languageOptions: {
    globals: {},
  },
  rules: {
    'no-alert': 'off',
    'antfu/if-newline': 'off',
    'unused-imports/no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
        caughtErrors: 'none',
      },
    ],
  },
})
