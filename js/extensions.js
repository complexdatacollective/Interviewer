/*global Storage*/
(function(){
    "use strict";

    function notify(text, level){
        level = level || 0;
        var settings = settings || {};

        if (level >= settings.debugLevel) {
            console.log(text);
        }
    }

    Storage.prototype.setObject = function(key, value) {
        this.setItem(key, JSON.stringify(value));
    };

    Storage.prototype.getObject = function(key) {
        if (this.getItem(key) === null) {
            notify('Key not found in localStorage. Returning false.');
            return false;
        } else {
            notify('Key found in localStorage. Returning.');
            var value = this.getItem(key);
            return value && JSON.parse(value);            
        }
    };

})();