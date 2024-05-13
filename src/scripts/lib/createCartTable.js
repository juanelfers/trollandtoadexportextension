import { selectors, carts } from "./constants.js";
import getTableHTML from "./getTableHTML.js";

export const wait = (time = 1000) => new Promise(resolve => setTimeout(resolve, time))

function getProducts(page = 'tcgplayer', selectors) {
    const selector = selectors[page];
    const articles = document.querySelectorAll(selector.item);
    const baseUrl = page === 'trolltoad' ? window.location.origin : '';
    const divider = (quantity) => page === 'ebay' ? 1 / quantity : 1;

    const products = Array.from(articles).map((article) => {
        const name = article.querySelector(selector.name)?.textContent.trim();
        const quantity = +(article.querySelector(selector.quantity)?.value || 1);
        const price = (divider(quantity) * article.querySelector(selector.price)?.textContent.trim().replace('$', '')).toString().replace('.', ',');
        const productLink = baseUrl + article.querySelector(selector.productLink)?.getAttribute('href');
        const imageUrl = baseUrl + article.querySelector(selector.imageUrl)?.getAttribute('src');

        return {
            name,
            price,
            quantity,
            productLink,
            imageUrl,
        };
    });
    
    return products
}

export const createCartTable = async function () {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    console.log({ currentTab })
    if (!currentTab) return;

    const [platform] = Object.entries(carts).find(([_, url]) => currentTab.url.includes(url)) || []
    console.log({ platform })

    if (!platform) return;

    document.body.classList.add('show-cart-page');

    const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: getProducts,
        args: [platform, selectors],
    });

    const container = document.createElement('div');
    container.setAttribute('id', 'cart');
    container.innerHTML = getTableHTML(result);
    container.style.display = 'none';
    document.body.appendChild(container);
}
