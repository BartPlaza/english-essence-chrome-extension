const MAIN_MENU = 'main-menu';
const ADD_TO_PL_MENU = 'add-to-pl-menu';
const ADD_TO_EN_MENU = 'add-to-en-menu';
const ADD_TO_BOTH_MENU = 'add-to-both-menu';

const ADD_WORD_NOTIFICATION = 'add-word-notification';
const PLEASE_LOGIN_NOTIFICATION = 'please-login-notification';

const addWordNotificationParams = {
    type: 'basic',
    iconUrl: './images/e-logo.png',
    title: 'English-essence',
    message: 'Word successfully added :)'
};
const pleaseLoginNotificationParams = {
    type: 'basic',
    iconUrl: './images/e-logo.png',
    title: 'English-essence',
    message: 'Please login first!'
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
const addToBothDictionariesItem = {
    id: ADD_TO_BOTH_MENU,
    title: 'Add to BOTH dictionaries',
    contexts: ['selection'],
    parentId: MAIN_MENU
};

const tokenKey = 'english_essence_token';

function isTokenSet() {
    return localStorage.getItem(tokenKey)
}

chrome.contextMenus.create(parentContextMenu);
chrome.contextMenus.create(addToPolishDictionaryItem);
chrome.contextMenus.create(addToEnglishDictionaryItem);
chrome.contextMenus.create(addToBothDictionariesItem);

chrome.contextMenus.onClicked.addListener(function (data) {
    if (!isTokenSet() && data.selectionText) {
        chrome.notifications.create(PLEASE_LOGIN_NOTIFICATION, pleaseLoginNotificationParams);
        return false;
    }
    if (data.menuItemId === ADD_TO_PL_MENU && data.selectionText) {
        chrome.notifications.create(ADD_WORD_NOTIFICATION, addWordNotificationParams);
    }
});