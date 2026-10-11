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
