<template>
    <div class="tab-win-cont"
         v-if="curDataBase">
        <p class="title">{{curDataBase.code}} - 数据库配置</p>
        <div class="table-wrap" style="padding: 30px 10px 10px 10px;">
            <table class="table">
                <tr>
                    <td width="1"
                        class="pl10px pb20px text-right">
                        生成至文档：
                    </td>
                    <td class="pl5px pb20px pr10px">
                        <el-checkbox
                            v-model.trim="curDataBase.fileShow"
                            @change="handleChange">
                        </el-checkbox>
                        <span class="ml5px cm-text-green">
                            (勾选此项，将会在生成的文档中显示该数据库所对应的字段类型)
                        </span>
                    </td>
                </tr>
                <tr>
                    <td width="1"
                        class="pl10px pb20px text-right">
                        设为默认：
                    </td>
                    <td class="pl5px pb20px pr10px">
                        <el-checkbox
                            v-model.trim="curDataBase.defaultDatabase"
                            @change="handleChange">
                        </el-checkbox>
                        <span class="ml5px cm-text-green">
                            (勾选此项，将会在数据表和关系图中显示默认数据库的数据类型)
                        </span>
                    </td>
                </tr>
                <tr>
                    <td width="1"
                        valign="top"
                        class="pl10px pb20px text-right">
                        <span class="lh30px">模版配置：</span>
                    </td>
                    <td class="pl5px pb20px pr10px">
                        <el-tabs
                            v-model="curTab"
                            type="card">
                            <el-tab-pane
                                v-for="(value, key) in curDataBase"
                                v-if="key.indexOf('Template') != -1 || key == 'updateTableComment'"
                                :label="keyNameMap[key]"
                                :name="key"
                                :key="key">
                            </el-tab-pane>
                        </el-tabs>
                        <div class="editor-wrap"
                             v-auto-height
                             data-del-height="360">
                            <editor
                                ref="mainEditor"
                                v-model="curDataBase[curTab]"
                                @init="editorInit"
                                @input="handleEditorChange"
                                lang="mysql"
                                theme="chrome"
                                :options="editorOptions"
                                width="100%"
                                height="100%">
                            </editor>
                        </div>

                        <el-button
                            type="default"
                            class="mt10px"
                            style="width: 120px;"
                            @click="openPreviewDialog">
                            预览编辑
                        </el-button>

                        <el-button
                            type="default"
                            class="mt10px"
                            style="width: 120px;"
                            @click="openTplDialog">
                            从默认模版中选取
                        </el-button>
                    </td>
                </tr>
            </table>
        </div>

        <el-dialog
            title="预览编辑"
            fullscreen
            :visible.sync="previewDialog.visible">
            <div v-auto-height
                 data-del-height="110"
                 class="preview-dlg-cont">
                <div class="data-wrap">
                    <div class="dlg-title">
                        参考数据
                    </div>
                    <div class="editor-wrap" style="overflow: auto;">
                        <pre ref="dataCode" language="JSON" class="pre">{{previewDialog.dataCode}}</pre>
                    </div>
                </div>
                <div class="result-wrap">
                    <div class="dlg-title">
                        结果预览
                    </div>
                    <div class="editor-wrap" style="overflow: auto;">
                        <pre ref="previewCode" language="SQL" class="pre" v-if="previewDialog.previewCodeFlag">{{previewDialog.previewCode}}</pre>
                    </div>
                </div>
                <div class="dlg-editor-wrap">
                    <div class="dlg-title">
                        <div class="fl pl20px">
                            <el-button
                                type="text"
                                style="vertical-align: baseline; padding: 0;"
                                @click="openGrammarDialog">
                                语法介绍
                            </el-button>
                        </div>

                        <div class="fr pr20px">
                            <el-button
                                type="text"
                                style="vertical-align: baseline; padding: 0;"
                                @click="handlePreview">
                                生成预览
                            </el-button>
                        </div>

                        <p>模版代码编辑</p>
                    </div>
                    <div class="editor-wrap">
                        <editor
                            ref="previewDlgEditor"
                            v-model="previewDialog.editCode"
                            @init="editorInit"
                            lang="mysql"
                            theme="chrome"
                            :options="editorOptions"
                            width="100%"
                            height="100%">
                        </editor>
                    </div>
                </div>
            </div>
            <div class="text-center">
                <el-button
                    type="default"
                    class="mt10px"
                    style="width: 110px;"
                    @click="handleUseTpl('preview')">
                    确 定
                </el-button>

                <el-button
                    type="default"
                    class="mt10px"
                    style="width: 110px;"
                    @click="closeDialog">
                    取 消
                </el-button>
            </div>
        </el-dialog>

        <el-dialog
            title="语法介绍"
            top="-350px"
            custom-class="editor-page-dialog-1000px"
            :visible.sync="grammarDialog.visible">
            <div class="grammar-dlg-cont">
                <table class="dlg-table">
                    <tr>
                        <th>项目</th>
                        <th>JavaScript语法</th>
                        <th>对应语法</th>
                        <th>案例</th>
                    </tr>
                    <tr>
                        <td>输出变量</td>
                        <td>=</td>
                        <td v-pre>{{=变量名}}</td>
                        <td v-pre>{{=it.name}}</td>
                    </tr>
                    <tr>
                        <td>条件判断</td>
                        <td>if</td>
                        <td v-pre>{{? 条件表达式}}...{{?}}</td>
                        <td v-pre>{{? i > 3}}...{{?}}</td>
                    </tr>
                    <tr>
                        <td>条件转折</td>
                        <td>else/else if</td>
                        <td v-pre>{{??}}/{{?? 表达式}}</td>
                        <td v-pre>{{? i > 3}}...{{?? i ==2}}...{{?}}</td>
                    </tr>
                    <tr>
                        <td>循环遍历</td>
                        <td>for</td>
                        <td v-pre>{{~ 循环变量}}'}}</td>
                        <td v-pre>{{~ it.arr:item}}...{{~}}</td>
                    </tr>
                    <tr>
                        <td>执行方法</td>
                        <td>funcName()</td>
                        <td v-pre>{{= funcName() }}</td>
                        <td v-pre>{{= it.sayHello() }}</td>
                    </tr>
                </table>

                <p class="lh30px mt20px f14px">
                    全局方法：可以通过 <span class="cm-text-blue fBold">it.func.方法名(参数...)</span> 使用
                </p>
                <table class="dlg-table">
                    <tr>
                        <th>方法名</th>
                        <th>方法功能</th>
                        <th>参数介绍</th>
                        <th>案例</th>
                    </tr>
                    <tr>
                        <td>camel</td>
                        <td>下划线转驼峰</td>
                        <td>参数1：需要转化的字符串，参数2：首字母是否需要大写</td>
                        <td>('USER_NAME', true) => 'userName'</td>
                    </tr>
                    <tr>
                        <td>underline</td>
                        <td>驼峰转下划线</td>
                        <td>参数1：需要转化的字符串，参数2：是否全大写</td>
                        <td>('userName', true) => 'USER_NAME'</td>
                    </tr>
                    <tr>
                        <td>upperCase</td>
                        <td>全大写</td>
                        <td>参数1：需要转化的字符串</td>
                        <td>('userName') => 'USERNAME'</td>
                    </tr>
                    <tr>
                        <td>lowerCase</td>
                        <td>全小写</td>
                        <td>参数1：需要转化的字符串</td>
                        <td>('USERNAME') => 'useranem'</td>
                    </tr>
                    <tr>
                        <td>join</td>
                        <td>多个字符串拼接</td>
                        <td>不限参数，最后一个参数为拼接符</td>
                        <td>('user', 'name', '/') => 'user/name'</td>
                    </tr>
                    <tr>
                        <td>intersect</td>
                        <td>两个数组交集</td>
                        <td>参数1：数组1，参数2：数组2</td>
                        <td>(['1', '2'], ['1', '2', '3']) => ['1', '2']</td>
                    </tr>
                    <tr>
                        <td>union</td>
                        <td>两个数组并集</td>
                        <td>参数1：数组1，参数2：数组2</td>
                        <td>(['1', '2'], ['1', '2', '3']) => ['1', '2', '3']</td>
                    </tr>
                    <tr>
                        <td>minus</td>
                        <td>两个数组差集</td>
                        <td>参数1：数组1，参数2：数组2；（数组1比数组2多出的数据）</td>
                        <td>(['1', '2', '3'], ['1', '2']) => ['3']</td>
                    </tr>
                </table>
            </div>
        </el-dialog>

        <el-dialog
            title="默认模版配置案例"
            custom-class="editor-page-dialog-850px"
            :visible.sync="tplDialog.visible">
            <div class="default-dlg-cont pl10px pr10px pt10px f12px">
                <table class="table">
                    <tr>
                        <td width="1"
                            class="pl10px pb20px text-right">
                            数据库：
                        </td>
                        <td class="pl5px pb20px pr10px">
                            <el-select
                                v-model="tplDialog.curIndex"
                                @change="setDefaultCode">
                                <el-option
                                    v-for="(item, index) in tplDialog.defaultData"
                                    :key="index"
                                    :value="index"
                                    :label="item.code">
                                </el-option>
                            </el-select>
                        </td>
                    </tr>
                    <tr>
                        <td width="1"
                            valign="top"
                            class="pl10px pb20px text-right">
                            <span class="lh30px">模版配置：</span>
                        </td>
                        <td class="pl5px pb20px pr10px">
                            <el-tabs
                                v-model="tplDialog.curTab"
                                type="card"
                                @tab-click="setDefaultCode">
                                <el-tab-pane
                                    v-for="(name, key) in keyNameMap"
                                    v-if="key.indexOf('Template') != -1 || key == 'updateTableComment'"
                                    :label="name"
                                    :name="key"
                                    :key="key">
                                </el-tab-pane>
                            </el-tabs>
                            <div class="editor-wrap"
                                 style="height: 300px; overflow: auto;"
                                 v-if="tplDialog.defaultCodeFlag">
                                <pre ref="defaultCode" language="SQL" class="pre">{{tplDialog.defaultCode}}</pre>
                            </div>
                        </td>
                    </tr>
                </table>
                <div class="text-center">
                    <el-button
                        type="default"
                        class="mt10px"
                        style="width: 110px;"
                        @click="handleUseTpl('tpl')">
                        使用此案例模版
                    </el-button>

                    <el-button
                        type="default"
                        class="mt10px"
                        style="width: 110px;"
                        @click="closeDialog">
                        关 闭
                    </el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import editor from 'vue2-ace-editor';
    import hljs from 'highlight.js';
    import defaultData from './../../js/utils/default-data';
    import { getDemoTemplateData, getDataByTemplate } from './../../js/utils/json2code';

    module.exports = {
        replace: true,
        components: {
            editor
        },
        data () {
            return {
                curDataBase: null,
                initFlag: false,
                hasChange: false,

                keyNameMap: {
                    createTableTemplate: '创建数据表',
                    deleteTableTemplate: '删除数据表',
                    rebuildTableTemplate: '重建数据表',
                    createFieldTemplate: '添加字段',
                    updateFieldTemplate: '修改字段',
                    deleteFieldTemplate: '删除字段',
                    createIndexTemplate: '创建索引',
                    deleteIndexTemplate: '删除索引',
                    updateTableComment: '表注释'
                },

                curTab: 'createTableTemplate',
                changeTabFlag: 0,

                editorOptions: {
                    fontSize: 14
                },

                previewDialog: {
                    visible: false,
                    dataCode: '',
                    previewCode: '',
                    previewCodeFlag: false,
                    editCode: ''
                },

                grammarDialog: {
                    visible: false
                },

                tplDialog: {
                    visible: false,
                    curIndex: 0,
                    curTab: 'createTableTemplate',
                    defaultData: defaultData.profile.defaultDataTypeDomains.database,
                    defaultCode: '',
                    defaultCodeFlag: false
                }
            };
        },
        watch: {
            curTab () {
                if (this.initFlag) {
                    this.changeTabFlag = 2;
                }
            }
        },
        methods: {
            setData (curDataBase) {
                let _this = this;

                _this.curDataBase = {
                    code: curDataBase.code,
                    template: curDataBase.template,
                    fileShow: !!curDataBase.fileShow,
                    defaultDatabase: !!curDataBase.defaultDatabase,
                    createTableTemplate: curDataBase.createTableTemplate,
                    deleteTableTemplate: curDataBase.deleteTableTemplate,
                    rebuildTableTemplate: curDataBase.rebuildTableTemplate,
                    createFieldTemplate: curDataBase.createFieldTemplate,
                    updateFieldTemplate: curDataBase.updateFieldTemplate,
                    deleteFieldTemplate: curDataBase.deleteFieldTemplate,
                    createIndexTemplate: curDataBase.createIndexTemplate,
                    deleteIndexTemplate: curDataBase.deleteIndexTemplate,
                    updateTableComment: curDataBase.updateTableComment
                };

                _this.$nextTick(() => {
                    _this.initFlag = true;
                });
            },

            getData () {
                return this.curDataBase;
            },

            handleChange () {
                let _this = this;

                if (_this.initFlag && !_this.hasChange) {
                    _this.hasChange = true;
                    _this.$emit('data-change');
                }
            },
            handleEditorChange () {
                let _this = this;

                /*
                * 切换 tab 的时候，editor 的内容切换会触发2次 handleEditorChange，但其实切换 tab 并没有修改任何内容
                * 因此引入了一个 changeTabFlag 属性来对 handleEditorChange 事件逻辑做特殊处理
                * */
                if (_this.initFlag && !_this.hasChange && _this.changeTabFlag == 0) {
                    _this.hasChange = true;
                    _this.$emit('data-change');
                }

                if (_this.changeTabFlag != 0) {
                    _this.changeTabFlag--;
                }
            },

            editorInit: function () {
                require('brace/ext/language_tools');
                require('brace/mode/mysql');
                require('brace/mode/javascript');
                require('brace/theme/chrome');
            },

            openTplDialog () {
                let _this = this;
                _this.tplDialog.visible = true;
                _this.tplDialog.defaultCode = _this.tplDialog.defaultData[_this.tplDialog.curIndex][_this.tplDialog.curTab];
                _this.tplDialog.defaultCodeFlag = false;

                _this.$nextTick(() => {
                    _this.tplDialog.defaultCodeFlag = true;
                    _this.$nextTick(() => {
                        hljs.highlightBlock(_this.$refs.defaultCode);
                    });
                });
            },
            openPreviewDialog () {
                let _this = this;
                _this.previewDialog.visible = true;
                _this.previewDialog.dataCode = getDemoTemplateData(_this.curTab);
                _this.previewDialog.editCode = _this.curDataBase[_this.curTab];
                _this.previewDialog.previewCode = '';
                _this.previewDialog.previewCodeFlag = false;
                _this.$nextTick(() => {
                    hljs.highlightBlock(_this.$refs.dataCode);
                });
            },
            openGrammarDialog () {
                this.grammarDialog.visible = true;
            },
            closeDialog () {
                let _this = this;
                _this.tplDialog.visible = false;
                _this.previewDialog.visible = false;
                _this.grammarDialog.visible = false;
            },

            handleUseTpl (type) {
                let _this = this;

                switch (type) {
                    case 'preview':
                        _this.curDataBase[_this.curTab] = _this.previewDialog.editCode;
                        break;
                    case 'tpl':
                        _this.curDataBase[_this.curTab] = _this.tplDialog.defaultCode;
                        break;
                }

                //_this.$refs.mainEditor.editor.setValue(tpl);
                _this.closeDialog();
            },
            handlePreview () {
                let _this = this,
                    data = JSON.parse(_this.previewDialog.dataCode),
                    tpl = _this.$refs.previewDlgEditor.editor.getValue();

                _this.previewDialog.previewCode = getDataByTemplate(data, tpl);
                _this.previewDialog.previewCodeFlag = false;

                _this.$nextTick(() => {
                    _this.previewDialog.previewCodeFlag = true;
                    _this.$nextTick(() => {
                        hljs.highlightBlock(_this.$refs.previewCode);
                    });
                });
            },
            setDefaultCode () {
                let _this = this;

                _this.tplDialog.defaultCode = _this.tplDialog.defaultData[_this.tplDialog.curIndex][_this.tplDialog.curTab];
                _this.tplDialog.defaultCodeFlag = false;

                _this.$nextTick(() => {
                    _this.tplDialog.defaultCodeFlag = true;
                    _this.$nextTick(() => {
                        hljs.highlightBlock(_this.$refs.defaultCode);
                    });
                });
            }
        }
    };
</script>

<style>
    @import url('./tab-win-cont.css');
</style>
