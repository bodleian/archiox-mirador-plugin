import React, { Component } from 'react';
import HighLightOutlined from '@material-ui/icons/Highlight';
import PropTypes from 'prop-types';
import Tooltip from '@material-ui/core/Tooltip';
import Draggable from 'react-draggable';

class RelightDraggableLightButton extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { onDrag, onStop, onMouseOver, onMouseLeave, isDragging, isOver } =
      this.props;
    return (
      <Draggable
        onDrag={(event) => onDrag(event)}
        onStop={(event) => onStop(event)}
        bounds=".draggable-container"
      >
        <div
          onMouseOver={(event) => onMouseOver(event)}
          onMouseLeave={(event) => onMouseLeave(event)}
        >
          <Tooltip
            open={isDragging || !isOver ? false : true}
            title={'Drag this button to move the directional light around'}
          >
            <div className="draggable-torch-button">
              <HighLightOutlined />
            </div>
          </Tooltip>
        </div>
      </Draggable>
    );
  }
}

RelightDraggableLightButton.propTypes = {
  label: PropTypes.string,
};

RelightDraggableLightButton.defaultProps = {
  label: 'Toggle',
};

export default RelightDraggableLightButton;
