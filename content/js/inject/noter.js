try {

    if (!document.getElementById("bubbble")) {
        var iconUrl = chrome.extension.getURL("content/images/noter.png");
        var elemAbs = document.createElement('div');
        elemAbs.innerHTML = '<img src="' + iconUrl + '" width="20px">';
        elemAbs.id = 'bubbble';
        elemAbs.style.cssText = 'background: white; border-radius: 56px;height: 21px; width: 23px; position: absolute; top: -1000px; left: -1000px; z-index: 9999999999999; cursor: pointer; font-size: 8px; text-align: center';
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
    document.getElementById('bubbble').addEventListener('click', function (e) {
        fadeOnClick();
        if (selectedText) {
            chrome.storage.sync.get(['group_identifier', 'translate_status', 'service_connector', 'hook_identifier', 'userid_identifier'], function (group) {
                if(group.hasOwnProperty('service_connector')) {
                    chrome.runtime.sendMessage(null, 'missing-info', {}, function (rs) {});
                    var formData = new FormData();
                    formData.append('message', selectedText);
                    formData.append('service_connector', group.service_connector);
                    formData.append('translate_status', !!group.translate_status);
                    if(group.service_connector === 'skype') {
                        formData.append('group_identifier', group.group_identifier);
                    }
                    else {
                        formData.append('hook_identifier', group.hook_identifier);
                        formData.append('userid_identifier', group.userid_identifier);
                    }
                    fetch('https://maximal-reserve-277114.ts.r.appspot.com/', {
                        method: 'POST',
                        body: formData
                    }).then(function (rs) {
                    });
                }
                else {
                    chrome.runtime.sendMessage(null, 'missing-info', {}, function (rs) {})
                }
            });
        }
    });

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
