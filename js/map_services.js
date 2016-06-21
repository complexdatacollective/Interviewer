/* global $, window, note, omnivore */
/* exported VenueInterface */

/*
 Map module.
*/

module.exports = function VenueInterface() {
    'use strict';
  	// map globals
    var centroid, filterCircle;
 	  var venueInterface = {};
    var RADIUS = 1609;
    venueInterface.options = {
        targetEl: $('#map'),
        network: window.network || new window.netcanvas.Module.Network(),
        points: window.protocolPath+'data/hiv-services.csv',
        geojson: window.protocolPath+'data/census2010.json',
        prompt: 'These are the sexual health service providers within 1 mile of where you live. Please tap on all of the ones you\'ve used in the last 6 months.',
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
    var moduleEvents = [];

  	// Private functions

    var stageChangeHandler = function() {
        venueInterface.destroy();
    };

  	// Public methods

    venueInterface.getLeaflet = function() {
        return leaflet;
    };

  	venueInterface.init = function(options) {
        $('#content').addClass('stageHidden');
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
            closePopup: function() {
                return false;
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

        leaflet.setView([41.798395426119534,-87.839671372338884], 11);

        venueInterface.drawUIComponents();
        $.ajax({
            dataType: 'json',
            url: venueInterface.options.geojson,
            success: function(data) {
                var egoLocation = venueInterface.options.network.getEgo()[venueInterface.options.egoLocation];
                note.debug('egoLocation: '+egoLocation);
                geojson = window.L.geoJson(data, {
                    onEachFeature: function(feature, layer) {
                        // Load initial node

                        if (feature.properties.name === egoLocation) {
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
        var event = [
            {
                event: 'changeStageStart',
                handler: stageChangeHandler,
                targetEl:  window
            },
            {
                event: 'click',
                handler: venueInterface.clickPopup,
                targetEl:  window.document,
                subTarget: '.leaflet-popup-content-wrapper'
            }
        ];
        window.tools.Events.register(moduleEvents, event);

  	};

    venueInterface.selectMarker = function(name) {
        $('.leaflet-popup').removeClass('top');
        var feature = $('body').find('[data-feature="' + name + '"]');
        $(feature).parent().parent().parent().toggleClass('selected top');
    };

    venueInterface.clickPopup = function(e,clicked) {
      // if clicked is present we have clicked a marker rather than its popup.
      if(!clicked) {
          //clicked popup
        clicked = $(this).find('.service-popup').data('feature');
      }
      venueInterface.selectMarker(clicked);

      // Toggle visited property of HIVService edge

      // First, get the HIVService node, so we can get its ID
      var serviceNodeID = window.network.getNodes({name: clicked})[0].id;


      var properties = {
        from: window.network.getEgo().id,
        to: serviceNodeID,
        type:'HIVService'
      };


      // Get the HIVService edge
      var serviceEdge = window.network.getEdges(properties)[0];

      serviceEdge.visited = !serviceEdge.visited;

      // Incase the participant goes back to this screen and changes the value after answering questions on the following screen.
      serviceEdge.reason_not_visited = undefined;
      serviceEdge.provider_awareness = undefined;

      var id = serviceEdge.id;

      window.network.updateEdge(id,serviceEdge);

    };

    venueInterface.doTheRest = function() {
        note.debug('venueInterface.doTheRest()');
        console.log(venueInterface.options.points);
        var points = omnivore.csv(venueInterface.options.points, null, window.L.mapbox.featureLayer()).addTo(leaflet).on('error', function(error) {
            console.log(error);
        });

        leaflet.on('layeradd', function(e) {
            note.debug('leaflet -> layeradd');
            note.debug(e);
            if (e.layer.feature) {
                var popup = window.L.popup({closeButton:false}).setContent('<div class="service-popup" data-feature="'+e.layer.feature.properties['Abbreviated Name']+'">'+e.layer.feature.properties['Abbreviated Name']+'</div>');
                e.layer.bindPopup(popup).openPopup();
                e.layer.on('click', function(event) {
                    console.log(e.layer);
                  venueInterface.clickPopup(event, e.layer.feature.properties['Abbreviated Name']);
                });
            }
        });

        points.setFilter(function(feature) {
          // var popup = window.L.popup().setContent('<div class="service-popup" data-feature="'+feature.properties['Abbreviated Name']+'">'+feature.properties['Abbreviated Name']+'</div>');
          // layer.bindPopup(popup).openPopup();
          // // layer.feature.properties
          var filterCoords = filterCircle.getLatLng();
          var thisFeatureCords = window.L.latLng(feature.geometry.coordinates[1],feature.geometry.coordinates[0]);
          var distance = filterCoords.distanceTo(thisFeatureCords);
          return distance < RADIUS;
        }).on('ready', function() { // huge bullshittery. Event driven IO and no callback.
          // the layer has been fully loaded now, and you can
          // call .getTileJSON and investigate its properties
          console.log('READY');
          var nodeCount = 0;
          this.eachLayer(function(l) {
              console.log('each layer');
              nodeCount++;
            // Store the filtered points as nodes of type HIVservice

            // First, check if the proposed node already exists
            // TODO: This requires that if ego location changes, all nodes of type HIVService are deleted.

            var nodeProperties = {
              type_t0: 'HIVService',
              name: l.feature.properties['Abbreviated Name']
            };

            var serviceNodeID = null;

            if (window.network.getNodes(nodeProperties).length === 0) {
              serviceNodeID = window.network.addNode(nodeProperties);
              note.debug('created HIVService node for '+nodeProperties.name);
            } else {
              serviceNodeID = window.network.getNodes(nodeProperties)[0].id;
            }

            // Now check if we also need to create an edge
            var edgeProperties = {
              from: window.network.getEgo().id,
              to: serviceNodeID,
              type:'HIVService'
            };

            if (window.network.getEdges(edgeProperties).length === 0) {
                edgeProperties.visited = false;
                window.network.addEdge(edgeProperties);
            } else {
                // The edge already exists, so we need to check the value of 'visited' to see if it should be selected.
                var edge = window.network.getEdges(edgeProperties)[0];
                var visited = edge.visited;
                if(visited) {
                    venueInterface.selectMarker(l.feature.properties['Abbreviated Name']);
                }
            }



          });

          // if we didnt pick up any nodes, skip this stage
          if (nodeCount < 1) {
              console.log('No service providers close to ego. Skipping stage.');
              window.netCanvas.Modules.session.nextStage();
          } else {
              // else, show the map
             $('#content').removeClass('stageHidden');
          }

        });


    };

    venueInterface.drawUIComponents = function() {
        note.debug('venueInterface.drawUIComponents()');
        venueInterface.options.targetEl.append('<div class="container map-node-container"><div class="row form-group"><div class="col-sm-12 text-center"><h4 class="prompt" style="color:white"></h4></div></div>');
        $('.prompt').html(venueInterface.options.prompt);
    };

  	venueInterface.destroy = function() {
    	// Used to unbind events
        window.tools.Events.unbind(moduleEvents);

        leaflet.remove();
  	};

  	return venueInterface;
};
