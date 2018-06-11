import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  onChangeFunc: PropTypes.func.isRequired,
  options: PropTypes.object.isRequired
};

function getSelectValue(event) {
  return event.target.options[event.target.selectedIndex].value
}

const select = props => {
  let selectOptions = [
    <option
      key={-1}
      disabled
      value="-1">
      --- select a board ---
    </option >
  ];
  for (let [key, value] of Object.entries(props.options))
    selectOptions.push(
      <option
        key={key}
        value={key}>
        {value}
      </option>
    )

  return (
    <select
      onChange={(event) => props.onChangeFunc(getSelectValue(event))}
      defaultValue="-1" >
      {selectOptions}
    </select >
  );
};

select.propTypes = propTypes;

export default select;