// react imports
import React, { Component } from 'react';

// project imports
import CollapsedColumn from './CollapsedColumn';

// 3rd party imports
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

it('should call toggleColumn when expand icon is clicked', () => {
  const props = {
    key: 0,
    columnIndex: 0,
    name: 'test',
    numCards: 3,
    toggleColumn: jest.fn()
  };
  const column = shallow(<CollapsedColumn {...props} />);
  column.find('.fa-expand').simulate('click');
  expect(props.toggleColumn).toHaveBeenCalled();
});
