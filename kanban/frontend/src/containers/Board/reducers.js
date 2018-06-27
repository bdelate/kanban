const initialState = {
  entities: {
    boards: {},
    columns: {},
    cards: {},
    result: null // db board id
  },
  retrievingData: false,
  infoModal: null
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_BOARD':
      return {
        ...state,
        result: action.result,
        entities: action.entities
      };
    default:
      return state;
  }
};

export default reducer;
