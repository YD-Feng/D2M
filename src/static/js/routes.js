export default [
    {
        path: '/',
        name: 'wrap',
        component: (resolve) => {
            require.ensure(['../views/wrap.vue'], (require) => {
                resolve(require('../views/wrap.vue'));
            }, 'wrap');
        },
        children: [
            {
                path: '',
                name: 'home',
                component: (resolve) => {
                    require.ensure(['../views/home.vue'], (require) => {
                        resolve(require('../views/home.vue'));
                    }, 'home');
                }
            },
            {
                path: '/editor',
                name: 'editor',
                component: (resolve) => {
                    require.ensure(['../views/editor/main.vue'], (require) => {
                        resolve(require('../views/editor/main.vue'));
                    }, 'editor');
                }
            }
        ]
    }
];
