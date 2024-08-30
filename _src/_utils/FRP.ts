///////////////////
///// IMPORTS /////
///////////////////

// NPM
import flyd from "flyd";

///////////////
///// OBJ /////
///////////////

const FRP = Object.create(null);
FRP.streams = Object.create(null);
FRP.pending = [];

///////////////////////
///// OBJ METHODS /////
///////////////////////

FRP.add = function(streamName:string, eventTarget:HTMLElement, eventName:string, eventCallback?:any)
{
  if (!this.streams[streamName])
  {
    this.streams[streamName] = flyd.stream();

    // check if any pending listeners
    // NOTE: reverse loop to easily splice the array
    for (var i = this.pending.length - 1; i >= 0; i--)
    {
      if (this.pending[i].streamName === streamName)
      {
        // attach pending listener
        flyd.on(this.pending[i].callback, this.streams[streamName]);

        // remove from listeners
        this.pending.splice(i, 1);
      };
    };

    eventTarget.addEventListener(eventName, this.streams[streamName])
  };

  if (eventCallback) flyd.on(eventCallback, this.streams[streamName]);
};

FRP.on = function(streamName: string, callback: any)
{
  if (this.streams[streamName]) // stream exists
  {
    flyd.on(callback, this.streams[streamName]);
  }
  else // it doesn't (yet)
  {
    this.pending.push({streamName: streamName, callback: callback});
  }
};

//////////////////////
///// ES6 EXPORT /////
//////////////////////

export { FRP };

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