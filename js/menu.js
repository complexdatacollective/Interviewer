/* exported Menu */
var Menu = function Menu(options) {

    var menu = {};
    var menus = [];
    var isAnimating = false;
    var menuContainer = $('.menu-container');


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
      onBeforeOpen : function() {
        $('.arrow-right').transition({right:-550});
        $('.arrow-left').transition({left:-550});
        $('.content').addClass("pushed");
      },
      onAfterOpen : function() {
        return false;
      },
      onBeforeClose : function() {
        $('.content').removeClass("pushed");
      },
      onAfterClose : function() {
        $('.arrow-right').transition({right:0},1000);
        $('.arrow-left').transition({left:0},1000);
      }
    };

    menu.getMenus = function() {
        return menus;
    };

    menu.closeMenu = function(targetMenu) {
        targetMenu.items.find('.icon-close').trigger('click');
    };

    menu.toggle = function(targetMenu) {

        // set the left and top values of the contentEl (same like the button)
        var buttonPos = targetMenu.button[0].getBoundingClientRect();
        console.log(buttonPos);
        // need to reset
        var contentEl = $('.'+targetMenu.name+'-menu');
        var menuContent = $('.'+targetMenu.name+'-menu-container');
        console.log(contentEl);

        contentEl.addClass('no-transition');
        contentEl[0].style.left = 'auto';
        contentEl[0].style.top = 'auto';

        if (isAnimating === true) {
            console.log('already isAnimating');
            return false;
        } else {
            isAnimating = true;
            if(targetMenu.expanded === true) {
                console.log('closing');
                // $('.morph-content').css('z-index',0);
                menu.options.onBeforeClose();
                menuContent.removeClass('active');
                menu.options.onAfterClose();
                isAnimating = false;
            } else {
                $('.menu-btn').transition({opacity:0});
                $('.menu-btn').hide();
                // $('.morph-content').css('z-index',9999);
                console.log('opening');
                menu.options.onBeforeOpen();
                menuContent.addClass('active');
                menu.options.onAfterOpen();
                isAnimating = false;

            }

        }
        
        // add/remove class "open" to the button wraper
        setTimeout( function() { 
            contentEl[0].style.left = buttonPos.left + 'px';
            contentEl[0].style.top = buttonPos.top + 'px';
            
            if(targetMenu.expanded === true) {
                console.log('expanded already');
                contentEl.removeClass('no-transition');
                menuContent.removeClass('open');
                targetMenu.expanded = false;

                $('.menu-btn').transition({opacity:1});

            }
            else {
                setTimeout( function() { 
                    contentEl.removeClass('no-transition');
                    menuContent.addClass('open');
                    targetMenu.expanded = true; 
                }, 25 );
            }
        }, 25 );



    };

    menu.addMenu = function(name, icon) {
        var newMenu = {};
        newMenu.name = name;
        newMenu.expanded = false;
        newMenu.button = $('<span class="hi-icon menu-btn '+name+'" style="opacity:0"></span>');

        newMenu.button.addClass(icon).html(name);
        menuContainer.append(newMenu.button);
        newMenu.button.css({top:-300});

        var menuItemsClass = name+'-menu';
        var menuContainerClass = name+'-menu-container';
        newMenu.items = $('<div class="morph-button morph-button-sidebar morph-button-fixed '+menuContainerClass+'"><div class="morph-content '+menuItemsClass+'"><div><div class="content-style-sidebar"><span class="icon icon-close">Close the overlay</span><h2>'+name+'</h2><ul></ul></div></div></div></div>');
        newMenu.button.after(newMenu.items);

        newMenu.button.on( 'click', function() { 
            menu.toggle(newMenu); 
        });
        console.log(newMenu.items.find('.icon-close'));
        newMenu.items.find('.icon-close').on('click', function() {
            $('.menu-btn').show();
            menu.toggle(newMenu);
        });

        menus.push(newMenu);
        newMenu.button.transition({top:0,opacity:1},1000);

        return newMenu;

    };

    menu.removeMenu = function(targetMenu) {
        console.log('removing menu');
        targetMenu.button.transition({top:-300,opacity:0},1000, function() {
            $(targetMenu.button).remove();
            $(targetMenu.items).remove();            
        });
    };

    menu.addItem = function(targetMenu,item,icon,callback) {
        var menuItem = $('<li><a class="icon icon-server '+icon+'" href="#">'+item+'</a></li>');
        targetMenu.items.find('ul').append(menuItem);
        menuItem.on('click', function() {
            callback();
            menu.closeMenu(targetMenu);
        });

//           <li><a class="icon icon-server" href="#">Load Protocol</a></li>
//           <li><a class="icon icon-cloud" href="#">Sync Data</a></li>
//           <li><a class="icon icon-user" href="#">User Profile</a></li>
//           <li><a class="icon icon-briefcase" href="#">Manage Cases</a></li>
//           <li><a class="icon icon-globe" href="#">Global Options</a></li>
// <!-- 
//           <li><a class="icon icon-zoom-in" href="#">Readability</a></li>
//           <li><a class="icon icon-microphone" href="#">Speech</a></li>
//           <li><a class="icon icon-heart" href="#">Favorites</a></li>   -->        



    }; 

    menu.init = function() {
        extend(menu.options,options);
    };


    menu.init();

    return menu;

};