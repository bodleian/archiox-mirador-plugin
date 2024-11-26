import React from 'react';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';
import PropTypes from 'prop-types';

/**
 * The RelightDirectionalLightIntensity component is a component that is used to render a slider component to change
 * the directional light intensity of the Three canvas scene.
 */
class RelightDirectionalLightIntensity extends React.Component {
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
            height: '87px',
            padding: '0px 15px',
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

RelightDirectionalLightIntensity.propTypes = {
  /** The id prop is used to populate the html id property so that we can keep track of the controls state **/
  id: PropTypes.string.isRequired,
  /** The tooltipTitle prop is used to define the text that appears in the hover over component tooltip **/
  tooltipTitle: PropTypes.string.isRequired,
  /** The onChange prop is a function used to manage component behaviour when the component is changed **/
  onChange: PropTypes.func.isRequired,
  /** The intensity prop is the current value the slider should be set to **/
  intensity: PropTypes.number,
  /** The defaultIntensity prop is the value the slider should be set to a first render **/
  defaultIntensity: PropTypes.number,
  /** The step prop is the size of increment a change in value to the slider should cause **/
  step: PropTypes.number,
  /** The min prop is the minimum value that the slider can have **/
  min: PropTypes.number,
  /** The max prop is the maximum value that the slider can have **/
  max: PropTypes.number,
  /** The orientation prop specifies if the slider is rendered horizontal or vertical **/
  orientation: PropTypes.string,
  /** The size prop specifies if the slider pip and bar are rendered large or small **/
  size: PropTypes.string,
};

RelightDirectionalLightIntensity.defaultProps = {
  intensity: 1.0,
  defaultIntensity: 1.0,
  step: 0.1,
  min: 0.1,
  max: 1.0,
  orientation: 'vertical',
  size: 'small',
};
export default RelightDirectionalLightIntensity;
