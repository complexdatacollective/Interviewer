/* global $, window, Odometer, document, note  */
/* exported VenueGenerator */
module.exports = function VenueGenerator() {
    'use strict';
    //global vars
    var venueGenerator = {};
    venueGenerator.options = {
        nodeType:'Alter',
        edgeType:'Dyad',
        targetEl: $('.container'),
        variables: [],
        heading: 'This is a default heading',
        subheading: 'And this is a default subheading',
        panels: [],
    };

    var nodeBoxOpen = false;
    var editing = false;
    var relationshipPanel;
    var newNodePanel;
    var venueCounter;

    var venueCount = window.network.getNodes({type_t0: 'Alter'}).length;

    var keyPressHandler = function(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            if (nodeBoxOpen === false) {
                venueGenerator.openNodeBox();
            } else if (nodeBoxOpen === true) {
                $('.submit-1').click();
            }
        }

        if (e.keyCode === 27) {
            venueGenerator.closeNodeBox();
        }

        // Prevent accidental backspace navigation
        if (e.keyCode === 8 && !$(e.target).is('input, textarea')) {
            e.preventDefault();
        }

    };

    var stageChangeHandler = function() {
        venueGenerator.destroy();
    };

    var cardClickHandler = function() {
        // Handles what happens when a card is clicked

        // Don't do anything if this is a 'ghost' card (a placeholder created as a visual indicator while a previous network node is being dragged)
        if ($(this).hasClass('ghost')) {
            return false;
        }

        // Get the ID of the node corresponding to this card, stored in the data-index property.
        var index = $(this).data('index');

        // Get the dyad edge for this node
        var edge = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id, to: index, type:'Dyad'})[0];

        // Set the value of editing to the node id of the current person
        editing = index;

        // Update role count
        var roleCount = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id, to: editing, type:'Role'}).length;
        $('.relationship-button').html(roleCount+' roles selected.');

        // Make the relevant relationships selected on the relationships panel, even though it isnt visible yet
        var roleEdges = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id, to: editing, type:'Role'});
        $.each(roleEdges, function(index, value) {
            $(relationshipPanel).children('.relationship-types-container').children('.rel-'+value.reltype_main_t0).find('div[data-sub-relationship="'+value.reltype_sub_t0+'"]').addClass('selected');
        });

        // Populate the form with this nodes data.
        $.each(venueGenerator.options.variables, function(index, value) {
            if(value.private === false) {
                if (value.type === 'relationship') {
                    $('select[name="'+value.variable+'"]').val(edge[value.variable]);
                }else {
                    $('#'+value.variable).val(edge[value.variable]);
                }
                $('.delete-button').show();

                if (edge.elicited_previously === true) {
                    $('input#age_p_t0').prop( 'disabled', true);
                } else {
                    $('input#age_p_t0').prop( 'disabled', false);
                }
                venueGenerator.openNodeBox();
            }

        });

    };

    var cancelBtnHandler = function() {
        $('.delete-button').hide();
        venueGenerator.closeNodeBox();
    };

    var submitFormHandler = function(e) {
        note.info('submitFormHandler()');
        note.trace(e);

        e.preventDefault();

        var newEdgeProperties = {};
        var newNodeProperties = {};
        $('.delete-button').hide();
        $.each(venueGenerator.options.variables, function(index,value) {

            if(value.target === 'edge') {
                if (value.private === true) {
                    newEdgeProperties[value.variable] =  value.value;
                } else {
                    if(value.type === 'relationship' || value.type === 'subrelationship') {
                        newEdgeProperties[value.variable] =  $('select[name="'+value.variable+'"]').val();
                    } else {
                        newEdgeProperties[value.variable] =  $('#'+value.variable).val();
                    }
                }

            } else if (value.target === 'node') {
                if (value.private === true) {
                    newNodeProperties[value.variable] =  value.value;
                } else {
                    if(value.type === 'relationship' || value.type === 'subrelationship') {
                        newNodeProperties[value.variable] =  $('select[name="'+value.variable+'"]').val();
                    } else {
                        newNodeProperties[value.variable] =  $('#'+value.variable).val();
                    }

                }
            }
        });

        var nodeProperties = {};
        var edgeProperties = {};

        if (editing === false) {
            note.info('// We are submitting a new node');
            window.tools.extend(nodeProperties, newNodeProperties);
            var newNode = window.network.addNode(nodeProperties);
            var id;

            console.log('iterating edgetypes');
            $.each(venueGenerator.options.edgeTypes, function(index,value) {
                console.log(value);
                var currentEdgeProperties = {};
                var currentEdge = value;
                $.each(venueGenerator.options.variables, function(index, value) {
                    if (value.target === 'edge' && value.edge === currentEdge) {
                        if (value.private === true) {
                            currentEdgeProperties[value.variable] =  value.value;
                        } else {
                            if(value.type === 'relationship' || value.type === 'subrelationship') {
                                currentEdgeProperties[value.variable] =  $('select[name="'+value.variable+'"]').val();
                            } else {
                                currentEdgeProperties[value.variable] =  $('#'+value.variable).val();
                            }
                        }
                    }
                });
                edgeProperties = {
                    from: window.network.getNodes({type_t0:'Ego'})[0].id,
                    to: newNode,
                    type:currentEdge
                };

                window.tools.extend(edgeProperties,currentEdgeProperties);
                id = window.network.addEdge(edgeProperties);
            });


            note.info('// Main edge');
            var edge = window.network.getEdges({to:newNode, type:'Venue'})[0];
            venueGenerator.addToList(edge);
            venueCount++;
            venueCounter.update(venueCount);

        } else {
            note.info('// We are updating a node');

            var color = function() {
                var el = $('div[data-index='+editing+']');
                var current = el.css('background-color');
                el.stop().transition({background:'#1ECD97'}, 400, 'ease');
                setTimeout(function(){
                    el.stop().transition({ background: current}, 800, 'ease');
                }, 700);
            };

            var nodeID = editing;
            $.each(venueGenerator.options.edgeTypes, function(index,value) {
                var currentEdge = value;
                var currentEdgeProperties = {};
                $.each(venueGenerator.options.variables, function(index, value) {
                    if (value.target === 'edge' && value.edge === currentEdge) {
                        if (value.private === true) {
                            currentEdgeProperties[value.variable] =  value.value;
                        } else {
                            if(value.type === 'relationship' || value.type === 'subrelationship') {
                                currentEdgeProperties[value.variable] =  $('select[name="'+value.variable+'"]').val();
                            } else {
                                currentEdgeProperties[value.variable] =  $('#'+value.variable).val();
                            }
                        }
                    }
                });

                var edges = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id,to:editing,type:value});
                $.each(edges, function(index,value) {
                    window.network.updateEdge(value.id,currentEdgeProperties, color);
                });
            });

            window.network.updateNode(nodeID, newNodeProperties);
            var properties = window.tools.extend(newEdgeProperties,newNodeProperties);

            // update relationship roles

            $('div[data-index='+editing+']').html('');
            $('div[data-index='+editing+']').append('<h4>'+properties.nname_t0+'</h4>');
            var list = $('<ul></ul>');

            $.each(venueGenerator.options.variables, function(index, value) {
                if (value.private === false && properties[value.variable] !== undefined && properties[value.variable] !== '') {
                    list.append('<li class="'+properties[value.variable]+'"><strong>'+value.label+'</strong>: '+properties[value.variable]+'</li>');
                }

            });

            $('div[data-index='+editing+']').append(list);
            venueCount = window.network.getNodes({type_t0: 'Alter'}).length;
            venueCounter.update(venueCount);
            editing = false;

        }


        venueGenerator.closeNodeBox();


    };

    venueGenerator.generateTestVenues = function(number) {

        if (!number) {
            note.error('You must specify the number of test venues you want to create. Cancelling!');
            return false;
        }

        var eachTime = 4000;

        for (var i = 0; i < number; i++) {
            var timer = eachTime*i;
            setTimeout(venueGenerator.generateVenue, timer);
        }

    };

    venueGenerator.generateVenue = function() {
        // We must simulate every interaction to ensure that any errors are caught.
        $('.add-button').click();
        setTimeout(function() {
            $('#ngForm').submit();
        }, 3000);

        var lname = $('#fname_t0').val()+' '+$('#lname_t0').val().charAt(0);
        if ($('#lname_t0').val().length > 0 ) {
            lname +='.';
        }
        $('#nname_t0').val(lname);
        $('#age_p_t0').val(Math.floor(window.tools.randomBetween(18,90)));

        setTimeout(function() {
            $('.relationship-button').click();
        }, 500);
        setTimeout(function() {

            var roleNumber = Math.floor(window.tools.randomBetween(1,3));

            for (var j = 0; j < roleNumber; j++) {
                $($('.relationship')[Math.floor(window.tools.randomBetween(0,$('.relationship').length))]).addClass('selected');

            }

            $('.relationship-close-button').click();
        }, 2000);
    };

    venueGenerator.openNodeBox = function() {
        $('.newVenueBox').height($('.newVenueBox').height());
        $('.newVenueBox').addClass('open');
        $('.black-overlay').css({'display':'block'});
        setTimeout(function() {
            $('.black-overlay').addClass('show');
        }, 50);
        setTimeout(function() {
            $('#ngForm input:text').first().focus();
        }, 1000);

        nodeBoxOpen = true;
    };

    venueGenerator.closeNodeBox = function() {
        $('input#age_p_t0').prop( 'disabled', false);
        $('.black-overlay').removeClass('show');
        $('.newVenueBox').removeClass('open');
        setTimeout(function() { // for some reason this doenst work without an empty setTimeout
            $('.black-overlay').css({'display':'none'});
        }, 300);
        nodeBoxOpen = false;
        $('#ngForm').trigger('reset');
        editing = false;
    };

    venueGenerator.destroy = function() {
        note.debug('Destroying venueGenerator.');
        // Event listeners
        $(window.document).off('keydown', keyPressHandler);
        $(window.document).off('click', '.cancel', cancelBtnHandler);
        $(window.document).off('click', '.add-button', venueGenerator.openNodeBox);
        $(window.document).off('click', '.delete-button', venueGenerator.removeFromList);
        $(window.document).off('click', '.inner-card', cardClickHandler);
        $(window.document).off('submit', '#ngForm', submitFormHandler);
        window.removeEventListener('changeStageStart', stageChangeHandler, false);
        $('.newVenueBox').remove();


    };

    venueGenerator.init = function(options) {
        window.tools.extend(venueGenerator.options, options);
        // $.extend(true, venueGenerator.options, options);
        // create elements
        var button = $('<span class="fa fa-4x fa-map-pin add-button"></span>');
        venueGenerator.options.targetEl.append(button);
        var venueCountBox = $('<div class="venue-count-box"></div>');
        venueGenerator.options.targetEl.append(venueCountBox);

        // create node box
        var newVenueBox = $('<div class="newVenueBox overlay"><form role="form" id="ngForm" class="form"><div class="col-sm-12"><h2 style="margin-top:0;margin-bottom:30px;"><span class="fa fa-map-pin"></span> Adding a Venue</h2></div><div class="col-sm-12 fields"></div></form></div>');

        // venueGenerator.options.targetEl.append(newVenueBox);
        $('body').append(newVenueBox);
        $.each(venueGenerator.options.variables, function(index, value) {
            if(value.private !== true) {

                var formItem;

                switch(value.type) {
                    case 'text':
                    formItem = $('<div class="form-group '+value.variable+'"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" name="'+value.variable+'" placeholder="'+value.label+'"></div></div>');
                    break;

                    case 'autocomplete':
                    formItem = $('<div class="form-group ui-widget '+value.variable+'"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" name="'+value.variable+'" placeholder="'+value.label+'"></div></div>');
                    break;

                    case 'dropdown':
                    formItem = $('<div class="form-group '+value.variable+'"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" name="'+value.variable+'" placeholder="'+value.label+'"></div></div>');
                    break;

                    case 'number':
                    formItem = $('<div class="form-group '+value.variable+'"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="number" class="form-control '+value.variable+'" id="'+value.variable+'" name="'+value.variable+'" placeholder="'+value.label+'"></div></div>');
                    break;

                    case 'scale':
                    formItem = $('<input type="hidden" class="form-control '+value.variable+'" id="'+value.variable+'" name="'+value.variable+'" placeholder="'+value.label+'">');
                    break;

                }

                $('.newVenueBox .form .fields').append(formItem);

                $('#venuename_t0').autocomplete({
                  source: [
                    'ActionScript',
                    'AppleScript',
                    'Asp',
                    'BASIC',
                    'C',
                    'C++',
                    'Clojure',
                    'COBOL',
                    'ColdFusion',
                    'Erlang',
                    'Fortran',
                    'Groovy',
                    'Haskell',
                    'Java',
                    'JavaScript',
                    'Lisp',
                    'Perl',
                    'PHP',
                    'Python',
                    'Ruby',
                    'Scala',
                    'Scheme'
                  ]
                });

            }

        });

        var buttons = $('<div class="row"><div class="col-sm-4"><button type="submit" class="btn btn-success btn-block submit-1"><span class="glyphicon glyphicon-plus-sign"></span> Add</button></div><div class="col-sm-4"><button type="button" class="btn btn-danger btn-block delete-button"><span class="glyphicon glyphicon-trash"></span> Delete</button></div><div class="col-sm-4"><span class="btn btn-warning btn-block cancel">Cancel</span></div></div>');
        $('.newVenueBox .form .fields').append(buttons);

        newNodePanel = $('.newVenueBox').html();

        var nodeContainer = $('<div class="question-container"></div><div class="node-container-bottom-bg"></div>');
        venueGenerator.options.targetEl.append(nodeContainer);

        var title = $('<h1 class="text-center"></h1>').html(venueGenerator.options.heading);
        $('.question-container').append(title);
        var subtitle = $('<p class="lead text-center"></p>').html(venueGenerator.options.subheading);
        $('.question-container').append(subtitle);

        // create namelist container
        var nameList = $('<div class="node-container nameList"></div>');
        venueGenerator.options.targetEl.append(nameList);

        // Event listeners
        window.addEventListener('changeStageStart', stageChangeHandler, false);
        $(window.document).on('keydown', keyPressHandler);
        $(window.document).on('click', '.cancel', cancelBtnHandler);
        $(window.document).on('click', '.add-button', venueGenerator.openNodeBox);
        $(window.document).on('click', '.delete-button', venueGenerator.removeFromList);
        $(window.document).on('click', '.inner-card', cardClickHandler);
        $(window.document).on('submit', '#ngForm', submitFormHandler);

        // Set node count box
        var el = document.querySelector('.venue-count-box');

        venueCounter = new Odometer({
          el: el,
          value: venueCount,
          format: 'dd',
          theme: 'default'
        });

        // add existing nodes
        $.each(window.network.getEdges({type: 'Venue', from: window.network.getNodes({type_t0:'Ego'})[0].id, vg_t0:venueGenerator.options.variables[0].value}), function(index,value) {
            venueGenerator.addToList(value);
        });

        // Handle side panels
        if (venueGenerator.options.panels.length > 0) {

            // Side container
            var sideContainer = $('<div class="side-container"></div>');

            // Current side panel shows alters already elicited
            if (venueGenerator.options.panels.indexOf('current') !== -1) {

                // add custom node list
                sideContainer.append($('<div class="current-node-list node-lists"><h4>People you already listed:</h4></div>'));
                $.each(window.network.getEdges({type: 'Dyad', from: window.network.getNodes({type_t0:'Ego'})[0].id}), function(index,value) {

                    var el = $('<div class="node-list-item">'+value.nname_t0+'</div>');
                    sideContainer.children('.current-node-list').append(el);
                });
            }

            // Previous side panel shows previous network alters
            if (venueGenerator.options.panels.indexOf('previous') !== -1) {
                // add custom node list for previous network

                //first chck if there is a previous network
                if (typeof window.netCanvas.Modules.session.sessionData.previousNetwork !== 'undefined') {
                    if (typeof window.previousNetwork === 'undefined') {
                        window.previousNetwork = new window.netCanvas.Modules.Network();
                        window.previousNetwork.loadNetwork(window.netCanvas.Modules.session.sessionData.previousNetwork);
                    }
                    // Check there is more than one node
                    if (window.previousNetwork.getNodes().length > 1) {
                        // Add the previous node list
                        sideContainer.append($('<div class="previous-node-list node-lists"><h4>People you listed in other visits:</h4></div>'));
                        $.each(window.previousNetwork.getEdges({type: 'Dyad', from: window.previousNetwork.getEgo().id}), function(index,value) {

                            var el = $('<div class="node-bucket-item draggable" data-id="'+value.to+'">'+value.nname_t0+'</div>');
                            sideContainer.children('.previous-node-list').append(el);
                        });

                    }

                } // end if previous network is undefined
            } // end previous panel

            if (sideContainer.children().length > 0) {
                // move node list to one side
                sideContainer.insertBefore('.nameList');
                $('.nameList').addClass('alt');
                // Make nodes draggable
                $('.draggable').draggable({ cursor: 'pointer', revert: 'invalid', disabled: false ,
                    start: function(){
                        $(this).parent().css('overflow','visible');
                    },
                    stop: function() {
                        $('.previous-node-list').css('overflow','scroll');
                        $('.current-node-list').css('overflow','scroll');
                    }
                });

                $('.node-container').droppable({ accept: '.draggable',
                    drop: function(event, ui) {
                        // remove the ghost card
                        $('.previous-node-list').css('overflow','scroll');
                        $('.current-node-list').css('overflow','scroll');
                        $('.card.ghost').remove();

                        // get the data we need
                        var dropped = ui.draggable;
                        var droppedNode = dropped.data('id');
                        var dyadEdge = window.previousNetwork.getEdges({type: 'Dyad', from: window.previousNetwork.getEgo().id, to: droppedNode})[0];

                        // update name generator property of dyad edge

                        // get the current name generator's label
                        var ngStep;
                        $.each(venueGenerator.options.variables, function(index, value) {
                            if (value.label === 'ng_t0') { ngStep = value.value; }
                        });

                        dyadEdge.ng_t0 = ngStep;

                        // Add the dropped node to the list, creating a card for it
                        venueGenerator.addToList(dyadEdge);

                        // create a node and edge in the current network
                        var oldNode = window.previousNetwork.getNode(droppedNode);
                        dyadEdge.elicited_previously = true;
                        window.network.addNode(oldNode, false, true);  // (properties, ego, force);
                        window.network.addEdge(dyadEdge);

                        $.each(venueGenerator.options.edgeTypes, function(edgeTypeIndex,edgeType) {
                            if (edgeType !== 'Dyad') {
                                var currentEdgeProperties = {};
                                $.each(venueGenerator.options.variables, function(index, value) {
                                    if (value.target === 'edge' && value.edge === edgeType) {
                                        if (value.private === true) {
                                            currentEdgeProperties[value.variable] =  value.value;
                                        } else {
                                            if(value.type === 'relationship' || value.type === 'subrelationship') {
                                                currentEdgeProperties[value.variable] =  $('select[name="'+value.variable+'"]').val();
                                            } else {
                                                currentEdgeProperties[value.variable] =  $('#'+value.variable).val();
                                            }
                                        }
                                    }
                                });
                                var edgeProperties = {
                                    from: window.network.getEgo().id,
                                    to: droppedNode,
                                    type:edgeType
                                };

                                window.tools.extend(edgeProperties,currentEdgeProperties);
                                window.network.addEdge(edgeProperties);
                            }

                        });

                        $('.inner-card').last().click();

                        setTimeout(function() {
                            $('.relationship-button').click();
                        }, 300);
                        // Remove from previous network
                        window.previousNetwork.removeNode(oldNode.id);

                        window.netCanvas.Modules.session.addData('previousNetwork', {nodes: window.previousNetwork.getNodes(), edges: window.previousNetwork.getEdges()});
                        $(dropped).remove();
                        //hide the ghost card
                        $('.card.ghost').removeClass('show');
                    },
                    over: function() {
                        $('.node-container').scrollTop($('.node-container')[0].scrollHeight);
                        $('.node-container').append('<div class="card ghost"><div class="inner-card ghost"><i class="fa fa-5x fa-plus-circle"></i>Add</div></div>');
                        setTimeout(function() {
                            $('.card.ghost').addClass('show');
                        }, 100);

                    },
                    out: function() {
                        $('.card.ghost').removeClass('show');
                        setTimeout(function() {
                            $('.card.ghost').remove();
                        }, 300);

                    }
                });
            }

            // halve the panel height if we have two
            if ($('.side-container').children().length > 1) {
                $('.node-lists').addClass('double');
            }

        } // end if panels
    };

    venueGenerator.addToList = function(properties) {
        // var index = $(this).data('index');
        var card;

        card = $('<div class="card"><div class="inner-card" data-index="'+properties.to+'"><h4>'+properties.nname_t0+'</h4></div></div>');
        var list = $('<ul></ul>');
        $.each(venueGenerator.options.variables, function(index, value) {
            if (value.private === false && properties[value.variable] !== undefined && properties[value.variable] !== '') {
                list.append('<li class="'+properties[value.variable]+'"><strong>'+value.label+'</strong>: '+properties[value.variable]+'</li>');
            }

        });
        card.children('.inner-card').append(list);
        $('.nameList').append(card);

    };

    venueGenerator.removeFromList = function() {
        $('.delete-button').hide();

        var nodeID = editing;

        window.network.removeNode(nodeID);

        $('div[data-index='+editing+']').addClass('delete');
        var tempEditing = editing;
        setTimeout(function() {
            $('div[data-index='+tempEditing+']').parent().remove();
        }, 700);

        editing = false;
        var venueCount = window.network.getNodes({type_t0: 'Alter'}).length;
        venueCounter.update(venueCount);

        venueGenerator.closeNodeBox();
    };

    return venueGenerator;
};
