// react imports
import React, { Component } from 'react';

// project imports
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Info from './Info';
import * as actions from './actions';

// 3rd party imports
import styled from 'styled-components';
import axios from 'axios';
import { connect } from 'react-redux';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 200px;
  max-width: 30vw;
  margin: 15px;
  padding: 5px;
  border-radius: 2px;
  background-color: #c3d9e8;
  color: #000;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  justify-items: center;
  min-width: 200px;
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
        this.props.saveToken(res.data.token);
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
        this.props.saveToken(res.data.token);
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
          <Form id="idAuthForm" onSubmit={this.state.submit}>
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
          </Form>
        </Card>
      </Container>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    saveToken: token => dispatch(actions.saveToken(token))
  };
};

// component only export used for testing
export const AuthComponentOnly = Auth;

export default connect(
  null,
  mapDispatchToProps
)(Auth);
