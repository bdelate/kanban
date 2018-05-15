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
  toggleCardCrud: PropTypes.func.isRequired
}

const ColumnContainer = styled.div`
  padding: 10px;
  margin: 10px;
  background-color: blue;
  flex: 1;
`;

const columnTarget = {

  drop(props, monitor, component) {
    props.moveCard(
      monitor.getItem().columnIndex,
      monitor.getItem().cardIndex,
      props.columnIndex
    );
  },
  // only moveCard if columns are different
  // same column reordering is handled by Card components hover method
  canDrop(props, monitor) {
    return monitor.getItem().columnIndex !== props.columnIndex;
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    canDrop: monitor.canDrop()
  };
}

const column = (props) => {
  const { connectDropTarget } = props;
  const cards = props.cards.map((card, index) => (
    <Card
      key={card.id}
      cardIndex={index}
      columnIndex={props.columnIndex}
      task={card.task}
      spinner={card.spinner}
      reorderCard={props.reorderCard}
      toggleCardCrud={props.toggleCardCrud}
    />
  ));

  return (
    <ColumnContainer innerRef={node => connectDropTarget(node)}>
      <i
        title="Collapse Column"
        className="fas fa-compress"
        onClick={() => props.toggleColumn(props.columnIndex)}
      ></i>
      <i
        title="Add Task"
        className="fas fa-plus"
        onClick={() => props.toggleCardCrud(true, props.columnIndex)}
      ></i>
      <h3>{props.name}</h3>
      {cards}
    </ColumnContainer>
  )
};

column.propTypes = propTypes;

export default DropTarget(DragTypes.CARD, columnTarget, collect)(column);
