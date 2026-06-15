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
    const { children, id, active } = this.props;
    const styles = active
      ? {
          borderBottom: '1px solid rgba(0,0,0,0.2)',
          borderImageSlice: 1,
          borderImageSource:
            'linear-gradient(to left, rgba(0, 0, 0, 0) 1%, rgba(0, 0, 0, 0.2) 1% 99%, rgba(0, 0, 0, 0) 99% )',
        }
      : null;
    return (
      <div id={id} className="relightMenuButtons" style={styles}>
        {children}
      </div>
    );
  }
}

RelightMenuButtons.propTypes = {
  /** The children prop carries all the props passed to the parent component **/
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  /** The id prop is used to populate the html id property so that we can keep track of the controls state **/
  id: PropTypes.string.isRequired,
  /** The active prop tells the button to render as if the annotation layer is on or off **/
  active: PropTypes.bool.isRequired,
};

export default RelightMenuButtons;
