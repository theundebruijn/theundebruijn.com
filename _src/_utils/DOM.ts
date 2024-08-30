///////////////
///// OBJ /////
///////////////

const DOM = Object.create(null);
DOM.eventsCache = Object.create(null);
DOM.eventsProxy = document.createElement(null);

///////////////////////
///// OBJ METHODS /////
///////////////////////

DOM.create = function(sTag, oProps, anyContent) {
  const el = document.createElement(sTag);

  for (const i in oProps) {
    el[i] = oProps[i];
  }

  if (anyContent === undefined) { return el; }

  if (typeof anyContent === "string") {
    el.appendChild(document.createTextNode(anyContent));
  } else {
    for (const i of anyContent) {
      el.appendChild(i);
    }
  }
  return el;
};

DOM.append = function(domEl, domParent)
{
  domParent.appendChild(domEl);
};

DOM.remove = function(domEl)
{
  domEl.remove();
};

DOM.empty = function(domEl)
{
  // more performant than setting innerHTML
  domEl.textContent = "";
};

DOM.addClass = function(sClassName, domEl)
{
  domEl.classList.add(sClassName);
};

DOM.removeClass = function(sClassName, domEl)
{
  domEl.classList.remove(sClassName);
};

DOM.splitText = function(domReference, sSplitStrategy)
{
  let sText = domReference.textContent;
  domReference.innerHTML = "";

  let aTextSplit;
  let stringtoinsert = "";

  if (sSplitStrategy === "character")
  {
    aTextSplit = sText.split("");
    stringtoinsert = "";

    let i = 0, len = aTextSplit.length;
    while (i < len)
    {
      if (aTextSplit[i] === " ")
      {
        stringtoinsert += "<span>&nbsp;</span>";
      }
      else if (aTextSplit[i] === "\\")
      {
        stringtoinsert += "<br>";
      }
      else
      {
        stringtoinsert += "<span>" + aTextSplit[i] + "</span>";
      }

      i++;
    };
  }
  else if (sSplitStrategy === "word")
  {
    aTextSplit = sText.split(" ");
    stringtoinsert = "";

    let i = 0, len = aTextSplit.length;
    while (i < len)
    {
      stringtoinsert += "<span>" + aTextSplit[i] + "</span>&nbsp;";

      i++;
    };

  }

  domReference.innerHTML = stringtoinsert;
};

//////////////////////
///// ES6 EXPORT /////
//////////////////////

export { DOM };

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