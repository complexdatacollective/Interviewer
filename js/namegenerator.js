/* global $, window, Odometer, document, note, Swiper  */
/* exported Namegenerator */
module.exports = function NameGenerator() {
    'use strict';
    //global vars
    var nameGeneratorMulti = {};
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
        $.each(options.data.namegenerators, function(targetIndex, targetValue) {
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

        var eachTime = 1500;

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
            handler: nameGeneratorMulti.toggleSelectable,
            targetEl: window.document,
            subTarget:  '.node-list-item'
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

        var alterCount = nameGeneratorMulti.getNodes().length;

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
            nameGeneratorMulti.handlePanels();
            nameGeneratorMulti.changeData();
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

        nameGeneratorMulti.handlePanels();
        nameGeneratorMulti.addData();
        nameGeneratorMulti.bindEvents();
    };

    nameGeneratorMulti.changeData = function() {
            $('.inner-card, .node-list-item').removeClass('shown');
            setTimeout(function() {
                $('.card, .node-list-item').remove();
                nameGeneratorMulti.addData();
            }, 1000);
    };

    nameGeneratorMulti.getNodes = function(criteria) {
        console.log('getnodes');
        console.log(criteria);
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

    nameGeneratorMulti.toggleSelectable = function() {
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

    nameGeneratorMulti.updateSidePanel = function() {
        console.log('updatesidepanel');

        // Empty it
        $('.current-node-list').children().remove();

        // ignore ego and any nodes that are visible in the main node list
        var nodes = nameGeneratorMulti.getNodes();

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
                nameGeneratorMulti.makeDraggable();
            },50+(index*50));

        });

    };

    nameGeneratorMulti.addData = function () {
        console.log('add data');
        var properties = {};
        // build properties array from data
        properties.namegenerator = options.data.namegenerators[currentPrompt].label;
        console.log(properties);
        var nodes = nameGeneratorMulti.getNodes(properties);
        console.log(nodes);
        $.each(nodes, function(index,value) {
            setTimeout(function() {
                nameGeneratorMulti.addCard(value);
            }, index * 40);
        });

        nameGeneratorMulti.updateSidePanel();
        nameGeneratorMulti.updateCounter();

    };

    nameGeneratorMulti.updateCounter = function(number) {
        if (!number) {
            alterCounter.update(options.network.getNodes().length-1);
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

        $('.node-list-item').draggable({
            // appendTo: 'body',
            helper: 'clone',
            revert: true,
            revertDuration: 200,
            refreshPositions: true,
            scroll: false,
            stack: '.node-list-item',
            start: function(event, ui) {
                nameGeneratorMulti.showBin();
                $(ui.helper).addClass('dragging');
            },
            stop: function(event, ui) {
                $(ui.helper).removeClass('dragging');
                nameGeneratorMulti.hideBin();
            }
        });

    };

    nameGeneratorMulti.showNewNodeForm = function() {

        // add fields from data
        var properties = {};
            properties.namegenerator = {
                type:'hidden',
                title: 'namegenerator'
            };

        // Add additional variables, if present
        if (typeof options.data.namegenerators[currentPrompt].variables !== 'undefined' && options.data.namegenerators[currentPrompt].variables.length > 0) {
            $.each(options.data.namegenerators[currentPrompt].variables, function(variableIndex, variableValue) {

                properties[variableValue.label] = {
                    type: 'hidden',
                    title: variableValue.label
                };
            });
        }

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


        window.forms.nameGenForm.addData(properties);

        window.forms.nameGenForm.show();
    };

    nameGeneratorMulti.handlePanels = function() {
        note.debug('nameGeneratorMulti.handlePanels()');

        if (options.panels.indexOf('current') !== -1) {
            // We are trying to add a panel which shows the current nodes.

            // First, check there are some current nodes:
            // ignore ego and any nodes that are visible in the main node list
            var nodes = nameGeneratorMulti.getNodes();

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

        setTimeout(function() {
            $('[data-index='+properties.id+']').children('.inner-card').addClass('shown');
        },20);


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
                nameGeneratorMulti.handlePanels();
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
