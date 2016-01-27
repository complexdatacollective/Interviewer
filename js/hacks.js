/* global window, alert, note, $, Mousetrap, network, netCanvas */

var Hacks = function Hacks() {
    'use strict';
    var hacks = {}, moduleEvents = [];

    hacks.bindEvents = function() {

        // Events
        var event = [
            {
                event: 'keydown',
                targetEl: window.document,
                handler: hacks.handleKeyPress
            },
            {
                event: 'keyup',
                targetEl: window.document,
                subTarget: '#first_name, #last_name',
                handler: hacks.nicknameGenerator
            }
        ];
        window.tools.Events.register(moduleEvents, event);

        // Mousetrap events
        Mousetrap.bind(['command+k', 'ctrl+k'], function(e) {
            e.preventDefault();
            // show hide key
            $(':focus').blur();
            $('.key-panel').toggleClass('on');
        });

        Mousetrap.bind(['command+r', 'ctrl+r'], function() {
            alert('MOFO');
        });

    };

    hacks.renameContext = function(contextName, newName) {
        // get ego
        var ego = network.getEgo();
        ego.contexts.replace(contextName, newName);



        //get nodes
        var nodes = network.getNodes();
        $.each(nodes, function(nodeIndex, nodeValue) {
            if (nodeValue.contexts) {
                nodeValue.contexts.replace(contextName, newName);
            }
        });

        // save everything
        netCanvas.Modules.session.saveData();


        // refresh stage
        $('.refresh-button').trigger('click');
    };

    hacks.unbindEvents = function() {
        window.tools.Events.unbind(moduleEvents);
    };

    hacks.init = function() {
        hacks.bindEvents();
    };

    hacks.destroy = function() {
        hacks.unbindEvents();
    };

    function isEditable($element) {
        return $element.is( 'input[type!="radio"][type!="checkbox"][type!="date"]:not(:disabled):not([readonly]), textarea:text:not(:disabled):not([readonly])') ;
    }

    hacks.nicknameGenerator = function(e) {
        console.log('nickname');
        // If key is NOT the enter key
        if (e.keyCode !== 13) {
            if($('#first_name').val().length > 0 && $('#first_name').val().length > 0) {

                var lname = $('#first_name').val()+' '+$('#last_name').val().charAt(0);
                if ($('#last_name').val().length > 0 ) {
                    lname +='.';
                }

                var updateName = function() {
                    $('#label').val(lname);
                };

                setTimeout(updateName,0);

            }
        }
    };

    hacks.handleKeyPress = function(e) {
        note.info('hacks.handleKeyPress');
        note.trace(e.keyCode);
        if (!isEditable($(':focus'))) {
            console.log('preventDefault');
            e.preventDefault();
        }

        // enter key
        if (e.keyCode === 13) {
            alert('enter key');
        }

        // Escape key
        if (e.keyCode === 27) {
            alert('escape key');
        }

        // Prevent accidental backspace navigation
        if (e.keyCode === 8 && !$(e.target).is('input, textarea')) {
            alert('backspace disabled');
            e.preventDefault();
        }



    };

    hacks.init();

    return hacks;


};

module.exports = new Hacks();
