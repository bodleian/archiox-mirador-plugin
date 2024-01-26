import React from 'react';
import ReplaySharpIcon from '@material-ui/icons/ReplaySharp';
import PropTypes from 'prop-types';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';

/**
 * The RelightResetLights component is a plug-in button that will reset the state and appearance of the light controls
 * to their default values when it is clicked.
 */
class RelightResetLights extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { onClick } = this.props;
    return (
      <MiradorMenuButton
        aria-label={'Reset all lighting settings to the default values'}
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
  /** The onClick prop is a function used to manage component behaviour when the component is clicked **/
  onClick: PropTypes.func.isRequired,
};

export default RelightResetLights;
