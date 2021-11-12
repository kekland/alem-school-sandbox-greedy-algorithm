const { removeModuleScopePlugin, override, babelInclude, addWebpackAlias } = require("customize-cra");
const path = require("path");

module.exports = override(
  removeModuleScopePlugin(),
  addWebpackAlias({
    ["player"]: path.resolve(__dirname, "../player")
  }),
  babelInclude([
    path.resolve("src"),
    path.resolve("../player/src")
  ])
);
