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

        // Don't do anything if this is a 'ghost' card (a placeholder created as a visual indicator while a previous network node is being dragged)
        if ($(this).hasClass('ghost')) {
            return false;
        }

        // Get the ID of the node corresponding to this card, stored in the data-index property.
        var index = $(this).data('index');

        // Get the dyad edge for this node
        var edge = window.network.getEdges({from:window.network.getEgo().id, to: index, type:'Dyad'})[0];

        // Set the value of editing to the node id of the current person
        editing = index;

        // Update role count
        var roleCount = window.network.getEdges({from:window.network.getEgo().id, to: editing, type:'Role'}).length;
        $('.relationship-button').html(roleCount+' roles selected.');

        // Make the relevant relationships selected on the relationships panel, even though it isnt visible yet
        var roleEdges = window.network.getEdges({from:window.network.getEgo().id, to: editing, type:'Role'});
        $.each(roleEdges, function(index, value) {
            $(relationshipPanel).children('.relationship-types-container').children('.rel-'+value.reltype_main_t0).find('div[data-sub-relationship="'+value.reltype_sub_t0+'"]').addClass('selected');
        });

        // Populate the form with this nodes data.
        $.each(options.variables, function(index, value) {
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
                nameGenerator.openNodeBox();
            }

        });

    };

    var submitFormHandler = function(e) {
            alterCount = window.network.getNodes({type_t0: 'Alter'}).length;
            alterCounter.update(alterCount);
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
        var events = [
            {event: 'changeStageStart', handler: nameGenerator.destroy, targetEl:  window},
            {event: 'keydown', handler: keyPressHandler, targetEl: window},
            {event: 'click', handler: nameGenerator.openNodeBox, targetEl: window, subTarget: '.add-button'},
        ];

        window.tools.Events.register(moduleEvents, events);

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


        // Set node count box
        var el = document.querySelector('.alter-count-box');

        alterCounter = new Odometer({
          el: el,
          value: alterCount,
          format: 'dd',
          theme: 'default'
        });

        // add existing nodes
        $.each(window.network.getEdges({type: 'Dyad', from: window.network.getEgo().id}), function(index,value) {
            nameGenerator.addToList(value);
        });
    };

    nameGenerator.addToList = function(properties) {
        var card;

        card = $('<div class="card"><div class="inner-card" data-index="'+properties.to+'"><h4>'+properties.nname_t0+'</h4></div></div>');
        var list = $('<ul></ul>');
        $.each(options.variables, function(index, value) {
            if (value.private === false && properties[value.variable] !== undefined && properties[value.variable] !== '') {
                list.append('<li class="'+properties[value.variable]+'"><strong>'+value.label+'</strong>: '+properties[value.variable]+'</li>');
            }

        });
        card.children('.inner-card').append(list);
        $('.nameList').append(card);

    };

    nameGenerator.removeFromList = function() {

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

        nameGenerator.closeNodeBox();
    };

    return nameGenerator;
};
