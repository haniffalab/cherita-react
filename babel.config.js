module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    "@babel/preset-react",
  ],
  env: {
    esm: { presets: [["@babel/preset-env", { modules: false }]] },
    cjs: { presets: [["@babel/preset-env", { modules: "commonjs" }]] },
  },
};
