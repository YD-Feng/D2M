const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const url = require('url');
const mysql = require('mysql');
let window = null;

app.on('ready', createWindow);

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，否则绝大部分应用及其菜单栏会保持激活。
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // 在 macOS 上，当单击 dock 图标并且没有其他窗口打开时，通常在应用程序中重新创建一个窗口。
    if (window === null) {
        createWindow();
    }
});

function createWindow () {
    // 创建浏览器窗口。
    window = new BrowserWindow({
        width: 1048,
        height: 700,
        minWidth: 1048,
        minHeight: 700,
        frame: false,
        resizable: true,
        show: false
    });

    // 解决 macOs 快捷键复制的问题 添加菜单
    if (process.platform === 'darwin') {
        const template = [
            {
                label: "Application",
                submenu: [
                    { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
                ]
            },
            {
                label: 'Edit',
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' },
                    { role: 'pasteandmatchstyle' },
                    { role: 'delete' },
                    { role: 'selectall' }
                ]
            }
        ];
        Menu.setApplicationMenu(Menu.buildFromTemplate(template))
    } else {
        Menu.setApplicationMenu(null)
    }

    if (process.env.NODE_ENV === 'dev') {
        window.loadURL('http://127.0.0.1:3000');
        // 打开开发者工具。
        window.webContents.openDevTools();
    } else {
        window.loadURL(url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }

    window.once('ready-to-show', () => {
        window.show();
    });

    window.on('resize', () => {
        window.webContents.send('resize', window.isMaximized())
    });

    // 当 window 被关闭，这个事件会被触发。
    window.on('closed', () => {
        // 取消引用 window 对象
        window = null;
    });

    // 自定义进程事件，可在 web 页面中通过 ipcRenderer.sendSync(eventName[, args]) 触发事件
    ipcMain.on('windowOrder', (event, args) => {
        switch (args) {
            case 'minimize':
                window.minimize();
                break;

            case 'unmaximize':
                if (process.platform === 'darwin') {
                    if (window.isFullScreen()) {
                        window.setFullScreen(false);
                    }
                }
                window.unmaximize();
                break;

            case 'maximize':
                if (process.platform === 'darwin') {
                    window.setFullScreen(true);
                } else {
                    window.maximize();
                }
                break;

            case 'close':
                window && window.close();
                break;

            case 'openDevTools':
                window.webContents.openDevTools();
                break;

            default:
                break;
        }

        event.returnValue = 'setSuccess';
    });

    //解析 MySQL 数据库，返回解析结果
    ipcMain.on('analyseMySqlDb', (event, args) => {
        let obj = {
                host: args.host, //IP
                port: args.port, //端口
                database: args.databaseName, //库名
                user: args.user, //用户名
                password: args.password, //密码
                multipleStatements: true // 支持执行多条 sql 语句
            },
            connPool = mysql.createPool(obj),
            errFn = (err) => {
                event.returnValue = {
                    isErr: true,
                    errMsg: '解析数据库出错！' + err.message
                };
            };

        connPool.getConnection((err, connection) => {
            if (err) {
                errFn(err);
                return;
            }
            //获取数据库的所有表名
            let tableSQL = `select * from information_schema.tables where table_schema = '${obj.database}'`;

            connection.query(tableSQL, (err, result) => {
                if (err) {
                    errFn(err);
                    return;
                }

                let columnSQL = '',
                    obj = {
                        isErr: false,
                        tables: [],
                        columns: []
                    };

                result.forEach((item, index) => {
                    obj.tables.push({
                        name: item.TABLE_NAME,
                        chnname: item.TABLE_COMMENT
                    });
                    columnSQL += `show full columns from ${item.TABLE_NAME}; `;
                });

                if (columnSQL != '') {
                    //执行多条sql语句，获取数据库里的所有表的建表语句
                    connection.query(columnSQL, (err, result) => {
                        if (err) {
                            errFn(err);
                            return;
                        }

                        obj.columns = result;
                        event.returnValue = obj;
                        connection.release();//释放链接
                    });

                } else {
                    event.returnValue = {
                        isErr: false,
                        tables: [],
                        columns: []
                    };
                    connection.release();//释放链接
                }
            });
        });
    });

    ipcMain.on('getWinIsMaxSize', (event, args) => {
        event.returnValue = window.isMaximized();
    });
}
