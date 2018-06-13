// 3rd party imports
import React from 'react';

// project imports
import Select from './Select';

// 3rd party imports
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

it('Renders select with options from props', () => {
  const props = {
    onChangeFunc: jest.fn(),
    options: {
      0: 'first board',
      1: 'second board'
    },
    selectedValue: -1
  };
  const select = shallow(<Select {...props} />);
  expect(select.children().length).toBe(3);  // includes default value
  const first_option = <option value="0">first board</option>;
  const second_option = <option value="1">second board</option>;
  expect(select.contains(first_option)).toEqual(true);
  expect(select.contains(second_option)).toEqual(true);
});

it('Calls onChangeFunc passed in from props when option is selected', () => {
  const props = {
    onChangeFunc: jest.fn(),
    options: {
      0: 'first board',
      1: 'second board'
    },
    selectedValue: -1
  };

  const event = {
    target: {
      selectedIndex: 1,
      options: [
        { value: 'first board' },
        { value: 'second board' }
      ]
    }
  };

  const select = shallow(<Select {...props} />);
  select.simulate('change', event);
  expect(props.onChangeFunc).toHaveBeenCalled();
});