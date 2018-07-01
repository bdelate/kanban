const initialState = {};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'OVERWRITE_COLUMNS':
      return { ...action.columns };
    case 'COLUMN_CREATED':
      return { ...state, [action.column.id]: { ...action.column } };
    case 'COLUMN_RENAMED':
      return {
        ...state,
        [action.id]: { ...state[action.id], name: action.name }
      };
    case 'COLUMN_DELETED':
      const columns = { ...state };
      delete columns[action.id];
      return columns;
    case 'CARD_CREATED':
      const column = {
        ...state[action.card.column_id],
        cards: [...state[action.card.column_id].cards]
      };
      if (!column.cards.includes(action.card.id)) {
        column.cards = column.cards.concat(action.card.id);
        return { ...state, [action.card.column_id]: column };
      }
      break;
    case 'CARD_DELETED':
      const cards = state[action.column_id].cards.filter(
        id => id !== action.id
      );
      return {
        ...state,
        [action.column_id]: { ...state[action.column_id], cards: cards }
      };
    case 'CARD_MOVED':
      const fromColumn = { ...state[action.fromColumnId] };
      fromColumn.cards = fromColumn.cards.filter(id => id !== action.cardId);
      return {
        ...state,
        [action.fromColumnId]: fromColumn,
        [action.toColumnId]: {
          ...state[action.toColumnId],
          cards: state[action.toColumnId].cards.concat(action.cardId)
        }
      };
    case 'CARDS_REORDERED':
      const cardIds = [...state[action.column_id].cards];
      const temp = cardIds[action.fromCardIndex];
      cardIds[action.fromCardIndex] = cardIds[action.toCardIndex];
      cardIds[action.toCardIndex] = temp;
      return {
        ...state,
        [action.column_id]: { ...state[action.column_id], cards: cardIds }
      };
    case 'TOGGLE_COLUMN_SPINNER':
      return {
        ...state,
        [action.id]: { ...state[action.id], spinner: action.spinner }
      };
    default:
      return state;
  }
};

export default reducer;
