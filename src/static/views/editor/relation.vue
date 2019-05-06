<template>
    <div v-if="curRelation" class="tab-win-cont relative" style="padding: 0;">
        <div :id="`J-paint-${curRelation.title}`"
             ref="paint"
             v-auto-height data-del-height="84"
             @dragover="handleDragOver"
             @drop="handleDrop">
        </div>

        <div class="tools-wrap" v-if="net">
            <el-button
                type="text"
                title="拖拽模式"
                :class="{'active': net._attrs.mode == 'drag'}"
                @click="changeNetMode('drag')">
                <i class="icon-font icon-tuodong"></i>
            </el-button>

            <el-button
                type="text"
                title="编辑模式"
                :class="{'active': net._attrs.mode == 'edit'}"
                @click="changeNetMode('edit')">
                <i class="icon-font icon-edit"></i>
            </el-button>
        </div>

        <div class="scale-txt" v-if="net">显示比例：{{Math.floor(netScale * 100) + '%'}}</div>
        <div class="tips-txt" v-if="net">左侧栏的数据表可直接拖到关系图中，按住 Shift 键可保持拖拽模式，鼠标滚轮可放大缩小关系图显示比例</div>
    </div>
</template>

<script>
    import G6 from '@antv/g6';

    module.exports = {
        replace: true,
        props: ['value', 'projectData'],
        data () {
            return {
                curRelation: null,
                initFlag: false,

                net: null,
                netMode: 'edit',
                netScale: 1,
                netDragging: false,
                netRefreshTimeout: null
            };
        },
        computed: {
            dataTypeMap () {
                let obj = {};

                this.projectData.dataTypeDomains.datatype.forEach((item) => {
                    obj[item.code] = item;
                });

                return obj;
            },

            defaultDataBase () {
                return this.projectData.dataTypeDomains.database.filter((item) => {
                    return item.defaultDatabase;
                })[0];
            },

            allEntities () {
                let arr = [];

                this.projectData.modules.forEach((module) => {
                    arr = arr.concat(module.entities);
                });

                return arr;
            }
        },
        watch: {
            value: {
                handler (newVal, oldVal) {
                    this.curRelation = newVal;
                },
                deep: true,
                immediate: true
            },
            curRelation: {
                handler (newVal, oldVal) {
                    this.$emit('update:value', newVal);
                },
                deep: true
            }
        },
        methods: {
            setMatrix (matrix) {
                let _this = this;

                if (!_this.net) {
                    _this.init();
                } else {
                    _this.net.changeData(_this.curRelation.graphCanvas.nodes, _this.curRelation.graphCanvas.edges);

                    if (matrix) {
                        //如果是切换窗口操作，而不是新开窗口，则还原到切换窗口前的关系图展示位置
                        _this.net.updateMatrix(matrix);
                        _this.netScale = _this.net.getScale();
                        _this.net.refresh();
                    }
                }
            },

            getMatrix () {
                return this.net.getMatrix();
            },

            //分析连接线得到数据表的关联关系
            getAssociations (source) {
                let _this = this;

                _this.curRelation.graphCanvas = source;

                _this.curRelation.associations = source.edges.map((edge) => {
                    let sourceNode = source.nodes.filter((node) => {
                            return node.id == edge.source;
                        })[0],
                        targetNode = source.nodes.filter((node) => {
                            return node.id == edge.target;
                        })[0],
                        sourceTable = _this.allEntities.filter((table) => {
                            return table.title === sourceNode.title;
                        })[0],
                        targetTable = _this.allEntities.filter((table) => {
                            return table.title === targetNode.title;
                        })[0],
                        sourceField = sourceTable.fields[Math.floor(edge.sourceAnchor / 2)].name,
                        targetField = targetTable.fields[Math.floor(edge.targetAnchor / 2)].name;

                    return {
                        relation: edge.relation,
                        from: {
                            entity: sourceTable.title,
                            field: sourceField
                        },
                        to: {
                            entity: targetTable.title,
                            field: targetField
                        }
                    };
                });
            },

            init () {
                let _this = this;

                _this.registerNode();

                _this.net = new G6.Net({
                    id: `J-paint-${_this.curRelation.title}`,
                    width: _this.$refs.paint.clientWidth,
                    height: _this.$refs.paint.clientHeight,
                    mode: 'edit',
                    modes: {
                        edit: [
                            'dragNode',
                            'dragEdge',
                            'dragAddEdge',
                            'clickBlankClearActive',
                            'resizeEdge',
                            'clickActive',
                            'dragNodeEndSetActive',
                            'multiSelect',
                            'shortcut',
                            'wheelZoom',
                            'hoverNodeShowAnchor',
                            'hoverAnchorSetActived',
                            'dragEdgeEndHideAnchor',
                            'dragNodeEndHideAnchor'
                        ],
                        drag: [
                            'dragCanvas',
                            'wheelZoom'
                        ]
                    },
                    fitView: 'cc',
                    grid: {
                        //是否支持网格对齐
                        forceAlign: true,
                        //网格大小
                        cell: 10,
                        // 网格线样式
                        line: {
                            stroke: '#D4D4D4',
                            opacity: 0.5
                        }
                    }
                });

                _this.bindNetEvent();
                _this.net.source(_this.curRelation.graphCanvas.nodes, _this.curRelation.graphCanvas.edges);
                _this.net.render();
            },
            //注册节点
            registerNode () {
                let _this = this;

                G6.registerNode('dataTable', {
                    draw (cfg, group) {
                        let lineHeight = 22,
                            margin = 10,
                            padding = 10,

                            model = cfg.model,
                            moduleName = model.moduleName,
                            moduleIndex = _this.projectData.modules.findIndex((module) => {
                                return module.name === moduleName;
                            }),
                            table = _this.projectData.modules[moduleIndex].entities.filter((entity) => {
                                return entity.title === model.title;
                            })[0],

                            tableFromAssociations = _this.curRelation.associations.filter((item) => {
                                return item.to && item.from.entity === table.title
                            }),

                            backRect = group.addShape('rect', {
                                attrs: {
                                    x: cfg.x,
                                    y: cfg.y,
                                    width: 100,
                                    height: 100,
                                    stroke: '#7b7b7b',
                                    fill: '#dfe5f8'
                                }
                            }),
                            title = group.addShape('text', {
                                attrs: {
                                    x: cfg.x,
                                    y: cfg.y,
                                    text: table.chnname ? `<${model.moduleName}> ${table.title} [${table.chnname}]` : `<${model.moduleName}> ${table.title}`,
                                    fill: '#0f75ad',
                                    textBaseline: 'top',
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    fontSize: 14
                                },
                            }),
                            titleBox = title.getBBox(),
                            splitLine = group.addShape('line', {
                                attrs: {
                                    stroke: '#7b7b7b'
                                }
                            }),
                            headerGroup = {},
                            headerGroupBox = {},
                            headerGroupKeys = [],
                            anchorPoints = [],

                            allHeaderWidth = 0,
                            backRectWidth = 0,
                            backRectHeight = 0;

                        const getTitle = (field, fieldName) => {
                            if (fieldName === 'pk') {

                                let pkTitles = [];

                                if (field[fieldName]) {
                                    pkTitles.push('PK');
                                }

                                if (tableFromAssociations.some(item => item.from.field === field.name)) {
                                    // 该属性为外键
                                    pkTitles.push('FK');
                                }

                                return pkTitles.length > 0 ? `<${pkTitles.join(',')}>` : '';

                            } else if (fieldName === 'type') {

                                let currType = _this.dataTypeMap[field.type];
                                return (currType && currType.name) || field.type;

                            } else if (fieldName === 'dataType') {

                                let currType = _this.dataTypeMap[field.type];
                                return (currType && currType.apply[_this.defaultDataBase.code].type) || '';

                            } else if (fieldName === 'notNull') {
                                return 'NotNull'
                            } else if (fieldName === 'autoIncrement') {
                                return 'AI'
                            }

                            return field[fieldName] || '';
                        };

                        const getTitleColor = (field) => {
                            if (field.pk) {
                                return '#c72026';
                            } else if (tableFromAssociations.some(entity => entity.from.field === field.name)) {
                                return '#08b42f';
                            }

                            return '#333333';
                        };

                        table.headers.forEach((header) => {
                            if (header.relationNoShow) {
                                headerGroup[header.fieldName] = group.addGroup();
                                headerGroupKeys.push(header.fieldName);
                            }
                        });

                        //绘制表格每一行的内容
                        table.fields.filter((field, i) => {
                            return field.relationNoShow;
                        }).forEach((field, i) => {
                            headerGroupKeys.forEach((fieldName) => {
                                headerGroup[fieldName].addShape('text', {
                                    attrs: {
                                        x: cfg.x,
                                        y: cfg.y + lineHeight * i,
                                        text: getTitle(field, fieldName),
                                        fill: getTitleColor(field),
                                        textBaseline: 'top',
                                        fontSize: 12
                                    }
                                });

                                headerGroupBox[fieldName] = headerGroup[fieldName].getBBox();

                                if (field.pk) {
                                    let box = headerGroupBox[fieldName];
                                    headerGroup[fieldName].addShape('line', {
                                        attrs: {
                                            x1: box.minX,
                                            y1: box.maxY + 2,
                                            x2: box.maxX,
                                            y2: box.maxY + 2,
                                            stroke: '#c72026'
                                        }
                                    });
                                }
                            });
                        });

                        headerGroupKeys.forEach((fieldName, index) => {
                            let box = headerGroupBox[fieldName];
                            allHeaderWidth += box.width;
                            backRectHeight = Math.max(backRectHeight, box.height);
                        });

                        backRectWidth = Math.max(titleBox.width, allHeaderWidth + ((headerGroupKeys.length - 1) * margin)) + (2 * padding);
                        backRectHeight += padding * 4 + titleBox.height;

                        //调整标题的位置
                        title.translate(0, -backRectHeight / 2 + padding);

                        //调整分隔线的位置
                        splitLine.attr({
                            x1: cfg.x - backRectWidth / 2,
                            y1: cfg.y - backRectHeight / 2 + 2 * padding + titleBox.height,
                            x2: cfg.x + backRectWidth / 2,
                            y2: cfg.y - backRectHeight / 2 + 2 * padding + titleBox.height,
                        });

                        //调整每一列的位置
                        let boxWidth = 0;
                        headerGroupKeys.forEach((fieldName, index) => {
                            headerGroup[fieldName].translate(
                                -backRectWidth / 2 + boxWidth + (margin * index) + padding,
                                -backRectHeight / 2 + titleBox.height + padding * 3
                            );
                            boxWidth += headerGroupBox[fieldName].width;
                        });

                        //调整表格底框的大小和位置
                        backRect.attr({
                            x: cfg.x - (backRectWidth / 2),
                            y: cfg.y - (backRectHeight / 2),
                            width: backRectWidth,
                            height: backRectHeight
                        });

                        let firstGroup = headerGroup[headerGroupKeys[0]],
                            fontHeight = firstGroup &&
                                firstGroup.get('children')[0] &&
                                firstGroup.get('children')[0].getBBox().height;

                        table.fields.filter((field, i) => {
                            return field.relationNoShow;
                        }).forEach((field, i) => {
                            let y = (titleBox.height + (padding * 3) + ((i + 1) * lineHeight) - (lineHeight - fontHeight) - (fontHeight / 2) + 1) / backRectHeight;
                            anchorPoints.push([0, y]);
                            anchorPoints.push([1, y]);
                        });
                        group.set('anchorPoints', anchorPoints);

                        return backRect;
                    },
                    getAnchorPoints (cfg, group) {
                        return group.get('anchorPoints');
                    }
                });
            },
            bindNetEvent () {
                let _this = this;

                _this.net.on('click', (e) => {
                    _this.lastClick = {
                        x: e.x,
                        y: e.y
                    };
                });

                _this.net.on('mousewheel', () => {
                    setTimeout(() => {
                        _this.netScale = _this.net.getScale();
                    }, 0);
                });

                _this.net.on('afterrender', (e) => {
                    //初始化完成
                    _this.initFlag = true;
                });

                _this.net.on('dblclick', (e) => {
                    if (_this.net._attrs.mode === 'edit' && e.itemType === 'node') {
                        let title = e.item._attrs.model.title,
                            moduleName = e.item._attrs.model.moduleName,
                            moduleIndex = _this.projectData.modules.findIndex((module) => {
                                return module.name === moduleName;
                            }),
                            entityIndex = _this.projectData.modules[moduleIndex].entities.findIndex((entity) => {
                                return entity.title === title;
                            });

                        _this.$emit('dblclick-table', moduleIndex, entityIndex);
                    }
                });

                _this.net.on('dragstart', (e) => {
                    _this.netDragging = true;
                });

                _this.net.on('dragend', (e) => {
                    _this.netDragging = false;

                    if (e.shape && e.shape.hasClass('anchor-point')) {
                        setTimeout(() => {
                            let source = _this.net.save().source;
                            _this.getAssociations(source);
                            _this.net.changeData(source.nodes, source.edges);
                        }, 0);
                    }
                });

                _this.net.on('mouseenter', (e) => {
                    let shape = e.shape;

                    if (shape && shape.hasClass('anchor-point') && !_this.netDragging) {
                        //进入锚点切换到添加连接线模式
                        _this.net.beginAdd('edge', {
                            shape: 'polyLineFlow'
                        });
                    }
                });

                _this.net.on('mouseleave', (e) => {
                    let shape = e.shape;

                    if (shape && shape.hasClass('anchor-point') && !_this.netDragging) {
                        //离开锚点退出添加连接线模式
                        _this.net.endAdd();
                    }
                });

                _this.net.on('keydown', (e) => {
                    if (e.keyCode > 36 && e.keyCode < 41) {
                        //37-左 38-上 39-右 40-下
                        //找出当前激活的Node
                        let activeNodes = (_this.net.getNodes() || []).filter((node) => {
                            return node._attrs.actived;
                        });

                        activeNodes.forEach(activeNode => {
                            let x = activeNode._attrs.model.x,
                                y = activeNode._attrs.model.y;

                            if (e.keyCode === 37) {
                                //左移
                                _this.net.update(activeNode, {
                                    x: x - 1,
                                    y: y
                                });
                            } else if (e.keyCode === 38) {
                                //上移
                                _this.net.update(activeNode, {
                                    x: x,
                                    y: y - 1
                                });
                            } else if (e.keyCode === 39) {
                                //右移
                                _this.net.update(activeNode, {
                                    x: x + 1,
                                    y: y
                                });
                            } else if (e.keyCode === 40) {
                                //下移
                                _this.net.update(activeNode, {
                                    x: x,
                                    y: y + 1
                                });
                            }
                        });
                    }

                    if (e.shiftKey && _this.net._attrs.mode === 'edit') {
                        //按住 shift 键，保持拖动模式
                        _this.net.changeMode('drag');
                    }
                });

                _this.net.on('keyup', (e) => {
                    //松开 shift 键，恢复到先前的模式
                    if (e.keyCode === 16 && _this.net._attrs.mode === 'drag') {
                        _this.changeNetMode();
                    }
                });

                _this.net.on('itemadd', (e) => {
                    let item = e.item,
                        type = item.get('type');

                    if (type === 'node') {
                        let nodes = _this.net.getNodes(),
                            curTitle = item._attrs.model.title,
                            existTitleList = nodes.map((node) => {
                                return node._attrs.model.title;
                            }),
                            isExist = existTitleList.includes(curTitle),
                            newTitle = '';

                        if (isExist) {
                            newTitle = `${curTitle}-副本(${new Date().valueOf()})`;

                            let moduleName = item._attrs.model.moduleName,
                                moduleIndex = _this.projectData.modules.findIndex((module) => {
                                    return module.name === moduleName;
                                }),
                                entity = _this.projectData.modules[moduleIndex].entities.filter((entity) => {
                                    return entity.title === curTitle;
                                })[0];

                            //抛出 copy-table 事件先复制表
                            _this.$emit('copy-table', moduleIndex, {
                                title: newTitle,
                                chnname: entity.chnname,
                                fields: entity.fields,
                                headers: entity.headers
                            });
                        }

                        clearTimeout(_this.netRefreshTimeout);
                        _this.netRefreshTimeout = setTimeout(() => {
                            if (isExist) {
                                //然后更新节点信息
                                _this.net.update(item, {
                                    title: newTitle,
                                    x: _this.lastClick.x,
                                    y: _this.lastClick.y
                                });

                                //最后才刷新关系图
                                _this.net.refresh();
                            }

                            let source = _this.net.save().source;
                            _this.curRelation.graphCanvas = source;
                        });
                    }
                });

                _this.net.on('itemremove', (e) => {
                    let item = e.item,
                        type = item.get('type');

                    if (type === 'edge' || type === 'node') {
                        clearTimeout(_this.netRefreshTimeout);
                        _this.netRefreshTimeout = setTimeout(() => {
                            let source = _this.net.save().source;
                            _this.getAssociations(source);
                            _this.net.changeData(source.nodes, source.edges);
                        });
                    }
                });
            },
            changeNetSize () {
                let _this = this,
                    paint = _this.$refs.paint;

                _this.net.changeSize(paint.clientWidth, paint.clientHeight);
            },
            changeNetMode (mode) {
                if (mode !== undefined) {
                    this.netMode = mode;
                }
                this.net.changeMode(this.netMode);
            },

            handleDragOver (e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            },
            handleDrop (e) {
                e.preventDefault();
                let _this = this,
                    arr = e.dataTransfer.getData('text/plain').split('@'),
                    moduleIndex = arr[0],
                    entityIndex = arr[1],
                    title = _this.projectData.modules[moduleIndex].entities[entityIndex].title,
                    nodeIsExist = _this.net.save().source.nodes.filter((item) => {
                        return item.title == title;
                    }).length > 0;

                if (!nodeIsExist) {
                    let paintRect = e.target.getBoundingClientRect(),
                        point = _this.net.invertPoint({
                            x: e.clientX - paintRect.left,
                            y: e.clientY - paintRect.top
                        });

                    _this.net.add('node', {
                        title: title,
                        moduleName: _this.projectData.modules[moduleIndex].name,
                        x: point.x,
                        y: point.y,
                        shape: 'dataTable'
                    });
                } else {
                    _this.$message.warning('创建模型失败，该数据表已经存在关系图之中');
                }
            }
        },
        created () {
            window.rdVmCache[this.curRelation.title] = this;
        },
        destroyed () {
            delete window.rdVmCache[this.curRelation.title];
        }
    };
</script>

<style>
    @import url('./tab-win-cont.css');
</style>
