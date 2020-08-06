function saveSkypeChanges() {

    var conversationId = document.getElementById('group_identifier').value;
    if (!conversationId) {
        alert('Error: No value of conversation ID specified');
        return;
    }
    if (conversationId.indexOf('@thread.skype') === -1) {
        alert('Error: Conversation ID must contains "@thread.skype"');
        return;
    }
    sync({
        'service_connector': 'skype',
        'group_identifier': conversationId,
        'translate_status' : !!document.getElementById('translate_status').checked,
    });
}

function saveSlackChanges() {
    var slackHook = document.getElementById('hook_identifier').value;
    var slackUserID = document.getElementById('userid_identifier').value;

    if (!slackHook || !slackUserID) {
        alert('Error: Incoming webhook & Slack member ID are required');
        return;
    }
    sync({
        'service_connector': 'slack',
        'hook_identifier': slackHook,
        'userid_identifier': slackUserID,
        'translate_status' : !!document.getElementById('translate_status').checked,
    });
}

function sync(data) {
    chrome.storage.sync.set(data, function() {
        alert('Settings saved');
    });
}

document.getElementById('saveSetting').addEventListener('click', function () {
    var connector = document.getElementById('service_connector').value;
    connector === 'skype' ? saveSkypeChanges() : saveSlackChanges();
});

function hideConnector() {
    var ele = document.getElementsByClassName('connector-container');
    for (var i = 0; i < ele.length; i++ ) {
        ele[i].style.display = "none";
    }
}
document.getElementById('service_connector').addEventListener('change', function () {
    hideConnector();
    document.getElementsByClassName(this.value + '-connector')[0].style.display = 'block'
});

chrome.storage.sync.get(['group_identifier','translate_status', 'service_connector', 'userid_identifier', 'hook_identifier'], function (group) {
    if(group.hasOwnProperty('group_identifier')) {
        document.getElementById('group_identifier').value = group.group_identifier;
    }
    if(group.hasOwnProperty('translate_status')) {
        document.getElementById('translate_status').checked = group.translate_status;
    }
    if(group.hasOwnProperty('service_connector')) {
        var connnector = document.getElementById('service_connector');
        connnector.value = group.service_connector;
        connnector.dispatchEvent(new Event('change'));
    }
    if(group.hasOwnProperty('userid_identifier')) {
        document.getElementById('userid_identifier').value = group.userid_identifier;
    }
    if(group.hasOwnProperty('hook_identifier')) {
        document.getElementById('hook_identifier').value = group.hook_identifier;
    }
});