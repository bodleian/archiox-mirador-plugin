import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';
import React from 'react';
import PhotoCameraOutlined from '@material-ui/icons/PhotoCameraOutlined'
import PropTypes from "prop-types";
import RelightCycleDefaultLayer from "archiox-mirador-plugin/src/plugins/RelightCycleDefaultLayer";

class RelightSnapshotButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { active, id, onClick } = this.props;
        return(
            <MiradorMenuButton
                id={id}
                aria-label="Take a screenshot of the current rendered view"
                onClick={onClick}
                disabled={!active}
            >
               <PhotoCameraOutlined />
            </MiradorMenuButton>
        );
    }
}

RelightSnapshotButton.propTypes = {
    /** The id prop is used to populate the html id property so that we can keep track of the controls state **/
    id: PropTypes.string.isRequired,
    /** The onClick prop is a function used to manage component behaviour when the component is clicked **/
    onClick: PropTypes.func.isRequired,
    /** The active prop is a boolean value used to decide if the RelightSnapshotButton should be enabled or not **/
    active: PropTypes.bool.isRequired,
};

export default RelightSnapshotButton;
