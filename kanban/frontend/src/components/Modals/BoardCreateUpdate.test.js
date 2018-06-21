// react imports
import React from 'react';

// project imports
import BoardCreateUpdate from './BoardCreateUpdate';

// 3rd party imports
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

it('Create button is present when creating a new board', () => {
  const props = {
    toggleBoardCreateUpdate: jest.fn(),
    createBoard: jest.fn(),
    updateBoard: jest.fn()
  };

  let boardCreateUpdate = shallow(<BoardCreateUpdate {...props} />);
  expect(boardCreateUpdate.contains('Create')).toBeTruthy();
});

it('Save button is present when editing an existing board', () => {
  const props = {
    toggleBoardCreateUpdate: jest.fn(),
    createBoard: jest.fn(),
    updateBoard: jest.fn(),
    name: 'existing board'
  };

  let boardCreateUpdate = shallow(<BoardCreateUpdate {...props} />);
  expect(boardCreateUpdate.contains('Save')).toBeTruthy();
});
