import { createCartTable } from '/scripts/lib/createCartTable.js';
import { copy } from '/scripts/lib/copy.js';
import { copyAndOpen } from '/scripts/lib/copyAndOpen.js';
import { importFromClipboard } from '/scripts/lib/importFromClipboard.js';
import { bindEvents } from '/scripts/lib/bindEvents.js';

createCartTable();
bindEvents({ copy, copyAndOpen, importFromClipboard });
