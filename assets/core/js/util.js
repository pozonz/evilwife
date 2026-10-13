export function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function fieldId(path) {
    return path.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

export function fieldName(path, multiple) {
    return multiple ? path + '[]' : path;
}

export function childPath(path, name) {
    return path ? path + '[' + name + ']' : name;
}

export function propertyPathToId(root, propertyPath) {
    let path = root || '';
    String(propertyPath || '').split(/[.\[\]]/).filter(Boolean).forEach(function (part) {
        path = path ? path + '[' + part + ']' : part;
    });
    return fieldId(path);
}
