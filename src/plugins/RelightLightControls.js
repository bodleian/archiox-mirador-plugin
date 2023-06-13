import React from 'react';
import PropTypes from 'prop-types';

class RelightLightControls extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { children } = this.props;
    return (<div style={{ float: 'left',
      display: 'flex', }}>{children}</div>);
  }
}

RelightLightControls.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default RelightLightControls;
