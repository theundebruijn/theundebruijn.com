///////////////////
///// IMPORTS /////
///////////////////

// NPM
import { series } from "async";

// @ts-ignore missing module declaration(s)
import riveWASMResource from "@rive-app/canvas-lite/rive.wasm";
import { Rive, RuntimeLoader } from "@rive-app/canvas-lite";
RuntimeLoader.setWasmUrl(riveWASMResource);

import { FRP } from "__root__/_utils/FRP.ts"
import { BUN } from "__root__/_utils/BUN.ts";
import { ENV } from "__root__/_utils/ENV.ts";
import { DOM } from "__root__/_utils/DOM.ts";
import { FONT } from "__root__/_utils/FONT.ts";

// CLASS
import BaseComponent from "__root__/_common/baseComponent/BaseComponent.ts";

// COMPONENTS
import Preface from "./_components/preface/Preface.ts";
import PrefaceHTML from "./_components/preface/Preface.html";
import PrefaceCSS from "./_components/preface/Preface.css";

import Copy from "./_components/copy/Copy.ts";
import CopyHTML from "./_components/copy/Copy.html";
import CopyCSS from "./_components/copy/Copy.css";

import Feathers from "./_components/feathers/Feathers.ts";
import FeathersHTML from "./_components/feathers/Feathers.html";
import FeathersCSS from "./_components/feathers/Feathers.css";

// ASSETS
import sHTML from "./Home.html";
import sCSS from "./Home.css";

import font0001_r from "./_assets/_fonts/font0001_r.woff2";
import font0001_b from "./_assets/_fonts/font0001_b.woff2";

import theu0000___home from './_assets/theu0000___home.riv';

/////////////////
///// CLASS /////
/////////////////

class Home extends BaseComponent
{
  components = Object.create(null);
  domShadowRoot = Object.create(null);

  ////////////////////////
  ///// CONTROL FLOW /////
  /////////////////////////

  componentSpecifics(fCB)
  {
    series(
      [
        function(fCB) { ENV.createState(fCB); }.bind(this),
        function(fCB) { ENV.printState(fCB); }.bind(this),
        function(fCB) { BUN.createWebSocketListener(fCB); }.bind(this),
        function(fCB) { FONT.load("font0001_r", font0001_r, fCB); }.bind(this),
        function(fCB) { FONT.load("font0001_b", font0001_b, fCB); }.bind(this),
      ],
      function (err, results)
      {
        let oColourValues = Object.create(null);

        // TODO: move test to ENV
        (ENV.state.support.p3Colour) ?
        oColourValues = { from : "color(display-p3 1 1 1)", to : "color(display-p3 0 0 0)" } :
        oColourValues = { from : "rgb(255, 255, 255)", to : "rgb(0, 0, 0)" };

        /* control flow callback */

        fCB();
      }.bind(this)
    );
  };

  createComponentInstances(fCB)
  {
    const actualControlflow = function()
    {
      // now we handle the "actual" control flow
      // and dispose of the preface
      series
      (
        [
          function(instanceInitCallback)
          {
            this.components._copy = new Copy(CopyHTML, CopyCSS, instanceInitCallback);
          }.bind(this),

          function(instanceInitCallback)
          {
            this.components._feathers = new Feathers(FeathersHTML, FeathersCSS, instanceInitCallback);
          }.bind(this),
        ],
        function (err, results)
        {
          this.components._preface.outro();

          /* control flow callback */
          fCB();
        }.bind(this)
      );
    }.bind(this);

    // we ensure to load + display the Preface instance first
    series
    (
      [
        function(instanceInitCallback)
        {
          this.components._preface = new Preface(PrefaceHTML, PrefaceCSS, instanceInitCallback);
        }.bind(this),
      ],
      function (err, results)
      {
        this.components._preface.intro();

        actualControlflow();
      }.bind(this)
    );


  };

  populateShadowDOM(fCB)
  {
    DOM.append(this.components._preface, this.domShadowRoot);
    DOM.append(this.components._copy, this.domShadowRoot);
    DOM.append(this.components._feathers, this.domShadowRoot);

    /* control flow callback */
    fCB();
  };

  createDOMReferences(fCB)
  {
    this.domReferences.riveMousePointer = this.domShadowRoot.querySelector("#riveMousePointer");
    this.domReferences.riveMail = this.domShadowRoot.querySelector("#riveMail");
    this.domReferences.rivePhone = this.domShadowRoot.querySelector("#rivePhone");
    this.domReferences.riveEye = this.domShadowRoot.querySelector("#riveEye");

    /* control flow callback */
    fCB();
  };

  createEventHandlers(fCB)
  {
    // TODO?: move to DOM.ts
    // "global" window resize event
    FRP.add("theu0000-home_window_resize", window, "resize");

    if (!ENV.state.device.isMobile)
    {
      /**
       * Handler method for the document.body mousemove event
       * Moves the rive cursor based on the event data
       * @param e native mousemove event
       */
      const onMousemoveCallback = function(e: any)
      {
        this.domReferences.riveMousePointer.style.top = e.clientY + "px";
        this.domReferences.riveMousePointer.style.left = e.clientX + "px";
      };

      // DOM.registerEvent("Home:document.body:mousemove", onMousemoveCallback.bind(this), { nativeTarget: document.body, nativeEvent: "mousemove"} );
      FRP.add("theu0000-home_document.body_mousemove", document.body, "mousemove", onMousemoveCallback.bind(this));
    };

    FRP.add("theu0000-home_domRiveEye_click", this.domReferences.riveEye, "click");

    fCB();
  };

