const initialState = {
  id: null,
  user: null,
  name: null,
  columns: [],
  retrievingData: true,
  infoModal: null
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'OVERWRITE_BOARD':
      return {
        ...state,
        ...action.board,
        retrievingData: false
      };
    case 'TOGGLE_RETRIEVING_DATA':
      return {
        ...state,
        retrievingData: action.retrievingData
      };
    default:
      return state;
  }
};

export default reducer;
