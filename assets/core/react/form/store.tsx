import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { FormError, Key, ModelData, Schema } from '../types';
import { getTypeByKeys, setValueByKeys } from './keys';

type StoreValue = {
    schema: Schema;
    data: ModelData;
    errors: FormError[];
    setValue: (keys: Key[], value: unknown) => void;
    setData: (data: ModelData) => void;
    validate: (next?: ModelData) => void;
    apply: () => void;
    save: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);

const post = (url: string, data: ModelData): Promise<FormError[]> =>
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
        .then((res) => res.json())
        .then((response) => response.errors || []);

export const StoreProvider = ({
    schema,
    initialData,
    children,
}: {
    schema: Schema;
    initialData: ModelData;
    children: ReactNode;
}) => {
    const [data, setData] = useState<ModelData>(initialData);
    const [errors, setErrors] = useState<FormError[]>([]);

    const validate = useCallback((next?: ModelData) => {
        post('/manage/model/validate', next ?? data).then(setErrors);
    }, [data]);

    const apply = useCallback(() => {
        post('/manage/model/save', data).then(setErrors);
    }, [data]);

    const setValue = useCallback((keys: Key[], value: unknown) => {
        setData((current) => {
            const next = setValueByKeys(current, keys, value) as ModelData;
            post('/manage/model/validate', next).then(setErrors);
            return next;
        });
    }, []);

    const value = useMemo<StoreValue>(() => ({
        schema,
        data,
        errors,
        setValue,
        setData: (next) => {
            setData(next);
            post('/manage/model/validate', next).then(setErrors);
        },
        validate,
        apply,
        save: apply,
    }), [schema, data, errors, setValue, validate, apply]);

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
    const store = useContext(StoreContext);
    if (!store) {
        throw new Error('useStore must be used inside StoreProvider');
    }
    return store;
};

export const useField = (keys: Key[]) => {
    const { schema, data, errors, setValue } = useStore();
    return {
        ...getTypeByKeys(schema, data, errors, keys),
        setValue: (value: unknown) => setValue(keys, value),
    };
};
