import React, { Component } from 'react';
import TestBackend from 'react-dnd-test-backend';
import { DragDropContext } from 'react-dnd';
import TestUtils from 'react-dom/test-utils';
// import expect from 'expect';
import Box from './Card';
import {configure, shallow, mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({adapter: new Adapter()});

/**
 * Wraps a component into a DragDropContext that uses the TestBackend.
 */
 function wrapInTestContext(DecoratedComponent) {
   return DragDropContext(TestBackend)(
     class TestContextContainer extends Component {
       render() {
         return <DecoratedComponent {...this.props} />;
       }
     }
   );
 }

it('can be tested with the testing backend', () => {
  // Render with the test context that uses the test backend
  const BoxContext = wrapInTestContext(Box);
  const root = mount(
    <BoxContext
      key={0}
      cardId={0}
      task={'This is a task'}
    />
  );

  const manager = root.instance().getManager()
  const backend = manager.getBackend()
  const nodeDraggable = root.find(Box).instance()
  expect(root.contains(<span>This is a task</span>)).toEqual(true);
  const sourceIdNodeDraggable = nodeDraggable.getHandlerId()
  backend.simulateBeginDrag([sourceIdNodeDraggable])
});
