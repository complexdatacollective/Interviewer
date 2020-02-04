module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/react',
  ],
  plugins: [
    '@babel/plugin-transform-regenerator',
    '@babel/plugin-syntax-import-meta',
    [
      '@babel/plugin-proposal-class-properties',
      {
        loose: true,
      },
    ],
    '@babel/plugin-proposal-json-strings',
  ],
  env: {
    test: {
      presets: [
        '@babel/preset-env',
        '@babel/react',
      ],
      plugins: [
        '@babel/plugin-transform-regenerator',
        '@babel/plugin-transform-runtime',
        '@babel/plugin-syntax-import-meta',
        [
          '@babel/plugin-proposal-class-properties',
          {
            loose: true,
          },
        ],
        '@babel/plugin-proposal-json-strings',
      ],
    },
  },
};
