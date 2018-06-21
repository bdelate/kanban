// react imports
import React from 'react';

// project imports
import Button from '../../components/UI/Button';

// 3rd party imports
import styled from 'styled-components';

const ControlsContainer = styled.div`
  padding: 10px;
`;

const boardControls = props => (
  <ControlsContainer>
    <Button
      domProps={{
        onClick: () => props.toggleColumnCreateUpdate(true)
      }}
    >
      Create Column
    </Button>
  </ControlsContainer>
);

export default boardControls;
