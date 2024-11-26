import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import PropTypes from 'prop-types';
import { ReactComponent as Angles } from './public/angles.svg';

/**
 * The RelightLightDirection component is a circular div component that is styled to look like a hemisphere being lit
 * from an angle by a light.  It allows the user to have a cheap way to see which direction the directional light is
 * pointing (as it is just a 2D html object).  It will also detect various mouse events that allow the user to use it
 * to also change the direction of the directional light in the Three canvas scene.  The movement of x and y is mapped
 * to the direction of the directional light in the Three canvas scene.
 **/
class RelightLightDirection extends React.Component {
  constructor(props) {
    super(props);
    this.rotation = this.props.rotation % 360;
    this.adjustedAngle = 0;
    this.currentAngle = 0;
    this.transform = `rotate(${this.rotation}deg)`;
    this.state = {
      calculatedBackgroundStyle:
        `radial-gradient(at ` + 50 + `% ` + 50 + `%, #ffffff, #000000)`,
    };
  }

  /**
   * The rotatePoint method re-positions the RelightLightDirection based on rotation of the OpenSeaDragon canvas
   * flip is currently not supported.
   * @param {number} x The current x mouse position over the component
   * @param {number} y The current y mouse position over the component
   * @param {boolean} rotate If the canvas was rotated
   * @param {boolean} flipped If the canvas is currently flipped
   * @param {number} angle The current angle that the OpenSeaDragon canvas is rotated by
   * */
  rotatePoint(x, y, rotate, flipped, angle = 0) {
    if (!rotate) {
      switch (angle) {
        case 0:
          this.adjustedAngle = 0;
          break;
        case -270:
        case 90:
          this.adjustedAngle = 90;
          break;
        case -180:
        case 180:
          this.adjustedAngle = 180;
          break;
        case -90:
        case 270:
          this.adjustedAngle = 270;
          break;
      }
    }
    const radians = (Math.PI / 180) * (angle - this.adjustedAngle);
    const cx = 50;
    const cy = 50;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const nx = cos * (x - cx) - sin * (y - cy) + cx;
    const ny = cos * (y - cy) + sin * (x - cx) + cy;

    if (rotate || flipped) {
      this.setState({
        calculatedBackgroundStyle:
          `radial-gradient(at ` +
          Math.abs(nx) +
          `% ` +
          Math.abs(ny) +
          `%, #ffffff, #000000)`,
      });
    } else {
      this.setState({
        calculatedBackgroundStyle:
          `radial-gradient(at ` +
          Math.abs(x) +
          `% ` +
          Math.abs(y) +
          `%, #ffffff, #000000)`,
      });
    }
  }

  /**
   * The componentDidUpdate method is a standard React class method that is used to run other methods whenever state or
   * props are updated.  Here we used it to re-render the RelightLightDirection control if there is a change in state detected.
   * @param prevProps the previous props sent to the Relight component
   * @param prevState the previous state set in the Relight component
   * @param snapshot a snapshot of the component before the next render cycle, you can use the React class method
   * getSnapShotBeforeUpdate to create this
   * **/
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.rotation !== this.props.rotation) {
      this.rotatePoint(
        this.props.moveX,
        this.props.moveY,
        true,
        this.props.flipped,
        this.props.rotation % 360
      );
    }
    if (
      prevProps.moveX !== this.props.moveX ||
      prevProps.moveY !== this.props.moveY
    ) {
      this.rotatePoint(
        this.props.moveX,
        this.props.moveY,
        false,
        this.props.flipped,
        this.props.rotation % 360
      );
    }
    if (prevProps.flipped !== this.props.flipped) {
      this.rotatePoint(
        this.props.moveX,
        this.props.moveY,
        false,
        this.props.flipped,
        this.props.rotation % 360
      );
    }
  }
  /**
   Render the RelightLightDirection component
   @returns {JSX.Element}
   */
  render() {
    const {
      id,
      tooltipTitle,
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
              background: this.state.calculatedBackgroundStyle,
            }}
            aria-label="Change light direction"
            aria-expanded="False"
            onMouseMove={onMouseMove}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onTouchMove={onMouseMove}
          >
            <Angles width="100px" height="100px" alt="" />
          </div>
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
  /** The moveX prop is the raw mouse X position over the component needed for styling changes **/
  moveX: PropTypes.number.isRequired,
  /** The moveY prop is the raw mouse Y position over the component needed for styling changes **/
  moveY: PropTypes.number.isRequired,
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
  mouseX: PropTypes.number.isRequired,
  /** The mouseY prop is the current y coordinate of the mouse or touch event **/
  mouseY: PropTypes.number.isRequired,
  /** The rotation prop is the current rotation of the viewer **/
  flipped: PropTypes.bool.isRequired,
  /** The flipped prop is the current flip state of the OpenSeaDragon viewer  **/
  rotation: PropTypes.number.isRequired,
};

RelightLightDirection.defaultProps = {
  mouseX: 50,
  mouseY: 50,
};
export default RelightLightDirection;
