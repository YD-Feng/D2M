const path = require('path');
const childProcess = require('child_process');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./webpack.config');

process.env.NODE_ENV = 'dev';

webpackConfig.entry.app.unshift('webpack-dev-server/client?http://127.0.0.1:3000/');
const compiler = webpack(webpackConfig);

const devServer = new WebpackDevServer(compiler, {
    contentBase: path.resolve(__dirname, '../src/static'),
});

devServer.listen(3000, '127.0.0.1', () => {
    // 启动electron
    childProcess.spawn('npm', ['run', 'electron'], {
        shell: true,
        env: process.env,
        stdio: 'inherit'
    }).on('close', (code) => {
        process.exit(code);
    }).on('error', (spawnError) => {
        console.error(spawnError);
    });
});
