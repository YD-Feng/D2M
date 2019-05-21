<template>
    <div class="editor-page"
         :style="{paddingLeft: curSideBar.type != '' ? sideBarWidth : '21px'}">
        <div class="editor-page-tool-bar">
            <div class="fl">
                <el-button
                    class="btn"
                    type="text"
                    @click="handleSave()">
                    <i class="icon-font icon-baocun"></i>
                    <span>全部保存</span>
                </el-button>

                <el-button
                    class="btn"
                    type="text"
                    @click="openSaveAsDialog()">
                    <i class="icon-font icon-lingcunwei"></i>
                    <span>项目另存为</span>
                </el-button>

                <el-button
                    class="btn"
                    type="text"
                    @click="openSettingDialog()">
                    <i class="icon-font icon-shezhi"></i>
                    <span>维护实例名/库名</span>
                </el-button>

                <el-button
                    class="btn"
                    type="text"
                    @click="handleBackToHome()">
                    <i class="icon-font icon-tuichu"></i>
                    <span>退出项目</span>
                </el-button>
            </div>

            <div class="fr">
                <span class="f12px">对比版本：</span>
                <el-select
                    v-model="compareVersion"
                    @change="handleCompareVersionChange"
                    style="vertical-align: super;">
                    <el-option
                        value="@curProjectCache@"
                        label="本次项目缓存">
                    </el-option>
                    <el-option
                        v-for="(version, index) in projectVersionList"
                        :key="'verOpt' + index"
                        :value="version"
                        :label="version">
                    </el-option>
                </el-select>
            </div>
        </div>

        <div class="editor-page-side-bar"
             :style="{width: sideBarWidth, borderRight: curSideBar.type != '' ? '1px solid #9b9b9b' : 'none'}">
            <ul class="tab-list">
                <li v-for="item in sideBarList"
                    class="item"
                    :class="{'active': item.type == curSideBar.type}"
                    @click="handleChangeSideBar(item)">
                    <i class="icon-font"
                       :class="item.icon">
                    </i>
                    <span class="f12px">{{item.name}}</span>
                </li>
            </ul>
            <div class="title" v-show="curSideBar.type != ''">
                <div class="fl">
                    {{curSideBar.name}}
                </div>
                <div class="fr">
                    <i class="icon-font icon-shouqi"
                       @click="handleChangeSideBar()">
                    </i>
                </div>
            </div>
            <div class="cont"
                 v-show="curSideBar.type != ''"
                 @contextmenu="handleShowContextMenu($event, 'sideBar')">
                <div ref="vBar" v-bar style="height: 100%;">
                    <!--这个 div 不是多余的，是用来生成 vue-bar 内层的，不能删除-->
                    <div>
                        <el-tree
                            ref="modulesTree"
                            class="pb10px"
                            v-show="curSideBar.type == 'modules'"
                            :data="modulesTreeData"
                            :props="treeProps"
                            :render-after-expand="false"
                            empty-text="暂无模块，在此处点击右键新建模块"
                            @node-expand="toggleTreeFlag"
                            @node-collapse="toggleTreeFlag"
                            @node-click="handleClickNode"
                            @node-contextmenu="showContextMenu">
                            <div class="custom-tree-node"
                                 slot-scope="{node, data}"
                                 :draggable="data.nodeType == 3"
                                 @dragstart="handleDragStart($event, data, node)"
                                 @dragover="handleDragOver($event, data, node)"
                                 @drop="handleDrop($event, data, node)">
                                <i class="icon-font"
                                   :class="treeNodeClass[data.nodeType]">
                                </i>
                                <span class="pr10px">{{ node.label }}</span>
                            </div>
                        </el-tree>
                        <div v-show="curSideBar.type == 'modules'" class="h40px"></div>

                        <el-tree
                            ref="dataConfigTree"
                            class="pb10px"
                            v-show="curSideBar.type == 'dataConfig'"
                            :data="dataConfigTreeData"
                            :props="treeProps"
                            :render-after-expand="false"
                            :default-expand-all="true"
                            @node-expand="toggleTreeFlag"
                            @node-collapse="toggleTreeFlag"
                            @node-click="handleClickNode"
                            @node-contextmenu="showContextMenu">
                            <div class="custom-tree-node"
                                 slot-scope="{node, data}">
                                <i class="icon-font"
                                   :class="treeNodeClass[data.nodeType]">
                                </i>
                                <span class="pr10px">{{ node.label }}</span>
                            </div>
                        </el-tree>

                        <div v-show="curSideBar.type == 'version'">
                            <div class="text-center pt10px">
                                <el-button
                                    type="primary"
                                    @click="openVersionDialog()"
                                    style="padding: 3px 6px;">
                                    <i class="icon-font icon-banben"
                                       style="font-size: 12px; vertical-align: text-bottom;">
                                    </i>
                                    <span>生成版本</span>
                                </el-button>

                                <el-button
                                    type="success"
                                    @click="openCompareTabWin()"
                                    style="padding: 3px 6px;">
                                    <i class="icon-font icon-duibi"
                                       style="font-size: 12px; vertical-align: text-bottom;">
                                    </i>
                                    <span>版本对比</span>
                                </el-button>
                            </div>

                            <version-step
                                :version-code-list="projectVersionList"
                                @see-compare="openCompareTabWin">
                            </version-step>
                        </div>

                        <span v-if="treeFlag"></span>
                    </div>
                </div>

                <div class="resize"></div>
                <div class="resize-mask"></div>
            </div>
        </div>

        <div class="editor-page-contain"
             :class="{'has-tab-list': tabWinList.length > 0}">
            <ul class="tab-list"
                v-show="tabWinList.length > 0">
                <li v-for="(item, index) in tabWinList"
                    :title="item.tabName"
                    class="item"
                    :class="{'active': curTabIndex == index}"
                    :style="{maxWidth: tabItemMaxWidth}"
                    @click="handleCurTabWin(index)"
                    @contextmenu="handleShowContextMenu($event, 'tab', index)">
                    <i class="icon-font"
                       :class="treeNodeClass[item.type]"></i>
                    <span>{{item.tabName}}</span>
                    <i class="icon-font icon-guanbi"
                       @click="closeTabWin($event, index)">
                    </i>
                </li>
            </ul>
            <div class="win" v-bar>
                <div ref="scrollCont">
                    <div v-for="(item, index) in tabWinList"
                         v-if="curTabIndex == index">
                        <!--关系图-->
                        <relation
                            :ref="'tabWin-' + index"
                            v-if="item.type == 2"
                            v-model="projectData.modules[item.moduleIndex].relations[item.relationIndex]"
                            :project-data="projectData"
                            @copy-table="handleCopyTable"
                            @dblclick-table="handleDblClickTable">
                        </relation>

                        <!--数据表-->
                        <entity
                            :ref="'tabWin-' + index"
                            v-if="item.type == 3"
                            v-model="projectData.modules[item.moduleIndex].entities[item.entityIndex]"
                            :project-data="projectData"
                            :cur-module="projectData.modules[item.moduleIndex]"
                            :change-list="changeList"
                            :last-tab="item.lastTab"
                            @field-visible-change="handleFieldVisibleChange"
                            @field-sort-change="handleFieldSortChange"
                            @tab-change="handleEntityTabChange">
                        </entity>

                        <!--数据类型-->
                        <data-type
                            :ref="'tabWin-' + index"
                            v-if="item.type == 4"
                            v-model="projectData.dataTypeDomains.datatype[item.dataTypeIndex]"
                            :data-base-list="projectData.dataTypeDomains.database">
                        </data-type>

                        <!--数据库-->
                        <data-base
                            :ref="'tabWin-' + index"
                            v-if="item.type == 5"
                            v-model="projectData.dataTypeDomains.database[item.dataBaseIndex]"
                            @default-db-change="handleDefaultDbChange">
                        </data-base>

                        <!--版本对比-->
                        <version-compare
                            :ref="'tabWin-' + index"
                            v-if="item.type == 6 || item.type == 7"
                            :new-ver-code="item.newVerCode"
                            :old-ver-code="item.oldVerCode"
                            :project-data="projectData"
                            :project-version-list="projectVersionList"
                            :flag="index">
                        </version-compare>
                    </div>
                </div>
            </div>
        </div>

        <div ref="contextMenu"
             class="editor-page-context-menu"
             v-click-outside="hideContextMenu"
             v-show="contextMenu.visible"
             :style="contextMenu.style">
            <ul class="menu-list">
                <li v-for="item in menuMap[contextMenu.type]"
                    class="item"
                    :class="{'item-disabled': item.en == 'Paste' && ((copyCache && pasteTarget != contextMenu.type) || !copyCache)}"
                    @click="handleClickContextMenu(item.en)">
                    <span class="fl">{{item.cn}}</span>
                    <span class="fr cm-text-light">{{item.en}}</span>
                </li>
            </ul>
        </div>

        <el-dialog
            top="30vh"
            :title="contextMenuDialog.dialogTitle"
            custom-class="editor-page-dialog-350px"
            :visible.sync="contextMenuDialog.visible">
            <div class="pl10px pr10px pt10px text-center">
                <template v-if="contextMenuDialog.type == 'newRelation' || contextMenuDialog.type == 'renameRelation'">
                    <div>
                        编　码：
                        <el-input
                            v-model.trim="contextMenuDialog.title"
                            placeholder="请输入关系图编码"
                            style="width: 200px;">
                        </el-input>
                    </div>
                    <div class="pt20px">
                        中文名：
                        <el-input
                            v-model.trim="contextMenuDialog.chnname"
                            placeholder="请输入关系图中文名"
                            style="width: 200px;">
                        </el-input>
                    </div>
                </template>

                <template v-if="contextMenuDialog.type == 'newEntity' || contextMenuDialog.type == 'renameEntity'">
                    <div>
                        表　名：
                        <el-input
                            v-model.trim="contextMenuDialog.title"
                            placeholder="请输入表名"
                            style="width: 200px;">
                        </el-input>
                    </div>
                    <div class="pt20px">
                        中文名：
                        <el-input
                            v-model.trim="contextMenuDialog.chnname"
                            placeholder="请输入表中文名"
                            style="width: 200px;">
                        </el-input>
                    </div>
                </template>

                <template v-if="contextMenuDialog.type == 'newModule' || contextMenuDialog.type == 'renameModule'">
                    <div>
                        模块名：
                        <el-input
                            v-model.trim="contextMenuDialog.name"
                            placeholder="请输入模块名"
                            style="width: 200px;">
                        </el-input>
                    </div>
                    <div class="pt20px">
                        中文名：
                        <el-input
                            v-model.trim="contextMenuDialog.chnname"
                            placeholder="请输入模块中文名"
                            style="width: 200px;">
                        </el-input>
                    </div>
                </template>

                <template v-if="contextMenuDialog.type == 'newDataType' || contextMenuDialog.type == 'renameDataType'">
                    <div>
                        类型名称：
                        <el-input
                            v-model.trim="contextMenuDialog.name"
                            placeholder="请输入类型名称"
                            style="width: 200px;">
                        </el-input>
                    </div>
                    <div class="pt20px">
                        类型编码：
                        <el-input
                            v-model.trim="contextMenuDialog.code"
                            placeholder="请输入类型编码"
                            style="width: 200px;">
                        </el-input>
                    </div>
                </template>

                <div class="pt20px">
                    <el-button
                        type="primary"
                        style="width: 60px;"
                        @click="handleDialogSubmit">
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
            title="项目另存为"
            custom-class="editor-page-dialog-430px"
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
                                    @click="handleOpenSysDialog">
                                    ...
                                </el-button>
                            </div>
                        </template>
                    </el-input>
                </div>

                <div class="text-center">
                    <el-button
                        type="primary"
                        style="width: 60px;"
                        @click="handleProjectSaveAs">
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
            title="维护实例名/库名"
            custom-class="editor-page-dialog-430px"
            :visible.sync="settingDialog.visible">
            <div class="pl20px pr20px pt10px">
                <div class="pb20px lh30px">
                    实例名称&nbsp;
                    <el-input
                        v-model.trim="settingDialog.rdsName"
                        style="width: 280px;">
                    </el-input>
                </div>

                <div class="pb20px lh30px">
                    数据库名&nbsp;
                    <el-input
                        v-model.trim="settingDialog.databaseName"
                        style="width: 280px;">
                    </el-input>
                </div>

                <div class="text-center">
                    <el-button
                        type="primary"
                        style="width: 60px;"
                        @click="handleUpdateSource">
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
            title="生成新版本"
            custom-class="editor-page-dialog-430px"
            :visible.sync="versionDialog.visible">
            <div class="pl20px pr20px pt10px">
                <table style="width: 100%;">
                    <tr>
                        <td valign="top"
                            class="lh30px text-right pb20px"
                            style="padding-right: 7px;"
                            width="60">
                            版本号
                        </td>
                        <td class="pb20px">
                            <el-input
                                v-model.trim="versionDialog.vCodeA"
                                style="width: 30px;">
                            </el-input>
                            .
                            <el-input
                                v-model.trim="versionDialog.vCodeB"
                                style="width: 30px;">
                            </el-input>
                            .
                            <el-input
                                v-model.trim="versionDialog.vCodeC"
                                style="width: 30px;">
                            </el-input>
                        </td>
                    </tr>
                    <tr>
                        <td valign="top"
                            class="lh30px text-right pb20px"
                            style="padding-right: 7px;">
                            版本描述
                        </td>
                        <td class="pb20px">
                            <el-input
                                type="textarea"
                                v-model.trim="versionDialog.description"
                                :rows="4"
                                placeholder="请输入版本描述信息"
                                style="width: 270px;">
                            </el-input>
                        </td>
                    </tr>
                </table>

                <div class="text-center">
                    <el-button
                        type="primary"
                        style="width: 60px;"
                        @click="handleSaveVersion">
                        保存
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
    import { saveFileSync, saveFilePromise, ensureDirectoryExistence, getFilesByDirSync, readFilePromise, fileExist } from './../../js/utils/fs';
    import { checkVersionData } from './../../js/utils/project-version';
    import deepClone from './../../js/utils/deep-clone';
    import defaultData from './../../js/utils/default-data';

    import relation from './relation.vue';
    import entity from './entity.vue';
    import dataType from './data-type.vue';
    import dataBase from './data-base.vue';
    import versionStep from './version-step.vue';
    import versionCompare from './version-compare.vue';

    const { ipcRenderer } = electron;
    const { dialog } = electron.remote;

    export default {
        components: {
            relation,
            entity,
            dataType,
            dataBase,
            versionStep,
            versionCompare
        },
        data () {
            return {
                projectName:　'',
                projectData: null,
                modulesTreeData: [],
                dataConfigTreeData: [],

                sideBarList: [
                    {
                        type: 'modules',
                        name: '项目',
                        icon: 'icon-xiangmu'
                    },
                    {
                        type: 'dataConfig',
                        name: '数据域',
                        icon: 'icon-shuju'
                    },
                    {
                        type: 'version',
                        name: '版本历程',
                        icon: 'icon-shijianzhou'
                    }
                ],
                curSideBar: {
                    type: 'modules',
                    name: '项目'
                },

                treeProps: {
                    children: 'children',
                    label: 'label'
                },
                treeNodeClass: {
                    '1': 'icon-dakai cm-text-orange',
                    '2': 'icon-guanxitu cm-text-blue',
                    '3': 'icon-biaoge cm-text-green',
                    '4': 'icon-shujuleixing cm-text-violet',
                    '5': 'icon-shujuku cm-text-red',
                    '6': 'icon-duibi icon-color-pink',
                    '7': 'icon-duibi icon-color-pink-green-z'
                },
                treeFlag: false,

                contextMenu: {
                    visible: false,
                    type: '',
                    nodeType: '',
                    orgObj: undefined,
                    pasteTarget: '',
                    moduleIndex: undefined,
                    relationIndex: undefined,
                    entityIndex: undefined,
                    dataTypeIndex: undefined,
                    dataBaseIndex: undefined,
                    tabIndex: undefined,
                    style: {
                        top: 0,
                        left: 0
                    }
                },
                menuMap: {
                    project: [
                        {cn: '新建模块', en: 'New'},
                        {cn: '粘贴', en: 'Paste'}
                    ],
                    module: [
                        {cn: '重命名', en: 'Rename'},
                        {cn: '复制', en: 'Copy'},
                        {cn: '删除', en: 'Delete'}
                    ],
                    relation: [
                        {cn: '新建关系图', en: 'New'}
                    ],
                    relationItem: [
                        {cn: '打开', en: 'Open'},
                        {cn: '重命名', en: 'Rename'},
                        {cn: '删除', en: 'Delete'}
                    ],
                    entity: [
                        {cn: '新建数据表', en: 'New'},
                        {cn: '粘贴', en: 'Paste'}
                    ],
                    dataType: [
                        {cn: '新建数据类型', en: 'New'},
                        {cn: '粘贴', en: 'Paste'}
                    ],
                    dataBaseItem: [
                        {cn: '打开', en: 'Open'}
                    ],
                    other: [
                        {cn: '打开', en: 'Open'},
                        {cn: '重命名', en: 'Rename'},
                        {cn: '复制', en: 'Copy'},
                        {cn: '删除', en: 'Delete'}
                    ],
                    tab: [
                        {cn: '关闭此标签', en: 'CloseThis'},
                        {cn: '关闭其他标签', en: 'CloseOther'},
                        {cn: '关闭所有标签', en: 'CloseAll'}
                    ]
                },
                //复制内容缓存
                copyCache: null,
                //复制内容的可粘贴目标类型
                pasteTarget: '',

                contextMenuDialog: {
                    visible: false,
                    type: '', //rename-模块重命名，newModule-新建模块，newRelation-新建关系图，newEntity-新建数据表，newDataType-新建数据类型
                    dialogTitle: '',
                    moduleIndex: undefined,
                    relationIndex: undefined,
                    entityIndex: undefined,
                    dataTypeIndex: undefined,
                    dataBaseIndex: undefined,
                    name: '',
                    oldName: '',
                    chnname: '',
                    title: '',
                    oldTitle: '',
                    code: '',
                    oldCode: ''
                },

                tabWinList: [],
                curTabIndex: 0,

                elDialog: {
                    visible: false,
                    projectName: '',
                    projectDir: ''
                },

                settingDialog: {
                    visible: false,
                    rdsName: '',
                    databaseName: ''
                },

                versionDialog: {
                    visible: false,
                    vCodeA: '',
                    vCodeB: '',
                    vCodeC: '',
                    description: ''
                },

                changeList: [],

                compareVersion: '@curProjectCache@',
                projectVersionList: [],

                resizeFlag: false,
                sideBarWidth: '230px'
            }
        },
        computed: {
            projectPath () {
                return this.$store.state.project.projectPath;
            },
            compareData () {
                return this.$store.state.project.compareData;
            },
            tabItemMaxWidth () {
                return Math.floor(100 / (this.tabWinList.length || 1)) + '%';
            }
        },
        watch: {
            'curSideBar.type': function (newVal, oldVal) {
                let _this = this;
                if (newVal === '' || oldVal === '') {
                    _this.$nextTick(() => {
                        if (_this.tabWinList.length > 0 && _this.tabWinList[_this.curTabIndex].type == 2) {
                            _this.$refs[`tabWin-${_this.curTabIndex}`][0].changeNetSize();
                        }
                    });
                }
            }
        },
        methods: {
            handleBackToHome () {
                this.$router.push({
                    path: '/'
                });
            },

            handleChangeSideBar (item) {
                let _this = this;

                if (!item || _this.curSideBar.type == item.type) {
                    _this.curSideBar.type = '';
                    _this.curSideBar.name = '';
                } else {
                    _this.curSideBar.type = item.type;
                    _this.curSideBar.name = item.name;
                }
            },

            handleClickNode (data, node, nodeVm) {
                let _this = this;

                if (data.nodeType != 1) {

                    let _this = this,
                        moduleIndex = undefined,
                        relationIndex = undefined,
                        entityIndex = undefined,
                        dataTypeIndex = undefined,
                        dataBaseIndex = undefined;

                    if (data.nodeType == 2) {
                        //关系图
                        moduleIndex = _this.projectData.modules.findIndex((item) => {
                            return item.name === node.parent.parent.data.orgObj.name;
                        });
                        relationIndex = _this.projectData.modules[moduleIndex].relations.findIndex((item) => {
                            return item.title === data.orgObj.title;
                        });
                    } else if (data.nodeType == 3) {
                        //数据表
                        moduleIndex = _this.projectData.modules.findIndex((item) => {
                            return item.name === node.parent.parent.data.orgObj.name;
                        });
                        entityIndex = _this.projectData.modules[moduleIndex].entities.findIndex((item) => {
                            return item.title === data.orgObj.title;
                        });
                    } else if (data.nodeType == 4) {
                        //数据类型
                        dataTypeIndex = _this.projectData.dataTypeDomains.datatype.findIndex((item) => {
                            return item.code === data.orgObj.code;
                        });
                    } else if (data.nodeType == 5) {
                        //数据库
                        dataBaseIndex = _this.projectData.dataTypeDomains.database.findIndex((item) => {
                            return item.code === data.orgObj.code;
                        });
                    }

                    _this.openTabWin({
                        type: data.nodeType,
                        moduleIndex: moduleIndex,
                        relationIndex: relationIndex,
                        entityIndex: entityIndex,
                        dataTypeIndex: dataTypeIndex,
                        dataBaseIndex: dataBaseIndex
                    });
                }
            },
            toggleTreeFlag () {
                let _this = this;
                setTimeout(() => {
                    //延迟一秒触发，保证节点展开已经渲染完
                    //然后修改 treeFlag，强制触发一个 span 的显隐
                    //借此来触发 v-bar 的刷新，重新计算模拟滚动条样式
                    _this.treeFlag = !_this.treeFlag;
                }, 100);
            },
            handleShowContextMenu (e, from, arg) {
                e.stopPropagation();
                let _this = this;

                if (from == 'sideBar' && _this.curSideBar.type == 'modules') {
                    _this.showContextMenu(e, {
                        contextMenuType: 'project'
                    });
                } else if (from == 'tab') {
                    _this.showContextMenu(e, {
                        contextMenuType: 'tab',
                        tabIndex: arg
                    });
                }
            },
            showContextMenu (e, data, node, nodeVm) {
                e.stopPropagation();
                let _this = this,
                    moduleIndex = undefined,
                    relationIndex = undefined,
                    entityIndex = undefined,
                    dataTypeIndex = undefined,
                    dataBaseIndex = undefined;

                if (data.contextMenuType === 'module') {
                    //模块
                    moduleIndex = _this.projectData.modules.findIndex((item) => {
                        return item.name === data.orgObj.name;
                    });
                } else if (data.contextMenuType === 'relation' ||　data.contextMenuType === 'entity') {
                    //关系图目录　或 数据表目录
                    moduleIndex = _this.projectData.modules.findIndex((item) => {
                        return item.name === node.parent.data.orgObj.name;
                    });
                } else if (data.contextMenuType === 'relationItem') {
                    //关系图
                    moduleIndex = _this.projectData.modules.findIndex((item) => {
                        return item.name === node.parent.parent.data.orgObj.name;
                    });
                    relationIndex = _this.projectData.modules[moduleIndex].relations.findIndex((item) => {
                        return item.title === data.orgObj.title;
                    });
                } else if (data.contextMenuType === 'dataBase') {
                    //数据库目录
                    return;
                } else if (data.contextMenuType === 'other') {
                    if (data.nodeType == 3) {
                        //数据表
                        moduleIndex = _this.projectData.modules.findIndex((item) => {
                            return item.name === node.parent.parent.data.orgObj.name;
                        });
                        entityIndex = _this.projectData.modules[moduleIndex].entities.findIndex((item) => {
                            return item.title === data.orgObj.title;
                        });
                    } else if (data.nodeType == 4) {
                        //数据类型
                        dataTypeIndex = _this.projectData.dataTypeDomains.datatype.findIndex((item) => {
                            return item.code === data.orgObj.code;
                        });
                    } else if (data.nodeType == 5) {
                        //数据库
                        dataBaseIndex = _this.projectData.dataTypeDomains.database.findIndex((item) => {
                            return item.code === data.orgObj.code;
                        });
                    }
                }

                _this.contextMenu.visible = true;
                _this.contextMenu.type = data.contextMenuType;
                _this.contextMenu.nodeType = data.nodeType;
                _this.contextMenu.orgObj = data.orgObj;
                _this.contextMenu.pasteTarget = data.pasteTarget;
                _this.contextMenu.moduleIndex = moduleIndex;
                _this.contextMenu.relationIndex = relationIndex;
                _this.contextMenu.entityIndex = entityIndex;
                _this.contextMenu.dataTypeIndex = dataTypeIndex;
                _this.contextMenu.dataBaseIndex = dataBaseIndex;
                _this.contextMenu.tabIndex = data.tabIndex;

                _this.$nextTick(() => {
                    _this.$refs.contextMenu.focus();

                    let winInnerHeight = window.innerHeight,
                        menuHeight = _this.$refs.contextMenu.offsetHeight,
                        X = e.clientX,
                        Y = e.clientY;

                    _this.contextMenu.style = {
                        top: (Y + menuHeight > winInnerHeight ? winInnerHeight - menuHeight : Y) + 'px',
                        left: X + 'px'
                    }
                });
            },
            hideContextMenu () {
                this.contextMenu.visible = false;
            },
            //点击右键菜单选项回调
            handleClickContextMenu (menuEn) {
                let _this = this;
                _this.hideContextMenu();
                _this[`do${menuEn}`]();
            },

            //打开（关系图、数据表、数据类型、数据库）
            doOpen () {
                let _this = this;

                _this.openTabWin({
                    type: _this.contextMenu.nodeType,
                    moduleIndex: _this.contextMenu.moduleIndex,
                    relationIndex: _this.contextMenu.relationIndex,
                    entityIndex: _this.contextMenu.entityIndex,
                    dataTypeIndex: _this.contextMenu.dataTypeIndex,
                    dataBaseIndex: _this.contextMenu.dataBaseIndex
                });
            },

            //新增（模块、关系图、数据表、数据类型）
            doNew () {
                let _this = this,
                    dialogConfig = {
                        project: {
                            type: 'newModule',
                            dialogTitle: '新建模块'
                        },
                        relation: {
                            type: 'newRelation',
                            dialogTitle: '新建关系图'
                        },
                        entity: {
                            type: 'newEntity',
                            dialogTitle: '新建数据表'
                        },
                        dataType: {
                            type: 'newDataType',
                            dialogTitle: '新建数据类型'
                        }
                    };

                _this.contextMenuDialog = {
                    visible: true,
                    type: dialogConfig[_this.contextMenu.type].type,
                    dialogTitle: dialogConfig[_this.contextMenu.type].dialogTitle,
                    moduleIndex: _this.contextMenu.moduleIndex,
                    relationIndex: _this.contextMenu.relationIndex,
                    entityIndex: _this.contextMenu.entityIndex,
                    dataTypeIndex: _this.contextMenu.dataTypeIndex,
                    dataBaseIndex: _this.contextMenu.dataBaseIndex,
                    name: '',
                    oldName: '',
                    chnname: '',
                    title: '',
                    oldTitle: '',
                    code: '',
                    oldCode: ''
                };
            },

            //模块重命名
            doRename () {
                let _this = this,
                    obj = {
                        visible: true,
                        type: '',
                        dialogTitle: '',
                        moduleIndex: _this.contextMenu.moduleIndex,
                        relationIndex: _this.contextMenu.relationIndex,
                        entityIndex: _this.contextMenu.entityIndex,
                        dataTypeIndex: _this.contextMenu.dataTypeIndex,
                        dataBaseIndex: _this.contextMenu.dataBaseIndex,
                        name: '',
                        oldName: '',
                        chnname: '',
                        title: '',
                        oldTitle: '',
                        code: '',
                        oldCode: ''
                    };

                if (_this.contextMenu.type == 'module') {

                    //模块重命名
                    obj.type = 'renameModule';
                    obj.dialogTitle = '模块重命名';
                    obj.name = _this.contextMenu.orgObj.name;
                    obj.oldName = _this.contextMenu.orgObj.name;
                    obj.chnname = _this.contextMenu.orgObj.chnname;

                } else if (_this.contextMenu.type == 'relationItem' && _this.contextMenu.relationIndex !== undefined) {

                    //关系图重命名
                    obj.type = 'renameRelation';
                    obj.dialogTitle = '关系图重命名';
                    obj.title = _this.contextMenu.orgObj.title;
                    obj.oldTitle = _this.contextMenu.orgObj.title;
                    obj.chnname = _this.contextMenu.orgObj.chnname;

                } else if (_this.contextMenu.type == 'other' && _this.contextMenu.entityIndex !== undefined) {

                    //数据表重命名
                    obj.type = 'renameEntity';
                    obj.dialogTitle = '数据表重命名';
                    obj.title = _this.contextMenu.orgObj.title;
                    obj.oldTitle = _this.contextMenu.orgObj.title;
                    obj.chnname = _this.contextMenu.orgObj.chnname;

                } else if (_this.contextMenu.type == 'other' && _this.contextMenu.dataTypeIndex !== undefined) {

                    //数据类型重命名
                    obj.type = 'renameDataType';
                    obj.dialogTitle = '数据类型重命名';
                    obj.name = _this.contextMenu.orgObj.name;
                    obj.oldName = _this.contextMenu.orgObj.name;
                    obj.code = _this.contextMenu.orgObj.code;
                    obj.oldCode = _this.contextMenu.orgObj.code;

                }

                _this.contextMenuDialog = obj;
            },

            //拷贝（模块、数据表、数据类型）
            doCopy () {
                let _this = this;

                _this.copyCache = deepClone(_this.contextMenu.orgObj);
                _this.pasteTarget = _this.contextMenu.pasteTarget;
            },

            //粘贴
            doPaste () {
                let _this = this,
                    obj = deepClone(_this.copyCache);

                switch (_this.pasteTarget) {
                    case 'project':
                        obj.name = `${obj.name}-副本(${new Date().valueOf()})`;
                        obj.entities.forEach((entity) => {
                            let time = new Date().valueOf();
                            entity.title = `${entity.title}-副本(${time})`;
                        });

                        _this.projectData.modules.push(obj);
                        _this.modulesTreeData.push({
                            label: obj.chnname ? `${obj.name}[${obj.chnname}]` : obj.name,
                            pasteTarget: 'project',
                            orgObj: obj,
                            nodeType: 1,
                            contextMenuType: 'module',
                            children: [
                                {
                                    label: '关系图',
                                    nodeType: 1,
                                    contextMenuType: 'relation',
                                    children: obj.relations.map((relation, relationIndex) => {
                                        return {
                                            label: relation.chnname ? `${relation.title}[${relation.chnname}]` : relation.title,
                                            pasteTarget: 'relation',
                                            orgObj: relation,
                                            moduleIndex: moduleIndex,
                                            relationIndex: relationIndex,
                                            nodeType: 2,
                                            contextMenuType: 'relationItem',
                                            children: []
                                        }
                                    })
                                },
                                {
                                    label: '数据表',
                                    nodeType: 1,
                                    contextMenuType: 'entity',
                                    children: obj.entities.map((entity, entityIndex) => {
                                        return {
                                            label: entity.chnname ? `${entity.title}[${entity.chnname}]` : entity.title,
                                            pasteTarget: 'entity',
                                            orgObj: entity,
                                            moduleIndex: moduleIndex,
                                            entityIndex: entityIndex,
                                            nodeType: 3,
                                            contextMenuType: 'other',
                                            children: []
                                        }
                                    })
                                }
                            ]
                        });
                        break;

                    case 'entity':
                        obj.title = `${obj.title}-副本(${new Date().valueOf()})`;
                        let moduleIndex = _this.contextMenu.moduleIndex;
                        _this.projectData.modules[moduleIndex].entities.push(obj);
                        _this.modulesTreeData[moduleIndex].children[1].children.push({
                            label: obj.title,
                            pasteTarget: 'entity',
                            orgObj: obj,
                            nodeType: 3,
                            contextMenuType: 'other',
                            children: []
                        });
                        break;

                    case 'dataType':
                        obj.name = `${obj.name}-副本(${new Date().valueOf()})`;
                        obj.code = `${obj.code}-copy(${new Date().valueOf()})`;
                        _this.projectData.dataTypeDomains.datatype.push(obj);
                        _this.dataConfigTreeData[0].children.push({
                            label: `${obj.name}[${obj.code}]`,
                            pasteTarget: 'dataType',
                            orgObj: obj,
                            nodeType: 4,
                            contextMenuType: 'other',
                            children: []
                        });
                        break;
                }
            },

            //删除（模块、数据表、数据类型）
            doDelete () {
                let _this = this,
                    moduleIndex = _this.contextMenu.moduleIndex,
                    relationIndex = _this.contextMenu.relationIndex,
                    entityIndex = _this.contextMenu.entityIndex,
                    dataTypeIndex = _this.contextMenu.dataTypeIndex,
                    filterFn = null,
                    count = 0;

                _this.$confirm('删除后将不可恢复，确定删除？', '提示', {
                    customClass: 'cm-confirm-box',
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {

                    if (moduleIndex !== undefined) {

                        if (relationIndex !== undefined) {

                            //删除关系图
                            _this.projectData.modules[moduleIndex].relations.splice(relationIndex, 1);
                            _this.modulesTreeData[moduleIndex].children[0].children.splice(relationIndex, 1);

                            //定义 tabWin 过滤函数，把需要关闭的 tabWin 从列表中过滤掉
                            filterFn = (item, index) => {
                                let flag = true;

                                if (
                                    item.type === 2 &&
                                    item.moduleIndex === moduleIndex &&
                                    item.relationIndex === relationIndex
                                ) {
                                    flag = false;
                                    if (_this.curTabIndex >= index && _this.curTabIndex - count > 0) {
                                        count++;
                                    }
                                } else {
                                    if (item.relationIndex > relationIndex) {
                                        item.relationIndex--;
                                    }
                                }

                                return flag;
                            };

                        } else if (entityIndex !== undefined) {

                            //移除关系图数据中与删除目标数据表相关的数据
                            let oldTitle = _this.projectData.modules[moduleIndex].entities[entityIndex].title;

                            _this.projectData.modules.forEach((module) => {

                                let delIdMap = {};

                                module.relations.forEach((relation) => {

                                    relation.graphCanvas.nodes = relation.graphCanvas.nodes.filter((item) => {
                                        if (item.title === oldTitle) {
                                            delIdMap[item.id] = true;
                                        }
                                        return item.title !== oldTitle;
                                    });

                                    relation.graphCanvas.edges = relation.graphCanvas.edges.filter((item) => {
                                        return !delIdMap[item.source] && !delIdMap[item.target];
                                    });

                                    relation.associations = relation.associations.filter((item) => {
                                        return item.from.entity !== oldTitle && item.to.entity !== oldTitle;
                                    });

                                });

                            });

                            //再删除数据表
                            _this.projectData.modules[moduleIndex].entities.splice(entityIndex, 1);
                            _this.modulesTreeData[moduleIndex].children[1].children.splice(entityIndex, 1);

                            //定义 tabWin 过滤函数，把需要关闭的 tabWin 从列表中过滤掉
                            filterFn = (item, index) => {
                                let flag = true;

                                if (
                                    item.type === 3 &&
                                    item.moduleIndex === moduleIndex &&
                                    item.entityIndex === entityIndex
                                ) {
                                    flag = false;
                                    if (_this.curTabIndex >= index && _this.curTabIndex - count > 0) {
                                        count++;
                                    }
                                } else {
                                    if (item.entityIndex > entityIndex) {
                                        item.entityIndex--;
                                    }
                                }

                                return flag;
                            };

                        } else {

                            //移除关系图数据中与删除目标模块相关的数据
                            let targetModule = _this.projectData.modules[moduleIndex],
                                oldModuleName = targetModule.name,
                                delTitleMap = {};

                            targetModule.entities.forEach((entity) => {
                                delTitleMap[entity.title] = true;
                            });

                            _this.projectData.modules.forEach((module) => {

                                let delIdMap = {};

                                module.relations.forEach((relation) => {

                                    relation.graphCanvas.nodes = relation.graphCanvas.nodes.filter((item) => {
                                        if (item.moduleName === oldModuleName) {
                                            delIdMap[item.id] = true;
                                            delTitleMap[item.title] = true;
                                        }
                                        return item.moduleName !== oldModuleName;
                                    });

                                    relation.graphCanvas.edges = relation.graphCanvas.edges.filter((item) => {
                                        return !delIdMap[item.source] && !delIdMap[item.target];
                                    });

                                    relation.associations = relation.associations.filter((item) => {
                                        return !delTitleMap[item.from.entity] && !delTitleMap[item.to.entity];
                                    });

                                });

                            });

                            //再删除模块
                            _this.projectData.modules.splice(moduleIndex, 1);
                            _this.modulesTreeData.splice(moduleIndex, 1);

                            //定义 tabWin 过滤函数，把需要关闭的 tabWin 从列表中过滤掉
                            filterFn = (item, index) => {
                                let flag = true;

                                if (
                                    (item.type === 2 || item.type === 3) &&
                                    item.moduleIndex === moduleIndex
                                ) {
                                    flag = false;
                                    if (_this.curTabIndex >= index && _this.curTabIndex - count > 0) {
                                        count++;
                                    }
                                } else {
                                    if (item.moduleIndex > moduleIndex) {
                                        item.moduleIndex--;
                                    }
                                }

                                return flag;
                            };

                        }

                    } else if (dataTypeIndex !== undefined) {

                        //删除数据类型
                        _this.projectData.dataTypeDomains.datatype.splice(dataTypeIndex, 1);
                        _this.dataConfigTreeData[0].children.splice(dataTypeIndex, 1);

                        //定义 tabWin 过滤函数，把需要关闭的 tabWin 从列表中过滤掉
                        filterFn = (item, index) => {
                            let flag = true;

                            if (
                                item.type === 4 &&
                                item.dataTypeIndex === dataTypeIndex
                            ) {
                                flag = false;
                                if (_this.curTabIndex >= index && _this.curTabIndex - count > 0) {
                                    count++;
                                }
                            } else {
                                if (item.dataTypeIndex > dataTypeIndex) {
                                    item.dataTypeIndex--;
                                }
                            }

                            return flag;
                        };

                    }

                    //关闭相关的 tabWin，然后刷新当前 tabWin
                    _this.tabWinList = _this.tabWinList.filter(filterFn);
                    _this.curTabIndex = _this.curTabIndex - count;
                    _this.refreshTabWin();
                }, () => {});
            },

            doCloseThis () {
                let _this = this;
                _this.closeTabWin(null, _this.contextMenu.tabIndex);
            },

            doCloseOther () {
                let _this = this,
                    targetTab = _this.tabWinList[_this.contextMenu.tabIndex],
                    refreshFlag = _this.curTabIndex != _this.contextMenu.tabIndex;

                _this.tabWinList = [targetTab];
                _this.curTabIndex = 0;

                if (refreshFlag) {
                    _this.refreshTabWin();
                }
            },

            doCloseAll () {
                this.tabWinList = [];
                this.curTabIndex = 0;
            },

            //提交信息（模块、关系图、数据表、数据类型 的 新建 与 重命名）
            handleDialogSubmit () {
                let _this = this,
                    type = _this.contextMenuDialog.type,
                    title = _this.contextMenuDialog.title,
                    oldTitle = _this.contextMenuDialog.oldTitle,
                    name = _this.contextMenuDialog.name,
                    oldName = _this.contextMenuDialog.oldName,
                    chnname = _this.contextMenuDialog.chnname,
                    code = _this.contextMenuDialog.code,
                    oldCode = _this.contextMenuDialog.oldCode,
                    moduleIndex = _this.contextMenuDialog.moduleIndex,
                    relationIndex = _this.contextMenuDialog.relationIndex,
                    entityIndex = _this.contextMenuDialog.entityIndex,
                    dataTypeIndex = _this.contextMenuDialog.dataTypeIndex,
                    dataBaseIndex = _this.contextMenuDialog.dataBaseIndex;

                try {

                    if (type == 'newModule') {

                        if (name == '') {
                            throw {message: '模块名不能为空'};
                        } else if (_this.projectData.modules.filter((module) => module.name == name).length > 0) {
                            throw {message: '模块名已存在，不能重复'};
                        }

                    } else if (type == 'newRelation') {

                        if (title == '') {
                            throw {message: '关系图编码不能为空'};
                        }

                        _this.projectData.modules.forEach((module) => {
                            module.relations.forEach((relation) => {
                                if (relation.title == title) {
                                    throw {message: '关系图编码已存在，不能重复'};
                                }
                            });
                        });

                    } else if (type == 'newEntity') {

                        if (title == '') {
                            throw {message: '表名不能为空'};
                        }

                        _this.projectData.modules.forEach((module) => {
                            module.entities.forEach((entity) => {
                                if (entity.title == title) {
                                    throw {message: '表名已存在，不能重复'};
                                }
                            });
                        });

                    } else if (type == 'newDataType') {

                        if (name == '') {
                            throw {message: '类型名称不能为空'};
                        } else if (_this.projectData.dataTypeDomains.datatype.filter((module) => module.name == name).length > 0) {
                            throw {message: '类型名称已存在，不能重复'};
                        }

                        if (code == '') {
                            throw {message: '类型名称不能为空'};
                        } else if (_this.projectData.dataTypeDomains.datatype.filter((module) => module.code == code).length > 0) {
                            throw {message: '类型名称已存在，不能重复'};
                        }

                    } else if (type == 'renameModule') {

                        if (name == '') {
                            throw {message: '模块名不能为空'};
                        } else if (
                            name != oldName &&
                            _this.projectData.modules.filter((module) => module.name == name).length > 0
                        ) {
                            throw {message: '模块名已存在，不能重复'};
                        }

                    } else if (type == 'renameEntity') {

                        if (title == '') {
                            throw {message: '表名不能为空'};
                        } else if (title != oldTitle) {
                            _this.projectData.modules.forEach((module) => {
                                module.entities.forEach((entity) => {
                                    if (entity.title == title) {
                                        throw {message: '表名已存在，不能重复'};
                                    }
                                });
                            });
                        }

                    } else if (type == 'renameDataType') {

                        if (name == '') {
                            throw {message: '类型名称不能为空'};
                        } else if (
                            name != oldName &&
                            _this.projectData.dataTypeDomains.datatype.filter((module) => module.name == name).length > 0
                        ) {
                            throw {message: '类型名称已存在，不能重复'};
                        }

                        if (code == '') {
                            throw {message: '类型名称不能为空'};
                        } else if (
                            code != oldCode &&
                            _this.projectData.dataTypeDomains.datatype.filter((module) => module.code == code).length > 0
                        ) {
                            throw {message: '类型名称已存在，不能重复'};
                        }

                    }

                } catch (err) {
                    _this.$message.error(err.message);
                    return;
                }

                let filterFn = null,
                    tabName = '';

                switch (type) {
                    case 'newModule':
                        let module = {
                            name: name,
                            chnname: chnname,
                            entities: [],
                            relations: []
                        };

                        _this.projectData.modules.push(module);
                        _this.modulesTreeData.push({
                            label: chnname ? `${name}[${chnname}]` : name,
                            pasteTarget: 'project',
                            orgObj: module,
                            nodeType: 1,
                            contextMenuType: 'module',
                            children: [
                                {
                                    label: '关系图',
                                    nodeType: 1,
                                    contextMenuType: 'relation',
                                    children: []
                                },
                                {
                                    label: '数据表',
                                    nodeType: 1,
                                    contextMenuType: 'entity',
                                    children: []
                                }
                            ]
                        });
                        break;

                    case 'newRelation':
                        let relation = {
                            title: title,
                            chnname: chnname,
                            graphCanvas: {
                                nodes: [],
                                edges: []
                            },
                            associations: []
                        };

                        _this.projectData.modules[moduleIndex].relations.push(relation);
                        _this.modulesTreeData[moduleIndex].children[0].children.push({
                            label: chnname ? `${title}[${chnname}]` : title,
                            pasteTarget: 'relation',
                            orgObj: relation,
                            nodeType: 2,
                            contextMenuType: 'relationItem',
                            children: []
                        });
                        break;

                    case 'newEntity':
                        let entity = {
                            title: title,
                            chnname: chnname,
                            remark: '',
                            fields: deepClone(defaultData.profile.defaultFields),
                            headers: deepClone(defaultData.profile.defaultHeaders),
                            indexs: []
                        };

                        _this.projectData.modules[moduleIndex].entities.push(entity);
                        _this.modulesTreeData[moduleIndex].children[1].children.push({
                            label: chnname ? `${title}[${chnname}]` : title,
                            pasteTarget: 'entity',
                            orgObj: entity,
                            nodeType: 3,
                            contextMenuType: 'other',
                            children: []
                        });
                        break;

                    case 'newDataType':
                        let dataType = {
                            name: name,
                            code: code
                        };
                        _this.projectData.dataTypeDomains.datatype.push(dataType);
                        _this.dataConfigTreeData[0].children.push({
                            label: `${name}[${code}]`,
                            pasteTarget: 'dataType',
                            orgObj: dataType,
                            nodeType: 4,
                            contextMenuType: 'other',
                            children: []
                        });
                        break;

                    case 'renameModule':
                        let oldModuleName = _this.projectData.modules[moduleIndex].name;

                        //再同步关系图数据
                        _this.projectData.modules.forEach((module) => {

                            module.relations.forEach((relation) => {

                                relation.graphCanvas.nodes.forEach((item) => {
                                    if (item.moduleName === oldModuleName) {
                                        item.moduleName = name;
                                    }
                                });

                            });

                        });

                        _this.projectData.modules[moduleIndex].name = name;
                        _this.projectData.modules[moduleIndex].chnname = chnname;
                        _this.modulesTreeData[moduleIndex].label = chnname ? `${name}[${chnname}]` : name;
                        _this.modulesTreeData[moduleIndex].orgObj = _this.projectData.modules[moduleIndex];
                        break;

                    case 'renameRelation':
                        _this.projectData.modules[moduleIndex].relations[relationIndex].title = title;
                        _this.projectData.modules[moduleIndex].relations[relationIndex].chnname = chnname;
                        _this.modulesTreeData[moduleIndex].children[0].children[relationIndex].label = chnname ? `${title}[${chnname}]` : title;
                        _this.modulesTreeData[moduleIndex].children[0].children[relationIndex].orgObj = _this.projectData.modules[moduleIndex].relations[relationIndex];

                        filterFn = (item, index) => {
                            return (
                                item.type === 2 &&
                                item.moduleIndex === moduleIndex &&
                                item.relationIndex === relationIndex
                            );
                        };
                        tabName = chnname ? `${title}[${chnname}]` : title;
                        break;

                    case 'renameEntity':
                        let oldEntityTitle = _this.projectData.modules[moduleIndex].entities[entityIndex].title;

                        //再同步关系图数据
                        _this.projectData.modules.forEach((module) => {

                            module.relations.forEach((relation) => {

                                relation.graphCanvas.nodes.forEach((item) => {
                                    if (item.title === oldEntityTitle) {
                                        item.title = title;
                                    }
                                });

                                relation.associations.forEach((item) => {
                                    if (item.from.entity === oldEntityTitle) {
                                        item.from.entity = title;
                                    } else if (item.to.entity === oldEntityTitle) {
                                        item.to.entity = title;
                                    }
                                });

                            });

                        });

                        _this.projectData.modules[moduleIndex].entities[entityIndex].title = title;
                        _this.projectData.modules[moduleIndex].entities[entityIndex].chnname = chnname;
                        _this.modulesTreeData[moduleIndex].children[1].children[entityIndex].label = chnname ? `${title}[${chnname}]` : title;
                        _this.modulesTreeData[moduleIndex].children[1].children[entityIndex].orgObj = _this.projectData.modules[moduleIndex].entities[entityIndex];

                        filterFn = (item, index) => {
                            return (
                                item.type === 3 &&
                                item.moduleIndex === moduleIndex &&
                                item.entityIndex === entityIndex
                            );
                        };
                        tabName = chnname ? `${title}[${chnname}]` : title;
                        break;

                    case 'renameDataType':
                        _this.projectData.dataTypeDomains.datatype[dataTypeIndex].name = name;
                        _this.projectData.dataTypeDomains.datatype[dataTypeIndex].code = code;
                        _this.dataConfigTreeData[0].children[dataTypeIndex].label = `${name}[${code}]`;
                        _this.dataConfigTreeData[0].children[dataTypeIndex].orgObj = _this.projectData.dataTypeDomains.datatype[dataTypeIndex];

                        filterFn = (item, index) => {
                            return (
                                item.type === 4 &&
                                item.dataTypeIndex === dataTypeIndex
                            );
                        };
                        tabName = `${name}[${code}]`;
                        break;
                }

                if (type == 'renameRelation' ||
                    type == 'renameEntity' ||
                    type == 'renameDataType')
                {
                    let renameTab = _this.tabWinList.filter(filterFn)[0];
                    if (renameTab) {
                        renameTab.tabName = tabName;
                    }

                    _this.changeList = checkVersionData(_this.projectData, _this.compareData);
                    _this.refreshTabWin();
                }

                _this.closeDialog();
            },

            openSaveAsDialog () {
                let _this = this;
                _this.elDialog.projectName = '';
                _this.elDialog.projectDir = path.dirname(_this.projectPath);
                _this.elDialog.visible = true;
            },
            openSettingDialog () {
                let _this = this;
                _this.settingDialog.rdsName = _this.projectData.source ? _this.projectData.source.rdsName : '';
                _this.settingDialog.databaseName = _this.projectData.source ? _this.projectData.source.databaseName: '';
                _this.settingDialog.visible = true;
            },
            openVersionDialog () {
                let _this = this,
                    vCodeA = 1,
                    vCodeB = 0,
                    vCodeC = 0,
                    verNum = 0;

                _this.projectVersionList.forEach((versionName) => {
                    let num = versionName.replace('v', '').replace(/\./g, '') * 1;
                    if (verNum < num) {
                        verNum = num;
                        let arr = versionName.replace('v', '').split('.');
                        vCodeA = arr[0] * 1;
                        vCodeB = arr[1] * 1;
                        vCodeC = arr[2] * 1 + 1;
                    }
                });

                _this.versionDialog.vCodeA = vCodeA;
                _this.versionDialog.vCodeB = vCodeB;
                _this.versionDialog.vCodeC = vCodeC;
                _this.versionDialog.description = '';
                _this.versionDialog.visible = true;
            },

            //关闭弹窗
            closeDialog () {
                let _this = this;
                _this.contextMenuDialog.visible = false;
                _this.elDialog.visible = false;
                _this.versionDialog.visible = false;
                _this.settingDialog.visible = false;
            },

            handleOpenSysDialog () {
                let _this = this;

                dialog.showOpenDialog({
                    title: '请选择项目保存目录',
                    properties: ['openDirectory'],
                    buttonLabel: '确定'
                }, (result) => {
                    if (result) {
                        _this.elDialog.projectDir = result[0];
                    }
                });
            },

            handleProjectSaveAs () {
                let _this = this;

                if (_this.elDialog.projectName === '') {
                    _this.$message.error('项目名称不能为空');
                    return;
                }

                if (_this.elDialog.projectDir === '') {
                    _this.$message.error('项目名称不能为空');
                    return;
                }

                let projectPath = path.join(_this.elDialog.projectDir, _this.elDialog.projectName + '.json');

                if ( fileExist(projectPath) ) {
                    _this.$message.error('创建项目失败，该项目已经存在了！');
                    return;
                }

                // 更新历史记录
                saveFilePromise({
                    modules: [],
                    dataTypeDomains: deepClone(defaultData.profile.defaultDataTypeDomains),
                }, projectPath).then(() => {
                    _this.$message.success('另存项目成功');
                    _this.closeDialog();
                });
            },

            handleUpdateSource () {
                let _this = this;

                if (_this.settingDialog.rdsName === '') {
                    _this.$message.error('实例名称不能为空');
                    return;
                }

                if (_this.settingDialog.databaseName === '') {
                    _this.$message.error('数据库名不能为空');
                    return;
                }

                _this.projectData.source = {
                    rdsName: _this.settingDialog.rdsName,
                    databaseName: _this.settingDialog.databaseName
                };
                _this.closeDialog();
            },

            openCompareTabWin (newVerCode, oldVerCode) {
                let _this = this;
                if (newVerCode !== undefined && oldVerCode !== undefined) {
                    _this.openTabWin({
                        type: 6,
                        newVerCode: newVerCode,
                        oldVerCode: oldVerCode
                    });
                } else {
                    _this.openTabWin({
                        type: 7
                    });
                }
            },
            //打开 tab 和 编辑窗（关系图、数据表、数据类型、数据库、版本变更详情、版本对比）
            openTabWin (opts) {
                let _this = this,
                    tabWin = null,
                    tabName = '',
                    curData = null,
                    existIndex = -1;

                _this.beforeTabWinChange();

                _this.tabWinList.forEach((item, index) => {
                    if (

                        //关系图、数据表、数据类型、数据库 相关判断
                        (item.type < 6 &&
                        item.type === opts.type &&
                        item.moduleIndex === opts.moduleIndex &&
                        item.relationIndex === opts.relationIndex &&
                        item.entityIndex === opts.entityIndex &&
                        item.dataTypeIndex === opts.dataTypeIndex &&
                        item.dataBaseIndex === opts.dataBaseIndex) ||

                        //版本变更详情、版本对比 相关判断
                        ((item.type == 6 || item.type == 7) &&
                        item.type === opts.type &&
                        item.newVerCode === opts.newVerCode &&
                        item.oldVerCode === opts.oldVerCode)

                    ) {
                        existIndex = index;
                    }
                });

                if (existIndex !== -1) {
                    _this.curTabIndex = existIndex;
                    _this.refreshTabWin();
                    return;
                }

                switch (opts.type) {
                    case 2:
                        //关系图
                        curData = _this.projectData.modules[opts.moduleIndex].relations[opts.relationIndex];
                        tabName = curData.chnname ? `${curData.title}[${curData.chnname}]` : curData.title;
                        break;

                    case 3:
                        //数据表
                        curData = _this.projectData.modules[opts.moduleIndex].entities[opts.entityIndex];
                        tabName = curData.chnname ? `${curData.title}[${curData.chnname}]` : curData.title;
                        break;

                    case 4:
                        //数据类型
                        curData = _this.projectData.dataTypeDomains.datatype[opts.dataTypeIndex];
                        tabName = `${curData.name}[${curData.code}]`;
                        break;

                    case 5:
                        //数据库
                        curData = _this.projectData.dataTypeDomains.database[opts.dataBaseIndex];
                        tabName = curData.code;
                        break;

                    case 6:
                        //查看版本变更详情
                        tabName = `${opts.oldVerCode} ~ ${opts.newVerCode} 变更`;
                        break;

                    case 7:
                        //版本对比
                        tabName ='版本对比';
                        break;
                }

                tabWin = {
                    tabName: tabName,
                    type: opts.type,
                    moduleIndex: opts.moduleIndex,
                    relationIndex: opts.relationIndex,
                    entityIndex: opts.entityIndex,
                    dataTypeIndex: opts.dataTypeIndex,
                    dataBaseIndex: opts.dataBaseIndex,
                    newVerCode: opts.newVerCode,
                    oldVerCode: opts.oldVerCode
                };
                _this.tabWinList.push(tabWin);

                if (_this.tabWinList.length > 10) {
                    //tab 最多不超过 10 个，超过就移除最先打开的一个
                    _this.tabWinList.shift();
                }

                //然后再切换到新窗口
                _this.curTabIndex = _this.tabWinList.length - 1;

                _this.$nextTick(() => {
                    if (opts.type == 2) {
                        _this.$refs[`tabWin-${_this.tabWinList.length - 1}`][0].setMatrix(tabWin.matrix);
                    } else if (opts.type == 3) {
                        _this.$refs[`tabWin-${_this.tabWinList.length - 1}`][0].setCurTab();
                    } else if (opts.type == 6 || opts.type == 7) {
                        _this.$refs[`tabWin-${_this.tabWinList.length - 1}`][0].init();
                    }
                    _this.$refs.scrollCont.scrollTop = 0;
                });
            },
            //关闭 tab 和 编辑窗（关系图、数据表、数据类型、数据库）
            closeTabWin (e, index) {
                e && e.stopPropagation();
                let _this = this;

                _this.tabWinList.splice(index, 1);

                if (_this.curTabIndex >= index && _this.curTabIndex != 0) {
                    _this.curTabIndex--;
                }

                _this.refreshTabWin();
            },
            handleCurTabWin (index) {
                let _this = this;

                _this.beforeTabWinChange();
                _this.curTabIndex = index;
                _this.refreshTabWin();
            },
            //切换到新窗口前的一系列处理逻辑
            beforeTabWinChange () {
                let _this = this,
                    curTab = _this.tabWinList[_this.curTabIndex];

                if (!curTab) {
                    return;
                }

                let targetWin = _this.$refs[`tabWin-${_this.curTabIndex}`][0];

                if (curTab.type == 2) {
                    //当前窗口是关系图，如果是的话，先获取当前关系图的位置，缩放比例等信息缓存起来
                    _this.$set(curTab, 'matrix', targetWin.getMatrix());
                } else if (curTab.type == 6 || curTab.type == 7) {
                    //当前窗口是 版本变更详情 或 版本对比，缓存版本对比信息
                    _this.$set(curTab, 'winData', deepClone(targetWin.getData()));
                }
            },
            //刷新当前页签对应编辑窗
            refreshTabWin () {
                let _this = this,
                    activeTab = _this.tabWinList[_this.curTabIndex];

                if (!activeTab) {
                    return;
                }

                _this.$nextTick(() => {
                    if (activeTab.type == 2) {
                        _this.$refs[`tabWin-${_this.curTabIndex}`][0].setMatrix(activeTab.matrix);
                    } else if (activeTab.type == 3) {
                        _this.$refs[`tabWin-${_this.curTabIndex}`][0].setCurTab();
                    } else if (activeTab.type == 6 || activeTab.type == 7) {
                        _this.$refs[`tabWin-${_this.curTabIndex}`][0].setData(activeTab.winData);
                    }
                });
            },

            handleCopyTable (moduleIndex, entityData) {
                let _this = this,
                    entity = deepClone(entityData);

                _this.projectData.modules[moduleIndex].entities.push(entity);
                _this.modulesTreeData[moduleIndex].children[1].children.push({
                    label: entity.chnname ? `${entity.title}[${entity.chnname}]` : entity.title,
                    pasteTarget: 'entity',
                    orgObj: entity,
                    nodeType: 3,
                    contextMenuType: 'other',
                    children: []
                });
            },
            handleDblClickTable (moduleIndex, entityIndex) {
                this.openTabWin({
                    type: 3,
                    moduleIndex: moduleIndex,
                    relationIndex: undefined,
                    entityIndex: entityIndex,
                    dataTypeIndex: undefined,
                    dataBaseIndex: undefined
                });
                //取消文字选中（双击数据表来打开 tabWin，会出现 tabWin 内的文字都被选中的情况，所以添加下面的脚本）
                window.getSelection().removeAllRanges();
            },
            //删除字段 或者 设置字段在关系图中显隐 后触发的回调函数
            handleFieldVisibleChange (fieldIndex, tableTitle, fieldName) {
                let _this = this;

                _this.projectData.modules.forEach((module) => {

                    let idMap = {};

                    module.relations.forEach((relation) => {

                        relation.graphCanvas.nodes.forEach((item) => {
                            if (item.title === tableTitle) {
                                idMap[item.id] = true;
                            }
                        });

                        relation.graphCanvas.edges = relation.graphCanvas.edges.filter((item) => {
                            return !idMap[item.source] && !idMap[item.target];
                        });

                        relation.associations = relation.associations.filter((item) => {
                            return (item.from.entity !== tableTitle || item.from.field !== fieldName) && (item.to.entity !== tableTitle || item.to.field !== fieldName);
                        });

                    });
                });
            },
            //字段调序 后触发的回调函数
            handleFieldSortChange (oldFieldIndex, newFieldIndex, tableTitle) {
                let _this = this;

                _this.projectData.modules.forEach((module) => {

                    let idMap = {};

                    module.relations.forEach((relation) => {

                        relation.graphCanvas.nodes.forEach((item) => {
                            if (item.title === tableTitle) {
                                idMap[item.id] = true;
                            }
                        });

                        relation.graphCanvas.edges.forEach((item) => {
                            if (idMap[item.source]) {
                                if ((item.sourceAnchor == oldFieldIndex * 2) || (item.sourceAnchor == oldFieldIndex * 2 + 1)) {
                                    item.sourceAnchor = (newFieldIndex * 2) + (item.sourceAnchor % 2);
                                } else if ((item.sourceAnchor == newFieldIndex * 2) || (item.sourceAnchor == newFieldIndex * 2 + 1)) {
                                    item.sourceAnchor = (oldFieldIndex * 2) + (item.sourceAnchor % 2);
                                }
                            }

                            if (idMap[item.target]) {
                                if ((item.targetAnchor == oldFieldIndex * 2) || (item.targetAnchor == oldFieldIndex * 2 + 1)) {
                                    item.targetAnchor = (newFieldIndex * 2) + (item.targetAnchor % 2);
                                } else if ((item.targetAnchor == newFieldIndex * 2) || (item.targetAnchor == newFieldIndex * 2 + 1)) {
                                    item.targetAnchor = (oldFieldIndex * 2) + (item.targetAnchor % 2);
                                }
                            }
                        });

                    });

                });
            },
            handleEntityTabChange (curTab) {
                this.tabWinList[this.curTabIndex].lastTab = curTab;
            },
            handleDefaultDbChange (code, value) {
                let _this = this;

                //默认数据库只能存在一个，且必须存在一个
                if (value) {
                    //选中
                    _this.projectData.dataTypeDomains.database.forEach((item, index) => {
                        if (item.code == code) {
                            item.defaultDatabase = true;
                        } else {
                            item.defaultDatabase = false;
                        }
                    });
                }
            },

            handleDragStart (e, data, node) {
                let _this = this,
                    moduleIndex = _this.projectData.modules.findIndex((item) => {
                        return item.name === node.parent.parent.data.orgObj.name;
                    }),
                    entityIndex = _this.projectData.modules[moduleIndex].entities.findIndex((item) => {
                        return item.title === data.orgObj.title;
                    });

                e.dataTransfer.setData('text/plain', `${moduleIndex}@${entityIndex}`);
            },
            handleDragOver (e, data, node) {
                e.preventDefault();
                if (data.label == '数据表') {
                    e.dataTransfer.dropEffect = 'move';
                } else {
                    e.dataTransfer.dropEffect = 'none';
                }
            },
            handleDrop (e, data, node) {
                e.preventDefault();

                let _this = this,
                    arr = e.dataTransfer.getData('text/plain').split('@'),
                    sourceModuleIndex = arr[0],
                    sourceEntityIndex = arr[1],
                    targetModuleIndex = _this.projectData.modules.findIndex((item) => {
                        return item.name === node.parent.data.orgObj.name;
                    });

                if (sourceModuleIndex != targetModuleIndex) {
                    let sourceEntity = _this.projectData.modules[sourceModuleIndex].entities.splice(sourceEntityIndex, 1)[0];
                    _this.projectData.modules[targetModuleIndex].entities.push(deepClone(sourceEntity));

                    _this.projectData.modules.forEach((module) => {

                        module.relations.forEach((relation) => {

                            relation.graphCanvas.nodes.forEach((item) => {
                                if (item.title == sourceEntity.title) {
                                    item.moduleName = _this.projectData.modules[targetModuleIndex].name;
                                }
                            });

                        });

                    });

                    let sourceTreeItem = _this.modulesTreeData[sourceModuleIndex].children[1].children.splice(sourceEntityIndex, 1)[0];
                    _this.modulesTreeData[targetModuleIndex].children[1].children.push(deepClone(sourceTreeItem));

                    _this.tabWinList.forEach((item) => {
                        if (item.type == 3 && item.moduleIndex == sourceModuleIndex && item.entityIndex == sourceEntityIndex) {
                            //更新页签对象信息
                            item.moduleIndex = targetModuleIndex;
                        }
                    });

                    _this.refreshTabWin();
                }
            },

            //保存内容
            handleSave () {
                let _this = this;
                saveFileSync(_this.projectData, _this.projectPath);
                _this.changeList = checkVersionData(_this.projectData, _this.compareData);
                _this.$message.success('保存成功');
            },

            getVersionList () {
                let versionDir = this.projectPath.replace('json', 'version');
                ensureDirectoryExistence(versionDir);
                this.projectVersionList = getFilesByDirSync(versionDir).map((fileName) => {
                    return fileName.replace('.json', '');
                });
            },
            //对比版本切换回调
            handleCompareVersionChange () {
                let _this = this;

                if (_this.compareVersion == '@curProjectCache@') {
                    _this.$store.commit('setCompareData', _this.$store.state.project.projectData);
                    _this.changeList = checkVersionData(_this.projectData, _this.compareData);
                } else {
                    let versionPath = path.join(_this.projectPath.replace('json', 'version'), _this.compareVersion + '.json');

                    readFilePromise(versionPath).then((result) => {
                        // 过滤已经存在的历史记录
                        _this.$store.commit('setCompareData', result);
                        _this.changeList = checkVersionData(_this.projectData, _this.compareData);
                    }).catch((e) => {
                        dialog.showErrorBox('获取版本数据失败！', JSON.stringify(e));
                    });
                }
            },
            //保存新版本
            handleSaveVersion () {
                let _this = this;

                try {
                    if (_this.versionDialog.vCodeA === '') {
                        throw {message: '版本号的第一个数字不能为空'};
                    } else if (isNaN(_this.versionDialog.vCodeA * 1)) {
                        throw {message: '版本号的第一个数字输入内容格式有误'};
                    } else if (_this.versionDialog.vCodeA * 1 < 0 || _this.versionDialog.vCodeA.toString().indexOf('.') != -1) {
                        throw {message: '版本号的第一个数字只能输入整数'};
                    }

                    if (_this.versionDialog.vCodeB === '') {
                        throw {message: '版本号的第二个数字不能为空'};
                    } else if (isNaN(_this.versionDialog.vCodeB * 1)) {
                        throw {message: '版本号的第二个数字输入内容格式有误'};
                    } else if (_this.versionDialog.vCodeB * 1 < 0 || _this.versionDialog.vCodeB.toString().indexOf('.') != -1) {
                        throw {message: '版本号的第二个数字只能输入整数'};
                    }

                    if (_this.versionDialog.vCodeC === '') {
                        throw {message: '版本号的第三个数字不能为空'};
                    } else if (isNaN(_this.versionDialog.vCodeC * 1)) {
                        throw {message: '版本号的第三个数字输入内容格式有误'};
                    } else if (_this.versionDialog.vCodeC * 1 < 0 || _this.versionDialog.vCodeC.toString().indexOf('.') != -1) {
                        throw {message: '版本号的第三个数字只能输入整数'};
                    }

                    let verNum = [_this.versionDialog.vCodeA * 1, _this.versionDialog.vCodeB * 1, _this.versionDialog.vCodeC * 1].join('') * 1;

                    _this.projectVersionList.forEach((versionName) => {
                        let num = versionName.replace('v', '').replace(/\./g, '') * 1;
                        if (verNum == num) {
                            throw {message: '此版本号已存在，不可用使用重复的版本号'};
                        } else if (verNum < num) {
                            throw {message: '版本号不可小于已有版本号'};
                        }
                    });
                } catch (err) {
                    _this.$message.error(err.message);
                    return;
                }

                let verName = 'v' + [_this.versionDialog.vCodeA * 1, _this.versionDialog.vCodeB * 1, _this.versionDialog.vCodeC * 1].join('.'),versionPath = path.join(_this.projectPath.replace('json', 'version'), verName + '.json');

                _this.handleSave();

                saveFileSync(Object.assign({
                    date: new Date().format('yyyy-MM-dd HH:mm:ss'),
                    description: _this.versionDialog.description
                }, _this.projectData), versionPath);

                _this.$message.success('生成版本成功');
                _this.getVersionList();
                _this.closeDialog();
            }
        },
        created () {
            let _this = this,
                modulesTreeData = [],
                dataConfigTreeData = [];

            if (!_this.$store.state.project.projectData) {
                _this.handleBackToHome();
                return;
            }

            //直接用赋值的方式获取，因为不需要与 state 同步，state 只是用来缓存数据的
            _this.projectName = _this.$store.state.project.projectName;
            _this.projectData = deepClone(_this.$store.state.project.projectData);

            if (!_this.projectData) {
                return;
            }

            _this.projectData.modules.forEach((module) => {
                let item = {
                    label: module.chnname ? `${module.name}[${module.chnname}]` : module.name,
                    pasteTarget: 'project',
                    orgObj: module,
                    nodeType: 1,
                    contextMenuType: 'module',
                    children: [
                        {
                            label: '关系图',
                            nodeType: 1,
                            contextMenuType: 'relation',
                            children: module.relations.map((relation) => {
                                return {
                                    label: relation.chnname ? `${relation.title}[${relation.chnname}]` : relation.title,
                                    pasteTarget: 'relation',
                                    orgObj: relation,
                                    nodeType: 2,
                                    contextMenuType: 'relationItem',
                                    children: []
                                };
                            })
                        },
                        {
                            label: '数据表',
                            nodeType: 1,
                            contextMenuType: 'entity',
                            children: module.entities.map((entity) => {
                                return {
                                    label: entity.chnname ? `${entity.title}[${entity.chnname}]` : entity.title,
                                    pasteTarget: 'entity',
                                    orgObj: entity,
                                    nodeType: 3,
                                    contextMenuType: 'other',
                                    children: []
                                };
                            })
                        }
                    ]
                };

                modulesTreeData.push(item);
            });
            _this.modulesTreeData = modulesTreeData;

            dataConfigTreeData = [
                {
                    label: '数据类型',
                    nodeType: 1,
                    contextMenuType: 'dataType',
                    children: _this.projectData.dataTypeDomains.datatype.map((item) => {
                        return {
                            label: `${item.name}[${item.code}]`,
                            pasteTarget: 'dataType',
                            orgObj: item,
                            nodeType: 4,
                            contextMenuType: 'other',
                            children: []
                        }
                    })
                },
                {
                    label: '数据库',
                    nodeType: 1,
                    contextMenuType: 'dataBase',
                    children: _this.projectData.dataTypeDomains.database.map((item) => {
                        return {
                            label: item.code,
                            pasteTarget: 'dataBase',
                            orgObj: item,
                            nodeType: 5,
                            contextMenuType: 'dataBaseItem',
                            children: []
                        }
                    })
                }
            ];
            _this.dataConfigTreeData = dataConfigTreeData;

            document.onkeydown = (e) => {
                if (e.ctrlKey || e.metaKey) {
                    if (e.code === 'KeyS') {
                        // 保存全部 tab 的修改
                        _this.handleSave();
                    } else if(e.code === 'KeyE') {
                        // 关闭当前打开的 tab
                        _this.tabWinList.length > 0 && _this.closeTabWin(e, _this.curTabIndex);
                    }
                }

                if (e.altKey && e.metaKey && e.code === 'KeyI') {
                    ipcRenderer.sendSync('windowOrder', 'openDevTools');
                }

                if (e.code === 'F12') {
                    ipcRenderer.sendSync('windowOrder', 'openDevTools');
                }
            };

            document.onmousedown = (e) => {
                if (e.target.className == 'resize') {
                    _this.resizeFlag = true;
                }
            };

            document.onmousemove = (e) => {
                if (_this.resizeFlag) {
                    let x = e.clientX;
                    _this.sideBarWidth = Math.min(Math.max(x, 230), 600) + 'px';
                }
            };

            document.onmouseup = (e) => {
                if (_this.resizeFlag && _this.tabWinList.length > 0 && _this.tabWinList[_this.curTabIndex].type == 2) {
                    _this.$refs[`tabWin-${_this.curTabIndex}`][0].changeNetSize();
                }
                _this.resizeFlag = false;
            };

            _this.getVersionList();

            window.vm = this;
        },
        destroyed () {
            document.onmousedown = null;
            document.onmousemove = null;
            document.onmouseup = null;
        }
    };
</script>

<style>
    @import url('./main.css');
</style>
