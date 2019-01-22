export default {
    "profile": {
        "defaultFields": [
            {
                "name": "REVISION",
                "type": "Integer",
                "remark": "",
                "chnname": "乐观锁"
            },
            {
                "name": "CREATED_BY",
                "type": "IdOrKey",
                "remark": "",
                "chnname": "创建人"
            },
            {
                "name": "CREATED_TIME",
                "type": "DateTime",
                "remark": "",
                "chnname": "创建时间"
            },
            {
                "name": "UPDATED_BY",
                "type": "IdOrKey",
                "remark": "",
                "chnname": "更新人"
            },
            {
                "name": "UPDATED_TIME",
                "type": "DateTime",
                "remark": "",
                "chnname": "更新时间"
            }
        ],
        "defaultHeaders": [
            {
                "fieldName": "chnname",
                "relationNoShow": true
            },
            {
                "fieldName": "name",
                "relationNoShow": true
            },
            {
                "fieldName": "type",
                "relationNoShow": true
            },
            {
                "fieldName": "dataType",
                "relationNoShow": false
            },
            {
                "fieldName": "remark",
                "relationNoShow": false
            },
            {
                "fieldName": "pk",
                "relationNoShow": true
            },
            {
                "fieldName": "notNull",
                "relationNoShow": false
            },
            {
                "fieldName": "autoIncrement",
                "relationNoShow": false
            },
            {
                "fieldName": "defaultValue",
                "relationNoShow": false
            },
            {
                "fieldName": "relationNoShow",
                "relationNoShow": false
            }
        ],
        "defaultDataTypeDomains": {
            "datatype": [
                {
                    "name": "默认字串",
                    "code": "DefaultString",
                    "apply": {
                        "MYSQL": {
                            "type": "VARCHAR(32)"
                        },
                        "ORACLE": {
                            "type": "NVARCHAR2(32)"
                        }
                    }
                },
                {
                    "name": "标识号",
                    "code": "IdOrKey",
                    "apply": {
                        "MYSQL": {
                            "type": "VARCHAR(32)"
                        },
                        "ORACLE": {
                            "type": "VARCHAR2(32)"
                        }
                    }
                },
                {
                    "name": "名称",
                    "code": "Name",
                    "apply": {
                        "MYSQL": {
                            "type": "VARCHAR(128)"
                        },
                        "ORACLE": {
                            "type": "NVARCHAR2(128)"
                        }
                    }
                },
                {
                    "name": "备注说明",
                    "code": "Intro",
                    "apply": {
                        "MYSQL": {
                            "type": "VARCHAR(512)"
                        },
                        "ORACLE": {
                            "type": "NVARCHAR2(512)"
                        }
                    }
                },
                {
                    "name": "字串-短",
                    "code": "ShortString",
                    "apply": {
                        "MYSQL": {
                            "type": "VARCHAR(128)"
                        },
                        "ORACLE": {
                            "type": "NVARCHAR2(128)"
                        }
                    }
                },
                {
                    "name": "字串-中",
                    "code": "MiddleString",
                    "apply": {
                        "MYSQL": {
                            "type": "VARCHAR(1024)"
                        },
                        "ORACLE": {
                            "type": "NVARCHAR2(1024)"
                        }
                    }
                },
                {
                    "name": "字串-长",
                    "code": "LongString",
                    "apply": {
                        "MYSQL": {
                            "type": "VARCHAR(3120)"
                        },
                        "ORACLE": {
                            "type": "NVARCHAR2(3120)"
                        }
                    }
                },
                {
                    "name": "大文本",
                    "code": "LongText",
                    "apply": {
                        "MYSQL": {
                            "type": "TEXT"
                        },
                        "ORACLE": {
                            "type": "CLOB"
                        }
                    }
                },
                {
                    "name": "小数",
                    "code": "Double",
                    "apply": {
                        "MYSQL": {
                            "type": "DECIMAL(64,16)"
                        },
                        "ORACLE": {
                            "type": "NUMBER(64,16)"
                        }
                    }
                },
                {
                    "name": "比例",
                    "code": "Ratio",
                    "apply": {
                        "MYSQL": {
                            "type": "DECIMAL(4,2)"
                        },
                        "ORACLE": {
                            "type": "NUMBER(4,2)"
                        }
                    }
                },
                {
                    "name": "整数",
                    "code": "Integer",
                    "apply": {
                        "MYSQL": {
                            "type": "INT"
                        },
                        "ORACLE": {
                            "type": "INT"
                        }
                    }
                },
                {
                    "name": "金额",
                    "code": "Money",
                    "apply": {
                        "MYSQL": {
                            "type": "DECIMAL(32,8)"
                        },
                        "ORACLE": {
                            "type": "NUMBER(32,8)"
                        }
                    }
                },
                {
                    "name": "是否",
                    "code": "YesNo",
                    "apply": {
                        "MYSQL": {
                            "type": "VARCHAR(1)"
                        },
                        "ORACLE": {
                            "type": "VARCHAR2(1)"
                        }
                    }
                },
                {
                    "name": "数据字典",
                    "code": "Dict",
                    "apply": {
                        "MYSQL": {
                            "type": "VARCHAR(32)"
                        },
                        "ORACLE": {
                            "type": "VARCHAR2(32)"
                        }
                    }
                },
                {
                    "name": "日期",
                    "code": "Date",
                    "apply": {
                        "MYSQL": {
                            "type": "DATE"
                        },
                        "ORACLE": {
                            "type": "DATE"
                        }
                    }
                },
                {
                    "name": "日期时间",
                    "code": "DateTime",
                    "apply": {
                        "MYSQL": {
                            "type": "DATETIME"
                        },
                        "ORACLE": {
                            "type": "DATE"
                        }
                    }
                }
            ],
            "database": [
                {
                    "code": "MYSQL",
                    "template": "DROP TABLE {{=it.entity.title}};\n$blankline\nCREATE TABLE {{=it.entity.title}}(\n{{ pkList = [] ; }}\n{{~it.entity.fields:field:index}}\n    {{? field.pk }}{{ pkList.push(field.name) }}{{?}}\n    {{=field.name}} {{=field.type}} {{= field.pk ? 'NOT NULL' : '' }} COMMENT '{{=it.func.join(field.chnname,field.remark,';')}}' {{= index < it.entity.fields.length-1 ? ',' : ( pkList.length>0 ? ',' :'' ) }}\n{{~}}\n{{? pkList.length >0 }}\n    PRIMARY KEY ({{~pkList:pkName:i}}{{= pkName }}{{= i<pkList.length-1 ? ',' : '' }}{{~}})\n{{?}}\n) COMMENT = '{{=it.func.join(it.entity.chnname,it.entity.remark,';') }}'",
                    "fileShow": true,
                    "defaultDatabase": true,
                    "createTableTemplate": "CREATE TABLE {{=it.entity.title}}(\n{{ pkList = [] ; }}\n{{~it.entity.fields:field:index}}\n    {{? field.pk }}{{ pkList.push(field.name) }}{{?}}\n    {{=field.name}} {{=field.type}} {{= field.notNull ? 'NOT NULL' : '' }} {{= field.autoIncrement ? 'AUTO_INCREMENT' : '' }} {{= field.defaultValue ? it.func.join('DEFAULT',field.defaultValue,' ') : '' }} COMMENT '{{=it.func.join(field.chnname,field.remark,' ')}}' {{= index < it.entity.fields.length-1 ? ',' : ( pkList.length>0 ? ',' :'' ) }}\n{{~}}\n{{? pkList.length >0 }}\n    PRIMARY KEY ({{~pkList:pkName:i}}{{= pkName }}{{= i<pkList.length-1 ? ',' : '' }}{{~}})\n{{?}}\n) COMMENT = '{{=it.func.join(it.entity.chnname,it.entity.remark,' ') }}';",
                    "deleteTableTemplate": "DROP TABLE {{=it.entity.title}};/*SkipError*/",
                    "rebuildTableTemplate": "create table PDMAN_UP_{{=it.oldEntity.title}}\nas select * from {{=it.oldEntity.title}};{{=it.separator}}\n$blankline\n\ndrop table {{=it.oldEntity.title}};{{=it.separator}}\n$blankline\n\nCREATE TABLE {{=it.newEntity.title}}(\n{{ pkList = [] ; }}\n{{~it.newEntity.fields:field:index}}\n    {{? field.pk }}{{ pkList.push(field.name) }}{{?}}\n    {{=field.name}} {{=field.type}} {{= field.notNull ? 'NOT NULL' : '' }} COMMENT '{{=it.func.join(field.chnname,field.remark,';')}}' {{= index < it.newEntity.fields.length-1 ? ',' : ( pkList.length>0 ? ',' :'' ) }}\n{{~}}\n{{? pkList.length >0 }}\n    PRIMARY KEY ({{~pkList:pkName:i}}{{= pkName }}{{= i<pkList.length-1 ? ',' : '' }}{{~}})\n{{?}}\n) COMMENT = '{{=it.func.join(it.newEntity.chnname,it.newEntity.remark,';') }}';{{=it.separator}}\n$blankline\n\n{{ sameCols = it.func.intersect(it.newEntity.fields,it.newEntity.fields) ;}}\ninsert into {{=it.newEntity.title}}(\n{{~sameCols:field:index}}\n    {{=field.name}}{{? index<it.newEntity.fields.length-1}},{{?}}\n{{~}}\n) \nvalues\nselect \n{{~sameCols:field:index}}\n    {{=field.name}}{{? index<it.oldEntity.fields.length-1}},{{?}}\n{{~}}\nfrom PDMAN_UP_{{=it.oldEntity.title}};{{=it.separator}}\n$blankline\n\ndrop table PDMAN_UP_{{=it.oldEntity.title}};{{=it.separator}}",
                    "createFieldTemplate": "ALTER TABLE {{=it.entity.title}} ADD COLUMN {{=it.field.name}} {{=it.field.type}} {{? it.field.notNull}}NOT NULL{{?}} {{? ''!=it.field.defaultValue}}DEFAULT {{? null==it.field.defaultValue}}NULL{{??}}'{{=it.field.defaultValue}}'{{?}}{{?}} {{? it.field.autoIncrement}}AUTO_INCREMENT{{?}} {{? it.field.pk}}PRIMARY KEY{{?}} {{? it.field.chnname}}COMMENT '{{=it.field.chnname}}'{{?}} {{? it.field.addAfter}}AFTER {{=it.field.addAfter}}{{?}};",
                    "updateFieldTemplate": "ALTER TABLE {{=it.entity.title}} MODIFY COLUMN {{=it.field.name}} {{=it.field.type}} {{? it.field.notNull}}NOT NULL{{?}} {{? ''!=it.field.defaultValue}}DEFAULT {{? null==it.field.defaultValue}}NULL{{??}}'{{=it.field.defaultValue}}'{{?}}{{?}} {{? it.field.autoIncrement}}AUTO_INCREMENT{{?}} {{? it.field.chnname}}COMMENT '{{=it.field.chnname}}'{{?}};",
                    "deleteFieldTemplate": "ALTER TABLE {{=it.entity.title}} DROP {{=it.field.name}};",
                    "deleteIndexTemplate": "ALTER TABLE {{=it.entity.title}} DROP INDEX {{=it.index.name}};",
                    "createIndexTemplate": "ALTER TABLE {{=it.entity.title}} ADD {{? it.index.isUnique}}UNIQUE{{?}} {{=it.index.name}}({{=it.func.join(...it.index.fields,',')}});",
                    "updateTableComment": "ALTER TABLE {{=it.entity.title}} COMMENT '{{=it.entity.chnname}}';"
                },
                {
                    "code": "ORACLE",
                    "template": "DROP TABLE {{=it.entity.title}};\n$blankline\nCREATE TABLE {{=it.entity.title}}(\n{{ pkList = [] ; }}\n{{~it.entity.fields:field:index}}\n    {{? field.pk }}{{ pkList.push(field.name) }}{{?}}\n    {{=field.name}} {{=field.type}}  {{= field.pk ? 'NOT NULL' : '' }} {{= index < it.entity.fields.length-1 ? ',' : ( pkList.length>0 ? ',' :'' ) }}\n{{~}}\n{{? pkList.length >0 }}\n    PRIMARY KEY ({{~pkList:pkName:i}}{{= pkName }}{{= i<pkList.length-1 ? ',' : '' }}{{~}})\n{{?}}\n);\n$blankline\nCOMMENT ON TABLE {{=it.entity.title}} IS '{{=it.func.join(it.entity.chnname,it.entity.remark,';') }}';\n{{~it.entity.fields:field:index}}\nCOMMENT ON COLUMN {{=it.entity.title}}.{{=field.name}} IS '{{=it.func.join(field.chnname,field.remark,';')}}';\n{{~}}",
                    "createTableTemplate": "CREATE TABLE {{=it.entity.title}}(\n{{ pkList = [] ; }}\n{{~it.entity.fields:field:index}}\n    {{? field.pk }}{{ pkList.push(field.name) }}{{?}}\n    {{=field.name}} {{=field.type}}{{? field.defaultValue}} DEFAULT {{=field.defaultValue}}{{?}}{{= field.notNull ? ' NOT NULL' : '' }}{{= index < it.entity.fields.length-1 ? ',' : ( pkList.length>0 ? ',' :'' ) }}\n{{~}}\n{{? pkList.length >0 }}\n    PRIMARY KEY ({{~pkList:pkName:i}}{{= pkName }}{{= i<pkList.length-1 ? ',' : '' }}{{~}})\n{{?}}\n);\n$blankline\n{{? it.entity.chnname || it.entity.remark}}COMMENT ON TABLE {{=it.entity.title}} IS {{? it.entity.remark}}'{{=it.entity.remark}}'{{??}}'{{=it.entity.chnname}}'{{?}};{{?}}\n{{~it.entity.fields:field:index}}\n{{? field.chnname || field.remark}}COMMENT ON COLUMN {{=it.entity.title}}.{{=field.name}} IS {{? field.remark}}'{{=field.remark}}'{{??}}'{{=field.chnname}}'{{?}};{{?}}\n{{~}}",
                    "deleteTableTemplate": "DROP TABLE {{=it.entity.title}};/*SkipError*/\r\n$blankline",
                    "rebuildTableTemplate": "CREATE TABLE PDMAN_UP_{{=it.oldEntity.title}}\nAS SELECT * FROM {{=it.oldEntity.title}};{{=it.separator}}\n$blankline\nDROP TABLE {{=it.oldEntity.title}};{{=it.separator}}\n$blankline\nCREATE TABLE {{=it.newEntity.title}}(\n{{ pkList = [] ; }}{{~it.newEntity.fields:field:index}}{{? field.pk }}{{ pkList.push(field.name) }}{{?}}    {{=field.name}} {{=field.type}}{{? field.defaultValue}} DEFAULT {{=field.defaultValue}}{{?}}{{= field.notNull ? ' NOT NULL' : '' }}{{= index < it.newEntity.fields.length-1 ? ',' : ( pkList.length>0 ? ',' :'' ) }}\n{{~}}{{? pkList.length >0 }}    PRIMARY KEY ({{~pkList:pkName:i}}{{= pkName }}{{= i<pkList.length-1 ? ',' : '' }}{{~}}){{?}}\n);{{=it.separator}}\n$blankline\n{{? it.newEntity.chnname || it.newEntity.remark}}COMMENT ON TABLE {{=it.newEntity.title}} IS {{? it.newEntity.remark}}'{{=it.entity.remark}}'{{??}}'{{=it.newEntity.chnname}}'{{?}};{{?}}{{=it.separator}}\n{{~it.newEntity.fields:field:index}}\n{{? field.chnname || field.remark}}COMMENT ON COLUMN {{=it.newEntity.title}}.{{=field.name}} IS {{? field.remark}}'{{=field.remark}}'{{??}}'{{=field.chnname}}'{{?}};{{?}}{{=it.separator}}\n{{~}}\n{{ sameCols = it.func.intersect(it.newEntity.fields,it.newEntity.fields) ;}}\n$blankline\nINSERT INTO {{=it.newEntity.title}}(\n{{~sameCols:field:index}}   {{=field.name}}{{? index<it.newEntity.fields.length-1}},{{?}}\n{{~}}) \nVALUES\nSELECT\n{{~sameCols:field:index}}   {{=field.name}}{{? index<it.oldEntity.fields.length-1}},{{?}}\n{{~}}FROM PDMAN_UP_{{=it.oldEntity.title}};{{=it.separator}}\n\nDROP TABLE PDMAN_UP_{{=it.oldEntity.title}};{{=it.separator}}",
                    "createFieldTemplate": "ALTER TABLE {{=it.entity.title}} ADD({{=it.field.name}} {{=it.field.type}}{{? it.field.defaultValue}} DEFAULT {{=it.field.defaultValue}}{{?}}{{? it.field.notNull}} NOT NULL{{?}});\r\n{{? it.field.chnname || it.field.remark}}COMMENT ON COLUMN {{=it.entity.title}}.{{=it.field.name}} IS {{? it.field.remark}}'{{=it.field.remark}}'{{??}}'{{=it.field.chnname}}'{{?}};{{?}}\r\n$blankline",
                    "updateFieldTemplate": "ALTER TABLE {{=it.entity.title}} MODIFY({{=it.field.name}} {{=it.field.type}}{{? it.field.defaultValue}} DEFAULT {{=it.field.defaultValue}}{{?}}{{? it.field.notNull}} NOT NULL{{?}});\r\n{{? it.field.chnname || it.field.remark}}COMMENT ON COLUMN {{=it.entity.title}}.{{=it.field.name}} IS {{? it.field.remark}}'{{=it.field.remark}}'{{??}}'{{=it.field.chnname}}'{{?}};{{?}}\r\n$blankline",
                    "deleteFieldTemplate": "ALTER TABLE {{=it.entity.title}} DROP({{=it.field.name}});\r\n$blankline",
                    "deleteIndexTemplate": "DROP INDEX {{=it.entity.title}}.{{=it.index.name}};\r\n$blankline",
                    "createIndexTemplate": "CREATE{{? it.index.isUnique}} UNIQUE{{?}} INDEX {{=it.index.name}} ON {{=it.entity.title}}({{=it.func.join(it.index.fields,',')}});\r\n$blankline",
                    "updateTableComment": "{{? it.entity.chnname || it.entity.remark}}COMMENT ON TABLE {{=it.entity.title}} IS {{? it.entity.remark}}'{{=it.entity.remark}}'{{??}}'{{=it.entity.chnname}}'{{?}};{{?}}\r\n$blankline"
                }
            ]
        }
    },
    "previewData": {
        "module": {
            "name": "AUTH-用户安全"
        },
        "entity": {
            "title": "AUTH_USER",
            "fields": [
                {
                    "name": "ID",
                    "type": "VARCHAR(32)",
                    "remark": "",
                    "chnname": "用户ID",
                    "pk": true,
                    "notNull": true,
                    "autoIncrement": true,
                    "defaultValue": "1"
                },
                {
                    "name": "CODE",
                    "type": "VARCHAR(32)",
                    "remark": "",
                    "chnname": "用户代码",
                    "pk": false,
                    "notNull": true,
                    "autoIncrement": false,
                    "defaultValue": "1"
                },
                {
                    "name": "NAME",
                    "type": "VARCHAR(32)",
                    "remark": "",
                    "chnname": "用户名"
                },
                {
                    "name": "PASSWORD",
                    "type": "VARCHAR(32)",
                    "remark": "",
                    "chnname": "密码"
                },
                {
                    "name": "SALT",
                    "type": "VARCHAR(32)",
                    "remark": "",
                    "chnname": "密码盐值"
                },
                {
                    "name": "AVATAR",
                    "type": "VARCHAR(32)",
                    "remark": "",
                    "chnname": "头像"
                },
                {
                    "name": "ORG_ID",
                    "type": "VARCHAR(32)",
                    "remark": "",
                    "chnname": "机构"
                },
                {
                    "name": "EMAIL",
                    "type": "VARCHAR(32)",
                    "remark": "",
                    "chnname": "邮件"
                },
                {
                    "name": "PHONE",
                    "type": "VARCHAR(32)",
                    "remark": "",
                    "chnname": "手机号"
                },
                {
                    "name": "STATUS",
                    "type": "VARCHAR(32)",
                    "remark": "",
                    "chnname": "状态"
                },
                {
                    "name": "REVISION",
                    "type": "VARCHAR(32)",
                    "remark": "",
                    "chnname": "乐观锁",
                    "relationNoShow": false
                },
                {
                    "name": "CREATED_BY",
                    "type": "VARCHAR(32)",
                    "remark": "",
                    "chnname": "创建人",
                    "relationNoShow": false
                },
                {
                    "name": "CREATED_TIME",
                    "type": "VARCHAR(32)",
                    "remark": "",
                    "chnname": "创建时间",
                    "relationNoShow": false
                },
                {
                    "name": "UPDATED_BY",
                    "type": "VARCHAR(32)",
                    "remark": "",
                    "chnname": "更新人",
                    "relationNoShow": false
                },
                {
                    "name": "UPDATED_TIME",
                    "type": "VARCHAR(32)",
                    "remark": "",
                    "chnname": "更新时间",
                    "relationNoShow": false
                }
            ],
            "chnname": "用户信息",
            "indexs": [
                {
                    "name": "AUTH_USER_INDEX1",
                    "isUnique": true,
                    "fields": [
                        "ID",
                        "CODE"
                    ]
                },
                {
                    "name": "AUTH_USER_INDEX2",
                    "isUnique": false,
                    "fields": [
                        "NAME",
                        "PASSWORD"
                    ]
                }
            ]
        },
        "separator": "/*SQL@Run*/"
    }
};
