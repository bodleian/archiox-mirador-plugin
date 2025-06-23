import React from 'react';
import HelpOultined from '@material-ui/icons/HelpOutlined';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';
import PropTypes from 'prop-types';

class RelightHelpButton extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { id, onClick } = this.props;
    return (
      <MiradorMenuButton
        id={id}
        aria-label={
          'Click here to open up a dialog box providing in-detail guidance on using this tool'
        }
        onClick={onClick}
      >
        <HelpOultined />
      </MiradorMenuButton>
    );
  }
}

RelightHelpButton.propTypes = {
  /** The id prop is used to populate the html id property so that we can keep track of the controls state **/
  id: PropTypes.string.isRequired,
  /** The onClick prop is a function used to manage component behaviour when the component is clicked **/
  onClick: PropTypes.func.isRequired,
};

export default RelightHelpButton;
