  (function() {

    window.debugLevel = 1;
    
    var container = document.getElementById('content');

    // Set up a new session
    window.session = new Session({});

    $('.arrow-next').click(function() {
        session.nextStage();
    });
    $('.arrow-prev').click(function() {
        session.prevStage();
    });
    

    // Set up the main menu
    window.menu = new Menu({});

    function josh() {
      console.log("josh!");
    }

    var settingsMenu = menu.addMenu('Settings','hi-icon-cog');
    menu.addItem(settingsMenu, 'Load Data', 'icon-globe', josh);
    menu.addItem(settingsMenu, 'Reset Application', 'icon-globe', josh);
    menu.addItem(settingsMenu, 'Download Data', 'icon-globe', josh);
    menu.addItem(settingsMenu, 'Sync with Server', 'icon-globe', session.saveData);
    menu.addItem(settingsMenu, 'Global App Settings', 'icon-globe', josh);
  })();

