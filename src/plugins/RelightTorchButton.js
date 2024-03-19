import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';
import React from 'react';

import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
import WbIncandescentOutlinedIcon from '@material-ui/icons/WbIncandescentOutlined';

import PropTypes from 'prop-types';

/** The RelightTorchButton component is a button that controls the adding or removal of the Three canvas overlay
 * and so acts as an on/off switch for the relighting.  The icon used by the component toggles with its active state.
 * **/
class RelightTorchButton extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { active, onClick, id } = this.props;
    return (
      <MiradorMenuButton
        id={id}
        aria-label={
          active
            ? 'Turn off the 3D overlay to return to the default Mirador view'
            : 'Turn on the 3D overlay to relight this object virtually'
        }
        style={{
          clear: 'both',
        }}
        onClick={onClick}
      >
        {active ? <WbIncandescentIcon /> : <WbIncandescentOutlinedIcon />}
      </MiradorMenuButton>
    );
  }
}

RelightTorchButton.propTypes = {
  /** The id prop is used to populate the html id property so that we can keep track of the controls state **/
  id: PropTypes.string.isRequired,
  /** The open prop tells the button to render as if the Three canvas layer is active or not **/
  active: PropTypes.bool,
  /** The onClick prop is a function used to manage component behaviour when the component is clicked **/
  onClick: PropTypes.func.isRequired,
};

RelightTorchButton.defaultProps = {
  active: false,
};

export default RelightTorchButton;
