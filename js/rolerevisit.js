/* global $, window */
/* exported RoleRevisit */
var RoleRevisit = function RoleRevisit() {
    'use strict';
    //global vars
    var roleRevisit = {};
    roleRevisit.options = {
        nodeType:'Alter',
        edgeType:'Dyad',
        targetEl: $('.container'),
        variables: [],
        heading: 'This is a default heading',
        subheading: 'And this is a default subheading'
    };

    var nodeBoxOpen = false;
    var editing = false;

    var roles = {
        'Friend': ['Best Friend','Friend','Ex-friend','Other type'],
        'Family / Relative': ['Parent / Guardian','Brother / Sister','Grandparent','Other Family','Chosen Family'],
        'Romantic / Sexual Partner': ['Boyfriend / Girlfriend','Ex-Boyfriend / Ex-Girlfriend','Booty Call / Fuck Buddy / Hook Up','One Night Stand','Other type of Partner'],
        'Acquaintance / Associate': ['Coworker / Colleague','Classmate','Roommate','Friend of a Friend','Neighbor','Other'],
        'Other Support / Source of Advice': ['Teacher / Professor','Counselor / Therapist','Community Agency Staff','Religious Leader','Mentor','Coach','Other'],
        'Drug Use': ['Someone you use drugs with','Someone you buy drugs from'],
        'Other': ['Other relationship']
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

    var stageChangeHandler = function() {
        roleRevisit.destroy();
    };

    var cardClickHandler = function() {
        // console.log('card click');
        // console.log(e);

        var index = $(this).data('index');
        // console.log(index);
        // Set the value of editing to the node id of the current person
        editing = index;

        // Update role count
        var roleCount = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id, to: editing, type:'Role'}).length;
        $('div[data-index="'+index+'"]').children().children('.role-count').html(roleCount+' roles selected.');

        // Mark the existing roles as selected
        var roleEdges = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id, to: editing, type:'Role'});
        $.each(roleEdges, function(index, value) {
             $('.rel-'+value.reltype_main_t0).find('div[data-sub-relationship="'+value.reltype_sub_t0+'"]').addClass('selected').data('selected', true);
        });

        // Once the box is opened, delete all the Role edges. Simpler than adding removal logic.
        window.network.removeEdges(window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id, to: editing, type:'Role'}));
        roleRevisit.openNodeBox();

    };

    var submitFormHandler = function() {
        var el = $('div[data-index='+editing+']');
        el.stop().transition({background:'#1ECD97'}, 400, 'ease');
        $.each($('.relationship.selected'), function() {
             var edgeProperties = {
                type: 'Role',
                from:window.network.getNodes({type_t0:'Ego'})[0].id,
                to: editing,
                reltype_main_t0: $(this).parent('.relationship-type').data('main-relationship'),
                reltype_sub_t0: $(this).data('sub-relationship')
              };
            window.network.addEdge(edgeProperties);
        });

        // Deselect all relationships
        $('.relationship').removeClass('selected');
        var roleCount = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id, to: editing, type:'Role'}).length;
        $('div[data-index="'+editing+'"]').children().children('.role-count').html(roleCount+' roles selected.');
        roleRevisit.closeNodeBox();
    };

    roleRevisit.openNodeBox = function() {
        $('.content').addClass('blurry');
        $('.relationship-types-container').addClass('open');
        nodeBoxOpen = true;
    };

    roleRevisit.closeNodeBox = function() {
        $('.content').removeClass('blurry');
        // $('.newNodeBox').transition({scale:0.1,opacity:0},500);
        $('.relationship-types-container').removeClass('open');
        setTimeout(function() {

        });
        nodeBoxOpen = false;
    };

	roleRevisit.addToList = function(properties) {
		// var index = $(this).data('index');
		var card;

		card = $('<div class="card" data-index="'+properties.to+'"><h4>'+properties.nname_t0+'</h4></div>');
		var list = $('<ul></ul>');

        list.append('<li class="'+properties.fname_t0+'"><strong>First Name</strong>: '+properties.fname_t0+'</li>');
        list.append('<li class="'+properties.lname_t0+'"><strong>Last Name</strong>: '+properties.lname_t0+'</li>');

        var roles = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id, to: properties.to, type:'Role'});
        var roleString = '';
        $.each(roles, function(index, value) {
            roleString += ' '+value.reltype_sub_t0+',';
        });

        // cut off the last comma
        roleString = roleString.substring(0, roleString.length - 1);

        list.append('<li><strong>Roles</strong>: '+roleString+'</li>');

		card.append(list);

		$('.nameList').append(card);

	};

    roleRevisit.destroy = function() {
        window.tools.notify('Destroying roleRevisit.',0);
        // Event listeners
        $(window.document).off('click', '.card', cardClickHandler);
        window.removeEventListener('changeStageStart', stageChangeHandler, false);
        $('.relationship-types-container').remove();
        $(window.document).off('click', '.relationship', roleClickHandler);
        $(window.document).off('click', '.relationship-close-button', roleRevisit.toggleRelationshipBox);
    };

    roleRevisit.init = function(options) {
        window.tools.extend(roleRevisit.options, options);
        // create elements
        var title = $('<h1 class="text-center"></h1>').html(roleRevisit.options.heading);
        roleRevisit.options.targetEl.append(title);
        var subtitle = $('<p class="lead text-center"></p>').html(roleRevisit.options.subheading);
        roleRevisit.options.targetEl.append(subtitle);


        // relationship types
        var roleBox = $('<div class="relationship-types-container"><button class="btn btn-primary relationship-close-button">Close</button></div>');
        $('body').append(roleBox);
        var counter = 0;
        $.each(roles, function(index) {
            $('.relationship-types-container').append('<div class="relationship-type rel-'+counter+' c'+counter+'" data-main-relationship="'+counter+'"><h1>'+index+'</h1></div>');
            $.each(roles[index], function(relIndex, relValue) {
                $('.rel-'+counter).append('<div class="relationship" data-sub-relationship="'+relValue+'">'+relValue+'</div>');
            });
            counter++;
        });

        var nodeContainer = $('<div class="node-container"></div>');
        roleRevisit.options.targetEl.append(nodeContainer);

        // create namelist container
        var nameList = $('<div class="table nameList"></div>');
        $('.node-container').append(nameList);

        // Event listeners
        window.addEventListener('changeStageStart', stageChangeHandler, false);
        $(window.document).on('click', '.card', cardClickHandler);
        $(window.document).on('click', '.relationship', roleClickHandler);
        $(window.document).on('click', '.relationship-close-button', submitFormHandler);

        // Set node count box
    };

    return roleRevisit;
};

module.exports = new RoleRevisit();
