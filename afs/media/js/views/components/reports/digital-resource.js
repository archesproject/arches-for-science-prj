define(['jquery','underscore', 'knockout', 'arches', 'viewmodels/tabbed-report', 'utils/resource'], function($, _, ko, arches, TabbedReportViewModel, resourceUtils) {
    return ko.components.register('digital-resource-report', {
        viewModel: function(params) {
            var self = this;
            params.configKeys = ['tabs', 'activeTabIndex'];
            TabbedReportViewModel.apply(this, [params]);

            if (params.summary) {

                this.editorLink = arches.urls.resource_editor + this.report.attributes.resourceid;

                var creatorId = 'de954e91-ca7a-11e9-af76-a4d18cec433a';
                this.creators = ko.observableArray([]);
                this.creatorObjs = resourceUtils.getNodeValues({
                    nodeId: creatorId,
                    returnTiles: false
                }, this.report.get('tiles'), this.report.graph);
                this.creatorObjs.forEach(function(creatorObj) {
                    if (creatorObj) {
                        resourceUtils.lookupResourceInstanceData(creatorObj.resourceId)
                            .then(function(data) {
                                self.creators.push({ name: data._source.displayname, link: arches.urls.resource_report + creatorObj.resourceId });
                            });
                    }});

                var descriptionConceptValueId = 'df8e4cf6-9b0b-472f-8986-83d5b2ca28a0';
                var statementTextId = 'da1fbca1-ca7a-11e9-8256-a4d18cec433a';
                var statementTypeId = 'da1fb430-ca7a-11e9-9ad3-a4d18cec433a';
                this.description = resourceUtils.getNodeValues({
                    nodeId: statementTextId,
                    where: {
                        nodeId: statementTypeId,
                        contains: descriptionConceptValueId
                    },
                    returnTiles: false
                }, this.report.get('tiles'), this.report.graph);

                this.ResourceTypeName = ko.observable();
                var ResourceType = '09c1778a-ca7b-11e9-860b-a4d18cec433a';

                this.ResourceTypeValue = resourceUtils.getNodeValues({
                    nodeId: ResourceType,
                    returnTiles: false
                }, this.report.get('tiles'), this.report.graph);

                if (this.ResourceTypeValue.length) {
                    $.ajax(arches.urls.concept_value + '?valueid=' + self.ResourceTypeValue, {
                        dataType: "json"
                    }).done(function(data) {
                        self.ResourceTypeName(data.value);
                    });
                }

                this.collections = ko.observableArray([]);
                var memberOfSetID = 'e19aee91-ca7c-11e9-98d8-a4d18cec433a';
                this.memberOfSets = resourceUtils.getNodeValues({
                    nodeId: memberOfSetID,
                    returnTiles: false
                }, this.report.get('tiles'), this.report.graph);
                this.memberOfSets.forEach(function(memberOfSet) {
                    if (memberOfSet) {
                        resourceUtils.lookupResourceInstanceData(memberOfSet.resourceId)
                            .then(function(data) {
                                self.collections.push({ name: data._source.displayname, link: arches.urls.resource_report + memberOfSet.resourceId });
                            });
                    }});

                this.files = ko.observableArray([]);
                var filesId = '7c486328-d380-11e9-b88e-a4d18cec433a';
                this.fileValues = resourceUtils.getNodeValues({
                    nodeId: filesId,
                    returnTiles: false
                }, this.report.get('tiles'), this.report.graph);

                this.fileValues.forEach(function(fileValue) {
                    self.files.push({ name: fileValue.name, link: fileValue.url });
                });
            }
        },
        template: { require: 'text!templates/views/components/reports/digital-resource.htm' }
    });
});
