chrome.browserAction.onClicked.addListener(function(tab) {
    var w = 500;
    var h = 500;
    var left = (screen.width/2)-(w/2);
    var top = (screen.height/2)-(h/2);
    chrome.windows.create({
        url: chrome.runtime.getURL("popup.html"),
        type: "popup",
        height: h,
        width:w,
        top: top,
        left: left,

    }, function(win) {
        // win represents the Window object from windows API

    });
});