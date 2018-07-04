export const saveToken = token => {
  return {
    type: 'SAVE_TOKEN',
    token: token
  };
};

export const logout = () => {
  return {
    type: 'LOGOUT'
  };
};
