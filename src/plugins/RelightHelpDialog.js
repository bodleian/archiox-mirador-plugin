import React from 'react';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import CloseSharpIcon from '@material-ui/icons/CloseSharp';
import BuildOutlined from '@material-ui/icons/BuildOutlined';
import HighLightOutlined from '@material-ui/icons/HighlightOutlined';
import Highlight from '@material-ui/icons/Highlight';
import CollectionsOutlined from '@material-ui/icons/CollectionsOutlined';
import ControlCamera from '@material-ui/icons/ControlCamera';
import WbIncandescentOutlined from '@material-ui/icons/WbIncandescentOutlined';
import Waves from '@material-ui/icons/Waves';
import Height from '@material-ui/icons/Height';
import Flare from '@material-ui/icons/Flare';
import Dialog from '@material-ui/core/Dialog';
import Close from '@material-ui/icons/Close';
import ReplaySharpIcon from '@material-ui/icons/ReplaySharp';
import AssistantOutlined from '@material-ui/icons/AssistantOutlined';
import BrightnessHighOutlined from '@material-ui/icons/BrightnessHighOutlined';
import LocalMoviesIcon from '@material-ui/icons/LocalMovies';
import HelpOultined from '@material-ui/icons/HelpOutlined';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';
import PropTypes from 'prop-types';

/**
 * The RelightHelpDialog component is a plug-in dialog box that contains detailed instructions on how to use the
 * plug-in to allow users who are unfamiliar with the terminology.
 **/
