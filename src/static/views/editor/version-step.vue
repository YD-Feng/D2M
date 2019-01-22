<template>
    <div class="version-step-wrap">
        <div class="step">
            <div class="step-item"
                 v-for="(item, index) in projectVersionStepList">
                <div class="step-icon">
                    <i class="el-icon-warning"></i>
                </div>
                <div class="step-line"></div>
                <div class="step-cont">
                    <p class="step-title">
                        {{item.versionCode}}
                    </p>
                    <p class="step-time">
                        {{item.date}}
                    </p>
                    <p class="step-description" v-if="item.description">
                        {{item.description}}
                    </p>
                    <div class="mt5px" v-if="index < projectVersionStepList.length - 1">
                        <a href="#"
                           class="cm-link-blue"
                           @click="handleSeeCompare($event, index)">
                            版本变更详情
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import path from 'path';
    import { readFileSync } from './../../js/utils/fs';

    export default {
        props: ['versionCodeList'],
        data () {
            return {};
        },
        computed: {
            projectPath () {
                return this.$store.state.project.projectPath;
            },
            projectVersionStepList () {
                let _this = this,
                    versionDir = this.projectPath.replace('json', 'version'),
                    arr = [];

                _this.versionCodeList.forEach((versionCode) => {
                    let versionData = readFileSync(path.join(versionDir, versionCode + '.json'));
                    versionData.dateVal = new Date(versionData.date).valueOf();
                    versionData.versionCode = versionCode.replace('.json', '');
                    arr.push(versionData);
                });

                return arr.sort((itemA, itemB) => {
                    return itemB.dateVal - itemA.dateVal;
                });
            }
        },
        methods: {
            handleSeeCompare (e, index) {
                e.stopPropagation();
                let _this = this;
                _this.$emit(
                    'see-compare',
                    _this.projectVersionStepList[index].versionCode,
                    _this.projectVersionStepList[index + 1].versionCode
                );
            }
        }
    };
</script>

<style>
    @import url('./main.css');
</style>
