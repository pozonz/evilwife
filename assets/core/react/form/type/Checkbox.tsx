import type { Key } from '../../types';
import { useField } from '../store';
import { Error } from './Error';

export const Checkbox = ({ keys }: { keys: Key[] }) => {
    const { schema, id, name, value, errors, setValue } = useField(keys);

    return (
        <div className="form-check">
            <input
                className={'form-check-input' + (errors.length ? ' is-invalid' : '')}
                type="checkbox"
                id={id}
                name={name}
                value="1"
                checked={!!value}
                onChange={(ev) => setValue(ev.target.checked)}
            />
            <label className="form-check-label" htmlFor={id}>{schema.label || ''}</label>
            <Error id={id} errors={errors} />
        </div>
    );
};
