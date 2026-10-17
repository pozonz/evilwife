export const escapeHtml = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

export const fieldId = (path) => path.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');

export const fieldName = (path, multiple) => (multiple ? path + '[]' : path);

export const childPath = (path, name) => (path ? path + '[' + name + ']' : name);

export const propertyPathToId = (root, propertyPath) => {
    let path = root || '';
    String(propertyPath || '').split(/[.\[\]]/).filter(Boolean).forEach((part) => {
        path = path ? path + '[' + part + ']' : part;
    });
    return fieldId(path);
};

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
