const webpack = require("webpack");
const path = require("path");
const etp = require("extract-text-webpack-plugin");

module.exports = {
  devtool: "source-map",
  stats: {
    colors: true
  },

  resolve: {
    alias: {
      "jquery": "jquery/src/jquery",
      "me-plugin": path.resolve(__dirname, "../mediaelement-plugins/dist")
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
        loader: etp.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      }

    ]
  },
  plugins: [
    new etp('me-styles.css'),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    })
  ]
};

