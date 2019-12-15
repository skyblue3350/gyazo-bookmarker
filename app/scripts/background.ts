import "semantic-ui-css/semantic.min.css";
import {saveImage, isGyazoImageURL} from './utils'

const loadLocalStorageData = () => {
    let data = [];
    if (typeof localStorage['url'] != 'undefined') {
        data = JSON.parse(localStorage['url'])
    }
    return data
}



const updateBadge = () => {
    chrome.browserAction.setBadgeText({
        text: String(loadLocalStorageData().length)
    })
}



chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
    const url = tab.url

    // for undefined
    if (url == undefined) {
        return
    }

    // not gyazo image url (ex: userpage etc...)
    if (!isGyazoImageURL(url)) {
        return
    }

    saveImage(url)
})