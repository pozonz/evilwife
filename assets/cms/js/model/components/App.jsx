import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import store from "../store";

import { ModalProvider } from "react-simple-modal-provider";
import Columns from './Columns';

const App = () => {
    return (
        <Provider store={store}>
            <Columns/>
        </Provider>
    );
};

export default App;