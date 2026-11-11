import 'admin-lte/dist/css/adminlte.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap';
import '../core/css/main.less';

import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';
import { Model } from './model';

const ModelRoute = () => {
    const { className } = useParams();
    if (!className) {
        return null;
    }
    return <Model className={className} />;
};

const root = document.getElementById('cms-app');
if (root) {
    createRoot(root).render(
        <BrowserRouter>
            <Routes>
                <Route path="/manage/model/:className" element={<ModelRoute />} />
            </Routes>
        </BrowserRouter>
    );
}
