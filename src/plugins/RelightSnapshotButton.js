import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';
import React from 'react';
import PhotoCameraOutlined from '@material-ui/icons/PhotoCameraOutlined';
import PropTypes from 'prop-types';

/**
 * The RelightSnapshotButton component is a plug-in button that when pressed will capture the current portion of the
 * three.js WebGL renderer that is on screen and download it from the browser.  The button is only enabled when the
 * three.js overlay is active.
 **/
class RelightSnapshotButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { active, id, onClick } = this.props;
    return (
      <div className="relightMenuButton">
        <MiradorMenuButton
          id={id}
          aria-label="Take a screenshot of the current rendered view"
          onClick={onClick}
          disabled={!active}
        >
          <PhotoCameraOutlined />
        </MiradorMenuButton>
      </div>
    );
  }
}

RelightSnapshotButton.propTypes = {
  /** The id prop is used to populate the html id property so that we can keep track of the controls state **/
  id: PropTypes.string.isRequired,
  /** The onClick prop is a function used to manage component behaviour when the component is clicked **/
  onClick: PropTypes.func.isRequired,
  /** The active prop is a boolean value used to decide if the RelightSnapshotButton should be enabled or not **/
  active: PropTypes.bool.isRequired,
};

export default RelightSnapshotButton;
