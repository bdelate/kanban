// react imports
import React from "react";

// project imports
import BoardCreateUpdate from "./BoardCreateUpdate";

// 3rd party imports
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

it("calls createBoard when save is clicked on new board", () => {
  const props = {
    toggleBoardCreateUpdate: jest.fn(),
    createBoard: jest.fn(),
    updateBoard: jest.fn()
  };

  let boardCreateUpdate = shallow(<BoardCreateUpdate {...props} />);
  boardCreateUpdate.find("#idSaveBoardButton").simulate("click");
  expect(props.createBoard).toHaveBeenCalled();
});
