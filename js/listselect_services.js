/* global $, window */
/* exported ListSelect */
module.exports = function ListSelect() {
    'use strict';
    //global vars
    var listSelect = {};
    listSelect.options = {
        targetEl: $('.container')
    };

    var itemClickHandler = function() {


        var nodeid = $(this).data('nodeid');


        $(this).find('.select-icon').toggleClass('fa-circle-o fa-check-circle-o');

        if ($(this).parent().hasClass('selected')) {
            $(this).parent().removeClass('selected');
            // uncheck boxes
            $('[data-parent='+nodeid+']').each(function(){ $(this).prop('checked', false); });

            // remove values
            window.network.removeEdge(window.network.getEdge($(this).data('edgeid')));

        } else {
            $(this).parent().addClass('selected');

            var properties = {
                from: window.network.getEgo().id,
                to: nodeid,
                type: listSelect.options.edge
            };

            properties[listSelect.options.variable.label] = [];

            var targetEdge = window.network.addEdge(properties);

            $(this).data('edgeid', targetEdge);

        }

    };

    var stageChangeHandler = function() {
        listSelect.destroy();
    };

    listSelect.destroy = function() {
        // Event Listeners
        window.tools.notify('Destroying listSelect.',0);
        $(window.document).off('click', '.inner', itemClickHandler);
        window.removeEventListener('changeStageStart', stageChangeHandler, false);

    };

    listSelect.init = function(options) {
        window.tools.extend(listSelect.options, options);
        // Add header and subheader
        listSelect.options.targetEl.append('<div class="question-container"><h1 class="text-center">'+listSelect.options.heading+'</h1></div>');
        listSelect.options.targetEl.append('<div class="form-group service-list-container"></div>');

        var edges = window.network.getEdges(listSelect.options.criteria);

        $.each(edges, function(index,value) {
          var node = window.network.getNode(value.to);
          var targetEdge = window.network.getEdges({type: listSelect.options.edge, from: window.network.getEgo().id, to:node.id});

          var el = $('<div class="item"><div class="inner" data-nodeid="'+node.id+'" data-toggle="collapse" data-target="#collapse-'+value.id+'" aria-expanded="false" aria-controls="collapse-'+value.id+'"><h4>'+node.name+'</h4></div></div>');

          var markup = $('<div class="collapse" id="collapse-'+value.id+'"><div class="well"><h5>Which services did you access? Click or tap all that apply</h5><div class="check"></div></div>');

            $('.service-list-container').append(el);

            if (targetEdge.length > 0) {
                el.find('.inner').data('edgeid', targetEdge[0].id);
                $('[data-nodeid="'+node.id+'"]').parent().addClass('selected');
                markup.addClass('in');
            }

            el.append(markup);

            $.each(listSelect.options.variable.options, function(optionIndex, optionValue) {
                var checked = '';
                console.log(targetEdge[0]);
                if(targetEdge.length > 0 && targetEdge[0][listSelect.options.variable.label].indexOf(optionValue) !== -1) {
                    console.log('SELECTED: '+listSelect.options.variable.label+' '+optionValue);
                    checked = 'selected';
                } else {
                    console.log('NOT SELECTED: '+listSelect.options.variable.label+' '+optionValue);
                }
                el.find('.check').append('<button class="btn btn-select btn-block '+checked+'" data-parent="'+node.id+'" name="'+listSelect.options.variable.label+'" type="button" id="check-'+index+optionIndex+'" data-value="'+optionValue+'">'+optionValue+'</button>');
            });
        });

        // Event Listeners
        $(window.document).on('click', '.inner', itemClickHandler);
        $('[name="'+listSelect.options.variable.label+'"]').click(function() {
            // if ($(this).is(':checked')) {

            console.log('clicked');

                var el = $(this).parent();
                var id = $(this).parent().parent().parent().parent().find('.inner').data('edgeid');
                $(this).toggleClass('selected');

                var properties = {};
                properties[listSelect.options.variable.label] = $(el).find('button.selected').map(function(){
                    return $(this).data('value');
                }).get();
                console.log(properties);

                window.network.updateEdge(id, properties);
            // }

        });
        window.addEventListener('changeStageStart', stageChangeHandler, false);


    };

    return listSelect;
};
