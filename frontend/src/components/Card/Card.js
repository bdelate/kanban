// react imports
import React from 'react';

// 3rd party imports
import styled from 'styled-components';


const CardContainer = styled.div`
  padding: 15px;
  margin: 15px;
  background-color: red;
  flex: 1;
`;


const card = (props) => {
    return (
        <CardContainer>
            <span>{props.task}</span>
        </CardContainer>
    )
};

export default card;
