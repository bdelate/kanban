import React from 'react';
import PropTypes from 'prop-types';
// 3rd party imports
import styled from 'styled-components';

const propTypes = {
  onChangeFunc: PropTypes.func.isRequired,
  options: PropTypes.object.isRequired,
  selectedValue: PropTypes.number.isRequired
};

const Select = styled.select`
  border: 0;
  border-radius: 2px;
  padding: 8px;
  margin: 5px;
`;

function getSelectValue(event) {
  return event.target.options[event.target.selectedIndex].value;
}

const select = props => {
  let selectOptions = [
    <option key={-1} disabled value="-1">
      --- select a board ---
    </option>
  ];
  for (let [key, value] of Object.entries(props.options))
    selectOptions.push(
      <option key={key} value={key}>
        {value}
      </option>
    );

  return (
    <Select
      onChange={event => props.onChangeFunc(getSelectValue(event))}
      value={props.selectedValue.toString()}
    >
      {selectOptions}
    </Select>
  );
};

select.propTypes = propTypes;

export default select;
