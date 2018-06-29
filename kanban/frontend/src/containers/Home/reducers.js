const initialState = {
  selectedBoardId: null,
  availableBoards: {},
  infoModal: null
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SELECT_BOARD':
      return { ...state, selectedBoardId: action.selectedBoardId };
    case 'BOARD_CREATED':
      return {
        ...state,
        selectedBoardId: action.newBoard.id,
        availableBoards: {
          ...state.availableBoards,
          [action.newBoard.id]: action.newBoard.name
        }
      };
    case 'BOARD_RENAMED':
      const availableBoards = { ...state.availableBoards };
      availableBoards[action.board.id] = action.board.name;
      return {
        ...state,
        availableBoards: availableBoards
      };
    case 'BOARD_DELETED':
      const updatedBoards = { ...state.availableBoards };
      delete updatedBoards[action.id];
      return {
        ...state,
        selectedBoardId: null,
        availableBoards: updatedBoards
      };
    case 'SET_AVAILABLE_BOARDS':
      return { ...state, availableBoards: action.availableBoards };
    case 'TOGGLE_INFO_MODAL':
      return { ...state, infoModal: action.infoModal };
    case 'TOGGLE_CONFIRM_MODAL':
      return { ...state, confirmModal: action.confirmModal };
    default:
      return state;
  }
};

export default reducer;
