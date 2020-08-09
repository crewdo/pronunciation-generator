try {
    if (!document.getElementById("bubbble")) {
        var iconUrl = chrome.extension.getURL("content/images/note.png");
        var iconUS = chrome.extension.getURL("content/images/us.png");
        var iconUK = chrome.extension.getURL("content/images/uk.png");
        var elemAbs = document.createElement('div');
        elemAbs.innerHTML =
            '<img class="speaker" data-lang="us" src="' + iconUS + '" width="18px" style="margin-right: 1px">' +
            '<img class="speaker" data-lang="uk" src="' + iconUK + '" width="18px" style="margin-right: 1px">' +
            '<img id="noter" src="' + iconUrl + '" width="18px">';

        elemAbs.id = 'bubbble';
        elemAbs.style.cssText = 'position: absolute; top: -1000px; left: -1000px; z-index: 999999999999; cursor: pointer; font-size: 8px; text-align: center;';
        document.body.appendChild(elemAbs);
    }
    var selectedText = "";
    document.getElementsByTagName('body')[0].addEventListener('click', function (evt) {
        if (evt.target.className === "speaker") {
            fadeOnClick();
            if (selectedText) {
                selectedText = selectedText.trim();
                if (selectedText.split(" ").length === 1) {
                    chrome.runtime.sendMessage(null, {
                        cmd: 'get-word-info',
                        text: selectedText,
                    }, {}, function (rs) {
                        //0 = UK, 1 = US
                        if (rs.audio.length > 0 && rs.audio[0] !== false) {
                            var audioLang = rs.audio[0];
                            if(evt.target.getAttribute('data-lang') === "us" && rs.audio[1] !== false) {
                                 audioLang = rs.audio[1];
                            }

                            var audio = new Audio("https://dictionary.cambridge.org" + audioLang);
                            audio.play();
                            var objectNotification = processCambridgeRegex(stripHtml(rs.data));
                            chrome.runtime.sendMessage(null, objectNotification, {}, function (rs) {
                            });
                        } else {
                            chrome.runtime.sendMessage(null, {cmd: "word-not-found"}, {}, function (rs) {
                            });
                        }
                    });
                }
            }
        }
    });

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
                    updateNoterPosition(oRect.x + oRect.width, oRect.y - 20, selectedText);
                } else {
                    updateNoterPosition(e.pageX, e.pageY - 20, selectedText)
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

    document.getElementById('noter').addEventListener('click', function () {
            fadeOnClick();
            if (selectedText) {
                chrome.storage.sync.get(['group_identifier', 'translate_status', 'service_connector', 'hook_identifier', 'userid_identifier'], function (group) {
                    var err = false;
                    if (group.hasOwnProperty('service_connector')) {
                        if (group.service_connector === "slack" && (!!!group.hook_identifier || !!!group.userid_identifier)) err = true;
                        if (group.service_connector === "skype" && (!!!group.group_identifier)) err = true;
                        if (!err) {
                            chrome.runtime.sendMessage(null, {
                                cmd: 'process-note',
                                groupObj: group,
                                selectedText: selectedText
                            }, {}, function (rs) {
                            });
                        }
                    } else {
                        err = true;
                    }
                    if (err) chrome.runtime.sendMessage(null, {cmd: 'missing-info'}, {}, function (rs) {
                    })
                });
            }
        });

    function stripHtml(html) {
        var tmp = document.createElement("div");
        tmp.innerHTML = html;
        return tmp;
    }

    function processCambridgeRegex(element) {
        console.log(element);
        var theEntries = element.getElementsByClassName('entry-body');
        //If one entry-body found, there is the same word on Cambridge
        if (theEntries.length === 1) {
            return getCambridgeWordInfo(theEntries[0]);
        }
        //else more entries, the result will be simple present word.

        else if (theEntries.length > 1) {

            if (theEntries[0].querySelectorAll('.pron.dpron').length > 0) {
                return getCambridgeWordInfo(theEntries[0]);
            } else {
                return getCambridgeWordInfo(theEntries[1]);
            }
        }
    }

    function getCambridgeWordInfo(entryBodyElement) {
        console.log(entryBodyElement);
        var word = entryBodyElement.querySelectorAll('.headword .hw.dhw')[0].innerHTML || "NULL";
        var type = entryBodyElement.querySelectorAll('.posgram .pos.dpos')[0].innerHTML || null;
        if (type) type = "(" + type + ") ";

        var usPhoneticElem = entryBodyElement.querySelectorAll('.us.dpron-i .pron.dpron')[0];
        var usPhonetic = usPhoneticElem.textContent || usPhoneticElem.innerText || "empty";
        var ukPhoneticElem = entryBodyElement.querySelectorAll('.uk.dpron-i .pron.dpron')[0];
        var ukPhonetic = ukPhoneticElem.textContent || ukPhoneticElem.innerText || "empty";
        var phonetic = "US " + usPhonetic + " - UK " + ukPhonetic;

        return {cmd: 'phonetic-info', word: word, type: type, phonetic: phonetic};
    }

    function updateNoterPosition(x, y, selectedText) {
        showSpeakersButton(1);
        y -= 5;
        let currentScrollTop = document.documentElement.scrollTop;
        y += currentScrollTop;
        var bubble = document.getElementById('bubbble');
        bubble.style.left = x + "px";
        bubble.style.top = y + "px";
        unfade();
        fade();
        var checkText = selectedText.trim();
        if (checkText.split(" ").length !== 1) {
            showSpeakersButton(0);
        }
        return true
    }

    function showSpeakersButton(isShow = 1) {
        var speakers = document.getElementsByClassName('speaker');
        for(var t = 0; t < speakers.length; t++) {
            speakers[t].style.display = isShow ? 'unset' : 'none';
        }
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
        }, (400000));
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
