import { create } from "zustand";
import { mountStoreDevtool } from 'simple-zustand-devtools';

interface FormStore { 
    container: HTMLElement | null;
    schema: Object | null;
    data: Object | null;
    errors: Array<Object> | null;
    update: (data: Object) => void;
}

const useFormStore = create<FormStore>(set => ({
    container: null,
    schema: null,
    data: null,
    errors: null,
    update: (data: Object) => set((state) => ({...state, ...data}))
}));

// if (process.env.NODE_ENV === 'development')
//   mountStoreDevtool('Counter Store', useCounterStore);

export default useFormStore;