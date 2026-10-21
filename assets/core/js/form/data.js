export const escapeHtml = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

const keys = (...parts) =>
    parts
        .flatMap((part) => String(part ?? '').split(/[.\[\]]/))
        .filter(Boolean);

export const getIdFromAttr = (...parts) => keys(...parts).join('_');

export const getNameFromAttr = (...parts) =>
    keys(...parts).reduce((acc, part) => (acc ? acc + '[' + part + ']' : part), '');

export const getAttrsFromName = (name, root) => {
    const keys = [];
    const base = name.split('[', 1)[0];
    if (base && base !== root) {
        keys.push(base);
    }
    const re = /\[([^\]]*)\]/g;
    let match;
    while ((match = re.exec(name))) {
        if (match[1] !== '') {
            keys.push(match[1]);
        }
    }
    return keys;
};
