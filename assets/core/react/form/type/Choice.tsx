import { useEffect, useRef } from 'react';
import $ from 'jquery';
import 'chosen-js';
import 'chosen-js/chosen.css';
import type { Key } from '../../types';
import { useField } from '../store';
import { Error } from './Error';

export const Choice = ({ keys }: { keys: Key[] }) => {
    const { schema, id, name, value, errors, setValue } = useField(keys);
    const selectRef = useRef<HTMLSelectElement>(null);
    const multiple = !!schema.multiple;
    const cls = ((schema.attr && schema.attr.class) || 'form-select') + (errors.length ? ' is-invalid' : '');
    const placeholder = String((schema.attr && schema.attr['data-placeholder']) || '');
    const selected = Array.isArray(value) ? value.map(String) : (value ? [String(value)] : []);

    useEffect(() => {
        if (!multiple || !selectRef.current) {
            return;
        }

        const $select = $(selectRef.current);
        $select.chosen({
            width: '100%',
            placeholder_text_multiple: placeholder || 'Select...',
        });
        $select.on('change', () => {
            setValue(Array.from(selectRef.current?.selectedOptions || []).map((option) => option.value));
        });

        return () => {
            $select.off('change');
            if ($select.next('.chosen-container').length) {
                $select.chosen('destroy');
            }
        };
    }, [multiple, placeholder, setValue]);

    return (
        <div className="mb-0">
            {schema.label ? <label className="form-label" htmlFor={id}>{schema.label}</label> : null}
            <select
                ref={selectRef}
                className={String(cls)}
                id={id}
                name={multiple ? name + '[]' : name}
                multiple={multiple}
                data-placeholder={placeholder || undefined}
                value={multiple ? selected : (selected[0] ?? '')}
                onChange={(ev) => {
                    if (multiple) {
                        setValue(Array.from(ev.target.selectedOptions).map((option) => option.value));
                        return;
                    }
                    setValue(ev.target.value);
                }}
            >
                {(schema.choices || []).map((choice) => (
                    <option key={choice.value} value={choice.value}>{choice.label}</option>
                ))}
            </select>
            <Error id={id} errors={errors} />
        </div>
    );
};
