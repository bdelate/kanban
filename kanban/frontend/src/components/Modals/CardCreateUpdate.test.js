// react imports
import React, { Component } from 'react';

// project imports
import CardCreateUpdate from './CardCreateUpdate';

// 3rd party imports
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

it('displays delete button only if editing an existing card', () => {
  const props = {
    active: true,
    columnIndex: 1,
    cardIndex: 1,
    task: 'test task',
    toggleCardCreateUpdate: jest.fn(),
    editCardDetail: jest.fn(),
    deleteCard: jest.fn(),
    createCard: jest.fn()
  };

  // delete button present
  let cardCreateUpdate = shallow(<CardCreateUpdate {...props} />);
  expect(cardCreateUpdate.find('#idDeleteCardButton').length).toBe(1);

  // delete button not present
  props.cardIndex = -1;
  cardCreateUpdate = shallow(<CardCreateUpdate {...props} />);
  expect(cardCreateUpdate.find('#idDeleteCardButton').length).toBe(0);
});

it('calls createCard when save is clicked on new card', () => {
  const props = {
    active: true,
    columnIndex: 1,
    cardIndex: -1,
    task: 'test task',
    toggleCardCreateUpdate: jest.fn(),
    editCardDetail: jest.fn(),
    deleteCard: jest.fn(),
    createCard: jest.fn()
  };

  let cardCreateUpdate = shallow(<CardCreateUpdate {...props} />);
  cardCreateUpdate.find('#idSaveCardButton').simulate('click');
  expect(props.createCard).toHaveBeenCalled();
});

it('calls editCardDetail when save is clicked on an existing card', () => {
  const props = {
    active: true,
    columnIndex: 1,
    cardIndex: 1,
    task: 'test task',
    toggleCardCreateUpdate: jest.fn(),
    editCardDetail: jest.fn(),
    deleteCard: jest.fn(),
    createCard: jest.fn()
  };

  let cardCreateUpdate = shallow(<CardCreateUpdate {...props} />);
  cardCreateUpdate.find('#idSaveCardButton').simulate('click');
  expect(props.editCardDetail).toHaveBeenCalled();
});