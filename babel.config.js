module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/react',
  ],
  plugins: [
    '@babel/plugin-syntax-import-meta',
    [
      '@babel/plugin-proposal-class-properties',
      {
        loose: true,
      },
    ],
    '@babel/plugin-proposal-json-strings',
    '@babel/plugin-proposal-nullish-coalescing-operator',
  ],
};
