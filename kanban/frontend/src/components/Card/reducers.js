const initialState = {};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'OVERWRITE_CARDS': // overwrite cards in all columns (eg: on board load)
      return { ...action.cards };
    case 'CARD_DELETED':
      const cards = { ...state };
      delete cards[action.id];
      return cards;
    case 'CARD_CREATED':
      return { ...state, [action.card.id]: { ...action.card } };
    default:
      return state;
  }
};

export default reducer;
