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
                            style="width: 100%;">
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
        props: ['value', 'dataBaseList'],
        data () {
            return {
                curDataType: {
                    name: '',
                    code: '',
                    apply: {
                        MYSQL: {
                            type: ''
                        },
                        ORACLE: {
                            type: ''
                        }
                    }
                }
            };
        },
        watch: {
            dataBaseList () {
                let _this = this;

                _this.dataBaseList.forEach((item) => {
                    if (!_this.curDataType.apply[item.code]) {
                        _this.curDataType.apply[item.code] = {
                            type: ''
                        };
                    }
                });
            },
            value: {
                handler (newVal, oldVal) {
                    let _this = this,
                        curDataType = newVal;

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
                },
                deep: true,
                immediate: true
            },
            curDataType: {
                handler (newVal, oldVal) {
                    this.$emit('update:value', newVal);
                },
                deep: true
            }
        }
    };
</script>

<style>
    @import url('./tab-win-cont.css');
</style>
