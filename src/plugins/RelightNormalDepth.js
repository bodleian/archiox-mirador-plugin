import React from 'react';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';

/**
 * The RelightNormalDepth component is a component that is used to render a slider component to change the
 * normalmap depth of the Three canvas scene.
 */
class RelightNormalDepth extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      id,
      tooltipTitle,
      defaultNormalDepth,
      normalDepth,
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
          defaultValue={defaultNormalDepth}
          value={normalDepth}
          step={step}
          min={min}
          max={max}
          onChange={onChange}
        />
      </Tooltip>
    );
  }
}

RelightNormalDepth.propTypes = {
  /** The id prop is used to populate the html id property so that we can keep track of the controls state **/
  id: PropTypes.string.isRequired,
  /** The tooltipTitle prop is used to define the text that appears in the hover over component tooltip **/
  tooltipTitle: PropTypes.string.isRequired,
  /** The onChange prop is a function used to manage component behaviour when the component is changed **/
  onChange: PropTypes.func.isRequired,
  /** The normalDeph prop is the current value the slider should be set to **/
  normalDepth: PropTypes.number,
  /** The defaultNormalDepth prop is the value the slider should be set to a first render **/
  defaultNormalDepth: PropTypes.number,
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

RelightNormalDepth.defaultProps = {
  normalDepth: 1,
  defaultNormalDepth: 1,
  step: 1,
  min: 1,
  max: 10,
  orientation: 'vertical',
  size: 'small',
};
export default RelightNormalDepth;
