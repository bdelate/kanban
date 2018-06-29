// project imports
import { toggleInfoModal } from '../Home/actions';

// 3rd party imports
import axios from 'axios';

export const overwriteColumns = columns => {
  return {
    type: 'OVERWRITE_COLUMNS',
    columns: columns
  };
};

export const toggleSpinner = (id, displaySpinner) => {
  return {
    type: 'TOGGLE_SPINNER',
    id: id,
    spinner: displaySpinner
  };
};

export const setColumnName = (id, name) => {
  return {
    type: 'SET_COLUMN_NAME',
    id: id,
    name: name
  };
};

export const renameColumn = (id, name) => {
  return dispatch => {
    dispatch(toggleSpinner(id, true));
    const data = { id: id, name: name };
    axios
      .patch(`/api/columns/${id}/`, { ...data })
      .then(res => {
        dispatch(toggleSpinner(id, false));
        dispatch(setColumnName(res.data.id, res.data.name));
      })
      .catch(error => {
        dispatch(toggleSpinner(id, false));
        const message = 'Error: Unable to update column on the server';
        dispatch(toggleInfoModal(message));
      });
  };
};
