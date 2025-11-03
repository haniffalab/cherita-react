module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [
    [
      'transform-define',
      {
        'process.env.PACKAGE_VERSION': process.env.npm_package_version,
      },
    ],
  ],
  env: {
    esm: { presets: [['@babel/preset-env', { modules: false }]] },
    cjs: { presets: [['@babel/preset-env', { modules: 'commonjs' }]] },
  },
};
