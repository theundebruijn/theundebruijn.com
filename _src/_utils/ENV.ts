///////////////////
///// IMPORTS /////
///////////////////

// NPM
import { getGPUTier } from "detect-gpu";
import { detect } from "detect-browser";
import * as THREE from "three";

///////////////
///// OBJ /////
///////////////

const ENV = Object.create(null);

///////////////////////
///// OBJ METHODS /////
///////////////////////

ENV.detectWebGL1Support = function()
{
  const ctx = document.createElement('canvas').getContext('webgl');
  if (ctx) { return true; } else { return false; }
};

ENV.detectWebGL2Support = function()
{
  const ctx = document.createElement('canvas').getContext('webgl2');
  if (ctx) { return true; } else { return false; }
};

ENV.detectTHREESupport = function()
{
  const renderer = new THREE.WebGLRenderer();

  let support =
  {
    maxPrecision: renderer.capabilities.getMaxPrecision("highp"), // TODO: test on lowp gpu
    maxTextureSize : renderer.capabilities.maxTextureSize,
    maxAnisotropy : renderer.capabilities.getMaxAnisotropy()
  };
  return support;
}

ENV.detectGPU = async (createStateCallback) =>
{
  let gpu = await getGPUTier({ benchmarksURL: '_assets/_benchmarks' })
  .then()
  {
    createStateCallback(gpu);
  }
};

ENV.detectBrowser = function()
{
  this.browser = detect();
};

ENV.getCssBreakpoint = function()
{
  const nWindowWidth = window.innerWidth;

  if (nWindowWidth <= 575.98) { return "xs"; }
  else if (nWindowWidth <= 1199.98) { return "s"; }
  else if (nWindowWidth <= 1399.98) { return "m"; }
  else { return "l"; }
};

ENV.createState = function(fCB: any)
{

  this.detectBrowser();

  // asynchronous prereq
  let createStateCallback = function(gpu)
  {
    ENV.gpu = gpu;

    const THREESupport = ENV.detectTHREESupport();

    ENV.state =
    {
      build:
      {
        environment : ENVIRONMENT,
        buildId: BUILD_ID,
        debugUrl: DEBUG_URL,
        debugPort: DEBUG_PORT,
      },
      device:
      {
        isMobile: ENV.gpu.isMobile,
        pixelRatio: window.devicePixelRatio,
      },
      gpu:
      {
        gpu: ENV.gpu.gpu,
        gpuTier: ENV.gpu.tier,
        maxPrecision: THREESupport.maxPrecision,
        maxTextureSize: THREESupport.maxTextureSize,
        maxAnisotropy: THREESupport.maxAnisotropy,
      },
      browser:
      {
        name: ENV.browser.name,
        os: ENV.browser.os,
        version: ENV.browser.version,
      },
      support:
      {
        // NOTE: WebGPU requires the site to use https or be on "localhost"/"127.0.0.1"
        //       electron handles this internally
        WebGPU: (navigator.gpu) ? true : false,
        WebGL2: ENV.detectWebGL2Support(),
        WebGL1: ENV.detectWebGL1Support(),
        p3Color: (window.matchMedia("(color-gamut: p3)").matches),
      },
    };

    fCB();
  }

  this.detectGPU(createStateCallback);
};

