// react imports
import React, { Component } from 'react';

// project imports
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';

// 3rd party imports
import styled from 'styled-components';
import axios from 'axios';

const AuthContainer = styled.div`
  background-color: blue;
`;

class Auth extends Component {
  state = {
    error: false,
    submit: event => this.getAuthToken(event),
    newUser: false // used to differentiate login vs signup
  };

  getAuthToken = event => {
    event.preventDefault();
    this.setState({ error: false });
    const authData = {
      username: event.target.username.value,
      password: event.target.password.value
    };

    axios
      .post('/api/obtain-token/', authData)
      .then(res => {
        localStorage.setItem('authToken', res.data.token);
        this.props.history.push('/');
      })
      .catch(error => {
        this.setState({ error: 'Unable to login. Check Credentials.' });
      });
  };

  signUp = event => {
    event.preventDefault();
    this.setState({ error: false });
    const userData = {
      username: event.target.username.value,
      password: event.target.password.value
    };

    axios
      .post('/api/signup/', userData)
      .then(res => {
        localStorage.setItem('authToken', res.data.token);
        this.props.history.push('/');
      })
      .catch(error => {
        this.setState({ error: 'Unable to create user.' });
      });
  };

  // toggle between login or signup submit section and actions
  toggleSubmitAction = newUser => {
    if (newUser) {
      this.setState({
        submit: event => this.signUp(event),
        newUser: newUser
      });
    } else {
      this.setState({
        submit: event => this.getAuthToken(event),
        newUser: newUser
      });
    }
  };

  render() {
    const error = this.state.error ? <div>{this.state.error}</div> : null;

    let submitSection;
    if (this.state.newUser) {
      submitSection = (
        <div>
          <Button domProps={{ type: 'submit' }}>Sign Up</Button>
          <span>
            Existing user?
            <b id="idShowLogIn" onClick={() => this.toggleSubmitAction(false)}>
              Log in here
            </b>
          </span>
        </div>
      );
    } else {
      submitSection = (
        <div>
          <Button domProps={{ type: 'submit' }}>Log In</Button>
          <span>
            New user?
            <b id="idShowSignUp" onClick={() => this.toggleSubmitAction(true)}>
              Sign up here
            </b>
          </span>
        </div>
      );
    }

    return (
      <AuthContainer>
        {error}
        <form id="idAuthForm" onSubmit={this.state.submit}>
          <Input
            domProps={{
              type: 'text',
              name: 'username',
              required: 'required',
              placeholder: 'Username'
            }}
          />
          <Input
            domProps={{
              type: 'password',
              name: 'password',
              required: 'required',
              placeholder: 'Password'
            }}
          />
          {submitSection}
        </form>
      </AuthContainer>
    );
  }
}

export default Auth;
