<template>
    <div class="app-wrap" v-auto-height data-key="app-wrap">
        <div class="app-header">
            <div class="fl pl5px">
                <i class="icon-font icon-shujujianmo"></i>
                D2M
            </div>

            <div class="fr text-right" style="font-size: 0;">
                <button
                    class="btn"
                    @click="handleClickBtn('minimize')">
                    <i class="icon-font icon-zuixiaohua"></i>
                </button>

                <button
                    class="btn"
                    v-if="!isMaxSize"
                    @click="handleClickBtn('maximize')">
                    <i class="icon-font icon-zuidahua"></i>
                </button>

                <button
                    class="btn"
                    v-if="isMaxSize"
                    @click="handleClickBtn('unmaximize')">
                    <i class="icon-font icon-huanyuan"></i>
                </button>

                <button
                    class="btn"
                    @click="handleClickBtn('close')">
                    <i class="icon-font icon-guanbi"></i>
                </button>
            </div>
        </div>
        <div class="app-contain">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
    import electron from 'electron';
    import config from 'config';
    import { fileExist, fileExistPromise, readFilePromise, saveFilePromise, writeFile } from '../js/utils/fs';

    const { ipcRenderer } = electron;

    export default {
        data () {
            return {
                historyList: [],
                isMaxSize: false,
                dealType: 'create'
            }
        },
        methods: {
            handleClickBtn (type) {
                let _this = this;

                switch (type) {
                    case 'minimize':
                        ipcRenderer.sendSync('windowOrder', 'minimize');
                        break;

                    case 'unmaximize':
                        ipcRenderer.sendSync('windowOrder', 'unmaximize');
                        _this.isMaxSize = false;
                        break;

                    case 'maximize':
                        ipcRenderer.sendSync('windowOrder', 'maximize');
                        _this.isMaxSize = true;

                        break;

                    case 'close':
                        ipcRenderer.sendSync('windowOrder', 'close');
                        break;
                }
            }
        },
        created () {
            let _this = this;

            _this.isMaxSize = ipcRenderer.sendSync('getWinIsMaxSize');

            ipcRenderer.on('resize', (e, isMaxSize) => {
                _this.isMaxSize = isMaxSize;
            });

            if (fileExist(config.historyPath)) {
                readFilePromise(config.historyPath).then((res) => {
                    _this.historyList = res.historyList || [];
                });
            }
        }
    };
</script>

<style>
    .app-wrap{
        position: relative;
        padding-top: 30px;
        overflow: hidden;
    }
    .app-header{
        position: absolute;
        top: 0;
        width: 100%;
        height: 30px;
        line-height: 29px;
        overflow: hidden;
        background-color: #f2f2f2;
        border-bottom: 1px solid #9b9b9b;
        color: #333333;
        font-size: 12px;
        -webkit-user-select:none;
        -moz-user-select:none;
        -ms-user-select:none;
        user-select:none;
        -webkit-app-region: drag;
    }
    .app-header .icon-shujujianmo{
        font-size: 18px;
        vertical-align: sub;
        position: relative;
        top: -1px;
        color: #0075c2;
    }
    .app-header .btn{
        border: none;
        width: 30px;
        height: 29px;
        vertical-align: top;
        background: transparent;
        color: #333333;
        -webkit-app-region: no-drag;
    }
    .app-header .btn:hover{
        background: rgba(0, 0, 0, 0.1);
    }
    .app-header .btn .icon-font{
        font-size: 12px;
    }
    .app-contain{
        overflow: hidden;
        height: 100%;
    }
</style>
