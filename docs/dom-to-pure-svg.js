/**
 * This function generates pure SVG data, based on a given VSM-box DOM-element.
 * I.e. the SVG data has no `foreignObject` element that would sneak in HTML
 * code, which can not be read by SVG editors.
 *
 * Developer's notes:
 * - This does not convert directly from JSON or from a VSM-sentence JS-object;
 *   a VSM-box DOM-element is still needed, as does all the complex layout.
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
  var termsFill_0 = 'ffffff';
  var isEmptyBox  = !e.querySelector('.terms .term:not(.ruler):not(.end)');
  var endTermText =
    (e.querySelector('.terms .term.end .label') || {}) .innerHTML ||
    (e.querySelector('.terms .term.end input' ) || {}) .value;
  var whiteBox = !!opt.whiteBox;
  opt = {
    useViewBox:     !opt.forDev,  // Use viewbox vs. width/height in <svg> tag.
    whiteBox:       whiteBox,
    addBorder:      !whiteBox,  // False=>0 border (even if DOM has 1px).
    addUCConn:      true,       // False=>removes any shown under-constr-conn.
    addPosHL:       true,
    showRemoveIcon: true,       // False=>still added, but kept invisible.
    showCursor:     false,      // False=>still added, but kept invisible.
    borderW:        1,
    termsH:         17,  // (Excludes the fake white padding on top, =part of conns panel).
    termsMarginTop: 2,
    refConnDashArray: '2,1',    // (Chrome:'2,1' |FF:'2,1'     |'2.5,1.25').
    refTermDashArray: '2,1.5',  // (Chrome:'2,1' |FF:'2.5,2.5' |'2.5,1.25').
    connsFill:     whiteBox ? 'ffffff' : 'fbfbfb',  ///(For debug: 'ffeeee':'fbfbfb').
    termsFill:     termsFill_0,  ///(For debug: 'ffe2e2').
    addEndTerm:    !whiteBox || isEmptyBox || endTermText,
    endTermStroke: isEmptyBox || endTermText ?  'f0f0f0' :  termsFill_0,  ///(For debug: 'ff8888':'ffcccc').
    tab: '  ',
    ...opt
  };


  const XY12 = 'x1="~x1~" y1="~y1~" x2="~x2~" y2="~y2~"'; // ~..~: auto-filled.
  const XYWH = 'x="~x~" y="~y~" width="~width~" height="~height~"';


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
      o.ind = 1;
      o.contW = +svg.getAttribute('width' );    // The content's width/height..
      o.contH = +svg.getAttribute('height') + o.termsH;  // ..excl. box-border.

      // In whiteBox-mode: shrink the viewport to the terms+conns+highlights
      // bounding-box, and shift the content into it. Draw no bkgr outside it!
      o.contBB =  calcBoundingBox(e, o);  // ("contBB"=content bounding-box).

      var bw2  = o.addBorder ?  o.borderW * 2 :  0;
      var boxW = o.contBB.x2 - o.contBB.x1 + bw2;
      var boxH = o.contBB.y2 - o.contBB.y1 + bw2;
      var tags =
        (o.addBorder || o.whiteBox ?  '' :  ` class="content"`) +
        (o.useViewBox ? ` viewBox="0 0 ${ boxW } ${          boxH }"` :
                        ` width="${       boxW }" height="${ boxH }"`);

      return [
        `<svg${tags} xmlns="http://www.w3.org/2000/svg" ` +
          `xmlns:xlink="http://www.w3.org/1999/xlink">`,
        f.style(e, o),  /* f.fontData(e, o), */
        (o.addBorder ? f.borderedBox :  o.whiteBox ? f.whiteBox :  f.box)(e, o),
        '</svg>'
      ];
    },

    style: (e, o) => [
      '<style>',
      f.styleData(e, { ind: 1 }),
      '</style>'
    ],
    styleData: (e, o) => `
     ${'.content { stroke: none; }'  /* Makes Inkscape-1.0.1-->StrokeToPath not stroke text */ }
        .box-border { stroke: #d3d9e5;  stroke-width: 1px;  fill: none; }
        .conns-fill { fill:   #${ o.connsFill }; }  .terms-fill { fill:   #${ o.termsFill }; }
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
     ${'.ri.fg { stroke: #aabcce;  stroke-width: 2px; }'  /* hovered color: #ffffff */ }
     ${'.ri.bg { fill: none; }'                           /* hovered color: #7491ab */ +
        (o.showRemoveIcon ?  '' :  '  .ri    { opacity: 0; }') }
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
      ${ o.addEndTerm ?
       '.r.inst.end      { stroke: #' + o.endTermStroke + ';  }' : '' }
        .r.focal { stroke: #aaaaaa;  stroke-dasharray: 0,3.4;  stroke-width: 1.7px;  stroke-linecap: round; }
        .cursor  { stroke: #${ o.showCursor ?  '000000' :  o.termsFill };  stroke-width: 1px; }
        .t       { font: 11px tahoma, sans-serif;  white-space: pre; }
        .t.inst, .t.ref { fill: #1c2a47; }
        .t.edit, .t.end { fill: #7a7a7a; }  .t.plac { fill: #aaaaaa; }
        .t.class        { fill: #2a2a05; }  .t.lit  { fill: #200505; }
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
    borderedBox: (e, o) => [
      f.border(e, { ...o,  s: 'rect' }),  // `s`:querySelector relative to `e`.
      `<g class="content" transform="translate(1 1)">`,
      f.box   (e, { ...o,  ind: 1    }),  // `ind`: indent this part in output.
      '</g>'
    ],
    border: (e, o) =>
      `<rect class="box-border" x="${ o.borderW/2 }" y="${ o.borderW/2 }" ` +
      `width="${ o.contW + o.borderW }" height="${ o.contH + o.borderW }"/>`
    ,
    whiteBox: (e, o) => [
      `<g class="content" transform="translate(${ -o.contBB.x1 } ${ -o.contBB.y1 })">`,
      f.box(e, { ...o,  ind: 1 }),
      '</g>'
    ],
    box: (e, o) => {
      o.connsH = o.contH - o.termsH;  // Note: this _includes_ the 'fake' white..
      //        ..margin above the terms (where a conn-highlight may be drawn).
      return [
        f.backgrounds(e, o),
        f.posHL      (e, { ...o,  s: `.pos-highlight:not([class*="fade-leave"])` }),
        f.hl         (e, { ...o,  s: `.conn-highlight:not([class*="fade-leave"])` }),
        f.conns      (e, { ...o,  s: `.conns` }),
        f.removeIcon (e, { ...o,  s: `.conn-remove-icon:not([class*="fade-leave"])` }),
        f.terms      (e, { ...o,  s: `.terms` })
      ];
    },
    backgrounds: (e, o) => {
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
        `<rect class="conns-fill" x="${ cut.left
                           }" width="${ trimmedW
                               }" y="${ cut.top
                          }" height="${ termsBgY - cut.top }"/>`
      );
      arr.push(
        `<rect class="terms-fill" x="${ cut.left
                           }" width="${ trimmedW
                               }" y="${ termsBgY
                          }" height="${ termsBgH }"/>`
      );
      return arr;
    },
    posHL: (e, o) =>
      !o.addUCConn || !o.addPosHL ?  '' :
        `<rect x="~x~" width="~width~" y="0" height="${o.connsH}" class="pos-hl"/>`
    ,
    hl: (e, o) => [
      '<g>',
      f.hlBackTop (e, { ind: 1, s: '.hl-back-top' } ),
      f.hlLeg     (e, { ind: 1, s: '.hl-leg'      , many: true } ),
      f.hlLegUnder(e, { ind: 1, s: '.hl-leg-under', many: true } ),
      '</g>'
    ],
    hlBackTop:  (e, o) =>
      `<path class="hl-back-top" d="~d~"/>`
    ,
    hlLeg:      (e, o) =>
      `<rect class="hl-leg" ${ XYWH }/>`
    ,
    hlLegUnder: (e, o) =>
      `<rect class="hl-leg-under" ${ XYWH }/>`
    ,
    conns: (e, o) =>
      f.conn(e, { s: '.conn', many: true })
    ,
    conn: (e, o) => {
      o.ref     = classNames(e).includes('r') ? ' ref' : '';
      o.ucLegNr = !e.querySelector('.conn-leg.uc') ?  -1 :
                  e.querySelectorAll('.conn-leg').length - 1;
      o.ind = 1;
      return [
        '<g>',
        f.back          (e, { ...o, s: '.back',     many:  true }),
        f.legFootPointer(e, { ...o, s: '.conn-leg', many:  true }),
        f.stubs         (e, o),
        '</g>'
      ];
    },
    back: (e, o) => {
      var c = classNames(e);
      c = ///c.includes('left' ) ? ' left'  : c.includes('right') ? ' right' :
          c.includes('two'  ) ? ' two'   : '';
      return `<line class="back${ o.ref }${ c }" ${ XY12 }/>`
    }
    ,
    legFootPointer: (e, o) => {
      o.uc = o.ucLegNr == o.nr ? ' uc' : '';
      return [
        f.foot   (e, { ...o, s: '.foot', many: true }),
        f.leg    (e, { ...o, s: '.leg'              }),
        f.pointer(e, { ...o, s: '.pointer'          }),
      ];
    },
    foot: (e, o) => {
      var c = classNames(e);
      c = ///c.includes('left' ) ? ' left'  : c.includes('right') ? ' right' :
          '';
      return `<line class="foot${ o.ref }${ c }${ o.uc }" ${ XY12 }/>`
    },
    leg: (e, o) =>
      `<line class="leg${  o.ref }${ o.uc }" ${ XY12 }/>`
    ,
    pointer: (e, o) =>
      `<path class="${ pointerClassName(e) }${ o.uc }" d="~d~"/>`
    ,
    stubs: (e, o) => [
      f.stubBack   (e, { s: '.stub-back'    }),
      f.stubFoot   (e, { s: '.stub-foot'    }),
      f.stubLeg    (e, { s: '.stub-leg'     }),
      f.stubPointer(e, { s: '.stub-pointer' })
    ],
    stubBack: (e, o) =>
      `<line class="back stub" ${ XY12 }/>`
    ,
    stubFoot: (e, o) =>
      `<line class="foot stub" ${ XY12 }/>`
    ,
    stubLeg: (e, o) =>
      `<line class="leg stub" ${ XY12 }/>`
    ,
    stubPointer: (e, o) =>
      `<path class="${ pointerClassName(e) } stub" d="~d~"/>`
    ,
    removeIcon: (e, o) => [
      '<g>',
      f.riBg(e, { ind: 1, s: '.ri-bg' }),
      f.riFg(e, { ind: 1, s: '.ri-fg' }),
      '</g>'
    ],
    riBg: (e, o) =>
      `<rect class="ri bg" ${ XYWH } rx="~rx~"/>`
    ,
    riFg: (e, o) =>   // Also split path parts: better for Illustrator.
      `<path class="ri fg" d="${ e.getAttribute('d') }"/>`
        .replace(/([^"])M/, '$1"/>\n<path class="ri fg" d="M')
        .split('\n')
    ,
    terms: (e, o) => {
      // Prepare for placing a possibly dragged term at placeholder pos.
      var q = e.querySelector('.drag-placeholder');  var x;
      if (q  &&  (x = elStyleNum(q, 'left')) !== undefined)  o.dragPlhX = x;
      o = { ...o,  ind: 1,  many: true };
      var s = '.term:not(.ruler)' + (!o.addEndTerm ? ':not(.end)' : '');
      return [
        `<g transform="translate(0.5 ${ o.connsH + 0.5  })">`,
        f.termRect(e, { ...o, s: s }),
        `</g>`,
        `<g transform="translate(4 ${   o.connsH + 11.8 })">`,  ///11.7
        f.termText(e, { ...o, s: s }),
        `</g>`
      ];
    },

    termRect: (e, o) => {
      var { type, isEdit, isEnd, isFocal, x, w } = analyzeTermElem(e, o);
      if (!type || !w || x===undefined)  return ''; // drag-placeholder->type=''.
      var c = type + (isEdit ? ' edit' : '') + (isEnd ? ' end' : '');
      var a = [
        `<rect class="r ${c}" x="${x}" width="${w - 1}" height="14" rx="1.5"/>`
      ];
      if (type == 'ref')  a.push(  // Extra element: for ref-term border.
        a[0].replace(/\bref\b/, 'ref-bord')
      );
      if (isFocal) { // Extra element: for focal term.
        var x1 = x     + 1 + 1.4  ;  // } 1   = rect border-width. 2 = twice.
        var x2 = x + w - 2 - 1.4/2;  // } 1.4 = line stroke-width.
        a.push(`<line class="r focal" x1="${x1}" x2="${x2}" y1="2" y2="2"/>`);
      }
      if (e.querySelector('input')) {
        a.push(  f.cursor(e,  { ...o,  xc: x + 4 })  );
      }
      return a;
    },

    cursor: (e, o) =>
      `<line class="cursor" x1="${o.xc}" x2="${o.xc}" y1="1.5" y2="12.5"/>`
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

      s = !s ? '': `<text class="t ${c}" x="${x}" width="${w - 1}">${s}</text>`;
      /*
      usedChars = [...usedChars, ...s.replace(/<.+?>/g,'').split('')];
      */

      return s  // Add indentation+newlines, without whitespace between tspans.
        .replace(/>([^<]*)<tspan /g, `\n${ o.tab }><tspan `);

      function round1(num)  { return Math.round(num * 10) / 10; }
    }
  };


  function calcBoundingBox(e, o) {
    if (!o.whiteBox || o.addBorder){
      return { x1: 0, y1: 0, x2: o.contW, y2: o.contH };  // Content's b-box.
    }

    var x1 = [];  // min(x of leftmost termRect; x of leftmost hlLeg).
    var x2 = [];  // max(left + w of rightmost termRect; x+w of rightm hlLeg).
    var y1 = [];  // min(y1 of highest conn-back -0.5; y1 of highest hl (=y1..
                  // ..of its removeIcon); y1/y2 of uc-conn-leg).
    var y2 = [];  // top of terms + height of a termRect.

    var qTerms = e.querySelectorAll('.terms .term:not(.ruler):not(.drag)' +
      (!o.addEndTerm ? ':not(.end)' : '') );  // (Includes .drag-placeholder).
    var qRIBG       = e.querySelector   ('.conn-remove-icon .ri-bg');
    var qHLLegs     = e.querySelectorAll('.conn-highlight .hl-leg');
    var qConnBacks  = e.querySelectorAll('.conn .back');
    var ucConnLegs  = o.addUCConn ? e.querySelectorAll('.conn-leg.uc .leg') : [];
    var ucConnBacks = o.addUCConn ? e.querySelectorAll('.conn.uc .back'   ) : [];
    var posHL       = o.addUCConn && o.addPosHL && e.querySelector('.pos-highlight');

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


  function pointerClassName(e) {
    var c = classNames(e) .filter(s =>
      ['relation', 'object', 'list-relation', 'parent'].includes(s));
    return (c[0] || '').substring(0, 3);
  }


  function classNames(e) {
    return (e.getAttribute('class') || '') .split(/\s/);
  }


  /**
   * Augment each f.func(): wrap it into a more powerful function:
   * - For the Array of (or single) Strings that the original function returns:
   *   the new function indents each text-line 1 more, if `o.ind` is truthy.
   *   + And prevent passing an `o.ind:1` to the called original function,
   *     (as it may want to pass other options in `o` on to deeper calls).
   * - If given Array, it returns a newline-joined String.
   * - It calls the original function with a merged options object:
   *   the 'global' options `opt`, merged with locally given ones as `o`.
   * - A selectorString `s` can be given as in the options object `o`, to call
   *   the original function for that selected HTMLElement under `e`.
   *   If this finds no `e`, then returns '' without origFunc call.
   * - If `o.many` is truthy, then new-func calls its (augmented) self for all
   *   matching `o.s` child elements, and returns the combined result.
   * - Also replaces all '~nn~' strings by the value of `e`'s attribute 'nn'.
   */
  Object.keys(f).forEach(key => {
    var origFunc = f[key];
    f[key] = (e, o) => {
      var o = { ...opt, ...o };

      // Multiply and combine calls, for `o.many`.  Keep only non-empties.
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
        a = origFunc(e, { ...o,  ind: 0,  s: '' });  // Reset some options.
        a = typeof a == 'string' ?  [ a ] :  a;
        a = a.filter(s => s);

        // Fill in getAttribute markers.
        a = a.map(s =>
          s.replace(/~([a-z0-9\-]+)~/g, ($0, $1) => e.getAttribute($1))
        );

        // Indent if needed.
        if (o.ind) {
          a = a .map(s => s.split('\n') .map(line => o.tab + line) .join('\n'));
        }
      }
      return a.join('\n');
    }
  });


  var s = f.main(e, opt);


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


  if (opt.svgInspect && opt.forDev) {  // Temp. data-inspection helper code.
    // Show the SVG as image and as text.
    elSVGFig.innerHTML = s;
    elSVG   .innerHTML = s
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/@font-face/g, '_font-face');  // No global @ff-interference.

    // Hide the long <style>-tag in the shown SVG-text.
    if (opt.forDev)  s = s.replace(/<style>[\s\S]*<\/style>\n  /, '');

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

  return s;
}




/**
 * Helper function for inspecting a browser-generated vsm-box DOM-element.
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
