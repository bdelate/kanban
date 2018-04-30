// react imports
import React, {Component} from 'react';

// component imports
import Column from '../../components/Column/Column';
import Card from '../../components/Card/Card';

// 3rd party imports
import TestBackend from 'react-dnd-test-backend';
import { DragDropContext } from 'react-dnd';
import TestUtils from 'react-dom/test-utils';
import {configure, mount} from 'enzyme';
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

it('contains 0 cards in props and renders title and 0 cards', () => {
  const ColumnContext = wrapInTestContext(Column);
  const column = mount(
    <ColumnContext
      key={0}
      id={0}
      title={'This is a column title'}
      cards={[]}
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
      cards={[
        {cardId: 0, task: 'first task'},
        {cardId: 1, task: 'second task'},
      ]}
    />
  );

  expect(column.find(Card).length).toBe(2);
});

it('can have a card dropped on it', () => {
  const props = {
    moveCard: jest.fn(),
    key: 0,
    columnIndex: 0,
    cards: [{cardId: 0, task: 'first task'}]
  };

  const ColumnContext = wrapInTestContext(Column);
  const column = mount(<ColumnContext {...props} />);

  const card = column.find(Card).instance();
  const cardId = card.getHandlerId();

  const columnDropable = column.find(Column).instance();
  const columnDropableId = columnDropable.getHandlerId();

  // get testing backend and simulate card being dropped
  const manager = column.instance().getManager();
  const backend = manager.getBackend();
  backend.simulateBeginDrag([cardId]);
  backend.simulateHover([columnDropableId]);
  backend.simulateDrop();
  expect(props.moveCard).toHaveBeenCalled();
});
