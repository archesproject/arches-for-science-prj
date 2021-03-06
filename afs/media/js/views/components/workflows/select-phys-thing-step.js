define([
    'knockout',
    'utils/resource',
    'viewmodels/card',
], function(ko, resourceUtils) {
    
    function viewModel(params) {
        var self = this;
        var componentParams = params.form.componentData.parameters;
        this.physThingSetNodegroupId = 'cc5d6df3-d477-11e9-9f59-a4d18cec433a';
        this.physicalThingPartOfSetNodeId = '63e49254-c444-11e9-afbe-a4d18cec433a';
        this.save = params.form.save;
        this.physicalThingGraphId = componentParams.graphids[0];
        this.projectGraphId = componentParams.graphids[1];
        this.projectValue = ko.observable();
        this.physicalThingValue = ko.observable();
        this.physicalThingSetValue = ko.observable();
        this.hasSetWithPhysicalThing = ko.observable();
        
        this.updateValues = function(val){
            if (val === null) {
                self.physicalThingValue(null);
                self.physicalThingSetValue(null);
                self.projectValue(null);
            } else {
                self.physicalThingValue(val.physicalThing);
                self.physicalThingSetValue(val.physicalThingSet);
                self.projectValue(val.project);
            }
        };

        if (params.value()) { 
            this.updateValues(params.value());
        }

        this.locked = params.form.locked;

        params.form.value.subscribe(function(val){
            this.updateValues(val);
        }, this);
        
        this.projectValue.subscribe(function(val){
            if (val) {
                var res = resourceUtils.lookupResourceInstanceData(val);
                res.then(
                    function(data){
                        let setTileResourceInstanceIds;
                        let setTile = data._source.tiles.find(function(tile){
                            return tile.nodegroup_id === self.physThingSetNodegroupId;
                        });
                        if (setTile && Object.keys(setTile.data).includes(self.physThingSetNodegroupId) && setTile.data[self.physThingSetNodegroupId].length) {
                            self.physicalThingSetValue(null);
                            setTileResourceInstanceIds = setTile.data[self.physThingSetNodegroupId].map((instance) => instance.resourceId);
                            if (setTileResourceInstanceIds) {
                                self.physicalThingSetValue(setTileResourceInstanceIds);
                            }
                            self.physicalThingValue(null);
                        } else {
                            self.hasSetWithPhysicalThing(false);
                        }
                    }
                );
            } else {
                self.updateValues(null);
            }
        });

        this.termFilter = ko.pureComputed(function(){
            if (ko.unwrap(self.physicalThingSetValue)) {
                self.hasSetWithPhysicalThing(true);
                var query = {"op": "and"};
                query[self.physicalThingPartOfSetNodeId] = {
                    "op": "or",
                    "val":  ko.unwrap(self.physicalThingSetValue)
                };
                return function(term, data) {
                    data["advanced-search"] = JSON.stringify([query]);
                    if (term) {
                        data["term-filter"]=JSON.stringify([{"context":"", "id": term,"text": term,"type":"term","value": term,"inverted":false}]);
                    }
                };
            } else {
                return null;
            }
        });

        this.physicalThingValue.subscribe(function(val){
            if (val) {
                var physThing = resourceUtils.lookupResourceInstanceData(val);
                physThing.then(function(data){
                    params.value({
                        physThingName: data._source.displayname,
                        physicalThing: val,
                        physicalThingSet: self.physicalThingSetValue(),
                        project: self.projectValue(),
                    });
                });
            }
        });
    }

    ko.components.register('select-phys-thing-step', {
        viewModel: viewModel,
        template: {
            require: 'text!templates/views/components/workflows/upload-dataset/select-phys-thing-step.htm'
        }
    });

    return viewModel;
});
