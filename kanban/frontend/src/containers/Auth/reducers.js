// 3rd party imports
import jwtDecode from 'jwt-decode';

const initialState = {
  token: validateAuthToken()
};

// called when module is initially loaded which will save authToken to
// store if it exists and is valid
function validateAuthToken() {
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    const decodedToken = jwtDecode(authToken);
    if (new Date() <= new Date(decodedToken.exp * 1000)) return authToken;
  }
  return null;
}

function saveToken(state, token) {
  return {
    ...state,
    token: token
  };
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SAVE_TOKEN':
      return saveToken(state, action.token);
    case 'LOGOUT':
      return { ...state, token: null };
    default:
      return state;
  }
};

export default reducer;
