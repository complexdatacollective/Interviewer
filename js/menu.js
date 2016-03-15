/* global $, window, module, note, alert */
/* exported Menu */
module.exports = function Menu(options) {
    'use strict';
    var menu = {};
    var menuEl;

    menu.options = {
        name: 'Default',
        icon: 'fa-icon',
        items: [
            {
                label: 'Label',
                icon: 'fa-bars',
                action: function() {
                    alert('Yo');
                }
            }
        ]
    };

    menu.getMenu = function() {
        return menuEl;
    };

    menu.closeMenu = function() {

        var targetMenuObj = $('.'+menuEl.name+'-menu');
        $('.paginate').removeClass('slide');
        $('.content').removeClass('pushed');
        targetMenuObj.removeClass('open');
        $('.menu-btn').show();

        setTimeout(function() {
            $('body').removeClass(menuEl.name);
        }, 500);

    };

    menu.openMenu = function() {
        $('body').addClass(menuEl.name);
        var targetMenuObj = $('.'+menuEl.name+'-menu');
        setTimeout(function() {
            $('.paginate').addClass('slide');
            $('.content').addClass('pushed');
            targetMenuObj.addClass('open');
            $('.menu-btn').hide();
        }, 10);

    };

    menu.destroy = function() {
        $(menuEl.button).remove();
        $(menuEl.menu).remove();
    };

    menu.addItem = function(label,icon,callback) {
        var listIcon = 'fa-file-text';
        if (icon) {
            listIcon = icon;
        }
        var menuItem = $('<li><span class="fa '+listIcon+' menu-icon"></span> '+label+'</li>');
        menuEl.menu.find('ul').append(menuItem);
        menuItem.on('click', function() {
            $('.paginate').removeAttr('disabled');
            menu.closeMenu();
            setTimeout(function() {
                callback();
            }, 200);
        });

    };

    menu.init = function(options) {
        note.info('Menu called "'+options.name+'" initialising...');
        window.tools.extend(menu.options,options);

        var newMenu = {};
        newMenu.name = options.name;
        newMenu.button = $('<span class="fa fa-2x '+options.icon+' menu-btn shown '+options.name+'"></span>');
        $('.menu-container').append(newMenu.button);

        var menuClass = options.name+'-menu';
        newMenu.menu = $('<div class="menu '+menuClass+'"><div class="menu-content"><h2>'+options.name+'</h2><ul></ul></div></div>');
        newMenu.closeBtn = $('<span class="icon icon-close"><i class="fa fa-times fa-2x"></i></span>');
        $(newMenu.menu).append(newMenu.closeBtn);
        $('.menu-container').append(newMenu.menu);

        newMenu.button.on('click', function() {
            menu.openMenu();
        });

        newMenu.closeBtn.on( 'click', function() {
            menu.closeMenu();
        });

        menuEl = newMenu;

        $.each(menu.options.items, function(index, value) {
            menu.addItem(value.label, value.icon, value.action);
        });

    };

    menu.init(options);

    return menu;

};