class RelightHelpDialog extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { id, helpOn, onClose } = this.props;
    return (
      <Dialog id={id} onClose={onClose} open={helpOn} maxWidth="md">
        <div className="relightHelpDialog">
          <MiradorMenuButton aria-label={'Click here to close help'}>
            <Close onClick={onClose} />
          </MiradorMenuButton>
        </div>
        <MuiDialogTitle className="relightHelpDialogHeader" onClose={onClose}>
          <h1 className="relightHelpDialogHeadingOne">Help</h1>
        </MuiDialogTitle>
        <MuiDialogContent>
          <div>
            <ol>
              <li>
                <p>The following options are available in the initial state.</p>
                <ul>
                  <li>
                    <CloseSharpIcon className="icon" />|
                    <BuildOutlined className="icon" />
                    <b>Collapse/Expand rendering toolbar</b>
                    <blockquote>
                      <p className="relightHelpDialogTextParagraph">
                        This button simply expands or collapses the main plugin
                        toolbar.
                      </p>
                    </blockquote>
                  </li>
                  <li>
                    <HighLightOutlined className="icon" />|
                    <Highlight className="icon" />
                    <b>Activate 3D overlay/Deactivate 3D overlay</b>
                    <blockquote>
                      <p className="relightHelpDialogTextParagraph">
                        This button activates or deactivates a WebGL 3D renderer
                        overlay positioned over the object in the OpenSeadragon
                        viewport that relights the object using normal and
                        albedo map data.
                      </p>
                    </blockquote>
                  </li>
                  <li>
                    <CollectionsOutlined className="icon" />
                    <b>Select active layer</b>
                    <blockquote>
                      <p className="relightHelpDialogTextParagraph">
                        This button opens up a submenu allowing the user to
                        choose which layer in the IIIF choices stack is
                        currently active via image thumbnail buttons.
                      </p>
                    </blockquote>
                  </li>
                </ul>
              </li>
              <li>
                <p className="relightHelpDialogTextParagraph">
                  When the 3D overlay is active, after pressing the{' '}
                  <b>Activate 3D overlay</b> button. A 3D overlay will be
                  superimposed over the object in the OpenSeadragon viewport and
                  the toolbar will expand downwards with the following extra
                  options:
                </p>
                <ul>
                  <li>
                    <ControlCamera className="icon" />
                    <b>Move directional light trackball</b>
                    <blockquote>
                      <p className="relightHelpDialogTextParagraph">
                        This icon appears below a circular polar angle control
                        that will move the directional lighting in the 3D
                        overlay when the user clicks and drags the mouse cursor
                        over it. The coordinates in this control map to a
                        hemisphere in the 3D overlay, i.e. if one moves the
                        light direction to the centre, the light will be at the{' '}
                        <b>zenith</b> (altitude of 90 degrees directly above the
                        object) and moving it to the far right in the middle it
                        will be at an altitude of 0 degrees at an azimuth of 90
                        degrees.
                      </p>
                    </blockquote>
                  </li>
                  <li>
                    <Highlight className="icon" />
                    <b>Move directional light torch</b>
                    <blockquote>
                      <p className="relightHelpDialogTextParagraph">
                        This draggable button is an alternative to the circular
                        polar angle control allowing the user to map the
                        directional light movement to the confines of the
                        OpenSeadragon view port instead of the smaller control,
                        this might be easier for certain people to use than the
                        other method, and it works in a similar way.
                      </p>
                    </blockquote>
                  </li>
                  <li>
                    <HighLightOutlined className="icon" />
                    <b>Change directional light intensity</b>
                    <blockquote>
                      <p className="relightHelpDialogTextParagraph">
                        This icon appears below a slider control that allows the
                        user to increase or decrease the intensity of the
                        directional light source; this can be helpful in
                        exaggerating or attenuating shadows and highlights.
                      </p>
                    </blockquote>
                  </li>
                  <li>
                    <WbIncandescentOutlined className="icon" />
                    <b>Change ambient light intensity</b>
                    <blockquote>
                      <p className="relightHelpDialogTextParagraph">
                        This icon appear below a slider control that allows the
                        user to increase or decrease the incidental light source
                        of the scene i.e. the light coming from the{' '}
                        <b>environment</b> and not the torch.
                      </p>
                    </blockquote>
                  </li>
                  <li>
                    <Height className="icon" />
                    <b>Change normal depth</b>
                    <blockquote>
                      <p className="relightHelpDialogTextParagraph">
                        This icon appears below a slider control that allows the
                        user to increase or decrease the normal depth of the
                        object; what this means is that the depth of the surface
                        details can be artificially increased or flattened to
                        the baseline data, this is especially useful for objects
                        with very shallow details such as paper block prints.
                      </p>
                    </blockquote>
                  </li>
                  <li>
                    <Waves className="icon" />
                    <b>Change object roughness</b>
                    <blockquote>
                      <p className="relightHelpDialogTextParagraph">
                        This icon appears below a slider control that allows the
                        user to increase or decrease the roughness value of the
                        default physically based rendering (PBR) shader we use
                        to blend our textures into a realistic rendering of the
                        object in the 3D overlay. Paper and matte objects have
                        medium to high roughness values, i.e. the higher the
                        roughness the less light will be reflected by the
                        object, conversely a polished object will have a low
                        roughness value. This control allows the user to adjust
                        this value to optimise their viewing experience
                        depending on the materials the object is composed of.
                      </p>
                    </blockquote>
                  </li>
                  <li>
                    <Flare className="icon" />
                    <b>Change object metalness</b>
                    <blockquote>
                      <p className="relightHelpDialogTextParagraph">
                        This icon appears below a slider control that allows the
                        user to increase or dcrease the metalness value of the
                        default physically based rendering (PBR) shader we use
                        to blend our textures into a realistic rendering of the
                        object in the 3D overlay. Metal materials have a
                        metalness value of 1 and non-metal materials
                        (dielectric) have a metalness value of 0. If the object
                        is meant to be metallic, set the metalness value to 1,
                        otherwise set it to 0.
                      </p>
                    </blockquote>
                  </li>
                  <li>
                    <ReplaySharpIcon className="icon" />
                    <b>Reset all light settings</b>
                    <blockquote>
                      <p className="relightHelpDialogTextParagraph">
                        This button will reset all changed lighting settings,
                        including light direction to the default values for the
                        shader selected.
                      </p>
                    </blockquote>
                  </li>
                  <li>
                    <AssistantOutlined className="icon" />
                    <b>Turn on directional light helper</b>
                    <blockquote>
                      <p className="relightHelpDialogTextParagraph">
                        This button will add a visual helper to the directional
                        light so that you can see where the directional light is
                        currently pointing to. The white dot is the focal point
                        of the light, and the blue square the direction the
                        light is coming from.
                      </p>
                    </blockquote>
                  </li>
                  <li>
                    <BrightnessHighOutlined className="icon" />|
                    <LocalMoviesIcon className="icon" />
                    <b>
                      Specular enhancement mode/Physically based rendering mode
                    </b>
                    <blockquote>
                      <p className="relightHelpDialogTextParagraph">
                        This button will toggle between two different shaders,
                        physically based rendering and specular enhancement. The
                        first will try to render a lifelike digital facsimile of
                        the object as it would appear in real life and specular
                        enhancement is a monochrome representation designed to
                        exaggerate highlights and shadows allowing the user to
                        see potentially hidden details better.
                      </p>
                    </blockquote>
                  </li>
                  <li>
                    <HelpOultined className="icon" />
                    <b>Help</b>
                    <blockquote>
                      <p className="relightHelpDialogTextParagraph">
                        This button will toggle the appearance of this dialogue
                        box containing the help text
                      </p>
                    </blockquote>
                  </li>
                </ul>
              </li>
            </ol>
          </div>
        </MuiDialogContent>
      </Dialog>
    );
  }
}

RelightHelpDialog.propTypes = {
  /** The id prop is used to populate the html id property so that we can keep track of the controls state **/
  id: PropTypes.string.isRequired,
  /** The helpOn prop tells the button to render as if the Dialog box is open **/
  helpOn: PropTypes.bool,
  /** The onClose prop tells the dialogue to trigger the onClose function when it is closed **/
  onClose: PropTypes.func.isRequired,
};

RelightHelpDialog.defaultProps = {
  helpOn: false,
};

export default RelightHelpDialog;
