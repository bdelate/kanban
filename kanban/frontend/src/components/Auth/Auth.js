// react imports
import React, { Component } from 'react';

// 3rd party imports
import styled from 'styled-components';
import axios from 'axios';


const AuthContainer = styled.div`
  background-color: blue;
`;

class Auth extends Component {

  state = {
    error: false
  };

  getAuthToken = (event) => {
    event.preventDefault();
    this.setState({ error: false });
    const authData = {
      username: event.target.username.value,
      password: event.target.password.value
    };

    axios.post('/api/obtain-token/', authData)
      .then(res => {
        localStorage.setItem('authToken', res.data.token);
        this.props.history.push('/');
      })
      .catch(error => {
        this.setState({ error: true });
      })
  }

  render() {
    const error = this.state.error
      ? <div>Unable to login. Check Credentials</div>
      : null;
    return (
      <AuthContainer>
        {error}
        <form onSubmit={(event) => this.getAuthToken(event)}>
          <input type="text" name="username" required placeholder="Username" />
          <input type="password" name="password" required placeholder="Password" />
          <button type="submit">Login</button>
        </form>
      </AuthContainer>
    )
  }
}

export default Auth;
