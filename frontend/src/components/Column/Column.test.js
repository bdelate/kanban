// react imports
import React, {Component} from 'react';

// component imports
import Column from '../../components/Column/Column';
import Card from '../../components/Card/Card';

// 3rd party imports
import {configure, shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({adapter: new Adapter()});

describe('Column containing cards', () => {

  test('0 cards in props renders title and 0 cards', () => {
    const column = shallow(
      <Column
        key={0}
        id={0}
        title={'This is a column title'}
        cards={[]}
      />
    );
    const title = <h3>This is a column title</h3>;
    expect(column.contains(title)).toEqual(true);
    expect(column.find(Card).length).toBe(0);
  });

  test('2 cards in props renders title and 2 cards', () => {
    const column = shallow(
      <Column
        key={0}
        id={0}
        title={'This is a column title'}
        cards={[
          {cardId: 0, task: 'first task'},
          {cardId: 1, task: 'second task'},
        ]}
      />
    );
    const title = <h3>This is a column title</h3>;
    expect(column.contains(title)).toEqual(true);
    expect(column.find(Card).length).toBe(2);
  });
});
