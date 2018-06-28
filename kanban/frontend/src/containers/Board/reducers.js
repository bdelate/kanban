const initialState = {
  entities: {
    boards: {},
    columns: {},
    cards: {},
    result: null // db board id
  },
  retrievingData: true,
  infoModal: null
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'BOARD_DATA_RECEIVED':
      return {
        ...state,
        result: action.result,
        entities: action.entities,
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
