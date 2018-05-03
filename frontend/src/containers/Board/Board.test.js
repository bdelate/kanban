// react imports
import React, {Component} from 'react';

// container imports
import Board from './Board';
import Bla from './Board';

// component imports
import Column from '../../components/Column/Column';

// 3rd party imports
import TestBackend from 'react-dnd-test-backend';
import { DragDropContext } from 'react-dnd';
import TestUtils from 'react-dom/test-utils';
import {configure, shallow, mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({adapter: new Adapter()});

// Wraps a component in a DragDropContext that uses the dnd TestBackend.
function wrapInTestContext(DecoratedComponent) {
  return DragDropContext(TestBackend)(
    class TestContextContainer extends Component {
      render() {
        return <DecoratedComponent {...this.props} />;
      }
    }
  );
}

it('should have at least 3 columns', () => {
  const board = shallow(<Board />);
  expect(board.find(Column).length) >= 3;
});

it('should move card when moveCardHandler is called', () => {
  const state = {
    columns: [
      {
        columnId: 0,
        title: 'first column',
        cards: [
          {cardId: 0, task: 'first column first task'}
        ]
      }, {
        columnId: 1,
        title: 'second column',
        cards: []
      }
    ]
  };

  const board = shallow(<Board />);
  const boardInstance = board.dive().instance();
  boardInstance.setState(state);
  boardInstance.moveCardHandler(0, 0, 1);
  expect(boardInstance.state.columns[0].cards.length).toBe(0);
  expect(boardInstance.state.columns[1].cards.length).toBe(1);
  expect(boardInstance.state.columns[1].cards[0].task).toBe('first column first task');
});

it('should reorder when reorderCardHandler is called', () => {
  const state = {
    columns: [
      {
        columnId: 0,
        title: 'first column',
        cards: [
          {cardId: 0, task: 'first task'},
          {cardId: 1, task: 'second task'}
        ]
      }
    ]
  };

  const board = shallow(<Board />);
  const boardInstance = board.dive().instance();
  boardInstance.setState(state);
  boardInstance.reorderCardHandler(0, 0, 1);
  expect(boardInstance.state.columns[0].cards.length).toBe(2);
  expect(boardInstance.state.columns[0].cards[0].task).toBe('second task');
  expect(boardInstance.state.columns[0].cards[1].task).toBe('first task');
});
