import '../core/css/model.less';

import { Form } from './form/Form';

export const Model = ({ className }: { className: string }) => {
    const schemaUrl = `/manage/model/${className}/schema`;
    const saveUrl = '/manage/model/save';
    const validateUrl = '/manage/model/validate';

    return (
        <div className="model-builder d-flex align-items-start gap-3">
            <div className="fields-panel card shadow-sm">
                <div className="card-body">
                    <Form schemaUrl={schemaUrl} saveUrl={saveUrl} validateUrl={validateUrl} />
                </div>
            </div>

            <div className="toolbar-panel card shadow-sm">
                <div className="card-body py-2 px-3 d-flex align-items-center gap-3">
                    <div className="form-check form-switch mb-0">
                        <input className="form-check-input" type="checkbox" id="model-status" defaultChecked />
                        <label className="form-check-label visually-hidden" htmlFor="model-status">Enabled</label>
                    </div>
                    <button type="button" className="btn btn-light border" data-model-apply>Apply</button>
                    <button type="button" className="btn btn-info text-white" data-model-save>Save &amp; exit</button>
                </div>
            </div>
        </div>
    );
};
