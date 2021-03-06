define([
    'knockout',
    'knockout-mapping',
    'uuid',
    'arches',
    'utils/resource',
    'utils/physical-thing',
    'viewmodels/alert-json',
    'views/components/iiif-viewer',
    'bindings/dropzone'
], function(ko, koMapping, uuid, arches, resourceUtils, physicalThingUtils, JsonErrorAlertViewModel, IIIFViewerViewmodel) {
    return ko.components.register('select-dataset-files-step', {
        viewModel: function(params) {
            IIIFViewerViewmodel.apply(this, [params]);
            var annotationNodeGroupId = "b3e171a7-1d9d-11eb-a29f-024e0d439fdb";
            var defaultColor;
            var self = this;
            this.annotationNodeId = "b3e171ae-1d9d-11eb-a29f-024e0d439fdb"
            this.annotationNameNodeId = "b3e171ac-1d9d-11eb-a29f-024e0d439fdb"
            this.samplingActivityGraphId = "03357848-1d9d-11eb-a29f-024e0d439fdb"
            this.selectedAnnotationTile = ko.observable();
            this.selectedSample = ko.observable();
            this.sampleFilter = ko.observable("");
            this.alert = params.alert;
            this.annotations = ko.observableArray([]);
            this.samples = ko.observableArray([]);
            this.uniqueId = uuid.generate();
            this.formData = new window.FormData();
            this.physicalThing = params.workflow.getStepData('project-info').pageLayout.sections[1].componentConfigs[0].value;
            this.uniqueidClass = ko.computed(function() {
                return "unique_id_" + self.uniqueId;
            });
            this.firstLoad = true;
            this.mainMenu = ko.observable(true);
            this.files = ko.observableArray([]);
            this.datasets = ko.observableArray([]);

            this.switchCanvas = function(canvasId){
                var canvas = self.canvases().find(c => c.images[0].resource.service['@id'] === canvasId);
                if (canvas) {
                    self.canvasClick(canvas);              
                }
            };

            this.highlightAnnotation = function(){
                if (self.map()) {
                    self.map().eachLayer(function(layer){
                        if (layer.eachLayer) {
                            layer.eachLayer(function(features){
                                if (features.eachLayer) {
                                    features.eachLayer(function(feature) {
                                        if (!defaultColor) {
                                            defaultColor = feature.feature.properties.color
                                        }
                                        if (self.selectedAnnotationTile().tileid === feature.feature.properties.tileId) {
                                            feature.setStyle({color: '#BCFE2B', fillColor: '#BCFE2B'});
                                        } else {
                                            feature.setStyle({color: defaultColor, fillColor: defaultColor});
                                        }
                                    });
                                }
                            });
                        }
                    })
                } 
            };

            this.getAnnotationProperty = function(tile, property){
                return tile.data[self.annotationNodeId].features[0].properties[property]
            }

            this.selectedSample.subscribe(function(data){
                self.annotations(data.tiles.filter(t => t.nodegroup_id === annotationNodeGroupId));
                if (self.annotations().length) {
                    self.selectedAnnotationTile(self.annotations()[0]);
                    if (self.manifest() !== self.getAnnotationProperty(self.selectedAnnotationTile(), "manifest")) {
                        self.manifest(self.getAnnotationProperty(self.selectedAnnotationTile(), "manifest"));
                        self.getManifestData();
                    }
                    self.switchCanvas(self.getAnnotationProperty(self.selectedAnnotationTile(), "canvas"));
                };
            });

            this.canvas.subscribe(function(val){
                if (typeof val === "string") {
                    annotationCanvas = self.getAnnotationProperty(self.selectedAnnotationTile(), "canvas");
                    if (annotationCanvas === val || self.firstLoad === true) {
                        self.switchCanvas(annotationCanvas);
                        self.firstLoad = false;
                    }
                }
            });

            this.addFiles = function(fileList) {
                Array.from(fileList).forEach(function(file) {
                    self.files.push(file);
                });
                if (self.files()) {
                    self.mainMenu(false);
                    self.activeTab('dataset');
                    self.annotationNodes.valueHasMutated()
                }
            };

            this.save = function() {
                //Tile structure for the Digital Resource 'Name' nodegroup
                var nameTemplate = {
                    "tileid": "",
                    "data": {
                        "d2fdc2fa-ca7a-11e9-8ffb-a4d18cec433a": null,
                        "d2fdc0d4-ca7a-11e9-95cf-a4d18cec433a": ["8f40c740-3c02-4839-b1a4-f1460823a9fe"],
                        "d2fdb92b-ca7a-11e9-af41-a4d18cec433a": ["bc35776b-996f-4fc1-bd25-9f6432c1f349"],
                        "d2fdbc38-ca7a-11e9-a31a-a4d18cec433a": null,
                        "d2fdbeb8-ca7a-11e9-a294-a4d18cec433a": null
                    },
                    "nodegroup_id": "d2fdae3d-ca7a-11e9-ad84-a4d18cec433a",
                    "parenttile_id": null,
                    "resourceinstance_id": "",
                    "sortorder": 0,
                    "tiles": {}
                };

                //Tile structure for the Digital Resource 'File' nodegroup
                var fileTemplate = {
                    "tileid": "",
                    "data": {
                        "29d5ecb8-79a5-11ea-8ae2-acde48001122": null,
                        "7c486328-d380-11e9-b88e-a4d18cec433a": null,
                        "5e1791d4-79a5-11ea-8ae2-acde48001122": null,
                        "21d0ba4e-78eb-11ea-a33b-acde48001122": null
                    },
                    "nodegroup_id": "7c486328-d380-11e9-b88e-a4d18cec433a",
                    "parenttile_id": null,
                    "resourceinstance_id": "",
                    "sortorder": 1,
                    "tiles": {}
                }

                self.samples().forEach(function(sample){
                    nameTemplate.data["d2fdc2fa-ca7a-11e9-8ffb-a4d18cec433a"] = sample.datasetName() || ""
                    window.fetch(arches.urls.api_tiles(uuid.generate()), {
                        method: 'POST',
                        credentials: 'include',
                        body: JSON.stringify(nameTemplate),
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    })
                        .then(function(response) {
                            if (response.ok) {
                                return response.json();
                            }
                        })
                        .then(function(json) {
                            sample.datasetFiles().forEach(function(file, i){
                                fileTemplate.resourceinstance_id = json.resourceinstance_id;
                                sample.datasetId(json.resourceinstance_id)
                                fileTemplate.data["7c486328-d380-11e9-b88e-a4d18cec433a"] = [{
                                        name: file.name,
                                        accepted: file.accepted,
                                        height: file.height,
                                        lastModified: file.lastModified,
                                        size: file.size,
                                        status: file.status,
                                        type: file.type,
                                        width: file.width,
                                        url: null,
                                        file_id: null,
                                        index: i,
                                        content: URL.createObjectURL(file),
                                        error: file.error
                                    }];
                                    window.fetch(arches.urls.api_tiles(uuid.generate()), {
                                        method: 'POST',
                                        credentials: 'include',
                                        body: JSON.stringify(fileTemplate),
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                    })
                                    .then(function(response) {
                                        if (response.ok) {
                                            return response.json();
                                        }
                                    })
                                    .then(function(fileJson) {
                                        console.log(fileJson);
                                    })
                            });
                        })
                        .catch(function(err) {
                            console.log('Tile update failed', err);
                            self.loading(false);
                        });
                })


            };

            params.save = this.save;
            this.datasets.subscribe(function(val){
                params.complete(true);
            })

            this.dropzoneOptions = {
                url: "arches.urls.root",
                dictDefaultMessage: '',
                autoProcessQueue: false,
                uploadMultiple: true,
                autoQueue: false,
                clickable: ".upload-dataset-files." + this.uniqueidClass(),
                previewsContainer: '#hidden-dz-previews',
                init: function() {
                    self.dropzone = this;
                    this.on("addedfiles", self.addFiles);
                    this.on("error", function(file, error) {
                        file.error = error;
                    });    
                }
            };

            this.init = function(){
                this.selectedAnnotationTile.subscribe(this.highlightAnnotation);
                resourceUtils.getRelatedInstances(this.physicalThing, this.samplingActivityGraphId)
                    .then(
                        function(samples){
                            self.samples(samples.related_resources);
                            self.samples().forEach(function(sample){
                                sample.datasetFiles = ko.observableArray([]);
                                sample.datasetName = ko.observable();
                                sample.datasetId = ko.observable();
                                sample.datasetId.subscribe(function(val){
                                    if (val) {
                                        params.complete(true);
                                    }
                                })
                            });
                            self.selectedSample(self.samples()[0]);
                            self.annotationNodes.subscribe(function(val){
                                var overlay = val.find(n => n.name.includes('Sampling Activity'));
                                if (overlay) {
                                    overlay.active(true);
                                    if (ko.unwrap(overlay.annotations) && overlay.annotations().length > 0) {
                                        self.highlightAnnotation();
                                    }
                                    overlay.annotations.subscribe(function(anno){
                                        self.highlightAnnotation();
                                        });
                                    }
                                });
                        }
                    );
            }

            this.init();
        },
        template: { require: 'text!templates/views/components/workflows/upload-dataset/select-dataset-files-step.htm' }
    });
});