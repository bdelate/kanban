// react imports
import React from 'react';

// project imports
import Card from '../../components/Card/Card';
import { DragTypes } from '../../DragTypes';

// 3rd party imports
import styled from 'styled-components';
import { DropTarget } from 'react-dnd';
import PropTypes from 'prop-types';


const propTypes = {
  columnIndex: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  cards: PropTypes.array.isRequired,
  reorderCard: PropTypes.func.isRequired,
  moveCard: PropTypes.func.isRequired,
  toggleColumn: PropTypes.func.isRequired,
  toggleCardCreateUpdate: PropTypes.func.isRequired
}

const ColumnContainer = styled.div`
  padding: 10px;
  margin: 10px;
  background-color: blue;
  flex: 1;
`;

const columnTarget = {

  drop(props, monitor, component) {
    if (monitor.getItem().columnIndex !== props.columnIndex) {
      props.moveCard(
        monitor.getItem().columnIndex,
        monitor.getItem().cardIndex,
        props.columnIndex
      )
    } else {
      const args = {
        hasDropped: true,
        columnIndex: monitor.getItem().columnIndex,
        toCardIndex: monitor.getItem().cardIndex
      };
      props.reorderCard(args)
    }
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget()
  };
}

const column = (props) => {
  const { connectDropTarget } = props;
  let output = null;
  if (props.spinner) {
    output = (
      <ColumnContainer>
        <i className="fas fa-spinner fa-spin"></i>
      </ColumnContainer>
    )
  } else {
    const cards = props.cards.map((card, index) => (
      <Card
        key={card.id}
        cardIndex={index}
        columnIndex={props.columnIndex}
        task={card.task}
        spinner={card.spinner}
        reorderCard={props.reorderCard}
        toggleCardCreateUpdate={props.toggleCardCreateUpdate}
      />
    ));

    output = <ColumnContainer innerRef={node => connectDropTarget(node)}>
      <i
        title="Collapse Column"
        className="fas fa-compress"
        onClick={() => props.toggleColumn(props.columnIndex)}
      ></i>
      <i
        title="Add Task"
        className="fas fa-plus"
        onClick={() => props.toggleCardCreateUpdate(true, props.columnIndex)}
      ></i>
      <i
        title="Change Column Name"
        className="fas fa-edit"
        onClick={() => props.toggleColumnCreateUpdate(true, props.columnIndex)}
      ></i>
      <h3>{props.name}</h3>
      {cards}
    </ColumnContainer>
  }

  return output;
};

column.propTypes = propTypes;

export default DropTarget(DragTypes.CARD, columnTarget, collect)(column);
