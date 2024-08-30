// declare globals that get injected at build and/or runtime
declare let ENVIRONMENT: string;
declare let DEBUG_URL: string;
declare let DEBUG_PORT: string;
declare let BUILD_ID: string;

// make sure text imports resolve 'correctly'
declare module "*.js" {}
declare module "*.html" {}
declare module "*.css" {}
declare module "*.png" {}
declare module "*.woff2" {}
declare module "*.svg" {}
declare module "*.glb" {}
declare module "*.riv" {}