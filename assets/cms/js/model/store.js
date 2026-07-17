import {createStore} from "redux";
import reducer from "./reducer";

const store = createStore(
    reducer,
    {
        columns: JSON.parse($('#model_columnsJson').val() ? $('#model_columnsJson').val() : '[]'),
        types: JSON.parse($('#modelColumnTypes').val() ? $('#modelColumnTypes').val() : '[]'),
        widgets: Object.keys(JSON.parse($('#modelColumnWidgets').val() ? $('#modelColumnWidgets').val() : '[]')),
    }
);

export default store;