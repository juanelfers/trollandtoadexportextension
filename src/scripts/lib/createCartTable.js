export const wait = (time = 1000) => new Promise(resolve => setTimeout(resolve, time))

function getArticles(page = 'tcgplayer') {
    const selectors = {
        trolltoad: {
            item: '.cart-item',
            name: '.item-name',
            price: '.font-smaller .sale-price',
            productLink: '.font-weight-bold .item-name',
            imageUrl: '.product-img-container a img',
            quantity: '.qty-input select',
        },
        tcgplayer: {
            item: '.package-item',
            name: '.name',
            price: '.price',
            productLink: '.expanded-details a',
            imageUrl: '.image-wrapper img',
            quantity: '.mp-select select',
        }
    };

    const selector = selectors[page];
    const articles = document.querySelectorAll(selector.item);
    const productsArray = [];

    articles.forEach((article) => {
        const name = article.querySelector(selector.name).textContent.trim();
        const price = article.querySelector(selector.price).textContent.trim().replace('.', ',').replace('$', '');
        const productLink = article.querySelector(selector.productLink).getAttribute('href');
        const imageUrl = article.querySelector(selector.imageUrl).getAttribute('src');
        const quantity = article.querySelector(selector.quantity).value;

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

export const createCartTable = async function () {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!currentTab) return;

    const carts = {
        trolltoad: 'https://www.trollandtoad.com/cart',
        tcgplayer: 'https://www.tcgplayer.com/cart',
    };

    const [platform] = Object.entries(carts).find(([_, url]) => currentTab.url.includes(url))

    if (!platform) return;

    document.body.classList.add('show-cart-page');

    const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: getArticles,
        args : [platform],
    });

    const container = document.createElement('div');
    container.setAttribute('id', 'cart');
    container.innerHTML = getTableHTML(result);
    container.style.display = 'none';
    document.body.appendChild(container);
}
