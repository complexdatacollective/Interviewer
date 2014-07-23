/*jshint unused:false*/
/* global Storage */
/*jshint bitwise: false*/

"use strict";

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
