// react imports
import React, { Component } from 'react';

// project imports
import Column from './Column';
import Card, { CardSource } from '../../components/Card/Card';

// 3rd party imports
import TestBackend from 'react-dnd-test-backend';
import { DragDropContext } from 'react-dnd';
import TestUtils from 'react-dom/test-utils';
import { configure, mount, shallow } from 'enzyme';
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

it('contains 0 cards in props and renders title and 0 cards', () => {
  const ColumnContext = wrapInTestContext(Column);
  const column = mount(
    <ColumnContext
      columnIndex={0}
      title={'This is a column title'}
      cards={[]}
      reorderCard={jest.fn()}
      moveCard={jest.fn()}
      toggleColumn={jest.fn()}
      toggleCardCrud={jest.fn()}
    />
  );

  const manager = column.instance().getManager()
  const backend = manager.getBackend()

  const title = <h3>This is a column title</h3>;
  expect(column.contains(title)).toEqual(true);
  expect(column.find(Card).length).toBe(0);
});

it('contains 2 cards in props and renders 2 cards', () => {
  const ColumnContext = wrapInTestContext(Column);
  const column = mount(
    <ColumnContext
      key={0}
      columnIndex={0}
      title={'This is a column title'}
      cards={[
        { cardId: 0, task: 'first task' },
        { cardId: 1, task: 'second task' },
      ]}
      reorderCard={jest.fn()}
      moveCard={jest.fn()}
      toggleColumn={jest.fn()}
      toggleCardCrud={jest.fn()}
    />
  );

  expect(column.find(Card).length).toBe(2);
});

it('calls moveCard when a different column card is dropped on it', () => {
  const ColumnContext = wrapInTestContext(Column);

  // create first column and get a ref to the cardId it contains
  const propsFirstColumn = {
    key: 0,
    columnIndex: 0,
    title: 'This is a column title',
    cards: [{ cardId: 0, task: 'first task' }],
    reorderCard: jest.fn(),
    moveCard: jest.fn(),
    toggleColumn: jest.fn(),
    toggleCardCrud: jest.fn(),
  };
  const firstColumn = mount(<ColumnContext {...propsFirstColumn} />);
  const card = firstColumn.find(CardSource).instance();
  const cardId = card.getHandlerId();

  // create second column and get a ref to its columnID (which is dropable)
  const propsSecondColumn = {
    key: 1,
    columnIndex: 1,
    title: 'This is a column title',
    cards: [{ cardId: 0, task: 'first task' }],
    reorderCard: jest.fn(),
    moveCard: jest.fn(),
    toggleColumn: jest.fn(),
    toggleCardCrud: jest.fn(),
  };
  const secondColumn = mount(<ColumnContext {...propsSecondColumn} />);
  const columnDropable = secondColumn.find(Column).instance();
  const columnDropableId = columnDropable.getHandlerId();

  // simulate card being dropped from first column to second column
  const manager = secondColumn.instance().getManager();
  const backend = manager.getBackend();
  backend.simulateBeginDrag([cardId]);
  backend.simulateHover([columnDropableId]);
  backend.simulateDrop();
  expect(propsSecondColumn.moveCard).toHaveBeenCalled();
});

it('does not call moveCard when a card is dropped on the same column', () => {
  const ColumnContext = wrapInTestContext(Column);

  // create column and get a ref to the cardId it contains
  const props = {
    key: 0,
    columnIndex: 0,
    title: 'test',
    cards: [{ cardId: 0, task: 'first task' }],
    reorderCard: jest.fn(),
    moveCard: jest.fn(),
    toggleColumn: jest.fn(),
    toggleCardCrud: jest.fn()
  };
  const column = mount(<ColumnContext {...props} />);
  const card = column.find(CardSource).instance();
  const cardId = card.getHandlerId();

  const columnDropable = column.find(Column).instance();
  const columnDropableId = columnDropable.getHandlerId();

  // simulate card being dropped from column to second column
  const manager = column.instance().getManager();
  const backend = manager.getBackend();
  backend.simulateBeginDrag([cardId]);
  backend.simulateHover([columnDropableId]);
  backend.simulateDrop();
  expect(props.moveCard).toHaveBeenCalledTimes(0);
});

it('should call toggleColumn when compress icon is clicked', () => {
  const ColumnContext = wrapInTestContext(Column);
  const props = {
    key: 0,
    columnIndex: 0,
    title: 'test',
    cards: [{ cardId: 0, task: 'first task' }],
    reorderCard: jest.fn(),
    moveCard: jest.fn(),
    toggleColumn: jest.fn(),
    toggleCardCrud: jest.fn()
  };
  const column = mount(<ColumnContext {...props} />);
  column.find('.fa-compress').simulate('click');
  expect(props.toggleColumn).toHaveBeenCalled();
});
