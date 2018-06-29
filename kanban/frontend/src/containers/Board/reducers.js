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
    case 'COLUMN_CREATED':
      if (!state.columns.includes(action.id)) {
        return {
          ...state,
          columns: state.columns.concat(action.column.id)
        };
      }
      break;
    case 'COLUMN_DELETED':
      return {
        ...state,
        columns: state.columns.filter(id => id !== action.id)
      };
    default:
      return state;
  }
};

export default reducer;
