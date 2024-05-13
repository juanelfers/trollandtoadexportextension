export const selectors = {
    trolltoad: {
        item: '.cart-item',
        name: '.item-name',
        price: '.font-smaller .sale-price',
        productLink: '.font-weight-bold .item-name',
        imageUrl: '.product-img-container a img',
        quantity: '.qty-input select',
    },
    ebay: {
        item: '.cart-bucket .line-item-ctr',
        name: '.item-title',
        price: '.item-price',
        productLink: '.item-title a',
        imageUrl: '.image-display img',
        quantity: '.select select',
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

export const carts = {
    trolltoad: 'https://www.trollandtoad.com/cart',
    ebay: 'https://cart.ebay.com/',
    tcgplayer: 'https://www.tcgplayer.com/cart',
};
