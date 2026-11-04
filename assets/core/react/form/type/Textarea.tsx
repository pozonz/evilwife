import type { Key } from '../../types';
import { useField } from '../store';
import { Error } from './Error';

export const Textarea = ({ keys }: { keys: Key[] }) => {
    const { schema, id, name, value, errors, setValue } = useField(keys);
    const cls = ((schema.attr && schema.attr.class) || 'form-control') + (errors.length ? ' is-invalid' : '');
    const rows = Number((schema.attr && schema.attr.rows) || 3);

    return (
        <div className="mb-0">
            {schema.label ? <label className="form-label" htmlFor={id}>{schema.label}</label> : null}
            <textarea
                className={String(cls)}
                id={id}
                name={name}
                rows={rows}
                value={value == null ? '' : String(value)}
                onChange={(ev) => setValue(ev.target.value)}
            />
            <Error id={id} errors={errors} />
        </div>
    );
};
