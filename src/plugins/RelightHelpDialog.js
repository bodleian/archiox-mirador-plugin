import React from 'react';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import Dialog from '@material-ui/core/Dialog';
import Close from '@material-ui/icons/Close';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';
import PropTypes from 'prop-types';

class RelightHelpDialog extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { helpOn, onClose } = this.props;
    return (
      <Dialog onClose={onClose} open={helpOn}>
        <div className="relightHelpDialog">
          <MiradorMenuButton aria-label={'Click here to close help'}>
            <Close onClick={onClose} />
          </MiradorMenuButton>
        </div>
        <MuiDialogTitle onClose={onClose}>Help</MuiDialogTitle>
        <MuiDialogContent>This is the help text</MuiDialogContent>
      </Dialog>
    );
  }
}

RelightHelpDialog.propTypes = {
  /** The id prop is used to populate the html id property so that we can keep track of the controls state **/
  id: PropTypes.string.isRequired,
  /** The helpOn prop tells the button to render as if the Dialog box is open **/
  helpOn: PropTypes.bool,
  /** The onClose prop tells the dialogue to trigger the onClose function when it is closed **/
  onClose: PropTypes.func.isRequired,
};

RelightHelpDialog.defaultProps = {
  helpOn: false,
};

export default RelightHelpDialog;
