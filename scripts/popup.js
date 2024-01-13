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
    const table = document.querySelector('#cart table');
    const workBook = XLSX.utils.book_new();

    // Obtener los datos como una matriz de arreglos (AOA)
    const aoa = [];
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
        const rowData = [];
        const cells = row.querySelectorAll('td');

        cells.forEach(cell => {
            rowData.push(cell.textContent);
        });

        aoa.push(rowData);
    });

    // Crear hoja de cálculo y agregar datos
    const sheet = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(workBook, sheet, 'Troll&Toad');

    // Escribir el archivo
    XLSX.writeFile(workBook, 'TrollAndToad.xlsx');
}

function importFromClipboard() {
    const input = window.prompt('Pegar tabla de Excel');
    if (!input) return;

    const lineSplit = input.match('\r') ? '\r\n' : '\n';
    const data = input.split(lineSplit).map(l => {
        const [name, url, price, quantity] = l.split('\t');
        if (!url.match(/http/)) return null;
        return { name, url, price: +price.replace(',', '.'), quantity };
    }).filter(Boolean);

    chrome.tabs.query(
        { active: true, currentWindow: true },
        ([tab]) => navigateCards(tab.id, data, 0)
    );

    document.querySelector('.cart-page').style.display = 'none';
    document.querySelector('.other-page').style.display = 'none';

    const cards = data.map(({ name, quantity }) => `
        <div class="card-progress">${name.slice(0, 10).trim()}... x${quantity}: <span class="card-status">Pendiente</span></div>
    `).join('');


    document.querySelector('.import-page').classList.remove('hidden');
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
    let response = {
        success: false
    };

    const optionRows = Array.from(document.querySelectorAll('.buyOptionRow'));

    optionRows.find(option => {
        const priceCol = option.querySelector('.priceCol');

        if (!priceCol) return

        const price = +priceCol.textContent.slice(1);

        if (price !== card.price) return;

        option.querySelector('.qtySelect').value = card.quantity;
        option.querySelector('.cartAdd').click();

        response = {
            success: true
        };

        return true;
    });

    return response;
};

const updateCard = (index) => {
    const card = document.querySelectorAll('.import-progress div')[index];
    const status = card.querySelector('span');
    status.innerText = 'Agregando...'

    return {
        success: (cards, index) => {
            status.innerText = 'Listo!'
            card.classList.add('success');
            document.querySelector('.progress').style.width = `${parseInt((index + 1) / cards.length * 100)}%`;
        },
        error: (errMsg) => {
            status.innerText = 'Sin stock'
            card.classList.add('error');
        }
    }
}

function end(tabId, cards) {
    navigateTo(tabId, 'https://www.trollandtoad.com/cart');

    const total = cards.length;
    const missing = cards.filter(card => card.error);
    const errorTotal = missing.length;
    const successTotal = total - errorTotal;
    const summary = `
        <h4>Resumen:</h4>
        ${successTotal}/${total} agregados
        ${errorTotal && (`
            <h5>Faltantes</h5>
            ${missing.map(card => `
                <div>${card.name.slice(0, 15).trim()}... ${card.quantity} x $${card.price}</div>
            `)}
        `)}
    `;
    document.querySelector('.summary').innerHTML = summary;
}

document.addEventListener('click', event => {
    const { target } = event
    if (target?.tagName.toLowerCase() === 'a') {
        chrome.tabs.create({ url: target.getAttribute('href') });
    }
});

async function navigateCards(tabId, data, index) {
    if (index >= data.length) return end(tabId, data);

    const update = updateCard(index);
    const card = data[index];
    const { url } = card;

    await navigateTo(tabId, url)
    await wait();

    const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId },
        func: handleAddToCart,
        args: [card]
    });

    if (result.success) {
        await wait();
        update.success(data, index);
    } else {
        data[index].error = true;
        update.error();
    }

    navigateCards(tabId, data, index + 1)
}

document.querySelector('.copy-to-clipboard').addEventListener('click', copy);
document.querySelector('.copy-and-open').addEventListener('click', copyAndOpen);
document.querySelectorAll('.import-from-clipboard').forEach(button => button.addEventListener('click', importFromClipboard));
