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

  // First, handle requests that want an async response.
  if (opt.cb)  return setTimeout(() => {
    var svg = domToPureSVG(e, { ...opt, cb: null });
    opt.cb(svg);
  }, 0);


  const NotFade = ':not([class*="fade-leave"])';

  const SketchBoxNums = {  // Some values used for sketchBox-styling CSS.
    clw: 1.2,   // = 'conn-linewidth';
    tbw: 1.35,  // = 'term-borderwidth';
    dm : x => x.split(' ').map(x => round2(+x * 1.3)).join(' ') // =dash-multipl.
  }

  /* // Prep for font embedding & subsetting. But embedding is not consistently..
  const FontDataTag = '<<FontData>>';  // ..supported across current browsers &..
  var usedChars = [];                  // ..SVG-editors. So: disabled for now. */


  var f = decorateFs( defineFs() );

  var o = initOptions(e, opt);
  var s = f.main(o);
  if (o.tab == '')  s = s.replace(/<\/g>\n<g>/gm, '</g><g>');

  s = fillDataTags(s);
  dataInspect(s, e, o);

  return s;




  // --- Various helper functions.
  //     All wrapped inside domToPureSVG() to prevent global pollution. ---


  /**
   * Add default options in addition to those given in `opt`.
   * + Note: all options are automat. available in the decorated f.*()s: as `o`.
   * + Note: some of these values would ideally be derived from VsmBox/CSS;
   *   and some remain hard-coded in the f.*() for now.
   * + So this code uses some _default values_ of vsm-box, to output the SVG.
   */
  function initOptions(e, opt) {
    var isEmptyBox  = !e.querySelector('.terms .term:not(.ruler):not(.end)');
    var endTermText =
      (e.querySelector('.terms .term.end .label') || {}) .innerHTML ||
      (e.querySelector('.terms .term.end input' ) || {}) .value;
    var whiteBox = !!opt.whiteBox;
    return {
      useViewBox:     !opt.forDev,  // Use viewbox vs. width/height in <svg> tag.
      whiteBox:       whiteBox,
      addBorder:      !whiteBox,  // False=>zero border (even if DOM has 1px).
      addUCConn:      true,       // False=>won't add any shown under-constr-conn.
      addPosHL:       true,
      showRemoveIcon: true,       // False=>still added, but kept invisible.
      showTextCursor: false,      // False=>still added, but kept invisible.
      showMouse:      0,          // 0:hidden; 1:visible; 2:visible +click-stripes.
      borderW:        1,          // vsmBox's border-width.
      termsH:         17   + (!opt.sketchBox ? 0 : 3),  // (Excludes the fake..
      //              // ..white padding on top, that is part of TheConns panel).
      hRect:          14   + (!opt.sketchBox ? 0 : 3),
      fontSize:       11   + (!opt.sketchBox ? 0 : 3),
      txText:         3.5  + (!opt.sketchBox ? 0 : 0.3),
      tyText:         11.3 + (!opt.sketchBox ? 0 : 2.3),  ///11.2
      rxRect:         1.5  * (!opt.sketchBox ? 1 : 1.3),
      termsMarginTop: !opt.sketchBox ? 2 : 0,
      refConnDashArray: '2 1',   // (Chrome:'2 1' |FF:'2 1'     |'2.5 1.25').
      refTermDashArray: '2 1.5', // (Chrome:'2 1' |FF:'2.5 2.5' |'2.5 1.25').
      posFocalLine:   !opt.sketchBox ? {
        x1:   1 + 1.4  ,  // } 1   = rect border-width. 2 = twice.
        x2: - 2 - 1.4/2,  // } 1.7 = focal line stroke-width.
        y1: 2,  y2: 2
      } : {
        x1: (  1 + 1.4  ) * 1,
        x2: (- 2 - 1.4/2) * 1,
        y1: 1.5,  y2: 1.5
      },
      posTextCursor: { x1: 0,  x2: 0,  y1: 1.5,  y2: 12.5 +
        (!opt.sketchBox ? 0 : 3) },
      connsFill:     whiteBox ? 'ffffff' : 'fbfbfb',  ///(For debug: 'ffeeee':'fbfbfb').
      termsFill:     'ffffff',                        ///(For debug: 'ffe2e2').
      addEndTerm:    !whiteBox || isEmptyBox || endTermText,
      showEndTerm:   !!(isEmptyBox || endTermText),
      tab: '',       // E.g. '  ' indents with two spaces per deeper level.
      ...opt,
      e
    };
  }



  // - Define many functions that each generate a part of the SVG structure,
  //   and/or delegate parts to other functions. They can return String|Array.
  // - And then AUGMENT them with a decorator function.
  function defineFs() {
    var f = {};

    f.main = o => {
      var svg = o.e.querySelector('svg') || o.e;
      o.tx = 0;  // } 'translate-x' and 'translate-y': horizontal and vertical..
      o.ty = 0;  // } ..offset that the next called f.*() should apply.
      o.contW = +svg.getAttribute('width' );    // The content's width/height..
      o.contH = +svg.getAttribute('height') + o.termsH;  // ..excl. box-border.

      // In whiteBox-mode: shrink the viewport to the terms+conns+highlights
      // bounding-box, and shift the content into it. Draw no bkgr outside it!
      o.contBB = calcBoundingBox(o);  // ("contBB"=content bounding-box).

      var bw2  = o.addBorder ?  o.borderW * 2 :  0;
      var boxW = round2( o.contBB.x2 - o.contBB.x1 + bw2 );
      var boxH = round2( o.contBB.y2 - o.contBB.y1 + bw2 );
      var tags = (o.useViewBox ? ` viewBox="0 0 ${ boxW } ${          boxH }"` :
                                 ` width="${       boxW }" height="${ boxH }"`);

      return [
        `<svg${tags} xmlns="http://www.w3.org/2000/svg">`,
        `<desc>Created with https://vsm.github.io/demo</desc>`,
        ...indent(o, [
          f.style(o),  /// /* f.fontData(o), */
          f.box  (o)
        ]),
        '</svg>'
      ];
    };

    f.style = o => [
      '<style>',
      indent(o, f.styleData(o)),
      '</style>'
    ];


    f.styleData = o => {
      var s = `
     ${'rect, path, text { stroke: none; }'  /* For Inkscape-1.0.1's StrokeToPath */ }
        .box-border { stroke: #d3d9e5;  stroke-width: 1px;  fill: none; }
     ${ o.whiteBox ? '' :
       '.conns-fill { fill: #' + o.connsFill + '; } ' +
       '.terms-fill { fill: #' + o.termsFill + '; }' }
        .foot       { stroke: #b6b6b6; }  .foot.stub  { stroke: #cbcbcb; }
        .back, .leg { stroke: #7a7a7a; }  .obj, .par  { stroke: #7a7a7a;  fill: none; }
        .rel,  .lis { fill:   #7a7a7a; }
        .back.stub, .leg.stub, .obj.stub { stroke: #c3c3c3; }
        .rel.stub                        { fill:   #c3c3c3; }
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
        .r.focal    { stroke: #aaaaaa;  stroke-dasharray: 0.1 3.4;  stroke-width: 1.7px;  stroke-linecap: round; }
        .textcursor { stroke: #000000;  stroke-width: 1px; }
        .t          { font: 11px tahoma, sans-serif;  white-space: pre; }
        .t.inst, .t.ref { fill: #1c2a47; }
        .t.edit, .t.end { fill: #7a7a7a; }  .t.plac { fill: #aaaaaa; }
        .t.class        { fill: #2a2a05; }  .t.lit  { fill: #200505; }
        .mouse { stroke: #000000;  fill: #ffffff;  stroke-width: 0.5px; }
        .click { stroke: #000000;  fill: none;     stroke-width: 0.8px; }
      `;

      var _ = SketchBoxNums;
      s += !o.sketchBox ? '' : `
        /* sketch style */
        .box-border { stroke: #d8d8d8; }
        .back, .leg, .obj, .par { stroke: #000000;  stroke-width: ${_.clw}px; }
        .rel,  .lis             { fill:   #000000; }
        .back.stub, .leg.stub, .obj.stub { stroke: #eeeeee;  stroke-width: ${_.clw}px; }
        .rel.stub                        { fill:   #eeeeee; }
        .foot.stub  { stroke: #f2f2f2;  stroke-width: ${_.clw}px; }
        .back.ref, .leg.ref, .foot.ref { stroke-dasharray: ${_.dm(o.refConnDashArray)}; }
        .r.ref-bord { stroke-dasharray: ${_.dm(o.refTermDashArray)}; }
        .r.focal    { stroke-dasharray: 0.1 4;  stroke-width: 2px; }
        .r { stroke-width: ${_.tbw}px; }
        .r.class, .r.lit { fill: none; }
        .r.ref-bord { stroke: #000000; }
        .t { font: 14px arial; }
        .t.inst, .t.ref, .t.class, .t.lit { fill: #000000; }
        .t.edit, .t.end { fill: #aaaaaa; }
      `;

      /* s += `
        @font-face { font-family: 'Tahoma';  font-weight: normal;  font-style: normal;
          src: local('Tahoma'),  local('WineTahoma'),  url('https://vsm.github.io/font/wine-tahoma.woff') format('woff'); }
        @font-face { font-family: 'Tahoma';  font-weight: bold;  font-style: normal;
          src: local('Tahoma Bold'), local('Verdana Bold'); }
      `;  */

      s += `
        .hide, .r.end.hide { stroke: none; fill: none; }
      `;

      return s.trim() .split(/\r?\n\s*/g) .map(s => s.replace(/ {2,}/g, ' '));
    },


    /*
    f.fontData = o => FontDataTag; // Will be replaced w encountered-glyphs data.
    */

    f.box = o => {
      var oPlus = {  // (This will be merged with `o` by the decorator).
        connsH: o.contH - o.termsH,  // This *includes* the 'fake' white margin..
                    // ..above the terms (where a conn-highlight may reach into).
        ...(o.addBorder && trp(o, 1, 1)),
        ...(o.whiteBox  && trp(o, -o.contBB.x1, -o.contBB.y1))
      };

      var a = [];              // Line below: `s`: querySelector relative to `e`.
      if (o.addBorder)  a.push(f.border({ s: 'rect' }));  // No `oPlus` here.
      if (!o.whiteBox)  a.push(f.backgrounds(oPlus));
      a = group(o, a);

      return a.concat([
        f.posHL      ({ ...oPlus,  s: `.pos-highlight${NotFade}` }),
        f.hl         ({ ...oPlus,  s: `.conn-highlight${NotFade}` }),
        f.conns      ({ ...oPlus,  s: `.conns` }),
        f.removeIcon ({ ...oPlus,  s: `.conn-remove-icon${NotFade}` }),
        f.terms      ({ ...oPlus,  s: `.terms` }),
        f.mouse      (oPlus)
      ]);
    };

    f.border = o =>
      rect(o, 'box-border', {
        x: o.borderW/2,  w: o.contW + o.borderW,
        y: o.borderW/2,  h: o.contH + o.borderW });

    f.backgrounds = o => {
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
        rect(o, 'conns-fill',
          { x: cut.left,  y: cut.top,   w: trimmedW,  h: termsBgY - cut.top }) );
      arr.push(
        rect(o, 'terms-fill',
          { x: cut.left,  y: termsBgY,  w: trimmedW,  h: termsBgH }) );
      return arr;
    };

    f.posHL = o =>
      !o.addUCConn || !o.addPosHL ?  '' :
        rect(o, 'pos-hl', { y: 0,  h: o.connsH });  // Other coos: auto-filled.

    f.hl = o => group(o, [
      f.hlBackTop ({ s: '.hl-back-top'               } ),
      f.hlLeg     ({ s: '.hl-leg'      ,  many: true } ),
      f.hlLegUnder({ s: '.hl-leg-under',  many: true } ),
    ]);

    f.hlBackTop  = o => path(o, 'hl-back-top' );
    f.hlLeg      = o => rect(o, 'hl-leg'      );
    f.hlLegUnder = o => rect(o, 'hl-leg-under');

    f.conns = o =>  f.conn({ s: '.conn',  many: true });

    f.conn = o => {
      var oPlus = {
        ref    : classNames(o.e).includes('r') ?  ' ref' :  '',
        ucLegNr: !o.e.querySelector('.conn-leg.uc') ?  -1 :
                  o.e.querySelectorAll('.conn-leg').length - 1
      };
      return group(o, [
        f.back          ({ ...oPlus,  s: '.back',      many:  true }),
        f.legFootPointer({ ...oPlus,  s: '.conn-leg',  many:  true }),
        f.stubs         (oPlus)
      ]);
    };

    f.back = o => line(o,
      `back${ o.ref }${ classNames(o.e).includes('two') ? ' two' : '' }`);

    f.legFootPointer = o => {
      var uc = o.ucLegNr == o.nr ? ' uc' : '';
      return [
        f.foot   ({ uc,  s: '.foot',  many: true }),
        f.leg    ({ uc,  s: '.leg'               }),
        f.pointer({ uc,  s: '.pointer'           }),
      ];
    };

    f.foot    = o => line(o, `foot${ o.ref }${ o.uc }`);
    f.leg     = o => line(o, `leg${  o.ref }${ o.uc }`);
    f.pointer = o => path(o, `${ pointerClassName(o.e) }${ o.uc }`);

    f.stubs = o => [
      f.stubBack   ({ s: '.stub-back'    }),
      f.stubFoot   ({ s: '.stub-foot'    }),
      f.stubLeg    ({ s: '.stub-leg'     }),
      f.stubPointer({ s: '.stub-pointer' })
    ];

    f.stubBack    = o => line(o, 'back stub');
    f.stubFoot    = o => line(o, 'foot stub');
    f.stubLeg     = o => line(o, 'leg stub' );
    f.stubPointer = o => path(o, `${ pointerClassName(o.e) } stub`);

    f.removeIcon = o => {
      var hide = o.showRemoveIcon && !o.sketchBox ?  '' : ' hide';
      return group(o, [
        f.riBg({ s: '.ri-bg',  hide }),
        f.riFg({ s: '.ri-fg',  hide }),
      ]);
    };

    f.riBg = o =>
      rect(o, `ri-bg${ o.hide }`, { rx: '~' });

    f.riFg = o => {   // Also split path parts: better for Illustrator.
      var d    = o.e.getAttribute('d') || '';
      var dArr = d.match(/M[^M]+/g) || [d];
      return dArr.map(d =>  path(o, `ri-fg${ o.hide }`, { d }) );
    };

    f.terms = o => {
      var oPlus = {
        s   : '.term:not(.ruler)' + (!o.addEndTerm ? ':not(.end)' : ''),
        tx  : o.tx + 0.5,
        ty  : o.ty + 0.5 + o.connsH,
        many: true
      };
      // Prepare to possibly place a dragged term at its placeholder's position.
      var x = o.e.querySelector('.drag-placeholder');
      if (x  &&  (x = elStyleNum(x, 'left')) !== undefined)  oPlus.dragPlhX = x;
      return f.term(oPlus);
    };

    f.term = o => group(o, [
      f.termRect(o),
      f.termText( trp(o, o.txText, o.tyText) ),
    ]);

    f.termRect = o => {
      var { type, isEdit, isEnd, isFocal, x, w } = analyzeTermElem(o);
      if (!type || !w || x===undefined)  return ''; // drag-placeholder->type=''.
      var c = type +
        (isEdit ? ' edit' : '') +
        (isEnd  ? ' end'  : '') +  (isEnd && !o.showEndTerm  ? ' hide'  : '');
      var sRect = rect(o, `r ${c}`, { x,  y: '',  w: w - 1,  h: o.hRect,
        rx: o.rxRect });
      var a = [];
      if (
        !(type == 'ref'  &&  isEdit)  &&
        (!o.sketchBox  ||  ['class', 'lit'].includes(type)  ||  isEdit)
      ) {
        a.push(sRect);
      }
      if (type == 'ref')  a.push(  // Extra element: for ref-term border.
        sRect.replace(/\bref\b/, 'ref-bord')
      );
      if (isFocal) { // Extra element: for focal term.
        a.push(line(o, 'r focal', { ...o.posFocalLine,
          x1: x     + o.posFocalLine.x1,
          x2: x + w + o.posFocalLine.x2,
        }));
      }
      if (o.e.querySelector('input')) {
        a.push(  f.textCursor( trp(o, x + 4, 0)  )  );
      }
      return a;
    };

    f.textCursor = o =>
      line(o,  `textcursor${ o.showTextCursor ?  '' : ' hide'}`, o.posTextCursor);


    f.termText = o => {
      var { type, isEdit, isEnd, isFocal, x, w } = analyzeTermElem(o);
      if (!type || !w || x === undefined)  return '';
      var c = isEdit ? 'edit' :  isEnd ? 'end' :  type;
      var q, s;

      if ((q = o.e.querySelector('.label'))  &&  (s = q.innerHTML)) {
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
                }${        _.t ?  ' font-size="' + round1(o.fontSize*f)+'"' : ''
                }${       dTot ?  ' dy="'        + round1(dTot) + '"' :  ''
                }>${ p }</tspan>`
              );
              _.dp = d;
            }
          });
          s = b.join('');
        }
      }

      // If <input> with text, show that instead (corresp. to edit-terms' label).
      if (q = o.e.querySelector('input')) {
        if (q.value)  s = q.value;
        else if (q = o.e.querySelector('.placehold')) {
          s = q.innerHTML;
          c = 'plac';
        }
      }

      s = !s ?  '' :  text(o, `t ${c}`, { x,  w: w - 1 }) + s + '</text>';
      /* usedChars = [...usedChars, ...s.replace(/<.+?>/g,'').split('')]; */

      // Add newlines and indentation, without whitespace between tspans.
      s = s .replace(/>([^<]*)<tspan /g, `\n${ o.tab }>$1<tspan `);

      return s;
    };


    f.mouse = o => {
      // Add mouse + click-stripes, if a pos- or conn-highlight is shown.
      // Position it relative to pos- or conn-hl's top-right corner.
      var hl =
        ( o.addUCConn && o.addPosHL ?
          o.e.querySelector(`.pos-highlight${NotFade}`) :  0 ) ||
        o.e.querySelector(`.conn-remove-icon${NotFade} .ri-bg`);
      if (!hl)  return '';

      var x2 = +hl.getAttribute('x') + +hl.getAttribute('width');
      var y1 = +hl.getAttribute('y');
      o      = { ...o,  ...trp(o, x2 - 19, y1 + 4) };
      var mc = 'mouse' + (o.showMouse      ?  '' : ' hide');
      var cc = 'click' + (o.showMouse == 2 ?  '' : ' hide');
      return group(o, [
        path(o, mc, { d: 'M7.15 7.2 v15.25 l3.35 -3.35 ' +
          'l2.15 5.2 l2.45 -1.25 l-2.15 -4.85 l4.9 -0.35 Z' }),
        ...group(o, [
          line(o, cc, { x1:  4   , y1: 5   , x2: 1.55 , y2: 2.8 }),
          line(o, cc, { x1:  3.15, y1: 8.35, x2: 0    , y2: 9.3 }),
          line(o, cc, { x1: 10.3 , y1: 5   , x2: 12.75, y2: 2.8 }),
          line(o, cc, { x1: 11.15, y1: 8.35, x2: 14.3 , y2: 9.3 }),
          line(o, cc, { x1:  7.15, y1: 3.3 , x2:  7.15, y2: 0   })
        ])
      ]);
    };

    return f;
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
  function decorateFs(f) {
    var oStack = [];  // Each nested call adds its so-far accumulated `o` here.
    var lastO  = () => oStack.slice(-1)[0];

    Object.keys(f).forEach(key => {
      var origFunc = f[key];

      f[key] = o => {
        // Merge parent-f.x's + own new options `o`. And enable nested f.* calls
        // to use these (+ some decorator-made resets) as their own parent-`o`.
        o = { ...lastO(),  ...o };
        var e = o.e;

        // Multiply and combine calls, for `o.many`. Keep only non-empties.
        if (e && o.many && o.s) {
          var a = [];
          e.querySelectorAll(o.s) .forEach((e, i) => {
            Object.assign(o,  { s: '',  many: false,  e,  nr: i });
            oStack.push(o);
            var s = f[key](o);
            if (s)  a.push(s);
            oStack.pop();
          });
        }

        else {
          // Move on to a child Node.
          if (e && o.s) {
            e = e.querySelector(o.s);
            if (!e)  return '';
          }

          // Call original function.  Make the result an Array, without empties.
          Object.assign(o,  { s: '', e });
          oStack.push(o);
          a = origFunc(o);
          a = makeProperTagArray(a);
          oStack.pop();
        }

        return a.join('\n');
      };

    });

    return f;
  }



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
  function rect(o, c, coos) {
    return shape('rect', o, c, {  x:'~',  y:'~',  w:'~',  h:'~', ...coos });
  }
  function line(o, c, coos) {
    return shape('line', o, c, { x1:'~', y1:'~', x2:'~', y2:'~', ...coos });
  }
  function path(o, c, coos) {
    return shape('path', o, c, { d: '~', ...coos });
  }
  function text(o, c, coos) {
    return shape('text', o, c, { x: '~', y: '~', w: '~', ...coos } , '>');
  }


  // Creates a <rect>, <line>, etc SVG-tag.
  function shape(tagName, o, classNames, coos, end) {  // E.g. `coos={x,y,..}`.
    // For the coordinates(`coos`)'s keys x/y/w/h/x1/y1/x2/y2/rx/d/_:
    // - replace any '~' value by `e`'s corresp. attribute, e.g. y2:'~'<--y2="..",
    // - tx/ty-shift all values,  - clean up `d` values.
    var round = round2;

    var coosStr =  // (Line 1+2 below create a standard ordering for coos' keys).
      ['x', 'y', 'w', 'h', 'x1', 'y1', 'x2', 'y2', 'rx', 'd']
      .filter(k => coos[k] !== undefined)
      .map   (k => {
        let v = coos[k];
        k = k == 'w' ? 'width' :  k == 'h' ? 'height' :  k;
        v = v == '~' ? o.e.getAttribute(k) :  v == '' ? 0 :  v;
        v =
          ['x', 'x1', 'x2'].includes(k) ?  +v + o.tx :
          ['y', 'y1', 'y2'].includes(k) ?  +v + o.ty :
          'd' == k ?  v         // E.g. `v = 'M114 88.28 L117.5 93 L121 88.28'`.
            .replace( /([LM]) ?(-?\d+(?:\.\d+)?),?\s*(-?\d+(?:\.\d+)?)/g,
              ($0, c, x, y) => `${ c }${ +x + o.tx } ${ +y + o.ty }` )
            .replace( /([HV]) ?(-?\d+(?:\.\d+)?)/g,
              ($0, c, n)    => `${ c }${ +n + (c=='H' ? o.tx : o.ty) }` )
            .replace(/-?\d+\.\d\d\d+/g,
              n => round(n) )                  // E.g. '1.8000000001' -> '1.8'.
            .replace(/(\d)([A-Z])/gi, '$1 $2')  // E.g. '..1L..' -> '..1 L..'.
            .replace(/([A-Z]) /gi, '$1') :  v;  // E.g. 'M 1' -> 'M1'.
        if (k != 'd')  v = round(v);
        return `${ k }="${ v }"`;
      })
      .join(' ');
    return `<${ tagName } class="${ classNames }" ${ coosStr }${ end || '/>' }`;
  }


  function round1(num)  { return Math.round(num * 10 ) / 10 ; }
  function round2(num)  { return Math.round(num * 100) / 100; }



  function calcBoundingBox(o) {
    if (!o.whiteBox || o.addBorder){
      return { x1: 0, y1: 0, x2: o.contW, y2: o.contH };  // Content's bndn.-box.
    }

    var x1 = [];  // min(x of leftmost termRect; x of leftmost hlLeg).
    var x2 = [];  // max(left + w of rightmost termRect; x+w of rightm hlLeg).
    var y1 = [];  // min(y1 of highest conn-back -0.5; y1 of highest hl (=y1..
                  // ..of its removeIcon); y1/y2 of uc-conn-leg).
    var y2 = [];  // top of terms + height of a termRect.

    var e = o.e;
    var sTerms      = '.terms .term:not(.ruler):not(.drag)' +
      (!o.addEndTerm ? ':not(.end)' : '');  // (Includes .drag-placeholder).
    var qTerms      = e.querySelectorAll(sTerms);
    var qRIBG       = e.querySelector   (`.conn-remove-icon${NotFade} .ri-bg`);
    var qHLLegs     = e.querySelectorAll(`.conn-highlight${NotFade} .hl-leg`);
    var qConnBacks  = e.querySelectorAll(`.conn .back`);
    var ucConnLegs  = o.addUCConn ? e.querySelectorAll(`.conn-leg.uc .leg`) : [];
    var ucConnBacks = o.addUCConn ? e.querySelectorAll(`.conn.uc .back`   ) : [];
    var posHL       = o.addUCConn && o.addPosHL &&
                      e.querySelector(`.pos-highlight${NotFade}`);


    // If sketchBox style: adjust for extra conn-linewidth and term-borderwidth.
    var connLinePlus = o.sketchBox ?  (SketchBoxNums.clw - 1) /2 :  0;

    var termBorderPlus = el =>
      !o.sketchBox ?  0 :     // Next line: 'Sketch-styled elem has border?':
      classNames(el).filter(s => ['class', 'lit', 'ref', 'edit'].includes(s))
        .length ?  (SketchBoxNums.tbw - 1) /2 :
      -1;  // Also adjust for the absent default 1px border.

    var anyTermBorderPlus = -1;


    qTerms.forEach(el => {
      var x = elStyleNum(el, 'left' );  if (x === undefined)  return;
      var b = termBorderPlus(el);
      anyTermBorderPlus = Math.max(anyTermBorderPlus, b);
      x1.push(x - b);
      var w = elStyleNum(el, 'width');  if (w === undefined)  return;
      x2.push(x + w + b);
    });
    qHLLegs.forEach(el => {
      var x = +el.getAttribute('x');
      x1.push(x);
      x2.push(x + +el.getAttribute('width'));
    });
    qConnBacks.forEach(el => {
      y1.push(+el.getAttribute('y1') - 0.5 - connLinePlus);
    });

    ucConnLegs.forEach(el => {
      y1 = [ ...y1, +el.getAttribute('y1'), // (Drawn vertical => no -0.5).
                    +el.getAttribute('y2') ];
    });
    ucConnBacks.forEach(el => {
      y1 = [ ...y1, +el.getAttribute('y1') - 0.5 - connLinePlus,
                    +el.getAttribute('y2') - 0.5 - connLinePlus ];
    });
    if (posHL) {  // If the pos-hl is drawn for an UC-conn: it reaches to y=0.
      var     x = +posHL.getAttribute('x');
      x1.push(x);
      x2.push(x + +posHL.getAttribute('width'));
      y1.push(    +posHL.getAttribute('y'));  // Will be 0.
    }

    if (qRIBG)  y1.push(+qRIBG.getAttribute('y'));
    y1.push(o.contH - o.termsH - anyTermBorderPlus);  // In case of no conns.

    var h = qTerms.item(0);
    h = (h && h.style.height && +h.style.height.replace('px', '')) || o.termsH;
    y2.push(o.contH - o.termsH + h + anyTermBorderPlus);

    return { x1: round2(Math.min(...x1)), x2: round2(Math.max(...x2)),
             y1: round2(Math.min(...y1)), y2: round2(Math.max(...y2)) };
  }


  // E.g. for element with style="left:3px", and key='left'/'aa': => 3/undefined.
  function elStyleNum(e, key) {
    return e.style[key] && +e.style[key] .replace('px', '')
  }


  function analyzeTermElem(o) {  // Returns: {type, isEdit, isEnd, isFocal, x, w}.
    var c    = classNames(o.e);
    var type = '';  // Will stay '' for the drag-placeholder.
    if (!c.includes('drag-placeholder') && !c.includes('ruler')) {
      type =  c.includes('ref') ? 'ref' :  // Note: classNames 'inst' and 'ref' co-occur.
        c.filter(s => [ 'inst', 'class', 'lit' ].includes(s)) [0] ||  'inst';
    }
    return {
      type,
      isEdit : c.includes('edit' ),
      isEnd  : c.includes('end'  ),
      isFocal: c.includes('focal'),
      x: c.includes('drag') ? o.dragPlhX : elStyleNum(o.e, 'left'),
      w: elStyleNum(o.e, 'width')
    };
  }


  function classNames(e) {
    return (e.getAttribute('class') || '') .split(/\s/);
  }


  function pointerClassName(e) {
    var c = classNames(e) .filter(s =>
      ['relation', 'object', 'list-relation', 'parent'].includes(s));
    return (c[0] || '').substring(0, 3);
  }



  function fillDataTags() {
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
   * 1) the generated SVG code as a figure, 2) the generated SVG as text (code),
   * and 3) the original HTML from the vsm-box DOM-element.
   */
  function dataInspect(s, vsmBoxEl, opt) {
    if (opt.svgInspect && opt.forDev) {
      var { elSVGFig, elSVGTxt, elSVGHtm } = opt.svgInspect;
      // Show the SVG as image and as text.
      elSVGFig.innerHTML = s;
      elSVGTxt.innerHTML = s
        ///.replace(/<style>[\s\S]*<\/style>\s*/, '') // Hide the long <style>-tag.
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/@font-face/g, '_font-face');  // No global @f-f interference.

      // Show browser-generated svg+html.
      elSVGHtm.innerHTML = formatXml( vsmBoxEl.innerHTML
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
}
