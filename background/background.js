// chrome.browserAction.onClicked.addListener(function(tab) {
//     var w = 500;
//     var h = 430;
//     var left = (screen.width/2)-(w/2);
//     var top = (screen.height/2)-(h/2);
//     chrome.windows.create({
//         url: chrome.runtime.getURL("popup.html"),
//         type: "popup",
//         height: h,
//         width:w,
//         top: top,
//         left: left,
//
//     }, function(win) {
//         // win represents the Window object from windows API
//
//     });
// });

chrome.runtime.onMessage.addListener(function(message, sender, callback) {
    if(message === 'missing-info'){
        var icon = chrome.extension.getURL("content/images/noter.png");
        chrome.notifications.create(null,
            {
                type: "basic",
                iconUrl: icon,
                title: chrome.i18n.getMessage("appName"),
                message: "Error: You have to set your Conversation ID"
            }, function () {});

        Promise.resolve("").then(result => callback(result));
        return true;

    }
});
