document.addEventListener('DOMContentLoaded', function () {
    // Variables
    const contentWrapper = document.getElementById('ee-extension-content');
    const closeButton = document.getElementById('ee-close-button');
    const loginBtnId = 'login-btn';
    const logoutBtnId = 'logout-btn';
    const emailFieldId = 'email';
    const passwordFieldId = 'password';
    const registerLink = 'register-link';

    const tokenKey = 'english_essence_token';
    const appURL = 'http://172.19.0.6';

    const logoutView = '<div id="ee-form-title"><p>You are login. Simply select word, right click on it and add to your dictionary.</p></div>' +
        '<button id="logout-btn">Logout</button>';

    const loginView = '<div id="ee-form-title"><p>Please login in or create account <a href=\' + appURL + \'/register id="register-link">Register</a></p>' +
        '<form action="">' +
        '<input type="email" id="email" name="email" placeholder="email">' +
        '<input type="password" id="password" name="password" placeholder="password">' +
        '<button id="login-btn">Login</button>' +
        '</form>' +
        '</div>';
    const LOGIN_NOTIFICATION = 'login-notification';
    const LOGOUT_NOTIFICATION = 'logout-notification';
    const BAD_CREDENTIALS_NOTIFICATION = 'bad-credentials-notification';
    const loginNotificationParams = {
        type: 'basic',
        iconUrl: './images/e-logo.png',
        title: 'English-essence',
        message: 'Successfully login to application :)'
    };
    const logoutNotificationParams = {
        type: 'basic',
        iconUrl: './images/e-logo.png',
        title: 'English-essence',
        message: 'Successfully logout from application. Thanks for use!'
    };
    const badCredentialsNotificationParams = {
        type: 'basic',
        iconUrl: './images/e-logo.png',
        title: 'English-essence',
        message: 'Sorry! It looks like you have entered invalid credentials'
    };

    //App init
    initView();
    closeButton.addEventListener('click', function () {
        window.close();
    });

    // Functions

    function initView() {
        let view = loginView;
        if (isTokenSet()) {
            view = logoutView;
        }
        contentWrapper.innerHTML = view;
    }

    function isTokenSet() {
        return localStorage.getItem(tokenKey);
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

    function APIRequest(method, url, params = null, callbackSuccess) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const response = JSON.parse(xhr.response);
                callbackSuccess(response);
            } else if (xhr.readyState === 4 && xhr.status === 401) {
                createNotification(BAD_CREDENTIALS_NOTIFICATION, badCredentialsNotificationParams);
            }
        };
        xhr.send(JSON.stringify(params));
    }

    // Event listeners

    document.getElementById('ee-extension-content').addEventListener('click', function (event) {
        if (event.target && event.target.id === loginBtnId) {
            event.preventDefault();
            const method = 'POST';
            const url = 'http://172.20.1.1/api/auth/login';
            const params = {
                email: document.getElementById(emailFieldId).value,
                password: document.getElementById(passwordFieldId).value
            };
            const callbackSuccess = function (response) {
                storeToken(response.token);
                initView();
                createNotification(LOGIN_NOTIFICATION, loginNotificationParams)
            };
            APIRequest(method, url, params, callbackSuccess)
        } else if (event.target && event.target.id === logoutBtnId) {
            alert('invalidate token request should be here');
            removeToken();
            initView();
            createNotification(LOGOUT_NOTIFICATION, logoutNotificationParams)
        } else if (event.target && event.target.id === registerLink) {
            chrome.tabs.create({active: true, url: appURL + '/register'})
        }
    });
});