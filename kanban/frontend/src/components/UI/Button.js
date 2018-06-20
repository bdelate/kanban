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

  &:hover {
    cursor: pointer;
  }
`;

const button = props => (
  <Button onClick={() => props.clicked(props.onClickArgs)}>
    {props.children}
  </Button>
);

export default button;
