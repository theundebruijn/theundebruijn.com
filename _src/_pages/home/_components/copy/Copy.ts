///////////////////
///// IMPORTS /////
///////////////////

// NPM
import { FRP } from "__root__/_utils/FRP.ts";
import { DOM } from "__root__/_utils/DOM.ts";
import { gsap, Linear, Sine, Expo } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

// CLASS
import BaseComponent from "__root__/_common/baseComponent/BaseComponent.ts";

// CSS ASSETS
import clients_nike_173x61 from "./_assets/clients_nike_173x61.svg";
import clients_google_231x76 from "./_assets/clients_google_231x76.svg";
import clients_hnm_153x101 from "./_assets/clients_hnm_153x101.svg";
import clients_xbox_216x65 from "./_assets/clients_xbox_216x65.svg";
import clients_medecinssansfrontieres_240x103 from "./_assets/clients_medecinssansfrontieres_240x103.svg";
import clients_nickelodeon_273x40 from "./_assets/clients_nickelodeon_273x40.svg";
import clients_sciencemuseum_157x62 from "./_assets/clients_sciencemuseum_157x62.svg";
import clients_gorillaz_214x62 from "./_assets/clients_gorillaz_214x62.svg";
import clients_spotify_227x70 from "./_assets/clients_spotify_227x70.svg";

import merit_clio_172x32 from "./_assets/merit_clio_172x32.svg";
import merit_dnad_117x136 from "./_assets/merit_dnad_117x136.svg";
import merit_cannes_108x116 from "./_assets/merit_cannes_108x116.svg";
import merit_webby_158x89 from "./_assets/merit_webby_158x89.svg";
import merit_fwa_124x37 from "./_assets/merit_fwa_124x37.svg";
import merit_oneshow_145x107 from "./_assets/merit_oneshow_145x107.svg";
import merit_gooddesign_66x66 from "./_assets/merit_gooddesign_66x66.svg";
import merit_agda_72x66 from "./_assets/merit_agda_72x66.svg";

import acknowledgement_map_137x126 from "./_assets/acknowledgement_map_137x126.svg";

/////////////////
///// CLASS /////
/////////////////

class Copy extends BaseComponent
{

  isMaximized = false;
  isShowDetails = false;

  ////////////////////////
  ///// CONTROL FLOW /////
  ////////////////////////

  createDOMReferences(fCB)
  {
    this.domReferences.Copy = this.domShadowRoot.querySelector("#Copy");

    this.domReferences.header = this.domShadowRoot.querySelector("header");
    this.domReferences.main_clients = this.domShadowRoot.querySelector("main article.clients");
    this.domReferences.main_method = this.domShadowRoot.querySelector("main article.method");
    this.domReferences.main_work = this.domShadowRoot.querySelector("main article.work");
    this.domReferences.main_merits = this.domShadowRoot.querySelector("main article.merits");
    this.domReferences.main_capabilities = this.domShadowRoot.querySelector("main article.capabilities");
    this.domReferences.main_technicalexpertise = this.domShadowRoot.querySelector("main article.technicalexpertise");
    this.domReferences.main_contact = this.domShadowRoot.querySelector("main article.contact");
    this.domReferences.main_acknowledgement = this.domShadowRoot.querySelector("main article.acknowledgement");
    this.domReferences.footer = this.domShadowRoot.querySelector("footer");
    this.domReferences.footer_showdetails = this.domShadowRoot.querySelector("#ShowDetails");
    this.domReferences.footer_details = this.domShadowRoot.querySelector("footer article.copyright .attribution .details");

    /* control flow callback */
    fCB();
  };

