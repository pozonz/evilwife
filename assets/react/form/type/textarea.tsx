import { getTypeByKeys, applyChange } from '../dom';

export const Textarea = ({ keys = [] }: { keys: Array<string> }) => {
    const { schema, id, name, value, errors } = getTypeByKeys(keys);

    const cls = (schema.attr && schema.attr.class) || 'form-control';
    const rows = (schema.attr && schema.attr.rows) || 3;

    return (
        <div className="mb-0">
            <label className="form-label" htmlFor={id}>{schema.label}</label>
            <textarea
                className={`${cls}${errors.length ? ' is-invalid' : ''}`}
                id={id}
                name={name}
                rows={rows}
                value={value ?? ''}
                onChange={(ev) => applyChange(ev.currentTarget)}
            />
            <div id={id ? `${id}-error` : undefined} className={errors.length ? 'invalid-feedback d-block' : 'invalid-feedback d-none'}>
                {errors.map((message: string) => (
                    <div key={message} className="invalid-feedback d-block">{message}</div>
                ))}
            </div>
        </div>
    );
};
