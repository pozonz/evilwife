import { useEffect, useRef } from 'react';
import $ from 'jquery';
import 'chosen-js';
import 'chosen-js/chosen.css';
import useFormStore from '../store';

const resolve = (root: any, data: any, errorList: any, keys: any[]) => {
    let schema = root;
    keys.forEach((key) => {
        if (schema && schema.type === 'collection' && /^\d+$/.test(String(key))) {
            schema = schema.entry;
            return;
        }
        schema = ((schema && schema.fields) || {})[key];
    });

    const last = keys[keys.length - 1];
    if (keys.some((key) => /^\d+$/.test(String(key))) && ['widget', 'label', 'field', 'constraints'].includes(last)) {
        schema = Object.assign({}, schema, { label: null });
    }

    let value = data;
    keys.forEach((key) => {
        value = value == null ? undefined : value[key];
    });

    const wanted = keys.map(String);
    const errors = (errorList || []).filter((item: any) => {
        const parts = String(item?.path ?? '').split(/[.\[\]]/).filter((part) => part !== '' && part != null);
        if (root && parts[0] === root.name) {
            parts.shift();
        }
        return parts.length === wanted.length && parts.every((part: string, i: number) => part === wanted[i]);
    }).map((item: any) => item.message);

    const parts = [root?.name, ...keys].filter((part) => part !== '' && part != null);

    return {
        schema: schema || {},
        id: parts.join('_'),
        name: parts.reduce((acc: string, part: any) => (acc ? acc + '[' + part + ']' : String(part)), ''),
        value,
        errors,
    };
};

const writeValue = (keys: any[], nextValue: any) => {
    const current = useFormStore.getState().data ?? {};
    const next = Array.isArray(current) ? [...current] : { ...current };
    let object: any = next;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const child = object[key];
        const copy = child == null || typeof child !== 'object'
            ? (/^\d+$/.test(String(keys[i + 1])) ? [] : {})
            : (Array.isArray(child) ? [...child] : { ...child });
        object[key] = copy;
        object = copy;
    }

    object[keys[keys.length - 1]] = nextValue;
    useFormStore.getState().update({ data: next });
};

export const Choice = ({ field, keys = [] }: { field: any; keys?: any }) => {
    const root = useFormStore((state) => state.schema);
    const data = useFormStore((state) => state.data);
    const errorList = useFormStore((state) => state.errors);
    const selectRef = useRef<HTMLSelectElement>(null);
    const path = Array.isArray(keys) ? keys : [keys];
    const pathRef = useRef(path);
    pathRef.current = path;

    const resolved = path.length ? resolve(root, data, errorList, path) : null;
    const schema = resolved?.schema && Object.keys(resolved.schema).length ? resolved.schema : (field || {});
    const id = resolved?.id;
    const name = resolved?.name || '';
    const value = resolved ? resolved.value : undefined;
    const errors: string[] = resolved?.errors || [];
    const multiple = !!schema.multiple;
    const cls = (schema.attr && schema.attr.class) || 'form-select';
    const placeholder = (schema.attr && schema.attr['data-placeholder']) || '';
    const values = Array.isArray(value) ? value : (value ? [value] : []);
    const selected = (schema.choices || [])
        .filter((choice: any) => values.indexOf(choice.value) !== -1)
        .map((choice: any) => String(choice.value ?? ''));
    const selectValue = multiple ? selected : (selected[0] ?? '');

    const commit = (element: HTMLSelectElement) => {
        const currentPath = pathRef.current;
        if (!currentPath.length) {
            return;
        }
        const nextValue = element.multiple
            ? Array.from(element.selectedOptions).map((option) => option.value)
            : element.value;
        writeValue(currentPath, nextValue);
    };

    useEffect(() => {
        const element = selectRef.current;
        if (!element || !/\[widget\]$/.test(name)) {
            return;
        }
        const item = element.closest('.field-item');
        if (!item) {
            return;
        }
        item.classList.toggle('is-choice', String(value).indexOf('Choice') === 0);
        const onChange = () => {
            item.classList.toggle('is-choice', String(element.value).indexOf('Choice') === 0);
        };
        element.addEventListener('change', onChange);
        return () => element.removeEventListener('change', onChange);
    }, [name, value]);

    useEffect(() => {
        const element = selectRef.current;
        if (!element || !multiple) {
            return;
        }
        const $element = $(element);
        ($element as any).chosen({
            width: '100%',
            placeholder_text_multiple: placeholder || 'Select...',
        });
        const onChange = () => commit(element);
        $element.on('change', onChange);
        return () => {
            $element.off('change', onChange);
            ($element as any).chosen('destroy');
        };
    }, [multiple, placeholder, id]);

    useEffect(() => {
        const element = selectRef.current;
        if (!element || !multiple) {
            return;
        }
        $(element).trigger('chosen:updated');
    }, [multiple, selected.join('\0'), schema.choices]);

    return (
        <div className="mb-0">
            {schema.label ? <label className="form-label" htmlFor={id}>{schema.label}</label> : null}
            <select
                ref={selectRef}
                className={`${cls}${errors.length ? ' is-invalid' : ''}`}
                id={id}
                name={multiple ? `${name}[]` : name}
                multiple={multiple}
                value={selectValue}
                data-placeholder={placeholder || undefined}
                onChange={(event) => commit(event.currentTarget)}
            >
                {(schema.choices || []).map((choice: any, index: number) => (
                    <option key={`${choice.value}-${index}`} value={choice.value ?? ''}>{choice.label}</option>
                ))}
            </select>
            <div id={id ? `${id}-error` : undefined} className={errors.length ? 'invalid-feedback d-block' : 'invalid-feedback d-none'}>
                {errors.map((message) => (
                    <div key={message} className="invalid-feedback d-block">{message}</div>
                ))}
            </div>
        </div>
    );
};
