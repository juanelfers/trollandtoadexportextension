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
}
