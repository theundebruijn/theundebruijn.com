///////////////////
///// IMPORTS /////
///////////////////

// NPM
import { series } from "async";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Tempus from "@darkroom.engineering/tempus";
import Lenis from "lenis";

// LOCAL
import { DOM } from "./../../_utils/DOM";

/////////////////
///// CLASS /////
/////////////////

class BaseComponent extends HTMLElement
{
  aOptional = Object.create(null);

  components = Object.create(null);
  domShadowRoot = Object.create(null);
  domReferences = Object.create(null);
  eventlisteners = Object.create(null);

  bIntroAlreadyCalled = false;

  constructor(sHtml, sCss, instanceInitCallback, aOptional?:Array<Object>)
  {
    super();

    if (aOptional) this.aOptional = aOptional;

    this.__constructor(sHtml, sCss, instanceInitCallback);
  };

  ///////////////////////////
  ///// CLASS LIFECYCLE /////
  ///////////////////////////

  __constructor(sHtml, sCss, instanceInitCallback)
  {

    this.__init(sHtml, sCss, instanceInitCallback);
  };

  __init(sHtml, sCss, instanceInitCallback)
  {
    series(
      [
        function(fCB) { this.configureDependencies(fCB); }.bind(this),
        function(fCB) { this.componentSpecifics(fCB); }.bind(this),
        function(fCB) { this.createComponentInstances(fCB); }.bind(this),
        function(fCB) { this.createShadowDOM(sHtml, sCss, fCB); }.bind(this),
        function(fCB) { this.populateShadowDOM(fCB); }.bind(this),
        function(fCB) { this.createDOMReferences(fCB); }.bind(this),
        function(fCB) { this.createEventHandlers(fCB); }.bind(this),
      ],
      function()
      {
        this.onInitComplete(instanceInitCallback);
      }.bind(this)
    );
  };

  ////////////////////////
  ///// CONTROL FLOW /////
  ////////////////////////

  configureDependencies(fCB)
  {
    gsap.registerPlugin(ScrollTrigger);
    gsap.ticker.lagSmoothing(0);
    gsap.ticker.remove(gsap.updateRoot);

    const lenis = new Lenis();

    Tempus.add(function(time)
    {
      lenis.raf(time);
      gsap.updateRoot(time / 1000);
    }, 0);

    gsap.ticker.add(function(time)
    {
      lenis.raf(time * 1000);
    }.bind(this));

    lenis.on('scroll', ScrollTrigger.update);
    // lenis.on("scroll", function(e) { console.log(e); });

    fCB();
  };

  componentSpecifics(fCB)
  {
    fCB();
  };

  createShadowDOM(sHtml, sCss, fCB)
  {
    this.domShadowRoot = this.attachShadow(
      {
        mode: "open"
      }
    );

    if (sCss.length !== undefined)
    {
      const domTemplateCSS = document.createElement("template");
      domTemplateCSS.innerHTML = "<style>" + sCss as string + "</style>";

      this.domShadowRoot.appendChild
      (
        domTemplateCSS.content.cloneNode(true)
      );
    };

    if (sHtml.length !== undefined)
    {
      const domTemplateHTML = document.createElement("template");
      domTemplateHTML.innerHTML = sHtml as string;

      this.domShadowRoot.appendChild
      (
        domTemplateHTML.content.cloneNode(true)
      );
    }

    DOM.append(this, document.body);

    fCB();
  };

  createComponentInstances(fCB)
  {
    series(
      [],
      function (err, results)
      {
        fCB();

      }.bind(this)
    );
  };

  populateShadowDOM(fCB)
  {

    fCB();
  };

  createDOMReferences(fCB)
  {
    fCB();
  };

  createEventHandlers(fCB)
  {
    fCB();
  };

  onInitComplete(instanceInitCallback)
  {
    if (instanceInitCallback) instanceInitCallback();
  };

  ////////////////////////////
  ///// NON-CONTROL FLOW /////
  ////////////////////////////
};

////////////////////////////////////
///// WEB COMPONENT DEFINITION /////
////////////////////////////////////

customElements.define('broke0000-basecomponent', BaseComponent);


//////////////////////
///// ES6 EXPORT /////
//////////////////////

export default BaseComponent;

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