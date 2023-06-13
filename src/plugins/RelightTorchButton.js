import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';
import React, { Component } from 'react';

import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
import WbIncandescentOutlinedIcon from '@material-ui/icons/WbIncandescentOutlined';

import PropTypes from 'prop-types';

class RelightTorchButton extends Component {
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
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

RelightTorchButton.defaultProps = {
  active: false,
};

export default RelightTorchButton;
