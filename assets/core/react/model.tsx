import { createRoot } from 'react-dom/client';
import '../js/main.js';
import '../css/model.less';
import { Form } from './form/Form';

const container = document.querySelector<HTMLElement>('[data-schema-url]');
if (container) {
    const url = container.getAttribute('data-schema-url') || '';
    createRoot(container).render(<Form url={url} />);
}
