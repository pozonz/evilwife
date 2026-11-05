import { useEffect, useRef } from 'react';
import TomSelect from 'tom-select';
import 'tom-select/dist/css/tom-select.bootstrap5.css';
import { getInfo, applyChange } from '../dom';

export const Choice = ({ keys = [] }: { keys: Array<string> }) => {
    const { schema, id, name, value, errors } = getInfo(keys);
    const selectRef = useRef<HTMLSelectElement>(null);
    const multiple = !!schema.multiple;
    const cls = (schema.attr && schema.attr.class) || 'form-select';
    const placeholder = (schema.attr && schema.attr['data-placeholder']) || '';
    const values = Array.isArray(value) ? value : (value ? [value] : []);
    const selected = values.map((item: any) => String(item));

    useEffect(() => {
        const element = selectRef.current;
        if (!element) {
            return;
        }

        const tom = new TomSelect(element, {
            plugins: multiple ? ['remove_button'] : undefined,
            placeholder: placeholder || undefined,
            hidePlaceholder: multiple,
            onChange: () => {
                applyChange(element);
            },
        });

        return () => tom.destroy();
    }, [id]);

    return (
        <div className="mb-0">
            <label className="form-label" htmlFor={id}>{schema.label}</label>
            <select
                ref={selectRef}
                className={`${cls}${errors.length ? ' is-invalid' : ''}`}
                id={id}
                name={multiple ? `${name}[]` : name}
                multiple={multiple}
                defaultValue={multiple ? selected : (selected[0] ?? '')}
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
