module.exports = {
    state: {
        projectName: '',
        projectPath: '',
        projectData: null,
        compareData: null
    },
    mutations: {
        setProjectName: function (state, projectName) {
            state.projectName = projectName;
        },
        setProjectPath: function (state, projectPath) {
            state.projectPath = projectPath;
        },
        setProjectData: function (state, projectData) {
            state.projectData = projectData;
        },
        setCompareData: function (state, compareData) {
            state.compareData = compareData;
        }
    }
};
