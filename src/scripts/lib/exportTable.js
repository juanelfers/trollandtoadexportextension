export function exportTable() {
    const table = document.querySelector('#cart table');
    const workBook = XLSX.utils.book_new();

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
