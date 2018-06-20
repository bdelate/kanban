// react imports
import React from 'react';

// 3rd party imports
import styled from 'styled-components';
import PropTypes from 'prop-types';

const propTypes = {
  columnIndex: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  numCards: PropTypes.number.isRequired,
  toggleColumn: PropTypes.func.isRequired
};

const ColumnContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  margin: 10px;
  background-color: #00204a;
  text-orientation: sideways;
  writing-mode: vertical-lr;
  .fas {
    color: #fd5f00;
  }
`;

const Header = styled.h3`
  padding-top: 15px;
  font-weight: 100;
`;

const collapsedColumn = props => {
  return (
    <ColumnContainer>
      <i
        title="Expand Column"
        className="fas fa-expand fa-lg"
        onClick={() => props.toggleColumn(props.columnIndex)}
      />
      <Header>
        {props.name}: {props.numCards} Tasks
      </Header>
    </ColumnContainer>
  );
};

collapsedColumn.propTypes = propTypes;

export default collapsedColumn;
