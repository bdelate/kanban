// react imports
import React from 'react';

// 3rd party imports
import styled from 'styled-components';


const ColumnContainer = styled.div`
  padding: 10px;
  margin: 10px;
  background-color: blue;
  text-orientation: sideways;
  writing-mode: vertical-lr;
`;

const collapsedColumn = (props) => {
  return (
    <ColumnContainer>
      <i
        id="test"
        title="Expand Column"
        className="fas fa-expand"
        onClick={() => props.toggleColumn(props.columnIndex)}
      ></i>
      <span>{props.title}: {props.numCards} Tasks</span>
    </ColumnContainer>
  )
};

export default collapsedColumn;
