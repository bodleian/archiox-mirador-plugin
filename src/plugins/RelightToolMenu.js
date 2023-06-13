import React from 'react';
import PropTypes from 'prop-types';

class RelightToolMenu extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { sideBarOpen, children } = this.props;
    let leftOffset;

    if (sideBarOpen) {
      leftOffset = '37px';
    } else {
      leftOffset = '8px';
    }

    return (
        <div
        style={{
          display: 'flex',
          alignItems: 'center',
          position: 'absolute',
          top: '8px',
          borderRadius: '25px',
          zIndex: 999,
          backgroundColor: `rgba(255, 255, 255, 0.8)`,
          left: leftOffset,
        }}
        className={'MuiPaper-elevation4 '}
      >
        {children}
      </div>);
  }
}

RelightToolMenu.propTypes = {
  sideBarOpen: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};
export default RelightToolMenu;
