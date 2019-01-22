import electron from 'electron';
import path from 'path';

const { app } = electron.remote;
let configPath = app.getPath('userData');

export default {
    historyPath: path.join(configPath, '.d2mHistory')
};
