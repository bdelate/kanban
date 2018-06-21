// react imports
import React from 'react';

// 3rd party imports
import styled from 'styled-components';

const Textarea = styled.textarea`
  border: 0;
  border-radius: 2px;
  padding: 10px;
  margin: 5px;
`;

const textarea = props => {
  return <Textarea {...props.domProps} />;
};

export default textarea;
