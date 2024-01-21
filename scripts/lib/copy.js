export function copy() {
    const container = document.querySelector('#cart');
    container.style.display = 'block';
    const selectionRange = document.createRange();
    selectionRange.selectNode(container);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(selectionRange);

    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    container.style.display = 'none';

    window.close();
}
