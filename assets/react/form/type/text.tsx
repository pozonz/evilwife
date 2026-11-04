import { getTypeByKeys, applyChange } from '../dom';

export const Text = ({ keys = [] }: { keys: Array<string> }) => {
    const { schema, id, name, value, errors } = getTypeByKeys(keys);

    const cls = (schema.attr && schema.attr.class) || 'form-control';
    const type = schema.type === 'integer' ? 'number' : 'text';

    return (
        <div className="mb-0">
            <label className="form-label" htmlFor={id}>{schema.label}</label>
            <input
                className={`${cls}${errors.length ? ' is-invalid' : ''}`}
                id={id}
                name={name}
                type={type}
                value={value ?? ''}
                onChange={(ev) => applyChange(ev.currentTarget)}
            />
            <div id={id ? `${id}-error` : undefined} className={errors.length ? 'invalid-feedback d-block' : 'invalid-feedback d-none'}>
                {errors.map((message) => (
                    <div key={message} className="invalid-feedback d-block">{message}</div>
                ))}
            </div>
        </div>
    );
};
