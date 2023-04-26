/**
 * CMI sources use the same webpack config file with few exceptions. The shared
 * config file is found in the cmi-common project. Any changes affecting all
 * sources should be made there.
 *
 * Source specific changes should be made here and added to the config file.
 */
const cfg = require("../cmi-common/webpack/config.js");

const webpack = require("webpack");
const path = require("path");

module.exports = (env, argv) => {

  //write output to public/js
  cfg.output.path = path.join(__dirname, "public/js");

  //dev specific directives
  if (argv.mode === "development") {
    cfg.devtool = "source-map";
  }

  if (argv.mode === "production") {
  }

  //console.log("cfg %o", cfg);

  return cfg;
};

