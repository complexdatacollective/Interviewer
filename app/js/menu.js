/* global global.tools.notify, modifyColor */
/* exported Menu */
var Menu = function Menu(options) {

// TODO: Check if a menu exists before adding it. If it does, return false. Unique id = menu name.
// TODO: Give menus ascending classes.



    var menu = {};
    var menus = [];
    var isAnimating = false;
    var menuContainer = $('.menu-container');
    var adding = false;


    // private
    function extend( a, b ) {
        for( var key in b ) {
            if( b.hasOwnProperty( key ) ) {
                a[key] = b[key];
            }
        }
        return a;
    }

    var contentClickHandler = function() {
        menu.closeMenu();
    };

    menu.options = {
      onBeforeOpen : function() {
        $('.menu-btn').transition({opacity:0});
        $('.menu-btn').hide();
        $('.black').hide();
        $('.arrow-next').transition({marginRight:-550},1000);
        $('.arrow-prev').transition({marginLeft:-550},1000);
        $('.content').addClass("pushed");
        $('.pushed').on('click', contentClickHandler);
      },
      onAfterOpen : function() {
        return false;
      },
      onBeforeClose : function() {
        $('.pushed').off('click', contentClickHandler);
        $('.content').removeClass("pushed");
      },
      onAfterClose : function() {
        $('.black').show();
        $('.arrow-next').transition({marginRight:0},1000);
        $('.arrow-prev').transition({marginLeft:0},1000);
      }
    };

    menu.getMenus = function() {
        return menus;
    };

    menu.closeMenu = function(targetMenu) {
        if(!targetMenu) {
            //close all menus
            $.each(menus, function(index) {
                var name = '.'+menus[index].name+'-menu-container';
                if($(name).hasClass('active')) {
                    menus[index].items.find('.icon-close').trigger('click');
                }
            });
        } else {
            targetMenu.items.find('.icon-close').trigger('click');
        }

    };

    menu.toggle = function(targetMenu) {

        // set the left and top values of the contentEl (same like the button)
        var buttonPos = targetMenu.button[0].getBoundingClientRect();
        // need to reset
        var contentEl = $('.'+targetMenu.name+'-menu');
        var menuContent = $('.'+targetMenu.name+'-menu-container');

        contentEl.addClass('no-transition');
        contentEl[0].style.left = 'auto';
        contentEl[0].style.top = 'auto';

        if (isAnimating === true) {
            return false;
        } else {
            isAnimating = true;
            if(targetMenu.expanded === true) {
                menu.options.onBeforeClose();
                menuContent.removeClass('active');
                setTimeout(menu.options.onAfterClose, 1000);
                isAnimating = false;
            } else {
                menu.options.onBeforeOpen();
                var col = global.tools.modifyColor($('.'+targetMenu.name+'-menu').css("background-color"),-0.2);
                $('body').css({"background-color":col});
                menuContent.addClass('active');
                setTimeout(menu.options.onAfterOpen, 500);
                isAnimating = false;
            }

        }

        // add/remove class "open" to the button wraper
        setTimeout( function() {
            contentEl[0].style.left = buttonPos.left + 'px';
            contentEl[0].style.top = buttonPos.top + 'px';

            if(targetMenu.expanded === true) {
                contentEl.removeClass('no-transition');
                menuContent.removeClass('menu-open');
                targetMenu.expanded = false;

                $('.menu-btn').transition({opacity:1});

            }
            else {
                setTimeout( function() {
                    contentEl.removeClass('no-transition');
                    menuContent.addClass('menu-open');
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
        newMenu.items.find('.icon-close').on('click', function() {
            $('.menu-btn').show();
            menu.toggle(newMenu);
        });

        menus.push(newMenu);
        if (adding === true) {
            setTimeout(function() {
                newMenu.button.transition({top:0,opacity:1},1000).promise().done( function() {
                    adding = false;}
                    );
            }, 500);

        } else {
            adding = true;
            console.log(newMenu.button);
            newMenu.button.transition({top:0,opacity:1},1000).promise().done( function() {
                adding = false; }
                );
        }


        return newMenu;

    };

    menu.removeMenu = function(targetMenu) {
        targetMenu.button.transition({top:-300,opacity:0},1000, function() {
            $(targetMenu.button).remove();
            $(targetMenu.items).remove();
        });
    };

    menu.addItem = function(targetMenu,item,icon,callback) {
        var menuItem = $('<li><a class="icon icon-server '+icon+'" href="#">'+item+'</a></li>');
        targetMenu.items.find('ul').append(menuItem);
        menuItem.on('click', function() {
            $('.paginate').removeAttr('disabled');
            menu.closeMenu(targetMenu);
            setTimeout(function() {
                callback();
            },500);
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
        global.tools.notify('Menu initialising.', 1);
        global.tools.extend(menu.options,options);
    };


    menu.init();

    return menu;

};

module.exports = new Menu();
