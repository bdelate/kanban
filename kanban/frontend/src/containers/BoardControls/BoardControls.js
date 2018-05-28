// react imports
import React from 'react';

// project imports
import Button from '../../components/Button/Button';

// 3rd party imports
import styled from 'styled-components';

const ControlsContainer = styled.div`
  background-color: blue;
  padding: 10px;
`;

const boardControls = (props) => (
  <ControlsContainer>
    <Button
      clicked={props.toggleColumnModal}
      onClickArgs={true}
    >
      Create Column
    </Button>
  </ControlsContainer>
)

export default boardControls;
