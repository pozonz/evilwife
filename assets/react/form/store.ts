import { create } from "zustand";
import { mountStoreDevtool } from 'simple-zustand-devtools';

const post = (url: string, callback: () => void) => {
    const { data, update } = useFormStore.getState();

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
        .then((res) => res.json())
        .then((response) => {
            update({ errors: response.errors });
            callback();
        });
};

interface FormStore { 
    container: HTMLElement | null;
    schema: any | null;
    data: any | null;
    errors: Array<any> | null;
    update: (data: any) => void;
    validate: (callback: () => void) => void;
}

const useFormStore = create<FormStore>(set => ({
    container: null,
    schema: null,
    data: null,
    errors: null,
    update: (data: any) => set((state) => ({...state, ...data})),
    validate: (callback: () => void) => post('/manage/model/validate', callback),
}));

// if (process.env.NODE_ENV === 'development')
//   mountStoreDevtool('Counter Store', useCounterStore);

export default useFormStore;