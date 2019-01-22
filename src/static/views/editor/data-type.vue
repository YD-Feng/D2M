<template>
    <div class="tab-win-cont"
         v-if="curDataType">
        <p class="title">{{`${curDataType.name}[${curDataType.code}]`}} - 类型详情</p>
        <div class="table-wrap">
            <table class="table">
                <tr v-for="item in dataBaseList">
                    <td width="1"
                        class="pl20px pb20px text-right">
                        {{item.code + ' - 对应类型：'}}
                    </td>
                    <td class="pl5px pb20px pr20px">
                        <el-input
                            v-model.trim="curDataType.apply[item.code].type"
                            style="width: 100%;"
                            @input="handleChange">
                        </el-input>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
    module.exports = {
        replace: true,
        props: ['dataBaseList'],
        data () {
            return {
                curDataType: null,
                initFlag: false,
                hasChange: false
            };
        },
        watch: {
            dataBaseList () {
                let _this = this;

                if (_this.initFlag) {
                    _this.dataBaseList.forEach((item) => {
                        if (!_this.curDataType.apply[item.code]) {
                            _this.curDataType.apply[item.code] = {
                                type: ''
                            };
                        }
                    });
                }
            }
        },
        methods: {
            setData (curDataType) {
                let _this = this;

                if (!curDataType.apply) {
                    curDataType.apply = {};
                }

                _this.dataBaseList.forEach((item) => {
                    if (!curDataType.apply[item.code]) {
                        curDataType.apply[item.code] = {
                            type: ''
                        };
                    }
                });

                _this.curDataType = curDataType;
                _this.$nextTick(() => {
                    _this.initFlag = true;
                });
            },

            getData () {
                return this.curDataType;
            },

            handleChange () {
                let _this = this;

                if (_this.initFlag && !_this.hasChange) {
                    _this.hasChange = true;
                    _this.$emit('data-change');
                }
            }
        }
    };
</script>

<style>
    @import url('./tab-win-cont.css');
</style>
