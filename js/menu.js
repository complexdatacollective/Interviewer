/* exported Menu */
var Menu = function Menu(el, options) {

    var menu = {};
    var isAnimating = false;
    // var el = $('.menu');

    var button, expanded, contentEl;


    // private
    function extend( a, b ) {
        for( var key in b ) { 
            if( b.hasOwnProperty( key ) ) {
                a[key] = b[key];
            }
        }
        return a;
    }

    menu.options = {
        closeEl : '',
        onBeforeOpen : function() { return false; },
        onAfterOpen : function() { return false; },
        onBeforeClose : function() { return false; },
        onAfterClose : function() { return false; }
    };

    menu.toggle = function() {

        // set the left and top values of the contentEl (same like the button)
        var buttonPos = button[0].getBoundingClientRect();
        console.log(buttonPos);
        // need to reset
        contentEl.addClass('no-transition');
        contentEl[0].style.left = 'auto';
        contentEl[0].style.top = 'auto';

        if (isAnimating === true) {
            console.log('already isAnimating');
            return false;
        } else {
            isAnimating = true;
            if(expanded === true) {
                console.log('closing');
                menu.options.onBeforeClose();
                $(el).removeClass('active');
                menu.options.onAfterClose();
                isAnimating = false;
            } else {
                console.log('opening');
                menu.options.onBeforeOpen();
                $(el).addClass('active');
                menu.options.onAfterOpen();
                isAnimating = false;
            }

        }
        
        // add/remove class "open" to the button wraper
        setTimeout( function() { 
            contentEl[0].style.left = buttonPos.left + 'px';
            contentEl[0].style.top = buttonPos.top + 'px';
            
            if(expanded === true) {
                console.log('expanded already');
                contentEl.removeClass('no-transition');
                $(el).removeClass('open');
                expanded = false;
            }
            else {
                setTimeout( function() { 
                    contentEl.removeClass('no-transition');
                    $(el).addClass('open');
                    expanded = true; 
                }, 25 );
            }
        }, 25 );



    };

    menu.init = function() {
        console.log(options);
        extend(menu.options,options);

        // the button
        button = $('button');
        // state
        expanded = false;
        // content el
        contentEl = $('.morph-content');
        // init events
        menu.initEvents();        

    };

    menu.initEvents = function() {
        // open
        // console.log(button);
        button.on( 'click', function() { 
            menu.toggle(); 
        });
        // close
        if( menu.options.closeEl !== '' ) {
            $(menu.options.closeEl).on('click', function() {
                menu.toggle();
            });
        }
    };

    menu.init();

    return menu;

};