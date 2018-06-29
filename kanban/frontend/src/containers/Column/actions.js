// project imports
import { toggleInfoModal } from '../Home/actions';
import { normalizeColumn } from '../../utilities/normalizer';

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

export const columnRenamed = (id, name) => {
  return {
    type: 'COLUMN_RENAMED',
    id: id,
    name: name
  };
};

export const columnDeleted = id => {
  return {
    type: 'COLUMN_DELETED',
    id: id
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
        dispatch(columnRenamed(res.data.id, res.data.name));
      })
      .catch(error => {
        dispatch(toggleSpinner(id, false));
        const message = 'Error: Unable to update column on the server';
        dispatch(toggleInfoModal(message));
      });
  };
};

// if last column was deleted, only that column is removed from server, board
// and column store. If non last column was deleted, remaining columns are
// overwritten to reflect their updated position_ids received from the server
export const deleteColumn = id => {
  return dispatch => {
    dispatch(toggleSpinner(id, true));
    axios
      .delete(`/api/columns/${id}/`)
      .then(res => {
        dispatch(columnDeleted(id));
        if (res.data !== '') {
          const normalizedData = normalizeColumn(res.data);
          dispatch(overwriteColumns(normalizedData.entities.columns));
        }
      })
      .catch(error => {
        dispatch(toggleSpinner(id, false));
        const message = 'Error: Unable to delete column on the server';
        dispatch(toggleInfoModal(message));
      });
  };
};
