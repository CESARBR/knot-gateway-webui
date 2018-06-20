var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    app: path.resolve(__dirname, './public/app.js'),
    vendors: ['angular', '@uirouter/angularjs', 'angular-permission', 'angular-ui-bootstrap', 'ngstorage', 'angular-messages', 'is-ipv6-node']
  },
  output: {
    path: path.resolve(__dirname, './www'),
    filename: '[name].bundle.js'
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  module: {
    rules: [
      { test: /public.*\.js$/, use: 'ng-annotate-loader' },
      { test: /\.less$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'] },
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] },
      { test: /\.html$/, use: 'html-loader?name=views/[name].[ext]' },
      { test: /\.(jpe?g|png|gif|svg|eot|woff2?|ttf|svg)$/i, use: 'url-loader?limit=100000' }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, './public/index.html'),
      inject: 'body'
    }),
    new MiniCssExtractPlugin({ filename: '[name].css', chunkFilename: '[id].css' })
  ]
};
