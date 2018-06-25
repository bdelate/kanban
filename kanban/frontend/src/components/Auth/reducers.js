// 3rd party imports
import jwtDecode from 'jwt-decode';

const initialState = {
  token: validateAuthToken()
};

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
    default:
      return state;
  }
};

export default reducer;