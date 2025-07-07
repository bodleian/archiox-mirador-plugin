import React from 'react';
import CollectionsOutlined from '@material-ui/icons/CollectionsOutlined';
import PropTypes from 'prop-types';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';

/**
 * The RelightLayersMenuButton component is a plug-in button that will toggle the state of layersOpen which determines
 * if the layer selection menu is rendered open or closed.
 **/
class RelightLayersMenuButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { id, onClick, active } = this.props;
    return (
      <MiradorMenuButton
        id={id}
        aria-label={'Open the layer selection menu'}
        style={{
          clear: 'both',
        }}
        onClick={onClick}
        disabled={active}
      >
        <CollectionsOutlined />
      </MiradorMenuButton>
    );
  }
}

RelightLayersMenuButton.propTypes = {
  /** The id prop is used to populate the html id property so that we can keep track of the controls state **/
  id: PropTypes.string.isRequired,
  /** The onClick prop is a function used to manage component behaviour when the component is clicked **/
  onClick: PropTypes.func.isRequired,
  /** The active prop is a boolean value used to decide if the RelightCycleDefaultLayer should be enabled or not **/
  active: PropTypes.bool.isRequired,
};

export default RelightLayersMenuButton;
