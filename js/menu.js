/* global $, window, note, List */
/* exported Menu */
var Menu = function Menu(options) {
    'use strict';
    // TODO: Check if a menu exists before adding it. If it does, return false. Unique id = menu name.
    // TODO: Give menus ascending classes.

    var menu = {};
    var menus = [];
    var isAnimating = false;

    var contentClickHandler = function() {
        menu.closeMenu();
    };

    menu.options = {
      onBeforeOpen : function() {
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
        $('body').css({'background-color':''});
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
                if(menus[index].open === true) {
                    menus[index].closeBtn.trigger('click');
                }
            });
        } else {
            targetMenu.closeBtn.trigger('click');
        }

    };

    menu.toggle = function(targetMenu) {
        var targetMenuObj = $('.'+targetMenu.name+'-menu');

        if (isAnimating === true) {
            return false;
        } else {
            isAnimating = true;
            if(targetMenu.open === true) {
                menu.options.onBeforeClose();
                targetMenu.filterMenu.search();
                targetMenu.menu.find('input').val('');
                targetMenuObj.removeClass('open');
                targetMenu.open = false;
                setTimeout(menu.options.onAfterClose, 1000);
                isAnimating = false;
            } else {
                menu.options.onBeforeOpen();
                var options = {
                    valueNames: ['name', 'order']
                };

                targetMenu.filterMenu = new List(targetMenu.name, options);
                var col = window.tools.modifyColor($('.'+targetMenu.name+'-menu').css('background-color'),-0.2);
                $('body').css({'background-color':col});
                targetMenuObj.addClass('open');
                targetMenu.open = true;
                setTimeout(menu.options.onAfterOpen, 500);
                isAnimating = false;
            }

        }

    };

    menu.addMenu = function(name, icon) {
        var newMenu = {};
        newMenu.name = name;
        newMenu.open = false;
        newMenu.button = $('<span class="fa fa-2x fa-'+icon+' menu-btn '+name+'"></span>');
        // newMenu.button.addClass(icon);
        $('.menu-container').append(newMenu.button);
        $(newMenu.button).addClass('shown');

        var menuClass = name+'-menu';
        newMenu.menu = $('<div class="menu '+menuClass+'"><div class="menu-content content-'+name+'" id="'+name+'"><h2>'+name+'</h2> <div class="input-group margin-bottom-sm"><span class="input-group-addon"><i class="fa fa-search"></i></span><input class="form-control menu-filter search" type="text" placeholder="Filter"></div><ul class="list"></ul></div></div>');
        newMenu.closeBtn = $('<span class="icon icon-close"><i class="fa fa-times fa-2x"></i></span>');
        $(newMenu.menu).append(newMenu.closeBtn);
        $('.menu-container').append(newMenu.menu);

        newMenu.button.on( 'click', function() {
            $('.menu-btn').removeClass('shown');
            menu.toggle(newMenu);
        });

        newMenu.closeBtn.on( 'click', function() {
            $('.menu-btn').addClass('shown');
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
        console.log('adding '+item);
        var listIcon = 'fa-file-text';
        if (icon) {
            listIcon = icon;
        }
        var menuItem = $('<li><span class="fa '+listIcon+' menu-icon"></span><span class="order" style="display:none;">'+(targetMenu.menu.find('ul').children().length+1)+'</span> <span class="name">'+item+'</span></li>');
        targetMenu.menu.find('ul').append(menuItem);
        menuItem.on('click', function() {
            console.log('yo');
            menu.closeMenu(targetMenu);
            setTimeout(function() {
                callback();
            },500);
        });

    };

    menu.init = function() {
        note.info('Menu initialising.');

        window.tools.extend(menu.options,options);
    };

    menu.init();

    return menu;

};

module.exports = new Menu();
