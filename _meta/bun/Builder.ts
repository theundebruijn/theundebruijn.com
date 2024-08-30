///////////////////
///// IMPORTS /////
///////////////////

// BUN
import { $ } from "bun";
let wsl_ip_addr = await $`ip -4 addr show eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}'`.text();
wsl_ip_addr = wsl_ip_addr.replace(/(\r\n|\n|\r)/gm, ""); // strip out the included newline

// NODE (BUN)
import fs from "node:fs";
import path from "node:path";

// NPM
import * as chokidar from "chokidar";
import { minify } from "html-minifier-terser";

//////////////////////
///// EXCEPTIONS /////
//////////////////////

// TODO: refactor into a proper passable object
// temp global to access the dev server from the chokidar watcher
let _bunServer;

/////////////////
///// CLASS /////
/////////////////

class Builder
{
  buildId = "";
  bEnvironment = "";
  bWatching = false;

  constructor(bEnvironment, bWatching)
  {
    this.bEnvironment = bEnvironment;
    this.bWatching = bWatching;

    this.build();
    if (this.bWatching) this.watch();
  };

  build()
  {
    this.buildId = crypto.randomUUID();

    this.clean();
    this.copy();
    this.buildHTML("./_build/index.html");
    // this.buildHTML("./_build/about/index.html");
    this.buildJS();
  };

  clean()
  {
    fs.rmSync("./_build",
      {
        recursive: true,
        force: true,
      }
    );

    fs.mkdirSync("./_build");
  };

  copy()
  {
    // TODO?: abstract into a "page builder" step
    fs.cpSync("./_src/_assets/_templates/index.html", "./_build/index.html");
    fs.cpSync("./_src/_assets/_icons/favicon.png", "./_build/_assets/favicon_" + this.buildId + ".png");
    fs.cpSync("./_src/_assets/_icons/apple-touch-icon.png", "./_build/_assets/apple-touch-icon_" + this.buildId + ".png");

    // TODO?: incorporate buildid in the file naming
    // NOTE: currently cache invalidation is handled in _meta/cloudflare/pages/_headers
    // move assets
    // ref: https://github.com/pmndrs/detect-gpu/tree/master/benchmarks
    fs.cpSync("./_src/_assets/_benchmarks/", "./_build/_assets/_benchmarks/", { recursive: true });
    fs.cpSync("./_src/_assets/_draco/", "./_build/_assets/_draco/", { recursive: true });

    // TODO: incorporate buildid in the file naming
    // NOTE: currently cache invalidation is handled in _meta/cloudflare/pages/_headers
    fs.cpSync("./node_modules/three/examples/jsm/libs/basis/basis_transcoder.js", "./_build/_assets/_basis/basis_transcoder.js");
    fs.cpSync("./node_modules/three/examples/jsm/libs/basis/basis_transcoder.wasm", "./_build/_assets/_basis/basis_transcoder.wasm");

    if (this.bEnvironment === "electron")
    {
      fs.cpSync("./_meta/electron/electron.js", "./_build/electron.js");
    };

    if (this.bEnvironment === "production")
    {
      fs.cpSync("./_meta/cloudflare/pages/_headers", "./_build/_headers");
      fs.cpSync("./_src/_assets/_robots/robots.txt", "./_build/robots.txt");
      fs.cpSync("./_src/_assets/_opengraph/theundebruijn_opengraph_image_2400x1260.png", "./_build/_assets/_opengraph/theundebruijn_opengraph_image_2400x1260.png");
    };
  };

  buildHTML(filePath: string)
  {
    let sIndexTemplate = fs.readFileSync(filePath,
      {
        encoding: "utf8",
        flag: "r",
      }
    );

    const oRegExpFavicon = new RegExp("<link rel=\"icon\" type=\"image/png\" sizes=\"192x192\" href=\"\" />", "g");
    sIndexTemplate = sIndexTemplate.replace(oRegExpFavicon, "<link rel=\"icon\" type=\"image/png\" sizes=\"192x192\" href=\"_assets/favicon_" + this.buildId + ".png\" />");

    const oRegExpAppleTouchIcon = new RegExp("<link rel=\"apple-touch-icon\" type=\"image/png\" href=\"\" />", "g");
    sIndexTemplate = sIndexTemplate.replace(oRegExpAppleTouchIcon, "<link rel=\"apple-touch-icon\" type=\"image/png\" href=\"_assets/apple-touch-icon_" + this.buildId + ".png\" />");

    const oRegExpJs = new RegExp("<insert page component>", "g");
    sIndexTemplate = sIndexTemplate.replace(oRegExpJs, "Home_" + this.buildId +".js");

    // TODO?: perhaps control flow this to guarantee it existing
    minify(sIndexTemplate,
    {
      removeAttributeQuotes: true,
      minifyJS: true,
      minifyCSS: true,
      removeComments: true,
      keepClosingSlash: true,
      collapseWhitespace: true,
    })
    .then(function(res)
    {
      fs.writeFileSync(filePath, res,
        {
          encoding: "utf8",
          flag: "w"
        }
      );
    }.bind(this));
  };

