///////////////////
///// IMPORTS /////
///////////////////

// NPM

// @ts-ignore missing module declaration(s)
import riveWASMResource from "@rive-app/canvas-lite/rive.wasm";
import { Rive, RuntimeLoader } from "@rive-app/canvas-lite";
RuntimeLoader.setWasmUrl(riveWASMResource);

import { FRP } from "__root__/_utils/FRP.ts"

// CLASS
import BaseComponent from "__root__/_common/baseComponent/BaseComponent.ts";

// ASSETS
import theu0000___preface from './_assets/theu0000___preface.riv';

/////////////////
///// CLASS /////
/////////////////

class Preface extends BaseComponent
{
  riveSpinner;

  ////////////////////////
  ///// CONTROL FLOW /////
  ////////////////////////

  createDOMReferences(fCB)
  {
    this.domReferences.Preface = this.domShadowRoot.querySelector("#Preface");
    this.domReferences.riveSpinner = this.domShadowRoot.querySelector("#riveSpinner");

    /* control flow callback */
    fCB();
  };

  onInitComplete(instanceInitCallback: any): void
  {
    // NOTE: riveSpinner will be undefined until the onLoad callback
    const riveSpinner = new Rive
    ({
      // @ts-ignore: missing parameter definition
      src: theu0000___preface,
      canvas: this.domReferences.riveSpinner,
      artboard: "zap",
      autoplay: false,
      onLoad: function()
      {
        riveSpinner.resizeDrawingSurfaceToCanvas();
        this.riveSpinner = riveSpinner;

        // we wait explicitly for the preface to have loaded/rendered
        instanceInitCallback();
      }.bind(this),
      onPlay: function(e) {}.bind(this),
      onStop: function(e) {
        if (e.data[0] === "Intro")
        {
          this.riveSpinner.play("Idle");
        }
        else if (e.data[0] === "Outro")
        {
          // TODO: can we do this in the outro() method
          document.body.style.overflowY = "auto";
          this.domReferences.Preface.style.display = "none";
        }
      }.bind(this),
      onStateChange: function(e) {}.bind(this)
    });

    // make sure we're always at the correct "resolution"
    FRP.on("theu0000-home_window_resize", function()
    {
      riveSpinner.resizeDrawingSurfaceToCanvas();
    }.bind(this));
  };

  ////////////////////////////
  ///// NON-CONTROL FLOW /////
  ////////////////////////////

  intro()
  {
    document.body.style.overflowY = "hidden"
    this.domReferences.Preface.style.opacity = 1.0;

    this.riveSpinner.play("Intro");
  };

  outro()
  {
    this.riveSpinner.play("Outro");
  };
};

////////////////////////////////////
///// WEB COMPONENT DEFINITION /////
////////////////////////////////////

customElements.define('theu0000-preface', Preface);

//////////////////////
///// ES6 EXPORT /////
//////////////////////

export default Preface;

////////////////////////////////////////////////////////////
//////////////////////////.        /////////////////////////
/////////////////////     .      ..  ...////////////////////
///////////////////    ..  .   ....    .  ./////////////////
//////////////////        . .  . ...  . ... ////////////////
/////////////////     ...................   ////////////////
/////////////////  .(,(/.%,.*%#&&&.//....   ////////////////
/////////////////  .***/..*,*/%,%%#%*/(/(. ,* //////////////
////////////////( ******  #%#((&%%*&///%%*..(.//////////////
/////////////////(/,((//**&.*,%%(*//.**##, .#(//////////////
///////////////( .(,**....* ...,*,,,%&,((*.* .//////////////
///////////////( . **..(*#/ %%%%#,*##,..*%,,.///////////////
////////////////(.,#/%#%%,#(%#(/&&(%,(.//#,..///////////////
//////////////////(,,/*#(.#/ /(&..%/&/(*(.//////////////////
///////////////////( ***#     .,.,/&%%%*.///////////////////
////////////////////(./,/*,,.,&*(((%%(/ ////////////////////
///////////////////////**.*.*//##.*,,,//////////////////////
///////////////////////  ,*%%/@//(*   ./////////////////////
//////////////////////                 /////////////////////
////////////////////                     ///////////////////