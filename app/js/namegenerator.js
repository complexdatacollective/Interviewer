/* global $, window */
/* exported Namegenerator */
var Namegenerator = function Namegenerator() {
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
        panels: []
    };

    var nodeBoxOpen = false;
    var editing = false;

    var alterCount = global.network.getNodes({type_t0: 'Alter'}).length;

    var roles = {
        'Friend': ['Best Friend','Friend','Ex-friend','Other type'],
        'Family / Relative': ['Parent / Guardian','Brother / Sister','Grandparent','Other Family','Chosen Family'],
        'Romantic / Sexual Partner': ['Boyfriend / Girlfriend','Ex-Boyfriend / Ex-Girlfriend','Booty Call / Fuck Buddy / Hook Up','One Night Stand','Other type of Partner'],
        'Acquaintance / Associate': ['Coworker / Colleague','Classmate','Roommate','Friend of a Friend','Neighbor','Other'],
        'Other Support / Source of Advice': ['Teacher / Professor','Counselor / Therapist','Community Agency Staff','Religious Leader','Mentor','Coach','Other'],
        'Drug Use': ['Someone you use drugs with','Someone you buy drugs from'],
        'Other': ['Other relationship']
    };

    var namesList = ['Barney','Joshua','Jonathon','Myles','Alethia','Tammera','Veola','Meredith','Renee','Grisel','Celestina','Fausto','Eliana','Raymundo','Lyle','Carry','Kittie','Melonie','Elke','Mattie','Kieth','Lourie','Marcie','Trinity','Librada','Lloyd','Pearlie','Velvet','Stephan','Hildegard','Winfred','Tempie','Maybelle','Melynda','Tiera','Lisbeth','Kiera','Gaye','Edra','Karissa','Manda','Ethelene','Michelle','Pamella','Jospeh','Tonette','Maren','Aundrea','Madelene','Epifania','Olive'];

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

        if ($(this).data('selected') === true) {
            $(this).data('selected', false);
            $(this).removeClass('selected');

        } else {
            $(this).data('selected', true);
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
        if ($(this).hasClass('ghost')) {
            return false;
        }
        var index = $(this).data('index');
        var edge = global.network.getEdges({from:global.network.getNodes({type_t0:'Ego'})[0].id, to: index, type:'Dyad'})[0];

        // Set the value of editing to the node id of the current person
        editing = index;

        // Update role count
        var roleCount = global.network.getEdges({from:global.network.getNodes({type_t0:'Ego'})[0].id, to: editing, type:'Role'}).length;
        $('.relationship-button').html(roleCount+' roles selected.');

        // Populate the form with this nodes data.
        $.each(namegenerator.options.variables, function(index, value) {
            if(value.private === false) {
                if (value.type === 'relationship') {
                    $('select[name="'+value.variable+'"]').val(edge[value.variable]);
                }else {
                    $('#'+value.variable).val(edge[value.variable]);
                }
                $('.delete-button').show();
                namegenerator.openNodeBox();
            }

        });

    };

    var cancelBtnHandler = function() {
        $('.delete-button').hide();
        namegenerator.closeNodeBox();
    };

    var selectChangeHandler = function() {
        if ($('select[name="reltype_main_t0"]').val() === '') {
            $('select[name="reltype_sub_t0"]').prop( 'disabled', true);
            return false;
        }
        $('select[name="reltype_sub_t0"]').prop( 'disabled', false );
        $('select[name="reltype_sub_t0"]').children().remove();
        $('select[name="reltype_sub_t0"]').append('<option value="">Choose a specific relationship</option>');
        $.each(roles[$('select[name="reltype_main_t0"]').val()], function(index,value) {
            $('select[name="reltype_sub_t0"]').append('<option value="'+value+'">'+value+'</option>');
        });

    };

    var selectSubChangeHandler = function() {
        if ($('select[name="reltype_sub_t0"]').val() === 'Other') {
            $('.reltype_oth_t0').show();
        } else {
            $('.reltype_oth_t0').val('');
            $('.reltype_oth_t0').hide();
        }
    };

    var submitFormHandler = function(e) {
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
            // We are submitting a new node
            global.tools.extend(nodeProperties, newNodeProperties);
            var newNode = global.network.addNode(nodeProperties);
            var id;

            $.each(namegenerator.options.edgeTypes, function(index,value) {
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
                    from: global.network.getNodes({type_t0:'Ego'})[0].id,
                    to: newNode,
                    type:currentEdge
                };

                global.tools.extend(edgeProperties,currentEdgeProperties);
                id = global.network.addEdge(edgeProperties);
            });

            // Add role edges

            // Iterate through selected items and create a new role edge for each.
            $.each($('.relationship.selected'), function() {
                edgeProperties = {
                    type: 'Role',
                    from:global.network.getNodes({type_t0:'Ego'})[0].id,
                    to: newNode,
                    reltype_main_t0: $(this).parent('.relationship-type').data('main-relationship'),
                    reltype_sub_t0: $(this).data('sub-relationship')
                };
                global.network.addEdge(edgeProperties);
            });

            // Main edge
            var edge = global.network.getEdges({to:newNode, type:'Dyad'})[0];
            namegenerator.addToList(edge);
            alterCount++;
            $('.alter-count-box').html(alterCount);

        } else {
            // We are updating a node

            var color = function() {
                var el = $('div[data-index='+editing+']');
                var current = el.css("background-color");
                el.stop().transition({background:'#1ECD97'}, 400, 'ease');
                setTimeout(function(){
                    el.stop().transition({ background: current}, 800, 'ease');
                }, 700);
            };

            var nodeID = editing;
            // var nodeID = global.network.getEdge(editing).to;
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

                var edges = global.network.getEdges({from:global.network.getNodes({type_t0:'Ego'})[0].id,to:editing,type:value});
                $.each(edges, function(index,value) {
                    global.network.updateEdge(value.id,currentEdgeProperties, color);
                });
            });

            global.network.updateNode(nodeID, newNodeProperties);
            var properties = global.tools.extend(newEdgeProperties,newNodeProperties);

            // update relationship roles

            // Remove existing edges
            global.network.removeEdges(global.network.getEdges({type:'Role', from: global.network.getNodes({type_t0:'Ego'})[0].id, to: editing}));

            $.each($('.relationship.selected'), function() {
                edgeProperties = {
                    type: 'Role',
                    from:global.network.getNodes({type_t0:'Ego'})[0].id,
                    to: editing,
                    reltype_main_t0: $(this).parent('.relationship-type').data('main-relationship'),
                    reltype_sub_t0: $(this).data('sub-relationship')
                };
                global.network.addEdge(edgeProperties);
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

            editing = false;

        } // end if editing


        namegenerator.closeNodeBox();


    };

    namegenerator.generateTestAlters = function(number) {

        if (!number) {
            global.tools.notify('You must specify the number of test alters you want to create. Cancelling!', 2);
            return false;
        }

        var eachTime = 4000;

        for (var i = 0; i < number; i++) {
            setTimeout(function() {
                // We must simulate every interaction to ensure that any errors are caught.
                $('.add-button').click();
                setTimeout(function() {
                    $('#ngForm').submit();
                }, 3000);

                $('#fname_t0').val(namesList[Math.floor(global.tools.randomBetween(0,namesList.length))]);
                $('#lname_t0').val(namesList[Math.floor(global.tools.randomBetween(0,namesList.length))]);
                var lname = $('#fname_t0').val()+' '+$('#lname_t0').val().charAt(0);
                if ($('#lname_t0').val().length > 0 ) {
                    lname +='.';
                }
                $('#nname_t0').val(lname);
                $('#age_p_t0').val(Math.floor(global.tools.randomBetween(18,90)));

                setTimeout(function() {
                    $('.relationship-button').click();
                }, 500);
                setTimeout(function() {

                    var roleNumber = Math.floor(global.tools.randomBetween(1,3));

                    for (var j = 0; j < roleNumber; j++) {
                        $($('.relationship')[Math.floor(global.tools.randomBetween(0,$('.relationship').length))]).addClass('selected');

                    }

                    $('.relationship-close-button').click();
                }, 2000);
            }, eachTime*i);
        }

    };

    namegenerator.openNodeBox = function() {
        // $('.newNodeBox').show();
        $('.content').addClass('blurry');
        // $('.newNodeBox').transition({scale:1,opacity:1},300);
        $('.newNodeBox').addClass('open');
        $('#ngForm input:text').first().focus();
        nodeBoxOpen = true;
    };

    namegenerator.closeNodeBox = function() {
        $('.content').removeClass('blurry');
        // $('.newNodeBox').transition({scale:0.1,opacity:0},500);
        $('.newNodeBox').removeClass('open');
        setTimeout(function() {

        });
        nodeBoxOpen = false;
        $('#ngForm').trigger('reset');
        $('.reltype_oth_t0').hide();
        editing = false;
        $('.relationship-button').html('Set Relationship Roles');
        $('.relationship').removeClass('selected');
    };

    namegenerator.destroy = function() {
        global.tools.notify('Destroying namegenerator.',0);
        // Event listeners
        $(window.document).off('keydown', keyPressHandler);
        $('.cancel').off('click', cancelBtnHandler);
        $('#fname_t0, #lname_t0').off('keyup', inputKeypressHandler);
        $(window.document).off('click', '.inner-card', cardClickHandler);
        $('.add-button').off('click', namegenerator.openNodeBox);
        $('.delete-button').off('click', namegenerator.removeFromList);
        $('select[name="reltype_main_t0"]').off('change', selectChangeHandler);
        $('select[name="reltype_sub_t0"]').off('change', selectSubChangeHandler);
        $('#ngForm').off('submit', submitFormHandler);
        window.removeEventListener('changeStageStart', stageChangeHandler, false);
        $('.newNodeBox').remove();
        $('.relationship-types-container').remove();
        $(window.document).off('click', '.relationship', roleClickHandler);
        $(window.document).off('click', '.relationship-button', namegenerator.toggleRelationshipBox);
        $(window.document).off('click', '.relationship-close-button', namegenerator.toggleRelationshipBox);
    };

    namegenerator.init = function(options) {
        global.tools.extend(namegenerator.options, options);
        // create elements
        var button = $('<span class="hi-icon hi-icon-user add-button">Add</span>');
        namegenerator.options.targetEl.append(button);
        var alterCountBox = $('<div class="alter-count-box"></div>');
        namegenerator.options.targetEl.append(alterCountBox);

        // create node box
        var newNodeBox = $('<div class="newNodeBox overlay"><form role="form" id="ngForm" class="form"><div class="col-sm-6 left"><h2 style="margin-top:0">Adding a Person</h2><ul><li>Try to be as accurate as you can, but don\'t worry if you aren\'t sure.</li><li>We are interested in your perceptions, so there are no right or wrong answers!</li><li>You can use the tab key to quickly move between the fields.</li><li>You can use the enter key to submit the form.</li></ul></div><div class="col-sm-6 right"></div></form></div>');
        // namegenerator.options.targetEl.append(newNodeBox);
        $('body').append(newNodeBox);
        $.each(namegenerator.options.variables, function(index, value) {
            if(value.private !== true) {

                var formItem;

                switch(value.type) {
                    case 'text':
                    formItem = $('<div class="form-group '+value.variable+'"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" placeholder="'+value.label+'"></div></div>');
                    break;

                    case 'number':
                    formItem = $('<div class="form-group '+value.variable+'"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="number" class="form-control '+value.variable+'" id="'+value.variable+'" placeholder="'+value.label+'"></div></div>');
                    break;

                    case 'relationship':
                    formItem = $('<input type="hidden" class="form-control '+value.variable+'" id="'+value.variable+'" placeholder="'+value.label+'">');

                    break;

                    case 'subrelationship':
                    formItem = $('<input type="hidden" class="form-control '+value.variable+'" id="'+value.variable+'" placeholder="'+value.label+'">');
                    break;

                }
                $('.newNodeBox .form .right').append(formItem);
                if (value.required === true) {
                    if (value.type === 'relationship') {
                        $('select[name="'+value.variable+'"]').prop('required', true);
                    } else {
                        $('#'+value.variable).prop('required', true);
                    }

                }

            }

        });

        $('.newNodeBox .form .right').append('<div class="form-group"><button type="button" class="btn btn-primary btn-block relationship-button">Set Relationship Roles</div></div>');
        $('select[name="reltype_sub_t0"]').prop( 'disabled', true );
        var buttons = $('<div class="row form-group"><br/></div><div class="row form-group"><div class="col-sm-4"><button type="submit" class="btn btn-success btn-block submit-1"><span class="glyphicon glyphicon-plus-sign"></span> Add</button></div><div class="col-sm-4"><button type="button" class="btn btn-danger btn-block delete-button"><span class="glyphicon glyphicon-trash"></span> Delete</button></div><div class="col-sm-4"><span class="btn btn-warning btn-block cancel">Cancel</span></div></div>');
        $('.newNodeBox .form .right').append(buttons);
        $('.reltype_oth_t0').hide();

        // relationship types
        alterCountBox = $('<div class="relationship-types-container"><span class="relationship-close-button">X</span>');
        $('.newNodeBox').after(alterCountBox);
        var counter = 0;
        $.each(roles, function(index) {
            $('.relationship-types-container').append('<div class="relationship-type rel-'+counter+' c'+counter+'" data-main-relationship="'+counter+'"><h1>'+index+'</h1></div>');
            $.each(roles[index], function(relIndex, relValue) {
                $('.rel-'+counter).append('<div class="relationship" data-sub-relationship="'+relValue+'">'+relValue+'</div>');
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
        $('.cancel').on('click', cancelBtnHandler);
        $('.add-button').on('click', namegenerator.openNodeBox);
        $('.delete-button').on('click', namegenerator.removeFromList);
        $('#fname_t0, #lname_t0').on('keyup', inputKeypressHandler);
        $(window.document).on('click', '.inner-card', cardClickHandler);
        $('select[name="reltype_main_t0"]').on('change', selectChangeHandler);
        $('select[name="reltype_sub_t0"]').on('change', selectSubChangeHandler);
        $('#ngForm').on('submit', submitFormHandler);
        $(window.document).on('click', '.relationship', roleClickHandler);
        $(window.document).on('click', '.relationship-button', namegenerator.toggleRelationshipBox);
        $(window.document).on('click', '.relationship-close-button', namegenerator.toggleRelationshipBox);

        // Set node count box
        $('.alter-count-box').html(alterCount);

        // add existing nodes
        $.each(global.network.getEdges({type: 'Dyad', from: global.network.getNodes({type_t0:'Ego'})[0].id, ng_t0:namegenerator.options.variables[5].value}), function(index,value) {
            namegenerator.addToList(value);
        });

        // Handle side panels
        if (namegenerator.options.panels.length > 0) {

            // Side container
            $('<div class="side-container"></div>').insertBefore('.nameList');

            // Current side panel shows alters already elicited
            if (namegenerator.options.panels.indexOf('current') !== -1) {

                // add custom node list
                $('.side-container').append($('<div class="current-node-list node-lists"><h4>People you already listed:</h4></div>'));
                $.each(global.network.getEdges({type: 'Dyad', from: global.network.getNodes({type_t0:'Ego'})[0].id}), function(index,value) {

                    var el = $('<div class="node-list-item">'+value.nname_t0+'</div>');
                    $('.current-node-list').append(el);
                });
            }

            // Previous side panel shows previous network alters
            if (namegenerator.options.panels.indexOf('previous') !== -1) {
                // add custom node list for previous network

                //first chck if there is a previous network
                if (typeof global.session.sessionData.previousNetwork !== 'undefined') {
                    if (typeof global.previousNetwork === 'undefined') {
                        var Network = require('./network');
                        global.previousNetwork = new Network();
                        global.previousNetwork.loadNetwork(global.session.sessionData.previousNetwork);

                        // Check there is more than one node
                        if (global.previousNetwork.getNodes().length > 1) {
                            // Add the previous node list
                            $('.side-container').append($('<div class="previous-node-list node-lists"><h4>People you listed in other visits:</h4></div>'));
                            $.each(global.previousNetwork.getEdges({type: 'Dyad', from: global.previousNetwork.getEgo().id}), function(index,value) {

                                var el = $('<div class="node-bucket-item draggable" data-id="'+value.to+'">'+value.nname_t0+'</div>');
                                $('.previous-node-list').append(el);
                            });

                            // Make nodes draggable
                            $('.draggable').draggable({ cursor: 'pointer', revert: 'invalid', disabled: false ,
                                start: function(){
                                    console.log($(this).parent().css("overflow"));
                                    $(this).parent().css("overflow","visible");
                                    console.log($(this).parent().css("overflow"));
                                },
                                stop: function() {
                                    $('previous-node-list').css("overflow","scroll");
                                    $('current-node-list').css("overflow","scroll");
                                }
                            });

                            $('.node-container').droppable({ accept: '.draggable',
                                drop: function(event, ui) {
                                    // remove the ghost card
                                    $('previous-node-list').css("overflow","scroll");
                                    $('current-node-list').css("overflow","scroll");
                                    $('.card.ghost').remove();

                                    // get the data we need
                                    var dropped = ui.draggable;
                                    var droppedNode = dropped.data("id");
                                    var droppedNodeEdge = global.previousNetwork.getEdges({type: 'Dyad', from: global.previousNetwork.getEgo().id, to: droppedNode})[0];

                                    // update name generator property of dyad edge

                                    // get the current name generator's label
                                    var ngStep;
                                    $.each(namegenerator.options.variables, function(index, value) {
                                        if (value.label === 'ng_t0') { ngStep = value.value; }
                                    });

                                    droppedNodeEdge.ng_t0 = ngStep;

                                    // Add the dropped node to the list, creating a card for it
                                    namegenerator.addToList(droppedNodeEdge);

                                    // create a node and edge in the current network
                                    var oldNode = global.previousNetwork.getNode(droppedNode);
                                    global.network.addNode(oldNode, false, true);  // (properties, ego, force);
                                    global.network.addEdge(droppedNodeEdge);

                                    // Remove from previous network
                                    global.previousNetwork.removeNode(oldNode.id);

                                    global.session.addData('previousNetwork', {nodes: global.previousNetwork.getNodes(), edges: global.previousNetwork.getEdges()});
                                    $(dropped).remove();
                                    //hide the ghost card
                                    $('.card.ghost').removeClass('show');
                                },
                                over: function() {
                                    $(".node-container").scrollTop($(".node-container")[0].scrollHeight);
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
                    }
                } // end if previous network is undefined
            } // end previous panel


            if ($('.side-container').children().length > 0) {
                // move node list to one side
                $('.nameList').addClass('alt');
            }

            // halve the panel height if we have two
            if ($('.side-container').children().length > 1) {
                $('.node-lists').addClass('double');
            }

        } // end if panels
    };

    namegenerator.toggleRelationshipBox = function() {
        if ($('.relationship-types-container').hasClass('open')) {
            //closing
            var roleCount = $('.relationship.selected').length;
            var plural = 'roles';

            if (roleCount === 1) {
                plural = 'role';
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

            $.each($('.relationship-type'), function(index, value) {
                setTimeout(function() {
                    $(value).transition({opacity:0,top:'-100px'},150);
                    $.each($(value).children('.relationship'), function(index, childvalue) {
                        setTimeout(function() {
                            $(childvalue).transition({opacity:0,top:'-200px'}, 150);
                        }, 50+(index*20));
                    });
                }, index*50);

            });

            setTimeout(function() {
                // $('.newNodeBox').show();

                $('.relationship-types-container').removeClass('open');
                $('.relationship-types-container').removeClass('front');
                $('.newNodeBox').removeClass('back');
                setTimeout(function() {


                },1000);
            }, 400);

        } else {
            // opening
            if(editing) {
                var roleEdges = global.network.getEdges({from:global.network.getNodes({type_t0:'Ego'})[0].id, to: editing, type:'Role'});
                $.each(roleEdges, function(index, value) {
                    $('.rel-'+value.reltype_main_t0).find('div[data-sub-relationship="'+value.reltype_sub_t0+'"]').addClass('selected').data('selected', true);
                });
            }

            $('.newNodeBox').addClass('back');
            $('.relationship-types-container').addClass('open front');
            $('.relationship').css({position:'relative', opacity:0,top:'-200px'});
            $('.relationship-type').css({position:'relative', opacity:0,top:'-100px'});
            $.each($('.relationship-type'), function(index, value) {
                setTimeout(function() {
                    $(value).transition({opacity:1,top:'0px'},200);
                    $.each($(value).children('.relationship'), function(index, childvalue) {
                        setTimeout(function() {
                            $(childvalue).transition({opacity:1,top:0}, 100);
                        }, 100+(index*50));
                    });
                }, index*80);

            });
            // $('.content').removeClass('blurry');
            // $('.newNodeBox').hide();
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
        // var nodeID = global.network.getEdge(editing).to;

        // global.network.updateNode(nodeID, newNodeProperties);
        global.network.removeNode(nodeID);

        $('div[data-index='+editing+']').addClass('delete');
        var tempEditing = editing;
        setTimeout(function() {
            console.log('removing');
            console.log($('div[data-index='+editing+']').parent());
            $('div[data-index='+tempEditing+']').parent().remove();
        }, 700);

        editing = false;
        namegenerator.closeNodeBox();
    };

    return namegenerator;
};

module.exports = new Namegenerator();
