// react imports
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';

// project imports
import { DragTypes } from '../../DragTypes';
import Confirm from '../../components/Modals/Confirm';
import * as actions from './actions';
import * as columnActions from '../Column/actions';
import UpdateModal from '../../components/Modals/CardCreateUpdate';

// 3rd party imports
import styled from 'styled-components';
import { DragSource, DropTarget } from 'react-dnd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const propTypes = {
  id: PropTypes.number.isRequired,
  column_id: PropTypes.number.isRequired,
  position_id: PropTypes.number.isRequired,
  task: PropTypes.string.isRequired,
  spinner: PropTypes.bool
};

const CardContainer = styled.div`
  margin: 15px;
  background: #005792;
  border-radius: 2px;
  .fas {
    color: #c3d9e8;
    &.fa-spinner {
      color: #fd5f00;
    }
  }
`;

const Controls = styled.div`
  display: flex;
  margin-bottom: 10px;
  border-radius: 2px 2px 0 0;
  padding: 5px;
  background-color: #9a2b37;
`;

const FlexEnd = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
  .fas {
    padding-left: 10px;
  }
`;

const Task = styled.div`
  width: 80%;
  padding: 5px;
  margin: auto;
`;

const cardSource = {
  // return card id, column id and card index when the card is dragged
  beginDrag(props) {
    return {
      id: props.id,
      column_id: props.column_id,
      index: props.index
    };
  }
};

const cardTarget = {
  // reorder cards when hovered if they are in the same column
  hover(props, monitor, component) {
    if (monitor.getItem().column_id === props.column_id) {
      const dragIndex = monitor.getItem().index;
      const hoverIndex = props.index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

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

      // reorder cards
      const args = {
        hasDropped: false,
        column_id: monitor.getItem().column_id,
        fromCardIndex: dragIndex,
        toCardIndex: hoverIndex
      };
      props.reorderCards(args);
      monitor.getItem().index = hoverIndex;
    }
  }
};

function collectSource(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  };
}

function collectTarget(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget()
  };
}

class Card extends Component {
  state = {
    updateModal: false,
    confirmModal: {
      message: null,
      confirmFunction: null
    }
  };

  // used to display / hide card update modal
  toggleUpdateModal = () => {
    this.setState({ updateModal: !this.state.updateModal });
  };

  // dispatch updateCard if the task has been changed
  handleUpdate = task => {
    this.toggleUpdateModal();
    if (task !== this.props.task) this.props.updateCard(this.props.id, task);
  };

  // display / hide confirm modal. Specify function to be executed
  // if confirm is clicked
  toggleConfirmModal = (message, confirmFunction) => {
    let confirmModal;
    if (message) {
      confirmModal = {
        message: message,
        confirmFunction: () => confirmFunction()
      };
    } else {
      confirmModal = {
        message: null,
        confirmFunction: null
      };
    }
    this.setState({ confirmModal: confirmModal });
  };

  // dispatch deleteCard
  handleDelete = () => {
    this.toggleConfirmModal();
    this.props.deleteCard(this.props.column_id, this.props.id);
  };

  render() {
    const {
      connectDragSource,
      connectDropTarget,
      connectDragPreview,
      isDragging
    } = this.props;
    const opacity = isDragging ? 0 : 1;

    let output = null;
    if (this.props.spinner) {
      output = (
        <CardContainer>
          <Controls />
          <Task>
            <i className="fas fa-spinner fa-spin" />
          </Task>
        </CardContainer>
      );
    } else {
      // display / hide confirmation modal
      let confirmModal = null;
      if (this.state.confirmModal.message) {
        confirmModal = (
          <Confirm
            message={this.state.confirmModal.message}
            confirmFunction={this.handleDelete}
            toggleConfirm={this.toggleConfirmModal}
          />
        );
      }

      // display / hide update modal
      let updateModal = null;
      if (this.state.updateModal) {
        updateModal = (
          <UpdateModal
            task={this.props.task}
            toggleModal={this.toggleUpdateModal}
            updateCard={task => this.handleUpdate(task)}
          />
        );
      }

      output = connectDropTarget(
        connectDragPreview(
          <div>
            {confirmModal}
            {updateModal}
            <CardContainer style={{ opacity }}>
              <Controls>
                <div>
                  {connectDragSource(
                    <i title="Move Card" className="fas fa-expand-arrows-alt" />
                  )}
                </div>
                <FlexEnd>
                  <i
                    title="Edit Task"
                    className="fas fa-edit"
                    onClick={this.toggleUpdateModal}
                  />
                  <i
                    title="Delete Card"
                    className="fas fa-trash-alt"
                    onClick={() =>
                      this.toggleConfirmModal(
                        'Permanently delete card?',
                        this.handleDelete
                      )
                    }
                  />
                </FlexEnd>
              </Controls>
              <Task>{this.props.task}</Task>
            </CardContainer>
          </div>
        )
      );
    }
    return output;
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    column_id: state.cards[ownProps.id].column_id,
    position_id: state.cards[ownProps.id].position_id,
    task: state.cards[ownProps.id].task,
    spinner: state.cards[ownProps.id].spinner
  };
};

const mapDispatchToProps = dispatch => {
  return {
    deleteCard: (column_id, id) => dispatch(actions.deleteCard(column_id, id)),
    updateCard: (id, task) => dispatch(actions.updateCard(id, task)),
    reorderCards: args => dispatch(columnActions.reorderCards(args))
  };
};

Card.propTypes = propTypes;

// export CardSource separately to be used in tests
export const CardSource = DragSource(DragTypes.CARD, cardSource, collectSource)(
  Card
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DropTarget(DragTypes.CARD, cardTarget, collectTarget)(CardSource));
