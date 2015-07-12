/* global $, window */
/* exported ListSelect */
module.exports = function ListSelect() {
    'use strict';
    //global vars
    var listSelect = {};
    listSelect.options = {
        targetEl: $('.container'),
        variables: [],
        heading: 'This is a default heading',
        subheading: 'And this is a default subheading'
    };

    var itemClickHandler = function() {
        //   console.log('item click handler');
        var properties = {};
        var nodeid = $(this).data('nodeid');
        // console.log('nodeid: '+nodeid);

        if ($(this).data('selected') === true) {
            // console.log("$(this).data('selected') === true");
            $(this).data('selected', false);
            $(this).css({'border':'2px solid #eee','background':'#eee'});

            // remove values
            $.each(listSelect.options.variables, function(index,value) {
                if (value.value === nodeid) {
                    properties[value.value] = undefined;
                }
            });
            window.network.updateNode(window.network.getNodes({type_t0:'Ego'})[0].id, properties);

        } else {
            $(this).data('selected', true);
            $(this).css({'border':'2px solid red','background':'#E8C0C0'});

            // update values

            $.each(listSelect.options.variables, function(index,value) {
                if (value.value === nodeid) {
                    properties[value.value] = 1;
                }

            });

            window.network.updateNode(window.network.getNodes({type_t0:'Ego'})[0].id, properties);

        }

    };

    var stageChangeHandler = function() {
        listSelect.destroy();
    };

    var processSubmitHandler = function() {
        window.session.nextStage();

    };

    listSelect.destroy = function() {
        // Event Listeners
        window.tools.notify('Destroying listSelect.',0);
        $(window.document).off('click', '.inner', itemClickHandler);
        $(window.document).off('click', '.continue', processSubmitHandler);
        window.removeEventListener('changeStageStart', stageChangeHandler, false);

    };

    listSelect.init = function(options) {
        window.tools.extend(listSelect.options, options);
        // Add header and subheader
        listSelect.options.targetEl.append('<h1 class="text-center">'+listSelect.options.heading+'</h1>');
        listSelect.options.targetEl.append('<p class="lead text-center">'+listSelect.options.subheading+'</p>');
        listSelect.options.targetEl.append('<div class="form-group list-container"></div>');

        $.each(listSelect.options.variables, function(index,value) {
            var el = $('<div class="item"><div class="inner" data-nodeid="'+value.value+'"><h3>'+value.label+'</h3></div></div>');
            var properties = {
                type_t0: 'Ego'
            };

            properties[value.value] = 1;
            if (window.network.getNodes(properties).length>0) {
                el.find('.inner').data('selected', true);
                el.find('.inner').css({'border':'2px solid red','background':'#E8C0C0'});
            }
            $('.list-container').append(el);
        });


        // Event Listeners
        $(window.document).on('click', '.inner', itemClickHandler);
        $(window.document).on('click', '.continue', processSubmitHandler);
        window.addEventListener('changeStageStart', stageChangeHandler, false);


    };

    return listSelect;
};
