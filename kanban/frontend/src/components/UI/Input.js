// react imports
import React from 'react';

// 3rd party imports
import styled from 'styled-components';

const Input = styled.input`
  border: 0;
  border-radius: 2px;
  padding: 10px;
  margin: 5px;
`;

const input = props => {
  return <Input {...props.domProps} />;
};

export default input;
