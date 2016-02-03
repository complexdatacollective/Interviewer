/* global $, window */
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
 	var leaflet;
 	var edges;
 	var variable = 'res_chicago_location_p_t0';
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
        $('.map-node-location').html('');
        mapNodeClicked = false;
        $.each(geojson._layers, function(index,value) {
            geojson.resetStyle(value);
        });
    }

    function resetPosition() {
        leaflet.setView([41.798395426119534,-87.839671372338884], 11);
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
		var properties;

		// is there a map node already selected?
		if (mapNodeClicked === false) {
	 		// no map node selected, so highlight this one and mark a map node as having been selected.
	  		highlightFeature(e);
	  		// updateInfoBox('You selected: <strong>'+layer.feature.properties.name+'</strong>. Click the "next" button to place the next person.');

	  		// Update edge with this info
	  		properties = {};
	  		properties[variable] = layer.feature.properties.name;
	  		window.network.updateEdge(edges[currentPersonIndex].id, properties);
	  		$('.map-node-location').html('<strong>Currently marked as:</strong> <br>'+layer.feature.properties.name);
		} else {
	  	// Map node already selected. Have we clicked the same one again?
	  		if (layer.feature.properties.name === mapNodeClicked) {
	    		// Same map node clicked. Reset the styles and mark no node as being selected
	      		resetHighlight(e);
	      		mapNodeClicked = false;
		  		properties = {};
		  		properties[variable] = undefined;
		  		window.network.updateEdge(edges[currentPersonIndex].id, properties);

	  		} else {
          resetAllHighlights();
          highlightFeature(e);
          properties = {};
          properties[variable] = layer.feature.properties.name;
          window.network.updateEdge(edges[currentPersonIndex].id, properties);
		    // TODO: Different node clicked. Reset the style and then mark the new one as clicked.
	  		}

		}

	}

    function onEachFeature(feature, layer) {
        layer.on({
            click: toggleFeature
        });
    }

  	function highlightCurrent() {

      if (edges[currentPersonIndex][variable] !== undefined) {
        mapNodeClicked = edges[currentPersonIndex][variable];
        if (edges[currentPersonIndex][variable] === 'Homeless' || edges[currentPersonIndex][variable] === 'Jail') {
          resetPosition();
          var text = 'Homeless';
          if (edges[currentPersonIndex][variable] === 'Jail') {
            text = 'in Jail';
          }
          $('.map-node-location').html('<strong>Currently marked as:</strong> <br>'+text);
        } else {
          $.each(geojson._layers, function(index,value) {
            if (value.feature.properties.name === edges[currentPersonIndex][variable]) {
              $('.map-node-location').html('<strong>Currently marked as:</strong> <br>'+edges[currentPersonIndex][variable]);
              selectFeature(value);
            }
          });
        }

  		} else {
  			resetPosition();
  		}

  	}

    function setHomeless() {
        resetAllHighlights();
        var properties = {};
        properties[variable] = 'Homeless';
        window.network.updateEdge(edges[currentPersonIndex].id, properties);
        $('.map-node-location').html('<strong>Currently marked as:</strong> <br>Homeless');
    }

    function setJail() {
        resetAllHighlights();
        var properties = {};
        properties[variable] = 'Jail';
        window.network.updateEdge(edges[currentPersonIndex].id, properties);
        $('.map-node-location').html('<strong>Currently marked as:</strong> <br>in Jail');
    }

    var stageChangeHandler = function() {
        geoInterface.destroy();
    };

  	// Public methods

  	geoInterface.nextPerson = function() {

  		if (currentPersonIndex < edges.length-1) {
  			resetAllHighlights();
	  		currentPersonIndex++;
	        $('.current-id').html(currentPersonIndex+1);
	        $('.map-node-status').html('Tap on the map to indicate the general area where <strong>'+edges[currentPersonIndex].nname_t0+'</strong> lives.');

  			// if variable already set, highlight it and zoom to it.
  			highlightCurrent();
        if (currentPersonIndex === edges.length-1) {
          $('.map-forwards').hide();
        } else {
          $('.map-forwards').show();
        }
        if (currentPersonIndex === 0) {
          $('.map-back').hide();
        } else {
          $('.map-back').show();
        }
  		}

  	};

  	geoInterface.previousPerson = function() {
	  	if (currentPersonIndex > 0) {

	  		resetAllHighlights();
	  		currentPersonIndex--;
	        $('.current-id').html(currentPersonIndex+1);
	        $('.map-node-status').html('Tap on the map to indicate the general area where <strong>'+edges[currentPersonIndex].nname_t0+'</strong> lives.');

  			// if variable already set, highlight it and zoom to it.
  			highlightCurrent();
        if (currentPersonIndex === edges.length-1) {
          $('.map-forwards').hide();
        } else {
          $('.map-forwards').show();
        }
        if (currentPersonIndex === 0) {
          $('.map-back').hide();
        } else {
          $('.map-back').show();
        }
	    }
  	};

  	geoInterface.init = function() {

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

        $.ajax({
          	dataType: 'json',
          	url: 'data/census2010.json',
          	success: function(data) {
            	geojson = window.L.geoJson(data, {
                	onEachFeature: onEachFeature,
                	style: function () {
                  		return {weight:1,fillOpacity:0,strokeWidth:0.2, color:colors[1]};
                	}
            	}).addTo(leaflet);

		        // Load initial node
		        edges = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id, type:'Dyad', res_cat_p_t0: 'Chicago'});
		        $('.map-counter').html('<span class="current-id">1</span>/'+edges.length);
		        $('.map-node-status').html('Tap on the map to indicate the general area where <strong>'+edges[0].nname_t0+'</strong> lives.');

            	// Highlight initial value, if set
            	highlightCurrent();
              $('.map-back').hide();
              if (currentPersonIndex === edges.length-1) {
                $('.map-forwards').hide();
              } else {
                $('.map-forwards').show();
              }
          	}
        });

        // Events
        window.addEventListener('changeStageStart', stageChangeHandler, false);
        $('.map-back').on('click', geoInterface.previousPerson);
        $('.map-forwards').on('click', geoInterface.nextPerson);
        $('.homeless').on('click', setHomeless);
        $('.jail').on('click', setJail);

  	};

  	geoInterface.destroy = function() {
    	// Used to unbind events
        leaflet.remove();
        window.removeEventListener('changeStageStart', stageChangeHandler, false);
    	$('.map-back').off('click', geoInterface.previousPerson);
        $('.map-forwards').off('click', geoInterface.nextPerson);
        $('.homeless').on('click', setHomeless);
        $('.jail').on('click', setJail);
  	};

  	return geoInterface;
};
