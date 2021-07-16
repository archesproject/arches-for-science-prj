define([
    'arches',
    'uuid',
    'knockout',
    'utils/resource',
    'viewmodels/card',
], function(arches, uuid, ko, resourceUtils) {
   
    function viewModel(params) {

        var self = this;
        const instrumentNodeId = '1acc9d59-c458-11e9-99e4-a4d18cec433a';
        const procedureNodeId =  '51416e9c-c458-11e9-b70e-a4d18cec433a';
        const parameterNodeId = '8ec331a1-c457-11e9-8d7a-a4d18cec433a';
        const parameterNodeGroupId = '8ec30d3a-c457-11e9-81dc-a4d18cec433a'; // parameter are 'Statement' cards
        const nameNodeGroupId = '87e3d6a1-c457-11e9-9ec9-a4d18cec433a';
        const nameNodeId = '87e40cc5-c457-11e9-8933-a4d18cec433a';
        const projectInfo = params.form.externalStepData.projectinfo.data['select-phys-thing-step'][0][1];
        const physThingName = projectInfo.physThingName;
        const observedThingNodeId = 'cd412ac5-c457-11e9-9644-a4d18cec433a';
        const observedThingInstanceId = projectInfo.physicalThing;
        const projectInstanceId = projectInfo.project;
        const projectNodeId = '736f06a4-c54d-11ea-9f58-024e0d439fdb';

        const getProp = function(key, prop) {
            if (ko.unwrap(params.value) && params.value()[key])
                return params.value()[key][prop] || params.value()[key];
            else {
                return null;
            } 
        };

        let parameterTileId = getProp('parameter', 'tileid');
        let instrumentTileId = getProp('instrument', 'tileid');
        let procedureTileId = getProp('procedure', 'tileid');
        let projectTileId = getProp('project', 'tileid');
        let observedThingTileid = getProp('observedThing', 'tileid');
        let nameTileId = getProp('name', 'tileid');

        this.instrumentValue = ko.observable(getProp('instrument', 'value'));
        this.procedureValue = ko.observable(getProp('procedure', 'value'));
        this.parameterValue = ko.observable(getProp('parameter', 'value'));
        this.nameValue = ko.observable(getProp('name', 'value'));
        this.observationInstanceId = ko.observable(getProp('observationInstanceId'));
        this.showName = ko.observable(false);

        const snapshot = {
            instrumentValue: self.instrumentValue(),
            procedureValue: self.procedureValue(),
            parameterValue: self.parameterValue()
        };

        this.createRelatedInstance = function(val){
            return [{
                resourceId: val,
                ontologyProperty: "",
                inverseOntologyProperty: ""
            }];
        };

        this.instrumentInstance = ko.observable(this.instrumentValue() ? this.createRelatedInstance(this.instrumentValue()) : null);
        this.procedureInstance = ko.observable(this.procedureValue() ? this.createRelatedInstance(this.procedureValue()) : null);

        this.instrumentValue.subscribe(function(val){
            if (val) {
                let instrumentData = resourceUtils.lookupResourceInstanceData(val);
                self.instrumentInstance(self.createRelatedInstance(val));
                instrumentData.then(function(data){
                    self.nameValue("Observation of " + physThingName + " with " + data._source.displayname);
                });
            }
        });

        this.procedureValue.subscribe(function(val){
            self.procedureInstance(self.createRelatedInstance(val));
        });

        this.updatedValue = ko.pureComputed(function(){
            return {
                instrument: {value: self.instrumentValue(), tileid: instrumentTileId},
                procedure: {value: self.procedureValue(), tileid: procedureTileId},
                parameter: {value: self.parameterValue(), tileid: parameterTileId},
                name: {value: self.nameValue(), tileid: nameTileId},
                observedThing: {tileid: observedThingTileid},
                project: {tileid: projectTileId},
                observationInstanceId: self.observationInstanceId()
            };
        });

        this.updatedValue.subscribe(function(val){
            params.value(val);
        });

        this.buildTile = function(data, nodeGroupId, resourceid, tileid) {
            let res = {
                "tileid": tileid || "",
                "nodegroup_id": nodeGroupId,
                "parenttile_id": null,
                "resourceinstance_id": resourceid,
                "sortorder": 0,
                "tiles": {},
                "data": {}
            };
            res.data = data;
            return res;
        };

        this.saveTile = function(data, nodeGroupId, resourceid, tileid) {
            let tile = self.buildTile(data, nodeGroupId, resourceid, tileid);
            return window.fetch(arches.urls.api_tiles(tileid || uuid.generate()), {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify(tile),
                headers: {
                    'Content-Type': 'application/json'
                },
            }).then(function(response) {
                if (response.ok) {
                    return response.json();
                }
            });
        };

        params.form.reset = function(){
            self.instrumentValue(snapshot.instrumentValue);
            self.procedureValue(snapshot.procedureValue);
            self.parameterValue(snapshot.parameterValue);
            params.form.hasUnsavedData(false);
        };

        params.form.save = function() {
            let observedThingData = {};
            observedThingData[observedThingNodeId] = self.createRelatedInstance(observedThingInstanceId);
            return self.saveTile(observedThingData, observedThingNodeId, self.observationInstanceId(), observedThingTileid)
                .then(function(data) {
                    let partOfProjectData = {};
                    observedThingTileid = data.tileid;
                    partOfProjectData[projectNodeId] = self.createRelatedInstance(projectInstanceId);
                    return self.saveTile(partOfProjectData, projectNodeId, data.resourceinstance_id, projectTileId);
                })
                .then(function(data) {
                    let nameData = {};
                    nameData[nameNodeId] = self.nameValue();
                    projectTileId = data.tileid;
                    return self.saveTile(nameData, nameNodeGroupId, data.resourceinstance_id, nameTileId);
                })
                .then(function(data) {
                    let instrumentData = {};
                    instrumentData[instrumentNodeId] = self.instrumentInstance();
                    nameTileId = data.tileid;
                    return self.saveTile(instrumentData, instrumentNodeId, data.resourceinstance_id, instrumentTileId);
                })
                .then(function(data) {
                    let procedureData = {};
                    procedureData[procedureNodeId] = self.procedureInstance();
                    instrumentTileId = data.tileid;
                    return self.saveTile(procedureData, procedureNodeId, data.resourceinstance_id, procedureTileId);
                })
                .then(function(data) {
                    let parameterData = {};
                    parameterData[parameterNodeId] = self.parameterValue();
                    procedureTileId = data.tileid;
                    return self.saveTile(parameterData, parameterNodeGroupId, data.resourceinstance_id, parameterTileId);
                })
                .then(function(data) {
                    parameterTileId = data.tileid;
                    self.observationInstanceId(data.resourceinstance_id); // mutates updateValue to refresh value before saving.
                    params.form.savedData(params.form.addedData());
                    params.form.complete(true);
                });
    
        };
    }

    ko.components.register('instrument-info-step', {
        viewModel: viewModel,
        template: {
            require: 'text!templates/views/components/workflows/upload-dataset/instrument-info-step.htm'
        }
    });

    return viewModel;
});