  populateShadowDOM(fCB)
  {
    this.domShadowRoot.querySelector("article.clients .client.nike").src = clients_nike_173x61;
    this.domShadowRoot.querySelector("article.clients .client.google").src = clients_google_231x76;
    this.domShadowRoot.querySelector("article.clients .client.hnm").src = clients_hnm_153x101;
    this.domShadowRoot.querySelector("article.clients .client.xbox").src = clients_xbox_216x65;
    this.domShadowRoot.querySelector("article.clients .client.medecinssansfrontieres").src = clients_medecinssansfrontieres_240x103;
    this.domShadowRoot.querySelector("article.clients .client.nickelodeon").src = clients_nickelodeon_273x40;
    this.domShadowRoot.querySelector("article.clients .client.sciencemuseum").src = clients_sciencemuseum_157x62;
    this.domShadowRoot.querySelector("article.clients .client.gorillaz").src = clients_gorillaz_214x62;
    this.domShadowRoot.querySelector("article.clients .client.spotify").src = clients_spotify_227x70;

    this.domShadowRoot.querySelector("article.merits .merit.clio").src = merit_clio_172x32;
    this.domShadowRoot.querySelector("article.merits .merit.dnad").src = merit_dnad_117x136;
    this.domShadowRoot.querySelector("article.merits .merit.cannes").src = merit_cannes_108x116;
    this.domShadowRoot.querySelector("article.merits .merit.webby").src = merit_webby_158x89;
    this.domShadowRoot.querySelector("article.merits .merit.fwa").src = merit_fwa_124x37;
    this.domShadowRoot.querySelector("article.merits .merit.oneshow").src = merit_oneshow_145x107;
    this.domShadowRoot.querySelector("article.merits .merit.gooddesign").src = merit_gooddesign_66x66;
    this.domShadowRoot.querySelector("article.merits .merit.agda").src = merit_agda_72x66;

    this.domShadowRoot.querySelector("article.acknowledgement .country").src = acknowledgement_map_137x126;

    /* control flow callback */
    fCB();
  };

  createEventHandlers(fCB)
  {

    const onRiveMaximizeClick = function(e: any)
    {
      const animatable = [
        this.domReferences.header,
        this.domReferences.main_clients,
        this.domReferences.main_method,
        this.domReferences.main_work,
        this.domReferences.main_merits,
        this.domReferences.main_capabilities,
        this.domReferences.main_technicalexpertise,
        this.domReferences.main_contact,
        this.domReferences.main_acknowledgement,
        this.domReferences.footer,
      ];

      if (!this.isMaximzed)
      {
        this.isMaximzed = true;
        gsap.killTweensOf(animatable);
        gsap.to(animatable,
          {
            opacity: 0.0, duration: .6, stagger: { each: .05, ease: Linear.easeNone, from: "start", onComplete()
            {
              const domAllElementsA = this._targets[0].getElementsByTagName("a");
              for (let i = 0; i < domAllElementsA.length; i++)
              {
                domAllElementsA[i].style.pointerEvents = "none";
              };
            }}, delay: .0, ease: Linear.easeNone
          },
        );
      }
      else
      {
        this.isMaximzed = false;
        gsap.killTweensOf(animatable);
        gsap.to(animatable.reverse(),
          {
            opacity: 1.0, duration: .6, stagger: { each: .05, ease: Linear.easeNone, from: "start", onComplete()
            {
              const domAllElementsA = this._targets[0].getElementsByTagName("a");
              for (let i = 0; i < domAllElementsA.length; i++)
              {
                domAllElementsA[i].style.pointerEvents = "auto";
              };
            }}, delay: .0, ease: Linear.easeNone
          },
        );
      };
    }.bind(this);

    FRP.on("theu0000-home_domRiveEye_click", function(e) {
      onRiveMaximizeClick(e);
    }.bind(this));

    const domAllMailTo = this.domShadowRoot.querySelectorAll("[href=\"mailto:theun@theundebruijn.com\"");
    const domAllTel = this.domShadowRoot.querySelectorAll("[href=\"tel:+61405552091\"");

    FRP.add("theu0000-copy_dom-mailto_mouseenter", domAllMailTo[0], "mouseenter");
    FRP.add("theu0000-copy_dom-mailto_mouseleave", domAllMailTo[0], "mouseleave");

    FRP.add("theu0000-copy_dom-mailto2_mouseenter", domAllMailTo[1], "mouseenter");
    FRP.add("theu0000-copy_dom-mailto2_mouseleave", domAllMailTo[1], "mouseleave");

    FRP.add("theu0000-copy_dom-tel_mouseenter", domAllTel[0], "mouseenter");
    FRP.add("theu0000-copy_dom-tel_mouseleave", domAllTel[0], "mouseleave");



    FRP.add("theu0000-copy_dom-footer_showdetails_click", this.domReferences.footer_showdetails, "click");
    FRP.on("theu0000-copy_dom-footer_showdetails_click", function(e)
    {
      if (!this.isShowDetails)
      {
        this.isShowDetails = true;

        this.domReferences.footer_showdetails.innerHTML = "Hide details";

        gsap.fromTo(this.domReferences.footer_details,
          { height: 0, opacity: 0.0 },
          { height: "auto", opacity: 1.0, duration: 1.2, delay: .0, ease: Sine.easeInOut },
        );
      }
      else
      {
        this.isShowDetails = false;

        this.domReferences.footer_showdetails.innerHTML = "Show details";

        gsap.to(this.domReferences.footer_details,
          { height: 0, opacity: 0.0, duration: .9, delay: .0, ease: Sine.easeInOut },
        );
      };
    }.bind(this));

    fCB();
  };

