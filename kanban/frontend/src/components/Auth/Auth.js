// react imports
import React, { Component } from 'react';

// project imports
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Info from './Info';

// 3rd party imports
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  display: flex;
  justify-content: center;
`;

const Card = styled.div`
  max-width: 30vw;
  margin: 15px;
  padding: 5px;
  border-radius: 2px;
  background-color: #c3d9e8;
  color: #000;
`;

const Link = styled.span`
  color: #00204a;
  font-weight: bold;
  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
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
          <p>
            <span>Existing user? </span>
            <Link
              id="idShowLogIn"
              onClick={() => this.toggleSubmitAction(false)}
            >
              Log in here
            </Link>
          </p>
        </div>
      );
    } else {
      submitSection = (
        <div>
          <Button domProps={{ type: 'submit' }}>Log In</Button>
          <p>
            <span>New user? </span>
            <Link
              id="idShowSignUp"
              onClick={() => this.toggleSubmitAction(true)}
            >
              Sign up here
            </Link>
          </p>
        </div>
      );
    }

    return (
      <Container>
        <Card>
          <Info />
        </Card>
        <Card>
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
        </Card>
      </Container>
    );
  }
}

export default Auth;
