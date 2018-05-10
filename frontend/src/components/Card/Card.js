// react imports
import React from 'react';
import { findDOMNode } from 'react-dom'

// project imports
import { DragTypes } from '../../DragTypes';

// 3rd party imports
import styled from 'styled-components';
import { DragSource, DropTarget } from 'react-dnd';
import PropTypes from 'prop-types';


const propTypes = {
  cardIndex: PropTypes.number.isRequired,
  columnIndex: PropTypes.number.isRequired,
  task: PropTypes.string.isRequired,
  spinner: PropTypes.bool,
  reorderCard: PropTypes.func.isRequired,
  toggleCardCrud: PropTypes.func.isRequired
}

const CardContainer = styled.div`
  padding: 15px;
  margin: 15px;
  flex: 1;
  background: red;
`;

const cardSource = {
  // return the columnIndex + cardIndex of the card when it starts to be dragged
  beginDrag(props) {
    return {
      columnIndex: props.columnIndex,
      cardIndex: props.cardIndex
    };
  }
};

const cardTarget = {
  // reorder cards when hovered if they are in the same column
  hover(props, monitor, component) {
    if (monitor.getItem().columnIndex === props.columnIndex) {
      const dragIndex = monitor.getItem().cardIndex;
      const hoverIndex = props.cardIndex;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // move card
      props.reorderCard(monitor.getItem().columnIndex, dragIndex, hoverIndex);
      monitor.getItem().cardIndex = hoverIndex
    }
  }
};

function collectSource(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

function collectTarget(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget()
  }
}

const card = (props) => {
  const { connectDragSource, connectDropTarget, isDragging } = props;
  const opacity = isDragging ? 0 : 1;

  let output = null;
  if (props.spinner) {
    output = (
      <CardContainer>
        <i className="fas fa-spinner fa-spin"></i>
      </CardContainer>
    )
  } else {
    output = connectDragSource(
      connectDropTarget(
        <div>
          <CardContainer style={{ opacity }}>
            <span>{props.task}</span>
            <i
              title="Edit or Delete"
              className="fas fa-edit"
              onClick={() => props.toggleCardCrud(
                true,
                props.columnIndex,
                props.cardIndex
              )}
            ></i>
          </CardContainer>
        </div>
      )
    )
  }
  return output;
};

card.propTypes = propTypes;

// export CardSource separately to be used in tests
export const CardSource = DragSource(
  DragTypes.CARD, cardSource, collectSource
)(card);

export default DropTarget(
  DragTypes.CARD, cardTarget, collectTarget
)(CardSource);
