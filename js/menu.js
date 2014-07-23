var menu = (function () {

    var menu = {};
    var open = false;

    menu.open = function() {
        $('.menu-item').transition({ 'marginLeft': 0 }, 500, 'ease');
        $('.menu-container').transition({'opacity': '1'},500);
        open = true;
    };

    menu.close = function() {
        $('.menu-item').transition({ 'marginLeft': '-110px' }, 500, 'ease');
        $('.menu-container').transition({'opacity': '0'},500);
        open = false;
    };

    menu.toggle = function() {
        if(open) {
            menu.close();
        } else {
            menu.open();
        }
    };

    menu.init = function() {
        $('#menu-button').click(function() {
            menu.toggle();
        });

        $('.menu-item').click(function() {
            menu.close();
        });

        $('#kineticCanvas').click(function() {
            menu.close();
        });

        $('#generate-graph-submit').click(function() {
            $('.modal').modal('hide');
            menu.close();

            if($('#gen-graph-clear').is(':checked')) {
                networkCanvas.clearGraph();
            }

            var nodeNumber = $('#gen-graph-nodes').val();
            var edgeProb = $('#gen-graph-edge-prob').val();
            
            networkCanvas.createRandomGraph(nodeNumber,edgeProb);
        });


    };

    return menu;

})();