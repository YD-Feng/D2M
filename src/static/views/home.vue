<template>
    <div class="home-page">
        <div class="history-wrap">
            <p class="title">最近打开的项目:</p>
            <div class="cont">
                <div ref="vBar" v-bar style="height: 100%;">
                    <!--这个 div 不是多余的，是用来生成 vue-bar 内层的，不能删除-->
                    <div>
                        <ul class="history-list"
                            v-if="historyList.length > 0">
                            <li class="item"
                                v-for="(item, index) in historyList"
                                @click="handleOpenProject(item.projectPath)">
                                <p class="project-name"
                                   :title="item.projectName">
                                    {{item.projectName}}
                                </p>
                                <p class="project-path"
                                   :title="item.projectPath">
                                    {{item.projectPath}}
                                </p>
                                <button class="btn" @click="handleDeleteHistory($event, index)">
                                    <i class="el-icon-delete"></i>
                                </button>
                            </li>
                        </ul>

                        <div class="text-center"
                             style="height: 600px; line-height: 600px;"
                             v-if="historyList.length == 0">
                            <div class="history-no-data cm-text-light">
                                <i class="icon-font icon-wushuju" style="font-size: 40px;"></i>
                                <br>
                                --- 暂无历史记录 ---
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="contain">
            <div class="logo">
                <i class="icon"></i>
                <p class="pt20px fBold f18px">D2M</p>
                <p class="pt5px f14px cm-text-light">Data to Model</p>
            </div>

            <div class="action">
                <el-button
                    type="text"
                    @click="openCreateDialog">
                    <i class="icon-font icon-xinjian"></i>
                    创建新项目
                </el-button>
                <br>
                <el-button
                    type="text"
                    @click="openDbDialog()">
                    <i class="icon-font icon-shujuku"></i>
                    解析DB生成项目
                </el-button>
                <br>
                <el-button
                    type="text"
                    @click="handleOpenProject()">
                    <i class="icon-font icon-dakai"></i>
                    打开项目
                </el-button>
            </div>
        </div>

        <div class="footer">
            <span class="pl15px pr15px">2019 © Powered By YD-Feng</span>
        </div>

        <el-dialog
            title="创建新项目"
            custom-class="home-page-dialog-430px"
            :visible.sync="elDialog.visible">
            <div class="pl20px pr20px pt10px">
                <div class="pb20px lh30px">
                    项目名称&nbsp;
                    <el-input
                        v-model.trim="elDialog.projectName"
                        style="width: 280px;">
                    </el-input>
                </div>

                <div class="pb20px lh30px">
                    保存目录&nbsp;
                    <el-input
                        v-model.trim="elDialog.projectDir"
                        readonly
                        style="width: 280px; vertical-align: middle;">
                        <template slot="append">
                            <div class="text-center">
                                <el-button
                                    type="text"
                                    @click="handleOpenSysDialog('elDialog')">
                                    ...
                                </el-button>
                            </div>
                        </template>
                    </el-input>
                </div>

                <div class="pb20px lh30px">
                    实例名称&nbsp;
                    <el-input
                        v-model.trim="elDialog.rdsName"
                        style="width: 280px;">
                    </el-input>
                </div>

                <div class="pb20px lh30px">
                    数据库名&nbsp;
                    <el-input
                        v-model.trim="elDialog.databaseName"
                        style="width: 280px;">
                    </el-input>
                </div>

                <div class="text-center pb5px">
                    <el-button
                        type="primary"
                        style="width: 60px;"
                        @click="handleCreateProject">
                        确定
                    </el-button>

                    <el-button
                        type="default"
                        style="width: 60px;"
                        @click="closeDialog">
                        取消
                    </el-button>
                </div>
            </div>
        </el-dialog>

        <el-dialog
            title="解析数据库生成项目"
            custom-class="home-page-dialog-430px"
            :visible.sync="dbDialog.visible">
            <div class="pl20px pr20px pt10px">
                <div class="pb20px lh30px">
                    <label class="label">库类型</label>
                    <el-select
                        v-model="dbDialog.dbType"
                        style="width: 260px;"
                        placeholder="请选择">
                        <el-option
                            v-for="(value, key) in dbType"
                            :key="key"
                            :label="value"
                            :value="key">
                        </el-option>
                    </el-select>
                </div>
                <div class="pb20px lh30px">
                    <label class="label">HOST</label>
                    <el-input
                        v-model.trim="dbDialog.host"
                        style="width: 260px;">
                    </el-input>
                </div>

                <div class="pb20px lh30px">
                    <label class="label">PORT</label>
                    <el-input
                        v-model.trim="dbDialog.port"
                        style="width: 260px;">
                    </el-input>
                </div>

                <div class="pb20px lh30px">
                    <label class="label">数据库</label>
                    <el-input
                        v-model.trim="dbDialog.databaseName"
                        style="width: 260px;">
                    </el-input>
                </div>

                <div class="pb20px lh30px">
                   <label class="label">用户名</label>
                    <el-input
                        v-model.trim="dbDialog.user"
                        style="width: 260px;">
                    </el-input>
                </div>

                <div class="pb20px lh30px">
                    <label class="label">密码</label>
                    <el-input
                        type="password"
                        v-model.trim="dbDialog.password"
                        style="width: 260px;">
                    </el-input>
                </div>

                <div class="pb20px lh30px">
                    <label class="label">项目名称</label>
                    <el-input
                        v-model.trim="dbDialog.projectName"
                        style="width: 260px;">
                    </el-input>
                </div>

                <div class="pb20px lh30px">
                    <label class="label">保存目录</label>
                    <el-input
                        v-model.trim="dbDialog.projectDir"
                        readonly
                        style="width: 260px; vertical-align: middle;">
                        <template slot="append">
                            <div class="text-center">
                                <el-button
                                    type="text"
                                    @click="handleOpenSysDialog('dbDialog')">
                                    ...
                                </el-button>
                            </div>
                        </template>
                    </el-input>
                </div>

                <div class="text-center pb5px">
                    <el-button
                        type="primary"
                        style="width: 60px;"
                        @click="handleAnalyseDb">
                        确定
                    </el-button>

                    <el-button
                        type="default"
                        style="width: 60px;"
                        @click="closeDialog">
                        取消
                    </el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import electron from 'electron';
    import path from 'path';
    import config from 'config';
    import deepClone from './../js/utils/deep-clone';
    import defaultData from './../js/utils/default-data';
    import { fileExist, readFilePromise, saveFilePromise, saveFileSync } from '../js/utils/fs';

    const { ipcRenderer } = electron;
    const { dialog } = electron.remote;

    export default {
        data () {
            return {
                historyList: [],

                elDialog: {
                    visible: false,
                    projectName: '',
                    projectDir: '',
                    rdsName: '',
                    databaseName: ''
                },

                dbDialog: {
                    visible: false,
                    dbType: 'mysql', //数据库类型，mysql，SqlServer
                    host: '', //IP
                    port: '', //端口
                    databaseName: '', //库名
                    user: '', //用户名
                    password: '', //密码
                    projectName: '', //项目名称
                    projectDir: '' //保存目录
                },

                dbType: {
                    mysql: 'MYSQL',
                    oracle: 'ORACLE'
                }
            }
        },
        methods: {
            openDbDialog () {
                let _this = this;
                _this.dbDialog.dbType = 'mysql';
                _this.dbDialog.host = '';
                _this.dbDialog.port = '';
                _this.dbDialog.databaseName = '';
                _this.dbDialog.user = '';
                _this.dbDialog.password = '';
                _this.dbDialog.projectName = '';
                _this.dbDialog.projectDir = '';
                _this.dbDialog.visible = true;
            },

            openCreateDialog () {
                let _this = this;
                _this.elDialog.projectName = '';
                _this.elDialog.projectDir = '';
                _this.elDialog.rdsName = '';
                _this.elDialog.databaseName = '';
                _this.elDialog.visible = true;
            },

            closeDialog () {
                this.elDialog.visible = false;
                this.dbDialog.visible = false;
            },

            handleOpenSysDialog (sourceDialog) {
                let _this = this;

                dialog.showOpenDialog({
                    title: '请选择项目保存目录',
                    properties: ['openDirectory'],
                    buttonLabel: '确定'
                }, (result) => {
                    if (result) {
                        _this[sourceDialog].projectDir = result[0];
                    }
                });
            },

            handleCreateProject () {
                let _this = this;

                try {

                    if (_this.elDialog.projectName === '') {
                        throw {message: '项目名称不能为空'};
                    }

                    if (_this.elDialog.projectDir === '') {
                        throw {message: '保存目录不能为空'};
                    }

                    if (_this.elDialog.rdsName === '') {
                        throw {message: '实例名称不能为空'};
                    }

                    if (_this.elDialog.databaseName === '') {
                        throw {message: '数据库名不能为空'};
                    }

                } catch (err) {
                    _this.$message.error(err.message);
                    return;
                }

                let projectData = {
                    source: {
                        rdsName: _this.elDialog.rdsName,
                        databaseName: _this.elDialog.databaseName
                    },
                    modules: [],
                    dataTypeDomains: deepClone(defaultData.profile.defaultDataTypeDomains)
                };

                _this.createProject(projectData, {
                    projectDir: _this.elDialog.projectDir,
                    projectName: _this.elDialog.projectName
                });
            },

            handleAnalyseDb () {
                let _this = this;

                try {

                    if (_this.dbDialog.dbType === '') {
                        throw {message: '请选择库类型'};
                    }

                    if (_this.dbDialog.host === '') {
                        throw {message: 'HOST不能为空'};
                    }

                    if (_this.dbDialog.port === '') {
                        throw {message: 'PORT不能为空'};
                    }

                    if (_this.dbDialog.databaseName === '') {
                        throw {message: '数据库不能为空'};
                    }

                    if (_this.dbDialog.user === '') {
                        throw {message: '用户名不能为空'};
                    }

                    if (_this.dbDialog.password === '') {
                        throw {message: '密码不能为空'};
                    }

                    if (_this.dbDialog.projectName === '') {
                        throw {message: '项目名称不能为空'};
                    }

                    if (_this.dbDialog.projectDir === '') {
                        throw {message: '保存目录不能为空'};
                    }

                } catch (err) {
                    _this.$message.error(err.message);
                    return;
                }

                let result = _this.dbDialog.dbType == 'mysql' ? _this.transMySqlAnalysis() : _this.transMySqlAnalysis();

                if (!result) {
                    //数据库解析失败，data 返回 null，直接结束
                    return;
                }

                let projectData = {
                    source: {
                        rdsName: 'common',
                        databaseName: _this.dbDialog.databaseName
                    },
                    modules: [result.module],
                    dataTypeDomains: result.dataTypeDomains
                };

                _this.createProject(projectData, {
                    projectDir: _this.dbDialog.projectDir,
                    projectName: _this.dbDialog.projectName
                });
            },

            //连接mysql数据库，分析表结构，返回处理结果
            transMySqlAnalysis () {
                let _this = this,
                    analyseResult = ipcRenderer.sendSync('analyseMySqlDb', _this.dbDialog),
                    module = {
                        name: _this.dbDialog.databaseName,
                        chnname: '数据库',
                        remark: '',
                        entities: [],
                        relations: []
                    },
                    dataTypeDomains = deepClone(defaultData.profile.defaultDataTypeDomains);

                if (!analyseResult.isErr) {
                    analyseResult.tables.forEach((item, index) => {
                        let entity = {
                            title: item.name,
                            chnname: item.chnname,
                            remark: '',
                            fields: [],
                            indexs: [],
                            headers: deepClone(defaultData.profile.defaultHeaders)
                        };

                        // MySQL Key值（PRI, UNI, MUL）的含义：PRI主键约束，UNI唯一约束，MUL可以重复
                        analyseResult.columns[index].forEach(column => {
                            let type = column.Type.replace(/\(/g,'_').replace(/\)/g,'').replace(/\,/g,''),
                                field = {
                                    chnname: column.Comment, //名称
                                    name: column.Field, //代码
                                    type: type, //类型
                                    dataType: '', //数据库类型
                                    remark: '', //备注
                                    pk: (column.Key == 'PRI' || column.Key == 'UNI') ? true : false, //主键
                                    notNull: column.Null == 'NO' ? false : true, //非空
                                    autoIncrement: column.Extra == 'auto_increment' ? true : false, //自增
                                    defaultValue: column.Default, //默认值
                                    relationNoShow: true //关系图
                                },
                                findIndex = dataTypeDomains.datatype.findIndex(item => item.name == type);

                            if (findIndex == -1) {
                                dataTypeDomains.datatype.push({
                                    name: type,
                                    code: type,
                                    apply: {
                                        MYSQL: {
                                            type: column.Type.toUpperCase()
                                        },
                                        ORACLE: {
                                            type: ''
                                        }
                                    }
                                });
                            }

                            entity.fields.push(field);
                        });

                        module.entities.push(entity);
                    });

                    return {
                        module: module,
                        dataTypeDomains: dataTypeDomains
                    };
                } else {
                    _this.$message.error(analyseResult.errMsg);
                    return null;
                }
            },

            createProject (projectData, opts) {
                let _this = this,
                    projectPath = path.join(opts.projectDir, opts.projectName + '.json');

                if ( fileExist(projectPath) ) {
                    _this.$message.error('创建项目失败，该项目已经存在了！');
                    return;
                }

                // 保存项目
                saveFileSync(projectData, projectPath);

                _this.historyList.unshift({
                    projectName: opts.projectName,
                    projectPath: projectPath
                });

                // 生成基点版本
                saveFileSync(Object.assign({
                    date: new Date().format('yyyy-MM-dd HH:mm:ss'),
                    description: '基点版本'
                }, projectData), path.join(projectPath.replace('json', 'version'), 'v1.0.0.json'));

                // 更新历史记录
                saveFileSync({
                    historyList: _this.historyList
                }, config.historyPath);

                _this.closeDialog();

                _this.$store.commit('setProjectName', opts.projectName);
                _this.$store.commit('setProjectPath', projectPath);
                _this.$store.commit('setProjectData', projectData);
                _this.$store.commit('setCompareData', projectData);
                _this.$router.push({
                    path: '/editor'
                });
            },

            handleOpenProject (projectPath) {
                let _this = this;

                if (projectPath) {
                    // 通过点击 最近打开的项目历史记录 来打开项目
                    _this.readData(projectPath);
                } else {
                    dialog.showOpenDialog({
                        title: '打开项目',
                        properties: ['openFile'],
                        filters: [
                            {
                                name: 'D2M-Project',
                                extensions: ['json']
                            }
                        ]
                    }, (result) => {
                        if (result) {
                            _this.readData(result[0]);
                        }
                    });
                }
            },
            readData (projectPath) {
                let _this = this;

                if (fileExist(projectPath)) {

                    readFilePromise(projectPath).then((result) => {
                        // 过滤已经存在的历史记录
                        const projectName = projectPath.split('.json')[0].split(path.sep).pop();
                        const arr = _this.historyList.filter(item => item.projectName !== projectName);

                        // 把当前的项目插入到第一条数据
                        arr.unshift({
                            projectName: projectName,
                            projectPath: projectPath
                        });

                        _this.historyList = arr;
                        // 更新历史记录
                        saveFileSync({
                            historyList: arr
                        }, config.historyPath);

                        //补全数据（反向生成的，或者其他 pdman 生成的项目 json 文件）
                        if (!result.source) {
                            //只要不是 D2M 的项目 json 文件，都没有 source 属性
                            result.source = {
                                rdsName: '',
                                databaseName: ''
                            };

                            result.modules.forEach((module) => {
                                module.entities.forEach((entity) => {
                                    entity.fields.forEach((field) => {
                                        field.chnname = field.chnname === undefined ? '' : field.chnname;
                                        field.name = field.name === undefined ? '' : field.name;
                                        field.type = field.type === undefined ? '' : field.type;
                                        field.remark = field.remark === undefined ? '' : field.remark;
                                        field.pk = field.pk === undefined ? false : field.pk;
                                        field.notNull = field.notNull === undefined ? false : field.notNull;
                                        field.autoIncrement = field.autoIncrement === undefined ? false : field.autoIncrement;
                                        field.defaultValue = field.defaultValue === undefined ? '' : field.defaultValue;
                                        field.relationNoShow = field.relationNoShow === undefined ? true : field.relationNoShow;
                                    });

                                    if (!entity.headers) {
                                        entity.headers = deepClone(defaultData.profile.defaultHeaders);
                                    }
                                });
                            });
                        }

                        _this.$store.commit('setProjectName', projectName);
                        _this.$store.commit('setProjectPath', projectPath);
                        _this.$store.commit('setProjectData', result);
                        _this.$store.commit('setCompareData', result);
                        _this.$router.push({
                            path: '/editor'
                        });
                    }).catch((e) => {
                        dialog.showErrorBox('打开项目失败！', JSON.stringify(e));
                    });

                } else {
                    dialog.showErrorBox('打开项目失败！', '该项目已经不存在了！');
                }
            },

            handleDeleteHistory (e, index) {
                e.stopPropagation();
                let _this = this;

                _this.historyList.splice(index, 1);
                // 更新历史记录
                saveFileSync({
                    historyList: _this.historyList
                }, config.historyPath);
            }
        },
        created () {
            let _this = this;

            if (fileExist(config.historyPath)) {
                readFilePromise(config.historyPath).then((res) => {
                    _this.historyList = res.historyList || [];
                });
            }

            document.onkeydown = (e) => {
                if (e.code === 'F12') {
                    ipcRenderer.sendSync('windowOrder', 'openDevTools');
                }
            };
        }
    };
