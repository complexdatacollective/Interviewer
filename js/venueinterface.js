/* global $, window, note, omnivore, document */
/* exported VenueInterface */

/*
 Map module.
*/

module.exports = function VenueInterface() {
    'use strict';
  	// map globals
    var test, centroid, filterCircle;
 	var venueInterface = {};
    var RADIUS = 1609;
    venueInterface.options = {
        targetEl: $('#map'),
        network: window.network || new window.netcanvas.Module.Network(),
        points: window.protocolPath+'data/hiv-services.csv',
        geojson: window.protocolPath+'data/census2010.json',
        prompt: 'These are the service providers within 1 mile of where you live. Please tap on all of the ones you\'ve used in the last 6 months.',
        dataDestination: {
            node: {
                type_t0: 'Venue',
                venue_name: '%venuename%'
            },
            edge: {
                type: 'HIVservice',
                from: window.network.getEgo().id,
                to: '%destinationNode%'
            }
        },
        egoLocation: 'res_chicago_location_t0'
    };
 	var leaflet;
 	var geojson;
    var colors = ['#67c2d4','#1ECD97','#B16EFF','#FA920D','#e85657','#20B0CA','#FF2592','#153AFF','#8708FF'];

  	// Private functions


 //  	function resetPosition() {
 //  		leaflet.setView([41.798395426119534,-87.839671372338884], 11);
 //  	}
    //
    // function getCentroid(arr) {
    //     console.log(arr);
    //     var twoTimesSignedArea = 0;
    //     var cxTimes6SignedArea = 0;
    //     var cyTimes6SignedArea = 0;
    //
    //     var length = arr.length;
    //
    //     var x = function (i) { return arr[i % length][0]; };
    //     var y = function (i) { return arr[i % length][1]; };
    //
    //     for (var i = 0; i < arr.length; i++) {
    //         var twoSA = x(i)*y(i+1) - x(i+1)*y(i);
    //         twoTimesSignedArea += twoSA;
    //         cxTimes6SignedArea += (x(i) + x(i+1)) * twoSA;
    //         cyTimes6SignedArea += (y(i) + y(i+1)) * twoSA;
    //     }
    //     var sixSignedArea = 3 * twoTimesSignedArea;
    //     return [ cxTimes6SignedArea / sixSignedArea, cyTimes6SignedArea / sixSignedArea];
    // }

    var stageChangeHandler = function() {
        venueInterface.destroy();
    };

  	// Public methods

    venueInterface.getLeaflet = function() {
        return leaflet;
    };

  	venueInterface.init = function(options) {
        window.tools.extend(venueInterface.options, options);

        window.L.Icon.Default.imagePath = 'img/';

        // Provide your access token
        window.L.mapbox.accessToken = 'pk.eyJ1IjoianRocmlsbHkiLCJhIjoiY2lnYjFvMnBmMWpxbnRmbHl2dXp2ZDBnbiJ9.YnZpoiaXloVbxhHobhtbvQ';


        // Hack for multiple popups
        window.L.Map = window.L.Map.extend({
            openPopup: function(popup) {
                //        this.closePopup();  // just comment this
                this._popup = popup;

                return this.addLayer(popup).fire('popupopen', {
                    popup: this._popup
                });
            },
            closePopup: function(e) {
                console.log(e);
            }
        }); /***  end of hack ***/

  		// Initialize the map, point it at the #map element and center it on Chicago
        leaflet = window.L.map('map', {
            maxBounds: [[41.4985986599114, -88.498240224063451],[42.1070175291862,-87.070984247165939]],
            zoomControl: false,
            minZoom: 0,
            maxZoom: 20
        });

        window.L.tileLayer('http://{s}.{base}.maps.api.here.com/maptile/2.1/maptile/{mapID}/normal.day.transit/{z}/{x}/{y}/256/png8?app_id={app_id}&app_code={app_code}', {
            subdomains: '1234',
            mapID: 'newest',
            app_id: 'FxdAZ7O0Wh568CHyJWKV',
            app_code: 'FuQ7aPiHQcR8BSnXBCCmuQ',
            base: 'base',
            minZoom: 0,
            maxZoom: 20
        }).addTo(leaflet);

        venueInterface.drawUIComponents();
        $.ajax({
            dataType: 'json',
            url: venueInterface.options.geojson,
            success: function(data) {

                var egoLocation = venueInterface.options.network.getEgo()[venueInterface.options.egoLocation];
                geojson = window.L.geoJson(data, {
                    onEachFeature: function(feature, layer) {
                        // Load initial node

                        if (feature.properties.name === egoLocation) {
                            console.log('found it');
                            centroid = layer.getBounds().getCenter();

                            filterCircle = window.L.circle(window.L.latLng(centroid), RADIUS, {
                                opacity: 1,
                                weight: 1,
                                fillOpacity: 0.2
                            }).addTo(leaflet);
                            leaflet.fitBounds(filterCircle.getBounds());
                            venueInterface.doTheRest();

                        }
                    },
                    style: function () {
                        return {weight:1,fillOpacity:0,strokeWidth:0.2, color:colors[1]};
                    }
                });

            }
        });

        // Events
        window.addEventListener('changeStageStart', stageChangeHandler, false);
        $(document).on('click', '.service-popup', function() {
            console.log($(this).data('feature'));
            $(this).parent().parent().parent().toggleClass('selected');
        });
        $('.map-back').on('click', venueInterface.previousPerson);
        $('.map-forwards').on('click', venueInterface.nextPerson);
        $('.other-option').on('click', venueInterface.setOtherOption);

  	};

    venueInterface.doTheRest = function() {
        console.log('doing the rest');
        var points = omnivore.csv(venueInterface.options.points, null, window.L.mapbox.featureLayer()).addTo(leaflet);

        leaflet.on('layeradd', function(e) {
            // console.log(e);
            if (e.layer.feature) {
                // console.log('there');
                test = e.layer.feature.properties;
                // console.log(test);
                var popup = window.L.popup().setContent('<div class="service-popup" data-feature="'+e.layer.feature.properties['Abbreviated Name']+'">'+e.layer.feature.properties['Abbreviated Name']+'</div>');
                e.layer.bindPopup(popup).openPopup();
            }
        });

        points.setFilter(function(feature) {
                // var popup = window.L.popup().setContent('<div class="service-popup" data-feature="'+feature.properties['Abbreviated Name']+'">'+feature.properties['Abbreviated Name']+'</div>');
                // layer.bindPopup(popup).openPopup();
                // // layer.feature.properties
            return filterCircle.getLatLng().distanceTo(window.L.latLng(
                    feature.geometry.coordinates[1],
                    feature.geometry.coordinates[0])) < RADIUS;
        });




    };

    venueInterface.getTest = function() {
        return test;
    };

    venueInterface.drawUIComponents = function() {
        note.debug('venueInterface.drawUIComponents()');
        venueInterface.options.targetEl.append('<div class="container map-node-container"><div class="row form-group"><div class="col-sm-12 text-center"><h4 class="prompt" style="color:white"></h4></div></div>');
        $('.prompt').html(venueInterface.options.prompt);
    };

  	venueInterface.destroy = function() {
    	// Used to unbind events
        leaflet.remove();
        window.removeEventListener('changeStageStart', stageChangeHandler, false);
    	$('.map-back').off('click', venueInterface.previousPerson);
        $('.map-forwards').off('click', venueInterface.nextPerson);
        $('.other-option').on('click', venueInterface.setOtherOption);
  	};

  	return venueInterface;
};
