/*
  This demo is based on vsm-box's "index-prod-standalone.html", showing
  how to use a vsm-box with simple vanilla JS (i.e. without JS-framework).
  Please see there for some considerations about setting attributes
  on standalone webcomponents.
*/

(function() {

  // A switch for activating VSM-to-SVG data inspection features.
  const svgInspect = 0;  // 0=off, 1=on, 2=on+autoRefresh.

  const addTheTestExample = 0 || svgInspect;  // Gibberish full-feature example?

  if (svgInspect == 2)  setInterval(setPureSVGText, 1e3);  // Auto-refreshes it.


  var allowClassNull_initial = true;
  var hideConnFeet_initial   = false;
  var useTweaks = false;
  var useTinyMinEndTermWidths = true;
  var imgScale = 8;
  var dlDelay  = 0;
  var whiteBox      = false;
  var autoWhiteBox  = true;
  var keepSVGCursor = false;
  var json5         = true;
  var pureSVG       = true;
  var showRDF       = false;

  var autofocus     = true;
  var exampleNr_initial = svgInspect? -1 : 0;  // If 0, starts with empty VSM-box.


  // Creates demo vsm-dictionary data. Called at start & on toggling `useTweaks`.
  function createDict() {
    var dictData = demoDictData({ useTweaks });
    var options = Object.assign(
      dictData,
      ///{ delay: [20, 350] }  // Realistic delay. VsmDictionaryCacher can..
    );                         // ..speed repeated requests up again.
    return new (VsmDictionaryCacher(VsmDictionaryLocal)) (options);
  }


  var $el = document.getElementById .bind(document);
  var elVsmBox   = $el('vsmBox');
  var elWhBTgl   = $el('toggleWhiteBox');
  var elImgScale = $el('inputImgScale');
  var elDlDelay  = $el('inputDlDelay');
  var elSVGBtn   = $el('buttonGetSVG');
  var elPNGBtn   = $el('buttonGetPNG');
  var elRsz1     = $el('wsResizer1');
  var elRsz2     = $el('wsResizer2');
  var elRsz3     = $el('wsResizer3');
  var elRsz4     = $el('wsResizer4');
  var elMsg      = $el('msg');
  var elMsg2     = $el('msg2');
  var elTxt      = $el('stateText');
  var elTxt2     = $el('rdfText');
  var elRDF      = $el('rdf');

  if (svgInspect)  {
    $el('svg').classList.remove('hidden');
    elRsz2.classList.add('smallSep');
    var elSVGFig = $el('svgFig');
    var elSVGTxt = $el('svgText');
    var elSVGHtm = $el('svgHtml');
  }


  var elTxtMaxCols   = elTxt.getAttribute('data-cols');
  var elTxtCharWidth = 6;

  var vsmExamples = vsmExamplesList({ addTheTestExample });

  var vsmBoxInitialValue = getExample(exampleNr_initial);
  var vsmBoxInitialSizes = {
    minWidth:  200,  // Note: standalone vsm-box can never start narrower than
                     // 200 (it's default) because it initializes with its
                     // default width before we can update its sizes property.
    minEndTermWidth: 40,      // } = VsmBox's default. Needed because these may..
    minEndTermWideWidth: 100, // } ..be changed, and back.
      // \->Note: to get narrowest possible vsmBox when filling a `vsmExamples[]`,
      //    (i.e. with narrow endTerm): this must be set to small value at start!
    connFootVisible: !hideConnFeet_initial,
    theConnsResortDelay: 300  // (Useful to define: for live VSM-to-SVG testing).
  };
  var minEndTermWidth_Tiny     = 1;
  var minEndTermWideWidth_Tiny = 22; // 20 // 100;


  var vsmBoxSizes;  // Current value of `sizes`-attribute (Object) set on vsmBox.
  var lastAutoFilledText = '';
  var currentVSM = vsmBoxInitialValue;



  // --- Initialize the vsm-box. ---

  /* Set props and an event listener on the vsm-box webcomponent.
     + Note: 'vsm-box' is not inside a Vue-activated '#app'-element here,
       so we can not use `v-bind:...` to sync variables to it.
       To set props here, we must assign Strings and Objects to the element's
       attributes.  - Note that assigning e.g. a Boolean `true` would not work,
       so we'd need to use the String `'true'` */
  elVsmBox.vsmDictionary = createDict();
  elVsmBox.queryOptions = {};
  elVsmBox.autofocus    = '' + autofocus;  // (See also much further below).
  elVsmBox.placeholder  = 'Type here'; ///'Type a term or doubleclick for menu';
  elVsmBox.cycleOnTab   = 'true';
  elVsmBox.initialValue = vsmBoxInitialValue;  // We must assign either Objects..
  elVsmBox.freshListDelay = '0';             // ..or Strings, to the attributes.
  updateVsmBoxSizes(vsmBoxInitialSizes);

  function updateVsmBoxSizes(sizes) {  // It detects change when given `new` Obj.
    elVsmBox.sizes = vsmBoxSizes = Object.assign({}, vsmBoxSizes, sizes);
  }


  elVsmBox.customItem = function(o) {
    if (useTweaks) {
      if (/^(VAR|BIO):/.test(o.item.id)) {
        o.strs.info = '';
      }
      if (o.item.z && o.item.z.tweakID) {
        o.strs.extra = '' + o.item.z.tweakID;
      }
      ///else  o.strs.extra = o.item.id;
    }
    else    o.strs.extra = o.item.id;
    return o.strs;
  };


  elVsmBox.customPopup = function(o) {
    if (useTweaks && o.z && o.z.tweakID)  o.strs.classID = '' + o.z.tweakID;
    return o.strs;
  };


  // --- Add external Copy+Paste support for the vsm-box. ---

  // Make a 'clipboard' for term and term-reference copying. Make functions for
  // accepting copied data, and for providing it back to be pasted on request.
  // Note: copy+paste can happen between vsm-boxes, hence the external handling.
  var termCopied;
  elVsmBox.termCopy  = function(term) {
    termCopied = term;
    elVsmBox.termPaste = function() {  // Only activate this after smth is copied.
      return termCopied;
    };
  };




  // --- Initialize the checkboxes and buttons. ---

  // Initialize the checkbox to make connectors-background & VsmBox-border white.
  elWhBTgl.checked = whiteBox;  // Setting this forces a reset of the
                                // checkbox, at pageload.
  elVsmBox.classList[whiteBox ? 'add' : 'remove']('whiteBox');
  elWhBTgl.addEventListener('change', function() {
    whiteBox = !whiteBox;
    elVsmBox.classList.toggle('whiteBox');
    setPureSVGText();
  });


  // Init checkbox for removing connectors' feet.
  var el = $el('toggleNoFeet');
  el.checked = !vsmBoxSizes.connFootVisible;
  el.addEventListener('change', function() {
    updateVsmBoxSizes({ connFootVisible: !vsmBoxSizes.connFootVisible });
    setPureSVGText();
  });


  // Init checkbox for removing/adding the Create-Term item the autocomplete list.
  el = $el('toggleCreateItem');
  elVsmBox.allowClassNull = allowClassNull_initial.toString();
  el.checked = allowClassNull_initial;
  el.addEventListener('change', function(ev) {
    elVsmBox.allowClassNull = '' + !!ev.target.checked;
  });


  // Init checkbox for activating some tweaks to the dictionaries, for VSM-paper figs.
  el = $el('toggleUseTweaks');
  el.checked = useTweaks;
  el.addEventListener('change', function() {
    useTweaks = !useTweaks;
    elVsmBox.vsmDictionary = createDict();
    elVsmBox.classList.toggle('useTweaks');
    widthToggle();
  });
  elVsmBox.classList[useTweaks ? 'add' : 'remove']('useTweaks');
  widthToggle();

  // Note: vsmBox currently does not reduce width (until page reload), so this
  // code only narrows a VsmBox, when `useTweaks` or `useTinyMinEndTermWidths`
  // is `true` at start!  <---
  function widthToggle() {
    var normal = !(useTweaks || useTinyMinEndTermWidths);
    updateVsmBoxSizes({
      minEndTermWidth:     normal ? vsmBoxInitialSizes.minEndTermWidth :
                                                       minEndTermWidth_Tiny,
      minEndTermWideWidth: normal ? vsmBoxInitialSizes.minEndTermWideWidth :
                                                       minEndTermWideWidth_Tiny
    });
  }


  // Init checkbox for toggling JSON/JSON5 output in the stateText.
  el = $el('toggleJSON5');
  el.checked = json5;
  el.addEventListener('change', function() {
    json5 = !json5;
    boxValueToStateText(currentVSM);
  });


  // Init checkbox for keeping/removing a visible cursor in export of vsm-box to SVG.
  el = $el('toggleKeepSVGCursor');  // (Used for (earlier) vsmBox-to-SVG code).
  el.checked = keepSVGCursor;
  el.addEventListener('change', function() { keepSVGCursor = !keepSVGCursor; });


  // Init checkbox for toggling pure-SVG output vs. SVG with a 'foreignObject' node.
  el = $el('togglePureSVG');
  el.checked = pureSVG;
  updateSvgBtn();
  el.addEventListener('change', function() {
    pureSVG = !pureSVG;
    updateSvgBtn();
  });
  function updateSvgBtn() {
    elSVGBtn.classList[pureSVG ? 'add' : 'remove']('pureSVG');
  }


  // Init checkbox for showing the RDF-conversion textarea.
  el = $el('toggleRDF');
  el.checked = showRDF;
  elRDF.classList[!showRDF ? 'add' : 'remove']('hidden');
  el.addEventListener('change', function() {
    showRDF = !showRDF;
    elRDF.classList.toggle('hidden');
    ///if (showRDF) {
    ///  setTimeout(() => elRDF.scrollIntoView({ behavior: 'smooth' }), 250);
    ///}
  });


  // Initialize the input for PNG scaling-value (or for any other bitmap format).
  elImgScale.value = imgScale;
  elImgScale.addEventListener('input', function() { imgScale = ~~elImgScale.value; });


  // Initialize the input for the download delay value.
  elDlDelay.value = dlDelay;
  elDlDelay.addEventListener('input', function() { dlDelay = ~~elDlDelay.value; });


  // Init checkbox for automatically switching to whiteBox mode before saving to SVG.
  el = $el('toggleAutoWhiteBox');
  el.checked = autoWhiteBox;
  el.addEventListener('change', function() { autoWhiteBox = !autoWhiteBox; });



  // --- Initialize the 'stateText' (JSON) 'rdfText', and 'resizer' textareas ---

  elTxt.cols  = elTxt2.cols
    = elRsz1.cols = elRsz2.cols = elRsz3.cols = elRsz4.cols = elTxtMaxCols;
  elTxt.value = elTxt2.value = '';
  elTxt .rows = elTxt .getAttribute('data-min-rows');
  elTxt2.rows = elTxt2.getAttribute('data-min-rows');
  indentationAwareTA(elTxt);  // (Also makes Tab not move focus to Clear button).



  // --- Initialize the 'msg' elements (above the textareas) ---

  function setElMsgWidth(basedOnEl = elTxt) {
    var w = getComputedStyle(basedOnEl).width;
    [elTxt, elTxt2, elRsz1, elRsz2, elRsz3, elRsz4, elMsg, elMsg2]
      .forEach(e => e.style.width = w );

    // Update 'maxCols' for VsmJsonPretty, and then update elTxt's content.
    elTxtMaxCols = Math.max(10, ~~(~~w.replace('px', '') / elTxtCharWidth) );
    try {
      updateElTxtValue(JSON5.parse(elTxt.value));
      fitAllTextAreas()
    }
    catch (err) {}
  }


  function setMsg(msg) {  // `msg`: 1 / -1 / fill-example name / error msg.
    var d = new Date();
    d = '[' + ('0' + d.getHours()).slice(-2) + ':' +
      ('0' + d.getMinutes()).slice(-2) + ':' +
      ('0' + d.getSeconds()).slice(-2) + '.' +
      ('00' + d.getMilliseconds()).slice(-3, -1) + ']';
    elMsg.innerHTML = !msg ? '' :
      ((msg == -1 ? '<---' : msg == 1 ? '--->' : msg) + ' &nbsp;' + d);
  }

  setElMsgWidth(elTxt);
  setMsg('');



  // --- Resize handling ---


  window.addEventListener('resize', () => setElMsgWidth(elTxt));
  [elTxt, elTxt2, elRsz1, elRsz2, elRsz3, elRsz4] .forEach(e => {
    e.addEventListener('mouseup' , () => setElMsgWidth(e));
    e.addEventListener('touchend', () => setElMsgWidth(e));
  });



  // --- Add a button for each available example. ---

  var exampleButtonC = $el('exampleButtonC');
  var exampleButtons = $el('exampleButtons');
  for (var i = 0, newB = 0;  i < vsmExamples.length;  i++) {
    // Note: some buttons are added in HTML already (just to show smth @pageload).
    var button = $el('exampleButton' + i);
    if (!button) {
      button = document.createElement('button');
      button.id = 'exampleButton' + i;
      button.style =
        `animation: example-buttons-fadein ${ Math.min(0.7, ++newB * 0.07) }s;`;
      button.innerHTML =  i == 0 ?  'Clear' :
                          i <= 1 ?  `Example ${i}` :  `${i}`;  ///`Ex.${i}`
      (i == 0 ?  exampleButtonC :  exampleButtons)  .appendChild(button);
    }
    button.onclick = function() {
      var nr = ~~this.id.replace(/[^\d]/g, '');
      fillExample(nr);
    }
  }
  // Also remove any buttons that were added too many in HTML.
  while (el = $el('exampleButton' + i++))  el.remove();


  // Fills an example in the VsmBox + the textarea, and shows a msg.
  function fillExample(nr) {
    var data = getExample(nr);
    elVsmBox.initialValue = data;
    boxValueToStateText(data);
    setMsg(nr == 0 ? 'Cleared' : ('Example ' + nr));
    makeVsmBoxNarrower(elVsmBox);
  }

  // Returns cloned data for an example. Returns the last example if `nr==-1`.
  function getExample(nr) {
    if (nr < 0)  nr += vsmExamples.length;
    return clone(vsmExamples[nr]);
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }



  // --- Two-way binding:  vsm-box  <-->  stateText with nicely formatted JSON ---
  //     (See vsm-box's "index-prod-standalone.html" for extra info).

  // 1. Initial VsmBox ==> textarea.
  boxValueToStateText(vsmBoxInitialValue);

  // 2. If VsmBox changes ==> change textarea.
  elVsmBox.addEventListener('change', function(event) {
    // Note: we must access `$emit()`'s args via `events.detail[]`. This is
    // different for a webpacked web-component vs. a pure Vue-component.
    boxValueToStateText(event.detail[0]);
  });

  // 3. If textarea changes ==> change VsmBox.
  elTxt.addEventListener('input', stateTextToBoxValue);


  function fitTextAreaRowCount(el) {
    var min = el.getAttribute('data-min-rows') || 1;
    el.rows = Math.max(min, el.value.split('\n').length);
  }

  function fitAllTextAreas() {
    fitTextAreaRowCount(elTxt);
    fitTextAreaRowCount(elTxt2);
  }

  function boxValueToStateText(value) {         // (See vsm-box's index-dev.js).
    currentVSM = value;
    updateElTxtValue(value);
    setMsg(1);
    updateRdf(value);
    setPureSVGText({ afterVsmBoxChange: true });
    fitAllTextAreas();
  }

  function updateElTxtValue(value) {
    elTxt.value = lastAutoFilledText =
      VsmJsonPretty(value, { json5: json5, maxLength: elTxtMaxCols });
    }

  function stateTextToBoxValue() {              // (See vsm-box's index-dev.js).
    var abort = lastAutoFilledText === elTxt.value;
    lastAutoFilledText = false;
    if (abort)  return;

    try {
      var vsm = JSON5.parse(elTxt.value);
      elVsmBox.initialValue = currentVSM = vsm;
      setMsg(-1);
      updateRdf(vsm);
      setPureSVGText();
      fitAllTextAreas();
    }
    catch (err) {
      setMsg(err.toString().replace('JSON5: ', ''));
      updateRdf(null);
    }
  }



  // --- RDF conversion output ---

  function updateRdf(vsm) {
    try {
      var rdf = vsm && VsmToRdf(vsm);
      elTxt2.value = rdf === null ?  '-' :  rdf === '' ?  ''/*'no data'*/ :  rdf;
    }
    catch(e) {
      elTxt2.value = `Error: could not run 'vsm-to-rdf.min.js'.`;
    }
    fitTextAreaRowCount(elTxt2);
  }


  // --- SVG-export text, _IF_ this debug-helper element is activated ---

  function setPureSVGText(opt) {
    if (!elSVGTxt)  return;

    // If after a vsm-box change, conn-sorting can change it again =>two updates.
    var delays = opt && opt.afterVsmBoxChange ?
      [0, vsmBoxInitialSizes.theConnsResortDelay + 10] : [0];

    delays.forEach(delay => setTimeout(() => {
      domToPureSVG(elVsmBox.querySelector('.vsm-box'),
        { whiteBox,
          forDev : 1,
          ...(svgInspect && { svgInspect: { elSVGFig, elSVGTxt, elSVGHtm } })
        }
      );
    }, delay));
  }


  // --- Image export ---

  elPNGBtn.onclick = function() {
    makeVsmBoxNarrower(elVsmBox, {}, () => {
      prepAndDL({ format: 'png', delay: dlDelay * 1e3, bitmapScale: imgScale });
    });
  }

  elSVGBtn.onclick = function() {
    // Note: Don't narrow first for SVG, as it could delete input in empty terms.
    // Also, if outputting a 'whiteBox' to SVG, then narrow makes no difference.
    prepAndDL({ format: 'svg', delay: dlDelay * 1e3, keepSVGCursor, pureSVG });
  }

  function prepAndDL(options) {
    if (autoWhiteBox && !whiteBox) {
      whiteBox = true;
      elVsmBox.classList.toggle('whiteBox');
      elWhBTgl.checked = true;
      setPureSVGText();
    }

    setTimeout(() => downloadVsmBoxImage(elVsmBox,
      { ...options,
        ...(svgInspect && { svgInspect: { elSVGFig, elSVGTxt, elSVGHtm } })
      }
    ), 100);  // (At least 'png' output needs some time for things to settle).
  }


  // --- Clean up some placeholder-CSS, now/after everything is loaded.
  //     And focus the vsm-box via a simulated mouseclick, if needed.   ---

  setTimeout(() => {
    var a = [...document.getElementsByClassName('loading')];
    for (let el of a)  el.classList.remove('loading');

    if (autofocus) {
      var el = elVsmBox.querySelector('#vsmBox .term.edit.inp');
      el && el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }
  }, 100);




  // --- Utility: make vsm-box's endTerm narrow (on load-example or export-img). ---

  function makeVsmBoxNarrower(elVsmBox, opt, cb = false) {
    // (This functionality may need to be enabled by <vsm-box> itself someday).

    // 1. Detect which term currently has the input.
    // 2. Bring the <input> to the end-term (if not already there).
    // 3. Send a Ctrl+Del (to the input now at end-term) to make it narrow.
    // 4. Bring the input back to the term it was at originally.
    // 5. Unfocus it, if needed.

    opt = { focusAfter: false,  ...opt };

    const find    = sel => elVsmBox.querySelector('#vsmBox ' + sel);
    const click   = e => e.dispatchEvent(new MouseEvent   ('mousedown', {
      bubbles: true }));
    const ctrlDel = e => e.dispatchEvent(new KeyboardEvent('keydown'  , {
      bubbles: true,  keyCode: 46,  key: 'Delete',  ctrlKey: true }));

    setTimeout(() => {                  // (For if vsm-box was just being added).
      var e0 = find('.term.edit.inp');      // 1.
      var el = find('.term.edit.end');      // 2.
      var same = e0 === el;
      el && !same && click(el);
      setTimeout(() => {
        el = find('.term.edit.end input');  // 3.
        el && ctrlDel(el);
        setTimeout(() => {
          e0 && !same && click(e0);         // 4.
          setTimeout(() => {
            !opt.focusAfter && (el = find('input')) && el && el.blur();  // 5.
            setTimeout(() => {
              cb && cb();
            }, 1);
          }, 1);
        }, 1);
      }, 1);
    }, 1);
  }




  // --- Utility: more code-indentation aware editing in textareas ---

  /**
   * Enhances certain keypresses in the `el` textarea DOM-element, to make them
   * more code-indentation aware. (This also makes Tab not divert focus).
   * The indentation used is: two spaces.
   * - Tab: indents, both in-line, and on a selection of lines.
   * - Shift-Tab: unindents, both in-line and on a selection.
   * - Home: moves the cursor to the first non-whitespace character on the line,
   *   or if it is already there, or no ws-chars, then to the start of the line.
   * - Shift+Home: does the same, but only for the selectionEnd.
   * - Enter: also adds to the new line the same indentation as the current one.
   * + Note!: the Tab and Enter operations delete the text-area's undo-history.
   */
  function indentationAwareTA(el) {
    el.addEventListener('keydown', function(e) {
      if (!['Tab', 'Home', 'Enter'] .includes(e.key) || e.ctrlKey || e.altKey)
        return;
      e.preventDefault();

      var V = this.value;
      var X = this.selectionStart;
      var Y = this.selectionEnd;
      var A = V.slice(0, X);  // Part before selection or cursor.
      var B = V.slice(X, Y);  // Selected part, if any.
      var C = V.slice(Y);     // Part after selection or cursor.

      // Functions to get the part of the line before/after a start/end-cursor.
      const _pre  = p => V.slice(    V    .lastIndexOf('\n', p - 1) + 1, p);
      const _post = p => V.slice(p, (V + '\n').indexOf('\n', p    )       );
      var pre  = '';
      var post = '';

      if (e.key == 'Tab') {
        if (X == Y) {  // No selection. Handle simple Tab and Shift+Tab.
          if      (!e.shiftKey)        A += '  ';
          else if (A.endsWith('  '))   A = A.slice(0, -2);
          else if (A.endsWith(' ') ) { A = A.slice(0, -1);  if (C[0] == ' ')  C = C.slice(1); }
          else if (C[0] == ' '     )   C = C.slice(C[1] == ' ' ? 2 : 1);
        }
        else {
          pre  = _pre(X);
          post = V[Y - 1] == '\n' ?  '' :  _post(Y); ///console.log(pre+'✓'+post);
          // Include anything before selectionStart on first line,
          // or after selectionEnd on last line, into selection.
          A = A.slice(0, A.length - pre.length);
          C = C.slice(post.length);
          console.log(A+'#'+(pre + B + post)+'#'+C);
          B = (pre + B + post).split('\n');
          if (!e.shiftKey) {              // Tab on selection.
            B = B.map(s => '  ' + s);
            var D = B.pop();
            B.push(D == '  ' ?  '' :  D);
          }
          else {                          // Shift+Tab on selection.
            B = B.map(s => s.slice(s[0] != ' ' ?  0 :  s[1] != ' ' ?  1 :  2));
          }
          B = B.join('\n');
        }
        this.value = A + B + C;
        this.selectionStart = A.length;
        this.selectionEnd   = A.length + B.length;
        stateTextToBoxValue();
      }

      else if (e.key == 'Home') {
        pre = _pre(Y);
        var line = pre + _post(Y);
        var pos  = line.search(/\S|$/);
        pos = Y - pre.length + (pos == pre.length || pos == line.length ?  0 :  pos);
        if (!e.shiftKey)  this.selectionStart = this.selectionEnd = pos;
        else if (X != Y)  this.selectionEnd = pos;
        else {  // Start selection.
          this.selectionStart = Math.min(Y, pos);
          this.selectionEnd   = Math.max(Y, pos);
        }
      }

      else if (e.key == 'Enter') {
        A = A + '\n' + ' '.repeat(_pre(X).search(/\S|$/));
        this.value = A + C;
        this.selectionStart = this.selectionEnd = A.length;
        stateTextToBoxValue();
      }
    });
  }



  // --- Utility: Image export (via dom-to-image-more + dom-to-pure-svg) ---

  /**
   * Generates image-data for the VsmBox at the given HTMLElement `elem`,
   * (by calling `dom-to-image-more` or `dom-to-pure-svg.js`),
   * and offers it in a Save As dialog, for to the user to download.
   * + This requires the package 'dom-to-image-more'. Include it like this:
   *     <script src="https://unpkg.com/dom-to-image-more/dist/dom-to-image-more.min.js">< /script>
   * + `options` (optional, with all optional properties):
   *   - filename {String}:
   *       name without extension.
   *   - format {String}:
   *       supported formats are: 'png', 'svg',
   *       (and probably some more, see the package 'dom-to-image-more').
   *   - delay  {Number}:
   *       will generate and send the data after this amount
   *       of milliseconds. Useful when needing to clicking the download-button,
   *       and then still having some time to interact with the vsm-box
   *       (e.g. to highlight a conn, or to bring up the autocomplete panel).
   *   - keepSVGCursor {Boolean}:
   *       used when  `format=='svg' && !pureSVG`  as that generates SVGs with
   *       a `foreignObject` node, which includes an <input>. Then when opening
   *       the SVG in a browser, that input gets focused, showing a text cursor.
   *       When `false`, a small modification is made to the SVG-code to hide it.
   *   - bgcolor {String}:
   *       argument given directly to 'dom-to-image-more':
   *       the background color used for the bitmap image.
   *   - bitmapScale {Number}:
   *       argument given directly to 'dom-to-image-more':
   *       the scaling factor used for the bitmap (e.g. PNG) image.
   *       (This is supported by 'dom-to-image-more', unlike 'dom-to-image').
   *   - pureSVG {Boolean}:
   *       combined with format 'svg', this exports an SVG file without
   *       a `foreignObject` node that is unreadable in e.g. Illustrator 2018.
   *       This output excludes e.g. opened autocomplete panels, and uses only
   *       the vsm-box default CSS-styles.
   *       It is a more lightweight output, and it preserves all of: terms,
   *       styling, term types, connectors, and any conn-highlight.
   *       This is done by 'domToPureSVG.js'.
   *   - svgInspect {Object}:
   *       (an object for inspection purposes during development work).
   */
  function downloadVsmBoxImage(elem, options) {
    var DefaultOptions = {
      filename: 'vsm-box',
      format: 'svg',
      delay: 0,
      keepSVGCursor: true,
      bgcolor: '#fff',
      bitmapScale: 5,
      pureSVG: true,
      svgInspect: false
    };
    var opt = Object.assign({}, DefaultOptions, options);

    if (opt.delay > 0) {
      var delay = opt.delay;
      opt.delay = 0;
      return setTimeout(function () { downloadVsmBoxImage(elem, opt); }, delay);
    }

    var ext = opt.format.toLowerCase();
    var el = elem.querySelector('.vsm-box');
    var filename = opt.filename + '.' + ext;

    if (opt.format == 'svg' && opt.pureSVG) {
      domToPureSVG(el, {
        whiteBox,
        svgInspect,
        cb: s => {  // Behave async like `domtoimage[*]`.
          s = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
          downloadUrl(s,  filename);
        }
      });
    }
    else {
      var toImg = domtoimage['to' + ext[0].toUpperCase() + ext.substr(1)];  // => e.g. `domtoimage.toPng`.
      if (!toImg) {
        return console.error('Error: unsupported output format: ' + opt.format, error);
      }
      var imgOpt = { bgcolor: opt.bgcolor, scale: opt.bitmapScale };

      toImg(el, imgOpt).then(function (dataUrl) {
        if (opt.format == 'svg'  &&  !opt.keepSVGCursor) {
          dataUrl = dataUrl
          .replace(/(cursor: text;.{1,100})inline-block;/g, '$1none;');
        }
        downloadUrl(dataUrl, filename);
      }).catch(function (error) {
        console.error('Error with dom-to-image-more', error);
      });
    }
  }



  function downloadUrl(url, filename) {
    var el = document.createElement('a');
    el.href = url;
    el.download = filename;
    el.style.display = 'none';
    document.body.appendChild(el);
    el.click();
    el.remove();
  }

})();
