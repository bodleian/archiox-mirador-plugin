import React from 'react';
import compose from 'lodash/flowRight';
import Tooltip from '@material-ui/core/Tooltip';
import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';
const styles = () => ({
class RelightLightDirection extends React.Component {
    border: '#000000',
    width: '100px',
    height: '100px',
    borderRadius: '50px',
    margin: '13px',
  },
});
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
export default compose(withStyles(styles), RelightLightDirection);
