// react imports
import React, { Component } from 'react';

// project imports
import Card from '../../components/Card/Card';
import { DragTypes } from '../../DragTypes';

// 3rd party imports
import styled from 'styled-components';
import { DropTarget } from 'react-dnd';


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

class Column extends Component {

  render() {
    const { connectDropTarget } = this.props;
    const cards = this.props.cards.map((card, index) => (
      <Card
        key={card.cardId}
        cardIndex={index}
        columnIndex={this.props.columnIndex}
        task={card.task}
        reorderCard={this.props.reorderCard}
      />
    ));

    return (
      <ColumnContainer innerRef={node => connectDropTarget(node)}>
        <i
          title="Collapse Column"
          className="fas fa-compress"
          onClick={() => this.props.toggleColumn(this.props.columnIndex)}
        ></i>
        <h3>{this.props.title}</h3>
        {cards}
      </ColumnContainer>

    )
  }
};

export default DropTarget(DragTypes.CARD, columnTarget, collect)(Column);