ENV.printState = function(fCB?: any)
{
  // https://misc.flogisoft.com/bash/tip_colors_and_formatting
  console.log
  (
    "ENV.state.build \n" +
    "------------------------------------------------------------\n" +
    "buildId :\t\t\t" + ENV.state.build.buildId + " <" + typeof(ENV.state.build.buildId) + ">\n" +
    "environment :\t\t" + ENV.state.build.environment + " <" + typeof(ENV.state.build.environment) + ">\n" +
    "debugUrl :\t\t\t" + ENV.state.build.debugUrl + " <" + typeof(ENV.state.build.debugUrl) + ">\n" +
    "debugPort :\t\t\t" + ENV.state.build.debugPort + " <" + typeof(ENV.state.build.debugPort) + ">\n" +
    "\n" + "ENV.state.device \n" +
    "------------------------------------------------------------\n" +
    "isMobile :\t\t\t" + ENV.state.device.isMobile + " <" + typeof(ENV.state.device.isMobile) + ">\n" +
    "pixelRatio :\t\t" + ENV.state.device.pixelRatio + " <" + typeof(ENV.state.device.pixelRatio) + ">\n" +
    "\n" + "ENV.state.gpu \n" +
    "------------------------------------------------------------\n" +
    "gpu :\t\t\t\t" + ENV.state.gpu.gpu + " <" + typeof(ENV.state.gpu.gpu) + ">\n" +
    "gpuTier :\t\t\t" + ENV.state.gpu.gpuTier + " <" + typeof(ENV.state.gpu.gpuTier) + ">\n" +
    "maxPrecision :\t\t" + ENV.state.gpu.maxPrecision + " <" + typeof(ENV.state.gpu.maxPrecision) + ">\n" +
    "maxTextureSize :\t" + ENV.state.gpu.maxTextureSize + " <" + typeof(ENV.state.gpu.maxTextureSize) + ">\n" +
    "maxAnisotropy :\t\t" + ENV.state.gpu.maxAnisotropy + " <" + typeof(ENV.state.gpu.maxAnisotropy) + ">\n" +
    "\n" + "ENV.state.browser \n" +
    "------------------------------------------------------------\n" +
    "name :\t\t\t" + ENV.state.browser.name + " <" + typeof(ENV.state.browser.name) + ">\n" +
    "os :\t\t\t" + ENV.state.browser.os + " <" + typeof(ENV.state.browser.os) + ">\n" +
    "version :\t\t\t" + ENV.state.browser.version + " <" + typeof(ENV.state.browser.version) + ">\n" +
    "\n" + "ENV.state.support \n" +
    "------------------------------------------------------------\n" +
    "WebGPU :\t\t\t" + ENV.state.support.WebGPU + " <" + typeof(ENV.state.support.WebGPU) + ">\n" +
    "WebGL2 :\t\t\t" + ENV.state.support.WebGL2 + " <" + typeof(ENV.state.support.WebGL2) + ">\n" +
    "WebGL1 :\t\t\t" + ENV.state.support.WebGL1 + " <" + typeof(ENV.state.support.WebGL1) + ">\n" +
    "p3Color :\t\t\t" + ENV.state.support.p3Color + " <" + typeof(ENV.state.support.p3Color) + ">\n"
  );

  // https://www.freeformatter.com/javascript-escape.html works decently.
  console.log("\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\r\n\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/.        \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\r\n\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/     .      ..  ...\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\r\n\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/    ..  .   ....    .  .\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\r\n\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/        . .  . ...  . ... \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\r\n\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/     ...................   \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\r\n\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/  .(,(\/.%,.*%#&&&.\/\/....   \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\r\n\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/  .***\/..*,*\/%,%%#%*\/(\/(. ,* \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\r\n\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/( ******  #%#((&%%*&\/\/\/%%*..(.\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\r\n\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/(\/,((\/\/**&.*,%%(*\/\/.**##, .#(\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\r\n\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/( .(,**....* ...,*,,,%&,((*.* .\/\/\/\/\/\/\/\/\/\/\/\/\/\/\r\n\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/( . **..(*#\/ %%%%#,*##,..*%,,.\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\r\n\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/(.,#\/%#%%,#(%#(\/&&(%,(.\/\/#,..\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\r\n\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/(,,\/*#(.#\/ \/(&..%\/&\/(*(.\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\r\n\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/( ***#     .,.,\/&%%%*.\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\r\n\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/(.\/,\/*,,.,&*(((%%(\/ \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\r\n\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/**.*.*\/\/##.*,,,\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\r\n\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/  ,*%%\/@\/\/(*   .\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\r\n\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/                 \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\r\n\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/                     \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/");
  console.log("© 2024 Theun de Bruijn");

  if (fCB) fCB();
};

//////////////////////
///// ES6 EXPORT /////
//////////////////////

export { ENV };

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