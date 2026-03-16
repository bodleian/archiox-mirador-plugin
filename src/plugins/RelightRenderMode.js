import React from 'react';
import LocalMoviesIcon from '@material-ui/icons/LocalMovies';
import BrightnessHigh from '@material-ui/icons/BrightnessHigh';
import PropTypes from 'prop-types';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';

/**
 * The RelightRenderMode component is a plug-in button that will toggle the three.js overlay shader between PBR and
 * Phong when it is clicked, which map to our PBR and specular enhancement modes.
 **/
class RelightRenderMode extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { mode, onClick } = this.props;
    return (
      <MiradorMenuButton
        aria-label={
          mode ? 'Specular enhancement mode' : 'Physically based rendering mode'
        }
        style={{
          clear: 'both',
          display: 'block',
        }}
        onClick={onClick}
      >
        {mode ? <BrightnessHigh /> : <LocalMoviesIcon />}
      </MiradorMenuButton>
    );
  }
}

RelightRenderMode.propTypes = {
  /** The mode prop is a boolean value that indicates which render mode is currently active **/
  mode: PropTypes.bool.isRequired,
  /** The onClick prop is a function used to manage component behaviour when the component is clicked **/
  onClick: PropTypes.func.isRequired,
};

export default RelightRenderMode;
