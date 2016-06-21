/* global $, window, note */
/* exported GeoInterface */

/*
 Map module.
*/

module.exports = function GeoInterface() {
    'use strict';
  	// map globals
    var log;
    var taskComprehended = false;
 	var geoInterface = {};
    geoInterface.options = {
        network: window.network || new window.netcanvas.Module.Network(),
        targetEl: $('.map-node-container'),
        mode: 'edge',
        criteria: {
            type:'Sex',
            from: window.network.getNodes({type_t0:'Ego'})[0].id
        },
        geojson: '',
        prompt: 'Where does %alter% live?',
        variable: {

            label:'res_chicago_location_t0',
            other_values: [
                {label: 'I live outside Chicago', value: 'outside_chicago'},
                {label: 'I am currently homeless', value: 'homeless'}
            ]
        }
    };
 	var leaflet;
 	var edges = [];
 	var currentPersonIndex = 0;
 	var geojson;
 	var mapNodeClicked = false;
    var colors = ['#67c2d4','#1ECD97','#B16EFF','#FA920D','#e85657','#20B0CA','#FF2592','#153AFF','#8708FF'];

  	// Private functions

    function highlightFeature(e) {
        var layer = e.target;
        leaflet.fitBounds(e.target.getBounds(), {maxZoom:14});

        layer.setStyle({
            fillOpacity: 0.8,
          fillColor: colors[1]
        });

        if (!window.L.Browser.ie && !window.L.Browser.opera) {
            layer.bringToFront();
        }

        mapNodeClicked = layer.feature.properties.name;
    }

    function selectFeature(e) {
        var layer = e;
        leaflet.fitBounds(e.getBounds(), {maxZoom:14});

        layer.setStyle({
            fillOpacity: 0.8,
          fillColor: colors[1]
        });

        if (!window.L.Browser.ie && !window.L.Browser.opera) {
            layer.bringToFront();
        }
    }

    function resetHighlight(e) {
        $('.map-node-location').html('');
        mapNodeClicked = false;
        geojson.resetStyle(e.target);
    }

    function resetAllHighlights() {
        note.debug('resetAllHighlights()');
        $('.map-node-location').html('');
        mapNodeClicked = false;
        $.each(geojson._layers, function(index,value) {
            geojson.resetStyle(value);
        });
    }

    function resetPosition() {
        note.debug('resetPosition()');
        // leaflet.setView([41.798395426119534,-87.839671372338884], 11);
    }


    function toggleFeature(e) {
        if (taskComprehended === false) {
            var eventProperties = {
                zoomLevel: leaflet.getZoom(),
                stage: window.netCanvas.Modules.session.currentStage(),
                timestamp: new Date()
            };
            log = new window.CustomEvent('log', {'detail':{'eventType': 'taskComprehended', 'eventObject':eventProperties}});
            window.dispatchEvent(log);
            taskComprehended = true;
        }

        var mapEventProperties = {
            zoomLevel: leaflet.getZoom(),
            timestamp: new Date()
        };
        log = new window.CustomEvent('log', {'detail':{'eventType': 'mapMarkerPlaced', 'eventObject':mapEventProperties}});
        window.dispatchEvent(log);
        var layer = e.target;
        var properties, targetID;

        // remove HIV service nodes  and edges if present.
       var serviceNodes = window.network.getNodes({type_t0: 'HIVService'});

       $.each(serviceNodes, function(index, value) {
           console.log('removing');
           window.network.removeNode(value.id);
       });

       var serviceEdges = window.network.getEdges({type: 'HIVService'});
       window.network.removeEdges(serviceEdges);

        // is there a map node already selected?
        if (mapNodeClicked === false) {
            // no map node selected, so highlight this one and mark a map node as having been selected.
            highlightFeature(e);
            // updateInfoBox('You se{lected: <strong>'+layer.feature.properties.name+'</strong>. Click the "next" button to place the next person.');

            // Update edge with this info
            properties = {};
            properties[geoInterface.options.variable.value] = layer.feature.properties.name;


            if (geoInterface.options.mode === 'node') {
                targetID = geoInterface.options.network.getEgo().id;
                window.network.updateNode(targetID, properties);
            } else if (geoInterface.options.mode === 'edge') {
                targetID = edges[currentPersonIndex].id;
                window.network.updateEdge(targetID, properties);
            }

            $('.map-node-location').html('<strong>Currently marked as:</strong> <br>'+layer.feature.properties.name);
        } else {
            // Map node already selected. Have we clicked the same one again?
            if (layer.feature.properties.name === mapNodeClicked) {
                // Same map node clicked. Reset the styles and mark no node as being selected
                resetHighlight(e);
                mapNodeClicked = false;
                properties = {};
                properties[geoInterface.options.variable.value] = undefined;

                if (geoInterface.options.mode === 'node') {
                    targetID = geoInterface.options.network.getEgo().id;
                    window.network.updateNode(targetID, properties);
                } else if (geoInterface.options.mode === 'edge') {
                    targetID = edges[currentPersonIndex].id;
                    window.network.updateEdge(targetID, properties);
                }

            } else {
                resetAllHighlights();
                highlightFeature(e);
                properties = {};
                properties[geoInterface.options.variable.value] = layer.feature.properties.name;

                if (geoInterface.options.mode === 'node') {
                    targetID = geoInterface.options.network.getEgo().id;
                    window.network.updateNode(targetID, properties);
                } else if (geoInterface.options.mode === 'edge') {
                    targetID = edges[currentPersonIndex].id;
                    window.network.updateEdge(targetID, properties);
                }


                // TODO: Different node clicked. Reset the style and then mark the new one as clicked.
            }

        }

    }

    function onEachFeature(feature, layer) {
        layer.on({
            click: toggleFeature
        });

        window.addEventListener('changeStageStart', function() {
            layer.off({
                click: toggleFeature
            });
        }, false);
    }

  	function highlightCurrent() {
      if (typeof edges[currentPersonIndex] !== 'undefined' && edges[currentPersonIndex][geoInterface.options.variable.value] !== undefined) {
        mapNodeClicked = edges[currentPersonIndex][geoInterface.options.variable.value];

        if (geoInterface.options.variable.other_options && geoInterface.options.variable.other_options.map(function(obj){ return obj.value; }).indexOf(edges[currentPersonIndex][geoInterface.options.variable.value]) !== -1) {
          resetPosition();
          var text = edges[currentPersonIndex][geoInterface.options.variable.value];
          $('.map-node-location').html('<strong>Currently marked as:</strong> <br>'+text);
        } else {
          $.each(geojson._layers, function(index,value) {
            if (value.feature.properties.name === edges[currentPersonIndex][geoInterface.options.variable.value]) {
              $('.map-node-location').html('<strong>Currently marked as:</strong> <br>'+edges[currentPersonIndex][geoInterface.options.variable.value]);
              selectFeature(value);
            }
          });
        }

  		} else {
  			resetPosition();
  		}

  	}

    function safePrompt() {
        var name;

        if (geoInterface.options.mode === 'node') {
            name = 'you';
        } else if (geoInterface.options.mode === 'edge') {
            name = typeof edges[currentPersonIndex] !== 'undefined' ? edges[currentPersonIndex].nname_t0 : 'Person';
        }

        return geoInterface.options.prompt.replace('%alter%', name);
    }

    geoInterface.setOtherOption = function() {
        // remove HIV service nodes  and edges if present.
       var serviceNodes = window.network.getNodes({type_t0: 'HIVService'});

       $.each(serviceNodes, function(index, value) {
           console.log('removing');
           window.network.removeNode(value.id);
       });

       var serviceEdges = window.network.getEdges({type: 'HIVService'});
       window.network.removeEdges(serviceEdges);
       
        var option = $(this).data('value');
        resetAllHighlights();
        var properties = {}, targetID;
        properties[geoInterface.options.variable.value] = option;
        if (geoInterface.options.mode === 'node') {
            targetID = geoInterface.options.network.getEgo().id;
            window.network.updateNode(targetID, properties);
        } else if (geoInterface.options.mode === 'edge') {
            targetID = edges[currentPersonIndex].id;
            window.network.updateEdge(targetID, properties);
        }

        $('.map-node-location').html('<strong>Currently marked as:</strong> <br>'+option);
    };

    var stageChangeHandler = function() {
        geoInterface.destroy();
    };

  	geoInterface.nextPerson = function() {
        note.debug('geoInterface.setLevel()');
  		if (currentPersonIndex < edges.length-1) {
  			resetAllHighlights();
	  		currentPersonIndex++;
	        $('.current-id').html(currentPersonIndex+1);

	        $('.map-node-status').html(safePrompt());

  			// if variable already set, highlight it and zoom to it.
  			highlightCurrent();

            geoInterface.updateNavigation();
  		}


  	};

    geoInterface.getLeaflet = function() {
        return leaflet;
    };

  	geoInterface.previousPerson = function() {
	  	if (currentPersonIndex > 0) {

	  		resetAllHighlights();
	  		currentPersonIndex--;
	        $('.current-id').html(currentPersonIndex+1);
	        $('.map-node-status').html(safePrompt());

  			// if variable already set, highlight it and zoom to it.
  			highlightCurrent();
            geoInterface.updateNavigation();
	    }
  	};

  	geoInterface.init = function(options) {
        window.tools.extend(geoInterface.options, options);

  		// Initialize the map, point it at the #map element and center it on Chicago
        leaflet = window.L.map('map', {
            maxBounds: [[41.4985986599114, -88.498240224063451],[42.1070175291862,-87.070984247165939]],
            zoomControl: false
        });

        window.L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/maptile/{mapID}/normal.day.transit/{z}/{x}/{y}/256/png8?app_id={app_id}&app_code={app_code}', {
            subdomains: '1234',
            mapID: 'newest',
            app_id: 'FxdAZ7O0Wh568CHyJWKV',
            app_code: 'FuQ7aPiHQcR8BSnXBCCmuQ',
            base: 'base',
            minZoom: 0,
            maxZoom: 20
        }).addTo(leaflet);

        leaflet.setView([41.798395426119534,-87.839671372338884], 11);

        $.ajax({
          	dataType: 'json',
          	url: geoInterface.options.geojson,
          	success: function(data) {
            	geojson = window.L.geoJson(data, {
                	onEachFeature: onEachFeature,
                	style: function () {
                  		return {weight:1,fillOpacity:0,strokeWidth:0.2, color:colors[1]};
                	}
            	}).addTo(leaflet);

		        // Load initial node
                if (geoInterface.options.mode === 'edge') {
                    edges = geoInterface.options.network.getEdges(geoInterface.options.criteria);
                } else if (geoInterface.options.mode === 'node') {
                    edges = geoInterface.options.network.getNodes(geoInterface.options.criteria);
                }

		        $('.map-counter').html('<span class="current-id">1</span>/'+edges.length);

                if (edges.length > 0) {
                    $('.map-node-status').html(safePrompt());
                }

            	// Highlight initial value, if set
            	highlightCurrent();

                geoInterface.updateNavigation();

          	}
        });

        geoInterface.drawUIComponents();

        // Events
        window.addEventListener('changeStageStart', stageChangeHandler, false);
        $('.map-back').on('click', geoInterface.previousPerson);
        $('.map-forwards').on('click', geoInterface.nextPerson);
        $('.other-option').on('click', geoInterface.setOtherOption);

  	};

    geoInterface.updateNavigation = function() {

        if (currentPersonIndex === 0) {
            $('.map-back').hide();
        } else {
            $('.map-back').show();
        }

        if (currentPersonIndex === edges.length-1) {
            $('.map-forwards').hide();
        } else {
            $('.map-forwards').show();
        }

        if (edges.length === 1) {
            $('.map-forwards, .map-back, .map-counter').hide();
        }
    };

    geoInterface.drawUIComponents = function() {
        note.debug('geoInterface.drawUIComponents()');
        geoInterface.options.targetEl.append('<div class="container map-node-container"><div class="row" style="width:100%"><div class="col-sm-4 text-left"><div class="map-node-navigation"><span class="btn btn-primary btn-block map-back"><span class="glyphicon glyphicon-arrow-left"></span></span></div></div><div class="col-sm-4 text-center"><p class="lead map-counter"></p></div><div class="col-sm-4 text-right"><div class="map-node-navigation"><span class="btn btn-primary btn-block map-forwards"><span class="glyphicon glyphicon-arrow-right"></span></span></div></div></div><div class="row form-group"><div class="col-sm-12 text-center"><p class="lead map-node-status"></p><p class="lead map-node-location"></p></div></div><div class="row"></div>');
        $('.map-node-status').html(safePrompt());

        if (geoInterface.options.variable.other_options && geoInterface.options.variable.other_options.length > 0) {
            $('.map-node-container').append('<div class="col-sm-12 form-group other-options"></div>');
            $.each(geoInterface.options.variable.other_options, function(otherIndex, otherValue) {
                $('.other-options').append('<button class="btn '+otherValue.btnClass+' btn-block other-option" data-value="'+otherValue.value+'">'+otherValue.label+'</button>');
            });
        }
    };

  	geoInterface.destroy = function() {
    	// Used to unbind events
        leaflet.remove();
        window.removeEventListener('changeStageStart', stageChangeHandler, false);
    	$('.map-back').off('click', geoInterface.previousPerson);
        $('.map-forwards').off('click', geoInterface.nextPerson);
        $('.other-option').on('click', geoInterface.setOtherOption);
  	};

  	return geoInterface;
};
