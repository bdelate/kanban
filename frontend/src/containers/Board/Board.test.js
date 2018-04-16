// react imports
import React, {Component} from 'react';

// container imports
import Board from './Board';

// component imports
import Column from '../../components/Column/Column';

// 3rd party imports
import {configure, shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({adapter: new Adapter()});

describe('Columns', () => {

  const board = shallow(<Board />);

  it('should have at least 3 columns', () => {
    expect(board.find(Column).length) >= 3;
  });
});
