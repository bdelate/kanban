// project imports
import { normalizeBoard } from '../../utilities/normalizer';

// 3rd party imports
import axios from 'axios';

function setBoard(result, entities) {
  return {
    type: 'BOARD_DATA_RECEIVED',
    result: result,
    entities: entities
  };
}

export const getBoard = id => {
  return dispatch => {
    dispatch(toggleRetrievingData(true));
    axios
      .get(`/api/boards/${id}/`)
      .then(res => {
        const normalizedData = normalizeBoard(res.data);
        dispatch(setBoard(normalizedData.result, normalizedData.entities));
      })
      .catch(error => {
        const message = 'Error: Unable to load board data';
        dispatch(toggleRetrievingData(false));
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
