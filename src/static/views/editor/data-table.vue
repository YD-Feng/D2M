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
        <div class="mt10px pt10px pb10px"
             style="border-top: 1px solid #e2e2e2;"
             v-show="curTab == 2">
            <el-button
                type="primary"
                plain
                style="padding: 4px 5px;"
                title="新增字段"
                @click="addField($event)">
                <i class="el-icon-circle-plus-outline" style="font-size: 16px;"></i>
            </el-button>

            <el-button
                type="primary"
                plain
                style="padding: 4px 5px;"
                title="在选中字段前插入新字段"
                @click="addFieldAt($event, 'front')">
                <i class="icon-font icon-qiancha"></i>
            </el-button>

            <el-button
                type="primary"
                plain
                style="padding: 4px 5px;"
                title="在选中字段后插入新字段"
                @click="addFieldAt($event, 'behind')">
                <i class="icon-font icon-houcha"></i>
            </el-button>

            <el-button
                type="primary"
                plain
                style="padding: 4px 5px;"
                title="选中字段上移"
                @click="handleSort($event, 'field', 'front')">
                <i class="el-icon-upload2" style="font-size: 16px;"></i>
            </el-button>

            <el-button
                type="primary"
                plain
                style="padding: 4px 5px;"
                title="选中字段下移"
                @click="handleSort($event, 'field', 'behind')">
                <i class="el-icon-download" style="font-size: 16px;"></i>
            </el-button>

            <el-button
                type="primary"
                plain
                style="padding: 4px 5px;"
                title="删除选中字段"
                @click="delField($event)">
                <i class="el-icon-delete" style="font-size: 16px;"></i>
            </el-button>
        </div>

        <div class="custom-table-wrap" v-show="curTab == 2">
            <div class="custom-table">
                <div class="tr">
                    <div class="th"
                         style="min-width: 60px; width: 4%;">
                        &nbsp;
                    </div>

                    <div class="th"
                         v-for="(item, index) in curDataTable.headers"
                         :key="'tb-col-' + index"
                         :style="{'min-width': fieldConfig[item.fieldName].minWidth, width: fieldConfig[item.fieldName].width}">
                        <span class="f14px fBold">{{fieldConfig[item.fieldName].label}}</span>
                        <i class="icon-font"
                           v-if="refreshFlag && item.fieldName != 'defaultValue' && item.fieldName != 'relationNoShow'"
                           :class="{'icon-kejian': item.relationNoShow, 'icon-bukejian': !item.relationNoShow}"
                           @click="toggleRelationNoShow(item)">
                        </i>
                    </div>
                </div>

                <div class="tr" v-if="curDataTable.fields.length == 0">
                    <div class="td"
                         style="min-width: 1540px; width: 100%; line-height: 60px; color: #909399;">
                        暂无数据
                    </div>
                </div>

                <div class="tr"
                     v-if="curDataTable.fields.length > 0"
                     v-for="(item, index) in curDataTable.fields">
                    <div class="td"
                         style="min-width: 60px; width: 4%;">
                        <el-checkbox
                            v-model="checkedField"
                            :max="1"
                            :label="index.toString()"
                            @change="handleCheckedChange('checkedField', index)">
                        </el-checkbox>
                    </div>

                    <div class="td"
                         :style="{'min-width': fieldConfig.chnname.minWidth, width: fieldConfig.chnname.width}">
                        <el-input
                            v-model.trim="item.chnname"
                            :placeholder="`请输入${fieldConfig.chnname.label}`"
                            style="width: 100%;"
                            @input="handleChange">
                        </el-input>
                    </div>

                    <div class="td"
                         :style="{'min-width': fieldConfig.name.minWidth, width: fieldConfig.name.width}">
                        <el-input
                            v-model.trim="item.name"
                            :placeholder="`请输入${fieldConfig.name.label}`"
                            style="width: 100%;"
                            @input="handleChange">
                        </el-input>
                    </div>

                    <div class="td"
                         :style="{'min-width': fieldConfig.type.minWidth, width: fieldConfig.type.width}">
                        <el-select
                            v-if="curTab == 2 && refreshFlag"
                            v-model="item.type"
                            :placeholder="`请选择${fieldConfig.type.label}`"
                            style="width: 100%;"
                            @change="handleChange">
                            <el-option
                                v-for="item in dataTypeList"
                                :key="item.code"
                                :value="item.code"
                                :label="item.name">
                            </el-option>
                        </el-select>
                    </div>

                    <div class="td"
                         :style="{'min-width': fieldConfig.dataType.minWidth, width: fieldConfig.dataType.width}">
                        <div class="h30px lh30px oh"
                             style="background-color: #f5f5f5; text-overflow: ellipsis; white-space: nowrap;"
                             :title="dataTypeMap[item.type]">
                            {{dataTypeMap[item.type]}}
                        </div>
                    </div>

                    <div class="td"
                         :style="{'min-width': fieldConfig.remark.minWidth, width: fieldConfig.remark.width}">
                        <el-input
                            v-model.trim="item.remark"
                            :placeholder="`请输入${fieldConfig.remark.label}`"
                            style="width: 100%;"
                            @input="handleChange">
                        </el-input>
                    </div>

                    <div class="td"
                         :style="{'min-width': fieldConfig.pk.minWidth, width: fieldConfig.pk.width}">
                        <el-checkbox
                            v-model="item.pk"
                            @change="handleCheckBoxChange('pk', item)">
                        </el-checkbox>
                    </div>

                    <div class="td"
                         :style="{'min-width': fieldConfig.notNull.minWidth, width: fieldConfig.notNull.width}">
                        <el-checkbox
                            v-model="item.notNull"
                            @change="handleCheckBoxChange('notNull', item)">
                        </el-checkbox>
                    </div>

                    <div class="td"
                         :style="{'min-width': fieldConfig.autoIncrement.minWidth, width: fieldConfig.autoIncrement.width}">
                        <el-checkbox
                            v-model="item.autoIncrement"
                            @change="handleCheckBoxChange('autoIncrement', item)">
                        </el-checkbox>
                    </div>

                    <div class="td"
                         :style="{'min-width': fieldConfig.defaultValue.minWidth, width: fieldConfig.defaultValue.width}">
                        <el-input
                            v-model.trim="item.defaultValue"
                            :placeholder="`请输入${fieldConfig.defaultValue.label}`"
                            style="width: 100%;"
                            @input="handleChange">
                        </el-input>
                    </div>

                    <div class="td"
                         :style="{'min-width': fieldConfig.relationNoShow.minWidth, width: fieldConfig.relationNoShow.width}">
                        <div class="custom-table-btn-wrap lh30px">
                            <i class="icon-font"
                               :class="{'icon-kejian': item.relationNoShow, 'icon-bukejian': !item.relationNoShow}"
                               @click="toggleRelationNoShow(item, true, index)">
                            </i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!--索引信息-->
        <div class="mt10px pt10px pb10px"
             style="border-top: 1px solid #e2e2e2;"
             v-show="curTab == 3">
            <el-button
                type="primary"
                plain
                style="padding: 4px 5px;"
                title="新增索引"
                @click="addIndex($event)">
                <i class="el-icon-circle-plus-outline" style="font-size: 16px;"></i>
            </el-button>

            <el-button
                type="primary"
                plain
                style="padding: 4px 5px;"
                title="在选中索引前插入新索引"
                @click="addIndexAt($event, 'front')">
                <i class="icon-font icon-qiancha"></i>
            </el-button>

            <el-button
                type="primary"
                plain
                style="padding: 4px 5px;"
                title="在选中索引后插入新索引"
                @click="addIndexAt($event, 'behind')">
                <i class="icon-font icon-houcha"></i>
            </el-button>

            <el-button
                type="primary"
                plain
                style="padding: 4px 5px;"
                title="选中索引上移"
                @click="handleSort($event, 'index', 'front')">
                <i class="el-icon-upload2" style="font-size: 16px;"></i>
            </el-button>

            <el-button
                type="primary"
                plain
                style="padding: 4px 5px;"
                title="选中索引下移"
                @click="handleSort($event, 'index', 'behind')">
                <i class="el-icon-download" style="font-size: 16px;"></i>
            </el-button>

            <el-button
                type="primary"
                plain
                style="padding: 4px 5px;"
                title="删除选中索引"
                @click="delIndex($event)">
                <i class="el-icon-delete" style="font-size: 16px;"></i>
            </el-button>
        </div>

        <el-table
            v-if="curTab == 3"
            class="field-table"
            :data="curDataTable.indexs"
            border>
            <el-table-column
                label=""
                align="center"
                width="55">
                <template slot-scope="scope">
                    <el-checkbox
                        v-model="checkedIndex"
                        :max="1"
                        :label="scope.$index.toString()"
                        @change="handleCheckedChange('checkedIndex', scope.$index)">
                    </el-checkbox>
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
        </el-table>

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

                checkedField: [],
                checkedIndex: [],

                curTab: 1,
                curDataBaseIndex: '',
                curCodeType: 'createTableTemplate',
                curCode: '',
                codeFlag: false,

                fieldConfig: {
                    chnname: {
                        label: '名称',
                        width: '10%',
                        minWidth: '160px',
                        defaultValue: ''
                    },
                    name: {
                        label: '代码',
                        width: '10%',
                        minWidth: '160px',
                        defaultValue: ''
                    },
                    type: {
                        label: '类型',
                        width: '12%',
                        minWidth: '180px',
                        defaultValue: ''
                    },
                    dataType: {
                        label: '数据库类型',
                        width: '12%',
                        minWidth: '180px',
                        defaultValue: ''
                    },
                    remark: {
                        label: '备注',
                        width: '13%',
                        minWidth: '200px',
                        defaultValue: ''
                    },
                    pk: {
                        label: '主键',
                        width: '8%',
                        minWidth: '120px',
                        defaultValue: false
                    },
                    notNull: {
                        label: '非空',
                        width: '8%',
                        minWidth: '120px',
                        defaultValue: false
                    },
                    autoIncrement: {
                        label: '自增',
                        width: '8%',
                        minWidth: '120px',
                        defaultValue: false
                    },
                    defaultValue: {
                        label: '默认值',
                        width: '10%',
                        minWidth: '160px',
                        defaultValue: ''
                    },
                    relationNoShow: {
                        label: '关系图',
                        width: '5%',
                        minWidth: '80px',
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
                }
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
                    obj[item.code] = item.apply ? item.apply[this.defaultDataBase.code].type : '';
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
                    if (key != 'dataType') {
                        obj[key] = _this.fieldConfig[key].defaultValue;
                    }
                }

                _this.curDataTable.fields.push(obj);
                _this.handleChange();
            },
            addFieldAt (e, dealType) {
                e.currentTarget.blur();

                let _this = this,
                    key = '',
                    obj = {},
                    index = _this.checkedField[0] * 1;

                for (key in _this.fieldConfig) {
                    if (key != 'dataType') {
                        obj[key] = _this.fieldConfig[key].defaultValue;
                    }
                }

                if (_this.checkedField.length === 0) {
                    _this.$message.error('请先选择字段');
                    return;
                }

                if (dealType == 'behind') {
                    _this.curDataTable.fields.splice(index + 1, 0, obj);
                } else if (dealType == 'front') {
                    _this.curDataTable.fields.splice(index, 0, obj);
                    _this.checkedField = [(index + 1).toString()];
                }
            },
            delField (e) {
                e.currentTarget.blur();

                let _this = this,
                    index = _this.checkedField[0] * 1,
                    targetField = _this.curDataTable.fields[index];

                if (_this.checkedField.length === 0) {
                    _this.$message.error('请先选择字段');
                    return;
                }

                //移除字段前，先把索引里的对应索引字段移除
                _this.curDataTable.indexs.forEach((index) => {
                    index.fields = index.fields.filter((fieldName) => {
                        return fieldName != targetField.name;
                    });
                });

                _this.curDataTable.fields.splice(index, 1);
                _this.checkedField = [];

                _this.handleChange();
                _this.$emit('field-visible-change', index, _this.curDataTable.title, targetField.name);
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
            addIndexAt (e, dealType) {
                e.currentTarget.blur();

                let _this = this,
                    obj = {
                        name: '',
                        isUnique: false,
                        fields: []
                    },
                    index = _this.checkedIndex[0] * 1;

                if (_this.checkedIndex.length === 0) {
                    _this.$message.error('请先选择索引');
                    return;
                }

                if (dealType == 'behind') {
                    _this.curDataTable.indexs.splice(index + 1, 0, obj);
                } else if (dealType == 'front') {
                    _this.curDataTable.indexs.splice(index, 0, obj);
                    _this.checkedIndex = [(index + 1).toString()];
                }
            },
            delIndex (e) {
                e.currentTarget.blur();

                let _this = this,
                    index = _this.checkedIndex[0] * 1;

                if (_this.checkedIndex.length === 0) {
                    _this.$message.error('请先选择索引');
                    return;
                }

                _this.curDataTable.indexs.splice(index, 1);
                _this.checkedIndex = [];

                _this.handleChange();
            },

            toggleRelationNoShow (item, isField, fieldIndex) {
                let _this = this;

                item.relationNoShow = !item.relationNoShow;
                _this.handleChange();

                if (isField) {
                    _this.$emit('field-visible-change', fieldIndex, _this.curDataTable.title, item.name);
                }
            },

            handleSort (e, type, dealType) {
                e.currentTarget.blur();

                let _this = this,
                    map = {
                        field: {
                            listName: 'fields',
                            checkedName: 'checkedField',
                            txt: '字段'
                        },
                        index: {
                            listName: 'indexs',
                            checkedName: 'checkedIndex',
                            txt: '索引'
                        }
                    },
                    arr = _this.curDataTable[map[type].listName],
                    index = _this[map[type].checkedName][0] * 1;

                if (_this[map[type].checkedName].length === 0) {
                    _this.$message.error('请先选择' + map[type].txt);
                    return;
                } else if (dealType == 'behind' && index == arr.length - 1) {
                    return;
                } else if (dealType == 'front' && index == 0) {
                    return;
                }

                let obj = arr.splice(index, 1)[0],
                    num = -1;

                if (dealType == 'behind') {
                    num = index + 1;
                } else if (dealType == 'front') {
                    num = index - 1;
                }

                arr.splice(num, 0, obj);

                _this[map[type].checkedName] = [num.toString()];

                _this.handleChange();

                if (type == 'field') {
                    //参数说明，调序前的索引值，调序后的索引值，表名
                    _this.$emit('field-sort-change', index, num, _this.curDataTable.title);
                }
            },
            handleCheckedChange (type, index) {
                let _this = this;
                if (_this[type].length != 0) {
                    _this[type] = [index.toString()];
                }
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
