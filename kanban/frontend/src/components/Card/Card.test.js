// react imports
import React, { Component } from 'react';

// project imports
import Card, { CardSource } from './Card';

// 3rd party imports
import TestBackend from 'react-dnd-test-backend';
import { DragDropContext } from 'react-dnd';
import TestUtils from 'react-dom/test-utils';
import { configure, shallow, mount } from 'enzyme';
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

it('can be dragged', () => {
  const CardContext = wrapInTestContext(Card);
  const card = mount(
    <CardContext
      key={0}
      cardIndex={0}
      columnIndex={0}
      task={'This is a task'}
      reorderCard={jest.fn()}
      toggleCardCreateUpdate={jest.fn()}
    />
  );

  const manager = card.instance().getManager()
  const backend = manager.getBackend()
  const cardIntance = card.find(CardSource).instance()
  const cardIntanceId = cardIntance.getHandlerId()
  backend.simulateBeginDrag([cardIntanceId])
});
