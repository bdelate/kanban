// react imports
import React from 'react';

// project imports
import Card from '../../components/Card/Card';
import { DragTypes } from '../../DragTypes';
import Controls from './Controls';

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
  toggleColumnCreateUpdate: PropTypes.func.isRequired,
  toggleCardCreateUpdate: PropTypes.func.isRequired,
  toggleConfirm: PropTypes.func.isRequired,
  deleteColumn: PropTypes.func.isRequired
};

const ColumnContainer = styled.div`
  margin: 10px;
  border-radius: 5px;
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
  border-bottom: 2px solid #fd5f00;
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

const column = props => {
  const { connectDropTarget } = props;
  const header = props.spinner ? (
    <Header>
      <i className="fas fa-spinner fa-spin fa-lg" />
    </Header>
  ) : (
    <Header>{props.name}</Header>
  );

  const cards = props.cards.map((card, index) => (
    <Card
      key={card.id}
      cardIndex={index}
      columnIndex={props.columnIndex}
      task={card.task}
      spinner={card.spinner}
      deleteCard={props.deleteCard}
      reorderCard={props.reorderCard}
      toggleCardCreateUpdate={props.toggleCardCreateUpdate}
    />
  ));

  return (
    <ColumnContainer innerRef={node => connectDropTarget(node)}>
      <Controls
        toggleColumn={props.toggleColumn}
        toggleCardCreateUpdate={props.toggleCardCreateUpdate}
        toggleColumnCreateUpdate={props.toggleColumnCreateUpdate}
        toggleConfirm={props.toggleConfirm}
        columnIndex={props.columnIndex}
        deleteColumn={props.deleteColumn}
      />
      {header}
      {cards}
    </ColumnContainer>
  );
};

column.propTypes = propTypes;

export default DropTarget(DragTypes.CARD, columnTarget, collect)(column);
