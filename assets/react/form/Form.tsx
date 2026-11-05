import { useEffect, useState, type ComponentType } from 'react';
import useFormStore from './store';
import { getType } from './dom';

export const Form = ({ schemaUrl, saveUrl, validateUrl }: { schemaUrl: string; saveUrl: string; validateUrl: string }) => {
    const { update, schema, init } = useFormStore();

    useEffect(() => {
        update({ schemaUrl, saveUrl, validateUrl });
        init();
    }, [schemaUrl, saveUrl, validateUrl]);

    if (!schema) {
        return null;
    }

    const fields = schema.fields || [];

    return (
        <div id={schema.name} className="row g-3">
            {Object.keys(fields).map((key) => {
                const Component = getType(fields[key]);

                return (
                    <div key={key} className={fields[key].type === 'collection' ? 'col-12' : 'col-md-6'}>
                        <Component keys={[key]} />
                    </div>
                );
            })}
        </div>
    );
};
