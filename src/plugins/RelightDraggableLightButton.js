import React, { Component } from 'react';
import HighLightOutlined from '@material-ui/icons/Highlight';
import PropTypes from 'prop-types';
import Tooltip from '@material-ui/core/Tooltip';
import Draggable from 'react-draggable';

class RelightDraggableLightButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOver: false,
      isDragging: false,
    };
  }

  onDrag(event) {
    this.setState({ isDragging: true });
  }

  onStop(event) {
    this.setState({ isDragging: false });
  }

  onMouseOver(event) {
    this.setState({ isOver: true });
  }

  onMouseLeave(event) {
    this.setState({ isOver: false });
  }

  render() {
    return (
      <Draggable
        onDrag={(event) => this.onDrag(event)}
        onStop={(event) => this.onStop(event)}
        bounds=".draggable-container"
      >
        <div
          onMouseOver={(event) => this.onMouseOver(event)}
          onMouseLeave={(event) => this.onMouseLeave(event)}
        >
          <Tooltip
            open={this.state.isDragging || !this.state.isOver ? false : true}
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

// Add PropTypes
RelightDraggableLightButton.propTypes = {
  label: PropTypes.string,
};

RelightDraggableLightButton.defaultProps = {
  label: 'Toggle',
};

export default RelightDraggableLightButton;
