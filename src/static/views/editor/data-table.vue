<template>
    <div class="tab-win-cont"
         v-if="curDataTable">
        <p class="title">{{curDataTable.chnname ? `${curDataTable.title}[${curDataTable.chnname}]` : curDataTable.title}} - 数据表详情</p>

        <el-radio-group v-model="curTab">
            <el-radio-button :label="1">基本信息</el-radio-button>
            <el-radio-button :label="2">字段信息</el-radio-button>
            <el-radio-button :label="3">索引信息</el-radio-button>
            <el-radio-button :label="4">代码信息</el-radio-button>
        </el-radio-group>

        <!--基本信息-->
        <div v-if="curTab == 1" class="table-wrap mt10px">
            <table class="table">
                <tr>
                    <td width="1"
                        class="pl20px pb15px text-right">
                        表名：
                    </td>
                    <td class="pl5px pb20px pr20px">
                        {{curDataTable.chnname ? `${curDataTable.title}[${curDataTable.chnname}]` : curDataTable.title}}
                    </td>
                </tr>
                <tr>
                    <td width="1"
                        valign="top"
                        class="pl20px pb20px text-right">
                        <span class="lh30px">备注：</span>
                    </td>
                    <td class="pl5px pb20px pr20px">
                        <el-input
                            type="textarea"
                            v-model.trim="curDataTable.remark"
                            :rows="6"
                            placeholder="请输入备注信息"
                            style="width: 98%;"
                            @input="handleChange">
                        </el-input>
                    </td>
                </tr>
            </table>
        </div>

        <!--字段信息-->
        <el-table
            v-if="curTab == 2 && fieldsTableInitFlag"
            class="field-table mt10px"
            :data="curDataTable.fields"
            border>
            <el-table-column
                label="调序"
                align="center"
                width="70">
                <template slot-scope="scope">
                    <el-button
                        type="text"
                        icon="el-icon-arrow-up"
                        :disabled="scope.$index == 0"
                        @click="handleToFront(curDataTable.fields, scope.$index, scope.$index == 0)">
                    </el-button>

                    <el-button
                        type="text"
                        icon="el-icon-arrow-down"
                        :disabled="scope.$index >= curDataTable.fields.length - 1"
                        @click="handleToBehind(curDataTable.fields, scope.$index, scope.$index >= curDataTable.fields.length - 1)">
                    </el-button>
                </template>
            </el-table-column>

            <el-table-column
                v-for="(item, index) in curDataTable.headers"
                :key="'tb-col-' + index"
                align="center"
                :min-width="fieldConfig[item.fieldName].width">
                <template slot="header" slot-scope="scope">
                    <div class="custom-table-header">
                        <span class="f14px fBold">{{fieldConfig[item.fieldName].label}}</span>
                        <i class="icon-font"
                           v-if="refreshFlag && item.fieldName != 'defaultValue' && item.fieldName != 'relationNoShow'"
                           :class="{'icon-kejian': item.relationNoShow, 'icon-bukejian': !item.relationNoShow}"
                           @click="toggleRelationNoShow(item)">
                        </i>
                    </div>
                </template>

                <template slot-scope="scope">
                    <template v-if="fieldConfig[item.fieldName].tplType == 1">
                        <el-input
                            v-model.trim="scope.row[item.fieldName]"
                            :placeholder="`请输入${fieldConfig[item.fieldName].label}`"
                            style="width: 100%;"
                            @input="handleChange">
                        </el-input>
                    </template>

                    <template v-if="fieldConfig[item.fieldName].tplType == 2">
                        <el-select
                            v-if="curTab == 2 && refreshFlag"
                            v-model="scope.row[item.fieldName]"
                            :placeholder="`请选择${fieldConfig[item.fieldName].label}`"
                            style="width: 100%;"
                            @change="handleChange">
                            <el-option
                                v-for="item in dataTypeList"
                                :key="item.code"
                                :value="item.code"
                                :label="item.name">
                            </el-option>
                        </el-select>
                    </template>

                    <template v-if="fieldConfig[item.fieldName].tplType == 3">
                        <div class="h30px lh30px"
                             style="background-color: #f5f5f5;">
                            {{dataTypeMap[scope.row.type]}}
                        </div>
                    </template>

                    <template v-if="fieldConfig[item.fieldName].tplType == 4">
                        <el-checkbox
                            v-model="scope.row[item.fieldName]"
                            @change="handleCheckBoxChange(item.fieldName, scope.row)">
                        </el-checkbox>
                    </template>

                    <template v-if="fieldConfig[item.fieldName].tplType == 5">
                        <div class="custom-table-btn-wrap lh30px">
                            <i class="icon-font"
                               :class="{'icon-kejian': scope.row.relationNoShow, 'icon-bukejian': !scope.row.relationNoShow}"
                               @click="toggleRelationNoShow(scope.row)">
                            </i>
                        </div>
                    </template>
                </template>
            </el-table-column>

            <el-table-column
                label="删除"
                align="center"
                fixed="right"
                width="60">
                <template slot-scope="scope">
                    <el-button
                        type="text"
                        icon="el-icon-delete"
                        @click="delField(scope.$index)">
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-button
            v-show="curTab == 2"
            class="mt5px"
            @click="addField($event)">
            新增字段
        </el-button>

        <!--索引信息-->
        <el-table
            v-if="curTab == 3"
            class="field-table mt10px"
            :data="curDataTable.indexs"
            border>
            <el-table-column
                label="调序"
                align="center"
                width="70">
                <template slot-scope="scope">
                    <el-button
                        type="text"
                        icon="el-icon-arrow-up"
                        :disabled="scope.$index == 0"
                        @click="handleToFront(curDataTable.indexs, scope.$index, scope.$index == 0)">
                    </el-button>

                    <el-button
                        type="text"
                        icon="el-icon-arrow-down"
                        :disabled="scope.$index >= curDataTable.indexs.length - 1"
                        @click="handleToBehind(curDataTable.indexs, scope.$index, scope.$index >= curDataTable.indexs.length - 1)">
                    </el-button>
                </template>
            </el-table-column>

            <el-table-column
                label="索引名"
                align="center"
                width="200">
                <template slot-scope="scope">
                    <el-input
                        v-model.trim="scope.row.name"
                        :placeholder="请输入索引名"
                        style="width: 100%;"
                        @input="handleChange">
                    </el-input>
                </template>
            </el-table-column>

            <el-table-column
                label="是否唯一"
                align="center"
                width="120">
                <template slot-scope="scope">
                    <el-checkbox
                        v-model="scope.row.isUnique"
                        @change="handleChange">
                    </el-checkbox>
                </template>
            </el-table-column>

            <el-table-column
                label="索引字段"
                align="center">
                <template slot-scope="scope">
                    <el-select
                        v-if="curTab == 3 && refreshFlag"
                        multiple
                        filterable
                        v-model="scope.row.fields"
                        :placeholder="请选择索引字段"
                        style="width: 100%;"
                        @change="handleChange">
                        <el-option
                            v-for="item in curDataTable.fields"
                            :key="item.name"
                            :value="item.name"
                            :label="item.chnname">
                        </el-option>
                    </el-select>
                </template>
            </el-table-column>

            <el-table-column
                label="删除"
                align="center"
                fixed="right"
                width="60">
                <template slot-scope="scope">
                    <el-button
                        type="text"
                        icon="el-icon-delete"
                        @click="delIndex(scope.$index)">
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-button
            v-if="curTab == 3"
            class="mt5px"
            @click="addIndex($event)">
            新增索引
        </el-button>

        <!--代码信息-->
        <div v-if="curTab == 4" class="table-wrap mt10px">
            <table class="table">
                <tr>
                    <td width="1"
                        class="pl20px pb15px text-right">
                        数据库：
                    </td>
                    <td class="pl5px pb15px pr20px">
                        <el-select
                            v-model="curDataBaseIndex"
                            @change="showCode">
                            <el-option
                                v-for="(item, index) in dataBaseList"
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
                        class="pl20px pb20px text-right">
                        <span class="lh30px">代码脚本：</span>
                    </td>
                    <td class="pl5px pb20px pr20px data-base-code">
                        <el-tabs
                            v-model="curCodeType"
                            type="card"
                            @tab-click="showCode">
                            <el-tab-pane
                                v-for="(name, key) in codeTypeMap"
                                :label="name"
                                :name="key"
                                :key="key">
                            </el-tab-pane>
                        </el-tabs>
                        <div class="editor-wrap">
                            <pre ref="code" v-if="codeFlag" language="SQL" class="pre">{{curCode}}</pre>
                        </div>

                        <span class="cm-text-red lh30px"
                              v-if="curCodeType == 'createTableTemplate' || curCodeType == 'deleteTableTemplate' || curCodeType == 'createIndexTemplate'">
                            该脚本为全量脚本
                        </span>
                        <span class="cm-text-blue lh30px"
                              v-else>
                            该脚本为差异化脚本
                        </span>
                    </td>
                </tr>
            </table>
        </div>

        <br><br>
    </div>
