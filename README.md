```
/////////////////////////////
///// THEUNDEBRUIJN.COM /////
////////////////////////////
```

Hello!


You've found the codebase for [theundebruijn.com](https://www.theundebruijn.com) — nice to see you here 😀

_Please note: This is a temporary copy that will be deleted at some point._  
Let's see if the GitHub AI gobbles it up in the meantime 😉

Keep in mind this fork is pulled from a private repo I've been working on by myself. Hence comments and instructions are largely absent.

It is also unlicensed. So please don't copy things verbatim. That said, feel free to take note of things you find interesting. We're all here to learn.

_Cheers cheers,_

_Theun_

```
////////////////////////////
///// INTERESTING BITS /////
////////////////////////////
``` 
Even though the output is [a fairly straightforward, single page, static, website](https://www.theundebruijn.com), there's quite a few techniques involved that I found interesting while building it.

_a couple examples:_

`Web Components`

Instead of leveraging an existing front-end framework it fully relies on [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components). I was curious how far they've come along and can provide a "browser-native" alternative to `react`, `vue` etc.

Without going into detail here, consider me impressed. Leveraging the browser's shadow dom they provide excellent separation of concerns (including scoped css), without the need for any exernal frameworks.

By utilizing a shared [base component](_src/_common/baseComponent/BaseComponent.ts) we can easily inherit a base class that ensures a common set of functionality for every component. I didn't push this as far as it can go, but modern JavaScript's composability seems excellent, and super flexible, for building more complex projects without relying on third party frameworks.

`Async/Await vs Callbacks`

You might notice the project still heavily relies on callbacks to manage `control flow`. While I'm slowly weaving in more `async/await` logic, carefully managed callbacks work well with the more rigid requirements set by having a `render loop` run at `60 or 120 ticks` a second. That said, I think I need to get over peering at micro-benchmarks and just switch fully to `async/await` even with a potential performance penalty in mind.

`Rive`

Even though used sparingly, I was curious about the [Rive runtime](https://rive.app/). 
 
It's the closest we've gotten to Macromedia Flash yet, and even though I've only been dabbling, it's been very fun. While early days, their `WebGL` renderer seems quite performant (as long as you make sure to re-use canvas contexts) and integrates well with web projects. Recommended!

`THREE`

The bulk of the complexity lies in the [Feathers component](_src/_pages/home/_components/feathers/Feathers.ts). It uses `THREE`'s `WebGL2` renderer to construct the 3D scene and its interactivity. Beware, it's in need of some refactoring 😅.

_Some things that you might find interesting here:_

- If supported, it leverages the [P3 color space](_src/_pages/home/_components/feathers/Feathers.ts#L222). I feel modern web projects should all be targetting this as mobile support is near universal, and laptops/desktops are rapidly catching up. All assets are "mastered" in this color space as opposed to sRGB.

- As explained further on in this document, [ktx texture compression](_src/_pages/home/_components/feathers/Feathers.ts#L272) is used, in addition to (Google's) [Draco mesh compression](_src/_pages/home/_components/feathers/Feathers.ts#L278). Specific loaders make sure these assets load correctly, without blocking the browser's main thread.

- 3D meshes [support "full" transparency](_src/_pages/home/_components/feathers/Feathers.ts#L342), but we have to be very careful about clipping as that causes render issues.
- The project relies on realtime shadow casting. And with a considerate amount of active lightsources it manages to use _very_ high resolution [shadow maps](_src/_pages/home/_components/feathers/Feathers.ts#L394) (4K on desktop).

- On scroll we move the camera downwards, creating an interesting parallax effect. [Here](_src/_pages/home/_components/feathers/Feathers.ts#L575) the `lenis ticker` gets directly tied to `gsap's easing callback`, so events are perfectly aligned, and no stuttering occurs.  
In addition one of the lightsources is tied to mousemovement to allow for a subtle level of interactivity. [A straightfoward map](_src/_pages/home/_components/feathers/Feathers.ts#L517) is used to translate the mouse position.

- This gets more interesting when we hover 3D elements in the scene. A raycaster is used to shoot rays from the camera position into the 3D scene. [Upon intersection](_src/_pages/home/_components/feathers/Feathers.ts#L594) we scale up the meshes to simulate a little "hover" effect. This needs to be further optimised as traversing the scene based on a 120 fps `render loop` isn't particularly lightweight.

`Functional Reactive Programming`  

While I'm not using it a ton in this project but I'm a big fan of FRP style programming. Particularly in the context of managing events and eventlisteners. [This little util object](_src/_utils/FRP.ts) leverages the `flyd` package to create and manage "observable streams". These provide a more powerful abstraction on top of regular event listeners.  

As mentioned, they're not used a lot in this particular project.

```
/////////////////////////
///// PREREQUISITES /////
/////////////////////////
```

`bun ^1.1.21`
`node ^22.5.1`
`bun ^10.8.2`

While the output of the project is a fully static website, `bun` is used for both building and running a local dev server.

A separate version of this codebase exists (not included here) that is intended as work-in-progress game engine using `WebGPU` and `Electron`, rather than the website that targets `WebGL2`.

`node`/`npm` are required as the `Electron` package cannot be installed using `bun` as the `postinstall` step fails. After running `npm install`, `bun` handles everything.

`ktx ^4.3.2`

The project relies on `build/compile-time` compression of the `gLTF` assets using Kronos's [KTX toolset](https://github.com/KhronosGroup/KTX-Software).

Without getting too into the weeds, it's being used to convert the textures that are part of Blender's `gLTF` exporter to `ktx`  (an intermediate basis texture format that losslessly decompresses on the gpu).

If there's one takeaway you get from this is that when uploading textures to the gpu in non-native formats (`webp`, `png`) a conversion takes place that _will_ block the main render loop and causes the browser's (or `Electron`'s) main thread to stall. Using `ktx` as an intermediate prevent this and ensures smooth loading of assets, even on mobile platforms.

```
//////////////////
///// ISSUES /////
//////////////////
``` 
Currently the bun builder breaks when importing `three` as is.
it really shouldn't. but it does. see below.
```
[
  24 |   "sideEffects": ["./examples/jsm/nodes/**/*"],
                       ^
warn: wildcard sideEffects are not supported yet, which means this package will be deoptimized
   at <>/node_modules/three/package.json:24:19
]
```
While it indicates a warning, it _does_ break the output.

_Temporary resolution:_

remove line 24 `  "sideEffects": ["./examples/jsm/nodes/**/*"],` from the three `package.json` before building.

```
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
```
