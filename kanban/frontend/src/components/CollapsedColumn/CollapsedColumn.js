// react imports
import React from 'react';

// 3rd party imports
import styled from 'styled-components';
import PropTypes from 'prop-types';


const propTypes = {
  columnIndex: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  numCards: PropTypes.number.isRequired,
  toggleColumn: PropTypes.func.isRequired
}

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
        title="Expand Column"
        className="fas fa-expand"
        onClick={() => props.toggleColumn(props.columnIndex)}
      ></i>
      <span>{props.title}: {props.numCards} Tasks</span>
    </ColumnContainer>
  )
};

collapsedColumn.propTypes = propTypes;

export default collapsedColumn;
