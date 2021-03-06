define([
    'knockout',
    'jquery',
    'arches',
    'viewmodels/workflow',
    'viewmodels/workflow-step',
    'views/components/workflows/create-project-workflow/create-project-final-step'
], function(ko, $, arches, Workflow) {
    return ko.components.register('create-project-workflow', {
        viewModel: function(params) {
            var self = this;

            this.resourceId = ko.observable();

            params.steps = [
                {
                    title: 'Project Name',
                    name: 'set-project-name',  /* unique to workflow */
                    description: 'Identify the project and its objectives',
                    component: 'views/components/workflows/new-tile-step',
                    componentname: 'new-tile-step',
                    graphid: '0b9235d9-ca85-11e9-9fa2-a4d18cec433a',
                    nodegroupid: '0b926359-ca85-11e9-ac9c-a4d18cec433a',
                    resourceid: null,
                    tileid: null,
                    parenttileid: null,
                    required: true,
                    shouldtrackresource: true,
                    wastebin: {resourceid: null, description: 'a project instance'}
                },
                {
                    title: 'Project Statement',
                    name: 'set-project-statement',  /* unique to workflow */
                    description: 'Set the Project Statement',
                    component: 'views/components/workflows/new-tile-step',
                    componentname: 'new-tile-step',
                    graphid: '0b9235d9-ca85-11e9-9fa2-a4d18cec433a',
                    nodegroupid: '0b92a414-ca85-11e9-b725-a4d18cec433a',
                    resourceid: null,
                    tileid: null,
                    parenttileid: null,
                    required: false,
                },
                {
                    title: 'Project Timespan',
                    name: 'set-project-timespan',  /* unique to workflow */
                    description: 'Consultation Dates',
                    component: 'views/components/workflows/new-tile-step',
                    componentname: 'new-tile-step',
                    hiddenNodes: ['0b92f57d-ca85-11e9-a353-a4d18cec433a', '0b931623-ca85-11e9-b235-a4d18cec433a', '0b930905-ca85-11e9-8aca-a4d18cec433a'],
                    graphid: '0b9235d9-ca85-11e9-9fa2-a4d18cec433a',
                    nodegroupid: '0b925e3a-ca85-11e9-a308-a4d18cec433a',
                    resourceid: null,
                    tileid: null,
                    parenttileid: null,
                    required: true,
                },
                {
                    title: 'Project Team',
                    name: 'set-project-team',  /* unique to workflow */
                    description: 'Consultation Details',
                    component: 'views/components/workflows/new-tile-step',
                    componentname: 'new-tile-step',
                    graphid: '0b9235d9-ca85-11e9-9fa2-a4d18cec433a',
                    nodegroupid: 'dbaa2022-9ae7-11ea-ab62-dca90488358a',
                    resourceid: null,
                    tileid: null,
                    parenttileid: null,
                    required: false,
                },
                {
                    title: 'Add Things to Your Set',
                    name: 'object-search-step',  /* unique to workflow */
                    description: 'Add Physical Things to Your Set',
                    component: 'views/components/workflows/research-collection-step',
                    componentname: 'research-collection-step',
                    graphid: '1b210ef3-b25c-11e9-a037-a4d18cec433a', //Collection graph
                    nodegroupid: '466f81d4-c451-11e9-b7c9-a4d18cec433a', //Curation in Collection
                    nodeid: '466fa421-c451-11e9-9a6d-a4d18cec433a', //Curation_used in Collection (physical thing)
                    externalstepdata: { 
                        researchactivitystep: 'set-project-name',
                    },
                    resourceid: null,
                    tileid: null,
                    parenttileid: null,
                    required: true,
                    wastebin: {resourceid: null, description: 'a collection instance'}
                },
                {
                    title: 'Summary',
                    name: 'add-project-complete',  /* unique to workflow */
                    description: 'Summary',
                    component: 'views/components/workflows/component-based-step',
                    componentname: 'component-based-step',
                    graphid: '0b9235d9-ca85-11e9-9fa2-a4d18cec433a',
                    nodegroupid: '',
                    resourceid: null,
                    tileid: null,
                    parenttileid: null,
                    externalstepdata: { 
                        addphysthingstep: 'object-search-step',
                    },
                    layoutSections: [
                        {
                            componentConfigs: [
                                { 
                                    componentName: 'create-project-final-step',
                                    uniqueInstanceName: 'create-project-final',
                                    tilesManaged: 'none',
                                    parameters: {
                                    },
                                },
                            ], 
                        },
                    ],
                }
            ];

            Workflow.apply(this, [params]);
            this.quitUrl = arches.urls.plugin('init-workflow');
            self.getJSON('create-project-workflow');

            self.ready(true);
        },
        template: { require: 'text!templates/views/components/plugins/create-project-workflow.htm' }
    });
});