  async buildJS()
  {
    console.log("Builder : build started : id = " + this.buildId);

    const { success, logs } = await Bun.build(
      {
        entrypoints: ["./_src/_pages/home/Home.ts"],
        external: [],
        plugins: [],
        outdir: "./_build",
        naming:
        {
          entry: "[name]_" + this.buildId + ".[ext]",
          asset: "_assets/[name]_" + this.buildId + ".[ext]" // TODO: avoid the need for a _src prefix for build paths
        },
        format: "esm",
        target: "browser",
        splitting: true, // this splits off a chunk js file for shared imports. so if 2 entrypoints import "three" it gets moved into here. yay!
        sourcemap: (this.bEnvironment === "development") ? "inline" : "none",
        // sourcemap: "none",
        minify:
        {
          whitespace: (this.bEnvironment !== "development") ? true : false,
          identifiers: (this.bEnvironment !== "development") ? true : false,
          syntax: (this.bEnvironment !== "development") ? true : false,
        },
        define:
        {
          ENVIRONMENT: "\"" + this.bEnvironment + "\"",
          // DEBUG_URL: "\"" + "local.theundebruijn.com" + "\"",
          DEBUG_URL: "\"" + "192.168.50.68" + "\"",
          // DEBUG_PORT: "\"" + 443 + "\"",
          DEBUG_PORT: "\"" + 80 + "\"",
          BUILD_ID: "\"" + this.buildId + "\""
        },
        loader:
        {
          ".html" : "text",
          ".css": "text",
          ".woff2": "file",
          ".glb": "file",
          ".riv": "file",
        },
      }
    );

    console.log(success ? "Builder : build done" : "build failed: " + logs.join('\n'));
    if (logs.length > 0) console.log(logs);
    else
    {
      if (this.bEnvironment === "development") _bunServer.publish("the-group-chat", "boom! new build ready.");
    }
  };

  watch()
  {
    const watcher = chokidar.watch("./_src",
      {
        ignoreInitial: true,
        usePolling: false,
        persistent: true,
        awaitWriteFinish:
        {
          stabilityThreshold: 1000,
          pollInterval: 100,
        },
      }
    );

    watcher.on('all', function()
      {
        this.build();

      }.bind(this)
    );
  };
};

/////////////////
///// CLASS /////
/////////////////

class HttpServer
{
  _publicPath: string;

  constructor(nPort)
  {
    this.start(nPort);
    console.log("HttpServer : running -> should be up on https://local.theundebruijn.com");
    console.log("ip addr: " + wsl_ip_addr);
  };

  start(nPort: string)
  {
    this._publicPath = "./_build/";

    _bunServer = Bun.serve(
      {
        development: false,
        port: nPort,
        fetch: function(request: Request, server)
        {
          if (server.upgrade(request)) return; // ws upgrade, do not return a response

          const url = new URL(request.url);
          const publicFilePath = this._publicPath + url.pathname;
          const ext = path.extname(publicFilePath);
          const status = 200;

          if (url.pathname === "/") return new Response(Bun.file(this._publicPath + "index.html"), { status: status, headers: { "Content-Type": "text/html; charset=utf-8" } });
          // else if (url.pathname === "/about") return new Response(Bun.file(this._publicPath + "/about/index.html"), { status: status, headers: { "Content-Type": "text/html; charset=utf-8" } });
          else if(ext === ".js") return new Response(Bun.file(publicFilePath), { status: status, headers: { "Content-Type": "text/javascript" } });
          else if(ext === ".map") return new Response(Bun.file(publicFilePath), { status: status, headers: { "Content-Type": "text/javascript" } });
          else if(ext === ".json") return new Response(Bun.file(publicFilePath), { status: status, headers: { "Content-Type": "application/json" } });
          // else if(ext === ".jpg") return new Response(Bun.file(publicFilePath), { status: status, headers: { "Content-Type": "image/jpeg" } });
          else if(ext === ".svg") return new Response(Bun.file(publicFilePath), { status: status, headers: { "Content-Type": "image/svg+xml" } });
          else if(ext === ".png") return new Response(Bun.file(publicFilePath), { status: status, headers: { "Content-Type": "image/image/png" } });
          else if(ext === ".woff2") return new Response(Bun.file(publicFilePath), { status: status, headers: { "Content-Type": "font/woff2" } });
          else if(ext === ".glb") return new Response(Bun.file(publicFilePath), { status: status, headers: { "Content-Type": "model/gltf-binary" } });
          else if(ext === ".wasm") return new Response(Bun.file(publicFilePath), { status: status, headers: { "Content-Type": "application/wasm" } });
          else if(ext === ".riv") return new Response(Bun.file(publicFilePath), { status: status, headers: { "Content-Type": "application/octet-stream" } });
          else if(ext === ".txt") return new Response(Bun.file(publicFilePath), { status: status, headers: { "Content-Type": "	text/plain" } });
        }.bind(this),
        websocket:
        {
          message: function(ws, message)
          {
            ws.subscribe("the-group-chat");
            _bunServer.publish("the-group-chat", "ping");

          }.bind(this),
        },
        // Bun prefers a global error handler here, as fs checks for a file to exist will slow things down.
        // TODO: can we properly check for 404s? If not, we just return 500s.
        error(error)
        {
          console.log(error);
          return new Response(null, { status: 500 });
        },
      }
    );
  };
};

///////////////////////
///// INSTANTIATE /////
///////////////////////

if (Bun.argv[2] === '--web-dev')
{
  const _builder = new Builder("development", true);
  const _httpServer = new HttpServer("80");
}
else if (Bun.argv[2] === '--web-prod')
{
  const _builder = new Builder("production", false);
  const _httpServer = new HttpServer("80");
}
else if (Bun.argv[2] === '--electron')
{
  const _builder = new Builder("electron", false);
};

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