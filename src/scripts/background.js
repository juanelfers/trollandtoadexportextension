chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed or updated to version ' + chrome.runtime.getManifest().version);
});

chrome.runtime.requestUpdateCheck((status, details) => {
    if (status == 'update_available') {
        console.log('Update available: ' + details.version);
        chrome.runtime.reload();
    } else if (status == 'no_update') {
        console.log('No update found');
    } else if (status == 'throttled') {
        console.log('Update check too frequently - back off.');
    }
});
