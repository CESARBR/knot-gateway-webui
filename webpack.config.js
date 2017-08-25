var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    app: path.resolve(__dirname, './public/app.js'),
    vendors: ['angular', '@uirouter/angularjs', 'angular-permission', 'angular-ui-bootstrap', 'ng-storage', 'angular-messages']
  },
  output: {
    path: path.resolve(__dirname, './www'),
    filename: 'app.bundle.js'
  },
  module: {
    loaders: [
      { test: /\.less$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: ['css-loader', 'less-loader'] }) },
      { test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) },
      { test: /\.html$/, loader: 'html-loader?name=views/[name].[ext]' },
      { test: /\.(jpe?g|png|gif|svg|eot|woff2?|ttf|svg)$/i, loader: 'url-loader?limit=100000' }
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({ name: 'vendors', filename: 'vendors.bundle.js' }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, './public/index.html'),
      inject: 'body'
    }),
    new ExtractTextPlugin({ filename: '[name].css', allChunks: true })
  ]
};
