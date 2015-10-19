/* global $, window, Odometer, document, note  */
/* exported Namegenerator */
module.exports = function NameGenerator() {
    'use strict';
    //global vars
    var nameGenerator = {};
    var options = {
    	targetEl: $('.container'),
    	network: window.network,
    	form: window.forms.newNodeForm,
    	heading: 'Within the last 6 months or so, who have you felt particularly close to, or discussed important personal matters with?',
    	subheading: '',
    	panels: [],
    	dataOrigin: {
    		type: 'node', // edge or node.
    		variables: []
    	},
    	dataTarget: {
    		type: 'node',
    		variables: [
    			{label: 'ng', value: 'close'},
    			{label: 'contexts', value: []}
    		]
    	}
    };

    var nodeBoxOpen = false;
    var editing = false;
    var relationshipPanel;
    var newNodePanel;
    var newNodePanelContent;
    var alterCounter;
    var moduleEvents = [];

    var alterCount = window.network.getNodes({type_t0: 'Alter'}).length;

    var roles = {
        'Friend': ['Best Friend','Friend','Ex-friend','Other type'],
        'Family / Relative': ['Parent / Guardian','Brother / Sister','Grandparent','Other Family','Chosen Family'],
        'Romantic / Sexual Partner': ['Boyfriend / Girlfriend','Ex-Boyfriend / Ex-Girlfriend','Booty Call / Fuck Buddy / Hook Up','One Night Stand','Other type of Partner'],
        'Acquaintance / Associate': ['Coworker / Colleague','Classmate','Roommate','Friend of a Friend','Neighbor','Other'],
        'Other Support / Source of Advice': ['Teacher / Professor','Counselor / Therapist','Community Agency Staff','Religious Leader','Mentor','Coach','Other'],
        'Drug Use': ['Someone you use drugs with','Someone you buy drugs from'],
        'Other': ['Other relationship']
    };

    var namesList = ['Joshua', 'Bernie', 'Michelle', 'Gregory', 'Patrick', 'Barney', 'Jonathon','Myles','Alethia','Tammera','Veola','Meredith','Renee','Grisel','Celestina','Fausto','Eliana','Raymundo','Lyle','Carry','Kittie','Melonie','Elke','Mattie','Kieth','Lourie','Marcie','Trinity','Librada','Lloyd','Pearlie','Velvet','Stephan','Hildegard','Winfred','Tempie','Maybelle','Melynda','Tiera','Lisbeth','Kiera','Gaye','Edra','Karissa','Manda','Ethelene','Michelle','Pamella','Jospeh','Tonette','Maren','Aundrea','Madelene','Epifania','Olive'];

    var cardClickHandler = function() {
        // Handles what happens when a card is clicked

        // Get the ID of the node corresponding to this card, stored in the data-index property.
        var index = $(this).data('index');

        var node = options.network.getNode(index);

        // add fields from dataTarget
        var properties = {};
        properties.id = {
            type:'hidden',
            title: 'id'
        };
        $.each(options.dataTarget.variables, function(targetIndex, targetValue) {
            properties[targetValue.label] = {
                type:'hidden',
                title: targetValue.label
            };
        });
        window.forms.nameGenForm.addTemporaryFields(properties);

        window.forms.nameGenForm.addData(node);
        window.forms.nameGenForm.show();


    };

    nameGenerator.generateTestAlters = function(number) {

        if (!number) {
            note.error('You must specify the number of test alters you want to create. Cancelling!');
            return false;
        }

        var eachTime = 4000;

        for (var i = 0; i < number; i++) {
            var timer = eachTime*i;
            setTimeout(nameGenerator.generateAlter, timer);
        }

    };

    nameGenerator.generateAlter = function() {
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

    nameGenerator.openNodeBox = function() {
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

    nameGenerator.closeNodeBox = function() {
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

    nameGenerator.destroy = function() {
        note.debug('Destroying nameGenerator.');

        // Event listeners
        window.tools.Events.unbind(moduleEvents);

    };

    nameGenerator.bindEvents = function() {
        // Event listeners
        // Events
		var event = [{
			event: 'changeStageStart',
			handler: nameGenerator.destroy,
			targetEl:  window
		},
		{
			event: 'nodeAdded',
			handler: nameGenerator.nodeAdded,
			targetEl:  window
		},
        {
            event: 'nodeUpdate',
            handler: nameGenerator.nodeEdited,
            targetEl:  window
        },
        {
            event: 'click',
            handler: cardClickHandler,
            targetEl:  '.card'
        },
        {
            event: 'click',
            handler: nameGenerator.showNewNodeForm,
            targetEl:  '.new-node-button'
        }];
		window.tools.Events.register(moduleEvents, event);


    };

    nameGenerator.nodeAdded = function(e) {
        nameGenerator.addCard(e.originalEvent.detail, function() {
            nameGenerator.updateCounter();
            nameGenerator.makeDraggable();
        });
    };

    nameGenerator.nodeEdited = function(e) {
        nameGenerator.editCard(e.originalEvent.detail, function() {
            nameGenerator.makeDraggable();
        });
    };

    nameGenerator.init = function(userOptions) {

        window.tools.extend(options, userOptions);
        // create elements
        $(options.targetEl).append('<div class="new-node-button text-center"><span class="fa fa-2x fa-plus"></span></div>');
        var alterCountBox = $('<div class="alter-count-box"></div>');
        options.targetEl.append(alterCountBox);

        var nodeContainer = $('<div class="question-container"></div><div class="node-container-bottom-bg"></div>');
        options.targetEl.append(nodeContainer);

        var title = $('<h1 class="text-center"></h1>').html(options.heading);
        $('.question-container').append(title);
        var subtitle = $('<p class="lead text-center"></p>').html(options.subheading);
        $('.question-container').append(subtitle);

        // create namelist container
        var nameList = $('<div class="node-container nameList"></div>');
        options.targetEl.append(nameList);

		// bin
		options.targetEl.append('<div class="delete-bin-footer"><span class="delete-bin fa fa-4x fa-trash-o"></span></div>');
		$('.delete-bin').droppable({
			accept: '.card',
			tolerance: 'touch',
			hoverClass: 'delete',
			over: function( event, ui ) {
                console.log('over');
				$(this).addClass('delete');
				$(ui.draggable).addClass('delete');
			},
			out: function( event, ui ) {
				$(this).removeClass('delete');
				$(ui.draggable).removeClass('delete');
			},
			drop: function( event, ui ) {
                console.log(ui.draggable);
				nameGenerator.removeNode($(ui.draggable).data('index'));
			}
		});


        // Set node count box
        var el = document.querySelector('.alter-count-box');

        alterCounter = new Odometer({
          el: el,
          value: alterCount,
          format: 'dd',
          theme: 'default'
        });

        nameGenerator.addExistingData();
        nameGenerator.handlePanels();
        nameGenerator.bindEvents();
    };

    nameGenerator.addExistingData = function () {
        // add existing nodes

        var properties = {};
        // build properties array from dataOrigin
        $.each(options.dataOrigin.variables, function(variableIndex, variableValue){
            properties[variableValue.label] = variableValue.value;
        });

        var nodes = window.network.getNodes(properties, function (results) {
            var filteredResults = [];
            $.each(results, function(index,value) {
                if (value.type !== 'Ego') {
                    filteredResults.push(value);
                }
            });

            return filteredResults;
        });

        $.each(nodes, function(index,value) {
            nameGenerator.addCard(value);
        });

        nameGenerator.updateCounter();
        nameGenerator.makeDraggable();

    };

    nameGenerator.updateCounter = function(number) {
        if (!number) {
            alterCounter.update(options.network.getNodes().length);
        } else {
            alterCounter.update(number);
        }
    };

    nameGenerator.makeDraggable = function() {
        $('.card').draggable({
            appendTo: 'body',
            helper: 'clone',
            revert: true,
            revertDuration: 200,
            refreshPositions: true,
            scroll: false,
            start: function(event, ui) {
                console.log(ui);
                $(this).addClass('invisible');
                $(ui.helper).addClass('dragging');
                nameGenerator.showBin();
            },
            stop: function(event, ui) {
                $(this).removeClass('invisible');
                $(ui.helper).removeClass('dragging');
                nameGenerator.hideBin();
            }
        });

    };

    nameGenerator.showNewNodeForm = function() {

        // add fields from dataTarget
        var properties = {};
        $.each(options.dataTarget.variables, function(targetIndex, targetValue) {
            properties[targetValue.label] = {
                type:'hidden',
                title: targetValue.label
            };
        });
        window.forms.nameGenForm.addTemporaryFields(properties);

        // Add data from fields
        properties = {};
        $.each(options.dataTarget.variables, function(targetIndex, targetValue) {
            properties[targetValue.label] = targetValue.value;
        });
        window.forms.nameGenForm.addData(properties);


        window.forms.nameGenForm.show();
    };

    nameGenerator.handlePanels = function() {
        note.debug('nameGenerator.handlePanels()');
        if (options.panels && typeof options.panels === 'object' && options.panels.length > 0) {

            // Side container
            var sideContainer = $('<div class="side-container"></div>');

            // Current side panel shows alters already elicited
            if (options.panels.indexOf('current') !== -1) {

                // add custom node list
                sideContainer.append($('<div class="current-node-list node-lists"><h4>People you already named:</h4></div>'));


                var nodes = window.network.getNodes({}, function (results) {
                    var filteredResults = [];
                    $.each(results, function(index,value) {
                        if (value.type !== 'Ego') {
                            filteredResults.push(value);
                        }
                    });

                    return filteredResults;
                });

                $.each(nodes, function(index,value) {
                    var el = $('<div class="node-list-item">'+value.label+'</div>');
                    sideContainer.children('.current-node-list').append(el);
                });
            }

            if (sideContainer.children().length > 0) {
                // move node list to one side
                sideContainer.insertBefore('.nameList');
                $('.nameList').addClass('alt');
            }

            // halve the panel height if we have two
            if ($('.side-container').children().length > 1) {
                $('.node-lists').addClass('double');
            }

        } // end if panels
    };

    nameGenerator.showBin = function() {
        $('.delete-bin-footer').addClass('show');
    };

    nameGenerator.hideBin = function() {
        $('.delete-bin-footer').removeClass('show');
    };

    nameGenerator.addCard = function(properties, callback) {

        var card;

        card = $('<div class="card" data-index="'+properties.id+'"><div class="inner-card"><h4>'+properties.label+'</h4></div></div>');
        var list = $('<ul></ul>');
        list.append('<li>'+properties.first_name+' '+properties.last_name+'</li>');
        card.children('.inner-card').append(list);
        $('.nameList').append(card);

        if (callback) {
            callback();
        }

        return true;
    };

    nameGenerator.editCard = function(properties, callback) {

        var card;
        $('.card[data-index='+properties.id+']').children('inner-card').find('h4').html(properties.label);

        var list = $('<ul></ul>');
        list.append('<li>'+properties.first_name+' '+properties.last_name+'</li>');
        card.children('.inner-card').append(list);
        $('.nameList').append(card);

        if (callback) {
            callback();
        }

        return true;
    };

    nameGenerator.removeNode = function(id) {
        if (!id) {
            note.error('No id provided to nameGenerator.deleteNode().');
            return false;
        }

        if (window.network.removeNode(id)) {
            if(nameGenerator.removeCard(id)) {
                note.info('Deleted node with id '+id);
                return true;
            } else {
                note.error('nameGenerator.removeNode() tried to remove node with ID '+id+', but failed.');
                return false;
            }

        } else {
            note.warn('nameGenerator.removeNode() tried to remove node with ID '+id+', but failed.');
            return false;
        }
    };

    nameGenerator.removeCard = function(id) {

        $('div[data-index='+id+']').remove();
        nameGenerator.updateCounter();

        return true;
    };

    return nameGenerator;
};
