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
    const {
      onDrag,
      onStop,
      onMouseOver,
      onMouseLeave,
      isDragging,
      isOver,
      isVisible,
    } = this.props;
    if (isVisible) {
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
              title={'Move directional light torch'}
            >
              <div className="draggable-torch-button">
                <HighLightOutlined />
              </div>
            </Tooltip>
          </div>
        </Draggable>
      );
    } else {
      return null;
    }
  }
}

RelightDraggableLightButton.propTypes = {
  /** The onDrag function is the event handler passed from Relight to this component **/
  onDrag: PropTypes.func.isRequired,
  /** The onStop function is the event handler passed from Relight to this component **/
  onStop: PropTypes.func.isRequired,
  /** The onMouseOver function is the event handler passed from Relight to this component **/
  onMouseOver: PropTypes.func.isRequired,
  /** The onMouseLeave function is the event handler passed from Relight to this component **/
  onMouseLeave: PropTypes.func.isRequired,
  /** The isDragging prop is a boolean value telling the component if it's currently being dragged or not **/
  isDragging: PropTypes.bool.isRequired,
  /** The isOver prop is a boolean value telling the component if the mouse is over it or not **/
  isOver: PropTypes.bool.isRequired,
  /** The isVisible prop is a boolean value telling the button to render or not**/
  isVisible: PropTypes.bool.isRequired,
};

export default RelightDraggableLightButton;
