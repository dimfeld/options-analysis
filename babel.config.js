module.exports = {
  include: '*.ts',
  exclude: '*.spec.ts',
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
