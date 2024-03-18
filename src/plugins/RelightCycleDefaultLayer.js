import React from 'react';
import SkipNextIcon from '@mui/icons-material/SkipNext';
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
    const { id, defaulLayer, onClick } = this.props;
    return (
      <MiradorMenuButton
        id={id}
        aria-label={
          'Click here to cycle through the layers for this object in Mirador; layers can tell you extra information about this object.'
        }
        // todo: add the ability to get the current texture and relabel the instructions appropriately        }
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
  /** bla bla bla **/
  id: PropTypes.string.isRequired,
  /** bla bla bla **/
  defaultLayer: PropTypes.string.isRequired,
  /** The onClick prop is a function used to manage component behaviour when the component is clicked **/
  onClick: PropTypes.func.isRequired,
};

export default RelightCycleDefaultLayer;
