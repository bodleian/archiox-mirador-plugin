import React from 'react';
import SpeakerNotes from '@mui/icons-material/SpeakerNotes';
import SpeakerNotesOff from '@mui/icons-material/SpeakerNotesOff';
import PropTypes from 'prop-types';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';

/**
 * The RelightAnnotationButton component is a plug-in sub-menu button used to toggle on or off canvas annotations.
 * The icon used by the component toggles with its active state.
 */
class RelightAnnotationButton extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { id, active, onClick } = this.props;
    return (
      <MiradorMenuButton
        id={id}
        aria-label={
          active
            ? 'Turn off canvas annotations'
            : 'Turn on canvas annotations; annotations are vectors that curators or researchers have added' +
              ' which overlay the object to share different points of interest with you'
        }
        style={{
          clear: 'both',
        }}
        onClick={onClick}
      >
        {active ? <SpeakerNotes /> : <SpeakerNotesOff />}
      </MiradorMenuButton>
    );
  }
}

RelightAnnotationButton.propTypes = {
  /** The id prop is used to populate the html id property so that we can keep track of the controls state **/
  id: PropTypes.string.isRequired,
  /** The open prop tells the button to render as if the tool menu is expanded or closed **/
  active: PropTypes.bool.isRequired,
  /** The onClick prop is a function used to manage component behaviour when the component is clicked **/
  onClick: PropTypes.func.isRequired,
};

export default RelightAnnotationButton;
