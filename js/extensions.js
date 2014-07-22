/*global Storage*/
(function(){
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

})();