import { create } from "zustand";
import { mountStoreDevtool } from 'simple-zustand-devtools';

const api = (url: string, method: string, data: any, callback: (response: any) => void) => {
    fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: data == null ? undefined : JSON.stringify(data),
    })
        .then((res) => res.json())
        .then((response) => {
            callback(response);
        });
};

interface FormStore { 
    schemaUrl: string;
    saveUrl: string;
    validateUrl: string;
    container: HTMLElement | null;
    schema: any | null;
    data: any | null;
    errors: Array<any> | null;
    update: (data: any) => void;
    init: () => void;
    validate: () => void;
    save: () => void;
    apply: () => void;
}

const useFormStore = create<FormStore>((set, get) => ({
    schemaUrl: '',
    saveUrl: '',
    validateUrl: '',
    container: null,
    schema: null,
    data: null,
    errors: null,
    update: (data: any) => set((state) => ({ ...state, ...data })),
    init: () => {
        const { schemaUrl } = get();
        api(schemaUrl, 'GET', null, (response) => {
            get().update({ schema: response.schema, data: response.data });
        });
    },
    validate: () => {
        const { validateUrl, data } = get();
        api(validateUrl, 'POST', data, (response) => {
            get().update({ errors: response.errors });
        });
    },
    apply: () => {
        const { saveUrl, data } = get();
        api(saveUrl, 'POST', data, (response) => {
            get().update({ errors: response.errors });
        });
    },
    save: () => {
        get().apply();
    },
}));

// if (process.env.NODE_ENV === 'development')
//   mountStoreDevtool('Counter Store', useCounterStore);

export default useFormStore;