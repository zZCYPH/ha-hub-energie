const P = globalThis, U = P.ShadowRoot && (P.ShadyCSS === void 0 || P.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, M = /* @__PURE__ */ Symbol(), F = /* @__PURE__ */ new WeakMap();
let ie = class {
  constructor(e, t, i) {
    if (this._$cssResult$ = !0, i !== M) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (U && e === void 0) {
      const i = t !== void 0 && t.length === 1;
      i && (e = F.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && F.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const he = (s) => new ie(typeof s == "string" ? s : s + "", void 0, M), ce = (s, ...e) => {
  const t = s.length === 1 ? s[0] : e.reduce((i, o, r) => i + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + s[r + 1], s[0]);
  return new ie(t, s, M);
}, ue = (s, e) => {
  if (U) s.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const i = document.createElement("style"), o = P.litNonce;
    o !== void 0 && i.setAttribute("nonce", o), i.textContent = t.cssText, s.appendChild(i);
  }
}, q = U ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const i of e.cssRules) t += i.cssText;
  return he(t);
})(s) : s;
const { is: de, defineProperty: pe, getOwnPropertyDescriptor: ge, getOwnPropertyNames: fe, getOwnPropertySymbols: Se, getPrototypeOf: me } = Object, O = globalThis, z = O.trustedTypes, ye = z ? z.emptyScript : "", $e = O.reactiveElementPolyfillSupport, A = (s, e) => s, N = { toAttribute(s, e) {
  switch (e) {
    case Boolean:
      s = s ? ye : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, e) {
  let t = s;
  switch (e) {
    case Boolean:
      t = s !== null;
      break;
    case Number:
      t = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(s);
      } catch {
        t = null;
      }
  }
  return t;
} }, oe = (s, e) => !de(s, e), V = { attribute: !0, type: String, converter: N, reflect: !1, useDefault: !1, hasChanged: oe };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), O.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let $ = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = V) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const i = /* @__PURE__ */ Symbol(), o = this.getPropertyDescriptor(e, i, t);
      o !== void 0 && pe(this.prototype, e, o);
    }
  }
  static getPropertyDescriptor(e, t, i) {
    const { get: o, set: r } = ge(this.prototype, e) ?? { get() {
      return this[t];
    }, set(n) {
      this[t] = n;
    } };
    return { get: o, set(n) {
      const h = o?.call(this);
      r?.call(this, n), this.requestUpdate(e, h, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? V;
  }
  static _$Ei() {
    if (this.hasOwnProperty(A("elementProperties"))) return;
    const e = me(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(A("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(A("properties"))) {
      const t = this.properties, i = [...fe(t), ...Se(t)];
      for (const o of i) this.createProperty(o, t[o]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [i, o] of t) this.elementProperties.set(i, o);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, i] of this.elementProperties) {
      const o = this._$Eu(t, i);
      o !== void 0 && this._$Eh.set(o, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const o of i) t.unshift(q(o));
    } else e !== void 0 && t.push(q(e));
    return t;
  }
  static _$Eu(e, t) {
    const i = t.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
  }
  addController(e) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
  }
  removeController(e) {
    this._$EO?.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const i of t.keys()) this.hasOwnProperty(i) && (e.set(i, this[i]), delete this[i]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ue(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, t, i) {
    this._$AK(e, i);
  }
  _$ET(e, t) {
    const i = this.constructor.elementProperties.get(e), o = this.constructor._$Eu(e, i);
    if (o !== void 0 && i.reflect === !0) {
      const r = (i.converter?.toAttribute !== void 0 ? i.converter : N).toAttribute(t, i.type);
      this._$Em = e, r == null ? this.removeAttribute(o) : this.setAttribute(o, r), this._$Em = null;
    }
  }
  _$AK(e, t) {
    const i = this.constructor, o = i._$Eh.get(e);
    if (o !== void 0 && this._$Em !== o) {
      const r = i.getPropertyOptions(o), n = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : N;
      this._$Em = o;
      const h = n.fromAttribute(t, r.type);
      this[o] = h ?? this._$Ej?.get(o) ?? h, this._$Em = null;
    }
  }
  requestUpdate(e, t, i, o = !1, r) {
    if (e !== void 0) {
      const n = this.constructor;
      if (o === !1 && (r = this[e]), i ??= n.getPropertyOptions(e), !((i.hasChanged ?? oe)(r, t) || i.useDefault && i.reflect && r === this._$Ej?.get(e) && !this.hasAttribute(n._$Eu(e, i)))) return;
      this.C(e, t, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: i, reflect: o, wrapped: r }, n) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, n ?? t ?? this[e]), r !== !0 || n !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (t = void 0), this._$AL.set(e, t)), o === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [o, r] of this._$Ep) this[o] = r;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [o, r] of i) {
        const { wrapped: n } = r, h = this[o];
        n !== !0 || this._$AL.has(o) || h === void 0 || this.C(o, void 0, r, h);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(t)) : this._$EM();
    } catch (i) {
      throw e = !1, this._$EM(), i;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((t) => t.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq &&= this._$Eq.forEach((t) => this._$ET(t, this[t])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
$.elementStyles = [], $.shadowRootOptions = { mode: "open" }, $[A("elementProperties")] = /* @__PURE__ */ new Map(), $[A("finalized")] = /* @__PURE__ */ new Map(), $e?.({ ReactiveElement: $ }), (O.reactiveElementVersions ??= []).push("2.1.2");
const G = globalThis, Y = (s) => s, R = G.trustedTypes, J = R ? R.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, se = "$lit$", f = `lit$${Math.random().toFixed(9).slice(2)}$`, re = "?" + f, we = `<${re}>`, y = document, C = () => y.createComment(""), E = (s) => s === null || typeof s != "object" && typeof s != "function", W = Array.isArray, _e = (s) => W(s) || typeof s?.[Symbol.iterator] == "function", k = `[ 	
\f\r]`, v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, K = /-->/g, Z = />/g, S = RegExp(`>|${k}(?:([^\\s"'>=/]+)(${k}*=${k}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Q = /'/g, X = /"/g, ne = /^(?:script|style|textarea|title)$/i, ae = (s) => (e, ...t) => ({ _$litType$: s, strings: e, values: t }), x = ae(1), De = ae(2), w = /* @__PURE__ */ Symbol.for("lit-noChange"), u = /* @__PURE__ */ Symbol.for("lit-nothing"), ee = /* @__PURE__ */ new WeakMap(), m = y.createTreeWalker(y, 129);
function le(s, e) {
  if (!W(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return J !== void 0 ? J.createHTML(e) : e;
}
const ve = (s, e) => {
  const t = s.length - 1, i = [];
  let o, r = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", n = v;
  for (let h = 0; h < t; h++) {
    const a = s[h];
    let c, d, l = -1, p = 0;
    for (; p < a.length && (n.lastIndex = p, d = n.exec(a), d !== null); ) p = n.lastIndex, n === v ? d[1] === "!--" ? n = K : d[1] !== void 0 ? n = Z : d[2] !== void 0 ? (ne.test(d[2]) && (o = RegExp("</" + d[2], "g")), n = S) : d[3] !== void 0 && (n = S) : n === S ? d[0] === ">" ? (n = o ?? v, l = -1) : d[1] === void 0 ? l = -2 : (l = n.lastIndex - d[2].length, c = d[1], n = d[3] === void 0 ? S : d[3] === '"' ? X : Q) : n === X || n === Q ? n = S : n === K || n === Z ? n = v : (n = S, o = void 0);
    const g = n === S && s[h + 1].startsWith("/>") ? " " : "";
    r += n === v ? a + we : l >= 0 ? (i.push(c), a.slice(0, l) + se + a.slice(l) + f + g) : a + f + (l === -2 ? h : g);
  }
  return [le(s, r + (s[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class H {
  constructor({ strings: e, _$litType$: t }, i) {
    let o;
    this.parts = [];
    let r = 0, n = 0;
    const h = e.length - 1, a = this.parts, [c, d] = ve(e, t);
    if (this.el = H.createElement(c, i), m.currentNode = this.el.content, t === 2 || t === 3) {
      const l = this.el.content.firstChild;
      l.replaceWith(...l.childNodes);
    }
    for (; (o = m.nextNode()) !== null && a.length < h; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const l of o.getAttributeNames()) if (l.endsWith(se)) {
          const p = d[n++], g = o.getAttribute(l).split(f), T = /([.?@])?(.*)/.exec(p);
          a.push({ type: 1, index: r, name: T[2], strings: g, ctor: T[1] === "." ? be : T[1] === "?" ? Ce : T[1] === "@" ? Ee : L }), o.removeAttribute(l);
        } else l.startsWith(f) && (a.push({ type: 6, index: r }), o.removeAttribute(l));
        if (ne.test(o.tagName)) {
          const l = o.textContent.split(f), p = l.length - 1;
          if (p > 0) {
            o.textContent = R ? R.emptyScript : "";
            for (let g = 0; g < p; g++) o.append(l[g], C()), m.nextNode(), a.push({ type: 2, index: ++r });
            o.append(l[p], C());
          }
        }
      } else if (o.nodeType === 8) if (o.data === re) a.push({ type: 2, index: r });
      else {
        let l = -1;
        for (; (l = o.data.indexOf(f, l + 1)) !== -1; ) a.push({ type: 7, index: r }), l += f.length - 1;
      }
      r++;
    }
  }
  static createElement(e, t) {
    const i = y.createElement("template");
    return i.innerHTML = e, i;
  }
}
function _(s, e, t = s, i) {
  if (e === w) return e;
  let o = i !== void 0 ? t._$Co?.[i] : t._$Cl;
  const r = E(e) ? void 0 : e._$litDirective$;
  return o?.constructor !== r && (o?._$AO?.(!1), r === void 0 ? o = void 0 : (o = new r(s), o._$AT(s, t, i)), i !== void 0 ? (t._$Co ??= [])[i] = o : t._$Cl = o), o !== void 0 && (e = _(s, o._$AS(s, e.values), o, i)), e;
}
class Ae {
  constructor(e, t) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: t }, parts: i } = this._$AD, o = (e?.creationScope ?? y).importNode(t, !0);
    m.currentNode = o;
    let r = m.nextNode(), n = 0, h = 0, a = i[0];
    for (; a !== void 0; ) {
      if (n === a.index) {
        let c;
        a.type === 2 ? c = new B(r, r.nextSibling, this, e) : a.type === 1 ? c = new a.ctor(r, a.name, a.strings, this, e) : a.type === 6 && (c = new He(r, this, e)), this._$AV.push(c), a = i[++h];
      }
      n !== a?.index && (r = m.nextNode(), n++);
    }
    return m.currentNode = y, o;
  }
  p(e) {
    let t = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, t), t += i.strings.length - 2) : i._$AI(e[t])), t++;
  }
}
class B {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, t, i, o) {
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = i, this.options = o, this._$Cv = o?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    e = _(this, e, t), E(e) ? e === u || e == null || e === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : e !== this._$AH && e !== w && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : _e(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== u && E(this._$AH) ? this._$AA.nextSibling.data = e : this.T(y.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: t, _$litType$: i } = e, o = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = H.createElement(le(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === o) this._$AH.p(t);
    else {
      const r = new Ae(o, this), n = r.u(this.options);
      r.p(t), this.T(n), this._$AH = r;
    }
  }
  _$AC(e) {
    let t = ee.get(e.strings);
    return t === void 0 && ee.set(e.strings, t = new H(e)), t;
  }
  k(e) {
    W(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let i, o = 0;
    for (const r of e) o === t.length ? t.push(i = new B(this.O(C()), this.O(C()), this, this.options)) : i = t[o], i._$AI(r), o++;
    o < t.length && (this._$AR(i && i._$AB.nextSibling, o), t.length = o);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    for (this._$AP?.(!1, !0, t); e !== this._$AB; ) {
      const i = Y(e).nextSibling;
      Y(e).remove(), e = i;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class L {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, i, o, r) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = e, this.name = t, this._$AM = o, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = u;
  }
  _$AI(e, t = this, i, o) {
    const r = this.strings;
    let n = !1;
    if (r === void 0) e = _(this, e, t, 0), n = !E(e) || e !== this._$AH && e !== w, n && (this._$AH = e);
    else {
      const h = e;
      let a, c;
      for (e = r[0], a = 0; a < r.length - 1; a++) c = _(this, h[i + a], t, a), c === w && (c = this._$AH[a]), n ||= !E(c) || c !== this._$AH[a], c === u ? e = u : e !== u && (e += (c ?? "") + r[a + 1]), this._$AH[a] = c;
    }
    n && !o && this.j(e);
  }
  j(e) {
    e === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class be extends L {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === u ? void 0 : e;
  }
}
class Ce extends L {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== u);
  }
}
class Ee extends L {
  constructor(e, t, i, o, r) {
    super(e, t, i, o, r), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = _(this, e, t, 0) ?? u) === w) return;
    const i = this._$AH, o = e === u && i !== u || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, r = e !== u && (i === u || o);
    o && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class He {
  constructor(e, t, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    _(this, e);
  }
}
const Be = G.litHtmlPolyfillSupport;
Be?.(H, B), (G.litHtmlVersions ??= []).push("3.3.2");
const Te = (s, e, t) => {
  const i = t?.renderBefore ?? e;
  let o = i._$litPart$;
  if (o === void 0) {
    const r = t?.renderBefore ?? null;
    i._$litPart$ = o = new B(e.insertBefore(C(), r), r, void 0, t ?? {});
  }
  return o._$AI(s), o;
};
const I = globalThis;
class b extends $ {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Te(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return w;
  }
}
b._$litElement$ = !0, b.finalized = !0, I.litElementHydrateSupport?.({ LitElement: b });
const Pe = I.litElementPolyfillSupport;
Pe?.({ LitElement: b });
(I.litElementVersions ??= []).push("4.2.2");
const te = Object.freeze({
  fr: {
    date: "Date",
    range: "Période",
    day: "Jour",
    week: "Semaine",
    month: "Mois",
    year: "Année",
    details: "Détails",
    hide: "Masquer",
    loading: "Chargement de l'historique…",
    waitingHassBootstrap: "Connexion à Home Assistant et chargement des entités…",
    offer: "Offre",
    today: "Aujourd'hui",
    tomorrow: "Demain",
    tempoDayBlue: "Bleu",
    tempoDayWhite: "Blanc",
    tempoDayRed: "Rouge",
    power: "Puissance",
    currentSlot: "Créneau actuel",
    tariffRefresh: "Maj tarifs",
    totalCost: "Coût total",
    totalEnergy: "Énergie totale",
    noData: "Aucune donnée pour ce jour.",
    powerNow: "Puissance instantanée",
    powerNowAria: "Afficher/masquer l'historique de puissance",
    houseLoad: "Charge maison",
    houseLoadEst: "Charge maison (estim.)",
    powerBarTip: "Échelle relative : import réseau, décharge batterie, production solaire (passer la souris pour les valeurs).",
    colGrid: "Réseau",
    colSolar: "Solaire",
    colBatt: "Batterie",
    colBattTip: "+ vers la maison, − en charge",
    consStripGridTitle: "Import Enedis par créneau et couleur",
    consStripHomeTitle: "Source alimentation maison",
    consStripBattTitle: "Charge batterie par source",
    costStripTitle: "Coût par tarif",
    costSubscription: "Abonnement",
    reinjStripTitle: "Réinjection par cause",
    ecoStripTitle: "Économies du jour",
    ecoSourceSolar: "Solaire",
    ecoSourceBatt: "Batterie",
    brkTblGridHome: "Réseau",
    brkTblSolar: "Solaire",
    brkTblBattHome: "Batterie",
    segImport: "Import réseau",
    segExport: "Export",
    segSolar: "Solaire",
    segBattDis: "Décharge batt.",
    segBattChg: "Charge batt.",
    fresh: "Fraîche",
    aging: "Vieillissante",
    stale: "Obsolète",
    unknown: "Inconnue",
    invalid: "Invalide",
    insightAutosuff: "Autosuff.",
    insightVsGrid: "éco. via sol./bat.",
    redHpWarning: "Jour rouge : conso élevée, vérifier vos appareils",
    loadConsumed: "consommés",
    powerHistoryTitle: "Historique puissance",
    powerHistoryFullDay: "Journée du {date} (0h–24h)",
    powerHistoryWindow: "Durée",
    powerGraphTooltipTime: "Heure",
    powerGraphTooltipSolar: "Solaire",
    powerGraphTooltipGrid: "Réseau",
    powerHistoryNoSensors: "Aucun capteur de puissance configuré (ou intégration pas à jour). Vérifiez la config Hub Énergie.",
    powerHistoryNoStatistics: "Pas de statistiques enregistreur pour ces capteurs (state_class requis). Ou délai trop court après ajout.",
    battFullIn: "Plein dans :",
    battEmptyIn: "Vide dans :",
    battSocTitle: "Batterie",
    emDash: "—",
    dayColorNA: "N/A",
    slotBase: "Base",
    slotHc: "HC",
    slotHp: "HP",
    slotBleuHc: "Bleu HC",
    slotBleuHp: "Bleu HP",
    slotBlancHc: "Blanc HC",
    slotBlancHp: "Blanc HP",
    slotRougeHc: "Rouge HC",
    slotRougeHp: "Rouge HP",
    slotUnknown: "Indéterminé",
    usageGridDirect: "Réseau direct (maison)",
    usageGridBatt: "Réseau → charge batterie",
    usageSolarDirect: "Solaire (maison)",
    usageSolarBatt: "Solaire → charge batterie",
    usageBattHome: "Batterie → maison",
    costEntityNotFoundBefore: "Capteur",
    costEntityNotFoundAfter: "introuvable.",
    costEntityCardHint: "Vérifiez que l'intégration est chargée et que <code>sensor.hub_energie_cost_detail</code> existe (Outils de développement → États).",
    rawDataTitle: "Données brutes",
    rawSectionGridHome: "Réseau / Maison",
    rawLineGridTotal: "Réseau total : {value} kWh",
    rawLineHouseTotal: "Maison total : {value} kWh",
    rawSectionCost: "Coût",
    rawLineCostTotal: "Total : {value} €",
    rawLineSubscription: "Abonnement : {value} €",
    rawSectionOrigin: "Origine",
    rawLineOriginGrid: "Réseau : {value} kWh",
    rawLineOriginSolar: "Solaire : {value} kWh",
    rawSectionSavings: "Économies",
    rawLineSavingsSolar: "Solaire : {value} €",
    rawLineSavingsBattery: "Batterie : {value} €",
    rawSectionImportBySlot: "Import par créneau",
    rawSectionCostBySlot: "Coût par créneau",
    rawSectionUsageDetail: "Usage détaillé (kWh)",
    rawSectionBattChargeGridSlots: "Charge batt (réseau) par créneau",
    rawSectionBattChargeSolarSlots: "Charge batt (solaire) par créneau",
    rawSectionReinjection: "Réinjection par cause",
    reinjLabelSolarSurplus: "Surplus PV :",
    reinjLabelBatteryFull: "Batt pleine/absente :",
    reinjLabelSwitchLatency: "Latence batt :",
    reinjLabelOther: "Autre :",
    reinjLabelTotal: "Total :",
    reinjLineKwhEur: "{kwh} kWh / {eur} €",
    reinjCauseSolarSurplus: "Surplus PV",
    reinjCauseBatteryFull: "Batt pleine",
    reinjCauseSwitchLatency: "Latence batt",
    reinjCauseOther: "Autre",
    sectionConsumption: "Consommation",
    editorPowerGraphWindow: "Fenêtre par défaut du graphe de puissance",
    editorPowerHoursUnit: "{n} heures",
    editorPowerHoursHint: "Durée d'historique glissant à l'ouverture du graphe de puissance en direct.",
    editorAdvancedYamlBefore: "Avancé (YAML uniquement) : ",
    editorAdvancedYamlAfter: " — recharge l'historique du graphe de puissance uniquement lorsque ce graphe est ouvert sur le jour en cours (défaut 120 s, entre 15 et 300 s). N'affecte pas la carte principale ni le bandeau puissance instantanée.",
    editorSectionsTitle: "Sections affichées",
    editorShowDaySlots: "Jour / créneau et compteurs Tempo",
    editorShowLivePower: "Puissance en direct et graphe",
    editorShowBatteryBar: "Barre batterie (SOC, autonomie)",
    editorShowInsightsBar: "Barre résumé (énergie, origine, coût, économies)",
    editorShowRedHpWarning: "Alerte conso jour rouge Tempo",
    editorShowConsumption: "Consommation (réseau, maison, charge batterie)",
    editorShowCost: "Coût par tarif",
    editorShowSavings: "Économies du jour",
    editorShowReinjection: "Réinjection par cause",
    editorShowRawControl: "Bouton Détails (données brutes)"
  },
  en: {
    date: "Date",
    range: "Range",
    day: "Day",
    week: "Week",
    month: "Month",
    year: "Year",
    details: "Details",
    hide: "Hide",
    loading: "Loading history…",
    waitingHassBootstrap: "Connecting to Home Assistant and loading entity states…",
    offer: "Offer",
    today: "Today",
    tomorrow: "Tomorrow",
    tempoDayBlue: "Blue",
    tempoDayWhite: "White",
    tempoDayRed: "Red",
    power: "Power",
    currentSlot: "Current slot",
    tariffRefresh: "Tariff refresh",
    totalCost: "Total cost",
    totalEnergy: "Total energy",
    noData: "No data for this day.",
    powerNow: "Live power",
    powerNowAria: "Toggle power history chart",
    houseLoad: "House load",
    houseLoadEst: "House load (est.)",
    powerBarTip: "Relative scale: grid import, battery discharge, solar output (hover for values).",
    colGrid: "Grid",
    colSolar: "Solar",
    colBatt: "Battery",
    colBattTip: "+ to home, − charging",
    consStripGridTitle: "Grid import by slot and day colour",
    consStripHomeTitle: "House supply source",
    consStripBattTitle: "Battery charging by source",
    costStripTitle: "Cost by tariff",
    costSubscription: "Subscription",
    reinjStripTitle: "Reinjection by cause",
    ecoStripTitle: "Today's savings",
    ecoSourceSolar: "Solar",
    ecoSourceBatt: "Battery",
    brkTblGridHome: "Grid",
    brkTblSolar: "Solar",
    brkTblBattHome: "Battery",
    segImport: "Grid import",
    segExport: "Export",
    segSolar: "Solar",
    segBattDis: "Batt discharge",
    segBattChg: "Batt charge",
    fresh: "Fresh",
    aging: "Aging",
    stale: "Stale",
    unknown: "Unknown",
    invalid: "Invalid",
    insightAutosuff: "Self-suff.",
    insightVsGrid: "vs grid-only",
    redHpWarning: "Red day: high consumption — check appliances",
    loadConsumed: "consumed",
    powerHistoryTitle: "Power history",
    powerHistoryFullDay: "Day {date} (midnight–midnight)",
    powerHistoryWindow: "Window",
    powerGraphTooltipTime: "Time",
    powerGraphTooltipSolar: "Solar",
    powerGraphTooltipGrid: "Grid",
    powerHistoryNoSensors: "No power sensors configured (or integration not updated). Check Hub Énergie config.",
    powerHistoryNoStatistics: "No recorder statistics for these sensors (needs state_class). Or not enough history yet.",
    battFullIn: "Full in:",
    battEmptyIn: "Empty in:",
    battSocTitle: "Battery",
    emDash: "—",
    dayColorNA: "N/A",
    slotBase: "Base",
    slotHc: "Off-peak",
    slotHp: "Peak",
    slotBleuHc: "Blue off-peak",
    slotBleuHp: "Blue peak",
    slotBlancHc: "White off-peak",
    slotBlancHp: "White peak",
    slotRougeHc: "Red off-peak",
    slotRougeHp: "Red peak",
    slotUnknown: "Unknown",
    usageGridDirect: "Grid direct (home)",
    usageGridBatt: "Grid → battery charging",
    usageSolarDirect: "Solar (home)",
    usageSolarBatt: "Solar → battery charging",
    usageBattHome: "Battery → home",
    costEntityNotFoundBefore: "Sensor",
    costEntityNotFoundAfter: "not found.",
    costEntityCardHint: "Check the integration is loaded and <code>sensor.hub_energie_cost_detail</code> exists (Developer tools → States).",
    rawDataTitle: "Raw data",
    rawSectionGridHome: "Grid / house",
    rawLineGridTotal: "Grid total: {value} kWh",
    rawLineHouseTotal: "House total: {value} kWh",
    rawSectionCost: "Cost",
    rawLineCostTotal: "Total: {value} €",
    rawLineSubscription: "Subscription: {value} €",
    rawSectionOrigin: "Origin",
    rawLineOriginGrid: "Grid: {value} kWh",
    rawLineOriginSolar: "Solar: {value} kWh",
    rawSectionSavings: "Savings",
    rawLineSavingsSolar: "Solar: {value} €",
    rawLineSavingsBattery: "Battery: {value} €",
    rawSectionImportBySlot: "Import by slot",
    rawSectionCostBySlot: "Cost by slot",
    rawSectionUsageDetail: "Detailed usage (kWh)",
    rawSectionBattChargeGridSlots: "Battery charge (grid) by slot",
    rawSectionBattChargeSolarSlots: "Battery charge (solar) by slot",
    rawSectionReinjection: "Reinjection by cause",
    reinjLabelSolarSurplus: "PV surplus:",
    reinjLabelBatteryFull: "Battery full / absent:",
    reinjLabelSwitchLatency: "Battery switch latency:",
    reinjLabelOther: "Other:",
    reinjLabelTotal: "Total:",
    reinjLineKwhEur: "{kwh} kWh / {eur} €",
    reinjCauseSolarSurplus: "PV surplus",
    reinjCauseBatteryFull: "Battery full",
    reinjCauseSwitchLatency: "Switch latency",
    reinjCauseOther: "Other",
    sectionConsumption: "Consumption",
    editorPowerGraphWindow: "Power graph default window",
    editorPowerHoursUnit: "{n} hours",
    editorPowerHoursHint: "Rolling history length when opening the live power graph.",
    editorAdvancedYamlBefore: "Advanced (YAML only): ",
    editorAdvancedYamlAfter: " — reloads the power graph history only while that graph is open on the current day (default 120s, min 15, max 300). Does not affect the main card or the live power strip.",
    editorSectionsTitle: "Visible sections",
    editorShowDaySlots: "Day / slot and Tempo counters",
    editorShowLivePower: "Live power and graph",
    editorShowBatteryBar: "Battery bar (SOC, runtime)",
    editorShowInsightsBar: "Summary bar (energy, origin, cost, savings)",
    editorShowRedHpWarning: "Red-day high consumption alert (Tempo)",
    editorShowConsumption: "Consumption (grid, house, battery charging)",
    editorShowCost: "Cost by tariff",
    editorShowSavings: "Today's savings",
    editorShowReinjection: "Reinjection by cause",
    editorShowRawControl: "Details button (raw data)"
  }
});
function Re(s, e) {
  let t = String(s);
  for (const [i, o] of Object.entries(e))
    t = t.split(`{${i}}`).join(String(o));
  return t;
}
const j = "custom:hub-energie-card", D = /* @__PURE__ */ new Set([24, 12, 6, 3, 1]), Oe = [1, 3, 6, 12, 24], Le = [
  ["show_day_slots", "editorShowDaySlots"],
  ["show_live_power", "editorShowLivePower"],
  ["show_battery_bar", "editorShowBatteryBar"],
  ["show_insights_bar", "editorShowInsightsBar"],
  ["show_red_hp_warning", "editorShowRedHpWarning"],
  ["show_consumption", "editorShowConsumption"],
  ["show_cost", "editorShowCost"],
  ["show_savings", "editorShowSavings"],
  ["show_reinjection", "editorShowReinjection"],
  ["show_raw_control", "editorShowRawControl"]
];
class ke extends b {
  static properties = {
    hass: { attribute: !1 },
    _config: { state: !0 }
  };
  static styles = ce`
    :host {
      display: block;
    }
    .field {
      display: block;
      margin-bottom: 16px;
    }
    .hint {
      color: var(--secondary-text-color);
      font-size: 12px;
      margin: 6px 0 0;
      line-height: 1.4;
    }
    .sections-title {
      font-size: 0.95rem;
      font-weight: 600;
      margin: 20px 0 10px;
      color: var(--primary-text-color);
    }
    ha-formfield {
      display: block;
    }
  `;
  setConfig(e) {
    this._config = e && typeof e == "object" ? { ...e } : { type: j }, this._config.type || (this._config.type = j);
  }
  _i18n() {
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? te.en : te.fr;
  }
  _sectionOn(e) {
    const t = this._config?.[e];
    return t !== !1 && t !== "false";
  }
  render() {
    const e = this._config ?? {}, t = this._i18n(), i = parseFloat(e.power_history_hours), o = Math.trunc(i), r = D.has(o) ? o : 6;
    return x`
      <div class="card-config">
        <div class="field">
          <ha-select
            label=${t.editorPowerGraphWindow}
            .value=${String(r)}
            @closed=${this._onPowerHoursClosed}
            .fixedMenuPosition=${!0}
            .naturalMenuWidth=${!0}
          >
            ${Oe.map(
      (n) => x`<ha-list-item value="${String(n)}">${Re(t.editorPowerHoursUnit, { n })}</ha-list-item>`
    )}
          </ha-select>
          <p class="hint">${t.editorPowerHoursHint}</p>
        </div>

        <div class="sections-title">${t.editorSectionsTitle}</div>
        ${Le.map(
      ([n, h]) => x`
            <div class="field">
              <ha-formfield .label=${t[h]}>
                <ha-switch
                  .checked=${this._sectionOn(n)}
                  @change=${(a) => this._setSectionFlag(n, a.target.checked)}
                ></ha-switch>
              </ha-formfield>
            </div>
          `
    )}

        <p class="hint">
          ${t.editorAdvancedYamlBefore}<code>power_history_refresh_seconds</code>${t.editorAdvancedYamlAfter}
        </p>
      </div>
    `;
  }
  _emit(e) {
    const t = { ...e };
    t.type = j, this.dispatchEvent(
      new CustomEvent("config-changed", {
        bubbles: !0,
        composed: !0,
        detail: { config: t }
      })
    );
  }
  _setSectionFlag(e, t) {
    const i = { ...this._config };
    t ? delete i[e] : i[e] = !1, this._emit(i);
  }
  _onPowerHoursClosed(e) {
    e.stopPropagation();
    const t = e.target;
    if (!t?.value) return;
    const i = Math.trunc(Number(t.value));
    if (!D.has(i)) return;
    const o = parseFloat(this._config?.power_history_hours), r = D.has(Math.trunc(o)) ? Math.trunc(o) : 6;
    if (i === r) return;
    const n = { ...this._config, power_history_hours: i };
    this._emit(n);
  }
}
customElements.get("hub-energie-card-editor") || customElements.define("hub-energie-card-editor", ke);
export {
  u as A,
  te as I,
  ce as a,
  x as b,
  b as i,
  Re as t,
  De as w
};
