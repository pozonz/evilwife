import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import store from "../store";
import Select from 'react-select';
import {ReactSortable} from "react-sortablejs";
import Column from './Column';

const getColumnById = (columns, id) => {
    for (let idx in columns) {
        let column = columns[idx];
        if (column.id == id) {
            return column;
        }
    }
    return null;
}

const addColumn = (state, dispatch, id, required = 0, unique = 0, listing = 0, queryable = 0) => {
    state.columns.push({
        id: id,
        label: capitalize(id) + ':',
        field: id,
        widget: id.toLowerCase().indexOf('date') == -1 ? "Text" : 'Date picker',
        required: required,
        unique: unique,
        sqlQuery: null,
        listing: listing,
        listingWidth: null,
        listingTitle: null,
        displayFunc: null,
        queryable: queryable,
    });
    dispatch({
        type: 'change',
        payload: {
            columns: state.columns
        }
    });
}

const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}

const Columns = () => {
    const dispatch = useDispatch();
    const state = useSelector(state => state);

    useEffect(() => {
        if (store.getState().columns.length == 0) {
            addColumn(state, dispatch, 'title', 1, 1, 1, 1)
        }
    })

    let options = store.getState().types;
    options = options.filter(option => getColumnById(store.getState().columns, option.value) ? 0 : 1);

    return (
        <React.Fragment>
            <div className="col-lg-3 col-lg-offset-9">
                <Select options={options} value={null} onChange={(selectedOption) => addColumn(state, dispatch, selectedOption.value)}/>
            </div>
            <div className="col-lg-12">
                <div className="table-responsive">
                    <table className="table table-hover table-header-columns">
                        <thead>
                        <tr>
                            <th width="215px">Widget</th>
                            <th width="250px">Label</th>
                            <th width="250px">Field</th>
                            <th width="100px">Required</th>
                            <th width="100px">Unique</th>
                            <th></th>
                        </tr>
                        </thead>
                    </table>

                    <ReactSortable tag="table"
                                   className="table table-hover table-columns"
                                   list={store.getState().columns}
                                   setList={(state) => {
                                       dispatch({
                                           type: 'change',
                                           payload: {
                                               columns: state
                                           }
                                       })
                                   }}>
                        {
                            store.getState().columns.map(column => {
                                return <Column key={column.id} column={column}/>
                            })
                        }
                    </ReactSortable>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Columns;