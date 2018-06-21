// react imports
import React from 'react';

// project imports
import CardCreateUpdate from './CardCreateUpdate';

// 3rd party imports
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

it('Create button is present when creating a new card', () => {
  const props = {
    active: true,
    columnIndex: 1,
    cardIndex: -1,
    task: 'test task',
    toggleCardCreateUpdate: jest.fn(),
    editCardDetail: jest.fn(),
    createCard: jest.fn()
  };

  let cardCreateUpdate = shallow(<CardCreateUpdate {...props} />);
  expect(cardCreateUpdate.contains('Create')).toBeTruthy();
});

it('Save button is present when editing an existing card', () => {
  const props = {
    active: true,
    columnIndex: 1,
    cardIndex: 1,
    task: 'test task',
    toggleCardCreateUpdate: jest.fn(),
    editCardDetail: jest.fn(),
    createCard: jest.fn()
  };

  let cardCreateUpdate = shallow(<CardCreateUpdate {...props} />);
  expect(cardCreateUpdate.contains('Save')).toBeTruthy();
});
