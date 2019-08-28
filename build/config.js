const path = require('path');

module.exports = {
    title: 'composer',
    devServer: {
        port: 3000,
        contentBase: path.resolve(__dirname, '../static')
    },
    outputDir: path.resolve(__dirname, '../dist')
};