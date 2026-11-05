import 'admin-lte/dist/css/adminlte.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap';
import '../core/css/main.less';
import '../core/css/model.less';

import { createRoot } from 'react-dom/client';
import { Form } from './form/Form';

const container = document.querySelector<HTMLElement>('[data-schema-url]');
if (container) {
    const schemaUrl = container.getAttribute('data-schema-url') || '';
    const saveUrl = container.getAttribute('data-save-url') || '';
    const validateUrl = container.getAttribute('data-validate-url') || '';
    createRoot(container).render(<Form schemaUrl={schemaUrl} saveUrl={saveUrl} validateUrl={validateUrl} />);
}
