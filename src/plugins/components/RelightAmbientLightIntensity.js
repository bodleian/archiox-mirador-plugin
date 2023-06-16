import React from 'react';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';
import PropTypes from 'prop-types';

class RelightAmbientLightIntensity extends React.Component {
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

RelightAmbientLightIntensity.propTypes = {
  id: PropTypes.string.isRequired,
  tooltipTitle: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  intensity: PropTypes.number,
  defaultIntensity: PropTypes.number,
  step: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  orientation: PropTypes.string,
  size: PropTypes.string,
};

RelightAmbientLightIntensity.defaultProps = {
  intensity: 0.1,
  defaultIntensity: 0.1,
  step: 0.1,
  min: 0.0,
  max: 1.0,
  orientation: 'vertical',
  size: 'small',
};
export default RelightAmbientLightIntensity;
