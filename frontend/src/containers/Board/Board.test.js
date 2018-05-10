// react imports
import React, { Component } from 'react';

// project imports
import Board, { BoardComponentOnly } from './Board';
import Column from '../Column/Column';
import CardCrud from '../../components/CardCrud/CardCrud';

// 3rd party imports
import TestBackend from 'react-dnd-test-backend';
import { DragDropContext } from 'react-dnd';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

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
          { cardId: 0, task: 'first column first task' }
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
          { cardId: 0, task: 'first task' },
          { cardId: 1, task: 'second task' }
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

it('should toggle column.collapsed when toggleColumnHandler is called', () => {
  const state = {
    columns: [
      {
        columnId: 0,
        title: 'first column',
        collapsed: false,
        cards: [
          { cardId: 0, task: 'first task' }
        ]
      }
    ]
  };

  const board = shallow(<Board />);
  const boardInstance = board.dive().instance();
  boardInstance.setState(state);
  boardInstance.toggleColumnHandler(0);
  expect(boardInstance.state.columns[0].collapsed).toBeTruthy();
});

it('toggles CardCrud component when toggleCardCrudHandler is called', () => {
  const board = shallow(<BoardComponentOnly />);
  // initially there is no modal
  expect(board.find(CardCrud).length).toBe(0);

  // display modal
  board.instance().toggleCardCrudHandler(true, 0);
  board.update();
  expect(board.find(CardCrud).length).toBe(1);

  // close modal
  board.instance().toggleCardCrudHandler(false);
  board.update();
  expect(board.find(CardCrud).length).toBe(0);
});

it('deletes card from state when deleteCardHandler is called with valid card', () => {
  const state = {
    columns: [
      {
        columnId: 0,
        title: 'first column',
        collapsed: false,
        cards: [
          { cardId: 0, task: 'first task' }
        ]
      }
    ]
  };
  const board = shallow(<BoardComponentOnly />);
  board.setState(state);
  board.instance().deleteCardHandler(0, 0);
  board.update();
  expect(board.state().columns[0].cards.length).toBe(0);
});

it('edit card state when editCardHandler is called with valid card', () => {
  const state = {
    columns: [
      {
        columnId: 0,
        title: 'first column',
        collapsed: false,
        cards: [{ cardId: 0, task: 'first task' }]
      }
    ]
  };
  const board = shallow(<BoardComponentOnly />);
  board.setState(state);
  board.instance().editCardHandler(0, 0, 'new task text');
  board.update();
  expect(board.state().columns[0].cards[0].task).toEqual('new task text');
});

it('create new card when createCardHandler is called with valid card', () => {
  const state = {
    columns: [
      {
        columnId: 0,
        title: 'first column',
        collapsed: false,
        cards: []
      }
    ]
  };
  const board = shallow(<BoardComponentOnly />);
  board.setState(state);
  board.instance().createCardHandler(0, 'new task');
  board.update();
  expect(board.state().columns[0].cards.length).toBe(1);
  expect(board.state().columns[0].cards[0].task).toEqual('new task');
});

