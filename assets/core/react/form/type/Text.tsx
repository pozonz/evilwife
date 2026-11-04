import type { Key } from '../../types';
import { useField } from '../store';
import { Error } from './Error';

export const Text = ({ keys }: { keys: Key[] }) => {
    const { schema, id, name, value, errors, setValue } = useField(keys);
    const cls = ((schema.attr && schema.attr.class) || 'form-control') + (errors.length ? ' is-invalid' : '');
    const type = schema.type === 'integer' ? 'number' : 'text';

    return (
        <div className="mb-0">
            {schema.label ? <label className="form-label" htmlFor={id}>{schema.label}</label> : null}
            <input
                className={String(cls)}
                id={id}
                name={name}
                type={type}
                value={value == null ? '' : String(value)}
                disabled={!!schema.disabled}
                onChange={(ev) => setValue(type === 'number' ? (ev.target.value === '' ? null : Number(ev.target.value)) : ev.target.value)}
            />
            <Error id={id} errors={errors} />
        </div>
    );
};
