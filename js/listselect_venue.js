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

        var properties = {};
        var nodeid = $(this).data('nodeid');


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
        listSelect.options.targetEl.append('<div class="form-group venue-list-container"></div>');


        var edges = window.network.getEdges(listSelect.options.criteria).sort(function(a, b){
          var nameA=a.venue_name_t0.toLowerCase(), nameB=b.venue_name_t0.toLowerCase();
          if (nameA < nameB)  {
            return -1;
          }//sort string ascending

          if (nameA > nameB) {
            return 1;
          }

          return 0; //default return value (no sorting)
        });

        $.each(edges, function(index,value) {
            var el = $('<div class="item"><div class="inner" data-nodeid="'+value.id+'"><h4>'+value.venue_name_t0+'</h4></div></div>');

            if (value[listSelect.options.variable] === 1) {
                el.find('.inner').data('selected', true);
                el.find('.inner').css({'border':'2px solid red','background':'#E8C0C0'});
            }
            $('.venue-list-container').append(el);
        });


        // Event Listeners
        $(window.document).on('click', '.inner', itemClickHandler);
        window.addEventListener('changeStageStart', stageChangeHandler, false);


    };

    return listSelect;
};