</script>

<style>
    .home-page{
        position: relative;
        width: 100%;
        height: 100%;
    }
    .home-page .history-wrap{
        position: relative;
        width: 220px;
        height: 100%;
        background-color: #fcfcfc;
        border-right: 1px solid #9b9b9b;
        padding-top: 30px;
        float: left;
    }
    .home-page .history-wrap .title{
        font-weight: bold;
        line-height: 30px;
        padding: 0 5px;
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        border-bottom: 1px solid #e2e2e2;
    }
    .home-page .history-wrap .cont{
        height: 100%;
    }
    .home-page .history-list{
        overflow: hidden;
    }
    .home-page .history-list .item{
        border-bottom: 1px dashed #dadada;
        padding: 10px 32px 10px 10px;
        cursor: pointer;
        position: relative;
    }
    .home-page .history-list .item:hover{
        background-color: #ececec;
    }
    .home-page .history-list .project-name, .home-page .history-list .project-path{
        width: 100%;
        height: 20px;
        line-height: 20px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .home-page .history-list .project-name{
        font-size: 14px;
        font-weight: bold;
    }
    .home-page .history-list .project-path{
        font-size: 12px;
        color: #8c8c8c;
    }
    .home-page .history-list .btn{
        border: none;
        background: transparent;
        display: none;
        width: 26px;
        height: 20px;
        position: absolute;
        top: 50%;
        right: 2px;
        margin-top: -10px;
    }
    .home-page .history-list .btn:hover{
        color: #e20000;
    }
    .home-page .history-list .item:hover .btn{
        display: block;
    }
    .home-page .history-no-data{
        display: inline-block;
        line-height: 40px;
    }
    .home-page .contain{
        width: 828px;
        height: 670px;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-top: -335px;
        margin-left: -304px;
    }
    .home-page .logo{
        margin: 0 auto;
        text-align: center;
        padding-top: 100px;
    }
    .home-page .logo .icon{
        display: block;
        width: 100px;
        height: 100px;
        margin: 0 auto;
        background-image: url("../../icon/icon.png");
        background-position: center;
        background-repeat: no-repeat;
        background-size: contain;
    }
    .home-page .action{
        padding-top: 40px;
        width: 120px;
        margin: 0 auto;
        text-align: left;
    }
    .home-page .action .icon-font{
        display: inline-block;
        width: 32px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        color: #ffffff;
        border-radius: 50%;
        background-color: #0095f9;
        margin-right: 3px;
    }
    .home-page .action .icon-font:before{
        position: relative;
        right: -1px;
    }
    .home-page .action .icon-shujuku:before{
        right: 0;
    }
    .home-page .action .el-button{
        font-size: 14px;
    }
    .home-page .footer{
        text-align: center;
        font-size: 12px;
        color: #3a3a3a;
        width: 100%;
        padding-left: 220px;
        position: absolute;
        bottom: 40px;
    }

    .home-page-dialog-430px{
        width: 430px;
    }
    .home-page-dialog-430px .label{
        display: inline-block;
        width: 55px;
        margin-right: 10px;
        text-align: right;
        vertical-align: bottom;
    }
</style>
