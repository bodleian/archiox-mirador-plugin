import React from 'react';
import HighlightIcon from '@mui/icons-material/Highlight';
import CloseSharpIcon from '@mui/icons-material/CloseSharp';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';
import PropTypes from 'prop-types';

/**
 * The RelightMenuButton component is the main plug-in button used to collapse or expand the RelightToolMenu component.
 * The icon used by the component toggles with its open state.
 */
class RelightMenuButton extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { open, onClick } = this.props;
    return (
      <MiradorMenuButton
        aria-label={
          open
            ? 'Collapse relighting tools'
            : 'Expand relighting tools to access controls that allow 3D rendering of this object in your browser'
        }
        style={{
          float: 'left',
          clear: 'both',
        }}
        onClick={onClick}
      >
        {open ? <CloseSharpIcon /> : <HighlightIcon />}
      </MiradorMenuButton>
    );
  }
}

RelightMenuButton.propTypes = {
  /** The open prop tells the button to render as if the tool menu is expanded or closed **/
  open: PropTypes.bool.isRequired,
  /** The onClick prop is a function used to manage component behaviour when the component is clicked **/
  onClick: PropTypes.func.isRequired,
};

export default RelightMenuButton;
