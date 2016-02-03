/* global $, window, Odometer, document, note  */
/* exported Namegenerator */
module.exports = function Namegenerator() {
    'use strict';
    //global vars
    var namegenerator = {};
    namegenerator.options = {
        nodeType:'Alter',
        edgeType:'Dyad',
        targetEl: $('.container'),
        variables: [],
        heading: 'This is a default heading',
        subheading: 'And this is a default subheading',
        panels: [],
        roles: {
            'Friend': ['Best Friend','Friend','Ex-friend','Other type'],
            'Family / Relative': ['Parent / Guardian','Brother / Sister','Grandparent','Other Family','Chosen Family'],
            'Romantic / Sexual Partner': ['Boyfriend / Girlfriend','Ex-Boyfriend / Ex-Girlfriend','Booty Call / Fuck Buddy / Hook Up','One Night Stand','Other type of Partner'],
            'Acquaintance / Associate': ['Coworker / Colleague','Classmate','Roommate','Friend of a Friend','Neighbor','Other'],
            'Other Support / Source of Advice': ['Teacher / Professor','Counselor / Therapist','Community Agency Staff','Religious Leader','Mentor','Coach','Other'],
            'Drug Use': ['Someone you use drugs with','Someone you buy drugs from'],
            'Other': ['Other relationship']
        }
    };

    var nodeBoxOpen = false;
    var editing = false;
    var relationshipPanel;
    var newNodePanel;
    var newNodePanelContent;
    var alterCounter;

    var alterCount = window.network.getNodes({type_t0: 'Alter'}).length;

    var namesList = ['Joshua', 'Bernie', 'Michelle', 'Gregory', 'Patrick', 'Barney', 'Jonathon','Myles','Alethia','Tammera','Veola','Meredith','Renee','Grisel','Celestina','Fausto','Eliana','Raymundo','Lyle','Carry','Kittie','Melonie','Elke','Mattie','Kieth','Lourie','Marcie','Trinity','Librada','Lloyd','Pearlie','Velvet','Stephan','Hildegard','Winfred','Tempie','Maybelle','Melynda','Tiera','Lisbeth','Kiera','Gaye','Edra','Karissa','Manda','Ethelene','Michelle','Pamella','Jospeh','Tonette','Maren','Aundrea','Madelene','Epifania','Olive'];

    var keyPressHandler = function(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            if (nodeBoxOpen === false) {
                namegenerator.openNodeBox();
            } else if (nodeBoxOpen === true) {
                $('.submit-1').click();
            }
        }

        if (e.keyCode === 27) {
            namegenerator.closeNodeBox();
        }

        // Prevent accidental backspace navigation
        if (e.keyCode === 8 && !$(e.target).is('input, textarea')) {
            e.preventDefault();
        }

    };

    var roleClickHandler = function() {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');

        } else {
            $(this).addClass('selected');
        }

    };

    var inputKeypressHandler = function(e) {
        if (nodeBoxOpen === true) {
            if (e.keyCode !== 13) {
                if($('#fname_t0').val().length > 0 && $('#fname_t0').val().length > 0) {

                    var lname = $('#fname_t0').val()+' '+$('#lname_t0').val().charAt(0);
                    if ($('#lname_t0').val().length > 0 ) {
                        lname +='.';
                    }

                    var updateName = function() {
                        $('#nname_t0').val(lname);
                    };

                    setTimeout(updateName,0);

                }
            }
        }

    };

    var stageChangeHandler = function() {
        namegenerator.destroy();
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
        $.each(namegenerator.options.variables, function(index, value) {
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
                namegenerator.openNodeBox();
            }

        });

    };

    var cancelBtnHandler = function() {
        $('.delete-button').hide();
        namegenerator.closeNodeBox();
    };

    var submitFormHandler = function(e) {
        note.info('submitFormHandler()');
        note.trace(e);

        e.preventDefault();

        var newEdgeProperties = {};
        var newNodeProperties = {};
        $('.delete-button').hide();
        $.each(namegenerator.options.variables, function(index,value) {

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
            $.each(namegenerator.options.edgeTypes, function(index,value) {
                console.log(value);
                var currentEdgeProperties = {};
                var currentEdge = value;
                $.each(namegenerator.options.variables, function(index, value) {
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

            note.info('// Add role edges');

            note.info('// Iterate through selected items and create a new role edge for each.');
            $.each($(relationshipPanel).find('.relationship.selected'), function() {
                edgeProperties = {
                    type: 'Role',
                    from:window.network.getNodes({type_t0:'Ego'})[0].id,
                    to: newNode,
                    reltype_main_t0: $(this).parent('.relationship-type').data('main-relationship'),
                    reltype_sub_t0: $(this).data('sub-relationship')
                };
                window.network.addEdge(edgeProperties);
            });

            note.info('// Main edge');
            var edge = window.network.getEdges({to:newNode, type:'Dyad'})[0];
            namegenerator.addToList(edge);
            alterCount++;
            alterCounter.update(alterCount);

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
            $.each(namegenerator.options.edgeTypes, function(index,value) {
                var currentEdge = value;
                var currentEdgeProperties = {};
                $.each(namegenerator.options.variables, function(index, value) {
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

            // Remove existing edges
            window.network.removeEdges(window.network.getEdges({type:'Role', from: window.network.getNodes({type_t0:'Ego'})[0].id, to: editing}));

            $.each($(relationshipPanel).find('.relationship.selected'), function() {
                edgeProperties = {
                    type: 'Role',
                    from:window.network.getNodes({type_t0:'Ego'})[0].id,
                    to: editing,
                    reltype_main_t0: $(this).parent('.relationship-type').data('main-relationship'),
                    reltype_sub_t0: $(this).data('sub-relationship')
                };
                window.network.addEdge(edgeProperties);
            });

            $('div[data-index='+editing+']').html('');
            $('div[data-index='+editing+']').append('<h4>'+properties.nname_t0+'</h4>');
            var list = $('<ul></ul>');

            $.each(namegenerator.options.variables, function(index, value) {
                if (value.private === false && properties[value.variable] !== undefined && properties[value.variable] !== '') {
                    list.append('<li class="'+properties[value.variable]+'"><strong>'+value.label+'</strong>: '+properties[value.variable]+'</li>');
                }

            });

            $('div[data-index='+editing+']').append(list);
            alterCount = window.network.getNodes({type_t0: 'Alter'}).length;
            alterCounter.update(alterCount);
            editing = false;

        } // end if editing


        namegenerator.closeNodeBox();


    };

    namegenerator.generateTestAlters = function(number) {

        if (!number) {
            note.error('You must specify the number of test alters you want to create. Cancelling!');
            return false;
        }

        var eachTime = 4000;

        for (var i = 0; i < number; i++) {
            var timer = eachTime*i;
            setTimeout(namegenerator.generateAlter, timer);
        }

    };

    namegenerator.generateAlter = function() {
        // We must simulate every interaction to ensure that any errors are caught.
        $('.add-button').click();
        setTimeout(function() {
            $('#ngForm').submit();
        }, 3000);

        $('#fname_t0').val(namesList[Math.floor(window.tools.randomBetween(0,namesList.length))]);
        $('#lname_t0').val(namesList[Math.floor(window.tools.randomBetween(0,namesList.length))]);
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

    namegenerator.openNodeBox = function() {
        $('.newNodeBox').height($('.newNodeBox').height());
        $('.newNodeBox').addClass('open');
        $('.black-overlay').css({'display':'block'});
        setTimeout(function() {
            $('.black-overlay').addClass('show');
        }, 50);
        setTimeout(function() {
            $('#ngForm input:text').first().focus();
        }, 1000);

        nodeBoxOpen = true;
    };

    namegenerator.closeNodeBox = function() {
        $('input#age_p_t0').prop( 'disabled', false);
        $('.black-overlay').removeClass('show');
        $('.newNodeBox').removeClass('open');
        setTimeout(function() { // for some reason this doenst work without an empty setTimeout
            $('.black-overlay').css({'display':'none'});
        }, 300);
        nodeBoxOpen = false;
        $('#ngForm').trigger('reset');
        editing = false;
        $('.relationship-button').html('Set Relationship Roles');
        $(relationshipPanel).find('.relationship').removeClass('selected');
    };

    namegenerator.destroy = function() {
        note.debug('Destroying namegenerator.');
        // Event listeners
        $(window.document).off('keydown', keyPressHandler);
        $(window.document).off('keyup', '#fname_t0, #lname_t0', inputKeypressHandler);
        $(window.document).off('click', '.cancel', cancelBtnHandler);
        $(window.document).off('click', '.add-button', namegenerator.openNodeBox);
        $(window.document).off('click', '.delete-button', namegenerator.removeFromList);
        $(window.document).off('click', '.inner-card', cardClickHandler);
        $(window.document).off('submit', '#ngForm', submitFormHandler);
        $(window.document).off('click', '.relationship', roleClickHandler);
        $(window.document).off('click', '.relationship-button', namegenerator.toggleRelationshipBox);
        $(window.document).off('click', '.relationship-close-button', namegenerator.toggleRelationshipBox);
        window.removeEventListener('changeStageStart', stageChangeHandler, false);
        $('.newNodeBox').remove();
        $('.relationship-types-container').remove();


    };

    namegenerator.init = function(options) {
        window.tools.extend(namegenerator.options, options);
        // $.extend(true, namegenerator.options, options);
        // create elements
        var button = $('<span class="fa fa-4x fa-user-plus add-button"></span>');
        namegenerator.options.targetEl.append(button);
        var alterCountBox = $('<div class="alter-count-box"></div>');
        namegenerator.options.targetEl.append(alterCountBox);

        // create node box
        var newNodeBox = $('<div class="newNodeBox overlay"><form role="form" id="ngForm" class="form"><div class="col-sm-12"><h2 style="margin-top:0;margin-bottom:30px;"><span class="fa fa-user-plus"></span> Adding a Person</h2></div><div class="col-sm-12 fields"></div></form></div>');

        // namegenerator.options.targetEl.append(newNodeBox);
        $('body').append(newNodeBox);
        $.each(namegenerator.options.variables, function(index, value) {
            if(value.private !== true) {

                var formItem;

                switch(value.type) {
                    case 'text':
                    formItem = $('<div class="form-group '+value.variable+'"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" name="'+value.variable+'" placeholder="'+value.label+'"></div></div>');
                    break;

                    case 'number':
                    formItem = $('<div class="form-group '+value.variable+'"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="number" class="form-control '+value.variable+'" id="'+value.variable+'" name="'+value.variable+'" placeholder="'+value.label+'"></div></div>');
                    break;

                    case 'relationship':
                    formItem = $('<input type="hidden" class="form-control '+value.variable+'" id="'+value.variable+'" name="'+value.variable+'" placeholder="'+value.label+'">');

                    break;

                    case 'subrelationship':
                    formItem = $('<input type="hidden" class="form-control '+value.variable+'" id="'+value.variable+'" name="'+value.variable+'" placeholder="'+value.label+'">');
                    break;

                }
                $('.newNodeBox .form .fields').append(formItem);
                if (value.required === true) {
                    if (value.type === 'relationship') {
                        $('select[name="'+value.variable+'"]').prop('required', true);
                    } else {
                        $('#'+value.variable).prop('required', true);
                    }

                }

            }

        });

        $('.newNodeBox .form .fields').append('<div class="form-group"><div class=""><button type="button" class="btn btn-primary btn-block relationship-button">Set Relationship Roles</div></div></div>');
        var buttons = $('<div class="row"><div class="col-sm-4"><button type="submit" class="btn btn-success btn-block submit-1"><span class="glyphicon glyphicon-plus-sign"></span> Add</button></div><div class="col-sm-4"><button type="button" class="btn btn-danger btn-block delete-button"><span class="glyphicon glyphicon-trash"></span> Delete</button></div><div class="col-sm-4"><span class="btn btn-warning btn-block cancel">Cancel</span></div></div>');
        $('.newNodeBox .form .fields').append(buttons);

        newNodePanel = $('.newNodeBox').html();

        // relationship types
        relationshipPanel = $('<div class="relationship-content"><div class="relationship-close-button">Back <span class="fa fa-2x fa-sign-in"></span></div><div class="col-sm-12 relationship-header"><h2 style="margin-top:0;margin-bottom:30px;"><span class="fa fa-connectdevelop"></span> Adding Relationships</h2></div><div class="relationship-types-container"></div></div>');
        var counter = 0;
        $.each(namegenerator.options.roles, function(index) {
            $(relationshipPanel).find('.relationship-types-container').append('<div class="relationship-type rel-'+counter+' c'+counter+'" data-main-relationship="'+counter+'"><h1>'+index+'</h1></div>');
            $.each(namegenerator.options.roles[index], function(relIndex, relValue) {
                $(relationshipPanel).find('.rel-'+counter).append('<div class="relationship" data-sub-relationship="'+relValue+'">'+relValue+'</div>');
            });
            counter++;
        });

        var nodeContainer = $('<div class="question-container"></div><div class="node-container-bottom-bg"></div>');
        namegenerator.options.targetEl.append(nodeContainer);

        var title = $('<h1 class="text-center"></h1>').html(namegenerator.options.heading);
        $('.question-container').append(title);
        var subtitle = $('<p class="lead text-center"></p>').html(namegenerator.options.subheading);
        $('.question-container').append(subtitle);

        // create namelist container
        var nameList = $('<div class="node-container nameList"></div>');
        namegenerator.options.targetEl.append(nameList);

        // Event listeners
        window.addEventListener('changeStageStart', stageChangeHandler, false);
        $(window.document).on('keydown', keyPressHandler);
        $(window.document).on('click', '.cancel', cancelBtnHandler);
        $(window.document).on('click', '.add-button', namegenerator.openNodeBox);
        $(window.document).on('click', '.delete-button', namegenerator.removeFromList);
        $(window.document).on('keyup', '#fname_t0, #lname_t0', inputKeypressHandler);
        $(window.document).on('click', '.inner-card', cardClickHandler);
        $(window.document).on('submit', '#ngForm', submitFormHandler);
        $(window.document).on('click', '.relationship', roleClickHandler);
        $(window.document).on('click', '.relationship-button', namegenerator.toggleRelationshipBox);
        $(window.document).on('click', '.relationship-close-button', namegenerator.toggleRelationshipBox);

        // Set node count box
        var el = document.querySelector('.alter-count-box');

        alterCounter = new Odometer({
          el: el,
          value: alterCount,
          format: 'dd',
          theme: 'default'
        });

        // add existing nodes
        $.each(window.network.getEdges({type: 'Dyad', from: window.network.getNodes({type_t0:'Ego'})[0].id, ng_t0:namegenerator.options.variables[5].value}), function(index,value) {
            namegenerator.addToList(value);
        });

        // Handle side panels
        if (namegenerator.options.panels.length > 0) {

            // Side container
            var sideContainer = $('<div class="side-container"></div>');

            // Current side panel shows alters already elicited
            if (namegenerator.options.panels.indexOf('current') !== -1) {

                // add custom node list
                sideContainer.append($('<div class="current-node-list node-lists"><h4>People you already listed:</h4></div>'));
                $.each(window.network.getEdges({type: 'Dyad', from: window.network.getNodes({type_t0:'Ego'})[0].id}), function(index,value) {

                    var el = $('<div class="node-list-item">'+value.nname_t0+'</div>');
                    sideContainer.children('.current-node-list').append(el);
                });
            }

            // Previous side panel shows previous network alters
            if (namegenerator.options.panels.indexOf('previous') !== -1) {
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
                        $.each(namegenerator.options.variables, function(index, value) {
                            if (value.label === 'ng_t0') { ngStep = value.value; }
                        });

                        dyadEdge.ng_t0 = ngStep;

                        // Add the dropped node to the list, creating a card for it
                        namegenerator.addToList(dyadEdge);

                        // create a node and edge in the current network
                        var oldNode = window.previousNetwork.getNode(droppedNode);
                        dyadEdge.elicited_previously = true;
                        window.network.addNode(oldNode, false, true);  // (properties, ego, force);
                        window.network.addEdge(dyadEdge);

                        console.log('Adding other custom edges for this interface.');
                        $.each(namegenerator.options.edgeTypes, function(edgeTypeIndex,edgeType) {
                            if (edgeType !== 'Dyad') {
                                var currentEdgeProperties = {};
                                $.each(namegenerator.options.variables, function(index, value) {
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

    namegenerator.toggleRelationshipBox = function() {
        if ($('.newNodeBox').hasClass('relationships')) {
            // relationship box is open, so close it
            var roleCount = $('.relationship.selected').length;
            var plural = 'roles';

            if (roleCount === 1) {
                plural = 'role';
            }

            // fade out

            $('.newNodeBox').addClass('content-hidden');

            setTimeout(function() {
                $('.newNodeBox').removeClass('relationships');
                $('.newNodeBox').html(newNodePanel);
                setTimeout(function() {

                });
                var wasDisabled = false;
                if ($('input#age_p_t0').is(':disabled')) {
                    $('input#age_p_t0').prop( 'disabled', false);
                    wasDisabled = true;
                }
                $('#ngForm').deserialize(newNodePanelContent);

                if (wasDisabled === true) {
                    $('input#age_p_t0').prop( 'disabled', true);
                }

                if(editing) {
                    $('.relationship-button').html(roleCount+' '+plural+' selected.');
                } else {
                    if (roleCount > 0) {
                        $('.relationship-button').html(roleCount+' '+plural+' selected.');
                    } else {
                        $('.relationship-button').html('Set Relationship Roles');
                    }
                }

            }, 300);
            setTimeout(function() {
                $('.newNodeBox').removeClass('content-hidden');
            }, 500);

        } else {
            // relationship box is closed, so open it
            var wasDisabled = false;
            if ($('input#age_p_t0').is(':disabled')) {
                wasDisabled = true;
                $('input#age_p_t0').prop( 'disabled', false);
            }
            newNodePanelContent = $('#ngForm').serialize();

            if (wasDisabled === true) {
                $('input#age_p_t0').prop( 'disabled', true);
            }
            newNodePanel = $('.newNodeBox').html();
            $('.newNodeBox').addClass('content-hidden');

            setTimeout(function() {
                $('.newNodeBox').addClass('relationships');
                $('.newNodeBox').html(relationshipPanel);

            }, 300);

            setTimeout(function(){
                $('.newNodeBox').removeClass('content-hidden');
            }, 700);

        }
    };

    namegenerator.addToList = function(properties) {
        // var index = $(this).data('index');
        var card;

        card = $('<div class="card"><div class="inner-card" data-index="'+properties.to+'"><h4>'+properties.nname_t0+'</h4></div></div>');
        var list = $('<ul></ul>');
        $.each(namegenerator.options.variables, function(index, value) {
            if (value.private === false && properties[value.variable] !== undefined && properties[value.variable] !== '') {
                list.append('<li class="'+properties[value.variable]+'"><strong>'+value.label+'</strong>: '+properties[value.variable]+'</li>');
            }

        });
        card.children('.inner-card').append(list);
        $('.nameList').append(card);

    };

    namegenerator.removeFromList = function() {
        $('.delete-button').hide();

        var nodeID = editing;

        window.network.removeNode(nodeID);

        $('div[data-index='+editing+']').addClass('delete');
        var tempEditing = editing;
        setTimeout(function() {
            $('div[data-index='+tempEditing+']').parent().remove();
        }, 700);

        editing = false;
        var alterCount = window.network.getNodes({type_t0: 'Alter'}).length;
        alterCounter.update(alterCount);

        namegenerator.closeNodeBox();
    };

    return namegenerator;
};
