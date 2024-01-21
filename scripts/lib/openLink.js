document.addEventListener('click', event => {
    const { target } = event
    if (target?.tagName.toLowerCase() === 'a') {
        chrome.tabs.create({ url: target.getAttribute('href') });
    }
});