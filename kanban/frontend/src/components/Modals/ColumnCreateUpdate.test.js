// react imports
import React, { Component } from 'react';

// project imports
import ColumnCreateUpdate from './ColumnCreateUpdate';

// 3rd party imports
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

it('calls createColumn when save is clicked on new column', () => {
  const props = {
    active: true,
    columnIndex: -1,
    name: 'new column',
    toggleColumnCreateUpdate: jest.fn(),
    editColumnName: jest.fn(),
    createColumn: jest.fn()
  };

  let columnCreateUpdateModal = shallow(<ColumnCreateUpdate {...props} />);
  columnCreateUpdateModal.find('#idSaveColumnButton').simulate('click');
  expect(props.createColumn).toHaveBeenCalled();
});

it('calls editColumnName when save is clicked on an existing column', () => {
  const props = {
    active: true,
    columnIndex: 1,
    name: 'existing column',
    toggleColumnCreateUpdate: jest.fn(),
    editColumnName: jest.fn(),
    createColumn: jest.fn()
  };

  let columnCreateUpdateModal = shallow(<ColumnCreateUpdate {...props} />);
  columnCreateUpdateModal.find('#idSaveColumnButton').simulate('click');
  expect(props.editColumnName).toHaveBeenCalled();
});