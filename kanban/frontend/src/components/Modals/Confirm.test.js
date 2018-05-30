// react imports
import React from 'react';

// project imports
import Confirm from './Confirm';

// 3rd party imports
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

it('calls confirmFunction when confirm is clicked', () => {
  const props = {
    message: 'test message',
    confirmFunction: jest.fn(),
    toggleConfirm: jest.fn()
  };

  let confirm = shallow(<Confirm {...props} />);
  confirm.find('#idConfirmFunction').simulate('click');
  expect(props.confirmFunction).toHaveBeenCalled();
});