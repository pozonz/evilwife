import { useEffect, useRef } from 'react';
import $ from 'jquery';
import 'jquery-ui/dist/jquery-ui';
import 'jquery-ui/dist/themes/base/jquery-ui.css';
import type { Key, ModelFieldData } from '../../types';
import { getTypeByKeys } from '../keys';
import { useField, useStore } from '../store';
import { Field } from '../Field';

const row = ['widget', 'label', 'field', 'constraints'];
const extra = ['sqlQuery'];
const settings = ['showInListingTable', 'listingWidth', 'listingTitle', 'queryableInCmsSearch'];

const Modal = ({ keys }: { keys: Key[] }) => {
    const { id } = useField(keys);
    const title = useField([...keys, 'label']).value;
    const key = useField([...keys, 'field']).value;
    const modalId = id + '-settings';

    return (
        <div className="modal fade field-settings-modal" id={modalId} tabIndex={-1} aria-labelledby={modalId + '-title'} aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow">
                    <div className="modal-header border-0 pb-0">
                        <h2 className="modal-title" id={modalId + '-title'}>{String(title || 'Field')}</h2>
                        <span className="field-key">{String(key || '')}</span>
                    </div>
                    <div className="modal-body">
                        {settings.map((name) => (
                            <div key={name}>
                                <Field keys={[...keys, name]} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ModelFieldForm = ({ keys }: { keys: Key[] }) => {
    const { schema, value } = useField(keys);
    const { schema: root, data, errors, setData } = useStore();
    const tableRef = useRef<HTMLDivElement>(null);
    const items = (Array.isArray(value) && value.length ? value : [{}]) as ModelFieldData[];
    const fields = (schema.entry && schema.entry.fields) || {};

    useEffect(() => {
        const table = tableRef.current;
        if (!table) {
            return;
        }

        const $table = $(table);
        $table.sortable({
            items: '.field-item',
            placeholder: 'field-item-placeholder',
            forcePlaceholderSize: true,
            update: () => {
                const order = $table.find('.field-item').toArray().map((el) => Number(el.getAttribute('data-index')));
                const current = (Array.isArray(data.fields) ? data.fields : []) as ModelFieldData[];
                setData({
                    ...data,
                    fields: order.map((index) => current[index]).filter(Boolean),
                });
            },
        });

        return () => {
            if ($table.hasClass('ui-sortable')) {
                $table.sortable('destroy');
            }
        };
    }, [data, setData, items.length]);

    return (
        <div className="field-table" ref={tableRef}>
            <div className="field-grid-head">
                <div>Widget</div>
                <div>Label</div>
                <div>Field</div>
                <div>Constraints</div>
                <div></div>
            </div>
            {items.map((item, i) => {
                const itemKeys = [...keys, i];
                const modalId = getTypeByKeys(root, data, errors, itemKeys).id + '-settings';
                const isChoice = String(item && item.widget).indexOf('Choice') === 0;

                return (
                    <div key={i} className={'field-item' + (isChoice ? ' is-choice' : '')} data-index={i}>
                        {row.map((name) => fields[name] ? (
                            <div key={name}>
                                <Field keys={[...itemKeys, name]} />
                            </div>
                        ) : null)}
                        <div className="field-actions">
                            <button type="button" className="field-settings-btn" data-bs-toggle="modal" data-bs-target={'#' + modalId} aria-label="Field settings">
                                <i className="fa-solid fa-ellipsis"></i>
                            </button>
                            <button
                                type="button"
                                className="field-remove-btn"
                                aria-label="Remove"
                                onClick={() => {
                                    const current = (Array.isArray(data.fields) ? data.fields : []) as ModelFieldData[];
                                    setData({
                                        ...data,
                                        fields: current.filter((_, index) => index !== i),
                                    });
                                }}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        {extra.map((name) => fields[name] ? (
                            <div key={name}>
                                <Field keys={[...itemKeys, name]} />
                            </div>
                        ) : null)}
                        <Modal keys={itemKeys} />
                    </div>
                );
            })}
        </div>
    );
};
