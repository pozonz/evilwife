import type { Key } from '../types';
import { useField } from './store';
import { Text } from './type/Text';
import { Textarea } from './type/Textarea';
import { Checkbox } from './type/Checkbox';
import { Choice } from './type/Choice';
import { ModelFieldForm } from './collection/ModelFieldForm';

export const Field = ({ keys }: { keys: Key[] }) => {
    const { schema } = useField(keys);

    if (schema.type === 'choice') {
        return <Choice keys={keys} />;
    }
    if (schema.type === 'checkbox') {
        return <Checkbox keys={keys} />;
    }
    if (schema.type === 'textarea') {
        return <Textarea keys={keys} />;
    }
    if (schema.type === 'collection') {
        return <ModelFieldForm keys={keys} />;
    }

    return <Text keys={keys} />;
};
