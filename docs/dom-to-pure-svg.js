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
function domToPureSVG(e, opt, cb) {
  opt = opt || {};


  const NotFade = ':not([class*="fade-leave"])';


  var f = decorateFs( defineFs() );

  var o = initOptions(e, opt);
  var styleEntries = [];

  var s = f.main(o);
  s     = fillStyleEntries(s);
  if (o.tab == '')  s = s.replace(/<\/g>\n<g>/gm, '</g><g>');


  /* if (o.outline && window.SVGO) {  // (For if a 'svgo.min.js' is available).
    return (new SVGO({  full: true,  precision: 2,
      multipass: true,  js2svg: { pretty: true, indent: 0 },  plugins: [
        { removeDesc: false }, { mergePaths: false }, { collapseGroups: false },
        { convertShapeToPath: true }, { convertEllipseToCircle: true },
        { cleanupListOfValues: true }, { inlineStyles:{onlyMatchedOnce: false}},
        { convertPathData: { noSpaceAfterFlags: false } }, ///{sortAttrs: true},
        { convertStyleToAttrs: true }, { removeDimensions: o.useViewBox } ]  })
    ).optimize(s).then(res => { s = res.data;  dataInspect(s, e, o);  cb(s); });
  } */


  dataInspect(s, e, o);
  cb(s);




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
    opt = {
      useViewBox:     !opt.forDev,  // Use viewbox vs. width/height in <svg> tag.
      whiteBox:       whiteBox,
      addBorder:      !whiteBox,  // False=>zero border (even if DOM has 1px).
      addUCConn:      true,       // False=>won't add any shown under-constr-conn.
      addPosHL:       true,
      showRemoveIcon: true,       // False=>still added, but kept invisible.
      showTextCursor: false,      // False=>still added, but kept invisible.
      showMouse:      0,          // 0:hidden; 1:visible; 2:visible +click-stripes.
      outline:        true,       // Output text etc. as paths; if fonts loaded.
      borderW:        1,          // vsmBox's border-width.
      termsH:         17   + (!opt.sketchBox ? 0 : 3  ),  // (Excludes the fake..
      //              // ..white padding on top, that is part of TheConns panel).
      hRect:          14   + (!opt.sketchBox ? 0 : 3  ),
      fontSize:       11   + (!opt.sketchBox ? 0 : 3  ),
      txText:         3.5  + (!opt.sketchBox ? 0 : 0.3),
      tyText:         11.3 + (!opt.sketchBox ? 0 : 2.3),  ///11.2
      rxRect:         1.5  * (!opt.sketchBox ? 1 : 1.3),
      termsMarginTop: !opt.sketchBox ? 2 : 0,
      refConnDashArray: [2, 1  ],  // (Chrome:2 1 |FF:2 1     |2.5 1.25).
      refTermDashArray: [2, 1.5],  // (Chrome:2 1 |FF:2.5 2.5 |2.5 1.25).
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
      connLineWidth: 1 + (!opt.sketchBox ? 0 : 0.2 ),
      termLineWidth: 1 + (!opt.sketchBox ? 0 : 0.35),
      dashArrayMult: 1 + (!opt.sketchBox ? 0 : 0.3 ),  // Dash/gap-length multiplier.
      connsFill:     whiteBox ? '#fff' : '#fbfbfb',  ///(For debug: '#ffeeee':'#fbfbfb').
      termsFill:     '#fff',                         ///(For debug: '#ffe2e2').
      addEndTerm:    !whiteBox || isEmptyBox || endTermText,
      showEndTerm:   !!(isEmptyBox || endTermText),
      tab:           '',  // E.g. '  ' indents with two spaces per deeper level.
      ...opt,
      e
    };

    opt.styleMaps = initStyleData(opt);
    return opt;
  }


  /**
   * This prepares for generating CSS-styling output that uses simple,
   * single CSS-classes. (Esp. because LibreOffice can not process CSS-class
   * combinations like '.r.inst'; it needs to be one class like '.r-inst').
   *
   * Here, most CSS-styling values are defined in `styleVals`, which
   * are then used to populate a CSS-like data structure `styleMaps`, which
   * `addStyleEntry()` will use to derive real CSS data (for the <style>-section)
   * when asked to by `cssStr()` (which is called for each generated SVG-tag);
   * afterwards, `fillStyleEntries()` will insert this data into <style></style>.
   */
  function initStyleData(o) {
    var none = 'none';
    var dashMult = arr => (arr||[]).map(v => round2(+v * o.dashArrayMult));
    var styleVals = {
      boxBord  : '#d3d9e5'  ,   boxBordLW: o.borderW,
      connsFill: o.connsFill,   termsFill: o.termsFill,
      connLW   : o.connLineWidth,  termLW: o.termLineWidth,
      conn     : '#7a7a7a',
      connFoot : !o.whiteBox ? '#b6b6b6' : '#d4d4d4',
      stub     : !o.whiteBox ? '#c3c3c3' : '#c8c8c8',
      stubFoot : !o.whiteBox ? '#cbcbcb' : '#d0d0d0',
      uc       : '#2e48ff',  ucFoot  : '#e6e6e6',  ucOpac: '0.56',
      refConnDA: dashMult(o.refConnDashArray),
      refTermDA: dashMult(o.refTermDashArray),
      hl       : '#e5e9fb',  hlLight: '#f0f4fb',
      riFg     : '#aabcce',  riFgHl : '#fff',  riFgLW: 2,            // riFgPress: '#fff'   ,
      riBgHl   : '#7491ab',                               // riBg: '',  riBgPress: '#446d9c',
      refFill  : '#e2e6f0',  refBord: '#b1bed8',  refBordEdi: '#c4c4c4',  refText: '#1c2a47',
      insFill  : '#e2e6f0',  insBord: '#b1bed8',  insBordEdi: '#c4c4c4',  insText: '#1c2a47',
      clsFill  : '#f9f2b9',  clsBord: '#e5c547',  clsBordEdi: '#ebd262',  clsText: '#2a2a05',
      litFill  : '#f0e2e6',  litBord: '#d8b1ba',  litBordEdi: '#e1c2c7',  litText: '#200505',
      ediText  : '#7a7a7a',  plcText: '#aaa'   ,  insBordEnd: '#f0f0f0',
      focal    : '#aaa'   ,  focalDA: [0.1, 3.4],  focalLW: 1.7,  focalLC: 'round',
      termFont : `${ o.fontSize }px tahoma, sans-serif`,
      termTA   : '',  ediTextTA: ''
    }

    if (o.sketchBox) {
      Object.assign(styleVals, {
        boxBord : '#d8d8d8',
        conn    : '#000',
        stub    : '#eee',  stubFoot: '#f2f2f2',
        refFill : none,  refBord: '#000'   ,  refText: '#000',
        insFill : none,  insBord: none     ,  insText: '#000',  ediText: '#aaa',
        clsFill : none,  clsBord: '#e5c547',  clsText: '#000',
        litFill : none,  litBord: '#d8b1ba',  litText: '#000',
        focalDA : [0.1, 4],  focalLW: 2,
        termFont: `${ o.fontSize }px arial`,  termTA: 'middle'
      });
    }

    var _ = styleVals;

    var styleMaps = [
      { t: 'rect',         v: { stroke:   none } },  // Makes Inkscape-1.0.1's..
      { t: 'path',         v: { stroke:   none } },  // ..StrokeToPath..
      { t: 'text',         v: { stroke:   none } },  // ..not draw black borders.
      { c: 'box-border',   v: { stroke: _.boxBord, 'stroke-width': _.boxBordLW, fill: none } },
      { c: 'conns-fill',   v: { fill  : _.connsFill } },
      { c: 'terms-fill',   v: { fill  : _.termsFill } },
      { c: 'foot',         v: { stroke: _.connFoot, 'stroke-width': _.connLW } },
      { c: 'foot stub',    v: { stroke: _.stubFoot, 'stroke-width': _.connLW } },
      { c: 'back',         v: { stroke: _.conn, 'stroke-width': _.connLW } },
      { c: 'leg',          v: { stroke: _.conn, 'stroke-width': _.connLW } },
      { c: 'obj',          v: { stroke: _.conn, 'stroke-width': _.connLW, fill: none } },
      { c: 'par',          v: { stroke: _.conn, 'stroke-width': _.connLW, fill: none } },
      { c: 'rel',          v: { fill  : _.conn, 'stroke-width': _.connLW } },
      { c: 'lis',          v: { fill  : _.conn, 'stroke-width': _.connLW } },
      { c: 'back stub',    v: { stroke: _.stub } },
      { c: 'leg stub',     v: { stroke: _.stub } },
      { c: 'obj stub',     v: { stroke: _.stub } },
      { c: 'rel stub',     v: { fill  : _.stub } },
      { c: 'uc',           v: { opacity: _.ucOpac } },
      { c: 'obj uc',       v: { stroke: _.uc } },
      { c: 'par uc',       v: { stroke: _.uc } },
      { c: 'leg uc',       v: { stroke: _.uc } },
      { c: 'rel uc',       v: { fill  : _.uc } },
      { c: 'lis uc',       v: { fill  : _.uc } },
      { c: 'foot uc',      v: { stroke: _.ucFoot, opacity: '' } },
      { c: 'back ref',     v: { 'stroke-dasharray': _.refConnDA } },
      { c: 'leg ref',      v: { 'stroke-dasharray': _.refConnDA } },
      { c: 'foot ref',     v: { 'stroke-dasharray': _.refConnDA } },
      { c: 'pos-hl',       v: { fill  : _.hlLight } },
      { c: 'hl-leg-under', v: { fill  : _.hlLight } },
      { c: 'hl-back-top',  v: { fill  : _.hl } },
      { c: 'hl-leg',       v: { fill  : _.hl } },
      { c: 'ri-fg',        v: { stroke: _.riFg, 'stroke-width': _.riFgLW } },
      { c: 'ri-fg hl',     v: { stroke: _.riFgHl } },
      { c: 'ri-bg',        v: { fill  :   none } },
      { c: 'ri-bg hl',     v: { fill  : _.riBgHl } },
      { c: 'r',            v: { 'stroke-width': _.termLW } },
      { c: 'r ref',        v: { stroke: _.refFill, fill: _.refFill } },
      { c: 'r ref-bord',   v: { stroke: _.refBord, fill:   none, 'stroke-dasharray': _.refTermDA } },
      { c: 'r ref-bord edit',v:{stroke: _.refBordEdi } },
      { c: 'r inst',       v: { stroke: _.insBord, fill: _.insFill } },
      { c: 'r inst edit',  v: { stroke: _.insBordEdi } },
      { c: 'r class',      v: { stroke: _.clsBord, fill: _.clsFill } },
      { c: 'r class edit', v: { stroke: _.clsBordEdi } },
      { c: 'r lit',        v: { stroke: _.litBord, fill: _.litFill } },
      { c: 'r lit edit',   v: { stroke: _.litBordEdi } },
      { c: 'r edit',       v: { fill  :   none } },
      { c: 'r ref edit',   v: { stroke:   none } },
      { c: 'r inst end',   v: { stroke: _.insBordEnd } },
      { c: 'r focal',      v: { stroke: _.focal, 'stroke-dasharray': _.focalDA,
                                'stroke-width': _.focalLW, 'stroke-linecap': _.focalLC } },
      { c: 'tt',           v: { font  : _.termFont , 'white-space': 'pre', 'text-anchor': _.termTA } },
      { c: 'tt ref',       v: { fill  : _.refText } },
      { c: 'tt inst',      v: { fill  : _.insText } },
      { c: 'tt class',     v: { fill  : _.clsText } },
      { c: 'tt lit',       v: { fill  : _.litText } },
      { c: 'tt plac',      v: { fill  : _.plcText, 'text-anchor': _.ediTextTA } },
      { c: 'tt edit',      v: { fill  : _.ediText, 'text-anchor': _.ediTextTA } },
      { c: 'tt end',       v: { fill  : _.ediText } },
      { c: 't ref',        v: { fill  : _.refText } },
      { c: 't inst',       v: { fill  : _.insText } },
      { c: 't class',      v: { fill  : _.clsText } },
      { c: 't lit',        v: { fill  : _.litText } },
      { c: 't plac',       v: { fill  : _.plcText } },
      { c: 't edit',       v: { fill  : _.ediText } },
      { c: 't end',        v: { fill  : _.ediText } },
      { c: 'textcursor',   v: { stroke: '#000', 'stroke-width': 1 } },
      { c: 'mouse',        v: { stroke: '#000', fill: '#fff', 'stroke-width': 0.5 } },
      { c: 'click',        v: { stroke: '#000', fill: none  , 'stroke-width': 0.8 } },
      { c: 'hide',         v: { stroke: none  , fill: none  , 'stroke-width': '' } },
    ];

    // Convert all `c`'s into Arrays (for easy calculation later).
    styleMaps.forEach(o => o.c && ( o.c = o.c.split(' ') ));

    return styleMaps;
  }



  // - Define many functions that each generate a part of the SVG structure,
  //   and/or delegate parts to other functions. They can return String|Array.
  // - These will still be AUGMENTed with the decorator function `decorateFs()`.
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
          f.style(o),
          f.box  (o)
        ]),
        '</svg>'
      ];
    };


    f.style = o => '<style></style>',  // (Will be filled in at the end).


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
      f.termRect(),
      f.termText( trp(o, o.txText, o.tyText) ),
    ]);

    f.termRect = o => {
      var { type, isEdit, isEnd, isFocal, x, w } = analyzeTermElem(o);
      if (!type || !w || x===undefined)  return ''; // drag-placeholder->type=''.
      var c = type +
        (isEdit ? ' edit' : '') +
        (isEnd  ? ' end'  : '') +  (isEnd && !o.showEndTerm  ? ' hide'  : '');
      var coos = { x,  y: '',  w: w - 1,  h: o.hRect, rx: o.rxRect };
      var a = [];
      if (
        !(type == 'ref'  &&  isEdit)  &&
        (!o.sketchBox  ||  ['class', 'lit'].includes(type)  ||  isEdit)
      ) {
        a.push(rect(o, `r ${c}`, coos));
      }
      if (type == 'ref') {  // Extra element: for ref-term border.
        // (Note: calling `rect()` again also adds a `styleEntries` elem. for it).
        a.push(rect(o, `r ${ c.replace(/\bref\b/, 'ref-bord') }`, coos));
      }
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
      var center =   // Boolean: to center sketchBox-styled text-labels.
        o.sketchBox  &&  !intersect(c.split(' '), ['edit', 'plac']) .length;

      var arr = [];  // Intermediary data-object. It will enable us to generate
        // either <tspan>-elements or corresponding <path>-elements. Format:
        // `{b:bold, i:italic, f:fontSize, dy:offsetY, s:stringPart}`.

      w -= 1 + 2 * o.txText;  // Adjust for text-label padding.
      x += center ?  w / 2 :  0;

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
              arr.push({
                b : _.b,
                i : _.i,
                f : _.t  ? round1(o.fontSize*f) : o.fontSize,
                dy: dTot ? round1(dTot) : 0,
                s : p
              });
              _.dp = d;
            }
          });
        }
        else  arr.push({ s });
      }

      // If <input> with text, show that instead (corresp. to edit-terms' label).
      if (q = o.e.querySelector('input')) {
        if (q.value) {
          arr.push({ s: q.value });
        }
        else if (q = o.e.querySelector('.placehold')) {
          arr.push({ s: q.innerHTML });
          c = 'plac';
        }
      }

      // Upgrade all `arr` elements: html-decode the 'innerHTML' string (e.g. ..
      arr = arr.map(v => ({                          // .. '&amp;' -> '&'), etc.
         dy: 0,  f: v.f || o.fontSize,  ...v,  s: htmlDecode(v.s || '')
      }));

      // If asked and possible: create <path>s; else: make or fallback to <text>.
      return (o.outline  &&  textOutline(o, `t ${ c}`, x, w, arr, center))
        ||                   textPlain  (o, `tt ${c}`, x, w, arr        );
    }


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

  function intersect(a, b) { return a.filter(Set.prototype.has, new Set(b)); }

  function round1(num)  { return Math.round(num * 10 ) / 10 ; }
  function round2(num)  { return Math.round(num * 100) / 100; }


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
    return `<${ tagName } ${ cssStr(o, tagName, classNames) } ${ coosStr }${
      end || '/>' }`;
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


  // Generates not-outlined text: as a <text>-element, perhaps with <tspan>s,
  // based on a data-object array `arr` as described in `f.termText()`.
  function textPlain(o, c, x, w, arr) {
    var s = '';

    const enc = s => s .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;') .replace(/>/g, '&gt;');

    if ( arr.length == 1)  s = enc(arr[0].s);
    if ( arr.length  > 1)  s = arr
      .map(v =>
        `<tspan${  v.b ?                ` font-weight="bold"`  :  ''
        }${        v.i ?                ` font-style="italic"` :  ''
        }${        v.f != o.fontSize ?  ` font-size="${v.f}"`  :  ''
        }${        v.dy ?               ` dy="${v.dy}"` :  ''
        }>${ enc(v.s) }</tspan>`
      )
      .join('');

    if (s)  s = shape('text', o, c, { x, y: '~', w } , '>') + s + '</text>';

    // Add newlines and indentation, without whitespace between tspans.
    s = s .replace(/>([^<]*)<tspan /g, `\n${ o.tab }>$1<tspan `);
    return s;
  }



  // Generates outlined text: as <path>s.  Returns `false` if not possible.
  function textOutline(o, c, x0, wMax, arr, center) {
    var lenTotal = arr.reduce((s, v) => s + v.s, '') .length;
    if (!lenTotal)  return '';

    wMax += 2;  // Against rounding errors that 'd prune (+ellipsis) too often.
    var y0 = o.e.getAttribute('y');
    var x = x0 + o.tx;
    var y = y0 + o.ty;
    var font;
    var out = [];  // Output array.

    var styleFonts = domToPureSVG.opentypeFonts[o.sketchBox ? 'sketch' : 'main'];
    if (!styleFonts)  return false;

    const Ell = '…';

    const getFont = v => styleFonts[  // Gets the font for an `arr` item.
      v.b ? (v.i ? 'bolditalic' : 'bold') : (v.i ? 'italic' : 'regular')];

    const getPrunedWidth = (len, tail = '') => {  // (->false if missing a font).
      var w = arr.reduce((w, v) => {
        if (w === false || !(font = getFont(v)))  return false;
        var s = v.s.substr(0, len);
        len -= s.length;  // Use `len` as the nr of chars that can still be used.
        return w + font.getAdvanceWidth(s, v.f);
      }, 0);
      return w === false ?  w === false :
        w + styleFonts['regular'].getAdvanceWidth(tail, o.fontSize);
    }

    // Shorten the str (represented as parts) so it fits `wMax` width, if needed.
    var len = lenTotal;
    var addEllipsis = false;
    var w = getPrunedWidth(len);
    if (w === false)  return false;
    if (w > wMax) {
      ///console.log(arr.reduce((s, v) => s + v.s, ''), w, wMax);
      while (--len > 0  &&  getPrunedWidth(len, Ell) > wMax) ;
      addEllipsis = true;
      len = Math.max(1, len);
    }

    // If centering, then move `x` back by text's half-width.
    if (center) {
      x = Math.max(0,  x - getPrunedWidth(len, addEllipsis ? Ell : '') / 2);
      ///x - (addEllipsis ? wMax : getPrunedWidth(len)) / 2;  // (Alternative).
    }

    // Generate a <path> element for each string-fragment.
    var s;
    const insertCSS = s => s.replace(/^(<path\b)/, '$1 ' + cssStr(o, 'path', c));
    arr.forEach(v => {
      if (!(font = getFont(v)))  out = false;
      if (!out)  return;
      if (!(s = v.s.substr(0, len)))  return;
      len -= s.length;  // Use `len` as the nr of chars that can still be used.
      y += v.dy;
      out.push( insertCSS( font.getPath(s, x, y, v.f) .toSVG(3) ) );
      x += font.getAdvanceWidth(s, v.f);  // Move to after this text-path.
    });

    if (addEllipsis && out) {
      out.push(insertCSS( font.getPath(Ell, x, y0 + o.ty, o.fontSize).toSVG(3) ));
    }

    return !out ?  false :  out.join('\n' + o.tab);
  }



  function cssStr(o, tagName, classStr) {  // Args: e.g. `(o, 'rect', 'r inst')`.
    var classKey = addStyleEntry(o, tagName, classStr);
    return `class="${ classKey }"`;
  }


  /**
   * If `styleEntries` does not yet contain this, then:
   * - Calculates the CSS-styling for tagName & classStr (e.g. 'rect' & 'r inst')
   *     by merging relevant styles from `o.styleMaps`; and
   * - Adds this to `styleEntries` as an entry `{ classKey, styleStr }`
   *     so this can be inserted in the <style>-section, later.
   */
  function addStyleEntry(o, tagName, classStr) {
    var classKey = classStr.replace(/ /g, '-');

    // 0) If we already made a <style>-section entry for this `classKey`: done.
    if (styleEntries.findIndex(o => o.classKey==classKey) >= 0)  return classKey;

    // 1) Collect all relevant styling:
    // For each styleMaps-object (`smo`) (in order of appearance):
    // if the given tagName corresponds to smo's `t`-string (if present),
    // and the given classStr includes all css-classes in smo's `c[]` (if any),
    // then writes (or overwrites with) smo's `v`'s properties into `styleObj`.
    var classArr = classStr.split(' ');
    var styleObj = o.styleMaps.reduce((ans, smo) =>
      Object.assign(ans,
        (!smo.t || tagName == smo.t) &&
        (!smo.c || smo.c.every(s => classArr.includes(s))) ?
        smo.v : {}
      ), {});

    // 2) Eliminate empty and default values, etc.
    var a = Object.keys(styleObj)
      .map(k => ({ k,  v: styleObj[k] }))  // ==> [{ k: cssKey, v: value }, ...].
      .filter(e =>
        e.v  &&
        !(e.k == 'stroke-width'  &&  e.v == 1)
      )
      .map(e =>
        e.k == 'stroke-dasharray' ?  { ...e,  v: e.v.join(' ') } :
        e.k == 'stroke-width'     ?  { ...e,  v: e.v + 'px'    } :  e
      );

    // 3) Improve output readability: sort by key, ordered as in `sortKeys`.
    var sortKeys = [ 'fill', 'stroke', 'stroke-width', 'stroke-dasharray',
      'stroke-linecap', 'opacity', 'font', 'white-space', 'text-anchor' ];
    a = a.sort((e, f) =>
      (sortKeys.indexOf(e.k) + 1 || sortKeys.length + 1) -  // And if absent,..
      (sortKeys.indexOf(f.k) + 1 || sortKeys.length + 1)    // ..move to end.
    );

    // 4) Add the final CSS-styling in an entry to `styleEntries`.
    var styleStr = a .map(e => `${e.k}:${e.v}`) .join(';');
    styleEntries.push({ classKey, styleStr });


    // 5) If 'hide' is in classStr: add a <style> entry for without it too;
    // and if 'ri-fg/bg' is in classStr: add an entry with 'hl' added too.
    // This enables users to easily switch to these extra styles by manually
    // changing a 'class="..."' in the SVG file (e.g. by removing '-hide').
    if (classArr.includes('hide')) {
      addStyleEntry(o, tagName, classArr.filter(s => s != 'hide').join(' ') );
    }
    else if ( intersect(classArr, ['ri-fg', 'ri-bg']).length &&
             !classArr.includes('hl') ) {
      addStyleEntry(o, tagName, classStr + ' hl');
    }

    return classKey;
  }



  /**
   * Fills an SVG-string's '<style>'-section with accumulated `styleEntries[]`.
   * Also groups the keys of entries that have the same `styleStr`.
   */
  function fillStyleEntries(s) {
    var a = styleEntries
      .reduce((a, e) => {
        var g = a.find(f => e.styleStr == f.styleStr);
        if (!g)  a.push(e);
        else  g.classKey += ',.' + e.classKey;
        return a;
      }, [])
      .map(e =>
        `.${e.classKey}{${e.styleStr}}`
      )
      /* .concat([
        `@font-face { font-family: 'Tahoma';  font-weight: normal;  font-style: normal;  ` +
          `src: local('Tahoma'),  local('WineTahoma'),  url('https://vsm.github.io/bin/font/wine-tahoma.woff') format('woff'); }`,
        `@font-face { font-family: 'Tahoma';  font-weight: bold;  font-style: normal;  ` +
          `src: local('Tahoma Bold'), local('Verdana Bold'); }`]) */;

    return s.replace(/(\n(\s*)<style>)(<\/style>\n)/,  !a.length ?  '' :
      ('$1\n$2' + o.tab + a.join('\n$2' + o.tab) + '\n$2$3')
    );
  }



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
    var connLinePlus = o.sketchBox ?  (o.connLineWidth - 1) /2 :  0;

    var termBorderPlus = el =>
      !o.sketchBox ?  0 :     // Next line: 'Sketch-styled elem has border?':
      classNames(el).filter(s => ['class', 'lit', 'ref', 'edit'].includes(s))
        .length ?  (o.termLineWidth - 1) /2 :
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


  function htmlDecode(s) {
    // Prepare to counteract parseFromString+textContent's trimming effect.
    var spaceLead  = s.replace(/^(\s*).*$/, '$1');
    var spaceTrail = s.replace(/^.*?(\s*)$/, '$1');
    var s = s.trim();  // Just in case those two stop trimming in the future.

    var doc = new DOMParser().parseFromString(s, 'text/html');
    return spaceLead + doc.documentElement.textContent + spaceTrail;
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





// URLs for fonts that opentype.js can use for the different vsm-box styles.
domToPureSVG.fontURLs = {
  main: {
    //'regular' : 'https://vsm.github.io/bin/font/wine-tahoma.woff',
    'regular'   : 'https://vsm.github.io/bin/font/ta.woff',
    'bold'      : 'https://vsm.github.io/bin/font/tab.woff',
    'italic'    : 'https://vsm.github.io/bin/font/tai.woff',
    'bolditalic': 'https://vsm.github.io/bin/font/tabi.woff'
  },
  sketch: {
    'regular'   : 'https://vsm.github.io/bin/font/ar.woff',
    'bold'      : 'https://vsm.github.io/bin/font/arb.woff',
    'italic'    : 'https://vsm.github.io/bin/font/ari.woff',
    'bolditalic': 'https://vsm.github.io/bin/font/arbi.woff'
  }
};


// Calls to `....loadFontsForStyle()` (further below) will store opentype.js
// font data in here, with the same keys as in `....fontURLs`.

// This will store opentype.js font data (with same keys as in `....fontURLs`),
// after calls to `....loadFontsForStyle()`, see below.
// Then if available, `domToPureSVG()` will access this font data when needed.
// + External code may empty this array again to release memory, if needed.
domToPureSVG.opentypeFonts = {
};


// External code should call this function and wait for its callback, before
// calling `domToPureSVG()` with the option `outline: true`.
// This enables domToPureSVG() to create SVGs with 'outlined' text: as svg-paths.
// It will only load a font it is not yet/still in `opentypeFonts`.
// - Arg. `style`: load fonts for this vsm-box style: 'main' or 'sketch'.
domToPureSVG.loadFontsForVsmBoxStyle = function(vstyle, cb) {  // cb(null|Array).
  var cbAsync = errs => setTimeout(() => cb(errs), 0);

  var vstyleURLs = domToPureSVG.fontURLs[vstyle];
  if (!vstyleURLs)  return cbAsync('Unknown vsm-box style: ' + vstyle);

  var vstyleFonts
    = domToPureSVG.opentypeFonts[vstyle]
    = domToPureSVG.opentypeFonts[vstyle] || {};

  var errs = [];
  var fsKeys = Object.keys(vstyleURLs);  // Font-style keys.
  var remaining = fsKeys.length;
  if (!remaining)  return cbAsync(null);

  function cbMaybe(err) {
    if (err)  errs.push(err);
    if (!--remaining)  cbAsync(errs.length ? errs : null);
  }

  fsKeys.forEach(key => {
    if (vstyleFonts[key])  return cbMaybe(null);  // If font already/still loaded.
    var url = vstyleURLs[key];
    opentype.load(url, (err, font) => {
      ///console.log('opentype.load-cb', key, url);
      if (err)  return cbMaybe(`Font could not be loaded: ${url}: ` + err);
      vstyleFonts[key] = font;
      cbMaybe(null);
    });
  });
};
