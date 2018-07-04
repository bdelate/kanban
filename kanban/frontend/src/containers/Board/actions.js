// project imports
import { normalizeBoard } from '../../utilities/normalizer';
import * as columnActions from '../Column/actions';
import * as cardActions from '../Card/actions';

// 3rd party imports
import axios from 'axios';

function overwriteBoard(board) {
  return {
    type: 'OVERWRITE_BOARD',
    board: board
  };
}

export const getBoard = id => {
  return dispatch => {
    dispatch(toggleRetrievingData(true));
    axios
      .get(`/api/boards/${id}/`)
      .then(res => {
        const normalizedData = normalizeBoard(res.data);
        dispatch(cardActions.overwriteCards(normalizedData.entities.cards));
        dispatch(
          columnActions.overwriteColumns(normalizedData.entities.columns)
        );
        dispatch(overwriteBoard(normalizedData.entities.boards[id]));
      })
      .catch(error => {
        const message = 'Error: Unable to load board data';
        dispatch(toggleRetrievingData(false));
        dispatch(toggleInfoModal(message));
      });
  };
};

export const columnCreated = column => {
  return {
    type: 'COLUMN_CREATED',
    column: column
  };
};

// Create temporary column in store so that it renders with a spinner.
// Then create column on the server. If server creation succeeds, delete temp
// column and replace with server response (which contains correct id etc).
// If server creation fails, delete temp column and display error.
export const createColumn = column => {
  return dispatch => {
    dispatch(columnCreated(column));
    axios
      .post(`/api/columns/`, column)
      .then(res => {
        dispatch(columnActions.columnDeleted(column.id));
        dispatch(columnCreated(res.data));
      })
      .catch(error => {
        dispatch(columnActions.columnDeleted(column.id));
        const message = 'Error: Unable to create column on the server';
        dispatch(toggleInfoModal(message));
      });
  };
};

export const toggleRetrievingData = retrievingData => {
  return {
    type: 'TOGGLE_RETRIEVING_DATA',
    retrievingData: retrievingData
  };
};

export const toggleInfoModal = (message = null) => {
  return {
    type: 'TOGGLE_INFO_MODAL',
    infoModal: message
  };
};
