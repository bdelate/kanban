// project imports
import { normalizeBoard } from '../../utilities/normalizer';

// 3rd party imports
import axios from 'axios';

function setBoard(result, entities) {
  return {
    type: 'SET_BOARD',
    result: result,
    entities: entities
  };
}

export const getBoard = id => {
  return dispatch => {
    axios
      .get(`/api/boards/${id}/`)
      .then(res => {
        const normalizedData = normalizeBoard(res.data);
        dispatch(setBoard(normalizedData.result, normalizedData.entities));
      })
      .catch(error => {
        // const message = 'Error: Unable to load board data';
        // this.setState({ retrievingData: false });
        // this.toggleInfoHandler(message);
      });
  };
};
