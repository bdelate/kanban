// react imports
import React, {Component} from 'react';

// component imports
import Card from '../../components/Card/Card';

// 3rd party imports
import {configure, shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({adapter: new Adapter()});

describe('Card with props', () => {

  test('card renders with task', () => {
    const card = shallow(
      <Card
        key={0}
        cardId={0}
        task={'This is a task'}
      />
    );
    const task = <span>This is a task</span>;
    expect(card.contains(task)).toEqual(true);
  });
});
