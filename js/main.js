// CodeKit Imports

// @codekit-prepend "../components/jquery/dist/jquery.min.js"
// @codekit-prepend "../components/bootstrap/dist/js/bootstrap.min.js"
// @codekit-prepend "../components/kineticjs/kinetic.min.js"
// @codekit-prepend "../components/jquery.transit/jquery.transit.js"
// @codekit-prepend "../components/vis/dist/vis.min.js"
// @codekit-prepend "../js/NetworkCanvas.js"
//

//helper functions go here
var test = {};
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

    return menu;

})();

window.onload = function() {

    window.n = new NetworkCanvas({
    });

    $('#menu-button').click(function() {
        menu.toggle();
    });

    $('.menu-item').click(function() {
        menu.close();
    });

    $('#kineticCanvas').click(function() {
        menu.close();
    });

    $('#refresh-button').click(function() {
        $(this).addClass('.refresh-animate');
        location.reload();
    });



    $('#generate-graph-submit').click(function() {
        $('.modal').modal('hide');
        menu.close();

        if($('#gen-graph-clear').is(':checked')) {
            n.clearGraph();
        }

        var nodeNumber = $('#gen-graph-nodes').val();
        var edgeProb = $('#gen-graph-edge-prob').val();
        
        n.createRandomGraph(nodeNumber,edgeProb);
    });

};

