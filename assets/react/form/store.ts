import { create } from "zustand";
import { mountStoreDevtool } from 'simple-zustand-devtools';

interface FormStore { 
    container: HTMLElement | null;
    schema: any | null;
    data: any | null;
    errors: Array<any> | null;
    update: (data: any) => void;
}

const useFormStore = create<FormStore>(set => ({
    container: null,
    schema: null,
    data: null,
    errors: null,
    update: (data: any) => set((state) => ({...state, ...data}))
}));

// if (process.env.NODE_ENV === 'development')
//   mountStoreDevtool('Counter Store', useCounterStore);

export default useFormStore;