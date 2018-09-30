const tokenKey = 'english_essence_token';
const appURL = 'http://english-essence.herokuapp.com';

const MAIN_MENU = 'main-menu';
const ADD_TO_PL_MENU = 'add-to-pl-menu';
const ADD_TO_EN_MENU = 'add-to-en-menu';

const ADD_WORD_NOTIFICATION = 'add-word-notification';
const PLEASE_LOGIN_NOTIFICATION = 'please-login-notification';
const BAD_CREDENTIALS_NOTIFICATION = 'bad-credentials-notification';

const INVALID_TOKEN = {
    title: 'invalid-token-notification',
    text: 'Something went wrong with your request. Please try login again'
};

const TOKEN_EXPIRED = {
    title: 'expired-token-notification',
    text: 'Your session expired. Please login again'
};

const SOMETHING_WENT_WRONG = {
    title: 'something-went-wrong-notification',
    text: 'Sorry, something went wrong. Please try again later '
};

const TOKEN_KEY = 'english_essence_token';

const getBasicNotificationParams = function (message) {
    return {
        type: 'basic',
        iconUrl: './images/e-logo.png',
        title: 'English-essence',
        message: message
    }
};

const parentContextMenu = {id: MAIN_MENU, title: 'English-essence', contexts: ['selection']};
const addToPolishDictionaryItem = {
    id: ADD_TO_PL_MENU,
    title: 'Add to PL dictionary',
    contexts: ['selection'],
    parentId: MAIN_MENU
};
const addToEnglishDictionaryItem = {
    id: ADD_TO_EN_MENU,
    title: 'Add to EN dictionary',
    contexts: ['selection'],
    parentId: MAIN_MENU
};

function getToken() {
    return localStorage.getItem(TOKEN_KEY)
}

function storeToken(token) {
    localStorage.setItem(tokenKey, token);
}

function removeToken() {
    localStorage.removeItem(tokenKey)
}

function createNotification(name, params) {
    chrome.notifications.create(name, params);
}

function addWordRequest(params = null, isAfterRefreshRequest = false) {
    const method = 'POST';
    const url = appURL + '/api/words';
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + getToken());
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const response = JSON.parse(xhr.response);
            createNotification(ADD_WORD_NOTIFICATION, getBasicNotificationParams(response.message))
        } else if ((xhr.readyState === 4 && xhr.status === 400) || isAfterRefreshRequest) {
            removeToken();
            createNotification(INVALID_TOKEN.title, getBasicNotificationParams(INVALID_TOKEN.text))
        } else if (xhr.readyState === 4 && xhr.status === 401) {
            refreshTokenRequest()
                .then(function () {
                    addWordRequest(params, true);
                })
                .catch(function(notification){
                    createNotification(notification.title, getBasicNotificationParams(notification.text))
                });
        }
    };
    xhr.send(JSON.stringify(params));
}

function refreshTokenRequest() {
    return new Promise(function(resolve, reject){
        const method = 'GET';
        const url = appURL + '/api/auth/refresh';
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('Authorization', 'Bearer ' + getToken());
        xhr.onload = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const newToken = xhr.getResponseHeader('Authorization');
                if (newToken) {
                    storeToken(newToken);
                    resolve();
                }
            } else if (xhr.readyState === 4) {
                removeToken();
                resolve(TOKEN_EXPIRED);
            } else {
                reject(SOMETHING_WENT_WRONG);
            }
        };
        xhr.onerror = function () {
          reject(SOMETHING_WENT_WRONG)
        };
        xhr.send();
    });
}

chrome.contextMenus.create(parentContextMenu);
chrome.contextMenus.create(addToPolishDictionaryItem);
chrome.contextMenus.create(addToEnglishDictionaryItem);

chrome.contextMenus.onClicked.addListener(function (data) {
    if (!getToken() && data.selectionText) {
        chrome.notifications.create(PLEASE_LOGIN_NOTIFICATION, getBasicNotificationParams('Please login first'));
        return false;
    }
    const params = {
        body: data.selectionText.trim().toLowerCase()
    };
    if (data.menuItemId === ADD_TO_PL_MENU && data.selectionText) {
        Object.assign(params, {
            language: 'pl'
        });
        addWordRequest(params);
        return false;
    }
    if (data.menuItemId === ADD_TO_EN_MENU && data.selectionText) {
        Object.assign(params, {
            language: 'en'
        });
        addWordRequest(params);
        return false;
    }
});