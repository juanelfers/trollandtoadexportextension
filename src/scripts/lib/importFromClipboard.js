import { navigateTo } from './navigateTo.js';

export const wait = (time = 1000) => new Promise(resolve => setTimeout(resolve, time))

const handleAddToCart = async (card) => {
    let response = {
        success: false
    };

    try {
        if (card.url.includes('ebay')) {
            const qty = document.querySelector('#qtyTextBox');
            if (qty) qty.value = card.quantity;
            document.querySelector('.x-atc-action a').click();
            response = { success: true };
        }

        if (card.url.includes('troll')) {
            const optionRows = Array.from(document.querySelectorAll('.buyOptionRow'));

            optionRows.find(option => {
                const priceCol = option.querySelector('.priceCol');

                if (!priceCol) return

                const price = +priceCol.textContent.slice(1);

                if (price !== card.price) return;

                option.querySelector('.qtySelect').value = card.quantity;
                option.querySelector('.cartAdd').click();

                response = { success: true };

                return true;
            });
        }
    } catch { }

    return response;
};

async function navigateCards(tabId, cards, index) {
    if (index >= cards.length) return end(tabId, cards);

    const update = updateCard(cards, index);
    const card = cards[index];
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
        update.success(cards, index);
    } else {
        cards[index].error = true;
        update.error();
    }

    update.finally(cards, index);

    navigateCards(tabId, cards, index + 1)
}

const updateCard = (cards, index) => {
    const card = document.querySelectorAll('.import-progress div')[index];
    const status = card.querySelector('span');
    status.innerText = 'Agregando...'
    card.classList.add('adding');

    return {
        success: () => {
            status.innerText = 'Listo!'
            card.classList.add('success');
        },
        error: () => {
            status.innerText = 'Sin stock'
            card.classList.add('error');
        },
        finally: (cards, index) => {
            card.classList.remove('adding');
            document.querySelector('.progress').style.width = `${parseInt((index + 1) / cards.length * 100)}%`;
        }
    }
}

function end(tabId, cards) {
    navigateTo(tabId, cards[0].url.includes('troll') ? 'https://www.trollandtoad.com/cart' : 'https://cart.ebay.com/');

    const total = cards.length;
    const missing = cards.filter(card => card.error);
    const errorTotal = missing.length;
    const successTotal = total - errorTotal;
    const summary = `
        <h4>Resumen:</h4>
        ${successTotal}/${total} agregados
        ${errorTotal ? (`
            <h5>Faltantes</h5>
            ${missing.map(card => `
                <div>${card.name.slice(0, 15).trim()}... ${card.quantity} x $${card.price}</div>
            `).join('')}
            <!-- <button>Copiar excel con faltantes</button> -->
        `) : ''}
    `;

    document.querySelector('.summary').innerHTML = summary;
}

function parseInput(input) {
    const lineSplit = input.match('\r') ? '\r\n' : '\n';

    return input.split(lineSplit).map(l => {
        const [name, url, price, quantity] = l.split('\t');
        if (!url.match(/http/)) return null;
        return { name, url, price: +price.replace(',', '.'), quantity };
    }).filter(Boolean);
}

export function importFromClipboard() {
    const input = window.prompt('Pegar tabla de Excel');
    if (!input) return;

    const data = parseInput(input);
    console.log({ data })
    chrome.tabs.query(
        { active: true, currentWindow: true },
        ([tab]) => navigateCards(tab.id, data, 0)
    );

    // Hide all non-import pages
    document.querySelector('.cart-page').style.display = 'none';
    document.querySelector('.other-page').style.display = 'none';

    // Create list of cards
    const cards = data.map(({ name, quantity }) => `
        <div class="card-progress">${name.slice(0, 10).trim()}... x${quantity}: <span class="card-status">Pendiente</span></div>
    `).join('');

    // Show import page and cards list
    document.querySelector('.import-page').classList.remove('hidden');
    document.querySelector('.import-progress').innerHTML = cards;
}