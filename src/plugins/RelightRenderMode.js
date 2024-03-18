import React from 'react';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import FlareIcon from '@mui/icons-material/Flare';
import PropTypes from 'prop-types';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';

/**
 * The RelightRenderMode component is a plug-in button that will toggle the render mode between PBR and specular
 * enhancement when it is clicked.
 */
class RelightRenderMode extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { mode, onClick } = this.props;
    return (
      <MiradorMenuButton
        aria-label={
          mode
            ? 'Render using specular enhancement to make the highlights really pop out'
            : 'Render using physically based renderer (PBR) for a realistic digital fascimile'
        }
        style={{
          clear: 'both',
        }}
        onClick={onClick}
      >
        {mode ? <FlareIcon /> : <LocalMoviesIcon />}
      </MiradorMenuButton>
    );
  }
}

RelightRenderMode.propTypes = {
  /** bla bla bla **/
  mode: PropTypes.bool.isRequired,
  /** The onClick prop is a function used to manage component behaviour when the component is clicked **/
  onClick: PropTypes.func.isRequired,
};

export default RelightRenderMode;
