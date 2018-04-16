// react imports
import React from 'react';

// 3rd party imports
import styled from 'styled-components';


const ColumnContainer = styled.div`
  padding: 15px;
  margin: 15px;
  background-color: blue;
  height: 100%;
`;


const column = (props) => {
    return (
        <ColumnContainer>
            {props.id}<br />
            {props.title}
        </ColumnContainer>
    )
};

export default column;
