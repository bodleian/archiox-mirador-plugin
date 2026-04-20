import React from 'react';
import AssistantOutlined from '@material-ui/icons/AssistantOutlined';
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
          helperOn
            ? 'Turn off light direction helper'
            : 'Turn on light direction helper'
        }
        style={{
          backgroundColor: helperOn ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0)',
          clear: 'both',
          display: 'block',
        }}
        onClick={onClick}
      >
        {<AssistantOutlined />}
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
