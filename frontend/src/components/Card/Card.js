// react imports
import React from 'react';

// project imports
import { DragTypes } from '../../DragTypes';

// 3rd party imports
import styled from 'styled-components';
import { DragSource } from 'react-dnd';


const CardContainer = styled.div`
  padding: 15px;
  margin: 15px;
  background-color: red;
  flex: 1;
`;

const cardSource = {
  beginDrag(props) {
    return {
      columnIndex: props.columnIndex,
      cardIndex: props.cardIndex
    };
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource()
  }
}

const card = (props) => {
    const { connectDragSource } = props;
    return (
      <CardContainer innerRef={node => connectDragSource(node)}>
        <span>{props.task}</span>
      </CardContainer>
    )
};

export default DragSource(DragTypes.CARD, cardSource, collect)(card);
