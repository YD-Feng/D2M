'use strict';

//加载初始化样式
import 'element-style';
import './../less/common.less';
import 'highlight.js/styles/tomorrow.css'
import './common-modules/date-format';

import electron from 'electron';
import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import ElementUI from 'element-ui';

import routes from './routes';
import appView from '../views/app.vue';
import VueBar from '../js/common-modules/vue-bar';

const { ipcRenderer } = electron;

Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(ElementUI);
Vue.use(VueBar);

// 实例化 vue-routes
const router = new VueRouter({
    routes: routes
});

// 实例化 store
const store = new Vuex.Store({
    modules: {
        project: require('./store-modules/project')
    },
    strict: false
});

//自定义指令
var nodeList = [],
    ctx = '@clickOutside',
    mouseDownEvent;

document.addEventListener('mousedown', function (e) {
    mouseDownEvent = e;
}, false);

document.addEventListener('mouseup', function (e) {
    nodeList.forEach(function (node) {
        node[ctx].documentHandler(e, mouseDownEvent);
    });
}, false);

//点击元素以外区域时触发回调函数指令
Vue.directive('clickOutside', {
    bind (el, binding, vnode) {
        var id = nodeList.push(el) - 1;
        var documentHandler = function (mouseup = {}, mousedown = {}) {
            if (!vnode.context || !mouseup.target || !mousedown.target ||
                el.contains(mouseup.target) ||
                (vnode.context.popperElm &&
                    (vnode.context.popperElm.contains(mouseup.target) ||
                        vnode.context.popperElm.contains(mousedown.target)))) return;

            if (binding.expression &&
                el[ctx].methodName &&
                vnode.context[el[ctx].methodName]) {
                vnode.context[el[ctx].methodName]();
            } else {
                el[ctx].bindingFn && el[ctx].bindingFn();
            }
        };
        el[ctx] = {
            id,
            documentHandler,
            methodName: binding.expression,
            bindingFn: binding.value
        };
    },
    update (el, binding) {
        el[ctx].methodName = binding.expression;
        el[ctx].bindingFn = binding.value;
    },
    unbind (el) {
        let len = nodeList.length;

        for (let i = 0; i < len; i++) {
            if (nodeList[i][ctx].id === el[ctx].id) {
                nodeList.splice(i, 1);
                break;
            }
        }
    }
});

var autoKey = 1,
    autoHeightTargetMap = {};

//关系图Vm全局缓存
window.rdVmCache = {};

window.addEventListener('resize', function () {
    var winInnerHeight = window.innerHeight;
    for (var key in autoHeightTargetMap) {
        autoHeightTargetMap[key].el.style['height'] = (winInnerHeight - autoHeightTargetMap[key].delHeight) + 'px';
        autoHeightTargetMap[key].el.style['max-height'] = (winInnerHeight - autoHeightTargetMap[key].delHeight) + 'px';
    }

    for (var key in window.rdVmCache) {
        window.rdVmCache[key].changeNetSize();
    }
});

Vue.directive('autoHeight', {
    bind: function (el) {
        let delHeight = el.dataset.delHeight || 0;
        el.style['height'] = (window.innerHeight - delHeight) + 'px';
        el.style['max-height'] = (window.innerHeight - delHeight) + 'px';
        el.dataset.key = autoKey++;

        autoHeightTargetMap[el.dataset.key] = {
            el: el,
            delHeight: delHeight
        };
    },
    unbind: function (el) {
        delete autoHeightTargetMap[el.dataset.key];
    }
});

new Vue({
    el: '#app',
    router,
    store,
    render (h) {
        return h(appView);
    }
});
