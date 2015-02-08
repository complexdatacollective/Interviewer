/*jshint unused:false*/
/* global Storage, debugLevel */
/*jshint bitwise: false*/

// Storage prototypes

Storage.prototype.showUsage = function() {

    var total = 0;
    for(var x in localStorage) {
      var amount = (localStorage[x].length * 2) / 1024 / 1024;
      total += amount;
      console.log( x + " = " + amount.toFixed(2) + " MB");
    }
    console.log( "Total: " + total.toFixed(2) + " MB");
};


Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
    if (this.getItem(key) === null) {
        return false;
    } else {
        var value = this.getItem(key);
        return value && JSON.parse(value);
    }
};

// Array prototypes

Object.defineProperty(Array.prototype, "remove", {
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

function removeFromObject(item, object) {
    var removeCounter = 0;

    for (var index = 0; index < object.length; index++) {
        if (object[index] === item) {
            object.splice(index, 1);
            removeCounter++;
            index--;
        }
    }
    return removeCounter;
}

// helper functions

function deepEquals(a, x) {
    var p;
    for (p in a) {
        if (typeof(x[p]) == 'undefined') {
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
                    if (typeof(x[p]) == 'undefined' || a[p].toString() != x[p].toString()) {
                        return false;
                    }
                    break;
                default:
                    if (a[p] != x[p]) {
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
        if (typeof(a[p]) == 'undefined') {
            return false;
        }
    }

    return true;
}



function isInNestedObject(targetArray, objectKey, objectKeyValue) {
    // This function is for checking for keys in arrays of objects.
    for (var i = 0; i<targetArray.length; i++){
        for (var prop in targetArray[i]){
            if (prop === objectKey && targetArray[i][prop] === objectKeyValue) { return true; }
        }
    }

    return false;
}

function getValueFromNestedObject(targetArray, objectKey) {
    // This function is for checking for keys in arrays of objects.
    for (var i = 0; i<targetArray.length; i++){
        for (var prop in targetArray[i]){
            if (prop === objectKey) { return targetArray[i][prop]; }
        }
    }

    return false;
}


function extend( a, b ) {
    for( var key in b ) {
        if( b.hasOwnProperty( key ) ) {
            a[key] = b[key];
        }
    }
    return a;
}

function notify(text, level){
    level = level || 0;
    if (level >= window.debugLevel) {
        console.log(text);
    }
}

function randomBetween(min,max) {
    return Math.random() * (max - min) + min;
}

$.cssHooks.backgroundColor = {
    get: function(elem) {
        if (elem.currentStyle)
            var bg = elem.currentStyle["backgroundColor"];
        else if (window.getComputedStyle)
            var bg = document.defaultView.getComputedStyle(elem,
                null).getPropertyValue("background-color");
        if (bg.search("rgb") == -1)
            return bg;
        else {
            bg = bg.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            function hex(x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }
            return "#" + hex(bg[1]) + hex(bg[2]) + hex(bg[3]);
        }
    }
}

function modifyColor(hex, lum) {

    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    var rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i*2,2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ("00"+c).substr(c.length);
    }

    return rgb;

}