  onInitComplete()
  {
    // TODO: refactor this into the control flow
    if (!ENV.state.device.isMobile)
    {
      const riveMousePointer = new Rive
      ({
        // @ts-ignore: missing parameter definition
        src: theu0000___home,
        canvas: this.domReferences.riveMousePointer,
        artboard: "mouse-pointer",
        autoplay: false,
        onLoad: function()
        {
          riveMousePointer.resizeDrawingSurfaceToCanvas();
        }.bind(this),
        onPlay: function(e) {}.bind(this),
        onStop: function(e) {}.bind(this)
      });

      // make sure we hide it by default
      this.domReferences.riveMousePointer.style.opacity = 0.0;

      FRP.on("theu0000-copy_dom-mailto_mouseenter", function()
      {
        for (let i = 0; i < riveMousePointer.playingAnimationNames.length; i++)
        {
          riveMousePointer.stop(riveMousePointer.playingAnimationNames[i]);
        };

        riveMousePointer.play("PointerToMail");
      }.bind(this));

      FRP.on("theu0000-copy_dom-mailto_mouseleave", function()
      {
        for (let i = 0; i < riveMousePointer.playingAnimationNames.length; i++)
        {
          riveMousePointer.stop(riveMousePointer.playingAnimationNames[i]);
        };
        riveMousePointer.play("MailToPointer");
      }.bind(this));

      FRP.on("theu0000-copy_dom-mailto2_mouseenter", function()
      {
        for (let i = 0; i < riveMousePointer.playingAnimationNames.length; i++)
        {
          riveMousePointer.stop(riveMousePointer.playingAnimationNames[i]);
        };

        riveMousePointer.play("PointerToMail");
      }.bind(this));


      FRP.on("theu0000-copy_dom-mailto2_mouseleave", function()
      {
        for (let i = 0; i < riveMousePointer.playingAnimationNames.length; i++)
        {
          riveMousePointer.stop(riveMousePointer.playingAnimationNames[i]);
        };

        riveMousePointer.play("MailToPointer");
      }.bind(this));

      FRP.on("theu0000-copy_dom-tel_mouseenter", function()
      {
        for (let i = 0; i < riveMousePointer.playingAnimationNames.length; i++)
        {
          riveMousePointer.stop(riveMousePointer.playingAnimationNames[i]);
        };

        riveMousePointer.play("PointerToTel");
      }.bind(this));


      FRP.on("theu0000-copy_dom-tel_mouseleave", function()
      {
        for (let i = 0; i < riveMousePointer.playingAnimationNames.length; i++)
        {
          riveMousePointer.stop(riveMousePointer.playingAnimationNames[i]);
        };

        riveMousePointer.play("TelToPointer");
      }.bind(this));

      // TODO?: move this
      let MousePointerIsVisible = false;

      FRP.on("theu0000-home_document.body_mousemove", function(e)
      {
        // TODO?: can we optimize this?
        if (e.clientX < 15 || e.clientX >  document.body.clientWidth - 15 || e.clientY < 15 || e.clientY > document.body.clientHeight - 15)
        {
          if (MousePointerIsVisible)
          {
            MousePointerIsVisible = false;

            for (let i = 0; i < riveMousePointer.playingAnimationNames.length; i++)
            {
              riveMousePointer.stop(riveMousePointer.playingAnimationNames[i]);
            };

            riveMousePointer.play("PointerToNone");
          };
        }
        else
        {
          if (!MousePointerIsVisible)
          {
            MousePointerIsVisible = true;

            for (let i = 0; i < riveMousePointer.playingAnimationNames.length; i++)
            {
              riveMousePointer.stop(riveMousePointer.playingAnimationNames[i]);
            };

            this.domReferences.riveMousePointer.style.opacity = 1.0;
            riveMousePointer.play("Intro");
          };
        };
      }.bind(this));

      riveMousePointer.play("Intro");
    };

    if (!ENV.state.device.isMobile)
    {
      // TODO: use Rive state machines intead
      let riveEyeIsOn = false;

      const riveEye = new Rive
      ({
        // @ts-ignore: missing parameter definition
        src: theu0000___home,
        canvas: this.domReferences.riveEye,
        artboard: "eye",
        autoplay: false,
        onLoad: function(e)
        {
          // renders using pixelRatio on the canvas, in css we downsample for high res results
          riveEye.resizeDrawingSurfaceToCanvas();
        }.bind(this),
        onPlay: function(e) {}.bind(this),
        onStop: function(e) {}.bind(this)
      });

      // make sure we're always at the correct "resolution"
      FRP.on("theu0000-home_window_resize", function()
      {
        riveEye.resizeDrawingSurfaceToCanvas();
      }.bind(this));

      FRP.add("riveClick", this.domReferences.riveEye, "click", function()
      {
        for (let i = 0; i < riveEye.playingAnimationNames.length; i++)
        {
          riveEye.stop(riveEye.playingAnimationNames[i]);
        };

        if (!riveEyeIsOn)
        {
          riveEyeIsOn = true;
          riveEye.play("OnToOff");
        }
        else
        {
          riveEyeIsOn = false;
          riveEye.play("OffToOn")
        };
      }.bind(this));

      setTimeout(function()
      {
        riveEye.play("Intro");
      }.bind(this), 2000)
    };

    setTimeout(function()
    {
      this.components._copy.intro();
    }.bind(this), 0);

    setTimeout(function()
    {
      this.components._feathers.intro();
    }.bind(this), 1000);
  }
};

////////////////////////////////////
///// WEB COMPONENT DEFINITION /////
////////////////////////////////////

customElements.define('theu0000-home', Home);


/////////////////////////
///// INSTANTIATION /////
/////////////////////////

const _home = new Home(sHTML, sCSS, function(){});

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