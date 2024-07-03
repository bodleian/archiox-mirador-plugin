import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import PropTypes from 'prop-types';

/**
 * The RelightLightDirection component is a circular div component that is styled to look like a hemisphere being lit
 * from an angle by a light.  It allows the user to have a cheap way to see which direction the directional light is
 * pointing (as it is just a 2D html object).  It will also detect various mouse events that allow the user to use it
 * to also change the direction of the directional light in the Three canvas scene.  The movement of x and y is mapped
 * to the direction of the directional light in the Three canvas scene.
 */
class RelightLightDirection extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {
      id,
      tooltipTitle,
      mouseX,
      mouseY,
      onMouseMove,
      onMouseDown,
      onMouseUp,
      onMouseLeave,
    } = this.props;
    return (
      <>
        <Tooltip title={tooltipTitle}>
          <div
            id={id}
            style={{
              border: '#000000',
              width: '100px',
              height: '100px',
              margin: '13px',
              borderRadius: '50px',
              background:
                `radial-gradient(at ` +
                mouseX +
                `% ` +
                mouseY +
                `%, #ffffff, #000000)`,
            }}
            aria-label="Change light direction"
            aria-expanded="False"
            onMouseMove={onMouseMove}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onTouchMove={onMouseMove}
          />
        </Tooltip>
      </>
    );
  }
}

RelightLightDirection.propTypes = {
  /** The id prop is used to populate the html id property so that we can keep track of the controls state **/
  id: PropTypes.string.isRequired,
  /** The tooltipTitle prop is used to define the text that appears in the hover over component tooltip **/
  tooltipTitle: PropTypes.string.isRequired,
  /** The onMouseMove prop is a function used to manage the component behaviour when the mouse is moved over **/
  onMouseMove: PropTypes.func.isRequired,
  /** The onMouseDown prop is a function used to manage the component behaviour when the mouse button is pressed **/
  onMouseDown: PropTypes.func.isRequired,
  /** The onMouseUp prop is a function used to manage the component behaviour when the mouse button is released **/
  onMouseUp: PropTypes.func.isRequired,
  /** The onMouseLeave prop is a function used to manage the component behaviour when the mouse is moved off **/
  onMouseLeave: PropTypes.func.isRequired,
  /** The onTouchMove prop is a function used to manage the component behaviour when a finger moved over **/
  onTouchMove: PropTypes.func.isRequired,
  /** The mouseX prop is the current x coordinate of the mouse or touch event **/
  mouseX: PropTypes.number,
  /** The mouseY prop is the current y coordinate of the mouse or touch event **/
  mouseY: PropTypes.number,
};

RelightLightDirection.defaultProps = {
  mouseX: 50,
  mouseY: 50,
};
export default RelightLightDirection;
