/*jshint unused:false*/
/* global Storage, debugLevel */
/*jshint bitwise: false*/

"use strict";

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

function modifyColor(col, amt) {
  
    var usePound = false;
  
    if (col[0] === "#") {
        col = col.slice(1);
        usePound = true;
    }
 
    var num = parseInt(col,16);
 
    var r = (num >> 16) + amt;
 
    if (r > 255) {r = 255;}
    else if  (r < 0) {r = 0;}
 
    var b = ((num >> 8) & 0x00FF) + amt;
 
    if (b > 255) {b = 255;}
    else if  (b < 0) {b = 0;}
 
    var g = (num & 0x0000FF) + amt;
 
    if (g > 255) {g = 255;}
    else if (g < 0) {g = 0;}
 
    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
  
}
