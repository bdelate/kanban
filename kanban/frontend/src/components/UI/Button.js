// react imports
import React from 'react';

// 3rd party imports
import styled from 'styled-components';

const Button = styled.button`
  border: 0;
  border-radius: 2px;
  padding: 10px;
  margin: 5px;
  background-color: #9a2b37;
  color: #fff;
  border: 1px solid #9a2b37;

  &:hover {
    cursor: pointer;
    background-color: #e8253a;
    border: 1px solid #e8253a;
  }

  &:disabled {
    cursor: not-allowed;
    background-color: transparent;
    border: 1px solid #fff;
  }
`;

const button = props => {
  return <Button {...props.domProps}>{props.children}</Button>;
};

export default button;
