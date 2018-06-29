const initialState = {};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'OVERWRITE_COLUMNS':
      return {
        ...state,
        ...action.columns
      };
    case 'SET_COLUMN_NAME':
      return {
        ...state,
        [action.id]: { ...state[action.id], name: action.name }
      };
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
