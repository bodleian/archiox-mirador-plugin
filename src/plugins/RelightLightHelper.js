import React from 'react';
import Help from '@material-ui/icons/Help';
import HelpOutline from '@material-ui/icons/HelpOutline';
import PropTypes from 'prop-types';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';

/**
 * The RelightResetLights component is a plug-in button that will reset the state and appearance of the light controls
 * to their default values when it is clicked.
 */
class RelightLightHelper extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { helperOn, onClick } = this.props;
    return (
      <MiradorMenuButton
        aria-label={
          'Turn on a light direction helper to help you to visualise light position'
        }
        style={{
          float: 'left',
          clear: 'both',
        }}
        onClick={onClick}
        helperOn={helperOn}
      >
        {helperOn ? <Help /> : <HelpOutline />}
      </MiradorMenuButton>
    );
  }
}

RelightLightHelper.propTypes = {
  /** The helperOn prop is a boolean value used to toggle the appearence of the main icon **/
  helperOn: PropTypes.bool.isRequired,
  /** The onClick prop is a function used to manage component behaviour when the component is clicked **/
  onClick: PropTypes.func.isRequired,
};

export default RelightLightHelper;
