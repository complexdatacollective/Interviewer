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
        //   console.log('item click handler');
        var properties = {};
        var nodeid = $(this).data('nodeid');
        // console.log('nodeid: '+nodeid);

        if ($(this).data('selected') === true) {
            $(this).data('selected', false);
            $(this).css({'border':'2px solid #eee','background':'#eee'});

            // remove values
            properties[listSelect.options.variable] = undefined;

        } else {
            $(this).data('selected', true);
            $(this).css({'border':'2px solid red','background':'#E8C0C0'});

            // update values

            properties[listSelect.options.variable] = 1;
        }

        console.log(properties);
        window.network.updateEdge(nodeid, properties);

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
        listSelect.options.targetEl.append('<h1 class="text-center">'+listSelect.options.heading+'</h1>');
        listSelect.options.targetEl.append('<div class="form-group service-list-container"></div>');

        var edges = window.network.getEdges(listSelect.options.criteria);
        console.log('edges');
        console.log(edges);
        console.log(listSelect.options.criteria);
        $.each(edges, function(index,value) {
          var node = window.network.getNode(value.to);
          var markup = ('<div class="collapse" id="collapse-'+value.id+'"><div class="well"><div class="btn-group big-check" data-toggle="buttons"></div></div>');

          $.each(listSelect.options.variable.options, function(optionIndex, optionValue) {
            console.log(optionValue);
            // console.log($(markup).find('.big-check'));
            $(markup).append('<label class="btn"><input type="radio" name="gender_k" data-value="Cisgender Male" checked><i class="fa fa-circle-o fa-3x"></i><i class="fa fa-check-circle-o fa-3x"></i> <span class="check-number">Cisgender Male</span></label>');
          });

          var el = $('<div class="item" data-toggle="collapse" data-target="#collapse-'+value.id+'" aria-expanded="false" aria-controls="collapse-'+value.id+'"><div class="inner" data-nodeid="'+value.id+'"><h3>'+node.name+'</h3>'+markup+'</div></div>');


            if (value[listSelect.options.variable] === 1) {
                el.find('.inner').data('selected', true);
                el.find('.inner').css({'border':'2px solid red','background':'#E8C0C0'});
            }
            $('.service-list-container').append(el);
        });

        // Event Listeners
        $(window.document).on('click', '.inner', itemClickHandler);
        window.addEventListener('changeStageStart', stageChangeHandler, false);


    };

    return listSelect;
};
