export const escapeHtml = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

export const fieldId = (...parts) => {
    const segments = parts
        .flatMap((part) => String(part ?? '').split(/[.\[\]]/))
        .filter(Boolean);
    return {
        id: segments.join('_'),
        name: segments.reduce((acc, part) => (acc ? acc + '[' + part + ']' : part), ''),
    };
};

export const fieldName = (path, multiple) => (multiple ? path + '[]' : path);

export const keysFromName = (name, root) => {
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
