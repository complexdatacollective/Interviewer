  (function() {
    // Set the global debug level
    window.debugLevel = 1;

    // Initialise the menu system – other modules depend on it being there.
    window.menu = new Menu({});

    // Set up a new session
    window.session = new Session({});
    window.sessionData = session.registerData('session'); //create a data store for this session
    
    // Create a log
    window.eventLog = new Logger();

    // Add the start date to the session.
    var now = new Date();
    var month = now.getUTCMonth()+1;
    var day = now.getUTCDate()+1;
    var year = now.getUTCFullYear();

    var thisSession = {
        int_sdate: year + "/" + month + "/" + day,
        int_stime: now.getTime()
    }

    session.addData('session', thisSession);

    // Build a new network
    window.network = new Network();

    $('.arrow-next').click(function() {
        session.nextStage();
    });
    $('.arrow-prev').click(function() {
        session.prevStage();
    });


  })();

