///////////////////
///// IMPORTS /////
///////////////////

// NPM
import { ENV } from "__root__/_utils/ENV.ts";
import { FRP } from "__root__/_utils/FRP.ts";
import { series } from "async";
import Lenis from "lenis";
import { gsap, Sine, Linear, Back, Elastic } from "gsap";

// THREE
import * as THREE from "three";
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';

// hmm. not exactly nice.
// see https://discourse.threejs.org/t/how-to-use-gltfloader-on-typescript-angular-project/59574/2
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass.js';
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

// CLASS
import BaseComponent from "__root__/_common/baseComponent/BaseComponent.ts";

// ASSETS
import theu0000_feathers from "./_assets/theu0000-feathers.glb";

/////////////////
///// CLASS /////
/////////////////

class Feathers extends BaseComponent
{
  renderer:THREE.WebGLRenderer = Object.create(null);
  composer:EffectComposer;
  composerPasses = Object.create(null);
  scene:THREE.Scene = Object.create(null);
  camera:THREE.PerspectiveCamera = Object.create(null);
  controls:OrbitControls = Object.create(null);

  nFov:number = 50; // Default. We override this when loading the gLTF data.
  fPixelRatio:number;

  entities:object = { lights: Object.create(null), meshes: Object.create(null), helpers: Object.create(null) };
  resources:object = Object.create(null);

  animations = [];
  mixers:object = Object.create(null);
  actions:object = Object.create(null);
  clock = new THREE.Clock();

  raycaster:THREE.Raycaster = new THREE.Raycaster();
  previousRaycast:number = 0;
  rayCastInterval:number = 1000/30; // 30fps

  mouse:THREE.Vector2 = new THREE.Vector2();

  events:object = Object.create(null);

  isMaximized:boolean = false;

  introIsComplete:boolean = false;

  createDOMReferences(fCB)
  {
    this.domReferences.Feathers = this.domShadowRoot.querySelector("#Feathers");

    this.domReferences.domElement = this.domShadowRoot.querySelector("#webgl");
    this.domReferences.domCanvasElement = this.domShadowRoot.querySelector("#webglcanvas");

    fCB();
  }

  createEventHandlers(fCB)
  {
    let onWindowResize = function(e) {
      this.setElementSizes(this.domReferences.domElement.clientWidth, this.domReferences.domElement.clientHeight);
    };

    FRP.on("theu0000-home_window_resize", onWindowResize.bind(this));

    fCB();
  };

  onInitComplete(instanceInitCallback)
  {
    // createScene() relies on the dom to be layed out and have been assigned its actual size
    // MDN: "Implementations should, if they follow the specification,
    // invoke resize events before paint and after layout."
    const resizeObserver = new ResizeObserver(function()
    {
      resizeObserver.disconnect();
      this.__webGL(instanceInitCallback);
    }.bind(this));

    resizeObserver.observe(this.domReferences.domElement);
  };

  // ///////////////////////////
  // ///// WEBGL LIFECYCLE /////
  // ///////////////////////////

  // TODO?: refactor into BaseComponent lifecycle
  __webGL(instanceInitCallback)
  {
    series
    (
      [
        function(fCB) { this.createScene(fCB); }.bind(this),
        function(fCB) { this.loadResources(fCB); }.bind(this),
        function(fCB) { this.processResources(fCB); }.bind(this),
        function(fCB) { this.populateScene(fCB); }.bind(this),
        function(fCB) { this.createControls(fCB); }.bind(this),
        function(fCB) { this.setWebGLEventHandlers(fCB); }.bind(this),
        function(fCB) { this.createAnimationLoop(fCB); }.bind(this),
      ],
      function (err, results)
      {
        instanceInitCallback();
      }.bind(this)
    );
  };

  // //////////////////////////////
  // ///// WEBGL CONTROL FLOW /////
  // //////////////////////////////

