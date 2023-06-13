import React from 'react';

import HighlightIcon from '@material-ui/icons/Highlight';
import CloseSharpIcon from '@material-ui/icons/CloseSharp';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';
import PropTypes from 'prop-types';

class RelightMenuButton extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { open, onClick } = this.props;
    return (
      <MiradorMenuButton
        aria-label={
          open ? 'Collapse Relighting Tools' : 'Expand Relighting Tools'
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
  open: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default RelightMenuButton;
