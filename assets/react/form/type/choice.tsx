import { useEffect, useRef } from 'react';
import $ from 'jquery';
import 'chosen-js';
import 'chosen-js/chosen.css';
import { getTypeByKeys, applyChange } from '../dom';

export const Choice = ({ keys = [] }: { keys: Array<string> }) => {
    const { schema, id, name, value, errors } = getTypeByKeys(keys);
    const selectRef = useRef<HTMLSelectElement>(null);
    const multiple = !!schema.multiple;
    const cls = (schema.attr && schema.attr.class) || 'form-select';
    const placeholder = (schema.attr && schema.attr['data-placeholder']) || '';
    const values = Array.isArray(value) ? value : (value ? [value] : []);
    const selected = (schema.choices || [])
        .filter((choice: any) => values.indexOf(choice.value) !== -1)
        .map((choice: any) => String(choice.value ?? ''));
    const selectValue = multiple ? selected : (selected[0] ?? '');

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
        const onChange = () => applyChange(element);
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
            <label className="form-label" htmlFor={id}>{schema.label}</label>
            <select
                ref={selectRef}
                className={`${cls}${errors.length ? ' is-invalid' : ''}`}
                id={id}
                name={multiple ? `${name}[]` : name}
                multiple={multiple}
                value={selectValue}
                data-placeholder={placeholder || undefined}
                onChange={(event) => applyChange(event.currentTarget)}
            >
                {(schema.choices || []).map((choice: any, index: number) => (
                    <option key={`${choice.value}-${index}`} value={choice.value ?? ''}>{choice.label}</option>
                ))}
            </select>
            <div id={id ? `${id}-error` : undefined} className={errors.length ? 'invalid-feedback d-block' : 'invalid-feedback d-none'}>
                {errors.map((message: string) => (
                    <div key={message} className="invalid-feedback d-block">{message}</div>
                ))}
            </div>
        </div>
    );
};
