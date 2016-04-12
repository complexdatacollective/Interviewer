/*jshint unused:false*/
/*global Set, window, $, localStorage, Storage, debugLevel, deepEquals, Notification, alert, note */
/*jshint bitwise: false*/
'use strict';
// Storage prototypes

window.Storage.prototype.showUsage = function() {

    var total = 0;
    for(var x in localStorage) {
      var amount = (localStorage[x].length * 2) / 1024 / 1024;
      total += amount;
      console.log( x + ' = ' + amount.toFixed(2) + ' MB');
    }
    console.log( 'Total: ' + total.toFixed(2) + ' MB');
};


window.Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

window.Storage.prototype.getObject = function(key) {
    if (this.getItem(key) === null) {
        return false;
    } else {
        var value = this.getItem(key);
        return value && JSON.parse(value);
    }
};

// Array prototypes

Object.defineProperty(Array.prototype, 'remove', {
    enumerable: false,
    value: function (item) {
        var removeCounter = 0;

        for (var index = 0; index < this.length; index++) {
            if (this[index] === item) {
                this.splice(index, 1);
                removeCounter++;
                index--;
            }
        }
        return removeCounter;
    }
});

exports.arrayDifference = function(a1, a2) {
  var a2Set = new Set(a2);
  return a1.filter(function(x) { return !a2Set.has(x); });
};

exports.removeFromObject = function(item, object) {
    var removeCounter = 0;

    for (var index = 0; index < object.length; index++) {
        if (object[index] === item) {
            object.splice(index, 1);
            removeCounter++;
            index--;
        }
    }
    return removeCounter;
};

// helper functions

exports.nwNotification = function(options) {
    var notification = new Notification('Network Canvas:',options);
    notification.onclick = function () {
        // alert('Notification Clicked');
    };

    notification.onshow = function () {
        // play sound on show
        // myAud=document.getElementById("audio1");
        // myAud.play();

        // auto close after 1 second
        // setTimeout(function() {
        //     notification.close();
        // }, 1000);
    };
};

exports.deepEquals = function(a, x) {
    var p;
    for (p in a) {
        if (typeof(x[p]) === 'undefined') {
            return false;
        }
    }

    for (p in a) {
        if (a[p]) {

            switch (typeof(a[p])) {
                case 'object':
                    if (a[p].sort) {
                        a[p].sort();
                        x[p].sort();
                    }
                    if (!deepEquals(a[p], x[p])) {
                        return false;
                    }
                    break;
                case 'function':
                    if (typeof(x[p]) === 'undefined' || a[p].toString() !== x[p].toString()) {
                        return false;
                    }
                    break;
                default:
                    if (a[p] !== x[p]) {
                        return false;
                    }
            }
        } else {
            if (x[p]) {
                return false;
            }

        }
    }
    for (p in x) {
        if (typeof(a[p]) === 'undefined') {
            return false;
        }
    }

    return true;
};

exports.isInNestedObject = function(targetArray, objectKey, objectKeyValue) {
    // This function is for checking for keys in arrays of objects.
    for (var i = 0; i<targetArray.length; i++){
        for (var prop in targetArray[i]){
            if (prop === objectKey && targetArray[i][prop] === objectKeyValue) { return true; }
        }
    }

    return false;
};

exports.getValueFromNestedObject = function(targetArray, objectKey) {
    // This function is for checking for keys in arrays of objects.
    for (var i = 0; i<targetArray.length; i++){
        for (var prop in targetArray[i]){
            if (prop === objectKey) { return targetArray[i][prop]; }
        }
    }

    return false;
};


exports.extend = function( a, b ) {
    for( var key in b ) {
        if( b.hasOwnProperty( key ) ) {
            a[key] = b[key];
        }
    }
    return a;
};

exports.notify = function(text, level){
    level = level || 0;
    // if (level >= window.debugLevel) {
        console.log(text);
    // }
};

exports.randomBetween = function(min,max) {
    return Math.random() * (max - min) + min;
};

//
exports.Events = {
    register: function(eventsArray, eventsList) {
        for (var i = 0; i < eventsList.length; i++) {
            eventsArray.push(eventsList[i]);

			if (eventsList[i].targetEl && eventsList[i].handler && eventsList[i].event) {
				if (typeof eventsList[i].subTarget !== 'undefined') {
					// console.log('$('+eventsList[i].targetEl+').on('+eventsList[i].event+', '+eventsList[i].subTarget+', '+eventsList[i].handler+')');
	                $(eventsList[i].targetEl).on(eventsList[i].event, eventsList[i].subTarget, eventsList[i].handler);
	            } else {
	                $(eventsList[i].targetEl).on(eventsList[i].event, eventsList[i].handler);
	            }
			} else {
				note.warn('An event was misspecified, and has been ignored.');
				note.debug(eventsList[i]);
			}

        }

    },
    unbind: function(eventsArray) {
        for (var i = 0; i < eventsArray.length; i++) {
            if (typeof eventsArray[i].subTarget !== 'undefined') {
                $(eventsArray[i].targetEl).off(eventsArray[i].event, eventsArray[i].subTarget, eventsArray[i].handler);
            } else {
                $(eventsArray[i].targetEl).off(eventsArray[i].event, eventsArray[i].handler);
            }
        }
    }
};

exports.hex = function (x){
    return ('0' + parseInt(x).toString(16)).slice(-2);
};

$.cssHooks.backgroundColor = {
    get: function(elem) {
        var bg;
        if (elem.currentStyle) {
            bg = elem.currentStyle.backgroundColor;
        } else if (window.getComputedStyle) {
            bg = window.document.defaultView.getComputedStyle(elem,null).getPropertyValue('background-color');
        }

        if (bg.search('rgb') === -1) {
            return bg;
        } else {
            bg = bg.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            return '#' + window.tools.hex(bg[1]) + window.tools.hex(bg[2]) + window.tools.hex(bg[3]);
        }
    }
};

exports.modifyColor = function(hex, lum) {

    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    var rgb = '#', c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i*2,2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ('00'+c).substr(c.length);
    }

    return rgb;

};
