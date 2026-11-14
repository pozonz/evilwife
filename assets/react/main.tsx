import 'admin-lte/dist/css/adminlte.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap';
import '../core/css/main.less';

import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';
import { Dao } from './dao';
import { Model } from './model';

const ModelRoute = () => {
    const { className } = useParams();
    if (!className) {
        return null;
    }
    return <Model className={className} />;
};

const DaoRoute = () => {
    const { className, id } = useParams();
    if (!className || !id) {
        return null;
    }
    return <Dao className={className} id={id} />;
};

const root = document.getElementById('cms-app');
if (root) {
    createRoot(root).render(
        <BrowserRouter future={{ v7_relativeSplatPath: true }}>
            <Routes>
                <Route path="/manage/model/:className" element={<ModelRoute />} />
                <Route path="/manage/dao/:className/:id" element={<DaoRoute />} />
            </Routes>
        </BrowserRouter>
    );
}
