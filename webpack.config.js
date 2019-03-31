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
      "jquery": "jquery/src/jquery",
      "me-plugin": path.resolve(__dirname, "../cmi-audio/dist")
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
    new MiniCssExtractPlugin({filename: 'me-styles.css'}),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    })
  ]
};

