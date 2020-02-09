import libraryLoader from "../services/library_loader.js";
import toastService from "../services/toast.js";
import utils from "../services/utils.js";
import noteDetailService from "../services/note_detail.js";

const $dialog = $('#markdown-import-dialog');
const $importTextarea = $('#markdown-import-textarea');
const $importButton = $('#markdown-import-button');

async function convertMarkdownToHtml(text) {
    await libraryLoader.requireLibrary(libraryLoader.COMMONMARK);

    const reader = new commonmark.Parser();
    const writer = new commonmark.HtmlRenderer();
    const parsed = reader.parse(text);

    const result = writer.render(parsed);

    const textEditor = noteDetailService.getActiveEditor();
    const viewFragment = textEditor.data.processor.toView(result);
    const modelFragment = textEditor.data.toModel(viewFragment);

    textEditor.model.insertContent(modelFragment, textEditor.model.document.selection);

    toastService.showMessage("Markdown content has been imported into the document.");
}

export async function importMarkdownInline() {
    if (noteDetailService.getActiveTabNoteType() !== 'text') {
        return;
    }

    if (utils.isElectron()) {
        const {clipboard} = require('electron');
        const text = clipboard.readText();

        convertMarkdownToHtml(text);
    }
    else {
        utils.openDialog($dialog);
    }
}

async function sendForm() {
    const text = $importTextarea.val();

    $dialog.modal('hide');

    await convertMarkdownToHtml(text);

    $importTextarea.val('');
}

$importButton.on('click', sendForm);

$dialog.on('shown.bs.modal', () => $importTextarea.trigger('focus'));

utils.bindElShortcut($dialog, 'ctrl+return', sendForm);