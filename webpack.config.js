var webpack = require('webpack');
const path = require('path');

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
                    exclude: [path.resolve(__dirname, 'node_modules'),
                        path.resolve(__dirname, 'public'), path.resolve(__dirname, 'server')],
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
                    loader: 'css-loader'
                }
            ]
        }
    }
];