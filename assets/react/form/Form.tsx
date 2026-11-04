import { useEffect } from 'react';
import useFormStore from './store';

export const Form = ({ url }: { url: string }) => {
    const { update } = useFormStore();
    
    useEffect(() => {
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
                console.log(ev.message);
            });
    }, [url]);

    return (
        <></>
    );
};
