import { useEffect, useRef, type ComponentType } from 'react';
import $ from 'jquery';
import 'jquery-ui/dist/jquery-ui';
import 'jquery-ui/dist/themes/base/jquery-ui.css';
import useFormStore from '../store';
import { getTypeByKeys } from '../dom';
import { Text } from '../type/text';
import { Choice } from '../type/choice';
import { Checkbox } from '../type/checkbox';
import { Textarea } from '../type/textarea';

const types = { choice: Choice, checkbox: Checkbox, textarea: Textarea };
const row = ['widget', 'label', 'field', 'constraints'];
const extra = ['sqlQuery'];
const settings = ['showInListingTable', 'listingWidth', 'listingTitle', 'queryableInCmsSearch'];

const reorder = (path: string[], order: number[]) => {
    const { data, update, validate } = useFormStore.getState();
    const next = Array.isArray(data) ? [...data] : { ...(data ?? {}) };
    let object: any = next;

    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        const child = object[key];
        const copy = child == null || typeof child !== 'object'
            ? (/^\d+$/.test(String(path[i + 1])) ? [] : {})
            : (Array.isArray(child) ? [...child] : { ...child });
        object[key] = copy;
        object = copy;
    }

    const key = path[path.length - 1];
    const list = Array.isArray(object[key]) ? object[key] : [];
    object[key] = order.map((index) => list[index]).filter((item) => item !== undefined);
    update({ data: next, errors: null });
    validate(() => {});
};

const Field = ({ itemKeys, name, fields }: { itemKeys: string[]; name: string; fields: any }) => {
    if (!fields[name]) {
        return null;
    }

    const fieldType = fields[name].type as keyof typeof types;
    const Component = (types[fieldType] || Text) as ComponentType<{ keys: Array<string> }>;

    return (
        <div>
            <Component keys={[...itemKeys, name]} />
        </div>
    );
};

const Settings = ({ itemKeys, fields }: { itemKeys: string[]; fields: any }) => {
    const { id } = getTypeByKeys(itemKeys);
    const title = getTypeByKeys([...itemKeys, 'label']).value;
    const fieldKey = getTypeByKeys([...itemKeys, 'field']).value;
    const modalId = `${id}-settings`;

    return (
        <div className="modal fade field-settings-modal" id={modalId} tabIndex={-1} aria-labelledby={`${modalId}-title`} aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow">
                    <div className="modal-header border-0 pb-0">
                        <h2 className="modal-title" id={`${modalId}-title`}>{title || 'Field'}</h2>
                        <span className="field-key">{fieldKey || ''}</span>
                    </div>
                    <div className="modal-body">
                        {settings.map((name) => (
                            <Field key={name} itemKeys={itemKeys} name={name} fields={fields} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Item = ({ itemKeys, fields }: { itemKeys: string[]; fields: any }) => {
    const { id, value } = getTypeByKeys(itemKeys);
    const modalId = `${id}-settings`;
    const className = 'field-item' + (String(value && value.widget).indexOf('Choice') === 0 ? ' is-choice' : '');

    return (
        <div className={className} data-index={itemKeys[itemKeys.length - 1]}>
            {row.map((name) => (
                <Field key={name} itemKeys={itemKeys} name={name} fields={fields} />
            ))}
            <div className="field-actions">
                <button type="button" className="field-settings-btn" data-bs-toggle="modal" data-bs-target={`#${modalId}`} aria-label="Field settings">
                    <i className="fa-solid fa-ellipsis" />
                </button>
                <button type="button" className="field-remove-btn" aria-label="Remove">
                    <i className="fa-solid fa-xmark" />
                </button>
            </div>
            {extra.map((name) => (
                <Field key={name} itemKeys={itemKeys} name={name} fields={fields} />
            ))}
            <Settings itemKeys={itemKeys} fields={fields} />
        </div>
    );
};

export const Collection = ({ keys = [] }: { keys: Array<string> }) => {
    const { schema, value } = getTypeByKeys(keys);
    const items = Array.isArray(value) && value.length ? value : [{}];
    const fields = (schema.entry && schema.entry.fields) || {};
    const tableRef = useRef<HTMLDivElement>(null);
    const keysRef = useRef(keys);
    keysRef.current = keys;
    const path = keys.join('\0');
    const orderKey = items.map((item: any) => String(item?.field ?? '')).join('\0');

    useEffect(() => {
        const table = tableRef.current;
        if (!table) {
            return;
        }

        const $table = $(table);
        let sorting = false;
        ($table as any).sortable({
            items: '.field-item',
            placeholder: 'field-item-placeholder',
            forcePlaceholderSize: true,
            update: () => {
                if (sorting) {
                    return;
                }
                sorting = true;
                const order = Array.from(table.querySelectorAll<HTMLElement>(':scope > .field-item'))
                    .map((item) => Number(item.dataset.index));
                ($table as any).sortable('cancel');
                sorting = false;
                if (order.some((index, position) => index !== position)) {
                    reorder(keysRef.current, order);
                }
            },
        });

        return () => {
            ($table as any).sortable('destroy');
        };
    }, [path, orderKey]);

    return (
        <div className="field-table" ref={tableRef}>
            <div className="field-grid-head">
                <div>Widget</div>
                <div>Label</div>
                <div>Field</div>
                <div>Constraints</div>
                <div></div>
            </div>
            {items.map((_item: any, index: number) => (
                <Item key={index} itemKeys={[...keys, String(index)]} fields={fields} />
            ))}
        </div>
    );
};
