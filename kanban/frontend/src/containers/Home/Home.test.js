// react imports
import React, { Component } from 'react';

// project imports
import Home from './Home';
import Board from '../Board/Board';
import Info from '../../components/Modals/Info';
import Confirm from '../../components/Modals/Confirm';

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
  });
  home.update();
  await flushPromises();
  expect(home.find(Board).length).toEqual(1);
});

it('createBoardHandler updates availableBoards and selectedBoardId', async () => {
  moxios.stubRequest('/api/boards/', {
    status: 201,
    response: {
      id: 5,
      name: 'new board'
    }
  });

  const availableBoards = { '5': 'new board' };

  const home = shallow(<Home />);
  home.instance().createBoardHandler('new board');
  await flushPromises();
  expect(home.state().availableBoards).toEqual(availableBoards);
  expect(home.state().selectedBoardId).toEqual(5);
});

it('createBoardHandler displays Info modal on failure', async () => {
  moxios.stubRequest('/api/boards/', {
    status: 400,
    response: {
      id: 5,
      name: 'new board'
    }
  });

  const availableBoards = {};

  const home = shallow(<Home />);
  home.instance().createBoardHandler('new board');
  await flushPromises();
  home.update();
  expect(home.state().availableBoards).toEqual(availableBoards);
  expect(home.state().selectedBoardId).toBeNull();
  expect(home.find(Info).length).toEqual(1);
});

it('toggleBoardCreateUpdateHandler updates state name only if updating', () => {
  const availableBoards = { 1: 'board name' };
  const home = shallow(<Home />);
  home.setState({ availableBoards: availableBoards, selectedBoardId: 1 });
  home.instance().toggleBoardCreateUpdateHandler();
  expect(home.state().boardCreateUpdate.name).toBeNull();
  home.instance().toggleBoardCreateUpdateHandler(true);
  expect(home.state().boardCreateUpdate.name).toBe('board name');
});

it('updateBoardHandler updates board name', async () => {
  moxios.stubRequest('/api/boards/5/', {
    status: 200,
    response: {
      id: 5,
      name: 'new name'
    }
  });

  const availableBoards = { 5: 'old name' };

  const home = shallow(<Home />);
  home.setState({ availableBoards: availableBoards, selectedBoardId: 5 });
  home.instance().updateBoardHandler('new name');
  await flushPromises();
  expect(home.state().availableBoards[5]).toEqual('new name');
});

it('updateBoardHandler displays Info modal on failure', async () => {
  moxios.stubRequest('/api/boards/5/', {
    status: 400,
    response: {
      id: 5,
      name: 'new name'
    }
  });

  const availableBoards = { 5: 'old name' };

  const home = shallow(<Home />);
  home.setState({ availableBoards: availableBoards, selectedBoardId: 5 });
  home.instance().updateBoardHandler('new name');
  await flushPromises();
  home.update();
  expect(home.state().availableBoards).toEqual(availableBoards);
  expect(home.find(Info).length).toEqual(1);
});

it('hides confirm modal when toggleConfirmHandler called with no args', () => {
  const home = shallow(<Home />);
  home.instance().toggleConfirmHandler();
  home.update();
  expect(home.find(Confirm).length).toEqual(0);
});

it('displays confirm modal when toggleConfirmHandler called with args', () => {
  const home = shallow(<Home />);
  home.instance().toggleConfirmHandler('test message', jest.fn());
  home.update();
  expect(home.find(Confirm).length).toEqual(1);
  expect(home.state().confirmModal.message).toEqual('test message');
  expect(home.state().confirmModal.confirmFunction).toEqual(
    expect.any(Function)
  );
});

it('deleteBoardHandler deletes board', async () => {
  moxios.stubRequest('/api/boards/5/', {
    status: 204,
    response: {}
  });
  const availableBoards = { 5: 'board one' };

  const home = shallow(<Home />);
  home.setState({ availableBoards: availableBoards, selectedBoardId: 5 });
  home.instance().deleteBoardHandler();
  await flushPromises();
  home.update();
  expect(home.state().availableBoards[5]).toBeUndefined();
  expect(home.state().selectedBoardId).toBeNull();
});

it('deleteBoardHandler displays Info Modal on failure', async () => {
  moxios.stubRequest('/api/boards/5/', {
    status: 404,
    response: {}
  });
  const availableBoards = { 5: 'board one' };

  const home = shallow(<Home />);
  home.setState({ availableBoards: availableBoards, selectedBoardId: 5 });
  home.instance().deleteBoardHandler();
  await flushPromises();
  home.update();
  expect(home.state().availableBoards[5]).toBe('board one');
  expect(home.state().selectedBoardId).toBe(5);
  expect(home.find(Info).length).toEqual(1);
});
