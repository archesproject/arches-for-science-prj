define([
    'knockout',
    'uuid',
    'arches',
    'views/components/workflows/summary-step',
], function(ko, uuid, arches, SummaryStep) {

    function viewModel(params) {
        var self = this;
        SummaryStep.apply(this, [params]);

        this.resourceData.subscribe(function(val){
            this.reportVals = {
                projectName: {'name': 'Project', 'value': this.getResourceValue(val.resource, ['part of','@value'])},
                sampledObjectName: {'name': 'Sampled Object', 'value': this.getResourceValue(val.resource['Sampling Unit'][0], ['Sampling Area','Overall Object Sampled','@value'])},
                samplers: {'name': 'Samplers', 'value': this.getResourceValue(val.resource, ['carried out by','@value'])},
                samplingDate: {'name': 'Sampling Date', 'value': this.getResourceValue(val.resource, ['TimeSpan','TimeSpan_begin of the begin','@value'])},
                statement: {'name': 'Technique', 'value': this.getResourceValue(val.resource['Statement'][0], ['Statement_content','@value'])},
                samplingActivityName: {'name': 'Sampling Activity Name', 'value': this.getResourceValue(val.resource, ['Name','Name_content','@value'])},
            };

            var annotationStr = self.getResourceValue(val.resource['Sampling Unit'][0],['Sampling Area','Sampling Area Identification','Sampling Area Visualization','@value']);
            if (annotationStr){
                var annotationJson = JSON.parse(annotationStr.replaceAll("'",'"'));
                this.prepareAnnotation(annotationJson);
            }

            try {
                this.reportVals.samplingUnits = val.resource['Sampling Unit'].map(function(val){
                    return {
                        obsName:  {'name': 'Observation Name', 'value': self.getResourceValue(val, ['Sample Created','@value'])},
                        samplingArea: {'name': 'Sampling Area', 'value': self.getResourceValue(val, ['Sampling Area','Overall Object Sampled','@value'])}
                    };
                });
            } catch(e) {
                console.log(e);
                this.reportVals.annotations = [];
            }
        
            this.loading(false);
        }, this);
    }

    ko.components.register('sample-taking-final-step', {
        viewModel: viewModel,
        template: { require: 'text!templates/views/components/workflows/sample-taking-workflow/sample-taking-final-step.htm' }
    });
    return viewModel;
});
