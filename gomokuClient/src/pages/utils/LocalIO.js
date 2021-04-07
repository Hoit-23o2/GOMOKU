
//const myStorage = window.localStorage;
const KEY_USERNAME = 'username';
const KEY_PASSWORD = 'password';
const KEY_ISLOGIN = 'islogin'

function GetItem(key) {
    return localStorage.getItem(key);
}

function SetItem(key, value){
    localStorage.setItem(key, value);
}

function ClearItems() {
    localStorage.clear();
}

function RemoveItem(key) {
    localStorage.removeItem(key);
}


export {
    KEY_USERNAME,
    KEY_PASSWORD,
    KEY_ISLOGIN,
    GetItem, 
    SetItem, 
    ClearItems,
    RemoveItem,
}