import { escapeHtml } from '../../utils';

export const render = (errors) =>
    (errors || []).map((message) =>
        `<div class="invalid-feedback d-block">${escapeHtml(message)}</div>`
    ).join('');

