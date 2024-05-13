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

export default getTableHTML;
