import { getTypeByKeys, applyChange } from '../dom';

export const Checkbox = ({ keys = [] }: { keys: Array<string> }) => {
    const { schema, id, name, value, errors } = getTypeByKeys(keys);

    return (
        <div className="form-check">
            <input
                className={`form-check-input${errors.length ? ' is-invalid' : ''}`}
                type="checkbox"
                id={id}
                name={name}
                value="1"
                checked={!!value}
                onChange={(ev) => applyChange(ev.currentTarget)}
            />
            <label className="form-check-label" htmlFor={id}>{schema.label || ''}</label>
            <div id={id ? `${id}-error` : undefined} className={errors.length ? 'invalid-feedback d-block' : 'invalid-feedback d-none'}>
                {errors.map((message: string) => (
                    <div key={message} className="invalid-feedback d-block">{message}</div>
                ))}
            </div>
        </div>
    );
};
