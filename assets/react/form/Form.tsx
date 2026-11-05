import { useEffect } from 'react';
import useFormStore from './store';
import { getType } from './dom';

export const Form = ({ schemaUrl, saveUrl, validateUrl }: { schemaUrl: string; saveUrl: string; validateUrl: string }) => {
    const { update, schema, init, apply, save } = useFormStore();

    useEffect(() => {
        update({ schemaUrl, saveUrl, validateUrl });
        init();
    }, [schemaUrl, saveUrl, validateUrl]);

    useEffect(() => {
        const applyButton = document.querySelector<HTMLButtonElement>('[data-model-apply]');
        const saveButton = document.querySelector<HTMLButtonElement>('[data-model-save]');
        applyButton?.addEventListener('click', apply);
        saveButton?.addEventListener('click', save);

        return () => {
            applyButton?.removeEventListener('click', apply);
            saveButton?.removeEventListener('click', save);
        };
    }, [apply, save]);

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
