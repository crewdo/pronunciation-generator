try {

    if (!document.getElementById("bubbble")) {
        var iconUrl = chrome.extension.getURL("content/images/noter.png");
        var iconSpeakerUrl = chrome.extension.getURL("content/images/speaker.png");
        var elemAbs = document.createElement('div');
        elemAbs.innerHTML = '<img style="margin-right: 4px" id="noter" src="' + iconUrl + '" width="20px">' +
            '<img id="speaker" src="' + iconSpeakerUrl + '" width="20px">';

        elemAbs.id = 'bubbble';
        elemAbs.style.cssText = 'background: white; border-radius: 56px;height: 21px; width: 50px; position: absolute; top: -1000px; left: -1000px; z-index: 9999999999999; cursor: pointer; font-size: 8px; text-align: center';
        document.body.appendChild(elemAbs);
    }

    var selectedText = "";
    document.getElementsByTagName('body')[0].addEventListener('click', function (e) {
        s = window.getSelection();
        if (!s.toString()) {
            fadeOnClick();
        }
    });

    document.getElementsByTagName('body')[0].addEventListener('mouseup', function (e) {
        s = window.getSelection();
        if (s && s.rangeCount > 0) {
            var oRange = s.getRangeAt(0);
            var oRect = oRange.getBoundingClientRect();
            if (s.toString()) {
                selectedText = s.toString();
                if (oRect.x !== 0 && oRect.y !== 0) {
                    updateNoterPosition(oRect.x + oRect.width, oRect.y - 20);
                } else {
                    updateNoterPosition(e.pageX, e.pageY - 20)
                }
            }

        }
    });

    document.getElementById('bubbble').addEventListener('mouseover', function (e) {
        unfade();
    });
    document.getElementById('bubbble').addEventListener('mouseout', function (e) {
        fade();
    });
    document.getElementById('noter').addEventListener('click', function (e) {
        fadeOnClick();
        if (selectedText) {
            chrome.storage.sync.get(['group_identifier', 'translate_status', 'service_connector', 'hook_identifier', 'userid_identifier'], function (group) {
                var err = false;
                if(group.hasOwnProperty('service_connector')) {
                    if(group.service_connector === "slack" && (!!!group.hook_identifier || !!!group.userid_identifier) ) err = true;
                    if(group.service_connector === "skype" && (!!!group.group_identifier) ) err = true;
                    if(!err) {
                        chrome.runtime.sendMessage(null, {
                            cmd: 'process-note',
                            groupObj: group,
                            selectedText : selectedText
                        }, {}, function (rs) {
                        });
                    }
                }
                else {
                    err = true;
                }

                if(err) chrome.runtime.sendMessage(null, {cmd : 'missing-info'}, {}, function (rs) {})
            });
        }
    });

    document.getElementById('speaker').addEventListener('click', function (e) {
        fadeOnClick();
        if (selectedText) {
            selectedText = selectedText.trim();
            if(selectedText.split(" ").length === 1) {
                chrome.runtime.sendMessage(null, {
                    cmd: 'get-word-info',
                    text: selectedText,
                }, {}, function (rs) {
                    //infoPart here
                    //0 = UK, 1 = US
                    if(rs.audio.length > 0 && rs.audio[0] !== false) {
                        var audio = new Audio("https://dictionary.cambridge.org" + rs.audio[1]);
                        audio.play();
                        var objectNotification = processRegex(stripHtml(rs.data));
                        chrome.runtime.sendMessage(null, objectNotification, {}, function (rs) {});
                    }
                    else {
                        chrome.runtime.sendMessage(null, {cmd: "word-not-found"}, {}, function (rs) {});
                    }

                });
            }
        }
    });

    function stripHtml(html)
    {
        var tmp = document.createElement("div");
        tmp.innerHTML = html;
        return tmp;
    }

    function processRegex(element) {

        return {cmd : 'phonetic-info', word: selectedText, type: "verb", 'phonetic' : '/asdasd/'};
    }


    function updateNoterPosition(x, y) {
        y -= 10;
        let currentScrollTop = document.documentElement.scrollTop;
        y += currentScrollTop;
        var bubble = document.getElementById('bubbble');
        bubble.style.left = x + "px";
        bubble.style.top = y + "px";
        unfade();
        fade();
        return true
    }

    function fadeOnClick() {
        var bubble = document.getElementById('bubbble');
        if (bubble) {
            bubble.style.opacity = 0;
            bubble.style.left = '-1000px';
            bubble.style.top = '-1000px';
        }
    }

    function fade() {
        unfade();
        setTimeout(function () {
            var bubble = document.getElementById('bubbble');
            if (bubble) {
                bubble.style.opacity = 0;
                bubble.style.transition = 'visibility 2s, opacity 2s linear';
                bubble.addEventListener('transitionend', function () {
                    bubble.style.left = '-1000px';
                    bubble.style.top = '-1000px';
                }, false);
            }
        }, (4000));
    }

    function unfade() {
        if (document.getElementById("bubbble")) {
            document.getElementById("bubbble").style.opacity = 0;
            var bubble = document.getElementById('bubbble');
            if (bubble) {
                bubble.style.opacity = 1;
                bubble.style.transition = '';
            }
        }
    }
} catch (e) {
}
