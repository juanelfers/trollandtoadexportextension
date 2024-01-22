export const navigateTo = (tabId, url) => new Promise(resolve => {
    let updated = false;

    chrome.tabs.update(tabId, { url });

    chrome.tabs.onUpdated.addListener((updatedTabId, changeInfo) => {
        if (!updated && updatedTabId === tabId && changeInfo.status === 'complete') {
            updated = true;
            resolve();
        }
    })
})