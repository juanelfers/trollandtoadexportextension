export function bindEvents({ copy, copyAndOpen, importFromClipboard }) {
    const buttons = [
        // Copy
        {
            elem: document.querySelector('.copy-to-clipboard'),
            onClick: copy
        },
        // CopyAndOpen
        {
            elem: document.querySelector('.copy-and-open'),
            onClick: copyAndOpen
        },
        // Import
        {
            elem: document.querySelectorAll('.import-from-clipboard'),
            onClick: importFromClipboard
        }
    ];

    buttons.forEach(({ elem, onClick }) => {
        if (elem.length === undefined) elem = [elem];

        elem.forEach(button => button.addEventListener('click', onClick));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a');

    links.forEach(link => {
        link.addEventListener('click', () => chrome.tabs.create({ url: link.href }));
    });
});