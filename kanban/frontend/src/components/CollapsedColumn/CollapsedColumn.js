// react imports
import React from 'react';

// 3rd party imports
import styled from 'styled-components';
import PropTypes from 'prop-types';

const propTypes = {
  name: PropTypes.string.isRequired,
  numCards: PropTypes.number.isRequired,
  toggleCollapse: PropTypes.func.isRequired
};

const ColumnContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  margin: 10px;
  background-color: #00204a;
  border-radius: 5px;
  text-orientation: sideways;
  writing-mode: vertical-lr;
  .fas {
    color: #c3d9e8;
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
        className="fas fa-expand"
        onClick={props.toggleCollapse}
      />
      <Header>
        {props.name}: {props.numCards} Cards
      </Header>
    </ColumnContainer>
  );
};

collapsedColumn.propTypes = propTypes;

export default collapsedColumn;
