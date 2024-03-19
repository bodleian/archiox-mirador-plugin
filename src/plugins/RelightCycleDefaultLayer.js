import React from 'react';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import PropTypes from 'prop-types';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';

/**
 * The RelightRenderMode component is a plug-in button that will toggle the render mode between PBR and specular
 * enhancement when it is clicked.
 */
class RelightCycleDefaultLayer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { id, onClick } = this.props;
    return (
      <MiradorMenuButton
        id={id}
        aria-label={
          'Click here to cycle through the layers for this object in Mirador; layers can tell you extra information about this object.'
        }
        style={{
          clear: 'both',
        }}
        onClick={onClick}
      >
        <SkipNextIcon />
      </MiradorMenuButton>
    );
  }
}

RelightCycleDefaultLayer.propTypes = {
  /** The id prop is used to populate the html id property so that we can keep track of the controls state **/
  id: PropTypes.string.isRequired,
  /** The onClick prop is a function used to manage component behaviour when the component is clicked **/
  onClick: PropTypes.func.isRequired,
};

export default RelightCycleDefaultLayer;
