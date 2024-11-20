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
    this.currentAngle = 0;
    this.transform = `rotate(${this.rotation}deg)`;
    this.calculatedBackgroundStyle =
      `radial-gradient(at ` + 50 + `% ` + 50 + `%, #ffffff, #000000)`;
  }

  calculatePolarAngleFromCSS(cssValue) {
      case 0:
    const regex = /(\d+(\.\d+)?)% (\d+(\.\d+)?)/;
    const matches = cssValue.match(regex);

    if (!matches) {
      throw new Error('Invalid CSS radial-gradient format');
    }

      case -270:
    const x = parseFloat(matches[1]);
    const y = parseFloat(matches[3]);
          `radial-gradient(at ` +
          mouseY +
    const cx = 50; // Center X (50%)
    const cy = 50; // Center Y (50%)
          `%, #ffffff, #000000)`;
        break;
    let dx = x - cx; // Horizontal distance from center
    let dy = y - cy; // Vertical distance from center
        style =
          `radial-gradient(at ` +
    let angleInRadians = Math.atan2(dy, dx);
          `% ` +
          mouseY +
    let angleInDegrees = angleInRadians * (180 / Math.PI);
        break;
      case -90:
    angleInDegrees = (angleInDegrees + 90) % 360;

          `radial-gradient(at ` +
    if (angleInDegrees < 0) {
      angleInDegrees += 360;
    }

    return Math.round(angleInDegrees);
  }

  /**
   *
   * **/
  rotatePoint(x, y, rotate, currentAngle = 0) {
    let angle;
    let residualAngle = currentAngle;

    console.log('Current angle inside function: ', currentAngle);

    if (rotate) {
      angle = residualAngle + 90; // Ensure the angle stays within 0-360 degrees
      console.log(angle);
    } else {
      angle = 0;
    }
    const radians = (angle * Math.PI) / 180;
    const cx = 50;
    const cy = 50;
    let dx = x - cx;
    let dy = y - cy;
    const rotatedX = dx * Math.cos(radians) - dy * Math.sin(radians);
    const rotatedY = dx * Math.sin(radians) + dy * Math.cos(radians);
    const newX = rotatedX + cx;
    const newY = rotatedY + cy;

    return `radial-gradient(circle at ${newX}% ${newY}%, #ffffff, #000000)`;
  }

  /**
   *
   * **/
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.rotation !== this.props.rotation) {
      console.log('Current angle: ', this.currentAngle);
      const currentCalculatedBackgroundStyle = document.getElementById(
        this.props.id
      ).style.background;
      this.currentAngle = this.calculatePolarAngleFromCSS(
        currentCalculatedBackgroundStyle
      );
      this.calculatedBackgroundStyle = this.rotatePoint(
        this.props.moveX,
        this.props.moveY,
        true,
        this.currentAngle
      );
    }
    if (
      prevProps.moveX !== this.props.moveX ||
      prevProps.moveY !== this.props.moveY
    ) {
      this.calculatedBackgroundStyle = this.rotatePoint(
        this.props.moveX,
        this.props.moveY,
        false,
        this.currentAngle
      );
      const currentCalculatedBackgroundStyle = document.getElementById(
        this.props.id
      ).style.background;
      this.currentAngle = this.calculatePolarAngleFromCSS(
        currentCalculatedBackgroundStyle
      );
    }
  }

  render() {
    const {
      id,
      tooltipTitle,
      onMouseMove,
      onMouseDown,
      onMouseUp,
      onMouseLeave,
      rotation,
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
              background: this.calculatedBackgroundStyle,
              //transform: this.transform
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
  mouseX: PropTypes.number,
  /** The mouseY prop is the current y coordinate of the mouse or touch event **/
  mouseY: PropTypes.number,
  /** The rotation prop is the current rotation of the viewer**/
  rotation: PropTypes.number,
};

RelightLightDirection.defaultProps = {
  /** **/
  mouseX: 50,
  /** **/
  mouseY: 50,
};
export default RelightLightDirection;
