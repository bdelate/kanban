// react imports
import React, {Component} from 'react';

// project imports
import TaskCrud from './TaskCrud';

// 3rd party imports
import {configure, shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({adapter: new Adapter()});

it('has delete button only if displaying an existing card', () => {
    const props = {
      active: true,
      cardIndex: 1,
      columnIndex: 1,
      task: 'test task',
    };
    const button = <button>Delete</button>;

    // delete button present
    let taskCrud = shallow(<TaskCrud {...props} />);
    expect(taskCrud.contains(button)).toEqual(true);

    // delete button not present
    props.cardIndex = -1;
    taskCrud = shallow(<TaskCrud {...props} />);
    expect(taskCrud.contains(button)).toEqual(false);
  });