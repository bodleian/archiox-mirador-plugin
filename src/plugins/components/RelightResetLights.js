import React from 'react';
import ReplaySharpIcon from '@material-ui/icons/ReplaySharp';
import PropTypes from 'prop-types';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';

class RelightResetLights extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { onClick } = this.props;
    return (
      <MiradorMenuButton
        aria-label={'Reset Lighting Settings'}
        style={{
          float: 'left',
          clear: 'both',
        }}
        onClick={onClick}
      >
        <ReplaySharpIcon />
      </MiradorMenuButton>
    );
  }
}

RelightResetLights.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default RelightResetLights;
