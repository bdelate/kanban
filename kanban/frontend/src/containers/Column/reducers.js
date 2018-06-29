const initialState = {};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'OVERWRITE_COLUMNS':
      return { ...action.columns };
    case 'COLUMN_RENAMED':
      return {
        ...state,
        [action.id]: { ...state[action.id], name: action.name }
      };
    case 'COLUMN_DELETED':
      const columns = { ...state };
      delete columns[action.id];
      return columns;
    case 'TOGGLE_SPINNER':
      return {
        ...state,
        [action.id]: { ...state[action.id], spinner: action.spinner }
      };
    default:
      return state;
  }
};

export default reducer;
