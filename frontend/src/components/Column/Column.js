// react imports
import React, { Component } from 'react';

// project imports
import Card from '../Card/Card';
import { DragTypes } from '../../DragTypes';

// 3rd party imports
import styled from 'styled-components';
import { DropTarget } from 'react-dnd';


const ColumnContainer = styled.div`
  padding: 15px;
  margin: 15px;
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
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget()
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
      />
    ));

    return (
      <ColumnContainer innerRef={node => connectDropTarget(node)}>
        <h3>{this.props.title}</h3>
        {cards}
      </ColumnContainer>

    )
  }
};

export default DropTarget(DragTypes.CARD, columnTarget, collect)(Column);
