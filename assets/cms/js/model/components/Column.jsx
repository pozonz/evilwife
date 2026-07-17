import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import store from "../store";
import Select from 'react-select';

import {makeStyles} from '@material-ui/core/styles';
import {Modal} from '@material-ui/core';

import {ReactSortable} from "react-sortablejs";

const getColumnById = (columns, id) => {
    for (let idx in columns) {
        let column = columns[idx];
        if (column.id == id) {
            return column;
        }
    }
    return null;
}

const changeColumn = (state, dispatch, id, attribute, value) => {
    let column = getColumnById(state.columns, id);
    if (column) {
        column[attribute] = value;
        dispatch({
            type: 'change',
            payload: {
                columns: state.columns
            }
        });
    }
}

const deleteColumn = (state, dispatch, id) => {
    let columns = state.columns.filter(column => {
        return column.id == id ? 0 : 1;
    });

    dispatch({
        type: 'change',
        payload: {
            columns: columns
        }
    });
}

const getModalStyle = () => {
    const top = 50;
    const left = 50;

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}

const useStyles = makeStyles((theme) => ({
    paper: {
        position: 'absolute',
        width: 400,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

const Column = (props) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state);

    const classes = useStyles();
    const [modalStyle] = React.useState(getModalStyle);
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const relationalWidgets = window._relationalWidgets;

    let column = props.column;
    return (
        <tbody key={column.id}>
        <tr>
            <td width="215px">
                <select className="form-control" defaultValue={column.widget} onChange={(ev) => changeColumn(state, dispatch, column.id, 'widget', ev.target.value)}>
                    {
                        store.getState().widgets.map(widget => <option key={widget} value={widget}>{widget}</option>)
                    }
                </select>
            </td>
            <td width="250px"><input type="text" placeholder="Label" className="form-control" defaultValue={column.label} onKeyUp={(ev) => changeColumn(state, dispatch, column.id, 'label', ev.target.value)}/></td>
            <td width="250px"><input type="text" placeholder="field" className="form-control" defaultValue={column.field} onKeyUp={(ev) => changeColumn(state, dispatch, column.id, 'field', ev.target.value)} disabled={column.field == 'title' ? true : false}/></td>
            <td width="100px">
                <div className="checkbox">
                    <input id={'column_required_' + column.id} type="checkbox" defaultChecked={column.required == 1 ? 'checked' : ''} onChange={(ev) => changeColumn(state, dispatch, column.id, 'required', ev.target.checked ? 1 : 0)}/>
                    <label htmlFor={'column_required_' + column.id}></label>
                </div>
            </td>
            <td width="100px">
                <div className="checkbox">
                    <input id={'column_unique_' + column.id} type="checkbox" defaultChecked={column.unique == 1 ? 'checked' : ''} onChange={(ev) => changeColumn(state, dispatch, column.id, 'unique', ev.target.checked ? 1 : 0)}/>
                    <label htmlFor={'column_unique_' + column.id}></label>
                </div>
            </td>
            <td>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                >
                    <div style={modalStyle} className={classes.paper}>
                        <label className="alert alert-light model-column-id">{column.id}</label>
                        <h2 className="pb-2">{column.label}</h2>
                        <div className="row">
                            <div className="col-lg-12 form-group">
                                <div className="checkbox">
                                    <input type="checkbox" id={'modal_listing_' + column.id} required="required" onChange={(ev) => changeColumn(state, dispatch, column.id, 'listing', ev.target.checked ? 1 : 0)} defaultChecked={column.listing == 1 ? 'checked' : ''}/>
                                    <label htmlFor={'modal_listing_' + column.id} className="required">Show in listing table</label>
                                </div>
                            </div>

                            <div className="col-lg-12 form-group">
                                <label htmlFor={'model_listingWidth_' + column.id} className="required">Table column width (px):</label>
                                <input type="text" id={'model_listingWidth_' + column.id} required="required" className="form-control form-control" onKeyUp={(ev) => changeColumn(state, dispatch, column.id, 'listingWidth', ev.target.value)} defaultValue={column.listingWidth}/>
                            </div>

                            <div className="col-lg-12 form-group">
                                <label htmlFor={'model_listingTitle_' + column.id} className="required">Table column title (optional):</label>
                                <input type="text" id={'model_listingTitle_' + column.id} required="required" className="form-control form-control" onKeyUp={(ev) => changeColumn(state, dispatch, column.id, 'listingTitle', ev.target.value)} defaultValue={column.listingTitle}/>
                            </div>

                            {
                                (relationalWidgets.indexOf(column.widget) === -1) && (
                                    <div className="col-lg-12 form-group">
                                        <div className="checkbox">
                                            <input type="checkbox" id={'modal_queryable_' + column.id} required="required" onChange={(ev) => changeColumn(state, dispatch, column.id, 'queryable', ev.target.checked ? 1 : 0)} defaultChecked={column.queryable == 1 ? 'checked' : ''}/>
                                            <label htmlFor={'modal_queryable_' + column.id} className="required">Queryable in CMS search</label>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </Modal>

                <button onClick={handleOpen} type="button" title="Edit" className={(column.listing ? 'text-warning' : '') + ' btn btn-simple btn-default btn-icon table-action edit'}><i className="ti-more-alt"></i></button>
                {
                    column.field != 'title' && (
                        <button type="button" title="Remove" className="btn btn-simple btn-danger btn-icon table-action remove"><i className="ti-close" onClick={() => deleteColumn(state, dispatch, column.id)}></i></button>
                    )
                }
            </td>
        </tr>
        {
            (relationalWidgets.indexOf(column.widget) !== -1) && (
                <tr>
                    <td></td>
                    <td colSpan="4">
                        <textarea data-gramm_editor="false" className="form-control" rows="3" defaultValue={column.sqlQuery} onKeyUp={(ev) => changeColumn(state, dispatch, column.id, 'sqlQuery', ev.target.value)}></textarea>
                    </td>
                    <td></td>
                </tr>
            )
        }
        </tbody>
    );
};

export default Column;