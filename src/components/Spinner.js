import React from 'react';
import PropTypes from 'prop-types';


const Spinner = (props) => {
  return <img src="/spinner.gif" alt="Loading..." style={{ ...props }} />;
};

Spinner.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  margin: PropTypes.string
}

Spinner.defaultProps = {
  width: '25px',
  height: '25px',
  margin: '0px'
}

export default Spinner;