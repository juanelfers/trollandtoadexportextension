(async function () {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!(currentTab?.url.includes('https://www.trollandtoad.com/cart'))) return;

    document.body.classList.add('show-cart-page');

    const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: getArticles
    });

    const container = document.createElement('div');
    container.setAttribute('id', 'cart');
    container.innerHTML = getTableHTML(result);
    container.style.display = 'none';
    document.body.appendChild(container);
})();

function getArticles() {
    const articles = document.querySelectorAll('.cart-item');
    const productsArray = [];

    articles.forEach((article) => {
        const name = article.querySelector('.item-name').textContent.trim();
        const price = article.querySelector('.font-smaller .sale-price').textContent.trim().replace('.', ',');
        const productLink = article.querySelector('.font-weight-bold .item-name').getAttribute('href');
        const imageUrl = article.querySelector('.product-img-container a img').getAttribute('src');
        const quantity = article.querySelector('.qty-input select').value;

        const productObject = {
            name,
            price,
            quantity,
            productLink: window.location.origin + productLink,
            imageUrl: window.location.origin + imageUrl,
        };

        productsArray.push(productObject);
    });

    return productsArray
}

const getRow = (index) => String.fromCharCode(65 + Math.floor(Math.abs(index)));
const getFormula = index => `=C${index + 2}*D${index + 2}`;
const getTotalFormula = productsLength => `=SUM(E2:E${productsLength + 1})`;
const getProductsBody = products => products.map((product, index) => `
    <tr>
        <td>${product.name}</td>
        <td><a href="${product.productLink}">${product.productLink}</a></td>
        <td>${product.price}</td>
        <td>${product.quantity}</td>
        <td>${getFormula(index)}</td>
    </tr>
`).join('');

const getTableHTML = (products) => `
    <table>
        <thead>
            <tr>
                <th>Carta</th>
                <th>Link</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
            </tr>
        </thead>
        <tbody>
            ${getProductsBody(products)}
            <tr>
                <th>Total</th>
                <th colspan="4">${getTotalFormula(products.length)}</th>
            </tr>
        </tbody>
    </table>
`;

function copy() {
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

async function copyAndOpen() {
    window.open('https://docs.google.com/spreadsheets/u/0/create?usp=sheets_home&ths=true')
    copy();
}

function exportTable() {
    const tabla = document.querySelector('#cart table');
    const libroDeTrabajo = XLSX.utils.book_new();
    const hojaDeCalculo = XLSX.utils.table_to_sheet(tabla);
    XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeCalculo, 'Hoja1');
    XLSX.writeFile(libroDeTrabajo, 'miArchivo.xlsx');
}

function importFromClipboard() {
    const input = window.prompt('Pegar tabla de Excel');
    if (!input) return;

    const data = input.split('\r\n').map(l => {
        const [card, url, price, quantity] = l.split('\t');
        if (!url.match(/http/)) return null;
        return { card, url, price: +price.replace(',', '.'), quantity };
    }).filter(Boolean);

    console.log({ data })

    chrome.tabs.query(
        { active: true, currentWindow: true },
        ([tab]) => navigateCards(tab.id, data, 0)
    );

    document.querySelector('.cart-page').style.display = 'none';
    document.querySelector('.other-page').style.display = 'none';

    const cards = data.map(({card, quantity}) => `
        <div>${card.slice(0, 10).trim()}... x${quantity}: <em>Pendiente</em></div>
    `).join('');

    document.querySelector('.import-progress').innerHTML = cards;
}

const wait = (time = 1000) => new Promise(resolve => setTimeout(resolve, time))

const navigateTo = (tabId, url) => new Promise(resolve => {
    let updated = false;

    chrome.tabs.update(tabId, { url });

    chrome.tabs.onUpdated.addListener((updatedTabId, changeInfo) => {
        if (!updated && updatedTabId === tabId && changeInfo.status === 'complete') {
            updated = true;
            resolve();
        }
    })
})

const handleAddToCart = async (card) => {
    console.log({ card })
    console.log('Adding to cart', document.querySelectorAll('.buyOptionRow').length);

    Array.from(document.querySelectorAll('.buyOptionRow')).find(option => {
        console.log({ option })

        const priceCol = option.querySelector('.priceCol');

        console.log({ priceCol })

        if (!priceCol) return

        const price = +priceCol.textContent.slice(1);

        console.log({ price, cardPrice: card.price });

        if (price !== card.price) return;

        option.querySelector('.qtySelect').value = card.quantity;
        option.querySelector('.cartAdd').click();

        return true;
    })

    console.log('handleAddToCartEnd')

    return true;
};

async function navigateCards(tabId, data, index) {
    if (index >= data.length) {
        navigateTo(tabId, 'https://www.trollandtoad.com/cart')
        return;
    }

    const status = document.querySelectorAll('.import-progress div')[index].querySelector('em');
    status.innerText = 'Agregando...'
    const card = data[index];
    const { url } = card;

    await navigateTo(tabId, url)

    console.log('- Update finished. Waiting', tabId)

    const res = await chrome.scripting.executeScript({
        target: { tabId },
        func: handleAddToCart,
        args: [card]
    });

    await wait(1000);

    status.innerText = 'Listo!'

    console.log({ res });

    navigateCards(tabId, data, index + 1)
}

document.querySelector('.copy-to-clipboard').addEventListener('click', copy);
document.querySelector('.copy-and-open').addEventListener('click', copyAndOpen);
document.querySelectorAll('.import-from-clipboard').forEach(button => button.addEventListener('click', importFromClipboard));
