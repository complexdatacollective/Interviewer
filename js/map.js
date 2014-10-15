/* global L */
/* exported GeoInterface */


/*

Map module.

*/

var GeoInterface = function GeoInterface() {

  	// map globals

 	var geoInterface = {};
 	var leaflet;
 	var geojson;
 	var mapNodeClicked = false;
    var colors = ['#67c2d4','#1ECD97','#B16EFF','#FA920D','#e85657','#20B0CA','#FF2592','#153AFF','#8708FF'];

  	// Private functions

	function toggleFeature(e) {
		var layer = e.target;
		console.log(e);
		console.log(layer);

		// is there a map node already selected?
		if (mapNodeClicked === false) {
	 		// no map node selected, so highlight this one and mark a map node as having been selected.
	  		highlightFeature(e);
	  		updateInfoBox('You selected: <strong>'+layer.feature.properties.name+'</strong>. Click the "next" button to place the next person.');
	  		mapNodeClicked = layer.feature.properties.name;  
		} else {

	  	// Map node already selected. Have we clicked the same one again?
	  		if (layer.feature.properties.name === mapNodeClicked) {
	    		// Same map node clicked. Reset the styles and mark no node as being selected
	      		updateInfoBox('Tap on the map to indicate where this person lives.');
	      		resetHighlight(e);
	      		mapNodeClicked = false;
	  		} else {
		    // Different node clicked. Reset the style and then mark the new one as clicked.
		      // updateInfoBox('Tap on the map to indicate where this person lives.')
		      // resetHighlight(e);
		      // mapNodeClicked = false; 

	  		}

		}

	}

  	function updateInfoBox(text) {
  		$('.map-node-status').html(text);
  	}

  	function highlightFeature(e) {
        var layer = e.target;
        leaflet.fitBounds(e.target.getBounds(), {maxZoom:14});
        
        layer.setStyle({
        	fillOpacity: 0.8
        });

        if (!L.Browser.ie && !L.Browser.opera) {
        	layer.bringToFront();
        }
      }

  	function resetHighlight(e) {
  		geojson.resetStyle(e.target);
  	}

  	function onEachFeature(feature, layer) {
  		layer.on({
  			mouseover: highlightFeature,
  			mouseout: resetHighlight,
  			click: toggleFeature
  		});
  	}  

  	geoInterface.init = function() {
  		// Initialize the map, point it at the #map element and center it on Chicago
        leaflet = L.map('map', {
            maxBounds: [[41.4985986599114, -88.498240224063451],[42.1070175291862,-87.070984247165939]], 
            zoomControl: false
        }).setView([41.798395426119534,-87.839671372338884], 11);

        // Add the OpenStreetMap tile layer
        L.tileLayer(
         	'img/Tiles/{z}/{x}/{y}.png', {
          	maxZoom: 17,
          	minZoom: 11
        }).addTo(leaflet);

        $.ajax({
          	dataType: "json",
          	url: "data/census2010.json",
          	success: function(data) {
            	geojson = L.geoJson(data, {
                	onEachFeature: onEachFeature,
                	style: function () {
                	// style: function (feature) { // kept as a reference to show that I can access each feature. could be used to populate my own array of features.
                  		return {stroke:'#ff0000',fillColor:colors[1],weight:0,fillOpacity:0.3,strokeWidth:0};
                	}
            	}).addTo(leaflet);
          	}
        }).error(function() {
        	console.log('nooooo');
        });
  	};

  	geoInterface.destroy = function() {
    	// Used to unbind events
  	};

  	geoInterface.init();

  	return geoInterface;
};