const initialState = {};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'OVERWRITE_CARDS': // overwrite cards in all columns (eg: on board load)
      return { ...action.cards };
    default:
      return state;
  }
};

export default reducer;
