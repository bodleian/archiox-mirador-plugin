import React from 'react';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
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
    const { drawerOpen, aspect, onClick } = this.props;

    let icon = drawerOpen ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />;

    if (aspect === 'landscape') {
      icon = drawerOpen ? <ArrowBackIcon /> : <ArrowForwardIcon />;
    }

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
        {icon}
      </MiradorMenuButton>
    );
  }
}

RelightExpandSlidersButton.propTypes = {
  /** The drawerOpen prop tells the button to render as if the sliders are expanded or closed **/
  drawerOpen: PropTypes.bool.isRequired,
  /** The aspect prop contains the current aspect of the window the element is in i.e. portrait or landscape **/
  aspect: PropTypes.string.isRequired,
  /** The onClick prop is a function used to manage component behaviour when the component is clicked **/
  onClick: PropTypes.func.isRequired,
};

export default RelightExpandSlidersButton;
