const webpack = require('webpack');
const GetRevisionPlugin = require('git-revision-webpack-plugin')
const version = new GetRevisionPlugin({lightweightTags: true}).version()

module.exports = {
    configureWebpack: {
        plugins: [
            new webpack.DefinePlugin({
                'process.env': { BUILD_VERSION: JSON.stringify(version) },
            }),
        ],
    }
}
