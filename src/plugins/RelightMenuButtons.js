import React from 'react';
import PropTypes from 'prop-types';

/**
 * The RelightLightButtons component is a wrapper for the three main plug-in buttons that groups them together into a
 * rendering group that allows their positioning to be better controlled.
 */
class RelightMenuButtons extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    // children is used so that parent props can be passed to the children components inside its tags
    const { children } = this.props;
    return <div style={{
      display: 'flex',
      borderRight: '1px solid rgba(0,0,0,0.2)',
      borderImageSlice: 1,
      borderImageSource: 'linear-gradient(to bottom, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 0.2) 20% 80%, rgba(0, 0, 0, 0) 80% )'
    }}>{children}</div>;
  }
}

RelightMenuButtons.propTypes = {
  /** The children prop carries all the props passed to the parent component **/
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default RelightMenuButtons;
