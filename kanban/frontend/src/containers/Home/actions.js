import axios from 'axios';

function setAvailableBoards(data) {
  return {
    type: 'SET_AVAILABLE_BOARDS',
    availableBoards: data
  };
}

function boardCreated(id, name) {
  return {
    type: 'BOARD_CREATED',
    newBoard: { id: id, name: name }
  };
}

function boardRenamed(id, name) {
  return {
    type: 'BOARD_RENAMED',
    board: { id: id, name: name }
  };
}

function boardDeleted(id) {
  return {
    type: 'BOARD_DELETED',
    id: id
  };
}

export const selectBoard = selectedBoardId => {
  return {
    type: 'SELECT_BOARD',
    selectedBoardId: parseInt(selectedBoardId, 10)
  };
};

export const getAvailableBoards = () => {
  return dispatch => {
    axios
      .get('/api/boards/')
      .then(res => {
        dispatch(setAvailableBoards(res.data));
      })
      .catch(error => {
        const message = 'Error: Unable to load board data';
        dispatch(toggleInfoModal(message));
      });
  };
};

export const createBoard = name => {
  return dispatch => {
    axios
      .post('/api/boards/', { name: name })
      .then(res => {
        dispatch(boardCreated(res.data.id, res.data.name));
      })
      .catch(error => {
        const message = 'Error: Unable to create board';
        dispatch(toggleInfoModal(message));
      });
  };
};

export const renameBoard = (id, name) => {
  return dispatch => {
    axios
      .patch(`/api/boards/${id}/`, { name: name })
      .then(res => {
        dispatch(boardRenamed(id, name));
      })
      .catch(error => {
        const message = 'Error: Unable to update board';
        dispatch(toggleInfoModal(message));
      });
  };
};

export const deleteBoard = id => {
  return dispatch => {
    axios
      .delete(`/api/boards/${id}/`)
      .then(res => {
        dispatch(boardDeleted(id));
      })
      .catch(error => {
        const message = 'Error: Unable to delete board';
        dispatch(toggleInfoModal(message));
      });
  };
};

export const toggleInfoModal = (message = null) => {
  return {
    type: 'TOGGLE_INFO_MODAL',
    infoModal: message
  };
};

export const toggleConfirmModal = (message = null) => {
  return {
    type: 'TOGGLE_CONFIRM_MODAL',
    confirmModal: message
  };
};
