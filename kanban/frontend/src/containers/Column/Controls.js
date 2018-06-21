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
  border-radius: 2px 2px 0 0;
  padding: 8px;
  background-color: #9a2b37;
  .fas {
    color: #c3d9e8;
  }
`;

const FlexEnd = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
  .fas {
    padding-left: 10px;
  }
`;

const Controls = props => (
  <Container>
    <i
      title="Collapse Column"
      className="fas fa-compress"
      onClick={() => props.toggleColumn(props.columnIndex)}
    />
    <FlexEnd>
      <i
        title="Add Task"
        className="fas fa-plus"
        onClick={() => props.toggleCardCreateUpdate(true, props.columnIndex)}
      />
      <i
        title="Change Column Name"
        className="fas fa-edit"
        onClick={() => props.toggleColumnCreateUpdate(true, props.columnIndex)}
      />
      <i
        title="Delete Column"
        className="deleteColumn fas fa-trash-alt"
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
