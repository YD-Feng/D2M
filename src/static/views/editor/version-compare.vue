<template>
    <div v-if="refreshFlag" class="p10px">
        <div class="pb10px mb10px"
             style="border-bottom: 1px solid #e2e2e2;">
            <span class="pr5px">初始版本</span>
            <el-select
                :disabled="formDisabled"
                v-model="curOldVerCode">
                <el-option
                    value="@curProject@"
                    label="当前项目内容">
                </el-option>
                <el-option
                    v-for="(version, index) in projectVersionList"
                    :key="'verOpt' + index"
                    :value="version"
                    :label="version">
                </el-option>
            </el-select>

            <span class="pl20px pr5px">增量版本</span>
            <el-select
                :disabled="formDisabled"
                v-model="curNewVerCode">
                <el-option
                    value="@curProject@"
                    label="当前项目内容">
                </el-option>
                <el-option
                    v-for="(version, index) in projectVersionList"
                    :key="'verOpt' + index"
                    :value="version"
                    :label="version">
                </el-option>
            </el-select>

            <el-button
                :disabled="formDisabled"
                type="default"
                class="ml20px"
                @click="handleCompare">
                对比
            </el-button>
        </div>

        <div class="version-compare-wrap">
            <div class="msg-wrap">
                <p class="fBold f14px lh30px">变化信息：</p>
                <div class="msg"
                     v-auto-height
                     data-del-height="260">
                    <div class="p5px">
                        <p v-for="(item, index) in changeList"
                           class="lh20px" style="padding: 3px 0;">
                            {{transChangeMsg(item, index)}}
                        </p>
                    </div>
                </div>
            </div>
            <div class="code-wrap">
                <p class="fBold f14px lh30px oh">
                    <span class="fl">变化脚本：</span>
                    <el-select
                        v-model="curDataBase"
                        class="fr">
                        <el-option
                            v-for="(item, index) in databaseList"
                            :key="item.code"
                            :value="item.code"
                            :label="item.code">
                        </el-option>
                    </el-select>
                </p>

                <div class="code"
                     v-auto-height
                     data-del-height="260">
                    <pre ref="code" v-if="codeFlag" language="SQL" class="pre">{{curCode}}</pre>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import path from 'path';
    import hljs from 'highlight.js';
    import { readFileSync } from './../../js/utils/fs';
    import { checkVersionData } from './../../js/utils/project-version';
    import { getCodeByChanges } from './../../js/utils/json2code';

    export default {
        props: ['newVerCode', 'oldVerCode', 'projectData', 'projectVersionList', 'flag'],
        data () {
            return {
                formDisabled: false,
                curNewVerCode: '@curProject@',
                curOldVerCode: '@curProject@',
                newVerData: null,
                oldVerData: null,
                changeList: [],

                curDataBase: '',
                codeFlag: false,
                curCode: '',

                optNameMap: {
                    add: '新增',
                    update: '更新',
                    delete: '删除'
                },
                typeNameMap: {
                    field: '字段',
                    index: '索引',
                    entity: '表'
                },

                refreshFlag: true
            };
        },
        computed: {
            projectPath () {
                return this.$store.state.project.projectPath;
            },
            databaseList () {
                let _this = this;

                if (_this.projectData) {
                    return _this.projectData.dataTypeDomains.database;
                } else {
                    return [];
                }
            }
        },
        watch: {
            flag (val) {
                let _this = this;

                _this.refreshFlag = false;
                _this.$nextTick(() => {
                    _this.refreshFlag = true;
                });
            }
        },
        methods: {
            setData (data) {
                let _this = this;

                Object.keys(data).forEach((key) => {
                    _this[key] = data[key]
                });

                if (_this.curCode) {
                    _this.showCode();
                }
            },

            getData () {
                return this.$data;
            },

            init () {
                let _this = this;

                let defaultDataBase = _this.databaseList.filter((item) => {
                    return item.defaultDatabase;
                })[0];
                _this.newVerData = null;
                _this.oldVerData = null;
                _this.curDataBase = defaultDataBase ? defaultDataBase.code : '';
                _this.codeFlag = false;
                _this.curCode = '';

                if (_this.newVerCode && _this.oldVerCode) {
                    _this.formDisabled = true;
                    _this.curNewVerCode = _this.newVerCode;
                    _this.curOldVerCode = _this.oldVerCode;
                    _this.handleCompare();
                } else {
                    _this.curNewVerCode = '@curProject@';
                    _this.curOldVerCode = '@curProject@';
                    _this.formDisabled = false;
                }
            },
            getVersionData (versionCode) {
                let _this = this;

                if (versionCode == '@curProject@') {
                    return _this.projectData;
                } else {
                    return readFileSync(
                        path.join(_this.projectPath.replace('json', 'version'), versionCode + '.json')
                    );
                }
            },

            handleCompare () {
                let _this = this;

                if (_this.curNewVerCode) {
                    _this.newVerData = _this.getVersionData(_this.curNewVerCode);
                } else {
                    _this.newVerData = null;
                }

                if (_this.curOldVerCode) {
                    _this.oldVerData = _this.getVersionData(_this.curOldVerCode);
                } else {
                    _this.oldVerData = null;
                }

                _this.changeList = checkVersionData(_this.newVerData, _this.oldVerData);
                _this.showCode();
            },

            showCode () {
                let _this = this;

                _this.curCode = _this.getCode().replace(/\n/g, '\r\n').replace(/\/\*SQL@Run\*\//g, '\r\n');

                _this.codeFlag = false;

                _this.$nextTick(() => {
                    _this.codeFlag = true;
                    _this.$nextTick(() => {
                        hljs.highlightBlock(_this.$refs.code);
                    });
                });
            },

            getCode () {
                let _this = this;

                return getCodeByChanges(
                    _this.newVerData,
                    _this.changeList,
                    _this.curDataBase,
                    _this.oldVerData
                );
            },

            transChangeMsg (change, index) {
                let _this = this,
                    mag = `${index + 1}. ${_this.optNameMap[change.opt]} ${_this.typeNameMap[change.type]} 【${change.name}】`;

                if (change.opt == 'update') {
                    mag += ` 变动 (${change.changeData})`;
                }

                return mag;
            }
        }
    };
</script>

<style>
    @import url('./main.css');
</style>