  createScene(fCB)
  {
    const nDomWebglWidth = this.domReferences.domElement.clientWidth;
    const nDomWebglHeight = this.domReferences.domElement.clientHeight;

    this.scene = new THREE.Scene();

    const nAspect = nDomWebglWidth / nDomWebglHeight;
    this.camera = new THREE.PerspectiveCamera(this.calcVfov(this.nFov, nAspect), nAspect, 0.1, 2000);

    const canvas = this.domReferences.domCanvasElement;
    let context:any;

    // TODO: looks like the WebGPURenderer doesn't handle transparency/shadows yet?
    // falling back to webgl2 for now.

    // if (ENV.state.support.WebGPU) { context = this.domReferences.domCanvasElement.getContext("webgpu", { antialias: false }); }
    // else if (ENV.state.support.WebGL2) { context = this.domReferences.domCanvasElement.getContext("webgl2", { antialias: false }); }
    // else { context = this.domReferences.domCanvasElement.getContext("webgl", { antialias: false }); };

    if (ENV.state.support.WebGL2) { context = this.domReferences.domCanvasElement.getContext("webgl2", { antialias: false }); }
    else { context = this.domReferences.domCanvasElement.getContext("webgl", { antialias: false }); };

    const rendererOptions =
    {
      canvas: canvas,
      context: context,
      precision: ENV.state.gpu.maxPrecision,
      powerPreference: "high-performance",
      logarithmicDepthBuffer: false,
      preserveDrawingBuffer: false,
      antialias: false,
      stencil: false,
      depth: false,
      alpha: false,
    };

    if (!ENV.state.device.isMobile) // desktop
    {
      if (ENV.state.browser.name === "safari")
      {
        // NOTE: we're in desktop safari. It won't report gpu accurately
        // obfuscated gpu Safari shows gets a gpuTier of "1" where chrome gives "3" on a M1 MAX
        this.fPixelRatio = 1.5;
      }
      else
      {
        if (ENV.state.gpu.gpuTier === 3)
        {
          if (ENV.state.browser.name === "chrome" || ENV.state.browser.name === "edge-chromium")
          {
            this.fPixelRatio = 2.0;
          }
          else
          {
            this.fPixelRatio = 1.5;
          }
        }
        else if (ENV.state.gpu.gpuTier === 2)
        {
          this.fPixelRatio = .75;
        }
        else
        {
          this.fPixelRatio = .5;
        };
      };
    }
    else // mobile
    {
      this.fPixelRatio = 1.5;
    };

    // TODO: looks like the WebGPURenderer doesn't handle transparency/shadows yet?
    // falling back to webgl2 for now.
    // @ts-ignore: WebGPURenderer missing definitions atm
    // if (ENV.state.support.WebGPU) { this.renderer = new WebGPURenderer(rendererOptions); }
    // else { this.renderer = new THREE.WebGLRenderer(rendererOptions); }
    this.renderer = new THREE.WebGLRenderer(rendererOptions);

    this.renderer.setSize(nDomWebglWidth, nDomWebglHeight);
    this.renderer.setPixelRatio(this.fPixelRatio);

    THREE.ColorManagement.enabled = true

    // TODO: figure out why electron reports false
    if (ENV.state.support.p3Color)
    {
      THREE.ColorManagement.workingColorSpace = THREE.LinearDisplayP3ColorSpace;
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    else
    {
      // NOTE: the entire pipeline and grading is done in p3
      THREE.ColorManagement.workingColorSpace = THREE.LinearSRGBColorSpace;
      this.renderer.outputColorSpace = THREE.DisplayP3ColorSpace;
    };

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.renderer.sortObjects = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.autoUpdate = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.setClearColor(new THREE.Color(0x000000), 1.0);

    this.composer = new EffectComposer(this.renderer);
    this.composer.setSize(nDomWebglWidth * this.fPixelRatio, nDomWebglHeight * this.fPixelRatio);

    this.composerPasses._RenderPass = new RenderPass(this.scene, this.camera);
    // this.composerPasses._RenderPass.enabled = false; // disable for TAA
    this.composer.addPass(this.composerPasses._RenderPass);

    // this.composerPasses._TAARenderPass = new TAARenderPass(this.scene, this.camera);
    // this.composerPasses._TAARenderPass.unbiased = false;
    // this.composerPasses._TAARenderPass.sampleLevel = 4;
		// this.composer.addPass(this.composerPasses._TAARenderPass);

    this.composerPasses._UnrealBloomPass = new UnrealBloomPass(new THREE.Vector2(nDomWebglWidth * this.fPixelRatio, nDomWebglHeight * this.fPixelRatio), 0, 0, 0);
    this.composerPasses._UnrealBloomPass.threshold = .0;
    this.composerPasses._UnrealBloomPass.strength = .20;
    this.composerPasses._UnrealBloomPass.radius = 1.0;
    this.composer.addPass(this.composerPasses._UnrealBloomPass);

    this.composerPasses._OutputPass = new OutputPass();
    this.composer.addPass(this.composerPasses._OutputPass);

    fCB();
  };

  // TODO: abstract into a webworker (if possible)
  loadResources(fCB)
  {
    const gltfLoader = new GLTFLoader();

    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath("_assets/_basis/");
    ktx2Loader.detectSupport(this.renderer);
    gltfLoader.setKTX2Loader(ktx2Loader);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('_assets/_draco/');
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load
    (
      // @ts-ignore
      theu0000_feathers, function(gLTF:any)
      {
        this.resources["theu0000_feathers"] = gLTF;

        fCB();
      }.bind(this)
    );
  };

  processResources(fCB)
  {
    for (const resource in this.resources)
    {
      // ANIMATIONS

      // NOTE: gLTF stores these separate from the elements
      // we need to manually bind them
      for (const animation of this.resources[resource].animations)
      {
        this.animations.push(animation);
      };

      // SCENE ELEMENTS
      this.resources[resource].scene.traverse
      (
        function (resource)
        {
          if (resource.type === "PerspectiveCamera")
          {
            this.nFov = resource.userData.FoV;
            this.camera.position.copy(resource.position);
            this.camera.rotation.copy(resource.rotation);

            // TODO: see if we can do this cleaner
            // right now we're not using the blender camera itself
            // so we can't bind it to the resource
            this.camera.isAnimating = false;
            this.camera.posOriginal =
            {
              x: resource.position.x,
              y: resource.position.y,
              z: resource.position.z,
            };
            this.camera.rotOriginal =
            {
              x: resource.rotation.x,
              y: resource.rotation.y,
              z: resource.rotation.z,
            };

            this.calcResponsivePositions(this.domReferences.domElement.clientWidth / this.domReferences.domElement.clientHeight);
          }
          else if (resource.type === "Mesh")
          {
            // TODO: see if we can control this from Blender (perhaps a custom prop)
            if (!ENV.state.device.isMobile) resource.castShadow = true;
            if (!ENV.state.device.isMobile) resource.receiveShadow = true;

            resource.material.depthTest = true;
            resource.material.depthWrite = true;
            resource.material.transparent = true;
            resource.material.alphaHash = false;
            resource.material.alphaTest = 0.0125;

            if (resource.material.map !== null)
            {
              resource.material.map.anisotropy = (!ENV.state.device.isMobile) ? 2 : ENV.state.gpu.maxAnisotropy;
            };

            // map animations to elements
            for (const animation of this.animations)
            {
              if (animation.name.startsWith(resource.name))
              {
                // store animation
                // this.animations[resource.name] = Object.create(null);
                // https://threejs.org/docs/?q=animation#api/en/animation/AnimationClip
                // this.animations[resource.name][animation.name] = animation;
                // create a mixer (https://threejs.org/docs/#api/en/animation/AnimationMixer)

                if (!this.mixers[resource.name]) this.mixers[resource.name] = new THREE.AnimationMixer(resource);
                if (!this.actions[resource.name]) this.actions[resource.name] = Object.create(null);

                this.actions[resource.name][animation.name] = this.mixers[resource.name].clipAction(animation);
                this.actions[resource.name][animation.name].reset();
                this.actions[resource.name][animation.name].clampWhenFinished = true;
                this.actions[resource.name][animation.name].loop = THREE.LoopOnce;
              };
            };

            // keep track of the resource
            this.entities.meshes[resource.name] = resource;
          }
          else if (resource.type === "PointLight" || resource.type === "SpotLight")
          {
            // NOTE: pointlights perform 6 shadow calcs, spotlights only 2
            // NOTE: gltf export intensity is hard (impossible?) to parse
            // instead we hardcode a userData value in Blender and parse that instead
            // https://discourse.threejs.org/t/luminous-intensity-calculation/19242/6
            resource.intensity = resource.userData.Power * 0.06; // once again magic numbers

            // the gLTF spec doesn't support preserving the "castShadow" prop of lights
            // instead we'll have to use a custom prop
            // (don't forget setting this in Blender on the Object props (not the Data ones))
            // see: https://github.com/KhronosGroup/glTF/issues/2133
            if (resource.userData.castShadow)
            {
              resource.castShadow = true;
              resource.shadow.radius = 5;
              resource.shadow.bias = -0.005;
              resource.shadow.mapSize.width = (!ENV.state.device.isMobile) ? 4096 : 512;
              resource.shadow.mapSize.height = (!ENV.state.device.isMobile) ? 4096 : 512;
            }
            else
            {
              resource.castShadow = false;
            };
          };

          // store "original" positions as helpers for animation

          resource.isAnimating = false;
          resource.posOriginal =
          {
            x: resource.position.x,
            y: resource.position.y,
            z: resource.position.z,
          };
          resource.rotOriginal =
          {
            x: resource.rotation.x,
            y: resource.rotation.y,
            z: resource.rotation.z,
          };
          resource.scaleOriginal =
          {
            x: resource.scale.x,
            y: resource.scale.y,
            z: resource.scale.z,
          };

        }.bind(this)
      )
    };

    fCB();
  };

  populateScene(fCB)
  {
    this.scene.add(this.resources["theu0000_feathers"].scene);

    fCB();
  };

  createControls(fCB)
  {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.enableRotate = false;
    this.controls.enabled = false;

    fCB();
  };

  setWebGLEventHandlers(fCB)
  {

    // TODO: wait for intro complete
    FRP.on("theu0000-home_domRiveEye_click", function(e) {

      const nDomWebglWidth = this.domReferences.domElement.clientWidth;
      const nDomWebglHeight = this.domReferences.domElement.clientHeight;

      const nAspect = nDomWebglWidth / nDomWebglHeight;
      let cameraOffset:number;

      if (nAspect >= 1) // landscape
      {
        cameraOffset = 1;
      //   // @ts-ignore we "extend" the camera object in the gltfloader
      //   this.camera.position.z = this.camera.posOriginal.z;
      }
      else // portrait
      {
      //   // @ts-ignore we "extend" the camera object in the gltfloader
      //   this.camera.position.z = this.camera.posOriginal.z * (this.camera.aspect);
        cameraOffset = this.camera.aspect
      }

      if (!this.isMaximized)
      {
        this.isMaximized = true;

        gsap.to
        (
          this.camera.position,
          { z: this.camera.position.z -.25, duration: 1.2, ease: Sine.easeInOut },
        );
      }
      else
      {
        this.isMaximized = false;

        gsap.to
        (
          this.camera.position,
          { z: this.camera.posOriginal.z * cameraOffset, duration: .9, ease: Sine.easeInOut },
        );
      };
    }.bind(this));


    const map = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;

    let Light_0001:THREE.SpotLight;

    this.resources["theu0000_feathers"].scene.traverse(function(entity)
    {
      if (entity.name === "Light_0001") Light_0001 = entity;
    }.bind(this));

    const onCursorMove = function(e)
    {
      let valX;
      let valY;

      // adjust change of movement to create a more subtle effect
      let movementIntensity = .45;

      // map domelem width to a smaller range
      if (e.type === "mousemove")
      {
        valX = map(e.clientX, 0, this.domReferences.domElement.clientWidth, -1.5, 1.5) * movementIntensity;
        valY = map(e.clientY, 0, this.domReferences.domElement.clientHeight, -1.5, 1.5) * movementIntensity;
      }

      // we need to offset by the same amount that we've moved the light down
      // in the onPageScroll handler
      const scrollOffsetY = lenis.actualScroll/2000;

      gsap.to
      (
        Light_0001.position,
        { x: valX, y: -valY - scrollOffsetY, duration: 2.10, ease: Sine.easeOut },
      );

      // used for our raycaster
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    // TODO: abstract into FRP calls
    if (!ENV.state.device.isMobile)
    {
      window.addEventListener("mousemove", onCursorMove.bind(this));
    };

    // https://github.com/darkroomengineering/lenis?tab=readme-ov-file#instance-props
    const onPageScroll = function(e)
    {
      // TODO: base this off the scene "vertical length" + page length
      // TODO: take into account orientation/fov
      let scrollVal = (lenis.actualScroll/2000);

      // move the spotlight down along with the camera
      gsap.to
      (
        Light_0001.position,
        { y: -scrollVal, duration: .15, ease: Linear.easeNone },
      );

      // camera
      gsap.to
      (
        this.camera.position,
        { y: -scrollVal, duration: .15, ease: Linear.easeNone },
      );

      // controls target
      gsap.to
      (
        this.controls.target,
        // { y: -scrollVal/1.5, duration: .3, ease: Linear.easeNone }, // tilt up a little
        { y: -scrollVal, duration: .15, ease: Linear.easeNone },
      );
    };

    // TODO: refactor into a global event
    const lenis = new Lenis();
    lenis.on("scroll", onPageScroll.bind(this));
    gsap.ticker.add(function (time)
    {
      lenis.raf(time * 1000)
    }.bind(this));
    gsap.ticker.lagSmoothing(0)

    fCB();
  };

  // TODO? : can we only call this on mouse move? just to save a little performance
  onMouseRayInterset = function()
  {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // TODO: can we limit the objects we intersect with?
    var intersects = this.raycaster.intersectObject(this.scene, true);

    if (intersects.length > 0)
    {
      const objectName = intersects[0].object.name;
      if (objectName === "PlayStation" || objectName === "Omafiets" || objectName === "Moccamaster" || objectName === "Airbus" || objectName === "Polaroid")
      {
        if (!this.entities.meshes[intersects[0].object.name].isAnimating)
        {
          this.entities.meshes[intersects[0].object.name].isAnimating = true;

          gsap.to
          (
            intersects[0].object.scale,
            {
              x: intersects[0].object.scaleOriginal.x + .20,
              y: intersects[0].object.scaleOriginal.y + .10,
              z: intersects[0].object.scaleOriginal.z + .10,
              duration: 1.2, delay: .0, ease: Elastic.easeOut, onComplete: function()
              {
                gsap.to
                (
                  intersects[0].object.scale,
                  {
                    x: intersects[0].object.scaleOriginal.x,
                    y: intersects[0].object.scaleOriginal.y,
                    z: intersects[0].object.scaleOriginal.z,
                    duration: .9, delay: .0, ease: Sine.easeInOut, onComplete: function()
                    {
                      intersects[0].object.isAnimating = false;
                    }.bind(this)
                  }
                );

              }.bind(this)
            }
          );
        };
      };
    };
  };

  createAnimationLoop(fCB)
  {
    this.renderer.setAnimationLoop(this.tick.bind(this));

    fCB();
  };

  tick()
  {
    // CONTROLS
    this.controls.update();

    // RAYCASTING
    if (!ENV.state.device.isMobile)
    {
      if (this.introIsComplete)
      {
        if (Date.now() - this.previousRaycast > this.rayCastInterval)
        {
          this.onMouseRayInterset();
          this.previousRaycast = Date.now();
        };
      }
    };

    // ANIMATIONS
    const delta = this.clock.getDelta();
    for (const mixer in this.mixers)
    {
      this.mixers[mixer].update(delta);
    };

    // RENDER
    this.composer.render();
  };

  ///////////////////
  ///// HELPERS /////
  ///////////////////

  calcVfov(nIntendedFov, nAspect)
  {
    // TODO: refactor
    const DEG2RAD = Math.PI / 180.0;
    const RAD2DEG = 180.0 / Math.PI;

    function calculateVerticalFoV(horizontalFoV, nAspect) {
      return Math.atan(Math.tan(horizontalFoV * DEG2RAD * 0.5)/nAspect) * RAD2DEG * 2.0;
    };

    function calculateHorizontalFoV(verticalFoV, aspect) {
      return Math.atan(Math.tan(verticalFoV * DEG2RAD * 0.5)*aspect) * RAD2DEG * 2.0;
    };

    return calculateVerticalFoV(nIntendedFov, nAspect)
  };

  // TODO: have a "general" responsive handler to position elements etc
  calcResponsivePositions(nAspect)
  {
    if (nAspect >= 1) // landscape
    {
      // @ts-ignore we "extend" the camera object in the gltfloader
      this.camera.position.z = this.camera.posOriginal.z;
    }
    else // portrait
    {
      // @ts-ignore we "extend" the camera object in the gltfloader
      this.camera.position.z = this.camera.posOriginal.z * (this.camera.aspect);
    }
  }

  setElementSizes(updatedWidth, updatedHeight)
  {
    this.renderer.setSize(updatedWidth, updatedHeight);
    this.composer.setSize(updatedWidth * this.fPixelRatio, updatedHeight * this.fPixelRatio);

    const newAspect = updatedWidth / updatedHeight;

    this.camera.fov = this.calcVfov(this.nFov, newAspect);
    this.camera.aspect = newAspect;

    this.calcResponsivePositions(newAspect);

    this.camera.updateProjectionMatrix();
  };

  ////////////////////////////
  ///// NON-CONTROL FLOW /////
  ////////////////////////////

  intro()
  {
    // little helper for things that want to wait
    setTimeout(function()
    {
      this.introIsComplete = true;
    }.bind(this), 2100);

    /* intro toggle */
    gsap.fromTo(this.domReferences.Feathers,
      { opacity: .0},
      { opacity: 1.0, duration: .9, delay: .0, ease: Linear.easeNone },
    );

    gsap.fromTo(this.camera.position,
      { z: this.camera.position.z - 1.0},
      { z: this.camera.position.z, duration: 2.0, delay: .0, ease: Sine.easeOut },
    );

    for (const resource in this.resources)
    {
      this.resources[resource].scene.traverse
      (
      function (resource)
      {
        if (resource.type === "Mesh")
        {
          if (resource.name === "PlayStation")
          {
            gsap.fromTo(resource.position,
              { z: resource.position.z + .45},
              { z: resource.position.z, duration: .9, delay: .0, ease: Sine.easeOut },
            );
          }
          else if (resource.name === "Omafiets")
          {
            gsap.fromTo(resource.position,
              { z: resource.position.z + .45},
              { z: resource.position.z, duration: 1.2, delay: .0, ease: Sine.easeOut },
            );
          }
          else if (resource.name === "Moccamaster")
          {
            gsap.fromTo(resource.position,
              { z: resource.position.z + .45},
              { z: resource.position.z, duration: 1.5, delay: .0, ease: Sine.easeOut },
            );
          }
          else if (resource.name === "Airbus")
          {
            gsap.fromTo(resource.position,
              { z: resource.position.z + .45},
              { z: resource.position.z, duration: 1.8, delay: .0, ease: Sine.easeOut },
            );
          }
          else if (resource.name === "Polaroid")
          {
            gsap.fromTo(resource.position,
              { z: resource.position.z + .45},
              { z: resource.position.z, duration: 2.1, delay: .0, ease: Sine.easeOut },
            );
          };
        }
      })
    };
  };
};

////////////////////////////////////
///// WEB COMPONENT DEFINITION /////
////////////////////////////////////

customElements.define('theu0000-feathers', Feathers);

//////////////////////
///// ES6 EXPORT /////
//////////////////////

export default Feathers;

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