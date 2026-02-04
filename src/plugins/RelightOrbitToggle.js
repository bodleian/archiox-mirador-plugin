import React from 'react';
import ThreeDRotation from '@material-ui/icons/ThreeDRotation';
import PropTypes from 'prop-types';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';

/**
 * The RelightOrbitToggle component is a button that enables/disables OrbitControls
 * for 3D camera rotation (experimental feature).
 */
class RelightOrbitToggle extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { orbitEnabled, onClick } = this.props;
    return (
      <MiradorMenuButton
        aria-label={
          orbitEnabled
            ? 'Disable 3D camera rotation'
            : 'Enable 3D camera rotation (experimental)'
        }
        style={{
          clear: 'both',
        }}
        onClick={onClick}
      >
        <ThreeDRotation
          style={{
            color: orbitEnabled ? '#1967d2' : 'inherit',
          }}
        />
      </MiradorMenuButton>
    );
  }
}

RelightOrbitToggle.propTypes = {
  /** The orbitEnabled prop is a boolean value used to toggle the appearance of the icon **/
  orbitEnabled: PropTypes.bool.isRequired,
  /** The onClick prop is a function used to manage component behaviour when clicked **/
  onClick: PropTypes.func.isRequired,
};

export default RelightOrbitToggle;
