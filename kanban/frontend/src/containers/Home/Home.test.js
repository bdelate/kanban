// react imports
import React, { Component } from 'react';

// project imports
import Home from './Home';
import Board from '../Board/Board';
import Info from '../../components/Modals/Info';

// 3rd party imports
import { configure, shallow } from 'enzyme';
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

it('calls retrieveData when mounted if logged in', () => {
  const isLoggedIn = jest.fn();
  isLoggedIn.mockReturnValue(true);
  Home.prototype.isLoggedIn = isLoggedIn;
  Home.prototype.retrieveData = jest.fn();
  const home = shallow(<Home />);
  expect(isLoggedIn).toHaveBeenCalled();
  expect(Home.prototype.retrieveData).toHaveBeenCalled();
});

it('does not call retrieveData when mounted if not logged in', () => {
  const props = {
    history: {
      push: jest.fn()
    }
  };
  const isLoggedIn = jest.fn();
  isLoggedIn.mockReturnValue(false);
  Home.prototype.isLoggedIn = isLoggedIn;
  Home.prototype.retrieveData = jest.fn();
  const home = shallow(<Home {...props} />);
  expect(Home.prototype.retrieveData).toHaveBeenCalledTimes(0);
});

it('Displays a board if authToken and selectedBoardId is set', async () => {
  const isLoggedIn = jest.fn();
  isLoggedIn.mockReturnValue(true);
  Home.prototype.isLoggedIn = isLoggedIn;

  const home = shallow(<Home />);
  expect(home.find(Board).length).toEqual(0);

  home.setState({
    authToken: 'authToken',
    selectedBoardId: 1
  })
  home.update()
  await flushPromises()
  expect(home.find(Board).length).toEqual(1);
});