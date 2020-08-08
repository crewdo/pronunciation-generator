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
function gettingWordInfo(word) {
    var url = "https://dictionary.cambridge.org/dictionary/english/" + word;
    return new Promise(function (resolve) {
        fetch(url).then(function (e) {
            return e.text()
        }).then(function (html) {
            var infoPart = findHeadText(html, '<div class="di-body">', '</div><small class="');
            var audioUK = findHeadText(infoPart, '<source type="audio/mpeg" src="', '"/>');
            var audioUS = findSecondText(infoPart, '<source type="audio/mpeg" src="', '"/>');
            resolve({data: infoPart, audio: [audioUK, audioUS]})
        })
    })
}

function findHeadText(fullText, find, tailOfFind) {
    try {
        return fullText.split(find)[1].split(tailOfFind)[0]
    } catch (err) {
        return false
    }
}
function findSecondText(fullText, find, tailOfFind) {
    try {
        return fullText.split(find)[2].split(tailOfFind)[0]
    } catch (err) {
        return false
    }
}


chrome.runtime.onMessage.addListener(function(message, sender, callback) {
    var icon = chrome.extension.getURL("content/images/noter.png");
    var cmd = message.cmd.toLowerCase();
    if(cmd === 'missing-info'){
        chrome.notifications.create(null,
            {
                type: "basic",
                iconUrl: icon,
                title: chrome.i18n.getMessage("appName"),
                message: "Error: You have to configure your settings."
            }, function (id) {
                var timer = setTimeout(function(){chrome.notifications.clear(id);}, 1600);
            });
        Promise.resolve("").then(result => callback(result));
    }
    else if(cmd === 'phonetic-info') {
        if(message.hasOwnProperty('phonetic') && message.hasOwnProperty('type')) {
            chrome.notifications.create(null,
                {
                    type: "basic",
                    iconUrl: icon,
                    title: chrome.i18n.getMessage("appName"),
                    message: message.word + "\n" + message.type + ": "  + message.phonetic
                }, function () {});
        }
        Promise.resolve("").then(result => callback(result));
    }
    else if(cmd === "get-word-info"){
        if(message.hasOwnProperty('text')) {
            gettingWordInfo(message.text).then(function (wordInfoObject) {
                callback(wordInfoObject);
            });
        }
    }
    else if(cmd === "process-note"){
        if(message.hasOwnProperty('groupObj')) {
            var formData = new FormData();
            formData.append('message', message.selectedText);
            formData.append('service_connector', message.groupObj.service_connector);
            formData.append('translate_status', !!message.groupObj.translate_status);
            if(message.groupObj.service_connector === 'skype') {
                formData.append('group_identifier', message.groupObj.group_identifier);
            }
            else {
                formData.append('hook_identifier', message.groupObj.hook_identifier);
                formData.append('userid_identifier', message.groupObj.userid_identifier);
            }
            fetch('https://maximal-reserve-277114.ts.r.appspot.com/', {
                method: 'POST',
                body: formData
            }).then(function (rs) {
                callback(rs);
            });
        }
    }
    else if(cmd === "word-not-found") {
        chrome.notifications.create(null,
            {
                type: "basic",
                iconUrl: icon,
                title: chrome.i18n.getMessage("appName"),
                message: "The word you selected was not found."
            }, function (id) {
                var timer = setTimeout(function(){chrome.notifications.clear(id);}, 1600);
            });
        Promise.resolve("").then(result => callback(result));
    }

    else if(cmd === "setting-saved") {
        chrome.notifications.create(null,
            {
                type: "basic",
                iconUrl: icon,
                title: chrome.i18n.getMessage("appName"),
                message: "Your setting was saved."
            }, function (id) {
                var timer = setTimeout(function(){chrome.notifications.clear(id);}, 1600);
            });
        Promise.resolve("").then(result => callback(result));
    }
    return true;
});

