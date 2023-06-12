import React, { Component } from 'react';
import compose from 'lodash/flowRight';
import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';

const styles = () => ({
  div: {
    float: 'left',
    display: 'flex',
  },
});
class RelightLightControls extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { children } = this.props;
    return <div>{children}</div>;
  }
}

RelightLightControls.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default compose(withStyles(styles), RelightLightControls);
