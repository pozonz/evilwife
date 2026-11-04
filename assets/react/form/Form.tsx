import { useEffect, useState } from 'react';
import useFormStore from './store';

const Field = ({ field }: { field: any }) => {
    const label = field.label ? <label className="form-label">{field.label}</label> : null;

    if (field.type === 'choice') {
        return (
            <div className="mb-0">
                {label}
                <select className="form-select" />
            </div>
        );
    }

    if (field.type === 'checkbox') {
        return (
            <div className="form-check">
                <input className="form-check-input" type="checkbox" />
                <label className="form-check-label">{field.label || ''}</label>
            </div>
        );
    }

    if (field.type === 'textarea') {
        return (
            <div className="mb-0">
                {label}
                <textarea className="form-control" rows={3} />
            </div>
        );
    }

    if (field.type === 'collection') {
        return <div className="border rounded p-3 text-muted">Collection</div>;
    }

    return (
        <div className="mb-0">
            {label}
            <input className="form-control" type={field.type === 'integer' ? 'number' : 'text'} />
        </div>
    );
};

export const Form = ({ url }: { url: string }) => {
    const { update, schema } = useFormStore();

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setError(null);
        
        fetch(url)
            .then((res) => {
                if (!res.ok) {
                    throw new Error();
                }
                return res.json();
            })
            .then((response) => {
                update({
                    schema: response.schema,
                    data: response.data,
                });
            })
            .catch((ev: Error) => {
                setError(ev.message);
            });
    }, [url]);

    if (error !== null) {
        return <div className="alert alert-danger mb-0">{error}</div>;
    }

    if (!schema) {
        return null;
    }

    const fields = schema.fields || {};

    return (
        <div id={schema?.name} className="row g-3">
            {Object.keys(fields).map((key) => (
                <div key={key} className={fields[key].type === 'collection' ? 'col-12' : 'col-md-6'}>
                    <Field field={fields[key]} />
                </div>
            ))}
        </div>
    );
};
