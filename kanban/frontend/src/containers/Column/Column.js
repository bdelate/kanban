// react imports
import React, { Component } from 'react';

// project imports
import Card from '../../components/Card/Card';
import { DragTypes } from '../../DragTypes';
import Controls from './Controls';
import RenameModal from '../../components/Modals/ColumnCreateUpdate';
import * as actions from './actions';
import Confirm from '../../components/Modals/Confirm';
import CollapsedColumn from '../../components/CollapsedColumn/CollapsedColumn';

// 3rd party imports
import styled from 'styled-components';
import { DropTarget } from 'react-dnd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const propTypes = {
  id: PropTypes.number.isRequired
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
    if (monitor.getItem().columnIndex !== props.columnIndex) {
      props.moveCard(
        monitor.getItem().columnIndex,
        monitor.getItem().cardIndex,
        props.columnIndex
      );
    } else {
      const args = {
        hasDropped: true,
        columnIndex: monitor.getItem().columnIndex,
        toCardIndex: monitor.getItem().cardIndex
      };
      props.reorderCard(args);
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
    confirmModal: {
      message: null,
      confirmFunction: null
    }
  };

  // used to display / hide the rename modal
  toggleRenameModal = () => {
    this.setState({ renameModal: !this.state.renameModal });
  };

  // dispatch renameColumn if column name was changed
  handleRename = name => {
    this.toggleRenameModal();
    if (name !== this.props.name) {
      this.props.renameColumn(this.props.id, name);
    }
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

      const cards = this.props.cardIds.map(id => <Card key={id} id={id} />);

      return (
        <ColumnContainer innerRef={node => connectDropTarget(node)}>
          {renameModal}
          {confirmModal}
          <Controls
            toggleCollapse={this.toggleCollapse}
            toggleCardCreateUpdate={this.props.toggleCardCreateUpdate}
            toggleRenameModal={this.toggleRenameModal}
            toggleConfirmModal={this.toggleConfirmModal}
            deleteColumn={() => this.props.deleteColumn(this.props.id)}
          />
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
    deleteColumn: id => dispatch(actions.deleteColumn(id))
  };
};

Column.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DropTarget(DragTypes.CARD, columnTarget, collect)(Column));
