/* global $ */
/* exported Menu */
var Menu = function Menu(options) {
    'use strict';
    // TODO: Check if a menu exists before adding it. If it does, return false. Unique id = menu name.
    // TODO: Give menus ascending classes.

    var menu = {};
    var menus = [];
    var isAnimating = false;
    var menuContainer = $('.menu-container');

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
        $('.content').addClass('pushed');
        $('.pushed').on('click', contentClickHandler);
      },
      onAfterOpen : function() {
        return false;
      },
      onBeforeClose : function() {
        $('.content').removeClass('pushed');
        $('.pushed').off('click', contentClickHandler);
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

        var targetMenuObj = $('.'+targetMenu.name+'-menu');
        var menuContent = $('.'+targetMenu.name+'-menu-container');

        if (isAnimating === true) {
            return false;
        } else {
            isAnimating = true;
            if(targetMenuObj.open === true) {
                menu.options.onBeforeClose();
                targetMenuObj.removeClass('open');
                setTimeout(menu.options.onAfterClose, 1000);
                isAnimating = false;
            } else {
                menu.options.onBeforeOpen();
                var col = global.tools.modifyColor($('.'+targetMenu.name+'-menu').css('background-color'),-0.2);
                $('body').css({'background-color':col});
                targetMenuObj.addClass('open');
                setTimeout(menu.options.onAfterOpen, 500);
                isAnimating = false;
            }

        }

    };

    menu.addMenu = function(name, icon) {
        var newMenu = {};
        newMenu.name = name;
        newMenu.open = false;
        newMenu.button = $('<span class="hi-icon menu-btn '+name+'"></span>');

        newMenu.button.addClass(icon).html(name);
        menuContainer.append(newMenu.button);

        var menuClass = name+'-menu';
        newMenu.menu = $('<div class="menu '+menuClass+'"><div class="menu-content"><span class="icon icon-close">Close the overlay</span><h2>'+name+'</h2><ul></ul></div></div>');
        $('body').append(newMenu.menu);

        newMenu.button.on( 'click', function() {
            menu.toggle(newMenu);
        });
        newMenu.menu.find('.icon-close').on('click', function() {
            $('.menu-btn').show();
            menu.toggle(newMenu);
        });

        menus.push(newMenu);

        return newMenu;

    };

    menu.removeMenu = function(targetMenu) {
        $(targetMenu.button).remove();
        $(targetMenu.items).remove();
    };

    menu.addItem = function(targetMenu,item,icon,callback) {
        var menuItem = $('<li><a class="icon icon-server '+icon+'" href="#">'+item+'</a></li>');
        targetMenu.menu.find('ul').append(menuItem);
        menuItem.on('click', function() {
            $('.paginate').removeAttr('disabled');
            menu.closeMenu(targetMenu);
            setTimeout(function() {
                callback();
            },500);
        });

    };

    menu.init = function() {
        global.tools.notify('Menu initialising.', 1);
        global.tools.extend(menu.options,options);
    };

    menu.init();

    return menu;

};

module.exports = new Menu();