  onInitComplete(instanceInitCallback)
  {
    if (instanceInitCallback) instanceInitCallback();
  };

  ////////////////////////////
  ///// NON-CONTROL FLOW /////
  ////////////////////////////

  intro()
  {
    /* intro toggle */
    this.domReferences.Copy.style.opacity = 1.0;

    const scrollTriggerBaseDelay = 0.05;

    // HEADER

    const domAnimatables = this.domShadowRoot.querySelectorAll("header .animatable");

    DOM.splitText(domAnimatables[0], "word");
    DOM.splitText(domAnimatables[1], "word");
    DOM.splitText(domAnimatables[2], "word");
    DOM.splitText(domAnimatables[3], "word");

    gsap.fromTo(domAnimatables[0].children,
      { x: -35, opacity: 0.0 },
      { scrollTrigger: domAnimatables[0], x: 0, opacity: 1.0, duration: 1.200, stagger: { each: .15, ease: Sine.easeOut, from: "start" }, delay: .0 + scrollTriggerBaseDelay, ease: Sine.easeOut },
    );
    gsap.fromTo(domAnimatables[1].children,
      { x: -35, opacity: 0.0 },
      { scrollTrigger: domAnimatables[1], x: 0, opacity: 1.0, duration: 1.200, stagger: { each: .15, ease: Sine.easeOut, from: "start" }, delay: .3 + scrollTriggerBaseDelay, ease: Sine.easeOut },
    );
    gsap.fromTo(domAnimatables[2].children,
      { x: -35, opacity: 0.0 },
      { scrollTrigger: domAnimatables[2], x: 0, opacity: 1.0, duration: 1.200, stagger: { each: .15, ease: Sine.easeOut, from: "start" }, delay: .6 + scrollTriggerBaseDelay, ease: Sine.easeOut },
    );
    gsap.fromTo(domAnimatables[3].children,
      { x: -35, opacity: 0.0 },
      { scrollTrigger: domAnimatables[3], x: 0, opacity: 1.0, duration: 1.200, stagger: { each: .06, ease: Sine.easeOut, from: "start" }, delay: .15 + scrollTriggerBaseDelay, ease: Sine.easeOut },
    );

    // CLIENTS

    const domMainClients = this.domShadowRoot.querySelector("main article.clients");

    gsap.fromTo(domMainClients.children,
      { x: -35, opacity: 0.0 },
      { scrollTrigger: domMainClients, x: 0, opacity: 1.0, duration: 1.200, stagger: { each: .06, ease: Sine.easeOut, from: "start" }, delay: .0 + scrollTriggerBaseDelay, ease: Sine.easeOut },
    );

    // METHOD

    // the specific ".animatable" class is used to select "sub-children"
    const domMainMethod = this.domShadowRoot.querySelectorAll("main article.method .animatable");

    gsap.fromTo(domMainMethod,
      { x: -35, opacity: 0.0 },
      { scrollTrigger: domMainMethod[0], x: 0, opacity: 1.0, duration: 1.200, stagger: { each: .15, ease: Sine.easeOut, from: "start" }, delay: .0 + scrollTriggerBaseDelay, ease: Sine.easeOut },
    );

    // WORK

    const domMainWork = this.domShadowRoot.querySelector("main article.work");

    gsap.fromTo(domMainWork.children,
      { x: -35, opacity: 0.0 },
      { scrollTrigger: domMainWork, x: 0, opacity: 1.0, duration: 1.200, stagger: { each: .15, ease: Sine.easeOut, from: "start" }, delay: .0 + scrollTriggerBaseDelay, ease: Sine.easeOut },
    );

    // MERITS

    const domMainMerits = this.domShadowRoot.querySelector("main article.merits");

    gsap.fromTo(domMainMerits.children,
      { x: -35, opacity: 0.0 },
      { scrollTrigger: domMainMerits, x: 0, opacity: 1.0, duration: 1.200, stagger: { each: .06, ease: Sine.easeOut, from: "start" }, delay: .0 + scrollTriggerBaseDelay, ease: Sine.easeOut },
    );

    // CAPABILITIES

    // the specific ".animatable" class is used to select "sub-children"
    const domMainCapabilities = this.domShadowRoot.querySelectorAll("main article.capabilities .animatable");

    gsap.fromTo(domMainCapabilities,
      { x: -35, opacity: 0.0 },
      { scrollTrigger: domMainCapabilities[0], x: 0, opacity: 1.0, duration: 1.200, stagger: { each: .15, ease: Sine.easeOut, from: "start" }, delay: .0 + scrollTriggerBaseDelay, ease: Sine.easeOut },
    );


    // TECHNICAL EXPERTISE

    const domMainTechnicalexpertise = this.domShadowRoot.querySelector("main article.technicalexpertise");

    gsap.fromTo(domMainTechnicalexpertise.children,
      { x: -35, opacity: 0.0 },
      { scrollTrigger: domMainTechnicalexpertise, x: 0, opacity: 1.0, duration: 1.200, stagger: { each: .15, ease: Sine.easeOut, from: "start" }, delay: .0 + scrollTriggerBaseDelay, ease: Sine.easeOut },
    );

    // CONTACT

    const domMainContact = this.domShadowRoot.querySelector("main article.contact");

    gsap.fromTo(domMainContact.children,
      { x: -35, opacity: 0.0 },
      { scrollTrigger: domMainContact, x: 0, opacity: 1.0, duration: 1.200, stagger: { each: .15, ease: Sine.easeOut, from: "start" }, delay: .0 + scrollTriggerBaseDelay, ease: Sine.easeOut },
    );

    // ACKNOWLEDGEMENT

    const domMainAcknowledgement = this.domShadowRoot.querySelector("main article.acknowledgement");

    gsap.fromTo(domMainAcknowledgement.children,
      { x: -35, opacity: 0.0 },
      { scrollTrigger: domMainAcknowledgement, x: 0, opacity: 1.0, duration: 1.200, stagger: { each: .15, ease: Sine.easeOut, from: "start" }, delay: .0 + scrollTriggerBaseDelay, ease: Sine.easeOut },
    );

    // FOOTER

    const domFooter = this.domShadowRoot.querySelector("footer");

    gsap.fromTo(domFooter.children,
      { x: -35, opacity: 0.0 },
      { scrollTrigger: domFooter, x: 0, opacity: 1.0, duration: 1.200, stagger: { each: .15, ease: Sine.easeOut, from: "start" }, delay: .0 + scrollTriggerBaseDelay, ease: Sine.easeOut },
    );

  };
}

////////////////////////////////////
///// WEB COMPONENT DEFINITION /////
////////////////////////////////////

customElements.define('theu0000-copy', Copy);

//////////////////////
///// ES6 EXPORT /////
//////////////////////

export default Copy;

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