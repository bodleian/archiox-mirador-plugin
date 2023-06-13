import React from 'react';
import PropTypes from 'prop-types';

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
              borderRadius: '50px',
              margin: '13px',
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
      </>);
  }
}

RelightLightDirection.propTypes = {
  id: PropTypes.string.isRequired,
  tooltipTitle: PropTypes.string.isRequired,
  onMouseMove: PropTypes.func.isRequired,
  onMouseDown: PropTypes.func.isRequired,
  onMouseUp: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  onTouchMove: PropTypes.func.isRequired,
  mouseX: PropTypes.number,
  mouseY: PropTypes.number,
};

RelightLightDirection.defaultProps = {
  mouseX: 50,
  mouseY: 50,
};
export default RelightLightDirection;
