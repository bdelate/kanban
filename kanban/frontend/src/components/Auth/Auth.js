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
    error: false,
    submit: (event) => this.getAuthToken(event),
    newUser: false  // used to differentiate login vs signup
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
        this.setState({ error: 'Unable to login. Check Credentials' });
      })
  }

  signUp = (event) => {
    event.preventDefault();
    this.setState({ error: false });
    const userData = {
      username: event.target.username.value,
      password: event.target.password.value
    };

    axios.post('/api/signup/', userData)
      .then(res => {
        localStorage.setItem('authToken', res.data.token);
        this.props.history.push('/');
      })
      .catch(error => {
        this.setState({ error: 'Unable to create user.' });
      })
  }

  // toggle between login or signup submit section and actions
  toggleSubmitAction = (newUser) => {
    if (newUser) {
      this.setState({
        submit: (event) => this.signUp(event),
        newUser: newUser
      })
    } else {
      this.setState({
        submit: (event) => this.getAuthToken(event),
        newUser: newUser
      })
    }
  };

  render() {
    const error = this.state.error
      ? <div>{this.state.error}</div>
      : null;

    let submitSection;
    if (this.state.newUser) {
      submitSection = <div>
        <button type="submit">Sign Up</button>
        <span>
          Existing user?
          <b
            id="idShowLogIn"
            onClick={() => this.toggleSubmitAction(false)}>Log in here</b>
        </span>
      </div>;
    } else {
      submitSection = <div>
        <button type="submit">Log In</button>
        <span>
          New user?
          <b
            id="idShowSignUp"
            onClick={() => this.toggleSubmitAction(true)}>Sign up here</b>
        </span>
      </div>;
    }

    return (
      <AuthContainer>
        {error}
        <form id="idAuthForm" onSubmit={this.state.submit}>
          <input type="text" name="username" required placeholder="Username" />
          <input type="password" name="password" required placeholder="Password" />
          {submitSection}
        </form>
      </AuthContainer>
    )
  }
}

export default Auth;
