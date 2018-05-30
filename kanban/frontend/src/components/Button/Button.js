import React from 'react';

const button = (props) => (
  <button onClick={() => props.clicked(props.onClickArgs)}>
    {props.children}
  </button>
)

export default button;
