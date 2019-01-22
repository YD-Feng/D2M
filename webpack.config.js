const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlPlugin = require('script-ext-html-webpack-plugin');
const copyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        vendor: ['vue', 'vue-router', 'vuex'],
        element: ['element-ui', 'element-style'],
        app: [require.resolve('babel-polyfill'), path.resolve(__dirname, 'src/static/js/app.js')]
    },
    output: {
        path: path.resolve(__dirname, './build'),
        chunkFilename: 'modules/[name].js',
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.vue$/,
                use: [{
                    loader: 'vue-loader'
                }]
            },
            {
                test: /\.js$/,
                use: ['babel-loader'],
                exclude: /node_modules/
            },
            {
                test: /\.html$/,
                use: [{
                    loader: 'html-loader',
                    options: {
                        root: path.resolve(__dirname, 'src'),
                        attrs: ['img:src', 'link:href']
                    }
                }]
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader', 'postcss-loader']
            },
            {
                test: /\.(png|jpg|jpeg|gif)\??.*$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 5120,
                        name: 'img/[name].[ext]?[hash]'
                    }
                }]
            },
            {
                test: /\.(eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: 'font/[name].[ext]?[hash]'
                    }
                }]
            }
        ]
    },
    externals: [
        (function () {
            var IGNORES = ['electron', 'fs', 'path'];
            return function (context, request, callback) {
                if (IGNORES.indexOf(request) >= 0) {
                    return callback(null, "require('" + request + "')");
                }
                return callback();
            };
        })()
    ],
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: ['vendor', 'element']
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(__dirname, 'src/static/index.html')
        }),
        new ScriptExtHtmlPlugin({
            defaultAttribute: 'defer'
        }),
        new copyWebpackPlugin([
            {
                from: path.resolve(__dirname, './src/icon'),
                to: path.resolve(__dirname, './build/icon')
            },
            {
                from: path.resolve(__dirname, './src/main.js'),
                to: path.resolve(__dirname, './build/main.js')
            },
        ])
    ],
    resolve: {
        extensions: ['.js', '.css'],
        alias: {
            'vue': path.resolve(__dirname, 'node_modules/vue/dist/vue.min.js'),
            'vue-router': path.resolve(__dirname, 'node_modules/vue-router/dist/vue-router.min.js'),
            'vuex': path.resolve(__dirname, 'node_modules/vuex/dist/vuex.min.js'),
            'element-style': path.resolve(__dirname, 'node_modules/element-ui/lib/theme-chalk/index.css'),
            'config': path.resolve(__dirname, 'src/static/js/utils/config.js')
        }
    }
};
