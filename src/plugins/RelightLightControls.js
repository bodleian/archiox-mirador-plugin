import React from 'react';
import PropTypes from 'prop-types';

/**
 * The RelightLightControls component is a wrapper for the three light control components that groups them together
 * into a rendering group that allows their positioning to be better controlled.
 */
class RelightLightControls extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    // children is used so that parent props can be passed to the children components inside its tags
    const { children, aspect } = this.props;

    let display = 'block';

    if (aspect === 'landscape') {
      display = 'flex';
    }

    return (
      <div
        style={{
          display: display,
        }}
      >
        {children}
      </div>
    );
  }
}

RelightLightControls.propTypes = {
  /** The children prop carries all the props passed to the parent component **/
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  /** The aspect prop contains the current aspect of the window the element is in i.e. portrait or landscape **/
  aspect: PropTypes.string.isRequired,
};

export default RelightLightControls;
