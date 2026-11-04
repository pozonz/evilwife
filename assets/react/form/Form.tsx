import { useEffect, useState, type ComponentType } from 'react';
import useFormStore from './store';
import { Text } from './type/text';
import { Choice } from './type/choice';
import { Checkbox } from './type/checkbox';
import { Textarea } from './type/textarea';
import { Collection } from './collection/model_field_form';

const types = { choice: Choice, checkbox: Checkbox, textarea: Textarea, collection: Collection };

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

    const fields = schema.fields || [];

    return (
        <div id={schema.name} className="row g-3">
            {Object.keys(fields).map((key) => {
                const fieldType = fields[key].type as keyof typeof types;
                const Component = (types[fieldType] || Text) as ComponentType<{ field: any; keys?: any }>;

                return (
                    <div key={key} className={fields[key].type === 'collection' ? 'col-12' : 'col-md-6'}>
                        <Component field={fields[key]} keys={[key]} />
                    </div>
                );
            })}
        </div>
    );
};
