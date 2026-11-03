import { escapeHtml } from '../../dom';

export const render = (errors) =>
    (errors || []).map((message) =>
        `<div class="invalid-feedback d-block">${escapeHtml(message)}</div>`
    ).join('');

