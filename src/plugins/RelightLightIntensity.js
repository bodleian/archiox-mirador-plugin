import React from 'react';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';
import PropTypes from 'prop-types';

class RelightLightIntensity extends React.Component {
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
      <Tooltip title={tooltipTitle}>
        <Slider
          id={id}
          style={{
            marginTop: '20px',
            marginBottom: '20px',
            marginLeft: '8px',
            marginRight: '8px',
            height: '87px',
          }}
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
export default RelightLightIntensity;
