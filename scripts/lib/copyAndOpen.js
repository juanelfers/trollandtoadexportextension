import { copy } from './copy.js';

export async function copyAndOpen() {
    window.open('https://docs.google.com/spreadsheets/u/0/create?usp=sheets_home&ths=true')
    copy();
}
