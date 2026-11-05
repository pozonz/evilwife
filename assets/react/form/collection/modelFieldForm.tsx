import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useFormStore from '../store';
import { getInfo, getType } from '../dom';

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
    setTimeout(() => validate(), 500);
};

const append = (path: string[]) => {
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
    const list = Array.isArray(object[key]) ? [...object[key]] : [];
    if (!list.length) {
        list.push({});
    }
    list.push({});
    object[key] = list;
    update({ data: next, errors: null });
    setTimeout(() => validate(), 500);
};

const Field = ({ itemKeys, name, fields }: { itemKeys: string[]; name: string; fields: any }) => {
    if (!fields[name]) {
        return null;
    }

    const Component = getType(fields[name]);

    return (
        <div>
            <Component keys={[...itemKeys, name]} />
        </div>
    );
};

const Settings = ({ itemKeys, fields }: { itemKeys: string[]; fields: any }) => {
    const { id } = getInfo(itemKeys);
    const title = getInfo([...itemKeys, 'label']).value;
    const fieldKey = getInfo([...itemKeys, 'field']).value;
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
    const { id, value } = getInfo(itemKeys);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: itemKeys[itemKeys.length - 1] });
    const modalId = `${id}-settings`;
    const className = 'field-item' + (String(value && value.widget).indexOf('Choice') === 0 ? ' is-choice' : '') + (isDragging ? ' is-dragging' : '');

    return (
        <div
            ref={setNodeRef}
            className={className}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            {...attributes}
            {...listeners}
        >
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

export const ModelFieldCollection = ({ keys = [] }: { keys: Array<string> }) => {
    const { schema, value } = getInfo(keys);
    const { update, validate } = useFormStore.getState();

    const items = Array.isArray(value) && value.length ? value : [{}];
    const fields = (schema.entry && schema.entry.fields) || {};
    const ids = items.map((_item: any, index: number) => String(index));
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const onDragStart = () => {
        update({ errors: null });
    };

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) {
            setTimeout(() => validate(), 500);
            return;
        }
        reorder(keys, arrayMove(ids.map((_, index) => index), Number(active.id), Number(over.id)));
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} onDragStart={onDragStart}>
            <div className="field-table">
                <div className="field-grid-head">
                    <div>Widget</div>
                    <div>Label</div>
                    <div>Field</div>
                    <div>Constraints</div>
                    <div></div>
                </div>
                <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                    {items.map((_item: any, index: number) => (
                        <Item key={index} itemKeys={[...keys, String(index)]} fields={fields} />
                    ))}
                </SortableContext>
            </div>
            <button type="button" className="btn btn-light border mt-2" onClick={() => append(keys)}>
                Add
            </button>
        </DndContext>
    );
};
