/* global $, window, Odometer, document, note, Swiper  */
/* exported Namegenerator */
module.exports = function NameGeneratorMulti() {
    'use strict';
    //global vars
    var nameGeneratorMulti = {};
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

    var promptSwiper;
    var currentPrompt = 0;
    var alterCounter;
    var moduleEvents = [];

    var namesList = ['Joshua', 'Bernie', 'Michelle', 'Gregory', 'Patrick', 'Barney', 'Jonathon','Myles','Alethia','Tammera','Veola','Meredith','Renee','Grisel','Celestina','Fausto','Eliana','Raymundo','Lyle','Carry','Kittie','Melonie','Elke','Mattie','Kieth','Lourie','Marcie','Trinity','Librada','Lloyd','Pearlie','Velvet','Stephan','Hildegard','Winfred','Tempie','Maybelle','Melynda','Tiera','Lisbeth','Kiera','Gaye','Edra','Karissa','Manda','Ethelene','Michelle','Pamella','Jospeh','Tonette','Maren','Aundrea','Madelene','Epifania','Olive'];

    var alterCount = 0;

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

    nameGeneratorMulti.generateTestAlters = function(number) {

        if (!number) {
            note.error('You must specify the number of test alters you want to create. Cancelling!');
            return false;
        }

        var eachTime = 1000;

        for (var i = 0; i < number; i++) {
            var timer = eachTime*i;
            setTimeout(nameGeneratorMulti.generateAlter, timer);
        }

    };

    nameGeneratorMulti.generateAlter = function() {
        // We must simulate every interaction to ensure that any errors are caught.
        $('.new-node-button').click();
        setTimeout(function() {
            $('#new-node-submit-btn').click();
        }, 500);

        $('#first_name').val(namesList[Math.floor(window.tools.randomBetween(0,namesList.length))]);
        $('#last_name').val(namesList[Math.floor(window.tools.randomBetween(0,namesList.length))]);

        $('#label').val($('#first_name').val());
    };

    nameGeneratorMulti.destroy = function() {
        note.debug('Destroying nameGeneratorMulti.');

        // Event listeners
        promptSwiper.destroy();
        window.tools.Events.unbind(moduleEvents);

    };

    nameGeneratorMulti.bindEvents = function() {
        // Event listeners
        // Events
		var event = [{
			event: 'changeStageStart',
			handler: nameGeneratorMulti.destroy,
			targetEl:  window
		},
		{
			event: 'nodeAdded',
			handler: nameGeneratorMulti.nodeAdded,
			targetEl:  window
		},
        {
            event: 'nodeUpdate',
            handler: nameGeneratorMulti.nodeEdited,
            targetEl:  window
        },
        {
            event: 'click',
            handler: nameGeneratorMulti.showNewNodeForm,
            targetEl:  '.new-node-button'
        }];
		window.tools.Events.register(moduleEvents, event);


    };

    nameGeneratorMulti.nodeAdded = function(e) {
        nameGeneratorMulti.addCard(e.originalEvent.detail, function() {
            nameGeneratorMulti.updateCounter();
            nameGeneratorMulti.makeDraggable();
        });
    };

    nameGeneratorMulti.nodeEdited = function(e) {
        nameGeneratorMulti.editCard(e.originalEvent.detail, function() {
            nameGeneratorMulti.makeDraggable();
        });
    };

    nameGeneratorMulti.init = function(userOptions) {
        note.info('nameGeneratorMulti initialising.');
        window.tools.extend(options, userOptions);

        alterCount = options.network.getNodes({type_t0: 'Alter'}).length;

        // create elements
        $(options.targetEl).append('<div class="new-node-button text-center"><span class="fa fa-2x fa-plus"></span></div>');
        var alterCountBox = $('<div class="alter-count-box"></div>');
        options.targetEl.append(alterCountBox);

        var nodeContainer = $('<div class="question-container"></div><div class="node-container-bottom-bg"></div>');
        options.targetEl.append(nodeContainer);


        // Prompts
        $('.question-container').append('<div class="swiper-container"><div class="swiper-wrapper"></div><div class="swiper-pagination"></div></div>');
        for (var i = 0; i < options.dataOrigin.variables.length; i++) {
            $('.swiper-wrapper').append('<div class="swiper-slide"><h2>'+options.dataOrigin.variables[i].prompt+'</h2></div>');
        }
        promptSwiper = new Swiper ('.swiper-container', {
            pagination: '.swiper-pagination',
            speed: 1000
        });

        // Update current prompt counter
        promptSwiper.on('slideChangeStart', function () {
            currentPrompt = promptSwiper.activeIndex;
            nameGeneratorMulti.changeData();
        });

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
				nameGeneratorMulti.removeNode($(ui.draggable).data('index'));
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

        nameGeneratorMulti.addExistingData();
        nameGeneratorMulti.handlePanels();
        nameGeneratorMulti.bindEvents();
    };

    nameGeneratorMulti.changeData = function() {
        if ($('.card').length > 0) {
            $('.inner-card').removeClass('shown');
            setTimeout(function() {
                $('.card').remove();
                nameGeneratorMulti.addExistingData();
            }, 1000);
        } else {
            nameGeneratorMulti.addExistingData();
        }

    };

    nameGeneratorMulti.updateSidePanel = function() {
        // Empty it
        $('.current-node-list').children().remove();

        // ignore ego and any nodes that are visible in the main node list
        var nodes = options.network.getNodes({}, function (results) {
            var filteredResults = [];
            $.each(results, function(index,value) {
                if (value.type !== 'Ego' && $('[data-index='+value.id+']').length === 0) {
                    filteredResults.push(value);
                }
            });

            return filteredResults;
        });

        $.each(nodes, function(index,value) {
            var el = $('<div class="node-list-item">'+value.label+'</div>');
            $('.current-node-list').append(el);
        });

    };

    nameGeneratorMulti.addExistingData = function () {
        var properties = {};
        console.log(options);
        console.log(currentPrompt);
        // build properties array from dataOrigin
        console.log(options.dataOrigin.variables[currentPrompt]);
        properties[options.dataOrigin.variables[currentPrompt].label] = options.dataOrigin.variables[currentPrompt].value;

        var nodes = options.network.getNodes(properties, function (results) {
            var filteredResults = [];
            $.each(results, function(index,value) {
                if (value.type !== 'Ego') {
                    filteredResults.push(value);
                }
            });

            return filteredResults;
        });

        $.each(nodes, function(index,value) {
            setTimeout(function() {
                nameGeneratorMulti.addCard(value);
            }, index * 100);
        });

    };

    nameGeneratorMulti.updateCounter = function(number) {
        if (!number) {
            alterCounter.update(options.network.getNodes().length);
        } else {
            alterCounter.update(number);
        }
    };

    nameGeneratorMulti.makeDraggable = function() {
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
                nameGeneratorMulti.showBin();
            },
            stop: function(event, ui) {
                $(this).removeClass('invisible');
                $(ui.helper).removeClass('dragging');
                nameGeneratorMulti.hideBin();
            }
        });

    };

    nameGeneratorMulti.showNewNodeForm = function() {

        // add fields from dataTarget
        var properties = {};
            properties[options.dataOrigin.variables[currentPrompt].label] = {
                type:'hidden',
                title: options.dataOrigin.variables[currentPrompt].label
            };
        window.forms.nameGenForm.addTemporaryFields(properties);

        // Add data from fields
        properties = {};
        properties[options.dataOrigin.variables[currentPrompt].label] = options.dataOrigin.variables[currentPrompt].value;
        window.forms.nameGenForm.addData(properties);

        window.forms.nameGenForm.show();
    };

    nameGeneratorMulti.handlePanels = function() {
        note.debug('nameGeneratorMulti.handlePanels()');

            // Side container
            var sideContainer = $('<div class="side-container"></div>');

            // Current side panel shows alters already elicited
            sideContainer.append($('<div class="current-panel"><h4>People you already named:</h4><div class="current-node-list node-lists"></div></div>'));

            if (sideContainer.children().length > 0) {
                // move node list to one side
                sideContainer.insertBefore('.nameList');
                $('.nameList').addClass('alt');
            }

            nameGeneratorMulti.updateSidePanel();

            // halve the panel height if we have two
            if ($('.side-container').children().length > 1) {
                $('.node-lists').addClass('double');
            }
    };

    nameGeneratorMulti.showBin = function() {
        $('.delete-bin-footer').addClass('show');
    };

    nameGeneratorMulti.hideBin = function() {
        $('.delete-bin-footer').removeClass('show');
    };

    nameGeneratorMulti.addCard = function(properties, callback) {

        var card;

        card = $('<div class="card" data-index="'+properties.id+'"><div class="inner-card"><h4>'+properties.label+'</h4></div></div>');
        var list = $('<ul></ul>');
        list.append('<li>'+properties.first_name+' '+properties.last_name+'</li>');
        card.children('.inner-card').append(list);
        $('.nameList').append(card);

        $(card).on('click', cardClickHandler);

        nameGeneratorMulti.updateCounter();
        nameGeneratorMulti.makeDraggable();
        nameGeneratorMulti.updateSidePanel();

        setTimeout(function() {
            $('[data-index='+properties.id+']').children('.inner-card').addClass('shown');
        },100);


        if (callback) {
            callback();
        }

        return true;
    };

    nameGeneratorMulti.editCard = function(properties, callback) {

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

    nameGeneratorMulti.removeNode = function(id) {
        if (!id) {
            note.error('No id provided to nameGeneratorMulti.deleteNode().');
            return false;
        }

        if (options.network.removeNode(id)) {
            if(nameGeneratorMulti.removeCard(id)) {
                note.info('Deleted node with id '+id);
                return true;
            } else {
                note.error('nameGeneratorMulti.removeNode() tried to remove node with ID '+id+', but failed.');
                return false;
            }

        } else {
            note.warn('nameGeneratorMulti.removeNode() tried to remove node with ID '+id+', but failed.');
            return false;
        }
    };

    nameGeneratorMulti.removeCard = function(id) {

        $('div[data-index='+id+']').remove();
        nameGeneratorMulti.updateCounter();

        return true;
    };

    return nameGeneratorMulti;
};
