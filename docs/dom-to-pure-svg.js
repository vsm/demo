/**
 * This function generates pure SVG data, based on a given VSM-box DOM-element.
 * I.e. the SVG data has no `foreignObject` element that would sneak in HTML
 * code, which can not be read by SVG editors.
 *
 * Developer's notes:
 * - This does not convert VSM-JSON or a VSM-sentence JS-object directly; it
 *   still needs a VSM-box DOM-element, which does much of the complex layout.
 * - Many default values (vsm-box CSS or `sizes`) are used in the SVG,
 *   so some VSM-box customizations are not necessarily reflected.
 * - This code could be moved into a standalone module. Perhaps even linked to
 *   a headless browser generating the DOM-element; but that could be oversized.
 */
function domToPureSVG(e, opt) {
  opt = opt || {};

  // Handle async-response requests.
  if (opt.cb)  return setTimeout(() => {
    var svg = domToPureSVG(e, { ...opt, cb: null });
    opt.cb(svg);
  }, 0);


  // All `opt` options are automatically available in f.*() functions: as `o`.
  // + Note: some of these values would ideally be derived from VsmBox/CSS.
  //   And some remain hard-coded in the f.* below for now.
  // So this code uses some _default values__ for vsm-box, to output the SVG.
  var isEmptyBox  = !e.querySelector('.terms .term:not(.ruler):not(.end)');
  var endTermText =
    (e.querySelector('.terms .term.end .label') || {}) .innerHTML ||
    (e.querySelector('.terms .term.end input' ) || {}) .value;
  var whiteBox = !!opt.whiteBox;
  opt = {
    useViewBox:     !opt.forDev,  // Use viewbox vs. width/height in <svg> tag.
    whiteBox:       whiteBox,
    addBorder:      !whiteBox,  // False=>zero border (even if DOM has 1px).
    addUCConn:      true,       // False=>won't add any shown under-constr-conn.
    addPosHL:       true,
    showRemoveIcon: true,       // False=>still added, but kept invisible.
    showTextCursor: false,      // False=>still added, but kept invisible.
    showMouse:      0,          // 0:hidden; 1:visible; 2:visible +click-stripes.
    borderW:        1,
    termsH:         17,  // (Excludes the fake white padding on top, =part of conns panel).
    termsMarginTop: 2,
    refConnDashArray: '2,1',    // (Chrome:'2,1' |FF:'2,1'     |'2.5,1.25').
    refTermDashArray: '2,1.5',  // (Chrome:'2,1' |FF:'2.5,2.5' |'2.5,1.25').
    connsFill:     whiteBox ? 'ffffff' : 'fbfbfb',  ///(For debug: 'ffeeee':'fbfbfb').
    termsFill:     'ffffff',                        ///(For debug: 'ffe2e2').
    addEndTerm:    !whiteBox || isEmptyBox || endTermText,
    showEndTerm:   !!(isEmptyBox || endTermText),
    tab: '  ',       // E.g. '  ' indents with two spaces per deeper level.
    ...opt
  };


  const NotFade = ':not([class*="fade-leave"])';


  /* // (May someday be used for font embedding, and perhaps font subsetting.
  //  But currently this is not consistently supported by both browsers and
  //  SVG-editor software, so this is disabled for now).
  const FontDataTag = ''; ///'<<FontData>>';
  var usedChars = [];  */


  // Define many functions that each generate a part of the SVG structure,
  // and/or delegate parts to other functions. They can return String|Array.
  // NOTE: These will be augmented: see further below!
  var f = {
    main: (e, o) => {
      var svg = e.querySelector('svg') || e;
      o.tx = 0;  // } 'translate-x' and 'translate-y': horizontal and vertical..
      o.ty = 0;  // } ..offset that the next called f.*() should apply.
      o.contW = +svg.getAttribute('width' );    // The content's width/height..
      o.contH = +svg.getAttribute('height') + o.termsH;  // ..excl. box-border.

      // In whiteBox-mode: shrink the viewport to the terms+conns+highlights
      // bounding-box, and shift the content into it. Draw no bkgr outside it!
      o.contBB =  calcBoundingBox(e, o);  // ("contBB"=content bounding-box).

      var bw2  = o.addBorder ?  o.borderW * 2 :  0;
      var boxW = o.contBB.x2 - o.contBB.x1 + bw2;
      var boxH = o.contBB.y2 - o.contBB.y1 + bw2;
      var tags = (o.useViewBox ? ` viewBox="0 0 ${ boxW } ${          boxH }"` :
                                 ` width="${       boxW }" height="${ boxH }"`);

      return [
        `<svg${tags} xmlns="http://www.w3.org/2000/svg">`,
        ...indent(o, [
          f.style(e, o),  /* f.fontData(e, o), */
          f.box  (e, o)
        ]),
        '</svg>'
      ];
    },

    style: (e, o) => [
      '<style>',
      indent(o, f.styleData(e)),
      '</style>'
    ],
    styleData: (e, o) => `
     ${'* { stroke: none; }'  /* Makes Inkscape-1.0.1-->StrokeToPath not stroke text */ }
        .box-border { stroke: #d3d9e5;  stroke-width: 1px;  fill: none; }
     ${  o.whiteBox ? '' :
       '.conns-fill { fill: #' + o.connsFill + '; } ' +
       '.terms-fill { fill: #' + o.termsFill + '; }' }
        .foot       { stroke: #b6b6b6; }  .foot.stub  { stroke: #cbcbcb; }
        .back, .leg { stroke: #7a7a7a; }  .obj, .par  { stroke: #7a7a7a;  fill: none; }
        .rel,  .lis { fill:   #7a7a7a; }
        .back.stub, .leg.stub, .obj.stub, .par.stub { stroke: #c3c3c3; }
        .rel.stub   { fill:   #c3c3c3; }
     ${  o.addUCConn ?
       '.obj.uc, .par.uc, .leg.uc { stroke: #2e48ff;  opacity: 0.56; }\n' +
       '.rel.uc, .lis.uc          { fill:   #2e48ff;  opacity: 0.56; }  ' +
       '.foot.uc         { stroke: #e6e6e6; }  ' : '' }
        .back.ref, .leg.ref, .foot.ref { stroke-dasharray: ${ o.refConnDashArray }; }
        .pos-hl, .hl-leg-under { fill: #f0f4fb; }
        .hl-back-top, .hl-leg  { fill: #e5e9fb; }
        .ri-fg    { stroke: #aabcce;  stroke-width: 2px; }  .ri-fg.hl { stroke: #ffffff; }
        .ri-bg    { fill: none;                          }  .ri-bg.hl { fill:   #7491ab; }
        .r.ref           { stroke: #e2e6f0;  fill: #e2e6f0; }
        .r.ref-bord      { stroke: #b1bed8;  stroke-dasharray: ${ o.refTermDashArray }; }
        .r.ref.edit      { stroke: none;     }
        .r.inst          { stroke: #b1bed8;  fill: #e2e6f0; }
        .r.inst.edit, ${ ''
      } .r.ref-bord.edit { stroke: #c4c4c4;  }
        .r.class         { stroke: #e5c547;  fill: #f9f2b9; }
        .r.class.edit    { stroke: #ebd262;  }
        .r.lit           { stroke: #d8b1ba;  fill: #f0e2e6; }
        .r.lit.edit      { stroke: #e1c2c7;  }
        .r.edit, .r.ref-bord  { fill: none;  }
        .r.inst.end      { stroke: #f0f0f0;  }
        .r.focal    { stroke: #aaaaaa;  stroke-dasharray: 0,3.4;  stroke-width: 1.7px;  stroke-linecap: round; }
        .textcursor { stroke: #000000;  stroke-width: 1px; }
        .t          { font: 11px tahoma, sans-serif;  white-space: pre; }
        .t.inst, .t.ref { fill: #1c2a47; }
        .t.edit, .t.end { fill: #7a7a7a; }  .t.plac { fill: #aaaaaa; }
        .t.class        { fill: #2a2a05; }  .t.lit  { fill: #200505; }
        .mouse { stroke: #000000;  fill: #ffffff;  stroke-width: 0.5px; }
        .click { stroke: #000000;  fill: none;     stroke-width: 0.8px; }
        .hide, .r.end.hide { stroke: none; fill: none; }
      `.trim() .split(/\r?\n\s*/g) .map(s => s.replace(/ {2,}/g, ' '))
      /*
      @font-face { font-family: 'Tahoma';  font-weight: normal;  font-style: normal;
        src: local('Tahoma'),  local('WineTahoma'),  url('https://vsm.github.io/font/wine-tahoma.woff') format('woff'); }
      @font-face { font-family: 'Tahoma';  font-weight: bold;  font-style: normal;
        src: local('Tahoma Bold'), local('Verdana Bold'); }
      */
    ,
    /*
    fontData: (e, o) => [
      FontDataTag  // To be replaced with data for encountered glyphs.
    ],
    */
    box: (e, o) => {
      var oPlus = {  // (This will be merged with `o` by the decorator).
        connsH: o.contH - o.termsH,  // This *includes* the 'fake' white margin..
                    // ..above the terms (where a conn-highlight may reach into).
        ...(o.addBorder && trp(o, 1, 1)),
        ...(o.whiteBox  && trp(o, -o.contBB.x1, -o.contBB.y1))
      };

      var a = [];              // Line below: `s`: querySelector relative to `e`.
      if (o.addBorder)  a.push(f.border(e, { s: 'rect' }));  // No `oPlus` here.
      if (!o.whiteBox)  a.push(f.backgrounds(e, oPlus));
      a = group(o, a);

      return a.concat([
        f.posHL      (e, { ...oPlus,  s: `.pos-highlight${NotFade}` }),
        f.hl         (e, { ...oPlus,  s: `.conn-highlight${NotFade}` }),
        f.conns      (e, { ...oPlus,  s: `.conns` }),
        f.removeIcon (e, { ...oPlus,  s: `.conn-remove-icon${NotFade}` }),
        f.terms      (e, { ...oPlus,  s: `.terms` }),
        f.mouse      (e, oPlus)
      ]);
    },
    border: (e, o) =>
      rect(e, o, 'box-border', {
        x: o.borderW/2,  w: o.contW + o.borderW,
        y: o.borderW/2,  h: o.contH + o.borderW })
    ,
    backgrounds: (e, o) => {
      if (o.whiteBox)  return '';  // If whiteBox, don't draw background.
      var cut = {
        left  : o.contBB.x1,
        right : o.contW - o.contBB.x2,
        top   : o.contBB.y1,
        bottom: o.contH - o.contBB.y2
      };
      var showConns = o.connsH - cut.top > 0;
      var trimmedW = o.contW - cut.left - cut.right;
      var termsBgY = o.connsH - (showConns ?  o.termsMarginTop :  0);
      var termsBgH = o.termsH + (showConns ?  o.termsMarginTop :  0) - cut.bottom;
      var arr = [];
      if (showConns)  arr.push(
        rect(e, o, 'conns-fill',
          { x: cut.left,  y: cut.top,   w: trimmedW,  h: termsBgY - cut.top }) );
      arr.push(
        rect(e, o, 'terms-fill',
          { x: cut.left,  y: termsBgY,  w: trimmedW,  h: termsBgH }) );
      return arr;
    },
    posHL: (e, o) =>
      !o.addUCConn || !o.addPosHL ?  '' :
        rect(e, o, 'pos-hl', { y: 0,  h: o.connsH })  // Other coos: auto-filled.
    ,
    hl: (e, o) => group(o, [
      f.hlBackTop (e, { s: '.hl-back-top'               } ),
      f.hlLeg     (e, { s: '.hl-leg'      ,  many: true } ),
      f.hlLegUnder(e, { s: '.hl-leg-under',  many: true } ),
    ]),
    hlBackTop:  (e, o) => path(e, o, 'hl-back-top' ) ,
    hlLeg:      (e, o) => rect(e, o, 'hl-leg'      ) ,
    hlLegUnder: (e, o) => rect(e, o, 'hl-leg-under') ,
    conns: (e, o) =>
      f.conn(e, { s: '.conn',  many: true })
    ,
    conn: (e, o) => {
      var oPlus = {
        ref    : classNames(e).includes('r') ?  ' ref' :  '',
        ucLegNr: !e.querySelector('.conn-leg.uc') ?  -1 :
                  e.querySelectorAll('.conn-leg').length - 1
      };
      return group(o, [
        f.back          (e, { ...oPlus,  s: '.back',      many:  true }),
        f.legFootPointer(e, { ...oPlus,  s: '.conn-leg',  many:  true }),
        f.stubs         (e, oPlus)
      ]);
    },
    back: (e, o) =>
      line(e, o, `back${ o.ref }${ classNames(e).includes('two') ? ' two' : '' }`)
    ,
    legFootPointer: (e, o) => {
      var uc = o.ucLegNr == o.nr ? ' uc' : '';
      return [
        f.foot   (e, { uc,  s: '.foot',  many: true }),
        f.leg    (e, { uc,  s: '.leg'               }),
        f.pointer(e, { uc,  s: '.pointer'           }),
      ];
    },
    foot:    (e, o) => line(e, o, `foot${ o.ref }${ o.uc }`),
    leg:     (e, o) => line(e, o, `leg${  o.ref }${ o.uc }`),
    pointer: (e, o) => path(e, o, `${ pointerClassName(e) }${ o.uc }`),
    stubs: (e, o) => [
      f.stubBack   (e, { s: '.stub-back'    }),
      f.stubFoot   (e, { s: '.stub-foot'    }),
      f.stubLeg    (e, { s: '.stub-leg'     }),
      f.stubPointer(e, { s: '.stub-pointer' })
    ],
    stubBack:    (e, o) => line(e, o, 'back stub'),
    stubFoot:    (e, o) => line(e, o, 'foot stub'),
    stubLeg:     (e, o) => line(e, o, 'leg stub' ),
    stubPointer: (e, o) => path(e, o, `${ pointerClassName(e) } stub`),
    removeIcon: (e, o) => group(o, [
      f.riBg(e, { s: '.ri-bg' }),
      f.riFg(e, { s: '.ri-fg' }),
    ]),
    riBg: (e, o) =>
      rect(e, o, `ri-bg${ o.showRemoveIcon ?  '' : ' hide' }`, { rx: '~' })
    ,
    riFg: (e, o) => {   // Also split path parts: better for Illustrator.
      var c =    `ri-fg${ o.showRemoveIcon ?  '' : ' hide' }`;
      var s = e.getAttribute('d') || '';
      var a = s.match(/M[^M]+/g) || [s];
      return a.map(d => path(e, o, c, { d }));
    },
    terms: (e, o) => {
      var oPlus = {
        s     : '.term:not(.ruler)' + (!o.addEndTerm ? ':not(.end)' : ''),
        tx    : o.tx + 0.5,
        ty    : o.ty + 0.5 + o.connsH,
        txText: 3.5,
        tyText: 11.3,  ///11.2
        many  : true
      };
      // Prepare to possibly place a dragged term at its placeholder's position.
      var x = e.querySelector('.drag-placeholder');
      if (x  &&  (x = elStyleNum(x, 'left')) !== undefined)  oPlus.dragPlhX = x;
      return f.term(e, oPlus);
    },

    term: (e, o) => group(o, [
      f.termRect(e),
      f.termText(e, trp(o, o.txText, o.tyText)),
    ]),

    termRect: (e, o) => {
      var { type, isEdit, isEnd, isFocal, x, w } = analyzeTermElem(e, o);
      if (!type || !w || x===undefined)  return ''; // drag-placeholder->type=''.
      var c = type +
        (isEdit ? ' edit' : '') +
        (isEnd  ? ' end'  : '') +  (isEnd && !o.showEndTerm  ? ' hide'  : '');
      var a = [
        rect(e, o, `r ${c}`, { x,  y: '',  w: w - 1,  h: 14,  rx: 1.5 })
      ];
      if (type == 'ref')  a.push(  // Extra element: for ref-term border.
        a[0].replace(/\bref\b/, 'ref-bord')
      );
      if (isFocal) { // Extra element: for focal term.
        a.push(line(e, o, 'r focal', {
          x1: x     + 1 + 1.4  ,  // } 1   = rect border-width. 2 = twice.
          x2: x + w - 2 - 1.4/2,  // } 1.4 = line stroke-width.
          y1: 2,  y2: 2
        }));
      }
      if (e.querySelector('input')) {
        a.push(  f.textCursor(e,  trp(o, x + 4, 0)  )  );
      }
      return a;
    },

    textCursor: (e, o) =>
      line(e, o,  `textcursor${ o.showTextCursor ?  '' : ' hide'}`,
        { x1: 0,  x2: 0,  y1: 1.5,  y2: 12.5 })
    ,

    termText: (e, o) => {
      var { type, isEdit, isEnd, isFocal, x, w } = analyzeTermElem(e, o);
      if (!type || !w || x === undefined)  return '';
      var c = isEdit ? 'edit' :  isEnd ? 'end' :  type;
      var q, s;

      if ((q = e.querySelector('.label'))  &&  (s = q.innerHTML)) {
        if (classNames(q).includes('label-placehold'))  c = 'plac';

        // Process a label with styling (bold, etc).
        if (s.includes('<')) {
          var a = s.match(/<[^>]*>|[^<]+/g);  // Split into parts: pure text,..
          if (!a)  return '';                 // ..and style-tags.
          var _ = {  // State-object.
            b: 0,  // How many levels deep of bold we currently entered.
            i: 0,  // Same, for italic.
            t: '',  // The current track of accumulated sub and sup levels,..
                    // ..e.g. sub-sub-sup => 'ssu'.
            dp: 0,  // The previous step's dy offset to the unstyled text base-..
                    // ..line. Note: each dy="" is relative to previous <tspan>!
          };
          var b = [];  // Output-array.
          a.forEach(p => {
            if      (p.startsWith( '<b'  ))  _.b++; // Enter 1 level more bold.
            else if (p.startsWith('</b'  ))  _.b = Math.max(_.b - 1, 0);
            else if (p.startsWith( '<i'  ))  _.i++;
            else if (p.startsWith('</i'  ))  _.i = Math.max(_.i - 1, 0);
            else if (p.startsWith( '<sub'))  _.t += 's';
            else if (p.startsWith('</sub'))  _.t = _.t.replace(/.$/,'');
            else if (p.startsWith( '<sup'))  _.t += 'u';
            else if (p.startsWith('</sup'))  _.t = _.t.replace(/.$/,'');
            else {
              var f = 1;  // Factor for shrinking font-size and dy-additions.
              var d = 0;  // Absolute text-baseline offset, for current <tspan>.
              _.t.split('').forEach(x => {
                d += (x == 's' ? 1.2 : -3.8) * f;
                f *= .83;
              });
              d = round1(d);
              var dTot = -_.dp + d;  // Offset, relative to the previous tspan.
              b.push( !_.b && !_.i && !_.t && !dTot ?  p :
                `<tspan${  _.b ?  ' font-weight="bold"'  :  ''
                }${        _.i ?  ' font-style="italic"' :  ''
                }${        _.t ?  ' font-size="' + round1(11*f) + '"' :  ''
                }${       dTot ?  ' dy="'        + round1(dTot) + '"' :  ''
                }>${ p }</tspan>`
              );
              _.dp = d;
            }
          });
          s = b.join('');

          // Add newlines and indentation, without whitespace between tspans.
          s = s .replace(/>([^<]*)<tspan /g, `\n${ o.tab }>$1<tspan `);
        }
      }

      // If <input> with text, show that instead (corresp. to edit-terms' label).
      if (q = e.querySelector('input')) {
        if (q.value)  s = q.value;
        else if (q = e.querySelector('.placehold')) {
          s = q.innerHTML;
          c = 'plac';
        }
      }

      s = !s ?  '' :  text(e, o, `t ${c}`, { x,  w: w - 1 }) + s + '</text>';
      /*
      usedChars = [...usedChars, ...s.replace(/<.+?>/g,'').split('')];
      */

      return s;
    },


    mouse: (e, o) => {
      // Add mouse + click-stripes, if a pos- or conn-highlight is shown.
      // Position it relative to pos- or conn-hl's top-right corner.
      var hl =
        ( o.addUCConn && o.addPosHL ?
          e.querySelector(`.pos-highlight${NotFade}`) :  0 ) ||
        e.querySelector(`.conn-remove-icon${NotFade} .ri-bg`);
      if (!hl)  return '';

      var x2 = +hl.getAttribute('x') + +hl.getAttribute('width');
      var y1 = +hl.getAttribute('y');
      o      = { ...o,  ...trp(o, x2 - 19, y1 + 4) };
      var mc = 'mouse' + (o.showMouse      ?  '' : ' hide');
      var cc = 'click' + (o.showMouse == 2 ?  '' : ' hide');
      return group(o, [
        path(e, o, mc, { d: 'M7.15 7.2 v15.25 l3.35 -3.35 ' +
          'l2.15 5.2 l2.45 -1.25 l-2.15 -4.85 l4.9 -0.35 Z' }),
        ...group(o, [
          line(e, o, cc, { x1:  4   , y1: 5   , x2: 1.55 , y2: 2.8 }),
          line(e, o, cc, { x1:  3.15, y1: 8.35, x2: 0    , y2: 9.3 }),
          line(e, o, cc, { x1: 10.3 , y1: 5   , x2: 12.75, y2: 2.8 }),
          line(e, o, cc, { x1: 11.15, y1: 8.35, x2: 14.3 , y2: 9.3 }),
          line(e, o, cc, { x1:  7.15, y1: 3.3 , x2:  7.15, y2: 0   })
        ])
      ]);
    }
  };



  /**
   * Decorate/Augment each f.func():  wrap it into a more powerful function:
   * - If given Array, it returns a newline-joined String.
   * - It calls the original function with a merged options object: the caller's
   *   own options `o`, merged with any extra `o` given to the nested call.
   * - A selectorString `s` can be given as in the options object `o`, to call
   *   the original function for that selected HTMLElement under `e`.
   *   If this finds no `e`, then returns '' without origFunc call.
   * - If `o.many` is truthy, then new-func calls its (augmented) self for all
   *   matching `o.s` child elements, and returns the combined result.
   */
  var oStack = [];  // Each nested call adds its so-far accumulated `o` here.
  Object.keys(f).forEach(key => {
    var origFunc = f[key];
    f[key] = (e, o) => {
      // Merge parent-f.x's + own new options `o`. And enable nested f.* calls
      // to use these (+ some decorator-made resets) as their own parent-`o`.
      o = { ...oStack.slice(-1)[0],  ...o };
      oStack.push({ ...o,  ...{ s: '',  many: false,  nr: -1 } });

      // Multiply and combine calls, for `o.many`. Keep only non-empties.
      if (e && o.many && o.s) {
        var a = [];
        e.querySelectorAll(o.s) .forEach((e, i) => {
          var s = f[key](e, { ...o,  s: '',  many: false,  nr: i });
          if (s)  a.push(s);
        });
      }

      else {
        // Move on to a child Node.
        if (e && o.s) {
          e = e.querySelector(o.s);
          if (!e)  return '';
        }

        // Call original function.  Make the result an Array, without empties.
        a = origFunc(e, { ...o,  s: '' });  // Reset some option too.
        a = makeProperTagArray(a);
      }

      oStack.pop();
      return a.join('\n');
    }
  });




  // --- Various helper functions ---
  //     (All wrapped inside domToPureSVG() to prevent global pollution).

  // Makes Array[String]|String `a` into an Array, and removes empty elements.
  function makeProperTagArray(a) {
    return (typeof a == 'string' ?  [ a ] :  a) .filter(s => s);
  }

  function indent(o, a) {
    return  makeProperTagArray(a)
      .map(s => o.tab + s.replace(/\n/g, '\n' + o.tab));
  }

  // Puts the svg code in Array|Str `a` in a '<g>...</g>' group, and indents it.
  function group(o, a) {
    a = makeProperTagArray(a);
    var n = a.reduce((n, s) => n + s.split('\n').length, 0);
    return  a.length < 2 ?  a :  [
      '<g>',
      ...indent(o, a),
      '</g>'
    ];
  }

  // "Translate-plus": adds offset for deeper level, to offset of current level.
  function trp(o, x, y) {
    return { tx: o.tx + x,  ty: o.ty + y };
  }


  // Shorthands for shape()-calls. And for needed but absent `coos`-properties:
  // it makes shape() fetch their values from `e`'s attributes.
  function rect(e, o, c, coos) {
    return shape('rect', e, o, c, {  x:'~',  y:'~',  w:'~',  h:'~', ...coos });
  }
  function line(e, o, c, coos) {
    return shape('line', e, o, c, { x1:'~', y1:'~', x2:'~', y2:'~', ...coos });
  }
  function path(e, o, c, coos) {
    return shape('path', e, o, c, { d: '~', ...coos });
  }
  function text(e, o, c, coos) {
    return shape('text', e, o, c, { x: '~', y: '~', w: '~', ...coos } , '>');
  }


  // Creates a <rect>, <line>, etc SVG-tag.
  function shape(tagName, e, o, classNames, coos, end) {  // E.g. `coos={x,y,..}`.
    // For the coordinates(`coos`)'s keys x/y/w/h/x1/y1/x2/y2/rx/d/_:
    // - replace any '~' value by `e`'s corresp. attribute, e.g. y2:'~'<--y2="..",
    // - tx/ty-shift all values,  - clean up `d` values.

    var coosStr =  // (Line 1+2 below create a standard ordering for coos' keys).
      ['x', 'y', 'w', 'h', 'x1', 'y1', 'x2', 'y2', 'rx', 'd']
      .filter(k => coos[k] !== undefined)
      .map   (k => {
        let v = coos[k];
        k = k == 'w' ? 'width' :  k == 'h' ? 'height' :  k;
        v = v == '~' ? e.getAttribute(k) :  v == '' ? 0 :  v;
        v =
          ['x', 'x1', 'x2'].includes(k) ?  +v + o.tx :
          ['y', 'y1', 'y2'].includes(k) ?  +v + o.ty :
          'd' == k ?  v         // E.g. `v = 'M114 88.28 L117.5 93 L121 88.28'`.
            .replace( /([LM]) ?(-?\d+(?:\.\d+)?),?\s*(-?\d+(?:\.\d+)?)/g,
              ($0, c, x, y) => `${ c }${ +x + o.tx } ${ +y + o.ty }` )
            .replace( /([HV]) ?(-?\d+(?:\.\d+)?)/g,
              ($0, c, n)    => `${ c }${ +n + (c=='H' ? o.tx : o.ty) }` )
            .replace(/-?\d+\.\d\d\d+/g,
              n => round2(n) )                  // E.g. '1.8000000001' -> '1.8'.
            .replace(/(\d)([A-Z])/gi, '$1 $2')  // E.g. '..1L..' -> '..1 L..'.
            .replace(/([A-Z]) /gi, '$1') :  v;  // E.g. 'M 1' -> 'M1'.
        return `${ k }="${ v }"`;
      })
      .join(' ');
    return `<${ tagName } class="${ classNames }" ${ coosStr }${ end || '/>' }`;
  }


  function round1(num)  { return Math.round(num * 10 ) / 10 ; }
  function round2(num)  { return Math.round(num * 100) / 100; }



  function calcBoundingBox(e, o) {
    if (!o.whiteBox || o.addBorder){
      return { x1: 0, y1: 0, x2: o.contW, y2: o.contH };  // Content's bndn.-box.
    }

    var x1 = [];  // min(x of leftmost termRect; x of leftmost hlLeg).
    var x2 = [];  // max(left + w of rightmost termRect; x+w of rightm hlLeg).
    var y1 = [];  // min(y1 of highest conn-back -0.5; y1 of highest hl (=y1..
                  // ..of its removeIcon); y1/y2 of uc-conn-leg).
    var y2 = [];  // top of terms + height of a termRect.

    var qTerms = e.querySelectorAll('.terms .term:not(.ruler):not(.drag)' +
      (!o.addEndTerm ? ':not(.end)' : '') );  // (Includes .drag-placeholder).
    var qRIBG       = e.querySelector   (`.conn-remove-icon${NotFade} .ri-bg`);
    var qHLLegs     = e.querySelectorAll(`.conn-highlight${NotFade} .hl-leg`);
    var qConnBacks  = e.querySelectorAll(`.conn .back`);
    var ucConnLegs  = o.addUCConn ? e.querySelectorAll(`.conn-leg.uc .leg`) : [];
    var ucConnBacks = o.addUCConn ? e.querySelectorAll(`.conn.uc .back`   ) : [];
    var posHL       = o.addUCConn && o.addPosHL &&
                      e.querySelector(`.pos-highlight${NotFade}`);

    qTerms.forEach(el => {
      var x = elStyleNum(el, 'left' );  if (x === undefined)  return;
      x1.push(x);
      var w = elStyleNum(el, 'width');  if (w === undefined)  return;
      x2.push(x + w);
    });
    qHLLegs.forEach(el => {
      var x = +el.getAttribute('x');
      x1.push(x);
      x2.push(x + +el.getAttribute('width'));
    });
    qConnBacks.forEach(el => {
      y1.push(+el.getAttribute('y1') - 0.5);
    });

    ucConnLegs.forEach(el => {
      y1 = [ ...y1, +el.getAttribute('y1'), // (Drawn vertical => no -0.5).
                    +el.getAttribute('y2') ];
    });
    ucConnBacks.forEach(el => {
      y1 = [ ...y1, +el.getAttribute('y1') - 0.5,
                    +el.getAttribute('y2') - 0.5 ];
    });
    if (posHL) {  // If the pos-hl is drawn for an UC-conn: it reaches to y=0.
      var     x = +posHL.getAttribute('x');
      x1.push(x);
      x2.push(x + +posHL.getAttribute('width'));
      y1.push(    +posHL.getAttribute('y'));  // Will be 0.
    }

    if (qRIBG)  y1.push(+qRIBG.getAttribute('y'));
    y1.push(o.contH - o.termsH);  // In case there are no conns.

    var h = qTerms.item(0);
    h = (h && h.style.height && +h.style.height.replace('px', '')) || o.termsH;
    y2.push(o.contH - o.termsH + h);

    return { x1: Math.min(...x1), x2: Math.max(...x2),
             y1: Math.min(...y1), y2: Math.max(...y2) };
  }


  // E.g. for element with style="left:3px" and key='left'/'aa' => 3/undefined.
  function elStyleNum(e, key) {
    return e.style[key] && +e.style[key] .replace('px', '')
  }


  function analyzeTermElem(e, o) {  // => { type, isEdit, isEnd, isFocal, x, w }
    var c    = classNames(e);
    var type = '';  // Will stay '' for the drag-placeholder.
    if (!c.includes('drag-placeholder') && !c.includes('ruler')) {
      type =  c.includes('ref') ? 'ref' :  // Note: classNames 'inst' and 'ref' co-occur.
        c.filter(s => [ 'inst', 'class', 'lit' ].includes(s)) [0] ||  'inst';
    }
    var qq={
      type,
      isEdit : c.includes('edit' ),
      isEnd  : c.includes('end'  ),
      isFocal: c.includes('focal'),
      x: c.includes('drag') ? o.dragPlhX : elStyleNum(e, 'left'),
      w: elStyleNum(e, 'width')
    };
    return qq;
  }


  function classNames(e) {
    return (e.getAttribute('class') || '') .split(/\s/);
  }


  function pointerClassName(e) {
    var c = classNames(e) .filter(s =>
      ['relation', 'object', 'list-relation', 'parent'].includes(s));
    return (c[0] || '').substring(0, 3);
  }



  function applyModifications() {
    /*
    // Add font glyph data.
    var glyphs = { 'a': '<glyph unicode="a" horiz-adv-x="..." d="..."/>', 'b': '' };
    usedChars.push('.');  // Always support manually adding a '...'.
    fontData = [
      '<font horiz-adv-x="2048">',
      '  <font-face font-family="Tahoma" units-per-em="2048"/>',
      '  <missing-glyph horiz-adv-x="2048" d="M256,0l0,1536l1536,0l0,-1536M384,128l1280,0l0,1280l-1280,0z"/>',
      '  _(to add here)_',
      ...[...new Set(usedChars)] .sort() .map(c => `  ${ glyphs[c] || '' }`),
      '</font>'
    ] .filter(c => c.trim()) .join('\n  ');
    s = s.replace(
      `  ${ FontDataTag }\n`,  usedChars.length ?  `  ${ fontData }\n`  : '');
    */
    return s;
  }




  // --- Data-inspection helpers, for use during development ---

  /**
   * If asked so in `opt`, will fill three HTML-elements with inspection data:
   * the generated SVG code as a figure, and as text (code), and the original HTML
   * from the vsm-box DOM-element.
   */
  function dataInspect(s, e, opt) {
    if (opt.svgInspect && opt.forDev) {
      var { elSVGFig, elSVGTxt, elSVGHtm } = opt.svgInspect;
      // Show the SVG as image and as text.
      elSVGFig.innerHTML = s;
      elSVGTxt.innerHTML = s
        ///.replace(/<style>[\s\S]*<\/style>\s*/, '') // Hide the long <style>-tag.
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/@font-face/g, '_font-face');  // No global @ff-interference.

      // Show browser-generated svg+html.
      elSVGHtm.innerHTML = formatXml( e.innerHTML
        .replace(/\s*<!---->\s*?/g, '')
        .replace(/ stroke-dasharray="none"/g, '')
        .replace(/ stroke-width: 1px;/g, '')
        .replace(/ data-v-[^=]{4,12}=""/g, '')
        .replace(/>\s*<\/(line|path|rect)\b>/g, '/>')
        .replace(/ nofade\b/g, '')
        .replace(/ focus\b/g, '')
        .replace(/ unselectable="on"/g, '')
        .replace(/ margin: 0px;/g, '')
        ).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    }
  }



  /**
   * Formats the HTML-code of a browser-generated vsm-box DOM-element
   * to make it better readable.
   */
  function formatXml(xml) {
    xml = xml.replace(/(<[a-z]+)>/g, '$1 >');
    var formatted = '', indent= '', tab = '  ';
    xml.split(/>\s*</).forEach(function(node) {
      if (node.match(/^\/\w/)) indent = indent.substring(tab.length); // indent--
      formatted += indent + '<' + node + '>\n';
      if (node.match(/^<?\w[^>]*[^\/]$/)) indent += tab;              // indent++
    });
    formatted = formatted.replace(/(<[a-z]+) >/g, '$1>');
    return formatted.substring(1, formatted.length - 2);
  }




  // --- Main part, calling all the above. ---

  var s = f.main(e, opt);
  s = applyModifications(s);
  dataInspect(s, e, opt);
  return s;
}
