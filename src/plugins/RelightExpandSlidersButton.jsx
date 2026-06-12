import React from 'react';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';

import PropTypes from 'prop-types';

/**
 * The RelightExpandSlidersButton component is a plug-in button used to collapse or expand the shader sliders.
 * The icon used by the component toggles with the drawerOpen state.
 */
class RelightExpandSlidersButton extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { drawerOpen, onClick } = this.props;

    return (
      <div className="relightExpandSlidersButton">
        <MiradorMenuButton
          aria-label={
            drawerOpen
              ? 'Collapse relighting sliders'
              : 'Expand relighting sliders'
          }
          onClick={onClick}
        >
          {drawerOpen ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
        </MiradorMenuButton>
      </div>
    );
  }
}

RelightExpandSlidersButton.propTypes = {
  /** The drawerOpen prop tells the button to render as if the sliders are expanded or closed **/
  drawerOpen: PropTypes.bool.isRequired,
  /** The aspect prop contains the current aspect of the window the element is in i.e. portrait or landscape **/
  aspect: PropTypes.string,
  /** The onClick prop is a function used to manage component behaviour when the component is clicked **/
  onClick: PropTypes.func.isRequired,
};

export default RelightExpandSlidersButton;
