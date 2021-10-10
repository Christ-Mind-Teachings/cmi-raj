const webpack = require("webpack");
const path = require("path");
//const etp = require("extract-text-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  devtool: "source-map",
  stats: {
    colors: true
  },

  resolve: {
    alias: {
      //"jquery": "jquery/src/jquery",
      "semantic": "../vendor/semantic",
      "me-plugin": path.resolve(__dirname, "../cmi-audio/dist"),
      "acim": path.resolve(__dirname, "../cmi-acim/src/js"),
      "oe": path.resolve(__dirname, "../cmi-oe/src/js"),
      "acol": path.resolve(__dirname, "../cmi-acol/src/js"),
      "col": path.resolve(__dirname, "../cmi-col/src/js"),
      "ftcm": path.resolve(__dirname, "../cmi-ftcm/src/js"),
      "jsb": path.resolve(__dirname, "../cmi-jsb/src/js"),
      "raj": path.resolve(__dirname, "../cmi-raj/src/js"),
      "wom": path.resolve(__dirname, "../cmi-wom/src/js"),
      "pwom": path.resolve(__dirname, "../cmi-pwom/src/js"),
      "www": path.resolve(__dirname, "../cmi-www/src/js")
    }
  },

  entry: {
    transcript: ["./src/js/transcript.js"],
    page: ["./src/js/page.js"]
  },
  output: {
    path: path.join(__dirname, "public/js"),
    publicPath: "/public/js",
    filename: "[name].js"
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    }
  },
  module: {
    rules: [
      {
        test: /\.((png)|(eot)|(woff)|(woff2)|(ttf)|(svg)|(gif))(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file-loader?name=/[hash].[ext]"
      },
      {
        test: /\.js?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        query: {cacheDirectory: true}
      },
      {
        test: /\.css$/,
        use: [ "style-loader", MiniCssExtractPlugin.loader, "css-loader"]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({filename: 'me-styles.css'})
    /*
    new MiniCssExtractPlugin({filename: 'me-styles.css'}),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    })
    */
  ]
};

