const P = globalThis, U = P.ShadowRoot && (P.ShadyCSS === void 0 || P.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, M = /* @__PURE__ */ Symbol(), V = /* @__PURE__ */ new WeakMap();
let oe = class {
  constructor(e, t, o) {
    if (this._$cssResult$ = !0, o !== M) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (U && e === void 0) {
      const o = t !== void 0 && t.length === 1;
      o && (e = V.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), o && V.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const he = (i) => new oe(typeof i == "string" ? i : i + "", void 0, M), ce = (i, ...e) => {
  const t = i.length === 1 ? i[0] : e.reduce((o, r, s) => o + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + i[s + 1], i[0]);
  return new oe(t, i, M);
}, ue = (i, e) => {
  if (U) i.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const o = document.createElement("style"), r = P.litNonce;
    r !== void 0 && o.setAttribute("nonce", r), o.textContent = t.cssText, i.appendChild(o);
  }
}, q = U ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const o of e.cssRules) t += o.cssText;
  return he(t);
})(i) : i;
const { is: de, defineProperty: pe, getOwnPropertyDescriptor: ge, getOwnPropertyNames: fe, getOwnPropertySymbols: Se, getPrototypeOf: me } = Object, O = globalThis, F = O.trustedTypes, ye = F ? F.emptyScript : "", we = O.reactiveElementPolyfillSupport, b = (i, e) => i, N = { toAttribute(i, e) {
  switch (e) {
    case Boolean:
      i = i ? ye : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, e) {
  let t = i;
  switch (e) {
    case Boolean:
      t = i !== null;
      break;
    case Number:
      t = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(i);
      } catch {
        t = null;
      }
  }
  return t;
} }, re = (i, e) => !de(i, e), z = { attribute: !0, type: String, converter: N, reflect: !1, useDefault: !1, hasChanged: re };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), O.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let w = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = z) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const o = /* @__PURE__ */ Symbol(), r = this.getPropertyDescriptor(e, o, t);
      r !== void 0 && pe(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, t, o) {
    const { get: r, set: s } = ge(this.prototype, e) ?? { get() {
      return this[t];
    }, set(n) {
      this[t] = n;
    } };
    return { get: r, set(n) {
      const h = r?.call(this);
      s?.call(this, n), this.requestUpdate(e, h, o);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? z;
  }
  static _$Ei() {
    if (this.hasOwnProperty(b("elementProperties"))) return;
    const e = me(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(b("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(b("properties"))) {
      const t = this.properties, o = [...fe(t), ...Se(t)];
      for (const r of o) this.createProperty(r, t[r]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [o, r] of t) this.elementProperties.set(o, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, o] of this.elementProperties) {
      const r = this._$Eu(t, o);
      r !== void 0 && this._$Eh.set(r, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const o = new Set(e.flat(1 / 0).reverse());
      for (const r of o) t.unshift(q(r));
    } else e !== void 0 && t.push(q(e));
    return t;
  }
  static _$Eu(e, t) {
    const o = t.attribute;
    return o === !1 ? void 0 : typeof o == "string" ? o : typeof e == "string" ? e.toLowerCase() : void 0;
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
    for (const o of t.keys()) this.hasOwnProperty(o) && (e.set(o, this[o]), delete this[o]);
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
  attributeChangedCallback(e, t, o) {
    this._$AK(e, o);
  }
  _$ET(e, t) {
    const o = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, o);
    if (r !== void 0 && o.reflect === !0) {
      const s = (o.converter?.toAttribute !== void 0 ? o.converter : N).toAttribute(t, o.type);
      this._$Em = e, s == null ? this.removeAttribute(r) : this.setAttribute(r, s), this._$Em = null;
    }
  }
  _$AK(e, t) {
    const o = this.constructor, r = o._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const s = o.getPropertyOptions(r), n = typeof s.converter == "function" ? { fromAttribute: s.converter } : s.converter?.fromAttribute !== void 0 ? s.converter : N;
      this._$Em = r;
      const h = n.fromAttribute(t, s.type);
      this[r] = h ?? this._$Ej?.get(r) ?? h, this._$Em = null;
    }
  }
  requestUpdate(e, t, o, r = !1, s) {
    if (e !== void 0) {
      const n = this.constructor;
      if (r === !1 && (s = this[e]), o ??= n.getPropertyOptions(e), !((o.hasChanged ?? re)(s, t) || o.useDefault && o.reflect && s === this._$Ej?.get(e) && !this.hasAttribute(n._$Eu(e, o)))) return;
      this.C(e, t, o);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: o, reflect: r, wrapped: s }, n) {
    o && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, n ?? t ?? this[e]), s !== !0 || n !== void 0) || (this._$AL.has(e) || (this.hasUpdated || o || (t = void 0), this._$AL.set(e, t)), r === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
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
        for (const [r, s] of this._$Ep) this[r] = s;
        this._$Ep = void 0;
      }
      const o = this.constructor.elementProperties;
      if (o.size > 0) for (const [r, s] of o) {
        const { wrapped: n } = s, h = this[r];
        n !== !0 || this._$AL.has(r) || h === void 0 || this.C(r, void 0, s, h);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((o) => o.hostUpdate?.()), this.update(t)) : this._$EM();
    } catch (o) {
      throw e = !1, this._$EM(), o;
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
w.elementStyles = [], w.shadowRootOptions = { mode: "open" }, w[b("elementProperties")] = /* @__PURE__ */ new Map(), w[b("finalized")] = /* @__PURE__ */ new Map(), we?.({ ReactiveElement: w }), (O.reactiveElementVersions ??= []).push("2.1.2");
const G = globalThis, Y = (i) => i, R = G.trustedTypes, J = R ? R.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, ie = "$lit$", f = `lit$${Math.random().toFixed(9).slice(2)}$`, se = "?" + f, _e = `<${se}>`, y = document, C = () => y.createComment(""), E = (i) => i === null || typeof i != "object" && typeof i != "function", W = Array.isArray, $e = (i) => W(i) || typeof i?.[Symbol.iterator] == "function", j = `[ 	
\f\r]`, v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, K = /-->/g, Z = />/g, S = RegExp(`>|${j}(?:([^\\s"'>=/]+)(${j}*=${j}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Q = /'/g, X = /"/g, ne = /^(?:script|style|textarea|title)$/i, ae = (i) => (e, ...t) => ({ _$litType$: i, strings: e, values: t }), k = ae(1), De = ae(2), _ = /* @__PURE__ */ Symbol.for("lit-noChange"), u = /* @__PURE__ */ Symbol.for("lit-nothing"), ee = /* @__PURE__ */ new WeakMap(), m = y.createTreeWalker(y, 129);
function le(i, e) {
  if (!W(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return J !== void 0 ? J.createHTML(e) : e;
}
const ve = (i, e) => {
  const t = i.length - 1, o = [];
  let r, s = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", n = v;
  for (let h = 0; h < t; h++) {
    const a = i[h];
    let c, d, l = -1, p = 0;
    for (; p < a.length && (n.lastIndex = p, d = n.exec(a), d !== null); ) p = n.lastIndex, n === v ? d[1] === "!--" ? n = K : d[1] !== void 0 ? n = Z : d[2] !== void 0 ? (ne.test(d[2]) && (r = RegExp("</" + d[2], "g")), n = S) : d[3] !== void 0 && (n = S) : n === S ? d[0] === ">" ? (n = r ?? v, l = -1) : d[1] === void 0 ? l = -2 : (l = n.lastIndex - d[2].length, c = d[1], n = d[3] === void 0 ? S : d[3] === '"' ? X : Q) : n === X || n === Q ? n = S : n === K || n === Z ? n = v : (n = S, r = void 0);
    const g = n === S && i[h + 1].startsWith("/>") ? " " : "";
    s += n === v ? a + _e : l >= 0 ? (o.push(c), a.slice(0, l) + ie + a.slice(l) + f + g) : a + f + (l === -2 ? h : g);
  }
  return [le(i, s + (i[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), o];
};
class B {
  constructor({ strings: e, _$litType$: t }, o) {
    let r;
    this.parts = [];
    let s = 0, n = 0;
    const h = e.length - 1, a = this.parts, [c, d] = ve(e, t);
    if (this.el = B.createElement(c, o), m.currentNode = this.el.content, t === 2 || t === 3) {
      const l = this.el.content.firstChild;
      l.replaceWith(...l.childNodes);
    }
    for (; (r = m.nextNode()) !== null && a.length < h; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const l of r.getAttributeNames()) if (l.endsWith(ie)) {
          const p = d[n++], g = r.getAttribute(l).split(f), T = /([.?@])?(.*)/.exec(p);
          a.push({ type: 1, index: s, name: T[2], strings: g, ctor: T[1] === "." ? Ae : T[1] === "?" ? Ce : T[1] === "@" ? Ee : x }), r.removeAttribute(l);
        } else l.startsWith(f) && (a.push({ type: 6, index: s }), r.removeAttribute(l));
        if (ne.test(r.tagName)) {
          const l = r.textContent.split(f), p = l.length - 1;
          if (p > 0) {
            r.textContent = R ? R.emptyScript : "";
            for (let g = 0; g < p; g++) r.append(l[g], C()), m.nextNode(), a.push({ type: 2, index: ++s });
            r.append(l[p], C());
          }
        }
      } else if (r.nodeType === 8) if (r.data === se) a.push({ type: 2, index: s });
      else {
        let l = -1;
        for (; (l = r.data.indexOf(f, l + 1)) !== -1; ) a.push({ type: 7, index: s }), l += f.length - 1;
      }
      s++;
    }
  }
  static createElement(e, t) {
    const o = y.createElement("template");
    return o.innerHTML = e, o;
  }
}
function $(i, e, t = i, o) {
  if (e === _) return e;
  let r = o !== void 0 ? t._$Co?.[o] : t._$Cl;
  const s = E(e) ? void 0 : e._$litDirective$;
  return r?.constructor !== s && (r?._$AO?.(!1), s === void 0 ? r = void 0 : (r = new s(i), r._$AT(i, t, o)), o !== void 0 ? (t._$Co ??= [])[o] = r : t._$Cl = r), r !== void 0 && (e = $(i, r._$AS(i, e.values), r, o)), e;
}
class be {
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
    const { el: { content: t }, parts: o } = this._$AD, r = (e?.creationScope ?? y).importNode(t, !0);
    m.currentNode = r;
    let s = m.nextNode(), n = 0, h = 0, a = o[0];
    for (; a !== void 0; ) {
      if (n === a.index) {
        let c;
        a.type === 2 ? c = new H(s, s.nextSibling, this, e) : a.type === 1 ? c = new a.ctor(s, a.name, a.strings, this, e) : a.type === 6 && (c = new Be(s, this, e)), this._$AV.push(c), a = o[++h];
      }
      n !== a?.index && (s = m.nextNode(), n++);
    }
    return m.currentNode = y, r;
  }
  p(e) {
    let t = 0;
    for (const o of this._$AV) o !== void 0 && (o.strings !== void 0 ? (o._$AI(e, o, t), t += o.strings.length - 2) : o._$AI(e[t])), t++;
  }
}
class H {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, t, o, r) {
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = o, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
    e = $(this, e, t), E(e) ? e === u || e == null || e === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : e !== this._$AH && e !== _ && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : $e(e) ? this.k(e) : this._(e);
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
    const { values: t, _$litType$: o } = e, r = typeof o == "number" ? this._$AC(e) : (o.el === void 0 && (o.el = B.createElement(le(o.h, o.h[0]), this.options)), o);
    if (this._$AH?._$AD === r) this._$AH.p(t);
    else {
      const s = new be(r, this), n = s.u(this.options);
      s.p(t), this.T(n), this._$AH = s;
    }
  }
  _$AC(e) {
    let t = ee.get(e.strings);
    return t === void 0 && ee.set(e.strings, t = new B(e)), t;
  }
  k(e) {
    W(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let o, r = 0;
    for (const s of e) r === t.length ? t.push(o = new H(this.O(C()), this.O(C()), this, this.options)) : o = t[r], o._$AI(s), r++;
    r < t.length && (this._$AR(o && o._$AB.nextSibling, r), t.length = r);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    for (this._$AP?.(!1, !0, t); e !== this._$AB; ) {
      const o = Y(e).nextSibling;
      Y(e).remove(), e = o;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class x {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, o, r, s) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = s, o.length > 2 || o[0] !== "" || o[1] !== "" ? (this._$AH = Array(o.length - 1).fill(new String()), this.strings = o) : this._$AH = u;
  }
  _$AI(e, t = this, o, r) {
    const s = this.strings;
    let n = !1;
    if (s === void 0) e = $(this, e, t, 0), n = !E(e) || e !== this._$AH && e !== _, n && (this._$AH = e);
    else {
      const h = e;
      let a, c;
      for (e = s[0], a = 0; a < s.length - 1; a++) c = $(this, h[o + a], t, a), c === _ && (c = this._$AH[a]), n ||= !E(c) || c !== this._$AH[a], c === u ? e = u : e !== u && (e += (c ?? "") + s[a + 1]), this._$AH[a] = c;
    }
    n && !r && this.j(e);
  }
  j(e) {
    e === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Ae extends x {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === u ? void 0 : e;
  }
}
class Ce extends x {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== u);
  }
}
class Ee extends x {
  constructor(e, t, o, r, s) {
    super(e, t, o, r, s), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = $(this, e, t, 0) ?? u) === _) return;
    const o = this._$AH, r = e === u && o !== u || e.capture !== o.capture || e.once !== o.once || e.passive !== o.passive, s = e !== u && (o === u || r);
    r && this.element.removeEventListener(this.name, this, o), s && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Be {
  constructor(e, t, o) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = o;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    $(this, e);
  }
}
const He = G.litHtmlPolyfillSupport;
He?.(B, H), (G.litHtmlVersions ??= []).push("3.3.2");
const Te = (i, e, t) => {
  const o = t?.renderBefore ?? e;
  let r = o._$litPart$;
  if (r === void 0) {
    const s = t?.renderBefore ?? null;
    o._$litPart$ = r = new H(e.insertBefore(C(), s), s, void 0, t ?? {});
  }
  return r._$AI(i), r;
};
const I = globalThis;
class A extends w {
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
    return _;
  }
}
A._$litElement$ = !0, A.finalized = !0, I.litElementHydrateSupport?.({ LitElement: A });
const Pe = I.litElementPolyfillSupport;
Pe?.({ LitElement: A });
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
    consStripGridTitle: "Import Enedis par créneau",
    consStripGridTitleTempo: "Import Enedis par créneau et couleur",
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
    solarProdTitle: "Production solaire (énergie)",
    solarProdSegHome: "Autoconso",
    solarProdSegBattery: "Vers batterie",
    solarProdSegExport: "Vers réseau",
    solarProdKwhTip: "Énergie (kWh) sur la journée ou la période affichée : autoconsommation solaire, charge batterie depuis le PV, surplus PV réinjecté (part diagnostiquée — voir Réinjection — pas forcément tout l’export physique).",
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
    editorShowSolarProductionBar: "Barre production solaire",
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
    consStripGridTitle: "Grid import by slot",
    consStripGridTitleTempo: "Grid import by slot and day colour",
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
    solarProdTitle: "Solar production (energy)",
    solarProdSegHome: "Self-use",
    solarProdSegBattery: "To battery",
    solarProdSegExport: "To grid",
    solarProdKwhTip: "Energy (kWh) for the selected day or range: solar self-use, PV to battery charging, PV surplus fed to grid (attributed share — see Reinjection — not necessarily all physical export).",
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
    editorShowSolarProductionBar: "Solar production bar",
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
function Re(i, e) {
  let t = String(i);
  for (const [o, r] of Object.entries(e))
    t = t.split(`{${o}}`).join(String(r));
  return t;
}
const L = "custom:hub-energie-card", D = /* @__PURE__ */ new Set([24, 12, 6, 3, 1]), Oe = [1, 3, 6, 12, 24], xe = [
  ["show_day_slots", "editorShowDaySlots"],
  ["show_live_power", "editorShowLivePower"],
  ["show_solar_production_bar", "editorShowSolarProductionBar"],
  ["show_battery_bar", "editorShowBatteryBar"],
  ["show_insights_bar", "editorShowInsightsBar"],
  ["show_red_hp_warning", "editorShowRedHpWarning"],
  ["show_consumption", "editorShowConsumption"],
  ["show_cost", "editorShowCost"],
  ["show_savings", "editorShowSavings"],
  ["show_reinjection", "editorShowReinjection"],
  ["show_raw_control", "editorShowRawControl"]
];
class je extends A {
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
    this._config = e && typeof e == "object" ? { ...e } : { type: L }, this._config.type || (this._config.type = L);
  }
  _i18n() {
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? te.en : te.fr;
  }
  _sectionOn(e) {
    const t = this._config?.[e];
    return t !== !1 && t !== "false";
  }
  render() {
    const e = this._config ?? {}, t = this._i18n(), o = parseFloat(e.power_history_hours), r = Math.trunc(o), s = D.has(r) ? r : 6;
    return k`
      <div class="card-config">
        <div class="field">
          <ha-select
            label=${t.editorPowerGraphWindow}
            .value=${String(s)}
            @closed=${this._onPowerHoursClosed}
            .fixedMenuPosition=${!0}
            .naturalMenuWidth=${!0}
          >
            ${Oe.map(
      (n) => k`<ha-list-item value="${String(n)}">${Re(t.editorPowerHoursUnit, { n })}</ha-list-item>`
    )}
          </ha-select>
          <p class="hint">${t.editorPowerHoursHint}</p>
        </div>

        <div class="sections-title">${t.editorSectionsTitle}</div>
        ${xe.map(
      ([n, h]) => k`
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
    t.type = L, this.dispatchEvent(
      new CustomEvent("config-changed", {
        bubbles: !0,
        composed: !0,
        detail: { config: t }
      })
    );
  }
  _setSectionFlag(e, t) {
    const o = { ...this._config };
    t ? delete o[e] : o[e] = !1, this._emit(o);
  }
  _onPowerHoursClosed(e) {
    e.stopPropagation();
    const t = e.target;
    if (!t?.value) return;
    const o = Math.trunc(Number(t.value));
    if (!D.has(o)) return;
    const r = parseFloat(this._config?.power_history_hours), s = D.has(Math.trunc(r)) ? Math.trunc(r) : 6;
    if (o === s) return;
    const n = { ...this._config, power_history_hours: o };
    this._emit(n);
  }
}
customElements.get("hub-energie-card-editor") || customElements.define("hub-energie-card-editor", je);
export {
  u as A,
  te as I,
  ce as a,
  k as b,
  A as i,
  Re as t,
  De as w
};
