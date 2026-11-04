import { useEffect, useState } from 'react';
import type { ModelData, Schema } from '../types';
import { Field } from './Field';
import { StoreProvider, useStore } from './store';

const Builder = () => {
    const { schema, apply, save } = useStore();
    const fields = schema.fields || {};

    useEffect(() => {
        const applyBtn = document.querySelector('.toolbar-panel .btn-light');
        const saveBtn = document.querySelector('.toolbar-panel .btn-info');
        const onApply = () => apply();
        const onSave = () => save();

        applyBtn?.addEventListener('click', onApply);
        saveBtn?.addEventListener('click', onSave);

        return () => {
            applyBtn?.removeEventListener('click', onApply);
            saveBtn?.removeEventListener('click', onSave);
        };
    }, [apply, save]);

    return (
        <div id={schema.name} className="row g-3">
            {Object.keys(fields).map((key) => (
                <div key={key} className={fields[key].type === 'collection' ? 'col-12' : 'col-md-6'}>
                    <Field keys={[key]} />
                </div>
            ))}
        </div>
    );
};

export const Form = ({ url }: { url: string }) => {
    const [schema, setSchema] = useState<Schema | null>(null);
    const [data, setData] = useState<ModelData | null>(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch(url)
            .then((res) => {
                if (!res.ok) {
                    throw new Error();
                }
                return res.json();
            })
            .then((response) => {
                setSchema(response.schema);
                setData(response.data);
            })
            .catch((ev: Error) => {
                setMessage(ev.message || 'Unable to load form');
            });
    }, [url]);

    if (message) {
        return <div className="alert alert-danger mb-0">{message}</div>;
    }

    if (!schema || !data) {
        return null;
    }

    return (
        <StoreProvider schema={schema} initialData={data}>
            <Builder />
        </StoreProvider>
    );
};
