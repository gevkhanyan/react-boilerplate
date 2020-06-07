const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

const here = dir => dir ? path.resolve(__dirname, dir) : __dirname;

const dirs = {
    src: './src',
    dist: './dist'
};

const devServerPackages = [
    'ansi-html',
    'ansi-regex',
    'events',
    'html-entities',
    'loglevel',
    'node-libs-browser',
    'punycode',
    'querystring-es3',
    'sockjs-client',
    'strip-ansi',
    'url',
    'webpack-dev-server',
];

module.exports = (env, args={}) => {
    const { mode = 'development' } = args;
    const isProduction = mode === 'production';

    return {
        mode,
        context: here(),
        entry: {
            app: `${dirs.src}/index.js`,
        },
        output: {
            path: here(dirs.dist),
            filename: isProduction ? 'js/[name]-[hash].js' : 'js/[name].js',
            chunkFilename: isProduction ? 'js/[name]-[chunkhash].js' : 'js/[name].js',
            sourceMapFilename: '[file].map',
            publicPath: '/assets/',
        },
        resolve: {
            extensions: ['.js', '.jsx'],
            modules: [
                here('./node_modules'),
                here(dirs.src),
            ],
        },
        devtool: isProduction ? 'source-map' : 'inline-cheap-module-source-map',
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    sideEffects: false,
                    loader: {
                        loader: 'babel-loader',
                        options: {
                            babelrc: true,
                            comments: true,
                            cacheDirectory: here(`./node_modules/.cache/${mode}/js`),
                        },
                    },
                },
                {
                    test: /\.css$/i,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                url: false,
                            }
                        }
                    ],
                },
                {
                    test: /\.(png|jpg|gif|ttf|woff(2)?|eot)$/,
                    use: {
                        loader: 'file-loader',
                        options: {
                            name: "[name].[hash].[ext]",
                            outputPath: "files"
                        }
                    }
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin(),
            new CopyWebpackPlugin(
                [/* { from: dir, to: file directory } */], {
                ignore: [
                    '.keep',
                    '.DS_Store',
                ],
            }),
            new HtmlWebPackPlugin({
                template: `${dirs.src}/index.html`,
                minify: isProduction && {
                    minifyCSS: true,
                    minifyJS: true,
                    collapseWhitespace: true,
                    removeComments: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    useShortDoctype: true,
                },
                chunksSortMode: 'none',
            })
        ],
        optimization: {
            runtimeChunk: 'single',
            splitChunks: {
                chunks: 'all',
                maxInitialRequests: Infinity,
                minSize: 0,
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        chunks: 'all',
                        enforce: true,
                        name: (module) => {
                            // get the name. E.g. node_modules/packageName/not/this/part.js
                            // or node_modules/packageName
                            const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]([^\\/]*)([\\/]([^\\/]*))?([\\/]([^\\/]*))?|$)/);
                            // npm package names are URL-safe, but some servers don't like @ symbols
                            const packageName = match[1].replace('@', '');
                            const subPackageName = match[3];
                            // will be vendors/material-ui/core or vendors/material-ui/styles chunk
                            if (packageName === 'material-ui') {
                                return `vendors/${packageName}/${subPackageName}`;
                            }
                            // will be vendors/packageName chunk
                            return `vendors/${packageName}`;
                        },
                    },
                    // Separate dev related packages
                    'webpack-dev-server': {
                        test: new RegExp(`[\\\\/]node_modules[\\\\/](${devServerPackages.join('|')})[\\\\/]`),
                        name: 'vendors/webpack-dev-server',
                        chunks: 'all',
                        priority: 2,
                    },
                },
            },
        },
        performance: {
            hints: isProduction && 'warning',
            maxEntrypointSize: Infinity,
            maxAssetSize: 0.25 * 10 ** 6, // 0.25mb
        },
        devServer: {
            contentBase: here(dirs.dist),
            host: 'localhost',
            port: 8080,
            compress: true,
            writeToDisk: false,
            historyApiFallback: true,
            overlay: {
                warnings: true,
                errors: true,
            },
            stats: {
                assetsSort: 'chunkNames',
                children: false,
                modules: false,
                entrypoints: false,
                excludeAssets: /\.(jpe?g|png|webp|gif|ogg|m4a|mp4|webm|svg|ico|cur|eot|ttf|woff|woff2|map)$/i, // hiding images, fonts
            },
        },
    }
};
