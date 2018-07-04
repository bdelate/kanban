// 3rd party imports
import React from 'react';

// project imports
import Auth, { AuthComponentOnly } from './Auth';

// 3rd party imports
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import moxios from 'moxios';

configure({ adapter: new Adapter() });

beforeEach(function() {
  // mock axios calls to the server
  moxios.install();
});

afterEach(function() {
  moxios.uninstall();
});

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

it('Updates error state if getAuthToken server call fails', async () => {
  moxios.stubRequest('/api/obtain-token/', {
    status: 400
  });
  const auth = shallow(<AuthComponentOnly />);
  const event = {
    preventDefault() {},
    target: {
      username: { value: 'john' },
      password: { password: 'password' }
    }
  };
  auth.instance().getAuthToken(event);
  await flushPromises();
  auth.update();
  expect(auth.state().error).toBeTruthy();
});

it('Saves token when getAuthToken server call succeeds', async () => {
  moxios.stubRequest('/api/obtain-token/', {
    status: 200,
    response: {
      token: 'testTokenValue'
    }
  });
  const auth = shallow(<AuthComponentOnly />);
  const event = {
    preventDefault() {},
    target: {
      username: { value: 'john' },
      password: { password: 'password' }
    }
  };

  class LocalStorageMock {
    constructor() {
      this.store = {};
    }

    getItem(key) {
      return this.store[key] || null;
    }

    setItem(key, value) {
      this.store[key] = value.toString();
    }
  }
  global.localStorage = new LocalStorageMock();

  auth.instance().getAuthToken(event);
  await flushPromises();
  auth.update();
  expect(global.localStorage.getItem('authToken')).toEqual('testTokenValue');
});

it('Updates error state if signUp server call fails', async () => {
  moxios.stubRequest('/api/signup/', {
    status: 400
  });
  const auth = shallow(<AuthComponentOnly />);
  const event = {
    preventDefault() {},
    target: {
      username: { value: 'john' },
      password: { password: 'password' }
    }
  };
  auth.instance().signUp(event);
  await flushPromises();
  auth.update();
  expect(auth.state().error).toBeTruthy();
});

it('Saves token when signUp server call succeeds', async () => {
  moxios.stubRequest('/api/signup/', {
    status: 200,
    response: {
      token: 'testTokenValue'
    }
  });
  const auth = shallow(<AuthComponentOnly />);
  const event = {
    preventDefault() {},
    target: {
      username: { value: 'john' },
      password: { password: 'password' }
    }
  };

  class LocalStorageMock {
    constructor() {
      this.store = {};
    }

    getItem(key) {
      return this.store[key] || null;
    }

    setItem(key, value) {
      this.store[key] = value.toString();
    }
  }
  global.localStorage = new LocalStorageMock();

  auth.instance().signUp(event);
  await flushPromises();
  auth.update();
  expect(global.localStorage.getItem('authToken')).toEqual('testTokenValue');
});

it('Can toggle between signup / login and set correct submit function', () => {
  const auth = shallow(<AuthComponentOnly />);
  auth.instance().signUp = jest.fn();
  auth.instance().getAuthToken = jest.fn();

  // toggle to signup form and test submission
  auth.find('#idShowSignUp').simulate('click');
  expect(auth.state().newUser).toBeTruthy();
  expect(auth.find('#idShowSignUp').length).toBe(0);
  expect(auth.find('#idShowLogIn').length).toBe(1);
  auth.find('#idAuthForm').simulate('submit');
  expect(auth.instance().signUp).toHaveBeenCalledTimes(1);

  // toggle to login form and test submission
  auth.find('#idShowLogIn').simulate('click');
  expect(auth.state().newUser).toBeFalsy();
  expect(auth.find('#idShowLogIn').length).toBe(0);
  expect(auth.find('#idShowSignUp').length).toBe(1);
  auth.find('#idAuthForm').simulate('submit');
  expect(auth.instance().getAuthToken).toHaveBeenCalledTimes(1);
});
