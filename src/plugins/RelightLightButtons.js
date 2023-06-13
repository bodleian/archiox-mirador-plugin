import React from 'react';
import PropTypes from 'prop-types';

class RelightLightButtons extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { children } = this.props;
    return (<div>{children}</div>);
  }
}

RelightLightButtons.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default RelightLightButtons;
