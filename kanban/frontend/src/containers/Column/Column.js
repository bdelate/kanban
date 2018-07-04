// react imports
import React, { Component } from 'react';

// project imports
import Card from '../Card/Card';
import { DragTypes } from '../../DragTypes';
import Controls from './Controls';
import RenameModal from '../../components/Modals/ColumnCreateUpdate';
import * as actions from './actions';
import Confirm from '../../components/Modals/Confirm';
import CollapsedColumn from '../../components/CollapsedColumn/CollapsedColumn';
import CreateCardModal from '../../components/Modals/CardCreateUpdate';

// 3rd party imports
import styled from 'styled-components';
import { DropTarget } from 'react-dnd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  cardIds: PropTypes.array,
  spinner: PropTypes.bool
};

const ColumnContainer = styled.div`
  margin: 10px;
  border-radius: 2px;
  background-color: #00204a;
  display: flex;
  flex-direction: column;
  flex: 1;
  .fa-spinner {
    color: #fd5f00;
  }
`;

const Header = styled.h2`
  align-self: center;
  border-bottom: 1px solid #fd5f00;
`;

const columnTarget = {
  drop(props, monitor, component) {
    if (monitor.getItem().column_id !== props.id) {
      // card dropped on different column
      const args = {
        fromColumnId: monitor.getItem().column_id,
        toColumnId: props.id,
        cardId: monitor.getItem().id,
        toPositionId: props.cardIds.length
      };
      props.moveCard(args);
    } else {
      // card dropped on same column
      const cards = props.cardIds.map((id, index) => {
        return { id: id, position_id: index };
      });
      const args = {
        cardId: monitor.getItem().id,
        hasDropped: true,
        cards: cards
      };
      props.reorderCards(args);
    }
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget()
  };
}

class Column extends Component {
  state = {
    collapsed: false,
    renameModal: false,
    createCardModal: false,
    confirmModal: {
      message: null,
      confirmFunction: null
    }
  };

  // used to display / hide the rename modal
  toggleRenameModal = () => {
    this.setState({ renameModal: !this.state.renameModal });
  };

  // used to display / hide the create card modal
  toggleCreateCardModal = () => {
    this.setState({ createCardModal: !this.state.createCardModal });
  };

  // dispatch renameColumn if column name was changed
  handleRename = name => {
    this.toggleRenameModal();
    if (name !== this.props.name) {
      this.props.renameColumn(this.props.id, name);
    }
  };

  // dispatch createCard
  handleCreateCard = task => {
    this.toggleCreateCardModal();
    const card = {
      task: task,
      id: -1,
      position_id: this.props.cardIds.length,
      column_id: this.props.id,
      spinner: true
    };
    this.props.createCard(card);
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

  // dispatch deleteColumn
  handleDelete = () => {
    this.toggleConfirmModal();
    this.props.deleteColumn(this.props.id);
  };

  // collapse / uncollapse column
  toggleCollapse = () => {
    this.setState({ collapsed: !this.state.collapsed });
  };

  render() {
    if (this.state.collapsed) {
      return (
        <CollapsedColumn
          name={this.props.name}
          numCards={this.props.cardIds.length}
          toggleCollapse={this.toggleCollapse}
        />
      );
    } else {
      const { connectDropTarget } = this.props;

      let renameModal = null;
      if (this.state.renameModal) {
        renameModal = (
          <RenameModal
            name={this.props.name}
            toggleModal={this.toggleRenameModal}
            renameColumn={this.handleRename}
          />
        );
      }

      const header = this.props.spinner ? (
        <Header>
          <i className="fas fa-spinner fa-spin" />
        </Header>
      ) : (
        <Header>{this.props.name}</Header>
      );

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

      // display / hide confirmation modal
      let createCardModal = null;
      if (this.state.createCardModal) {
        createCardModal = (
          <CreateCardModal
            toggleModal={this.toggleCreateCardModal}
            createCard={task => this.handleCreateCard(task)}
          />
        );
      }

      const controls = (
        <Controls
          toggleCollapse={this.toggleCollapse}
          toggleCreateCardModal={this.toggleCreateCardModal}
          toggleRenameModal={this.toggleRenameModal}
          toggleConfirmModal={this.toggleConfirmModal}
          deleteColumn={() => this.props.deleteColumn(this.props.id)}
        />
      );

      const cards = this.props.cardIds.map((id, index) => (
        <Card key={id} id={id} index={index} />
      ));

      return (
        <ColumnContainer innerRef={node => connectDropTarget(node)}>
          {renameModal}
          {confirmModal}
          {createCardModal}
          {controls}
          {header}
          {cards}
        </ColumnContainer>
      );
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    name: state.columns[ownProps.id].name,
    cardIds: state.columns[ownProps.id].cards,
    spinner: state.columns[ownProps.id].spinner
  };
};

const mapDispatchToProps = dispatch => {
  return {
    renameColumn: (id, name) => dispatch(actions.renameColumn(id, name)),
    deleteColumn: id => dispatch(actions.deleteColumn(id)),
    createCard: card => dispatch(actions.createCard(card)),
    reorderCards: args => dispatch(actions.reorderCards(args)),
    moveCard: args => dispatch(actions.moveCard(args))
  };
};

Column.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DropTarget(DragTypes.CARD, columnTarget, collect)(Column));