</template>

<script>
    import hljs from 'highlight.js';
    import { getCodeByDataTable } from './../../js/utils/json2code';
    import deepClone from './../../js/utils/deep-clone';

    module.exports = {
        replace: true,
        props: ['projectData', 'curModule', 'changeList', 'lastTab'],
        data () {
            return {
                curDataTable: null,
                initFlag: false,
                fieldsTableInitFlag: false,
                hasChange: false,
                refreshFlag: false,

                curTab: 1,
                curDataBaseIndex: '',
                curCodeType: 'createTableTemplate',
                curCode: '',
                codeFlag: false,

                fieldConfig: {
                    chnname: {
                        label: '名称',
                        width: 160,
                        tplType: 1,
                        defaultValue: ''
                    },
                    name: {
                        label: '代码',
                        width: 160,
                        tplType: 1,
                        defaultValue: ''
                    },
                    type: {
                        label: '类型',
                        width: 160,
                        tplType: 2,
                        defaultValue: ''
                    },
                    dataType: {
                        label: '数据库类型',
                        width: 180,
                        tplType: 3,
                        defaultValue: ''
                    },
                    remark: {
                        label: '备注',
                        width: 200,
                        tplType: 1,
                        defaultValue: ''
                    },
                    pk: {
                        label: '主键',
                        width: 120,
                        tplType: 4,
                        defaultValue: false
                    },
                    notNull: {
                        label: '非空',
                        width: 120,
                        tplType: 4,
                        defaultValue: false
                    },
                    autoIncrement: {
                        label: '自增',
                        width: 120,
                        tplType: 4,
                        defaultValue: false
                    },
                    defaultValue: {
                        label: '默认值',
                        width: 140,
                        tplType: 1,
                        defaultValue: ''
                    },
                    relationNoShow: {
                        label: '关系图',
                        width: 120,
                        tplType: 5,
                        defaultValue: true
                    }
                },

                codeTypeMap: {
                    createTableTemplate: '创建数据表',
                    deleteTableTemplate: '删除数据表',
                    rebuildTableTemplate: '重建数据表',
                    createFieldTemplate: '添加字段',
                    updateFieldTemplate: '修改字段',
                    deleteFieldTemplate: '删除字段',
                    createIndexTemplate: '创建索引',
                    deleteIndexTemplate: '删除索引'
                },
            };
        },
        computed: {
            dataTypeList () {
                return this.projectData.dataTypeDomains.datatype;
            },
            dataBaseList () {
                return this.projectData.dataTypeDomains.database;
            },
            defaultDataBase () {
                return this.dataBaseList.filter((item) => {
                    return item.defaultDatabase;
                })[0];
            },
            dataTypeMap () {
                let obj = {};

                this.dataTypeList.forEach((item) => {
                    obj[item.code] = item.apply[this.defaultDataBase.code].type;
                });

                return obj;
            }
        },
        watch: {
            hasChange (newVal, oldVal) {
                if (!newVal && oldVal) {
                    this.showCode();
                }
            },
            curTab (val) {
                let _this = this;

                if (val == 2 && !_this.fieldsTableInitFlag) {
                    _this.fieldsTableInitFlag = true;
                } else if (val == 4) {
                    _this.showCode();
                }

                _this.refreshFlag = false;
                _this.$nextTick(() => {
                    //强制刷新某些组件
                    _this.refreshFlag = true;
                });

                _this.$emit('tab-change', val);
            }
        },
        methods: {
            setData (curDataTable) {
                let _this = this,
                    key = '';

                curDataTable.fields.forEach((item) => {
                    for (key in _this.fieldConfig) {
                        item[key] = item[key] === undefined ? _this.fieldConfig[key].defaultValue : item[key];
                    }
                });
                curDataTable.remark = curDataTable.remark === undefined ? '' : curDataTable.remark;
                curDataTable.indexs = curDataTable.indexs === undefined ? [] : curDataTable.indexs;

                _this.curDataTable = curDataTable;
                _this.refreshFlag = false;

                _this.curTab = _this.lastTab || 1;
                _this.showCode();

                _this.$nextTick(() => {
                    //强制刷新某些组件
                    _this.refreshFlag = true;
                });
            },

            getData () {
                return this.curDataTable;
            },

            handleChange () {
                let _this = this;

                if (_this.initFlag && !_this.hasChange) {
                    _this.hasChange = true;
                    _this.$emit('data-change');
                }
            },

            handleCheckBoxChange (fieldName, row) {
                if (fieldName == 'pk' && row[fieldName]) {
                    row.notNull = true;
                }

                this.handleChange();
            },

            addField (e) {
                e.currentTarget.blur();
                let _this = this,
                    key = '',
                    obj = {};

                for (key in _this.fieldConfig) {
                    obj[key] = _this.fieldConfig[key].defaultValue;
                }

                _this.curDataTable.fields.push(obj);
                _this.handleChange();
            },
            delField (index) {
                let _this = this,
                    targetField = _this.curDataTable.fields[index];

                //移除字段前，先把索引里的对应索引字段移除
                _this.curDataTable.indexs.forEach((index) => {
                    index.fields = index.fields.filter((fieldName) => {
                        return fieldName != targetField.name;
                    });
                });

                _this.curDataTable.fields.splice(index, 1);

                this.handleChange();
            },

            addIndex (e) {
                e.currentTarget.blur();
                let _this = this,
                    obj = {
                        name: '',
                        isUnique: false,
                        fields: []
                    };

                _this.curDataTable.indexs.push(obj);
                _this.handleChange();
            },
            delIndex (index) {
                this.curDataTable.indexs.splice(index, 1);
                this.handleChange();
            },

            toggleRelationNoShow (item) {
                item.relationNoShow = !item.relationNoShow;
                this.handleChange();
            },

            handleToFront (arr, index, disabled) {
                if (disabled) return;

                let obj = arr.splice(index, 1)[0];
                arr.splice(index - 1, 0, obj);
                this.handleChange();
            },
            handleToBehind (arr, index, disabled) {
                if (disabled) return;

                let obj = arr.splice(index, 1)[0];
                arr.splice(index + 1, 0, obj);
                this.handleChange();
            },
            getCode () {
                let _this = this;

                //根据当前表设置的变化传递不同的数据
                let entityChangeList = _this.changeList.filter((c) => {
                    const title = c.name.split('.')[0];
                    return (_this.curCodeType === 'createFieldTemplate'
                        && c.type === 'field'
                        && c.opt === 'add'
                        && title === _this.curDataTable.title) ||
                        (_this.curCodeType === 'updateFieldTemplate'
                            && c.type === 'field'
                            && c.opt === 'update'
                            && title === _this.curDataTable.title) ||
                        (_this.curCodeType === 'deleteFieldTemplate'
                            && c.type === 'field'
                            && c.opt === 'delete'
                            && title === _this.curDataTable.title) ||
                        (_this.curCodeType === 'deleteIndexTemplate'
                            && c.type === 'index'
                            && c.opt === 'delete'
                            && title === _this.curDataTable.title) ||
                        (_this.curCodeType === 'rebuildTableTemplate'
                            && c.type === 'field'
                            && title === _this.curDataTable.title);
                });

                return getCodeByDataTable(
                    _this.projectData,
                    _this.curModule.name,
                    _this.curDataTable,
                    _this.dataBaseList[_this.curDataBaseIndex].code,
                    _this.curCodeType,
                    entityChangeList,
                    deepClone(_this.$store.state.project.projectData)
                );
            },
            showCode () {
                let _this = this;

                if (_this.curTab != 4) {
                    return;
                }

                _this.curCode = _this.getCode();
                _this.codeFlag = false;

                _this.$nextTick(() => {
                    _this.codeFlag = true;
                    _this.$nextTick(() => {
                        hljs.highlightBlock(_this.$refs.code);
                    });
                });
            }
        },
        created () {
            let _this = this,
                index = '';

            _this.dataBaseList.forEach((item, idx) => {
                if (item.defaultDatabase) {
                    index = idx;
                }
            });

            _this.curDataBaseIndex = index;
        }
    };
</script>

<style>
    @import url('./tab-win-cont.css');
</style>
