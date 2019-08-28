const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const htmlTemplate = require('./htmlTemplate');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const config = require('./config');
const { getWebpackMode, isDev, isElectron } = require('./util');

let env;

const outputDir = isElectron() ? config.electronRendererOutputDir : config.webOutputDir;

const plugins = [
    new webpack.optimize.OccurrenceOrderPlugin()
];

if (isDev()) {
    env = {
        devtool: 'source-map',
        devServer: {
            historyApiFallback: true,
            inline: true,
            hot: true,
            ...config.devServer
        },
        plugins: [
            new HtmlWebpackPlugin({
                templateContent: htmlTemplate(isDev(), isElectron(), 'Vue transform-tool example')
            }),
            new webpack.HotModuleReplacementPlugin()
        ]
    };
} else {
    env = {
        plugins: [
            new CleanWebpackPlugin(),
            new CompressionWebpackPlugin({
                filename: '[path].gz[query]',
                algorithm: 'gzip',
                test: /\.(js|css)$/,
                threshold: 10240,
                minRatio: 0.8
            })
        ]
    };
}

const base = {
    output: {
        path: outputDir,
        filename: 'index.js',
        publicPath: isElectron() && !isDev() ? './' : '/',
        chunkFilename: isDev() ? '[name].[hash].js' : '[name].js',
        library: 'VueTransformTool',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        globalObject: "typeof self !== 'undefined' ? self : this"
    },
    target: isElectron() ? 'electron-renderer' : 'web',
    mode: getWebpackMode(),
    resolve: {
        extensions: ['.js', '.json']
    },
    externals: isDev() ? {} : {
        vue: {
            root: 'Vue',
            commonjs: 'vue',
            commonjs2: 'vue',
            amd: 'vue'
        }
    },
    module: {
        rules: [
            {
                test: /\.(j|t)sx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    },
    plugins
};
module.exports = merge(base, env);