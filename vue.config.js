const webpack = require('webpack');
const GetRevisionPlugin = require('git-revision-webpack-plugin')
const gitDescribe = new GetRevisionPlugin({ lightweightTags: true })

module.exports = {
    configureWebpack: {
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    BUILD_SHORTCOMMITHASH: JSON.stringify(gitDescribe.commithash().substring(0, 7)), //i.e., 706e821
                    BUILD_RELEASE: JSON.stringify(gitDescribe.version()) //i.e., v23.5.0-1-g706e821
                },
            }),
        ],
    }
}
