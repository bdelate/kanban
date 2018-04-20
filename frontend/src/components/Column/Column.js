// react imports
import React from 'react';

// component imports
import Card from '../Card/Card';

// 3rd party imports
import styled from 'styled-components';


const ColumnContainer = styled.div`
  padding: 15px;
  margin: 15px;
  background-color: blue;
  flex: 1;
`;

const column = (props) => {
  const cards = props.cards.map(card => (
    <Card
      key={card.cardId}
      cardId={card.cardId}
      task={card.task}
    />
  ));
  return (
    <ColumnContainer>
      <h3>{props.title}</h3>
      {cards}
    </ColumnContainer>
  )
};

export default column;
