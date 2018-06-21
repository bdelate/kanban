// react imports
import React, { Component } from 'react';

// project imports
import ColumnCreateUpdate from './ColumnCreateUpdate';

// 3rd party imports
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

it('Create button is present when creating a new column', () => {
  const props = {
    active: true,
    columnIndex: -1,
    name: 'new column',
    toggleColumnCreateUpdate: jest.fn(),
    editColumnName: jest.fn(),
    createColumn: jest.fn()
  };

  let columnCreateUpdate = shallow(<ColumnCreateUpdate {...props} />);
  expect(columnCreateUpdate.contains('Create')).toBeTruthy();
});

it('Save button is present when editing an existing column', () => {
  const props = {
    active: true,
    columnIndex: 1,
    name: 'existing column',
    toggleColumnCreateUpdate: jest.fn(),
    editColumnName: jest.fn(),
    createColumn: jest.fn()
  };

  let columnCreateUpdate = shallow(<ColumnCreateUpdate {...props} />);
  expect(columnCreateUpdate.contains('Save')).toBeTruthy();
});
