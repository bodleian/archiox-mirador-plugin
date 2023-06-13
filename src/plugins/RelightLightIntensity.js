import React, { Component } from 'react';
import compose from 'lodash/flowRight';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';
import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';

const styles = () => ({
  slider: {
    marginTop: '20px',
    marginBottom: '20px',
    marginLeft: '8px',
    marginRight: '8px',
    height: '87px',
  },
});
class RelightLightIntensity extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      id,
      tooltipTitle,
      defaultIntensity,
      intensity,
      onChange,
      step,
      min,
      max,
      orientation,
      size,
    } = this.props;
    return (
      <>
        <Tooltip title={tooltipTitle}>
          <Slider
            id={id}
            size={size}
            orientation={orientation}
            marks
            defaultValue={defaultIntensity}
            value={intensity}
            step={step}
            min={min}
            max={max}
            onChange={onChange}
          />
        </Tooltip>
      </>
    );
  }
}

RelightLightIntensity.propTypes = {
  id: PropTypes.string.isRequired,
  tooltipTitle: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  intensity: PropTypes.number.isRequired,
  defaultIntensity: PropTypes.number,
  step: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  orientation: PropTypes.string,
  size: PropTypes.string,
};

RelightLightIntensity.defaultProps = {
  defaultIntensity: 1.0,
  step: 0.1,
  min: 0.1,
  max: 1.0,
  orientation: 'vertical',
  size: 'small',
};
export default compose(withStyles(styles), RelightLightIntensity);
