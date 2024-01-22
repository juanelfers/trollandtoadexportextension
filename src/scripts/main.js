import { createCartTable } from '/src/scripts/lib/createCartTable.js';
import { copy } from '/src/scripts/lib/copy.js';
import { copyAndOpen } from '/src/scripts/lib/copyAndOpen.js';
import { importFromClipboard } from '/src/scripts/lib/importFromClipboard.js';
import { bindEvents } from '/src/scripts/lib/bindEvents.js';

createCartTable();
bindEvents({ copy, copyAndOpen, importFromClipboard });
