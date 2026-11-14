import '../core/css/model.less';

import { Form } from './form/Form';

export const Dao = ({ className, id }: { className: string; id: string }) => {
    const schemaUrl = `/manage/dao/${className}/${id}/schema`;
    const saveUrl = `/manage/dao/${className}/save`;
    const validateUrl = `/manage/dao/${className}/validate`;

    return (
        <div className="model-builder d-flex align-items-start gap-3">
            <div className="fields-panel card shadow-sm">
                <div className="card-body">
                    <Form schemaUrl={schemaUrl} saveUrl={saveUrl} validateUrl={validateUrl} />
                </div>
            </div>

            <div className="toolbar-panel card shadow-sm">
                <div className="card-body py-2 px-3 d-flex align-items-center gap-3">
                    <button type="button" className="btn btn-light border" data-model-apply>Apply</button>
                    <button type="button" className="btn btn-info text-white" data-model-save>Save &amp; exit</button>
                </div>
            </div>
        </div>
    );
};
