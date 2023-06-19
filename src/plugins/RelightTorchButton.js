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
    const { active, onClick } = this.props;
    return (
      <MiradorMenuButton
        aria-label={active ? 'Turn Off 3D Overlay' : 'Turn On 3D Overlay'}
        style={{
          float: 'left',
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
  /** The open prop tells the button to render as if the Three canvas layer is active or not **/
  active: PropTypes.bool,
  /** The onClick prop is a function used to manage component behaviour when the component is clicked **/
  onClick: PropTypes.func.isRequired,
};

RelightTorchButton.defaultProps = {
  active: false,
};

export default RelightTorchButton;
