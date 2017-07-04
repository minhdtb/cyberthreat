var webpack = require('webpack');
var path = require('path');

module.exports = [
    {
        entry: './client/main.ts',
        target: 'web',
        output: {
            path: __dirname + '/public/javascripts',
            filename: '[name].js'
        },
        resolve: {
            extensions: ['.ts', '.js']
        },
        devtool: "source-map",
        module: {
            loaders: [
                {
                    test: /\.ts$/,
                    exclude: [__dirname + '/node_modules', __dirname + '/public'],
                    loader: 'awesome-typescript-loader'

                },
                {
                    test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                    loader: 'file-loader?name=../images/build/[name].[hash].[ext]'
                },
                {
                    test: /\.html$/,
                    loader: 'html-loader'
                },
                {
                    test: /\.css$/,
                    exclude: [__dirname + '/node_modules', __dirname + '/public'],
                    loader: 'css-loader'
                }
            ]
        }
    }
];