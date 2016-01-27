/* global $, window, Odometer, document, note, Swiper  */
/* exported Namegenerator */
module.exports = function NameGenerator() {
    'use strict';
    //global vars
    var nameGenerator = {};
    var options = {
        targetEl: $('.container'),
    	panels: ['current'],
    	network: window.network,
    	form: window.forms.newNodeForm,
    	data: {
    		origin: 'node', // edge or node.
    		namegenerators: [
    			{
    				prompt: 'Name generator prompt',
    				label: 'name generator label',
    				variables: [
    					{label: 'extra-variable', value: 'true', type: 'select'}
    				]
    			}
    		]
    	}
    };

    var promptSwiper;
    var currentPrompt = 0;
    var alterCounter;
    var moduleEvents = [];

    var namesList = ['Joshua', 'Bernie', 'Michelle', 'Gregory', 'Patrick', 'Barney', 'Jonathon','Myles','Alethia','Tammera','Veola','Meredith','Renee','Grisel','Celestina','Fausto','Eliana','Raymundo','Lyle','Carry','Kittie','Melonie','Elke','Mattie','Kieth','Lourie','Marcie','Trinity','Librada','Lloyd','Pearlie','Velvet','Stephan','Hildegard','Winfred','Tempie','Maybelle','Melynda','Tiera','Lisbeth','Kiera','Gaye','Edra','Karissa','Manda','Ethelene','Michelle','Pamella','Jospeh','Tonette','Maren','Aundrea','Madelene','Epifania','Olive'];

    var cardClickHandler = function() {
        window.forms.nameGenForm.show();
        // Handles what happens when a card is clicked

        // Get the ID of the node corresponding to this card, stored in the data-index property.
        var index = $(this).data('index');

        var node = options.network.getNode(index);

        // add fields from data
        var properties = {};
        properties.id = {
            type:'hidden',
            title: 'id'
        };
        properties.namegenerator = {
            type:'hidden',
            title: 'namegenerator'
        };
        $.each(options.data.namegenerators, function(targetIndex, targetValue) {
            properties[targetValue.label] = {
                type:'hidden',
                title: targetValue.label
            };
        });
        window.forms.nameGenForm.addTemporaryFields(properties);

        window.forms.nameGenForm.addData(node);



    };

    nameGenerator.generateTestAlters = function(number) {

        if (!number) {
            note.error('You must specify the number of test alters you want to create. Cancelling!');
            return false;
        }

        var eachTime = 1500;

        for (var i = 0; i < number; i++) {
            var timer = eachTime*i;
            setTimeout(nameGenerator.generateAlter, timer);
        }

    };

    nameGenerator.generateAlter = function() {
        // We must simulate every interaction to ensure that any errors are caught.
        $('.new-node-button').click();
        setTimeout(function() {
            $('#new-node-submit-btn').click();
        }, 500);

        $('#first_name').val(namesList[Math.floor(window.tools.randomBetween(0,namesList.length))]);
        $('#last_name').val(namesList[Math.floor(window.tools.randomBetween(0,namesList.length))]);

        $('#label').val($('#first_name').val());
    };

    nameGenerator.destroy = function() {
        note.debug('Destroying nameGenerator.');

        // Event listeners
        promptSwiper.destroy();
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
            event: 'nodeUpdatedEvent',
            handler: nameGenerator.nodeEdited,
            targetEl:  window
        },
        {
            event: 'tap',
            handler: nameGenerator.toggleSelectable,
            targetEl: window.document,
            subTarget:  '.node-list-item'
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
        note.info('nameGenerator initialising.');
        window.tools.extend(options, userOptions);

        var alterCount = nameGenerator.getNodes().length;

        // create elements
        $(options.targetEl).append('<div class="new-node-button text-center"><span class="fa fa-2x fa-plus"></span></div>');
        var alterCountBox = $('<div class="alter-count-box"></div>');
        options.targetEl.append(alterCountBox);

        var nodeContainer = $('<div class="question-container"></div><div class="node-container-bottom-bg"></div>');
        options.targetEl.append(nodeContainer);


        // Prompts
        $('.question-container').append('<div class="swiper-container"><div class="swiper-wrapper"></div><div class="swiper-pagination"></div></div>');
        for (var i = 0; i < options.data.namegenerators.length; i++) {
            $('.swiper-wrapper').append('<div class="swiper-slide"><h2>'+options.data.namegenerators[i].prompt+'</h2></div>');
        }
        promptSwiper = new Swiper ('.swiper-container', {
            pagination: '.swiper-pagination',
            speed: 1000
        });

        // Update current prompt counter
        promptSwiper.on('slideChangeStart', function () {
            currentPrompt = promptSwiper.activeIndex;
            nameGenerator.handlePanels();
            nameGenerator.changeData();
        });

        // create namelist container
        var nameList = $('<div class="node-container nameList"></div>');
        options.targetEl.append(nameList);

		// bin
		options.targetEl.append('<div class="delete-bin-footer"><span class="delete-bin fa fa-4x fa-trash-o"></span></div>');
		$('.delete-bin').droppable({
			accept: '.card, .node-list-item',
			tolerance: 'touch',
			hoverClass: 'delete',
			over: function( event, ui ) {
				$(this).addClass('delete');
				$(ui.draggable).addClass('delete');
			},
			out: function( event, ui ) {
				$(this).removeClass('delete');
				$(ui.draggable).removeClass('delete');
			},
			drop: function( event, ui ) {
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

        nameGenerator.handlePanels();
        nameGenerator.addData();
        nameGenerator.bindEvents();
    };

    nameGenerator.changeData = function() {
            $('.inner-card, .node-list-item').removeClass('shown');
            setTimeout(function() {
                $('.card, .node-list-item').remove();
                nameGenerator.addData();
            }, 1000);
    };

    nameGenerator.getNodes = function(criteria) {
        // console.log('getnodes');
        // console.log(criteria);
        var filterCriteria = criteria || {};
        // ignore ego and any nodes that are visible in the main node list
        var nodes = options.network.getNodes(filterCriteria, function (results) {
            var filteredResults = [];
            $.each(results, function(index,value) {
                if (value.type !== 'Ego') {
                    filteredResults.push(value);
                }
            });

            return filteredResults;
        });

        return nodes;
    };

    nameGenerator.toggleSelectable = function() {
        var clicked = this;
        var properties = {};

        // get the togglePabelVariable for the current name generator
        if (options.data.namegenerators[currentPrompt].togglePanelVariable !== 'undefined') {
            $.each(options.data.namegenerators[currentPrompt].variables, function(variableIndex, variableValue) {
                if (variableValue.label === options.data.namegenerators[currentPrompt].togglePanelVariable) {
                    if ($(clicked).hasClass('selected')) {
                        properties[options.data.namegenerators[currentPrompt].togglePanelVariable] = '';
                    } else {
                        properties[options.data.namegenerators[currentPrompt].togglePanelVariable] = variableValue.value;
                    }
                }
            });

            options.network.updateNode($(clicked).data('index'), properties, function() {
                $(clicked).toggleClass('selected');
            });
        }

    };

    nameGenerator.updateSidePanel = function() {
        // console.log('updatesidepanel');

        // Empty it
        $('.current-node-list').children().remove();

        // ignore ego and any nodes that are visible in the main node list
        var nodes = nameGenerator.getNodes();

        var filteredResults = [];
        $.each(nodes, function(index,value) {
            if (value.namegenerator !== options.data.namegenerators[currentPrompt].label) {
                filteredResults.push(value);
            }
        });

        $.each(filteredResults, function(index,value) {
            var selected = '';

            if (value[options.data.namegenerators[currentPrompt].togglePanelVariable] === 'true') {
                selected = 'selected';
            }

            var el = $('<div class="node-list-item '+selected+'" data-index="'+value.id+'">'+value.label+'</div>');
            $('.current-node-list').append(el);

            setTimeout(function() {
                $(el).addClass('shown');
                nameGenerator.makeDraggable();
            },50+(index*50));

        });

    };

    nameGenerator.addData = function () {
        // console.log('add data');
        var properties = {};
        // build properties array from data
        properties.namegenerator = options.data.namegenerators[currentPrompt].label;
        // console.log(properties);
        var nodes = nameGenerator.getNodes(properties);
        // console.log(nodes);
        $.each(nodes, function(index,value) {
            setTimeout(function() {
                nameGenerator.addCard(value);
            }, index * 40);
        });

        nameGenerator.updateSidePanel();
        nameGenerator.updateCounter();

    };

    nameGenerator.updateCounter = function(number) {
        if (!number) {
            alterCounter.update(options.network.getNodes().length-1);
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

        $('.node-list-item').draggable({
            // appendTo: 'body',
            helper: 'clone',
            revert: true,
            revertDuration: 200,
            refreshPositions: true,
        distance: 50,
            scroll: false,
            stack: '.node-list-item',
            start: function(event, ui) {
                console.log('dragstart');
                nameGenerator.showBin();
                $(ui.helper).addClass('dragging');
            },
            stop: function(event, ui) {
                console.log('dragstop');
                $(ui.helper).removeClass('dragging');
                nameGenerator.hideBin();
            }
        });

    };

    nameGenerator.showNewNodeForm = function() {
        console.log('nameGenerator.showNewNodeForm()');
        // add fields from data
        var properties = {};
            properties.namegenerator = {
                type:'hidden',
                title: 'namegenerator'
            };

        // Add additional variables, if present
        console.log('nameGenerator.showNewNodeForm() adding additional variables');
        if (typeof options.data.namegenerators[currentPrompt].variables !== 'undefined' && options.data.namegenerators[currentPrompt].variables.length > 0) {
            $.each(options.data.namegenerators[currentPrompt].variables, function(variableIndex, variableValue) {

                properties[variableValue.label] = {
                    type: 'hidden',
                    title: variableValue.label
                };
            });
        }

        console.log('nameGenerator.showNewNodeForm() adding temporary fields');
        window.forms.nameGenForm.addTemporaryFields(properties);

        // Add data from fields
        properties = {};
        properties.namegenerator = options.data.namegenerators[currentPrompt].label;

        // Add data to additional variables, if present
        if (typeof options.data.namegenerators[currentPrompt].variables !== 'undefined' && options.data.namegenerators[currentPrompt].variables.length > 0) {

            // Is there a cute way to do the below using map?
            $.each(options.data.namegenerators[currentPrompt].variables, function(variableIndex, variableValue) {
                properties[variableValue.label] = variableValue.value;
            });
        }

        console.log('nameGenerator.showNewNodeForm() adding data');
        window.forms.nameGenForm.addData(properties);

        console.log('nameGenerator.showNewNodeForm() showing form');
        window.forms.nameGenForm.show();
    };

    nameGenerator.handlePanels = function() {
        note.debug('nameGenerator.handlePanels()');

        if (options.panels.indexOf('current') !== -1) {
            // We are trying to add a panel which shows the current nodes.

            // First, check there are some current nodes:
            // ignore ego and any nodes that are visible in the main node list
            var nodes = nameGenerator.getNodes();

            var filteredResults = [];
            $.each(nodes, function(index,value) {
                if (value.namegenerator !== options.data.namegenerators[currentPrompt].label) {
                    filteredResults.push(value);
                }
            });

            if (filteredResults.length > 0) {
                if ($('.side-container').length === 0) {
                    // Side container
                    var sideContainer = $('<div class="side-container out"></div>');

                    // Current side panel shows alters already elicited
                    sideContainer.append($('<div class="current-panel"><h4>Other people you have mentioned:</h4><div class="current-node-list node-lists"></div><div class="current-node-list-background"></div></div>'));

                    if (sideContainer.children().length > 0) {
                        // move node list to one side
                        sideContainer.insertBefore('.nameList');
                        setTimeout(function() {
                            $('.nameList').addClass('alt');
                            $('.side-container').removeClass('out');
                        }, 10);


                    }
                }
                // halve the panel height if we have two
                if ($('.side-container').children().length > 1) {
                    $('.node-lists').addClass('double');
                }
            } else {
                $('.side-container').addClass('out');
                setTimeout(function() {
                    $('.nameList').removeClass('alt');
                    $('.side-container').remove();
                }, 500);

            }

        }

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

        $(card).on('click', cardClickHandler);

        nameGenerator.updateCounter();
        nameGenerator.makeDraggable();

        setTimeout(function() {
            $('[data-index='+properties.id+']').children('.inner-card').addClass('shown');
        },20);


        if (callback) {
            callback();
        }

        return true;
    };

    nameGenerator.editCard = function(properties, callback) {
        console.log(properties);

        var card = $('.card[data-index="'+properties.id+'"]');
        card.children('.inner-card').find('h4').html(properties.label);

        var list = card.children('.inner-card').find('ul');
        list.html('<li>'+properties.first_name+' '+properties.last_name+'</li>');

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

        if (options.network.removeNode(id)) {
            if(nameGenerator.removeCard(id)) {
                note.info('Deleted node with id '+id);
                nameGenerator.handlePanels();
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
