Point.accountName = "widgitdotcom";
Point.proxyUrl = "/pointcode/point.php";
Point.findContentById = true;
Point.pointEnabledDivId = "pageb2";
Point.pointEnabledDivClass = "point_sym_hover";
Point.useServerProxy = true;
Point.useFlashProxy = true;
Point.flashProxyUrl = "https://pointflash.widgit.com/flash_proxy/proxy/" + Point.accountName;
Point.useCors = true;
Point.corsUrl = "https://point.widgit.com/point.php";
Point.useCloudFrontForSymbols = true;
Point.symbolSize = 80;
Point.maxSymbols = 4;
Point.httpsImageUrls = false;
Point.enableImmediately = true;
Point.cacheTooltips = true;
Point.cacheExpiry = 86400000;
Point.enabledPointImage = "/pointcode/buttons/light_background/on.gif";
Point.disabledPointImage = "/pointcode/buttons/light_background/off.gif";
Point.waitIconImage = "/pointcode/point_waiticon.gif";
Point.blacklistedElements = ["applet", "button", "canvas", "embed", "iframe", "img", "input", "map", "object", "script", "select", "style", "table", "tbody", "textarea", "tfoot", "thead", "title", "tr"];
Point.blacklistedWords = ["a", "the", "an", "if", "then", "but", "because", "therefore", "of", "so", "than", "though", "would", "wouldn't"];
Point.blacklistedClasses = ["connected-carousels", "quoterotate"];
Point.defaultLanguage = "English_UK";
Point.languageCssClasses = {
    "point_english_uk": "English_UK",
    "point_czech": "Czech",
    "point_danish": "Danish",
    "point_dutch": "Dutch",
    "point_english_us": "English_US",
    "point_finnish": "Finnish",
    "point_french": "French",
    "point_greek": "Greek",
    "point_italian": "Italian",
    "point_norwegian": "Norwegian",
    "point_polish": "Polish",
    "point_portuguese": "Portuguese",
    "point_spanish": "Spanish",
    "point_swedish": "Swedish"
};
Point.hoverTimeout = 200;
Point.spansInheritParentStyles = false;
Point.symboliseContext = true;
Point.symboliseIdioms = true;
