// 3rd party imports
import React, { Component } from 'react';

// project imports
import Auth from './Auth';
import { BoardComponentOnly } from '../../containers/Board/Board';

// 3rd party imports
import { configure, shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import moxios from 'moxios'

configure({ adapter: new Adapter() });

beforeEach(function () {
  // mock axios calls to the server
  moxios.install();
})

afterEach(function () {
  moxios.uninstall();
})

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

it('Updates error state if getAuthToken server call fails', async () => {
  moxios.stubRequest('/api/obtain-token/', {
    status: 400
  })
  const auth = shallow(<Auth />);
  const event = {
    preventDefault() { },
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
  })
  const auth = shallow(<Auth />);
  const event = {
    preventDefault() { },
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
  };
  global.localStorage = new LocalStorageMock;

  auth.instance().getAuthToken(event);
  await flushPromises();
  auth.update();
  expect(global.localStorage.getItem('authToken')).toEqual('testTokenValue');
});