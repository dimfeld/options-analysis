module.exports = {
  sourceMaps: true,
  env: {
    browser: {
      presets: [
        ['@babel/preset-modules', { loose: true }],
        ['@babel/preset-typescript', { allExtensions: true }],
      ],
    },
    node: {
      presets: [
        ['@babel/preset-env', { targets: { node: true } }],
        ['@babel/preset-typescript', { allExtensions: true }],
      ],
    },
  },
};
