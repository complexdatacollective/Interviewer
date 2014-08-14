window.debugLevel = 1,

(function () {
    
    var session = new Session({
    	fnBeforeStageChange : function() {
    		return false;
    	},
    	fnAfterStageChange : function() {
    		return false;
    	}
    });
    session.init();

}());

