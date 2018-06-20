// react imports
import React from 'react';

// 3rd party imports
import styled from 'styled-components';
import PropTypes from 'prop-types';

const propTypes = {
  toggleColumn: PropTypes.func.isRequired,
  toggleCardCreateUpdate: PropTypes.func.isRequired,
  toggleColumnCreateUpdate: PropTypes.func.isRequired,
  toggleConfirm: PropTypes.func.isRequired,
  columnIndex: PropTypes.number.isRequired,
  deleteColumn: PropTypes.func.isRequired
};

const Container = styled.div`
  display: flex;
  margin-bottom: 10px;
  border-radius: 5px 5px 0 0;
  padding: 8px;
  background-color: #fd5f00;
  .fas {
    color: #00204a;
  }
`;

const FlexEnd = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
  .fas {
    padding-left: 2px;
  }
`;

const Controls = props => (
  <Container>
    <i
      title="Collapse Column"
      className="fas fa-compress fa-lg"
      onClick={() => props.toggleColumn(props.columnIndex)}
    />
    <FlexEnd>
      <i
        title="Add Task"
        className="fas fa-plus fa-lg"
        onClick={() => props.toggleCardCreateUpdate(true, props.columnIndex)}
      />
      <i
        title="Change Column Name"
        className="fas fa-edit fa-lg"
        onClick={() => props.toggleColumnCreateUpdate(true, props.columnIndex)}
      />
      <i
        title="Delete Column"
        className="deleteColumn fas fa-trash-alt fa-lg"
        onClick={() =>
          props.toggleConfirm(
            'Column along within all of its cards will be permanently deleted',
            props.deleteColumn,
            props.columnIndex
          )
        }
      />
    </FlexEnd>
  </Container>
);

Controls.propTypes = propTypes;

export default Controls;
