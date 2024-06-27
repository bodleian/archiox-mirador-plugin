import React from 'react';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';

import PropTypes from 'prop-types';

/**
 * The RelightExpandSlidersButton component is a plug-in button used to collapse or expand the shader sliders.
 * The icon used by the component toggles with the drawerOpen state.
 */
class RelightExpandSlidersButton extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { drawerOpen, onClick } = this.props;
    return (
      <MiradorMenuButton
        style={{
          clear: 'both',
        }}
        aria-label={
          drawerOpen
            ? 'Collapse relighting shader control sliders'
            : 'Expand shader control sliders to take control of the light levels and shading parameters. ' +
              'You can control light intensity, metalness, roughness, and normal depth here; there is a ' +
              'description of what each one does on the relevant slider, just hover over it and see.'
        }
        onClick={onClick}
      >
        {drawerOpen ? <ArrowBackIosIcon /> : <ArrowForwardIosIcon />}
      </MiradorMenuButton>
    );
  }
}

RelightExpandSlidersButton.propTypes = {
  /** The drawerOpen prop tells the button to render as if the sliders are expanded or closed **/
  drawerOpen: PropTypes.bool.isRequired,
  /** The onClick prop is a function used to manage component behaviour when the component is clicked **/
  onClick: PropTypes.func.isRequired,
};

export default RelightExpandSlidersButton;
