const zt = globalThis, de = zt.ShadowRoot && (zt.ShadyCSS === void 0 || zt.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ue = /* @__PURE__ */ Symbol(), we = /* @__PURE__ */ new WeakMap();
let Pe = class {
  constructor(t, e, r) {
    if (this._$cssResult$ = !0, r !== ue) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (de && t === void 0) {
      const r = e !== void 0 && e.length === 1;
      r && (t = we.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), r && we.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Ue = (i) => new Pe(typeof i == "string" ? i : i + "", void 0, ue), ct = (i, ...t) => {
  const e = i.length === 1 ? i[0] : t.reduce((r, o, s) => r + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + i[s + 1], i[0]);
  return new Pe(e, i, ue);
}, Ve = (i, t) => {
  if (de) i.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const r = document.createElement("style"), o = zt.litNonce;
    o !== void 0 && r.setAttribute("nonce", o), r.textContent = e.cssText, i.appendChild(r);
  }
}, ye = de ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const r of t.cssRules) e += r.cssText;
  return Ue(e);
})(i) : i;
const { is: Ke, defineProperty: Xe, getOwnPropertyDescriptor: qe, getOwnPropertyNames: Ye, getOwnPropertySymbols: Ze, getPrototypeOf: Je } = Object, Xt = globalThis, _e = Xt.trustedTypes, Qe = _e ? _e.emptyScript : "", tr = Xt.reactiveElementPolyfillSupport, Et = (i, t) => i, he = { toAttribute(i, t) {
  switch (t) {
    case Boolean:
      i = i ? Qe : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, t) {
  let e = i;
  switch (t) {
    case Boolean:
      e = i !== null;
      break;
    case Number:
      e = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(i);
      } catch {
        e = null;
      }
  }
  return e;
} }, De = (i, t) => !Ke(i, t), ve = { attribute: !0, type: String, converter: he, reflect: !1, useDefault: !1, hasChanged: De };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), Xt.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let ft = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = ve) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const r = /* @__PURE__ */ Symbol(), o = this.getPropertyDescriptor(t, r, e);
      o !== void 0 && Xe(this.prototype, t, o);
    }
  }
  static getPropertyDescriptor(t, e, r) {
    const { get: o, set: s } = qe(this.prototype, t) ?? { get() {
      return this[e];
    }, set(a) {
      this[e] = a;
    } };
    return { get: o, set(a) {
      const l = o?.call(this);
      s?.call(this, a), this.requestUpdate(t, l, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? ve;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Et("elementProperties"))) return;
    const t = Je(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Et("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Et("properties"))) {
      const e = this.properties, r = [...Ye(e), ...Ze(e)];
      for (const o of r) this.createProperty(o, e[o]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [r, o] of e) this.elementProperties.set(r, o);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, r] of this.elementProperties) {
      const o = this._$Eu(e, r);
      o !== void 0 && this._$Eh.set(o, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const r = new Set(t.flat(1 / 0).reverse());
      for (const o of r) e.unshift(ye(o));
    } else t !== void 0 && e.push(ye(t));
    return e;
  }
  static _$Eu(t, e) {
    const r = e.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const r of e.keys()) this.hasOwnProperty(r) && (t.set(r, this[r]), delete this[r]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Ve(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, r) {
    this._$AK(t, r);
  }
  _$ET(t, e) {
    const r = this.constructor.elementProperties.get(t), o = this.constructor._$Eu(t, r);
    if (o !== void 0 && r.reflect === !0) {
      const s = (r.converter?.toAttribute !== void 0 ? r.converter : he).toAttribute(e, r.type);
      this._$Em = t, s == null ? this.removeAttribute(o) : this.setAttribute(o, s), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const r = this.constructor, o = r._$Eh.get(t);
    if (o !== void 0 && this._$Em !== o) {
      const s = r.getPropertyOptions(o), a = typeof s.converter == "function" ? { fromAttribute: s.converter } : s.converter?.fromAttribute !== void 0 ? s.converter : he;
      this._$Em = o;
      const l = a.fromAttribute(e, s.type);
      this[o] = l ?? this._$Ej?.get(o) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, r, o = !1, s) {
    if (t !== void 0) {
      const a = this.constructor;
      if (o === !1 && (s = this[t]), r ??= a.getPropertyOptions(t), !((r.hasChanged ?? De)(s, e) || r.useDefault && r.reflect && s === this._$Ej?.get(t) && !this.hasAttribute(a._$Eu(t, r)))) return;
      this.C(t, e, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: r, reflect: o, wrapped: s }, a) {
    r && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, a ?? e ?? this[t]), s !== !0 || a !== void 0) || (this._$AL.has(t) || (this.hasUpdated || r || (e = void 0), this._$AL.set(t, e)), o === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [o, s] of this._$Ep) this[o] = s;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [o, s] of r) {
        const { wrapped: a } = s, l = this[o];
        a !== !0 || this._$AL.has(o) || l === void 0 || this.C(o, void 0, s, l);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((r) => r.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (r) {
      throw t = !1, this._$EM(), r;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
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
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
ft.elementStyles = [], ft.shadowRootOptions = { mode: "open" }, ft[Et("elementProperties")] = /* @__PURE__ */ new Map(), ft[Et("finalized")] = /* @__PURE__ */ new Map(), tr?.({ ReactiveElement: ft }), (Xt.reactiveElementVersions ??= []).push("2.1.2");
const ge = globalThis, xe = (i) => i, Ut = ge.trustedTypes, $e = Ut ? Ut.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, Re = "$lit$", Y = `lit$${Math.random().toFixed(9).slice(2)}$`, Oe = "?" + Y, er = `<${Oe}>`, at = document, Lt = () => at.createComment(""), Mt = (i) => i === null || typeof i != "object" && typeof i != "function", me = Array.isArray, rr = (i) => me(i) || typeof i?.[Symbol.iterator] == "function", oe = `[ 	
\f\r]`, Ct = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Se = /-->/g, ke = />/g, rt = RegExp(`>|${oe}(?:([^\\s"'>=/]+)(${oe}*=${oe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Be = /'/g, Te = /"/g, je = /^(?:script|style|textarea|title)$/i, Ie = (i) => (t, ...e) => ({ _$litType$: i, strings: t, values: e }), v = Ie(1), bt = Ie(2), yt = /* @__PURE__ */ Symbol.for("lit-noChange"), y = /* @__PURE__ */ Symbol.for("lit-nothing"), Ce = /* @__PURE__ */ new WeakMap(), it = at.createTreeWalker(at, 129);
function We(i, t) {
  if (!me(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return $e !== void 0 ? $e.createHTML(t) : t;
}
const or = (i, t) => {
  const e = i.length - 1, r = [];
  let o, s = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", a = Ct;
  for (let l = 0; l < e; l++) {
    const n = i[l];
    let d, h, p = -1, u = 0;
    for (; u < n.length && (a.lastIndex = u, h = a.exec(n), h !== null); ) u = a.lastIndex, a === Ct ? h[1] === "!--" ? a = Se : h[1] !== void 0 ? a = ke : h[2] !== void 0 ? (je.test(h[2]) && (o = RegExp("</" + h[2], "g")), a = rt) : h[3] !== void 0 && (a = rt) : a === rt ? h[0] === ">" ? (a = o ?? Ct, p = -1) : h[1] === void 0 ? p = -2 : (p = a.lastIndex - h[2].length, d = h[1], a = h[3] === void 0 ? rt : h[3] === '"' ? Te : Be) : a === Te || a === Be ? a = rt : a === Se || a === ke ? a = Ct : (a = rt, o = void 0);
    const m = a === rt && i[l + 1].startsWith("/>") ? " " : "";
    s += a === Ct ? n + er : p >= 0 ? (r.push(d), n.slice(0, p) + Re + n.slice(p) + Y + m) : n + Y + (p === -2 ? l : m);
  }
  return [We(i, s + (i[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
};
class Ft {
  constructor({ strings: t, _$litType$: e }, r) {
    let o;
    this.parts = [];
    let s = 0, a = 0;
    const l = t.length - 1, n = this.parts, [d, h] = or(t, e);
    if (this.el = Ft.createElement(d, r), it.currentNode = this.el.content, e === 2 || e === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (o = it.nextNode()) !== null && n.length < l; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const p of o.getAttributeNames()) if (p.endsWith(Re)) {
          const u = h[a++], m = o.getAttribute(p).split(Y), f = /([.?@])?(.*)/.exec(u);
          n.push({ type: 1, index: s, name: f[2], strings: m, ctor: f[1] === "." ? sr : f[1] === "?" ? ar : f[1] === "@" ? nr : qt }), o.removeAttribute(p);
        } else p.startsWith(Y) && (n.push({ type: 6, index: s }), o.removeAttribute(p));
        if (je.test(o.tagName)) {
          const p = o.textContent.split(Y), u = p.length - 1;
          if (u > 0) {
            o.textContent = Ut ? Ut.emptyScript : "";
            for (let m = 0; m < u; m++) o.append(p[m], Lt()), it.nextNode(), n.push({ type: 2, index: ++s });
            o.append(p[u], Lt());
          }
        }
      } else if (o.nodeType === 8) if (o.data === Oe) n.push({ type: 2, index: s });
      else {
        let p = -1;
        for (; (p = o.data.indexOf(Y, p + 1)) !== -1; ) n.push({ type: 7, index: s }), p += Y.length - 1;
      }
      s++;
    }
  }
  static createElement(t, e) {
    const r = at.createElement("template");
    return r.innerHTML = t, r;
  }
}
function _t(i, t, e = i, r) {
  if (t === yt) return t;
  let o = r !== void 0 ? e._$Co?.[r] : e._$Cl;
  const s = Mt(t) ? void 0 : t._$litDirective$;
  return o?.constructor !== s && (o?._$AO?.(!1), s === void 0 ? o = void 0 : (o = new s(i), o._$AT(i, e, r)), r !== void 0 ? (e._$Co ??= [])[r] = o : e._$Cl = o), o !== void 0 && (t = _t(i, o._$AS(i, t.values), o, r)), t;
}
class ir {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: r } = this._$AD, o = (t?.creationScope ?? at).importNode(e, !0);
    it.currentNode = o;
    let s = it.nextNode(), a = 0, l = 0, n = r[0];
    for (; n !== void 0; ) {
      if (a === n.index) {
        let d;
        n.type === 2 ? d = new Nt(s, s.nextSibling, this, t) : n.type === 1 ? d = new n.ctor(s, n.name, n.strings, this, t) : n.type === 6 && (d = new lr(s, this, t)), this._$AV.push(d), n = r[++l];
      }
      a !== n?.index && (s = it.nextNode(), a++);
    }
    return it.currentNode = at, o;
  }
  p(t) {
    let e = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(t, r, e), e += r.strings.length - 2) : r._$AI(t[e])), e++;
  }
}
class Nt {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, r, o) {
    this.type = 2, this._$AH = y, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = r, this.options = o, this._$Cv = o?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && t?.nodeType === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = _t(this, t, e), Mt(t) ? t === y || t == null || t === "" ? (this._$AH !== y && this._$AR(), this._$AH = y) : t !== this._$AH && t !== yt && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : rr(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== y && Mt(this._$AH) ? this._$AA.nextSibling.data = t : this.T(at.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: r } = t, o = typeof r == "number" ? this._$AC(t) : (r.el === void 0 && (r.el = Ft.createElement(We(r.h, r.h[0]), this.options)), r);
    if (this._$AH?._$AD === o) this._$AH.p(e);
    else {
      const s = new ir(o, this), a = s.u(this.options);
      s.p(e), this.T(a), this._$AH = s;
    }
  }
  _$AC(t) {
    let e = Ce.get(t.strings);
    return e === void 0 && Ce.set(t.strings, e = new Ft(t)), e;
  }
  k(t) {
    me(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let r, o = 0;
    for (const s of t) o === e.length ? e.push(r = new Nt(this.O(Lt()), this.O(Lt()), this, this.options)) : r = e[o], r._$AI(s), o++;
    o < e.length && (this._$AR(r && r._$AB.nextSibling, o), e.length = o);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const r = xe(t).nextSibling;
      xe(t).remove(), t = r;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class qt {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, r, o, s) {
    this.type = 1, this._$AH = y, this._$AN = void 0, this.element = t, this.name = e, this._$AM = o, this.options = s, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = y;
  }
  _$AI(t, e = this, r, o) {
    const s = this.strings;
    let a = !1;
    if (s === void 0) t = _t(this, t, e, 0), a = !Mt(t) || t !== this._$AH && t !== yt, a && (this._$AH = t);
    else {
      const l = t;
      let n, d;
      for (t = s[0], n = 0; n < s.length - 1; n++) d = _t(this, l[r + n], e, n), d === yt && (d = this._$AH[n]), a ||= !Mt(d) || d !== this._$AH[n], d === y ? t = y : t !== y && (t += (d ?? "") + s[n + 1]), this._$AH[n] = d;
    }
    a && !o && this.j(t);
  }
  j(t) {
    t === y ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class sr extends qt {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === y ? void 0 : t;
  }
}
class ar extends qt {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== y);
  }
}
class nr extends qt {
  constructor(t, e, r, o, s) {
    super(t, e, r, o, s), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = _t(this, t, e, 0) ?? y) === yt) return;
    const r = this._$AH, o = t === y && r !== y || t.capture !== r.capture || t.once !== r.once || t.passive !== r.passive, s = t !== y && (r === y || o);
    o && this.element.removeEventListener(this.name, this, r), s && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class lr {
  constructor(t, e, r) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    _t(this, t);
  }
}
const cr = ge.litHtmlPolyfillSupport;
cr?.(Ft, Nt), (ge.litHtmlVersions ??= []).push("3.3.2");
const hr = (i, t, e) => {
  const r = e?.renderBefore ?? t;
  let o = r._$litPart$;
  if (o === void 0) {
    const s = e?.renderBefore ?? null;
    r._$litPart$ = o = new Nt(t.insertBefore(Lt(), s), s, void 0, e ?? {});
  }
  return o._$AI(i), o;
};
const be = globalThis;
class W extends ft {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = hr(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return yt;
  }
}
W._$litElement$ = !0, W.finalized = !0, be.litElementHydrateSupport?.({ LitElement: W });
const pr = be.litElementPolyfillSupport;
pr?.({ LitElement: W });
(be.litElementVersions ??= []).push("4.2.2");
const He = Object.freeze({
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
    costEntityCardHint: "Ajoutez dans la carte : <code>cost_entity: sensor.hub_energie_cost_detail</code>",
    costEntityDevHint: "(Outils de développement → États, cherchez « hub energie cost detail »).",
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
    sectionConsumption: "Consommation"
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
    costEntityCardHint: "Add to the card YAML: <code>cost_entity: sensor.hub_energie_cost_detail</code>",
    costEntityDevHint: '(Developer tools → States, search for "hub energie cost detail").',
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
    sectionConsumption: "Consumption"
  }
}), Ae = "#9e9e9e", dr = "#8d6e63", Gt = "#7e57c2", nt = "#fdd835", lt = "#66bb6a", pe = [24, 12, 6, 3, 1], ot = 6;
function At(i, t = ot) {
  if (!Number.isFinite(i)) return t;
  const e = Math.trunc(i);
  return pe.includes(e) ? e : pe.reduce(
    (r, o) => Math.abs(o - e) < Math.abs(r - e) ? o : r,
    t
  );
}
const st = Object.freeze([
  { id: "bleu_hc", label: "Blue HC", color: "#1e88e5" },
  { id: "bleu_hp", label: "Blue HP", color: "#1e88e5" },
  { id: "blanc_hc", label: "White HC", color: "#b0bec5" },
  { id: "blanc_hp", label: "White HP", color: "#b0bec5" },
  { id: "rouge_hc", label: "Red HC", color: "#e53935" },
  { id: "rouge_hp", label: "Red HP", color: "#e53935" },
  { id: "unknown", label: "Unknown", color: "#78909c" }
]), Yt = "Europe/Paris";
function ze(i = /* @__PURE__ */ new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: Yt,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(i);
}
const M = () => ze();
function K(i) {
  const t = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(i));
  if (!t) return /* @__PURE__ */ new Date(NaN);
  const e = `${t[1]}-${t[2]}-${t[3]}`, r = Number(t[1]), o = Number(t[2]), s = Number(t[3]), a = Date.UTC(r, o - 1, s - 1, 18, 0, 0), l = Date.UTC(r, o - 1, s + 1, 6, 0, 0), n = new Intl.DateTimeFormat("en-CA", {
    timeZone: Yt,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  for (let d = a; d <= l; d += 6e4) {
    const h = n.formatToParts(new Date(d)), p = (m) => h.find((f) => f.type === m)?.value ?? "";
    if (`${p("year")}-${p("month")}-${p("day")}` === e && p("hour") === "00" && p("minute") === "00" && p("second") === "00")
      return new Date(d);
  }
  return /* @__PURE__ */ new Date(NaN);
}
function Vt(i, t) {
  const e = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(i));
  if (!e) return M();
  const r = Number(e[1]), o = Number(e[2]), s = Number(e[3]);
  return new Date(Date.UTC(r, o - 1, s + t)).toISOString().slice(0, 10);
}
function ur(i) {
  const t = K(i).getTime();
  if (!Number.isFinite(t)) return 0;
  const e = new Intl.DateTimeFormat("en-GB", {
    timeZone: Yt,
    weekday: "short"
  }).format(new Date(t));
  return { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }[e] ?? 0;
}
const gr = (i) => ze(new Date(i));
function mr(i, t) {
  const r = /^\d{4}-\d{2}-\d{2}$/.test(String(i)) ? String(i) : M();
  let o;
  if (t === "week") {
    const s = ur(r);
    o = Vt(r, -s);
  } else t === "month" ? o = `${r.slice(0, 7)}-01` : t === "year" ? o = `${r.slice(0, 4)}-01-01` : o = r;
  return { startIso: o, endIso: r };
}
function ie(i, t) {
  const e = K(i);
  return Number.isFinite(e.getTime()) ? e.toLocaleDateString(t, {
    timeZone: Yt,
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }) : String(i);
}
function br(i, t, e) {
  return i === t ? ie(t, e) : `${ie(i, e)} - ${ie(t, e)}`;
}
const U = (i, t) => {
  const e = parseFloat(i?.[t]?.state);
  return Number.isFinite(e) ? e : 0;
}, I = (i, t, e) => {
  const r = parseFloat(i?.[t]?.attributes?.[e]);
  return Number.isFinite(r) ? r : 0;
}, P = (i, t, e) => {
  const r = i?.[t]?.attributes?.[e];
  if (r == null || r === "") return null;
  const o = Number(r);
  return Number.isFinite(o) ? o : null;
}, G = (i) => {
  const t = Number(i);
  if (!Number.isFinite(t)) return "—";
  const e = Math.abs(t);
  return e >= 1e3 ? `${(t / 1e3).toFixed(e >= 1e4 ? 0 : 1)} kW` : `${Math.round(t)} W`;
}, fr = (i) => {
  const t = Number(i), e = Number.isFinite(t) ? t : 0;
  return e < 1 ? `${Math.round(e * 1e3)} Wh` : `${e.toFixed(2)} kWh`;
}, It = (i) => {
  const e = (i ?? []).map((r) => Number(r)).filter((r) => Number.isFinite(r)).some((r) => r >= 1);
  return (r) => {
    const o = Number(r), s = Number.isFinite(o) ? o : 0;
    return e ? `${s.toFixed(2)} kWh` : `${Math.round(s * 1e3)} Wh`;
  };
}, wr = {
  reseau: "mdi:transmission-tower",
  réseau: "mdi:transmission-tower",
  grid: "mdi:transmission-tower",
  solaire: "mdi:weather-sunny",
  solar: "mdi:weather-sunny",
  batterie: "mdi:battery",
  battery: "mdi:battery",
  "surplus pv": "mdi:solar-power-variant",
  "solar surplus": "mdi:solar-power-variant",
  "batt pleine": "mdi:battery-off",
  "battery full": "mdi:battery-off",
  latence: "mdi:timer-sand",
  "switch latency": "mdi:timer-sand",
  autre: "mdi:help-circle-outline",
  other: "mdi:help-circle-outline",
  abonnement: "mdi:calendar-month",
  subscription: "mdi:calendar-month"
};
function yr(i) {
  const t = String(i ?? "").toLowerCase();
  for (const [e, r] of Object.entries(wr))
    if (t.includes(e)) return r;
  return null;
}
function _r(i) {
  const t = String(i ?? "").toLowerCase();
  return /\b(bleu|blanc|rouge)\b/.test(t) || /\b(hc|hp)\b/.test(t);
}
function vr(i) {
  const t = String(i ?? "").toLowerCase();
  return t.includes(" hc") || t.endsWith("hc") || t.includes("heures creuses") || t.includes("off-peak");
}
function xr(i) {
  const e = String(i ?? "").trim().match(/^#([0-9a-f]{6})$/i);
  if (!e) return !1;
  const r = e[1], o = parseInt(r.slice(0, 2), 16), s = parseInt(r.slice(2, 4), 16), a = parseInt(r.slice(4, 6), 16);
  return (0.2126 * o + 0.7152 * s + 0.0722 * a) / 255 >= 0.68;
}
function Ee(i) {
  const t = Math.max(0, Math.round(i)), e = Math.floor(t / 60), r = t % 60;
  return `${e}h ${r}min`;
}
const Le = Object.freeze([
  ...st.map((i) => `${i.id}_eur`),
  "abonnement_eur",
  "export_due_to_solar_surplus_kwh",
  "export_due_to_battery_full_or_absent_kwh",
  "export_due_to_switch_latency_kwh",
  "export_unattributed_kwh",
  "export_opportunity_cost_total_eur",
  "export_opportunity_cost_solar_surplus_eur",
  "export_opportunity_cost_battery_full_or_absent_eur",
  "export_opportunity_cost_switch_latency_eur",
  "export_opportunity_cost_unattributed_eur"
]), Me = Object.freeze([
  "grid_by_slot_kwh",
  "maison_by_slot_kwh"
]);
function $r(i) {
  const t = i;
  return {
    cost: `${t}cost_detail`,
    ecoSolar: `${t}savings_solar_eur`,
    ecoBatt: `${t}savings_battery_eur`,
    originGrid: `${t}origin_grid_kwh`,
    originSolar: `${t}origin_solar_kwh`,
    usageGridDirect: `${t}usage_grid_direct_kwh`,
    usageGridBatt: `${t}usage_grid_batt_charge_kwh`,
    usageSolarDirect: `${t}usage_solar_direct_kwh`,
    usageSolarBatt: `${t}usage_solar_batt_charge_kwh`,
    usageBattHome: `${t}usage_batt_home_kwh`
  };
}
function se(i, t) {
  if (!i || typeof i != "object") return 0;
  const e = i[t], r = typeof e == "number" ? e : parseFloat(e);
  return Number.isFinite(r) ? r : 0;
}
function ae(i, t) {
  return !!i?.[t];
}
function Sr(i) {
  return i === "hphc" ? "HP/HC" : i === "base" ? "BASE" : "TEMPO";
}
function j(i, t, e) {
  const r = e?.emDash ?? "—";
  return i ? t === "base" ? e?.slotBase ?? "Base" : t === "hphc" ? i.endsWith("_hc") ? e?.slotHc ?? "HC" : e?.slotHp ?? "HP" : {
    bleu_hc: e?.slotBleuHc,
    bleu_hp: e?.slotBleuHp,
    blanc_hc: e?.slotBlancHc,
    blanc_hp: e?.slotBlancHp,
    rouge_hc: e?.slotRougeHc,
    rouge_hp: e?.slotRougeHp,
    unknown: e?.slotUnknown
  }[i] ?? i : r;
}
function kr(i, t) {
  const e = String(i ?? "").toLowerCase();
  return e.includes("blue") || e.includes("bleu") ? t?.tempoDayBlue ?? "Blue" : e.includes("white") || e.includes("blanc") ? t?.tempoDayWhite ?? "White" : e.includes("red") || e.includes("rouge") ? t?.tempoDayRed ?? "Red" : e === "n/a" ? t?.dayColorNA ?? "N/A" : e || (t?.emDash ?? "—");
}
function Fe(i) {
  const t = String(i ?? "").toLowerCase();
  return t.includes("blue") || t.includes("bleu") ? "color-blue" : t.includes("white") || t.includes("blanc") ? "color-white" : t.includes("red") || t.includes("rouge") ? "color-red" : "color-na";
}
function Ge(i, t, e) {
  return !t || typeof t != "object" ? [] : st.map((r) => {
    const o = t[r.id], s = typeof o == "number" ? o : parseFloat(o);
    return !Number.isFinite(s) || s <= 1e-4 ? null : {
      label: j(r.id, i, e),
      v: s,
      color: r.color,
      isHc: r.id.endsWith("_hc")
    };
  }).filter(Boolean);
}
function Wt(i) {
  return !i || typeof i != "object" ? "" : st.map((t) => {
    const e = i[t.id], r = typeof e == "number" ? e : parseFloat(e);
    return `${t.id}:${Number.isFinite(r) ? r : 0}`;
  }).join(",");
}
function Br(i, t, e) {
  const r = i, o = r?.[t.cost]?.attributes ?? {}, s = String(o.offer ?? "tempo").toLowerCase(), a = String(o.contract_power ?? ""), l = String(o.current_slot ?? ""), n = o.tempo_days ?? null, d = o.today_color ?? null, h = o.tomorrow_color ?? null, p = {
    solarSurplus: I(r, t.cost, "export_due_to_solar_surplus_kwh"),
    batteryFull: I(r, t.cost, "export_due_to_battery_full_or_absent_kwh"),
    switchLatency: I(r, t.cost, "export_due_to_switch_latency_kwh"),
    unattributed: I(r, t.cost, "export_unattributed_kwh"),
    oppTotalEur: I(r, t.cost, "export_opportunity_cost_total_eur"),
    oppSolarEur: I(r, t.cost, "export_opportunity_cost_solar_surplus_eur"),
    oppBatteryEur: I(r, t.cost, "export_opportunity_cost_battery_full_or_absent_eur"),
    oppLatencyEur: I(r, t.cost, "export_opportunity_cost_switch_latency_eur"),
    oppOtherEur: I(r, t.cost, "export_opportunity_cost_unattributed_eur")
  }, u = o.grid_by_slot_kwh, m = o.maison_by_slot_kwh, f = st.map((S) => ({
    ...S,
    label: j(S.id, s, e),
    v: se(u, S.id),
    isHc: S.id.endsWith("_hc")
  })), g = st.map((S) => ({
    ...S,
    label: j(S.id, s, e),
    v: se(m, S.id),
    isHc: S.id.endsWith("_hc")
  })), E = U(r, t.cost), $ = st.map((S) => ({
    ...S,
    label: j(S.id, s, e),
    v: I(r, t.cost, `${S.id}_eur`),
    tooltip: `${se(u, S.id).toFixed(3)} kWh`,
    isHc: S.id.endsWith("_hc")
  })), C = I(r, t.cost, "abonnement_eur"), w = U(r, t.ecoSolar), _ = U(r, t.ecoBatt), k = U(r, t.originGrid), x = U(r, t.originSolar), b = {
    gridDirect: { label: e.usageGridDirect, v: U(r, t.usageGridDirect), color: Gt },
    gridBatt: { label: e.usageGridBatt, v: U(r, t.usageGridBatt), color: dr },
    solarDirect: { label: e.usageSolarDirect, v: U(r, t.usageSolarDirect), color: nt },
    solarBatt: { label: e.usageSolarBatt, v: U(r, t.usageSolarBatt), color: "#fbc02d" },
    battHome: { label: e.usageBattHome, v: U(r, t.usageBattHome), color: lt }
  };
  return {
    grid: f,
    maison: g,
    totalEur: E,
    costs: $,
    abo: C,
    ecoSolar: w,
    ecoBatt: _,
    og: k,
    os: x,
    usage: b,
    costEntityOk: !!r[t.cost],
    offer: s,
    contractPower: a,
    currentSlot: l,
    tempoDays: n,
    todayColor: d,
    tomorrowColor: h,
    reinj: p,
    gridBattBySlot: o.usage_grid_batt_charge_by_slot_kwh,
    solarBattBySlot: o.usage_solar_batt_charge_by_slot_kwh
  };
}
async function Tr(i, t, e, r, o) {
  const s = /^\d{4}-\d{2}-\d{2}$/.test(String(t)) ? String(t) : M(), a = /^\d{4}-\d{2}-\d{2}$/.test(String(e)) ? String(e) : M();
  let l = K(s), n = K(Vt(a, 1));
  Number.isFinite(l.getTime()) || (l = K(M())), Number.isFinite(n.getTime()) || (n = K(Vt(M(), 1)));
  const d = new URLSearchParams({
    filter_entity_id: r.join(","),
    end_time: n.toISOString()
  }), h = `history/period/${encodeURIComponent(l.toISOString())}?${d}`, p = await i.callApi("GET", h), u = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), E = new Set(r);
  for (const _ of Array.isArray(p) ? p : [])
    if (Array.isArray(_))
      for (const k of _) {
        const x = k?.entity_id;
        if (!x || !E.has(x)) continue;
        const b = Date.parse(k?.last_changed ?? k?.last_updated ?? "");
        if (!Number.isFinite(b)) continue;
        const S = gr(b), D = parseFloat(k?.state);
        if (Number.isFinite(D)) {
          u.has(x) || u.set(x, /* @__PURE__ */ new Map());
          const T = u.get(x), A = T.get(S);
          (!A || b >= A.ts) && T.set(S, { ts: b, v: D });
        }
        if (x === o && k?.attributes && typeof k.attributes == "object") {
          for (const T of Le) {
            const A = parseFloat(k.attributes?.[T]);
            if (!Number.isFinite(A)) continue;
            m.has(T) || m.set(T, /* @__PURE__ */ new Map());
            const L = m.get(T), H = L.get(S);
            (!H || b >= H.ts) && L.set(S, { ts: b, v: A });
          }
          for (const T of Me) {
            const A = k.attributes?.[T];
            if (!A || typeof A != "object") continue;
            f.has(T) || f.set(T, /* @__PURE__ */ new Map());
            const L = f.get(T), H = L.get(S);
            (!H || b >= H.ts) && L.set(S, { ts: b, dict: A });
          }
        }
        const N = g.get(x);
        (!N || b > N.ts) && g.set(x, { ts: b, state: k });
      }
  const $ = (_) => [..._?.values() ?? []].reduce((k, x) => k + (x?.v ?? 0), 0), C = (_) => {
    if (!_) return {};
    const k = {};
    for (const x of _.values())
      if (!(!x?.dict || typeof x.dict != "object"))
        for (const [b, S] of Object.entries(x.dict)) {
          const D = typeof S == "number" ? S : parseFloat(S);
          Number.isFinite(D) && (k[b] = (k[b] ?? 0) + D);
        }
    return k;
  }, w = {};
  for (const _ of E) {
    const x = { ...g.get(_)?.state?.attributes ?? {} };
    if (_ === o) {
      for (const b of Le) x[b] = $(m.get(b));
      for (const b of Me) x[b] = C(f.get(b));
    }
    w[_] = {
      entity_id: _,
      state: String($(u.get(_))),
      attributes: x
    };
  }
  return w;
}
function R(i, t) {
  let e = String(i);
  for (const [r, o] of Object.entries(t))
    e = e.split(`{${r}}`).join(String(o));
  return e;
}
function Cr(i, t, e) {
  if (!i?.[t]) return null;
  const r = P(i, t, "grid_power_signed_w"), o = P(i, t, "solar_power_w") ?? P(i, t, "solar_estimate_power_w"), s = P(i, t, "batt_discharge_power_w"), a = P(i, t, "batt_charge_power_w"), l = P(i, t, "load_power_w"), n = P(i, t, "export_power_w"), d = [];
  return r != null ? d.push(r >= 0 ? `${e.segImport} ${r.toFixed(0)} W` : `${e.segExport} ${Math.abs(r).toFixed(0)} W`) : n != null && n > 0 && d.push(`${e.segExport} ${n.toFixed(0)} W`), o != null && d.push(`${e.segSolar} ${o.toFixed(0)} W`), s != null && s > 0 && d.push(`${e.segBattDis} ${s.toFixed(0)} W`), a != null && a > 0 && d.push(`${e.segBattChg} ${a.toFixed(0)} W`), {
    gridSigned: r,
    solar: o,
    battDis: s,
    battChg: a,
    load: l,
    exportW: n,
    tooltip: [e.powerBarTip, d.length ? d.join(" · ") : ""].filter(Boolean).join(" — ")
  };
}
function Hr(i, t) {
  const e = P(i, t, "battery_capacity_kwh"), r = P(i, t, "battery_soc_percent");
  if (e == null || e <= 0 || r == null) return null;
  const o = P(i, t, "battery_soc_min_percent"), s = P(i, t, "battery_soc_max_percent");
  return {
    soc: r,
    socMin: o ?? 0,
    socMax: s ?? 100,
    capacity: e,
    available: P(i, t, "battery_available_kwh"),
    chargeW: P(i, t, "batt_charge_power_w"),
    dischargeW: P(i, t, "batt_discharge_power_w")
  };
}
function Kt(...i) {
  const t = /* @__PURE__ */ new Set();
  for (const e of i)
    for (const r of e) t.add(r);
  return [...t].sort((e, r) => e - r);
}
function Z(i, t) {
  let e = 0, r = null;
  const o = [];
  for (const s of t) {
    for (; e < i.length && i[e].ts <= s; )
      r = i[e].w, e++;
    o.push(r);
  }
  return o;
}
function Ar(i) {
  if (typeof i == "number" && Number.isFinite(i)) return i;
  if (typeof i == "string") {
    const t = Date.parse(i);
    return Number.isFinite(t) ? t : NaN;
  }
  return NaN;
}
function wt(i, t = {}) {
  const e = !!t.allowNegative;
  if (!Array.isArray(i) || !i.length) return [];
  const r = [];
  for (const o of i) {
    const s = Ar(o?.start), a = o?.mean ?? o?.state ?? o?.min ?? o?.max;
    if (!Number.isFinite(s) || a == null) continue;
    const l = parseFloat(a);
    if (!Number.isFinite(l)) continue;
    const n = e ? l : Math.max(0, l);
    r.push({ ts: s, w: n });
  }
  return r.sort((o, s) => o.ts - s.ts), r;
}
function Er(i) {
  if (!i || typeof i != "object") return [];
  const t = /* @__PURE__ */ new Set(), e = [], r = (o) => {
    if (o == null || typeof o != "string") return;
    const s = o.trim();
    !s || t.has(s) || (t.add(s), e.push(s));
  };
  for (const o of i.grid_entities ?? [])
    typeof o == "string" && r(o);
  r(i.solar_entity);
  for (const o of i.batteries ?? [])
    o?.mode === "net" ? r(o.entity) : o?.mode === "in_out" && (r(o.in), r(o.out));
  return r(i.load_entity), e;
}
async function Lr(i, { startTimeIso: t, endTimeIso: e, statisticIds: r, period: o = "5minute" }) {
  const s = i?.connection;
  if (!s?.sendMessagePromise)
    throw new Error("Home Assistant WebSocket not available");
  const a = await s.sendMessagePromise({
    type: "recorder/statistics_during_period",
    start_time: t,
    end_time: e,
    statistic_ids: r,
    period: o,
    types: ["mean", "state"]
  });
  if (a && typeof a == "object" && a.success === !1)
    throw new Error(a.error?.message ?? "recorder/statistics_during_period failed");
  if (a && typeof a == "object" && "result" in a && a.result !== void 0 && !Array.isArray(a.result)) {
    const l = a.result;
    if (l && typeof l == "object") return l;
  }
  return a;
}
function Mr(i, t) {
  const e = i.grid_entities;
  if (!Array.isArray(e) || !e.length) return [];
  const r = [];
  for (const a of e) {
    const l = typeof a == "string" ? a.trim() : "";
    l && r.push(wt(t[l], { allowNegative: !0 }));
  }
  if (!r.length) return [];
  const o = Kt(...r.map((a) => a.map((l) => l.ts)));
  let s = o.map(() => 0);
  for (const a of r) {
    const l = Z(a, o);
    s = s.map((n, d) => n + (l[d] ?? 0));
  }
  return o.map((a, l) => ({ ts: a, w: s[l] }));
}
function Fr(i, t) {
  const e = i.batteries ?? [];
  if (!Array.isArray(e) || !e.length) return [];
  const r = [];
  for (const a of e)
    if (a?.mode === "net" && a.entity) {
      const l = String(a.entity), n = wt(t[l], { allowNegative: !0 }).map((d) => {
        const h = a.net_sign === "positive_charge" ? -d.w : d.w;
        return { ts: d.ts, w: h };
      });
      r.push(n);
    } else if (a?.mode === "in_out") {
      const l = a.in ? String(a.in) : "", n = a.out ? String(a.out) : "", d = l ? wt(t[l]) : [], h = n ? wt(t[n]) : [], p = Kt(
        d.map((f) => f.ts),
        h.map((f) => f.ts)
      );
      if (!p.length) {
        r.push([]);
        continue;
      }
      const u = d.length ? Z(d, p) : p.map(() => null), m = h.length ? Z(h, p) : p.map(() => null);
      r.push(
        p.map((f, g) => ({
          ts: f,
          w: (m[g] ?? 0) - (u[g] ?? 0)
        }))
      );
    }
  if (!r.length) return [];
  const o = Kt(...r.map((a) => a.map((l) => l.ts)));
  let s = o.map(() => 0);
  for (const a of r) {
    if (!a.length) continue;
    const l = Z(a, o);
    s = s.map((n, d) => n + (l[d] ?? 0));
  }
  return o.map((a, l) => ({ ts: a, w: s[l] }));
}
function Gr(i, t) {
  if (!i || typeof i != "object" || !t || typeof t != "object") return null;
  const e = typeof i.solar_entity == "string" ? i.solar_entity.trim() : "", r = typeof i.load_entity == "string" ? i.load_entity.trim() : "", o = Mr(i, t), s = e ? wt(t[e]) : [], a = Fr(i, t), l = r ? wt(t[r]) : [], n = Kt(
    o.map((w) => w.ts),
    s.map((w) => w.ts),
    a.map((w) => w.ts),
    l.map((w) => w.ts)
  );
  if (!n.length) return null;
  const d = o.length ? Z(o, n) : n.map(() => null), h = s.length ? Z(s, n) : n.map(() => null), p = a.length ? Z(a, n) : n.map(() => null), u = l.length ? Z(l, n) : n.map(() => null), m = n.map((w, _) => ({
    ts: w,
    grid: d[_],
    solar: h[_],
    batt: p[_],
    load: u[_]
  }));
  if (!m.some((w) => w.grid != null || w.solar != null || w.batt != null || w.load != null))
    return null;
  let f = 0, g = 0, E = 0, $ = l.length ? 0 : null;
  const C = [];
  for (const w of m)
    w.grid != null && (f = w.grid), w.solar != null && (g = w.solar), w.batt != null && (E = w.batt), l.length && w.load != null && ($ = w.load), C.push({ ts: w.ts, grid: f, solar: g, batt: E, load: l.length ? $ : null });
  return { filled: C };
}
function Nr(i) {
  let t = 0, e = 1;
  for (const r of i) {
    const o = [];
    r.load != null && Number.isFinite(r.load) && o.push(r.load), r.solar != null && Number.isFinite(r.solar) && o.push(r.solar);
    const s = r.batt;
    s != null && Number.isFinite(s) && o.push(Math.max(0, s), Math.max(0, -s)), r.grid != null && Number.isFinite(r.grid) && o.push(r.grid);
    for (const a of o)
      t = Math.min(t, a), e = Math.max(e, a);
  }
  return e - t < 1 && (e = t + 1), { yMin: t, yMax: e };
}
function Pr(i, t) {
  if (!i?.states || !t || typeof t != "object") return null;
  const e = i.states, r = (m) => {
    if (m == null || typeof m != "string") return null;
    const f = m.trim();
    if (!f || !e[f]) return null;
    const g = parseFloat(e[f].state);
    return Number.isFinite(g) ? g : null;
  };
  let o = 0, s = 0;
  for (const m of t.grid_entities ?? []) {
    if (typeof m != "string") continue;
    const f = r(m);
    f != null && (o += f, s++);
  }
  const a = typeof t.solar_entity == "string" ? t.solar_entity.trim() : "", l = a ? r(a) : null, n = l != null ? Math.max(0, l) : null, d = typeof t.load_entity == "string" ? t.load_entity.trim() : "", h = d ? r(d) : null;
  let p = 0, u = 0;
  for (const m of t.batteries ?? [])
    if (m?.mode === "net" && m.entity) {
      const f = r(String(m.entity));
      if (f != null) {
        const g = m.net_sign === "positive_charge" ? -f : f;
        p += g, u++;
      }
    } else if (m?.mode === "in_out") {
      const f = m.in ? r(String(m.in)) : null, g = m.out ? r(String(m.out)) : null;
      (f != null || g != null) && (p += (g ?? 0) - (f ?? 0), u++);
    }
  return !s && n == null && !u && h == null ? null : {
    solar: n,
    batt: u > 0 ? p : null,
    grid: s > 0 ? o : null,
    load: h
  };
}
function Dr(i, t) {
  if (!i?.length) return [];
  if (!t) return i;
  const e = i[i.length - 1], o = {
    ts: Math.max(Date.now(), e.ts + 1),
    solar: t.solar != null ? t.solar : e.solar ?? 0,
    batt: t.batt != null ? t.batt : e.batt ?? 0,
    grid: t.grid != null ? t.grid : e.grid ?? 0,
    load: t.load != null ? t.load : e.load != null ? e.load : null
  };
  return [...i, o];
}
class Rr extends W {
  static get properties() {
    return {
      title: { type: String },
      segments: { attribute: !1 },
      total: { type: Number },
      formatter: { attribute: !1 },
      unit: { type: String },
      tooltip: { type: String },
      breakdown: { attribute: !1 },
      showBreakdown: { type: Boolean },
      displayValue: { type: String },
      fillPercent: { type: Number },
      emptyLabel: { type: String }
    };
  }
  static get styles() {
    return ct`
      :host {
        display: block;
      }
      .cons-strip {
        margin-bottom: 7px;
      }
      .cons-strip:last-child {
        margin-bottom: 0;
      }
      .cons-strip-cap {
        text-align: center;
        font-size: 0.64rem;
        font-weight: 600;
        color: color-mix(in srgb, var(--primary-text-color) 38%, var(--secondary-text-color) 62%);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin: 0 0 3px;
        line-height: 1.2;
      }
      .empty {
        font-size: 0.72rem;
        opacity: 0.55;
        margin: 4px 0 0;
      }
      .bar-wrap {
        position: relative;
        margin-bottom: 2px;
      }
      .track {
        border-radius: 8px;
        min-width: 48px;
        height: 24px;
        background: var(--divider-color);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, transparent) inset;
        overflow: hidden;
      }
      .fill-stack {
        position: relative;
        height: 100%;
        display: flex;
        border-radius: 8px;
        overflow: hidden;
      }
      .fill-seg {
        height: 100%;
        display: inline-block;
      }
      .fill-hc {
        background-image: repeating-linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.35) 0px,
          rgba(255, 255, 255, 0.35) 4px,
          transparent 4px,
          transparent 8px
        );
      }
      .bar-total {
        position: absolute;
        left: 4px;
        right: 4px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        gap: 6px;
        pointer-events: none;
        z-index: 2;
      }
      .bar-total::before,
      .bar-total::after {
        content: "";
        flex: 1 1 0;
        height: 1px;
        min-width: 4px;
        background: #fff;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.8), 0 1px 0 rgba(0, 0, 0, 0.6);
      }
      .bar-total-text {
        font-size: 0.66rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.02em;
        white-space: nowrap;
        flex-shrink: 0;
        color: #fff;
        text-shadow:
          0 0 14px rgba(0, 0, 0, 1),
          0 0 6px rgba(0, 0, 0, 0.9),
          0 1px 2px rgba(0, 0, 0, 0.9);
      }
      .icon-brk {
        display: flex;
        flex-wrap: wrap;
        gap: 3px 5px;
        justify-content: center;
        margin-top: 1px;
        padding: 0;
        font-size: 0.62rem;
        line-height: 1.25;
      }
      .icon-brk-item {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
        padding: 1px 6px;
        border-radius: 5px;
        background: color-mix(in srgb, var(--secondary-background-color) 78%, transparent);
        border: 1px solid color-mix(in srgb, var(--divider-color) 70%, transparent);
      }
      .icon-brk-item ha-icon {
        --mdc-icon-size: 10px;
        opacity: 0.85;
        flex-shrink: 0;
      }
      .icon-brk-item b {
        font-variant-numeric: tabular-nums;
        font-weight: 700;
      }
      .icon-brk-swatch {
        width: 22px;
        height: 14px;
        max-height: 14px;
        border-radius: 3px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        overflow: hidden;
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, transparent) inset;
      }
      .icon-brk-swatch ha-icon {
        --mdc-icon-size: 9px;
        color: #fff;
        opacity: 1;
        filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.85)) drop-shadow(0 1px 1px rgba(0, 0, 0, 0.8));
        pointer-events: none;
      }
      .icon-brk-swatch.swatch-icon-dark ha-icon {
        color: #111;
        filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.7));
      }
      .icon-brk-pct {
        opacity: 0.6;
        margin-left: 1px;
      }
    `;
  }
  constructor() {
    super(), this.title = "", this.segments = [], this.total = 0, this.formatter = (t) => String(t), this.unit = "", this.tooltip = "", this.breakdown = [], this.showBreakdown = !0, this.displayValue = "", this.fillPercent = 100, this.emptyLabel = "";
  }
  _renderStackedFill(t) {
    const e = (t ?? []).filter((o) => Number(o?.value) > 1e-3), r = e.reduce((o, s) => o + Number(s.value), 0) || 1;
    return e.map((o) => v`
      <span
        class="fill-seg ${o.className ?? ""}"
        style="width:${(Number(o.value) / r * 100).toFixed(1)}%;background-color:${o.color}"
      ></span>
    `);
  }
  _renderBreakdown() {
    const t = this.breakdown ?? [];
    if (!this.showBreakdown || !t.length) return y;
    const e = Number(this.total) || 0;
    return v`
      <div class="icon-brk">
        ${t.map((r) => {
      const o = r.icon ?? (_r(r.label) ? "mdi:transmission-tower" : yr(r.label)), s = xr(r.color) ? "swatch-icon-dark" : "";
      return v`
            <span class="icon-brk-item">
              ${r.color ? v`<span
                    class="icon-brk-swatch ${vr(r.label) ? "fill-hc" : ""} ${s}"
                    style="background-color:${r.color}"
                  >
                    ${o ? v`<ha-icon icon=${o}></ha-icon>` : y}
                  </span>` : o ? v`<ha-icon icon=${o}></ha-icon>` : y}
              <span>${r.label}</span>&nbsp;<b>${r.value}</b>
              ${e > 0 && r.rawV != null ? v`<span class="icon-brk-pct">(${Math.round(Number(r.rawV) / e * 100)}%)</span>` : y}
            </span>
          `;
    })}
      </div>
    `;
  }
  _displayTotal() {
    return this.displayValue ? this.displayValue : typeof this.formatter == "function" ? this.formatter(this.total) : this.unit ? `${Number(this.total).toFixed(2)} ${this.unit}` : String(this.total);
  }
  render() {
    const t = (this.segments ?? []).filter((r) => Number(r?.value) > 1e-3);
    if (!t.length)
      return v`
        <div class="cons-strip">
          <div class="cons-strip-cap">${this.title}</div>
          <p class="empty">${this.emptyLabel || "—"}</p>
        </div>
      `;
    const e = Math.max(0, Math.min(100, Number(this.fillPercent) || 0));
    return v`
      <div class="cons-strip">
        <div class="cons-strip-cap">${this.title}</div>
        <div class="bar-wrap" title=${this.tooltip || y}>
          <div class="track">
            <div class="fill-stack" style="width:${e.toFixed(1)}%">
              ${this._renderStackedFill(t)}
            </div>
          </div>
          <div class="bar-total">
            <span class="bar-total-text">${this._displayTotal()}</span>
          </div>
        </div>
        ${this._renderBreakdown()}
      </div>
    `;
  }
}
customElements.get("hub-energy-strip") || customElements.define("hub-energy-strip", Rr);
class Or extends W {
  static get properties() {
    return {
      i18n: { attribute: !1 },
      data: { attribute: !1 },
      /** When true, power history panel is open (for aria-expanded). */
      graphOpen: { type: Boolean }
    };
  }
  static get styles() {
    return ct`
      :host {
        display: block;
      }
      .power-now-wrap {
        margin: 0 0 6px;
        padding: 4px 6px;
        border-radius: 6px;
        background: var(--secondary-background-color);
        font-size: 0.68rem;
        min-width: 0;
      }
      .power-now-wrap[role="button"] {
        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      .power-now-wrap[role="button"]:focus-visible {
        outline: 2px solid color-mix(in srgb, var(--primary-color) 65%, transparent);
        outline-offset: 2px;
      }
      .cons-strip-cap {
        text-align: center;
        font-size: 0.64rem;
        font-weight: 600;
        color: color-mix(in srgb, var(--primary-text-color) 38%, var(--secondary-text-color) 62%);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin: 0 0 3px;
        line-height: 1.2;
      }
      .pnl-wrap {
        position: relative;
      }
      .pnl-bar {
        width: 100%;
        height: 20px;
        display: flex;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, transparent) inset;
      }
      .pnl-seg {
        height: 100%;
        min-width: 2px;
        transition: width 0.2s ease;
      }
      .pnl-load-overlay {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-size: 0.73rem;
        font-weight: 800;
        white-space: nowrap;
        pointer-events: none;
        z-index: 2;
        color: #fff;
        text-shadow: 0 0 10px rgba(0, 0, 0, 0.95), 0 0 4px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 0.9);
      }
      .icon-brk {
        display: flex;
        flex-wrap: wrap;
        gap: 3px 5px;
        justify-content: center;
        margin-top: 4px;
        padding: 0;
        font-size: 0.62rem;
        line-height: 1.25;
      }
      .icon-brk-item {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
        padding: 1px 6px;
        border-radius: 5px;
        background: color-mix(in srgb, var(--secondary-background-color) 78%, transparent);
        border: 1px solid color-mix(in srgb, var(--divider-color) 70%, transparent);
      }
      .icon-brk-swatch {
        width: 22px;
        height: 14px;
        border-radius: 3px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        overflow: hidden;
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, transparent) inset;
      }
      .icon-brk-swatch ha-icon {
        --mdc-icon-size: 8px;
        color: #fff;
        filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.85)) drop-shadow(0 1px 1px rgba(0, 0, 0, 0.8));
      }
    `;
  }
  constructor() {
    super(), this.i18n = {}, this.data = null, this.graphOpen = !1;
  }
  _emitToggle() {
    this.dispatchEvent(
      new CustomEvent("hub-power-now-toggle", {
        bubbles: !0,
        composed: !0
      })
    );
  }
  _onKeyDown(t) {
    (t.key === "Enter" || t.key === " ") && (t.preventDefault(), this._emitToggle());
  }
  render() {
    const t = this.data;
    if (t == null) return y;
    const e = t.gridSigned != null ? Math.max(0, t.gridSigned) : 0, r = [];
    t.gridSigned != null && e > 0 && r.push({ w: e, c: Gt, t: `${this.i18n.segImport} +${G(e)}` }), t.battDis != null && t.battDis > 0 && r.push({ w: t.battDis, c: lt, t: `${this.i18n.segBattDis} +${G(t.battDis)}` }), t.solar != null && t.solar > 0 && r.push({ w: t.solar, c: nt, t: `${this.i18n.segSolar} ${G(t.solar)}` });
    const o = r.reduce((h, p) => h + p.w, 0), s = t.gridSigned != null ? G(t.gridSigned) : t.exportW != null && t.exportW > 0 ? G(-t.exportW) : "—", a = t.solar != null ? G(t.solar) : "—", l = t.battDis != null || t.battChg != null ? (t.battDis ?? 0) - (t.battChg ?? 0) : null, n = l != null ? G(l) : "—", d = t.load != null ? G(t.load) : "—";
    return v`
      <div
        class="power-now-wrap"
        role="button"
        tabindex="0"
        aria-label=${this.i18n?.powerNowAria ?? this.i18n?.powerNow ?? "Power now"}
        aria-expanded=${this.graphOpen ? "true" : "false"}
        @click=${this._emitToggle}
        @keydown=${this._onKeyDown}
      >
        <div class="cons-strip-cap">${this.i18n.powerNow}</div>
        <div class="pnl-wrap">
          <div class="pnl-bar" title=${t.tooltip}>
            ${o > 1 ? r.map((h) => v`
                  <span
                    class="pnl-seg"
                    style="width:${(h.w / o * 100).toFixed(1)}%;background:${h.c}"
                    title=${h.t}
                  ></span>
                `) : v`<span
                  class="pnl-seg"
                  style="width:100%;background:color-mix(in srgb, var(--divider-color) 85%, transparent)"
                  title="—"
                ></span>`}
          </div>
          <div class="pnl-load-overlay">${d} ${this.i18n.loadConsumed}</div>
        </div>
        <div class="icon-brk">
          <span class="icon-brk-item">
            <span class="icon-brk-swatch" style="background-color:${Gt}">
              <ha-icon icon="mdi:transmission-tower"></ha-icon>
            </span>
            <span>${this.i18n.colGrid}</span>&nbsp;<b>${s}</b>
          </span>
          <span class="icon-brk-item">
            <span class="icon-brk-swatch" style="background-color:${nt}">
              <ha-icon icon="mdi:weather-sunny"></ha-icon>
            </span>
            <span>${this.i18n.colSolar}</span>&nbsp;<b>${a}</b>
          </span>
          <span class="icon-brk-item" title=${this.i18n.colBattTip || y}>
            <span class="icon-brk-swatch" style="background-color:${lt}">
              <ha-icon icon="mdi:battery"></ha-icon>
            </span>
            <span>${this.i18n.colBatt}</span>&nbsp;<b>${n}</b>
          </span>
        </div>
      </div>
    `;
  }
}
customElements.get("hub-power-now") || customElements.define("hub-power-now", Or);
const jr = 100, Ir = 12, Wr = 168;
function zr(i, t, e, r) {
  const o = Math.max(0, Number(t) || 0), s = Math.max(0, Number(e) || 0), a = Math.max(0, Number(r) || 0), l = Math.max(0, Number(i) || 0);
  if (l < 1e-6) return { b: 0, g: 0, s: 0 };
  const n = s + o + a;
  if (n > l + 1e-6) {
    const m = l / n;
    return { b: s * m, g: o * m, s: a * m };
  }
  let d = Math.min(s, l), h = l - d, p = Math.min(o, h);
  h -= p;
  let u = Math.min(a, h);
  return h -= u, h > 1 && (u += h), { b: d, g: p, s: u };
}
function Ur(i) {
  const t = i.length, e = new Array(t), r = new Array(t), o = new Array(t);
  for (let s = 0; s < t; s++) {
    const a = i[s];
    let n = a.load != null && Number.isFinite(a.load) ? Math.max(0, a.load) : NaN;
    const d = Math.max(0, a.grid ?? 0), h = Math.max(0, a.batt ?? 0), p = Math.max(0, a.solar ?? 0);
    Number.isFinite(n) || (n = d + h + p);
    const u = zr(n, a.grid ?? 0, a.batt ?? 0, a.solar ?? 0);
    e[s] = u.b, r[s] = u.g, o[s] = u.s;
  }
  return { sliceBatt: e, sliceGrid: r, sliceSolar: o };
}
function Ht(i, t, e, r, o) {
  if (!i?.length || !Number.isFinite(t) || !Number.isFinite(e) || e <= t) return "";
  const s = e - t, a = i.length, l = [], n = (h) => a === 1 ? 0 : h / (a - 1) * r, d = (h) => o - (Number(h) - t) / s * o;
  for (let h = 0; h < a; h++) {
    const p = Number(i[h]);
    l.push({ x: n(h), y: d(Number.isFinite(p) ? p : 0) });
  }
  return `M ${l[0].x.toFixed(2)} ${l[0].y.toFixed(2)} ${l.slice(1).map((h) => `L ${h.x.toFixed(2)} ${h.y.toFixed(2)}`).join(" ")}`;
}
function ne(i, t, e, r, o, s) {
  if (!i?.length || i.length !== t?.length) return "";
  const a = Math.max(r - e, 1e-9), l = i.length, n = (p) => l === 1 ? 0 : p / (l - 1) * o, d = (p) => s - (Number(p) - e) / a * s;
  let h = "";
  for (let p = 0; p < l; p++) {
    const u = n(p), m = d(Number(t[p]));
    h += p === 0 ? `M ${u.toFixed(2)} ${m.toFixed(2)}` : ` L ${u.toFixed(2)} ${m.toFixed(2)}`;
  }
  for (let p = l - 1; p >= 0; p--) {
    const u = n(p), m = d(Number(i[p]));
    h += ` L ${u.toFixed(2)} ${m.toFixed(2)}`;
  }
  return h += " Z", h;
}
function Ne(i, t) {
  if (!i || i.width <= 0) return 50;
  const e = (t - i.left) / i.width * 100, r = Ir, o = typeof window < "u" ? window : null, s = o?.visualViewport ?? null, a = Number.isFinite(s?.offsetLeft) ? s.offsetLeft : 0, l = s && Number.isFinite(s.width) && s.width > 0 ? s.width : o?.innerWidth ?? 1e9, n = Math.min(
    Wr,
    Math.max(jr, l * 0.48)
  );
  let d = Math.max(-8, Math.min(108, e)), h = i.left + d / 100 * i.width;
  if (Number.isFinite(l) && l > 2 * (n + r)) {
    const p = a + n + r, u = a + l - n - r;
    h = Math.max(p, Math.min(u, h)), d = (h - i.left) / i.width * 100;
  }
  return Math.round(d * 10) / 10;
}
class Vr extends W {
  static get properties() {
    return {
      open: { type: Boolean },
      i18n: { attribute: !1 },
      locale: { attribute: !1 },
      loading: { type: Boolean },
      /** Error message string, or null when none */
      error: { attribute: !1 },
      /** @type {{ pts: unknown[]; yMin: number; yMax: number; hasLoadEntity: boolean; dayIso: string } | null} */
      displaySeries: { attribute: !1 },
      rollingHours: { type: Number },
      isTodayGraph: { type: Boolean },
      _hoverIdx: { state: !0 },
      _tooltipXPct: { state: !0 }
    };
  }
  static get styles() {
    return ct`
      :host {
        display: block;
      }
      .power-graph {
        margin: 0 0 10px;
        padding: 8px 10px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--secondary-background-color) 80%, transparent);
        border: 1px solid color-mix(in srgb, var(--divider-color) 75%, transparent);
      }
      .power-graph-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin: 0 0 6px;
        flex-wrap: wrap;
      }
      .power-graph-title {
        font-size: 0.72rem;
        font-weight: 800;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0;
        flex: 0 0 auto;
      }
      .power-graph-head-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex: 1 1 auto;
        min-width: 0;
      }
      .power-graph-archive-day {
        font-size: 0.72rem;
        color: var(--secondary-text-color);
        text-align: right;
        line-height: 1.3;
      }
      .power-graph-window-btns {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
        margin: 0;
      }
      .power-graph-window-btns .range-label {
        margin-right: 2px;
      }
      .range-label {
        font-size: 0.76rem;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
      .range-btn {
        background: none;
        border: 1px solid var(--divider-color);
        color: var(--primary-text-color);
        border-radius: 999px;
        padding: 2px 8px;
        font: inherit;
        font-size: 0.75rem;
        cursor: pointer;
      }
      .range-btn.active {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 18%, transparent);
      }
      .power-graph-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 10px;
        margin-top: 6px;
        font-size: 0.72rem;
        color: var(--secondary-text-color);
      }
      .power-graph-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
      }
      .power-graph-swatch {
        width: 10px;
        height: 10px;
        border-radius: 3px;
        display: inline-block;
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, transparent) inset;
      }
      .power-graph-swatch-line {
        width: 14px;
        height: 0;
        border-radius: 0;
        border-bottom: 3px solid var(--swatch-line, currentColor);
        background: transparent;
        box-shadow: none;
      }
      .power-graph-chart-wrap {
        display: flex;
        align-items: stretch;
        gap: 6px;
        margin-top: 2px;
      }
      .power-yaxis {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        flex: 0 0 auto;
        width: 2.75rem;
        min-height: 120px;
        padding: 0 2px 0 0;
        box-sizing: border-box;
        text-align: right;
        font-size: 0.68rem;
        line-height: 1.1;
        font-variant-numeric: tabular-nums;
        color: color-mix(in srgb, var(--primary-text-color) 38%, var(--secondary-text-color) 62%);
      }
      .power-graph-svg-wrap {
        position: relative;
        flex: 1;
        min-width: 0;
      }
      .power-graph-svg-wrap > svg {
        touch-action: none;
        display: block;
      }
      .power-graph-tooltip {
        position: absolute;
        bottom: calc(100% + 8px);
        left: var(--power-tooltip-x, 50%);
        transform: translateX(-50%);
        z-index: 3;
        pointer-events: none;
        box-sizing: border-box;
        width: max-content;
        min-width: min(10.5rem, calc(100vw - 1.5rem));
        max-width: min(16rem, calc(100vw - 1.25rem));
        padding: 9px 11px;
        border-radius: 10px;
        font-size: 0.72rem;
        line-height: 1.5;
        color: var(--primary-text-color);
        background: color-mix(in srgb, var(--card-background-color, var(--ha-card-background)) 94%, transparent);
        border: 1px solid color-mix(in srgb, var(--divider-color) 60%, transparent);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      .power-graph-tooltip::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -6px;
        border: 6px solid transparent;
        border-top-color: color-mix(in srgb, var(--divider-color) 45%, var(--card-background-color) 55%);
      }
      .power-graph-tooltip-row {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        font-variant-numeric: tabular-nums;
      }
      .power-graph-tooltip-row + .power-graph-tooltip-row {
        margin-top: 4px;
      }
      .power-graph-tooltip-k {
        flex: 0 0 auto;
        font-weight: 600;
      }
      .power-graph-tooltip-v {
        font-weight: 600;
        text-align: right;
        min-width: 0;
      }
      .power-graph-tooltip-h {
        font-weight: 700;
        font-size: 0.74rem;
        margin-bottom: 6px;
        padding-bottom: 6px;
        border-bottom: 1px solid color-mix(in srgb, var(--divider-color) 55%, transparent);
      }
      .power-xaxis {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        margin-top: 6px;
        margin-left: calc(2.75rem + 6px);
        font-size: 0.68rem;
        color: color-mix(in srgb, var(--primary-text-color) 35%, var(--secondary-text-color) 65%);
        font-variant-numeric: tabular-nums;
      }
      .loader {
        font-size: 0.83rem;
        opacity: 0.65;
        margin: 8px 0;
      }
      .alert {
        margin: 0 0 12px;
        padding: 10px 12px;
        border-radius: 8px;
        background: var(--warning-color, #ff9800);
        color: var(--text-primary-color, #fff);
        font-size: 0.83rem;
        line-height: 1.5;
      }
    `;
  }
  constructor() {
    super(), this.open = !1, this.i18n = {}, this.locale = "fr-FR", this.loading = !1, this.error = null, this.displaySeries = null, this.rollingHours = 6, this.isTodayGraph = !0, this._hoverIdx = null, this._tooltipXPct = null;
  }
  willUpdate(t) {
    t.has("open") && !this.open && (this._hoverIdx = null, this._tooltipXPct = null), t.has("loading") && this.loading && (this._hoverIdx = null, this._tooltipXPct = null);
  }
  updated(t) {
    super.updated(t);
    const e = this.displaySeries?.pts?.length ?? 0;
    if (this._hoverIdx != null && e) {
      const r = e - 1;
      this._hoverIdx > r && (this._hoverIdx = r);
    }
    this.open && this._hoverIdx != null && (t.has("_hoverIdx") || t.has("displaySeries") || t.has("open") && this.open) && queueMicrotask(() => this._syncTooltipXFromHover());
  }
  /** Re-apply viewport clamp from hover index after layout / series refresh (tooltip % vs SVG grid). */
  _syncTooltipXFromHover() {
    if (!this.open || this._hoverIdx == null) return;
    const t = this.renderRoot;
    if (!t) return;
    const e = t.querySelector(".power-graph-svg-wrap"), r = e?.querySelector("svg"), o = this.displaySeries, s = e?.getBoundingClientRect(), a = r?.getBoundingClientRect();
    if (!o?.pts?.length || !s?.width || !a?.width) return;
    const l = o.pts.length, n = Math.max(0, Math.min(l - 1, this._hoverIdx)), d = l <= 1 ? 0.5 : n / Math.max(l - 1, 1), h = a.left + d * a.width, p = Ne(s, h);
    this._tooltipXPct !== p && (this._tooltipXPct = p);
  }
  _emitWindowHours(t) {
    this.dispatchEvent(
      new CustomEvent("hub-power-graph-window", {
        bubbles: !0,
        composed: !0,
        detail: { hours: t }
      })
    );
  }
  /** @param {SVGSVGElement} el */
  _updateHoverFromClientX(t, e) {
    const r = this.displaySeries;
    if (!r?.pts?.length) return;
    const o = t.getBoundingClientRect();
    if (o.width <= 0) return;
    const s = (e - o.left) / o.width, a = r.pts.length, l = Math.max(0, Math.min(a - 1, Math.round(s * Math.max(a - 1, 1)))), d = t.closest(".power-graph-svg-wrap")?.getBoundingClientRect(), h = d && d.width > 0 ? Ne(d, e) : a <= 1 ? 50 : l / Math.max(a - 1, 1) * 100;
    this._hoverIdx !== l && (this._hoverIdx = l), this._tooltipXPct !== h && (this._tooltipXPct = h);
  }
  /** @param {MouseEvent & { currentTarget: SVGSVGElement }} e */
  _onSvgMove(t) {
    this._updateHoverFromClientX(t.currentTarget, t.clientX);
  }
  _onSvgLeave() {
    this._hoverIdx != null && (this._hoverIdx = null), this._tooltipXPct != null && (this._tooltipXPct = null);
  }
  /** @param {TouchEvent & { currentTarget: SVGSVGElement }} e */
  _onSvgTouch(t) {
    const e = t.touches?.[0];
    e && this._updateHoverFromClientX(t.currentTarget, e.clientX);
  }
  _onSvgTouchEnd() {
    this._hoverIdx != null && (this._hoverIdx = null), this._tooltipXPct != null && (this._tooltipXPct = null);
  }
  render() {
    if (!this.open) return y;
    const t = this.i18n ?? {}, e = this.locale ?? "fr-FR", r = Gt, o = nt, s = lt, a = "#2e7d32", l = "var(--primary-text-color, #e0e0e0)";
    if (this.loading)
      return v`<div class="power-graph"><div class="loader">${t.loading}</div></div>`;
    if (this.error)
      return v`<div class="power-graph"><div class="alert">${this.error}</div></div>`;
    const n = this.displaySeries;
    if (!n?.pts?.length)
      return v`<div class="power-graph"><div class="loader">${t.noData}</div></div>`;
    const d = 320, h = 120, p = n.yMin ?? 0, u = n.yMax ?? 1, m = n.pts.map((B) => B.solar ?? 0), f = n.pts.map((B) => Math.max(0, B.batt ?? 0)), g = n.pts.map((B) => Math.max(0, -(B.batt ?? 0))), E = n.pts.map((B) => B.grid ?? 0), $ = n.hasLoadEntity === !0, C = $ ? n.pts.map((B) => B.load == null ? 0 : B.load) : [], w = (B) => new Intl.DateTimeFormat(e, { hour: "2-digit", minute: "2-digit" }).format(new Date(B)), _ = (B) => new Intl.DateTimeFormat(e, { dateStyle: "short", timeStyle: "short" }).format(new Date(B)), k = n.pts[0].ts, x = n.pts[n.pts.length - 1].ts, b = k + (x - k) / 3, S = k + (x - k) * 2 / 3, D = Ht(m, p, u, d, h), N = Ht(f, p, u, d, h), T = Ht(g, p, u, d, h), A = Ht(E, p, u, d, h), L = $ && C.length ? Ht(C, p, u, d, h) : "";
    let H = "", X = "", J = "";
    if ($ && C.length) {
      const { sliceBatt: B, sliceGrid: Ot, sliceSolar: q } = Ur(n.pts), te = B.length, ee = new Array(te).fill(0), Bt = B.slice(), jt = B.map((Tt, mt) => Tt + Ot[mt]), re = B.map((Tt, mt) => Tt + Ot[mt] + q[mt]);
      H = ne(ee, Bt, p, u, d, h), X = ne(Bt, jt, p, u, d, h), J = ne(jt, re, p, u, d, h);
    }
    const vt = `color-mix(in srgb, ${lt} 30%, transparent)`, xt = `color-mix(in srgb, ${Gt} 30%, transparent)`, $t = `color-mix(in srgb, ${nt} 30%, transparent)`, Q = "color-mix(in srgb, var(--divider-color) 70%, transparent)", St = Math.max(u - p, 1e-9), ht = (B) => h - (B - p) / St * h, pt = (p + u) / 2, Zt = G(u), O = G(pt), dt = G(p), Pt = ht(pt), Jt = p < 0 && u > 0, ut = ht(0), tt = n.pts.length, V = this._hoverIdx, z = V != null && V >= 0 && V < tt ? n.pts[V] : null, Dt = tt <= 1 ? d / 2 : (V ?? 0) / Math.max(tt - 1, 1) * d, Qt = this._tooltipXPct != null ? this._tooltipXPct : tt <= 1 ? 50 : (V ?? 0) / Math.max(tt - 1, 1) * 100, Rt = K(n.dayIso), et = Number.isFinite(Rt.getTime()) ? new Intl.DateTimeFormat(e, { dateStyle: "medium" }).format(Rt) : n.dayIso, kt = String(t.powerHistoryFullDay).replace("{date}", et), gt = At(
      this.rollingHours,
      ot
    );
    return v`
      <div class="power-graph">
        <div class="power-graph-head">
          <div class="power-graph-title">${t.powerHistoryTitle ?? "Power history"}</div>
          <div class="power-graph-head-actions">
            ${this.isTodayGraph ? v`<div class="power-graph-window-btns">
                  <span class="range-label">${t.powerHistoryWindow}</span>
                  ${pe.map(
      (B) => v`
                      <button
                        type="button"
                        class="range-btn ${gt === B ? "active" : ""}"
                        @click=${() => this._emitWindowHours(B)}
                      >
                        ${B}h
                      </button>
                    `
    )}
                </div>` : v`<div class="power-graph-archive-day">${kt}</div>`}
          </div>
        </div>
        <div class="power-graph-chart-wrap">
          <div class="power-yaxis" aria-hidden="true">
            <span>${Zt}</span>
            <span>${O}</span>
            <span>${dt}</span>
          </div>
          <div class="power-graph-svg-wrap">
            ${z ? v`
                  <div class="power-graph-tooltip" style="--power-tooltip-x:${Qt}%">
                    <div class="power-graph-tooltip-h">
                      ${t.powerGraphTooltipTime}: ${_(z.ts)}
                    </div>
                    ${$ ? v`
                          <div class="power-graph-tooltip-row">
                            <span class="power-graph-tooltip-k" style="color:${l}"
                              >${t.houseLoad}</span
                            >
                            <span class="power-graph-tooltip-v"
                              >${z.load != null ? G(z.load) : t.emDash}</span
                            >
                          </div>
                        ` : y}
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${o}"
                        >${t.powerGraphTooltipSolar}</span
                      >
                      <span class="power-graph-tooltip-v">${G(z.solar ?? 0)}</span>
                    </div>
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${s}"
                        >${t.segBattDis}</span
                      >
                      <span class="power-graph-tooltip-v">${G(Math.max(0, z.batt ?? 0))}</span>
                    </div>
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${a}"
                        >${t.segBattChg}</span
                      >
                      <span class="power-graph-tooltip-v">${G(Math.max(0, -(z.batt ?? 0)))}</span>
                    </div>
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${r}"
                        >${t.powerGraphTooltipGrid}</span
                      >
                      <span class="power-graph-tooltip-v">${G(z.grid ?? 0)}</span>
                    </div>
                  </div>
                ` : y}
            <svg
              viewBox="0 0 ${d} ${h}"
              width="100%"
              height="120"
              preserveAspectRatio="none"
              aria-label="power history chart"
              @mousemove=${this._onSvgMove}
              @mouseleave=${this._onSvgLeave}
              @touchstart=${this._onSvgTouch}
              @touchmove=${this._onSvgTouch}
              @touchend=${this._onSvgTouchEnd}
              @touchcancel=${this._onSvgTouchEnd}
            >
              <g class="power-grid-lines" stroke="${Q}" stroke-width="0.75" opacity="0.55" fill="none">
                <line x1="0" y1="0" x2="${d}" y2="0"></line>
                <line x1="0" y1="${Pt}" x2="${d}" y2="${Pt}" stroke-dasharray="3 3"></line>
                <line x1="0" y1="${h}" x2="${d}" y2="${h}"></line>
                ${Jt ? bt`<line
                      x1="0"
                      y1="${ut}"
                      x2="${d}"
                      y2="${ut}"
                      stroke-dasharray="4 3"
                      opacity="0.75"
                    ></line>` : y}
                <line x1="0" y1="0" x2="0" y2="${h}" stroke-width="1"></line>
              </g>
              ${H ? bt`<path
                    d="${H}"
                    fill="${vt}"
                    stroke="none"
                    pointer-events="none"
                  ></path>` : y}
              ${X ? bt`<path
                    d="${X}"
                    fill="${xt}"
                    stroke="none"
                    pointer-events="none"
                  ></path>` : y}
              ${J ? bt`<path
                    d="${J}"
                    fill="${$t}"
                    stroke="none"
                    pointer-events="none"
                  ></path>` : y}
              <path
                d="${A}"
                fill="none"
                stroke="${r}"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
              ></path>
              <path
                d="${T}"
                fill="none"
                stroke="${a}"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
              ></path>
              <path
                d="${N}"
                fill="none"
                stroke="${s}"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
              ></path>
              <path
                d="${D}"
                fill="none"
                stroke="${o}"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
              ></path>
              ${L ? bt`<path
                    d="${L}"
                    fill="none"
                    stroke="${l}"
                    stroke-width="2.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    opacity="1"
                  ></path>` : y}
              ${V != null ? bt`<line
                    pointer-events="none"
                    x1="${Dt}"
                    y1="0"
                    x2="${Dt}"
                    y2="${h}"
                    stroke="${Q}"
                    stroke-width="1"
                    opacity="0.85"
                  ></line>` : y}
            </svg>
          </div>
        </div>
        <div class="power-xaxis">
          <span>${w(k)}</span>
          <span>${w(b)}</span>
          <span>${w(S)}</span>
          <span>${w(x)}</span>
        </div>
        <div class="power-graph-legend" aria-hidden="true">
          ${$ ? v`<span class="power-graph-chip"
                ><span
                  class="power-graph-swatch power-graph-swatch-line"
                  style="--swatch-line:${l}"
                ></span
                >${t.houseLoad}</span
              >` : y}
          <span class="power-graph-chip"
            ><span
              class="power-graph-swatch power-graph-swatch-line"
              style="--swatch-line:${o}"
            ></span
            >${t.colSolar}</span
          >
          <span class="power-graph-chip"
            ><span
              class="power-graph-swatch power-graph-swatch-line"
              style="--swatch-line:${s}"
            ></span
            >${t.segBattDis}</span
          >
          <span class="power-graph-chip"
            ><span
              class="power-graph-swatch power-graph-swatch-line"
              style="--swatch-line:${a}"
            ></span
            >${t.segBattChg}</span
          >
          <span class="power-graph-chip"
            ><span
              class="power-graph-swatch power-graph-swatch-line"
              style="--swatch-line:${r}"
            ></span
            >${t.colGrid}</span
          >
        </div>
      </div>
    `;
  }
}
customElements.get("hub-power-graph") || customElements.define("hub-power-graph", Vr);
class Kr extends W {
  static get properties() {
    return {
      i18n: { attribute: !1 },
      data: { attribute: !1 },
      numberLocale: { type: String, attribute: "number-locale" }
    };
  }
  static get styles() {
    return ct`
      :host {
        display: block;
        width: 100%;
      }
      .batt-bar-container {
        margin: 4px 0 6px;
        width: 100%;
      }
      .batt-section-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
        padding-bottom: 4px;
        margin: 0 0 4px;
        border-bottom: 1px dashed color-mix(in srgb, var(--divider-color) 70%, transparent);
      }
      .batt-section-head h3 {
        margin: 0;
        font-size: 0.72rem;
        font-weight: 800;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .batt-track-wrap {
        position: relative;
        width: 100%;
        margin-bottom: 2px;
      }
      .batt-track {
        position: relative;
        width: 100%;
        height: 32px;
        border-radius: 8px;
        background: #0b0b0b;
        box-shadow:
          0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, #333) inset,
          0 0 0 1px color-mix(in srgb, var(--divider-color) 40%, transparent);
        overflow: hidden;
        box-sizing: border-box;
      }
      .batt-segments {
        position: absolute;
        inset: 0;
        z-index: 1;
        padding: 3px;
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        gap: 3px;
        align-items: stretch;
      }
      .batt-cell {
        flex: 1;
        min-width: 2px;
        border-radius: 3px;
        background: transparent;
        border: 1px solid #333333;
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, transparent) inset;
        position: relative;
        overflow: hidden;
      }
      .batt-cell-fill {
        position: absolute;
        top: 0;
        bottom: 0;
        left: calc(var(--fill-x, 0) * 1%);
        width: calc(var(--fill-w, 0) * 1%);
        background: #2e7d32;
        box-shadow: 0 0 0 1px color-mix(in srgb, #1b5e20 65%, transparent) inset;
      }
      .batt-cell-hatch {
        position: absolute;
        top: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.03);
        background-image: repeating-linear-gradient(
          135deg,
          rgba(150, 150, 150, 0.42) 0px,
          rgba(150, 150, 150, 0.42) 3px,
          transparent 3px,
          transparent 6px
        );
      }
      .batt-cell-hatch--left {
        left: 0;
        width: calc(var(--hatch-l, 0) * 1%);
      }
      .batt-cell-hatch--right {
        right: 0;
        width: calc(var(--hatch-r, 0) * 1%);
      }
      .batt-segments.batt-green--charging .batt-cell-fill {
        background: linear-gradient(
          180deg,
          #66bb6a 0%,
          #2e7d32 45%,
          #1b5e20 100%
        );
        animation: batt-cell-pulse 2.2s ease-in-out infinite;
      }
      .batt-segments.batt-green--charging .batt-cell:nth-child(odd) .batt-cell-fill {
        animation-delay: 0.15s;
      }
      .batt-segments.batt-green--discharging .batt-cell-fill {
        background: linear-gradient(
          180deg,
          #9ccc65 0%,
          #558b2f 50%,
          #33691e 100%
        );
        animation: batt-cell-pulse 2.4s ease-in-out infinite reverse;
      }
      .batt-segments.batt-green--discharging .batt-cell:nth-child(odd) .batt-cell-fill {
        animation-delay: 0.12s;
      }
      @keyframes batt-cell-pulse {
        0%,
        100% {
          filter: brightness(1);
        }
        50% {
          filter: brightness(1.12);
        }
      }
      .batt-bar-total {
        position: absolute;
        left: 6px;
        right: 6px;
        top: 0;
        bottom: 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 6px;
        pointer-events: none;
        z-index: 3;
      }
      .batt-bar-stack {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0;
        line-height: 1;
        flex: 0 0 auto;
      }
      .batt-bar-row-main {
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        line-height: 1.05;
      }
      .batt-bar-total::before,
      .batt-bar-total::after {
        content: "";
        flex: 1 1 0;
        height: 1px;
        min-width: 4px;
        background: #fff;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.8), 0 1px 0 rgba(0, 0, 0, 0.6);
      }
      .batt-bar-total-text {
        font-size: 0.65rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.02em;
        white-space: nowrap;
        flex-shrink: 0;
        color: #fff;
        text-shadow:
          0 0 14px rgba(0, 0, 0, 1),
          0 0 6px rgba(0, 0, 0, 0.9),
          0 1px 2px rgba(0, 0, 0, 0.9);
      }
      .batt-bar-eta-inline {
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 5px;
        margin-top: 1px;
        font-size: 0.85rem;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        line-height: 1;
        color: rgba(255, 255, 255, 0.92);
        text-align: center;
        white-space: nowrap;
        text-shadow:
          0 0 10px rgba(0, 0, 0, 1),
          0 1px 2px rgba(0, 0, 0, 0.95);
      }
      .batt-eta-icon {
        flex-shrink: 0;
        color: rgba(255, 255, 255, 0.95);
        --mdc-icon-size: 13px;
        filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.9));
      }
    `;
  }
  constructor() {
    super(), this.i18n = {}, this.data = null, this.numberLocale = "fr-FR";
  }
  _fmtKwh(t) {
    return t == null || !Number.isFinite(Number(t)) ? "—" : Number(t).toLocaleString(this.numberLocale ?? "fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  /** @returns {{ icon: string; time: string } | null} */
  _resolveEta() {
    const t = this.data;
    if (!t || t.capacity == null || t.capacity <= 0) return null;
    if (t.chargeW != null && t.chargeW > 0) {
      const e = t.soc ?? 0, r = t.capacity * (1 - e / 100), o = t.chargeW / 1e3;
      if (o > 0)
        return {
          icon: "mdi:battery-charging-high",
          time: Ee(r / o * 60)
        };
    } else if (t.dischargeW != null && t.dischargeW > 0) {
      const e = t.capacity * (t.soc ?? 0) / 100, r = t.dischargeW / 1e3;
      if (r > 0)
        return {
          icon: "mdi:battery-low",
          time: Ee(e / r * 60)
        };
    }
    return null;
  }
  /** @returns {"charging" | "discharging" | "idle"} */
  _flowMode(t) {
    if (!t) return "idle";
    const e = 40, r = t.chargeW != null ? Number(t.chargeW) : 0, o = t.dischargeW != null ? Number(t.dischargeW) : 0;
    return r > e ? "charging" : o > e ? "discharging" : "idle";
  }
  render() {
    const t = this.data;
    if (!t || t.soc == null || t.capacity == null || t.capacity <= 0) return y;
    const e = Math.max(0, Math.min(100, Number(t.socMin ?? 0)));
    let r = Math.max(e, Math.min(100, Number(t.socMax ?? 100)));
    const o = Math.max(0, Math.min(100, Number(t.soc))), s = Math.min(r, Math.max(e, o));
    let a = s;
    const l = t.capacity, n = t.available;
    if (n != null && Number.isFinite(n) && l > 0) {
      const _ = e + n / l * 100;
      a = Math.min(Math.max(_, e), s, r);
    }
    const d = n != null && Number.isFinite(n) ? n : l * Math.max(0, s - e) / 100, h = Math.round(o).toLocaleString(this.numberLocale ?? "fr-FR"), p = `${this._fmtKwh(d)} / ${this._fmtKwh(l)} kWh (${h} %)`, u = this._flowMode(t), m = u === "charging" ? "batt-green--charging" : u === "discharging" ? "batt-green--discharging" : "", f = 18, g = 100 / f, E = (_) => Math.max(0, Math.min(1, _)), $ = (_, k, x, b) => Math.max(0, Math.min(k, b) - Math.max(_, x)), C = Array.from({ length: f }, (_, k) => {
      const x = k * g, b = (k + 1) * g, S = $(x, b, x, e) / g * 100, D = $(x, b, r, b) / g * 100, N = Math.max(x, e), T = Math.min(b, a, r), A = $(x, b, N, T) / g * 100, L = E((N - x) / g) * 100, H = `--hatch-l:${S.toFixed(3)};--hatch-r:${D.toFixed(3)};--fill-x:${L.toFixed(
        3
      )};--fill-w:${A.toFixed(3)};`;
      return v`<div class="batt-cell" style="${H}">
        <div class="batt-cell-hatch batt-cell-hatch--left"></div>
        <div class="batt-cell-hatch batt-cell-hatch--right"></div>
        <div class="batt-cell-fill"></div>
      </div>`;
    }), w = this._resolveEta();
    return v`
      <div class="batt-bar-container">
        <div class="batt-section-head">
          <h3>${this.i18n.battSocTitle}</h3>
        </div>
        <div class="batt-track-wrap" title="${Math.round(o)} % SOC">
          <div class="batt-track">
            <div class="batt-segments ${m}">${C}</div>
          </div>
          <div class="batt-bar-total">
            <div class="batt-bar-stack">
              <div class="batt-bar-row-main">
                <span class="batt-bar-total-text">${p}</span>
              </div>
              ${w ? v`<div class="batt-bar-eta-inline">
                    <ha-icon class="batt-eta-icon" icon=${w.icon}></ha-icon>
                    <span>${w.time}</span>
                  </div>` : y}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.get("hub-energie-battery-bar") || customElements.define("hub-energie-battery-bar", Kr);
class Xr extends W {
  static get properties() {
    return {
      i18n: { attribute: !1 },
      totalMaison: { type: Number },
      originGrid: { type: Number },
      totalEur: { type: Number },
      ecoTotal: { type: Number }
    };
  }
  static get styles() {
    return ct`
      :host {
        display: block;
      }
      .insight-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 6px;
        justify-content: center;
        margin-bottom: 5px;
      }
      .insight-chip {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 0.7rem;
        font-weight: 700;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        white-space: nowrap;
        letter-spacing: 0.01em;
      }
      .insight-chip.eco {
        color: #43a047;
      }
      .insight-chip.warn {
        color: #f9a825;
      }
      .insight-chip.neg {
        color: #e53935;
      }
    `;
  }
  constructor() {
    super(), this.i18n = {}, this.totalMaison = 0, this.originGrid = 0, this.totalEur = 0, this.ecoTotal = 0;
  }
  render() {
    if (!(this.totalMaison > 0)) return y;
    const t = Math.max(
      0,
      Math.min(100, Math.round((1 - Math.min(this.originGrid, this.totalMaison) / this.totalMaison) * 100))
    ), e = t >= 60 ? "eco" : t >= 30 ? "" : "warn", r = this.ecoTotal >= 0 ? "−" : "+", o = this.ecoTotal >= 0 ? "eco" : "neg";
    return v`
      <div class="insight-bar">
        <span class="insight-chip ${e}">☀️ ${t}% ${this.i18n.insightAutosuff}</span>
        <span class="insight-chip">💸 ${this.totalEur.toFixed(2)} €</span>
        <span class="insight-chip ${o}">
          ⚡ ${r}${Math.abs(this.ecoTotal).toFixed(2)}€ ${this.i18n.insightVsGrid}
        </span>
      </div>
    `;
  }
}
customElements.get("hub-insight-bar") || customElements.define("hub-insight-bar", Xr);
const le = "custom:hub-energie-card", ce = /* @__PURE__ */ new Set([24, 12, 6, 3, 1]), qr = [1, 3, 6, 12, 24];
class Yr extends W {
  static properties = {
    hass: { attribute: !1 },
    _config: { state: !0 }
  };
  static styles = ct`
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
  `;
  setConfig(t) {
    this._config = t && typeof t == "object" ? { ...t } : { type: le }, this._config.type || (this._config.type = le);
  }
  async firstUpdated() {
    await this._ensureEntityPicker(), this.requestUpdate();
  }
  async _ensureEntityPicker() {
    if (!customElements.get("ha-entity-picker"))
      try {
        const t = window.loadCardHelpers;
        if (typeof t != "function") return;
        const o = (await (await t()).createCardElement({ type: "entities", entities: [] })).constructor;
        typeof o.getConfigElement == "function" && o.getConfigElement();
      } catch {
      }
  }
  render() {
    const t = this._config ?? {}, e = Number(t.grid_span ?? 1), r = Number.isFinite(e) ? Math.max(1, Math.min(3, Math.trunc(e))) : 1, o = parseFloat(t.power_history_hours), s = Math.trunc(o), a = ce.has(s) ? s : 6;
    return v`
      <div class="card-config">
        <div class="field">
          <ha-entity-picker
            .hass=${this.hass}
            .value=${t.cost_entity ?? ""}
            label="Cost detail entity"
            .includeDomains=${["sensor"]}
            .allowCustomEntity=${!0}
            @value-changed=${this._onCostEntity}
          ></ha-entity-picker>
          <p class="hint">
            Hub Énergie <code>…_cost_detail</code> sensor. Leave empty to use the default
            <code>sensor.hub_energie_</code> prefix.
          </p>
        </div>

        <div class="field">
          <ha-textfield
            label="Entity prefix (optional)"
            .value=${t.entity_prefix ?? ""}
            placeholder="sensor.hub_energie_"
            @change=${this._onEntityPrefix}
          ></ha-textfield>
          <p class="hint">
            Optional. Overrides automatic prefix for non-default entity namespaces; a trailing
            <code>_</code> is added if missing.
          </p>
        </div>

        <div class="field">
          <ha-select
            label="Section width (grid columns)"
            .value=${String(r)}
            @closed=${this._onGridSpanClosed}
            .fixedMenuPosition=${!0}
            .naturalMenuWidth=${!0}
          >
            <ha-list-item value="1">1 × 12 (narrow)</ha-list-item>
            <ha-list-item value="2">2 × 12 (default in card picker)</ha-list-item>
            <ha-list-item value="3">3 × 12 (full width)</ha-list-item>
          </ha-select>
        </div>

        <div class="field">
          <ha-select
            label="Power graph default window"
            .value=${String(a)}
            @closed=${this._onPowerHoursClosed}
            .fixedMenuPosition=${!0}
            .naturalMenuWidth=${!0}
          >
            ${qr.map(
      (l) => v`<ha-list-item value="${String(l)}">${l} hours</ha-list-item>`
    )}
          </ha-select>
          <p class="hint">Rolling history length when opening the live power graph.</p>
        </div>

        <p class="hint">
          Advanced: <code>power_history_refresh_seconds</code> (live graph poll interval, default 120s)
          remains YAML-only for this version.
        </p>
      </div>
    `;
  }
  _emit(t) {
    const e = { ...t };
    e.type = le, this.dispatchEvent(
      new CustomEvent("config-changed", {
        bubbles: !0,
        composed: !0,
        detail: { config: e }
      })
    );
  }
  _onCostEntity(t) {
    const e = t.detail?.value ?? "", r = { ...this._config };
    e ? r.cost_entity = e : delete r.cost_entity, this._emit(r);
  }
  _onEntityPrefix(t) {
    const e = t.target?.value ?? "", r = { ...this._config }, o = String(e).trim();
    o ? r.entity_prefix = o : delete r.entity_prefix, this._emit(r);
  }
  _onGridSpanClosed(t) {
    const e = t.target;
    if (!e?.value) return;
    const r = Math.max(1, Math.min(3, Math.trunc(Number(e.value))));
    if (!Number.isFinite(r)) return;
    const o = Math.max(1, Math.min(3, Math.trunc(Number(this._config?.grid_span ?? 1))));
    if (r === o) return;
    const s = { ...this._config, grid_span: r };
    this._emit(s);
  }
  _onPowerHoursClosed(t) {
    const e = t.target;
    if (!e?.value) return;
    const r = Math.trunc(Number(e.value));
    if (!ce.has(r)) return;
    const o = parseFloat(this._config?.power_history_hours), s = ce.has(Math.trunc(o)) ? Math.trunc(o) : 6;
    if (r === s) return;
    const a = { ...this._config, power_history_hours: r };
    this._emit(a);
  }
}
customElements.get("hub-energie-card-editor") || customElements.define("hub-energie-card-editor", Yr);
class Zr extends W {
  static get properties() {
    return {
      hass: { attribute: !1 },
      _config: { state: !0 },
      _date: { state: !0 },
      _rangePreset: { state: !0 },
      _showRaw: { state: !0 },
      _hist: { state: !0 },
      _histLoading: { state: !0 },
      _histErr: { state: !0 },
      _powerGraphOpen: { state: !0 },
      _powerGraphLoading: { state: !0 },
      _powerGraphErr: { state: !0 },
      _powerGraphSeries: { state: !0 },
      _powerGraphRollingHours: { state: !0 }
    };
  }
  static get styles() {
    return ct`
      :host {
        display: block;
        width: 100%;
      }
      ha-card {
        width: 100%;
        padding: 8px 12px 10px;
        box-sizing: border-box;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 6px;
      }
      .header-title-side {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 8px 12px;
        min-width: 0;
      }
      .header h2 {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .header-subtitle {
        font-size: 0.78rem;
        font-weight: 500;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: min(280px, 100%);
      }
      .controls {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .controls label {
        font-size: 0.82rem;
        opacity: 0.7;
      }
      .range-btns {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .range-btn {
        background: none;
        border: 1px solid var(--divider-color);
        color: var(--primary-text-color);
        border-radius: 999px;
        padding: 2px 8px;
        font: inherit;
        font-size: 0.75rem;
        cursor: pointer;
      }
      .range-btn.active {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 18%, transparent);
      }
      .range-label {
        font-size: 0.76rem;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
      input[type="date"] {
        background: var(--input-fill-color, var(--secondary-background-color));
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        padding: 4px 8px;
        font-size: 0.82rem;
        font-family: inherit;
        cursor: pointer;
      }
      .btn {
        background: none;
        border: 1px solid var(--divider-color);
        color: var(--primary-text-color);
        border-radius: 6px;
        padding: 4px 10px;
        font: inherit;
        font-size: 0.8rem;
        cursor: pointer;
      }
      .btn:hover {
        background: var(--secondary-background-color);
      }
      .alert {
        margin: 0 0 12px;
        padding: 10px 12px;
        border-radius: 8px;
        background: var(--warning-color, #ff9800);
        color: var(--text-primary-color, #fff);
        font-size: 0.83rem;
        line-height: 1.5;
      }
      .alert code {
        background: rgba(0, 0, 0, 0.18);
        padding: 1px 4px;
        border-radius: 3px;
      }
      .loader {
        font-size: 0.83rem;
        opacity: 0.65;
        margin: 8px 0;
      }
      .meta-tempo-wrap {
        margin: 0 0 6px;
        display: flex;
        flex-direction: row;
        align-items: stretch;
        gap: 8px;
      }
      /* Tempo: 6-row grid — left tiles span 3 rows each; right counters 2 rows each. auto rows = compact height. */
      .meta-tempo-wrap:has(.tempo-days) {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        grid-template-rows: repeat(6, auto);
        gap: 4px;
        align-items: stretch;
      }
      .meta-tempo-wrap:has(.tempo-days) .meta-days-stack {
        display: contents;
      }
      .meta-tempo-wrap:has(.tempo-days) .meta-days-stack > .day-tile:nth-child(1) {
        grid-column: 1;
        grid-row: 1 / 4;
        min-height: 0;
      }
      .meta-tempo-wrap:has(.tempo-days) .meta-days-stack > .day-tile:nth-child(2) {
        grid-column: 1;
        grid-row: 4 / 7;
        min-height: 0;
      }
      .meta-tempo-wrap:has(.tempo-days) .tempo-days {
        display: contents;
      }
      .meta-tempo-wrap:has(.tempo-days) .tempo-day:nth-child(1) {
        grid-column: 2;
        grid-row: 1 / 3;
        min-height: 0;
      }
      .meta-tempo-wrap:has(.tempo-days) .tempo-day:nth-child(2) {
        grid-column: 2;
        grid-row: 3 / 5;
        min-height: 0;
      }
      .meta-tempo-wrap:has(.tempo-days) .tempo-day:nth-child(3) {
        grid-column: 2;
        grid-row: 5 / 7;
        min-height: 0;
      }
      .meta-days-stack {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .day-tile {
        border-radius: 8px;
        padding: 4px 8px;
        min-height: 36px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-sizing: border-box;
      }
      .meta-tempo-wrap:has(.tempo-days) .day-tile {
        min-height: 0;
        padding: 3px 8px;
      }
      .day-tile-label {
        font-size: 0.58rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        opacity: 0.92;
        margin-bottom: 1px;
      }
      .day-tile-value {
        font-size: 0.74rem;
        font-weight: 700;
        line-height: 1.15;
      }
      .day-tile.color-blue {
        background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
        color: #fff;
        border-color: rgba(255, 255, 255, 0.28);
      }
      .day-tile.color-blue .day-tile-label {
        color: rgba(255, 255, 255, 0.9);
      }
      .day-tile.color-white {
        background: linear-gradient(135deg, #546e7a 0%, #37474f 100%);
        color: #eceff1;
        border-color: rgba(255, 255, 255, 0.22);
      }
      .day-tile.color-white .day-tile-label {
        color: rgba(236, 239, 241, 0.88);
      }
      .day-tile.color-red {
        background: linear-gradient(135deg, #e53935 0%, #b71c1c 100%);
        color: #fff;
        border-color: rgba(255, 255, 255, 0.28);
      }
      .day-tile.color-red .day-tile-label {
        color: rgba(255, 255, 255, 0.9);
      }
      .day-tile.color-na {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        border-color: var(--divider-color);
      }
      .day-tile.color-na .day-tile-label {
        color: var(--secondary-text-color);
      }
      .color-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 1px 6px;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 600;
        background: var(--secondary-background-color);
      }
      .color-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
      }
      .color-blue {
        background: #1e88e5;
      }
      .color-white {
        background: #b0bec5;
      }
      .color-red {
        background: #e53935;
      }
      .color-na {
        background: #757575;
      }
      .status-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 6px;
        vertical-align: middle;
      }
      .status-green {
        background: #43a047;
      }
      .status-amber {
        background: #f9a825;
      }
      .status-red {
        background: #e53935;
      }
      .red-hp-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 8px;
        padding: 7px 12px;
        border-radius: 8px;
        background: color-mix(in srgb, #e53935 14%, var(--card-background-color, #1c1c1c));
        border: 1px solid color-mix(in srgb, #e53935 48%, transparent);
        font-size: 0.8rem;
        font-weight: 700;
        line-height: 1.3;
        color: var(--primary-text-color);
      }
      .tempo-days {
        flex: 1;
        min-width: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .tempo-day {
        border-radius: 6px;
        padding: 3px 8px;
        font-size: 0.68rem;
        font-weight: 700;
        line-height: 1.2;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        display: flex;
        flex-direction: row;
        align-items: center;
        box-sizing: border-box;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tempo-blue {
        border-left: 3px solid #42a5f5;
      }
      .tempo-white {
        border-left: 3px solid #9e9e9e;
      }
      .tempo-red {
        border-left: 3px solid #ef5350;
      }
      section {
        margin-bottom: 10px;
        padding: 6px 8px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--secondary-background-color) 70%, transparent);
        border: 1px solid color-mix(in srgb, var(--divider-color) 75%, transparent);
      }
      section:last-of-type {
        margin-bottom: 0;
      }
      .section-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
        padding-bottom: 4px;
        margin: 0 0 4px;
        border-bottom: 1px dashed color-mix(in srgb, var(--divider-color) 70%, transparent);
      }
      .section-head h3 {
        margin: 0;
        font-size: 0.72rem;
        font-weight: 800;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .section-metric {
        display: inline-flex;
        align-items: baseline;
        gap: 5px;
        color: var(--secondary-text-color);
        font-size: 0.68rem;
        white-space: nowrap;
      }
      .section-metric b {
        color: var(--primary-text-color);
        font-weight: 900;
        font-variant-numeric: tabular-nums;
      }
      .bars {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .raw {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 10px;
        font-size: 0.78rem;
        font-family: var(--ha-font-family-code, monospace);
        line-height: 1.7;
      }
      .raw-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .raw-grid b {
        display: block;
        margin-bottom: 2px;
      }
    `;
  }
  constructor() {
    super(), this._config = {}, this._date = M(), this._rangePreset = "day", this._showRaw = !1, this._hist = null, this._histLoading = !1, this._histErr = null, this._prefixCache = null, this.__lastKey = null, this._powerGraphOpen = !1, this._powerGraphLoading = !1, this._powerGraphErr = null, this._powerGraphSeries = null, this._hassRetryTimer = null, this._costMissingSinceMs = null, this._powerGraphPollTimer = null, this._powerGraphLoadId = 0, this._powerGraphRollingHours = ot;
  }
  connectedCallback() {
    super.connectedCallback(), requestAnimationFrame(() => requestAnimationFrame(() => this.requestUpdate()));
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._clearHassRetryTimer(), this._clearPowerGraphPollTimer(), this._costMissingSinceMs = null;
  }
  _clearPowerGraphPollTimer() {
    this._powerGraphPollTimer != null && (clearInterval(this._powerGraphPollTimer), this._powerGraphPollTimer = null);
  }
  /** Refresh interval only while the graph shows the current Paris day (live tail). */
  _syncPowerGraphPollTimer() {
    if (this._clearPowerGraphPollTimer(), !this._powerGraphOpen || !this.hass || (this._date ?? M()) !== M()) return;
    const e = parseFloat(this._config?.power_history_refresh_seconds), r = Number.isFinite(e) && e > 0 ? Math.max(15e3, Math.min(3e5, Math.round(e * 1e3))) : 12e4;
    this._powerGraphPollTimer = window.setInterval(() => {
      this._powerGraphOpen && this.hass && this._loadPowerGraph({ refresh: !0 });
    }, r);
  }
  _setPowerGraphRollingHours(t) {
    const e = At(t, ot);
    this._powerGraphRollingHours !== e && (this._powerGraphRollingHours = e, this.__lastKey = null);
  }
  _clearHassRetryTimer() {
    this._hassRetryTimer != null && (clearTimeout(this._hassRetryTimer), this._hassRetryTimer = null);
  }
  _scheduleHassRetry(t = 96) {
    this._hassRetryTimer == null && (this._hassRetryTimer = setTimeout(() => {
      this._hassRetryTimer = null, this.requestUpdate();
    }, t));
  }
  /**
   * Live mode + cost_detail not in hass.states yet: wait for HA/WebSocket instead of error UI.
   * Returns true when we should show the bootstrap placeholder (and schedule retries).
   */
  _liveBootstrapWaiting(t) {
    const e = this.hass;
    if (!e || !this._isLiveMode()) return !1;
    const r = e.states;
    if (ae(r, t))
      return this._costMissingSinceMs = null, !1;
    if (e.connected === !1)
      return this._scheduleHassRetry(), !0;
    if ((r && typeof r == "object" ? Object.keys(r).length : 0) === 0)
      return this._scheduleHassRetry(), !0;
    const s = performance.now();
    return this._costMissingSinceMs == null && (this._costMissingSinceMs = s), s - this._costMissingSinceMs < 1800 ? (this._scheduleHassRetry(), !0) : !1;
  }
  setConfig(t) {
    this._config = t ?? {}, this._prefixCache = null, this.__lastKey = null;
    const e = parseFloat(this._config?.power_history_hours), r = At(
      Number.isFinite(e) ? e : NaN,
      ot
    );
    this._powerGraphRollingHours !== r && (this._powerGraphRollingHours = r, this.__lastKey = null);
  }
  getCardSize() {
    return 8;
  }
  getGridOptions() {
    const t = Number(this._config?.grid_span ?? 1), e = Number.isFinite(t) ? Math.max(1, Math.min(3, Math.trunc(t))) : 1;
    return {
      columns: e * 12,
      min_columns: e * 12,
      max_columns: e * 12,
      rows: 8,
      min_rows: 6
    };
  }
  static getConfigElement() {
    return document.createElement("hub-energie-card-editor");
  }
  static getStubConfig() {
    return {
      type: "custom:hub-energie-card",
      cost_entity: "sensor.hub_energie_cost_detail",
      grid_span: 2
    };
  }
  shouldUpdate(t) {
    if (t.has("hass") && t.size === 1 && this.hass)
      try {
        if (this._isLiveMode()) {
          const e = this._map();
          if (!ae(this.hass.states, e.cost))
            return this.__lastKey = null, !0;
        }
      } catch {
        return this.__lastKey = null, !0;
      }
    if (t.has("hass") && t.size === 1) {
      let e;
      try {
        e = this._stateKey();
      } catch {
        e = null;
      }
      return e !== null && e === this.__lastKey ? !1 : (this.__lastKey = e, !0);
    }
    return !0;
  }
  updated(t) {
    super.updated(t), (t.has("hass") || t.has("_date") || t.has("_rangePreset")) && this._loadHistory(), this._powerGraphOpen && (t.has("_date") || t.has("_powerGraphRollingHours")) && this.hass && (this._powerGraphSeries = null, this._powerGraphErr = null, this._loadPowerGraph({ force: !0 }), this._syncPowerGraphPollTimer());
  }
  _i18n() {
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? He.en : He.fr;
  }
  _prefix() {
    if (this._prefixCache) return this._prefixCache;
    const t = this._config;
    let e;
    if (t.entity_prefix)
      e = String(t.entity_prefix).trim(), e.endsWith("_") || (e += "_");
    else if (t.cost_entity) {
      const r = String(t.cost_entity).trim();
      e = r.endsWith("_cost_detail") ? `${r.slice(0, -12)}_` : "sensor.hub_energie_";
    } else
      e = "sensor.hub_energie_";
    return this._prefixCache = e, e;
  }
  _map() {
    return $r(this._prefix());
  }
  _getRange() {
    return mr(this._date ?? M(), this._rangePreset ?? "day");
  }
  _isLiveMode() {
    const t = this._getRange();
    return (this._rangePreset ?? "day") === "day" && t.endIso === M();
  }
  /** Safe fingerprint for change detection; must never throw (used from shouldUpdate). */
  _fingerprintTempoDays(t) {
    if (t == null) return "";
    if (typeof t != "object") return String(t);
    try {
      return JSON.stringify(t);
    } catch {
      return "";
    }
  }
  _stateKey() {
    const t = this._getRange();
    if (!this._isLiveMode())
      return `hist:${t.startIso}:${t.endIso}:${this._rangePreset ?? "day"}:${this._histLoading ? "loading" : this._hist ? "ok" : "none"}:${this._histErr ?? ""}`;
    const e = this.hass?.states;
    if (!e) return null;
    const r = this._map(), o = [
      r.cost,
      r.ecoSolar,
      r.ecoBatt,
      r.originGrid,
      r.originSolar,
      r.usageGridDirect,
      r.usageGridBatt,
      r.usageSolarDirect,
      r.usageSolarBatt,
      r.usageBattHome
    ], s = e[r.cost]?.attributes ?? {}, a = [
      s.offer ?? "",
      s.contract_power ?? "",
      s.tariff_fetched_at ?? "",
      s.current_slot ?? "",
      this._fingerprintTempoDays(s.tempo_days),
      s.grid_power_signed_w ?? "",
      s.solar_power_w ?? "",
      s.solar_estimate_power_w ?? "",
      s.batt_discharge_power_w ?? "",
      s.batt_charge_power_w ?? "",
      s.load_power_w ?? "",
      s.export_power_w ?? "",
      s.battery_soc_percent ?? "",
      s.battery_capacity_kwh ?? "",
      Wt(s.grid_by_slot_kwh),
      Wt(s.maison_by_slot_kwh),
      Wt(s.usage_grid_batt_charge_by_slot_kwh),
      Wt(s.usage_solar_batt_charge_by_slot_kwh),
      e[r.cost]?.last_updated ?? ""
    ].join("|");
    return `${o.map((l) => e[l]?.state ?? "").join("|")}|${a}`;
  }
  _states() {
    return (this._isLiveMode() ? this.hass?.states : this._hist) ?? {};
  }
  _extract(t) {
    return Br(this._states(), this._map(), t);
  }
  _onDateChange(t) {
    this._date = t.target.value, this._hist = null, this._histLoading = !1, this._histErr = null, this.__lastKey = null;
  }
  _setRangePreset(t) {
    this._rangePreset = t, this._hist = null, this._histLoading = !1, this._histErr = null, this.__lastKey = null;
  }
  _onRawToggle() {
    this._showRaw = !this._showRaw, this.__lastKey = null;
  }
  _loadHistory() {
    if (this._isLiveMode() || !this.hass || this._histLoading || this._hist !== null) return;
    this._histLoading = !0;
    const t = this._map(), e = this._getRange(), r = [
      t.cost,
      t.ecoSolar,
      t.ecoBatt,
      t.originGrid,
      t.originSolar,
      t.usageGridDirect,
      t.usageGridBatt,
      t.usageSolarDirect,
      t.usageSolarBatt,
      t.usageBattHome
    ];
    Tr(this.hass, e.startIso, e.endIso, r, t.cost).then((o) => {
      this._hist = o, this._histErr = null;
    }).catch((o) => {
      this._histErr = o.message ?? String(o), this._hist = null;
    }).finally(() => {
      this._histLoading = !1, this.__lastKey = null;
    });
  }
  /**
   * @param {{ refresh?: boolean; force?: boolean }} [opts]
   *   refresh: reload statistics while the graph stays open (no full-screen loading).
   *   force: new window fetch even if a previous load is still in flight (date / duration change).
   */
  async _loadPowerGraph(t = {}) {
    const e = t.refresh === !0, r = t.force === !0;
    if (!this.hass || !this._powerGraphOpen) return;
    const s = this._map().cost;
    if (!s) return;
    if (!e) {
      if (!r && (this._powerGraphLoading || this._powerGraphSeries !== null)) return;
      this._powerGraphLoading = !0, this._powerGraphErr = null;
    }
    let a;
    e ? a = this._powerGraphLoadId : (this._powerGraphLoadId += 1, a = this._powerGraphLoadId);
    const l = this._date ?? M(), n = At(
      this._powerGraphRollingHours,
      ot
    ), d = l === M();
    let h, p, u = !1, m = "day", f = null, g = 24;
    if (d) {
      m = "rolling", f = n, g = n;
      const C = /* @__PURE__ */ new Date();
      p = C, h = new Date(C.getTime() - n * 60 * 60 * 1e3), u = !0;
    } else if (h = K(l), p = K(Vt(l, 1)), !Number.isFinite(h.getTime()) || !Number.isFinite(p.getTime())) {
      !e && this._powerGraphLoadId === a && (this._powerGraphLoading = !1, this._powerGraphErr = this._i18n().noData, this._powerGraphSeries = null);
      return;
    }
    const E = {
      hoursBack: g,
      statsPts: [],
      hasLoadEntity: !1,
      useLiveTail: u,
      windowMode: m,
      rollingHours: f,
      dayIso: l
    }, $ = this._i18n();
    try {
      const C = this.hass.states[s]?.attributes?.power_graph_entity_map, w = C && typeof C == "object" ? C : null, _ = Er(w);
      if (!_.length) {
        !e && this._powerGraphLoadId === a && (this._powerGraphErr = $.powerHistoryNoSensors, this._powerGraphSeries = { ...E });
        return;
      }
      const k = await Lr(this.hass, {
        startTimeIso: h.toISOString(),
        endTimeIso: p.toISOString(),
        statisticIds: _,
        period: "5minute"
      });
      if (this._powerGraphLoadId !== a || !this._powerGraphOpen || (this._date ?? M()) !== l || d && At(this._powerGraphRollingHours, ot) !== n)
        return;
      const x = Gr(w, k);
      if (!x?.filled?.length) {
        !e && this._powerGraphLoadId === a && (this._powerGraphErr = $.powerHistoryNoStatistics, this._powerGraphSeries = {
          ...E,
          hasLoadEntity: typeof w?.load_entity == "string" && w.load_entity.trim() !== ""
        });
        return;
      }
      const b = x.filled, S = 160, N = ((T) => {
        if (T.length <= S) return T;
        const A = T.length / S, L = [];
        for (let H = 0; H < S; H++)
          L.push(T[Math.floor(H * A)]);
        return L;
      })(b);
      this._powerGraphLoadId === a && (this._powerGraphSeries = {
        hoursBack: g,
        statsPts: N,
        hasLoadEntity: typeof w?.load_entity == "string" && w.load_entity.trim() !== "",
        useLiveTail: u,
        windowMode: m,
        rollingHours: f,
        dayIso: l
      });
    } catch (C) {
      !e && this._powerGraphLoadId === a && (this._powerGraphErr = C?.message ?? String(C), this._powerGraphSeries = null);
    } finally {
      !e && this._powerGraphLoadId === a && (this._powerGraphLoading = !1), this.__lastKey = null;
    }
  }
  _togglePowerGraph() {
    const t = !this._powerGraphOpen;
    this._powerGraphOpen = t, this.__lastKey = null, t || this._clearPowerGraphPollTimer(), t && (this._powerGraphSeries = null, this._powerGraphErr = null, this._loadPowerGraph(), this._syncPowerGraphPollTimer());
  }
  _powerGraphDisplaySeries() {
    if (!this._powerGraphOpen) return null;
    const t = this._powerGraphSeries;
    if (!t?.statsPts?.length) return null;
    const e = t.useLiveTail === !0, o = this._map().cost, s = o ? this.hass?.states[o]?.attributes?.power_graph_entity_map : null, a = s && typeof s == "object" ? s : null, l = e && a && this.hass ? Pr(this.hass, a) : null, n = e ? Dr(t.statsPts, l) : t.statsPts, { yMin: d, yMax: h } = Nr(n);
    return {
      hoursBack: t.hoursBack,
      pts: n,
      yMin: d,
      yMax: h,
      hasLoadEntity: t.hasLoadEntity === !0,
      windowMode: t.windowMode ?? "rolling",
      rollingHours: t.rollingHours ?? null,
      dayIso: t.dayIso ?? this._date ?? M(),
      useLiveTail: e
    };
  }
  _renderRedHpWarning(t, e, r, o, s) {
    if (e !== "tempo" || r <= 0) return y;
    const l = (t ?? []).find((d) => d.id === "rouge_hp")?.v ?? 0;
    if (l < 0.1) return y;
    const n = (o.solarDirect?.v ?? 0) + (o.solarBatt?.v ?? 0) + (o.battHome?.v ?? 0);
    return l / r < 0.35 || l <= n ? y : v`<div class="red-hp-banner">⚠️ ${s.redHpWarning}</div>`;
  }
  _renderSlotMapRaw(t, e, r) {
    const o = r.emDash;
    if (!t || typeof t != "object") return o;
    const s = st.map((a) => {
      const l = t[a.id], n = typeof l == "number" ? l : parseFloat(l);
      return Number.isFinite(n) && n > 1e-5 ? { label: j(a.id, e, r), v: n } : null;
    }).filter(Boolean);
    return s.length ? s.map((a, l) => v`${l > 0 ? v`<br />` : y}${a.label}: ${a.v.toFixed(3)} kWh`) : o;
  }
  render() {
    try {
      return this._renderCardImpl();
    } catch (t) {
      console.warn("[hub-energie-card] render error", t);
      let e = "…";
      try {
        e = this._i18n()?.waitingHassBootstrap ?? "…";
      } catch {
      }
      return v`<ha-card><div class="loader">${e}</div></ha-card>`;
    }
  }
  _renderCardImpl() {
    const t = this._i18n();
    if (!this.hass) return v`<ha-card></ha-card>`;
    const e = String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? "en-GB" : "fr-FR", r = this._isLiveMode(), o = this._map();
    if (r && !ae(this.hass?.states, o.cost))
      return this._liveBootstrapWaiting(o.cost) ? v`
          <ha-card>
            <div class="header"><h2>Hub Énergie</h2></div>
            <div class="loader">${t.waitingHassBootstrap}</div>
          </ha-card>
        ` : v`
        <ha-card>
          <div class="header"><h2>Hub Énergie</h2></div>
          <div class="alert">
            ${t.costEntityNotFoundBefore} <code>${o.cost}</code> ${t.costEntityNotFoundAfter}<br />
            ${t.costEntityCardHint}<br />
            ${t.costEntityDevHint}
          </div>
        </ha-card>
      `;
    const s = this._getRange(), {
      grid: a,
      maison: l,
      totalEur: n,
      costs: d,
      abo: h,
      ecoSolar: p,
      ecoBatt: u,
      og: m,
      os: f,
      usage: g,
      costEntityOk: E,
      offer: $,
      contractPower: C,
      currentSlot: w,
      tempoDays: _,
      todayColor: k,
      tomorrowColor: x,
      reinj: b,
      gridBattBySlot: S,
      solarBattBySlot: D
    } = this._extract(t), N = a.reduce((c, F) => c + F.v, 0), T = l.reduce((c, F) => c + F.v, 0), A = a.filter((c) => c.v > 1e-3), L = d.filter((c) => c.v > 5e-4), H = p + u, X = It([N, ...a.map((c) => c.v), g.gridDirect.v, g.gridBatt.v]), J = g.gridDirect.v, vt = Math.max(0, g.solarDirect.v - g.solarBatt.v), xt = g.battHome.v, $t = J + vt + xt, Q = It([$t, J, vt, xt]), St = g.gridBatt.v + g.solarBatt.v, ht = E ? Ge($, S, t) : [], pt = E ? Ge($, D, t) : [], Zt = E && (ht.length > 0 || pt.length > 0), O = [];
    if (Zt) {
      if (pt.length) {
        const c = pt.reduce((F, fe) => F + (Number.isFinite(fe?.v) ? fe.v : 0), 0);
        c > 1e-5 && O.push({
          label: t.brkTblSolar,
          v: c,
          color: g.solarBatt.color,
          isHc: !1
        });
      } else g.solarBatt.v > 1e-3 && O.push({
        label: t.brkTblSolar,
        v: g.solarBatt.v,
        color: g.solarBatt.color,
        isHc: !1
      });
      if (ht.length)
        for (const c of ht)
          O.push({
            label: `${t.brkTblGridHome} · ${c.label}`,
            v: c.v,
            color: c.color,
            isHc: c.isHc
          });
      else g.gridBatt.v > 1e-3 && O.push({
        label: t.brkTblGridHome,
        v: g.gridBatt.v,
        color: g.gridBatt.color,
        isHc: !1
      });
    } else
      g.gridBatt.v > 1e-3 && O.push({
        label: t.brkTblGridHome,
        v: g.gridBatt.v,
        color: g.gridBatt.color,
        isHc: !1
      }), g.solarBatt.v > 1e-3 && O.push({
        label: t.brkTblSolar,
        v: g.solarBatt.v,
        color: g.solarBatt.color,
        isHc: !1
      });
    const dt = It([
      St,
      ...O.map((c) => c.v)
    ]), Pt = A.map((c) => ({ value: c.v, color: c.color, className: c.isHc ? "fill-hc" : "" })), Jt = A.map((c) => ({
      label: j(c.id, $, t),
      value: X(c.v),
      color: c.color,
      rawV: c.v
    })), ut = [
      { label: t.brkTblGridHome, v: J, color: g.gridDirect.color },
      { label: t.brkTblSolar, v: vt, color: g.solarDirect.color },
      { label: t.brkTblBattHome, v: xt, color: g.battHome.color }
    ].filter((c) => c.v > 1e-3), tt = ut.map((c) => ({ value: c.v, color: c.color })), V = ut.map((c) => ({
      label: c.label,
      value: Q(c.v),
      color: c.color,
      rawV: c.v
    })), z = O.map((c) => ({
      value: c.v,
      color: c.color,
      className: c.isHc ? "fill-hc" : ""
    })), Dt = O.map((c) => ({
      label: c.label,
      value: dt(c.v),
      color: c.color,
      rawV: c.v
    })), Qt = [
      ...L.map((c) => ({ value: c.v, color: c.color, className: c.isHc ? "fill-hc" : "" })),
      ...h > 5e-4 ? [{ value: h, color: Ae }] : []
    ], Rt = [
      ...L.map((c) => ({
        label: j(c.id, $, t),
        value: `${c.v.toFixed(2)} €`,
        color: c.color,
        rawV: c.v
      })),
      ...h > 5e-4 ? [{ label: t.costSubscription, value: `${h.toFixed(2)} €`, color: Ae, rawV: h }] : []
    ], et = [
      { label: t.reinjCauseSolarSurplus, v: b.solarSurplus, eur: b.oppSolarEur, color: nt },
      { label: t.reinjCauseBatteryFull, v: b.batteryFull, eur: b.oppBatteryEur, color: lt },
      { label: t.reinjCauseSwitchLatency, v: b.switchLatency, eur: b.oppLatencyEur, color: "#ff7043" },
      { label: t.reinjCauseOther, v: b.unattributed, eur: b.oppOtherEur, color: "#90a4ae" }
    ].filter((c) => c.v > 1e-4), kt = et.reduce((c, F) => c + F.v, 0), gt = It([kt, ...et.map((c) => c.v)]), B = et.map((c) => ({ value: c.v, color: c.color })), Ot = et.map((c) => ({
      label: c.label,
      value: `${gt(c.v)} · ${c.eur.toFixed(2)} €`,
      color: c.color,
      rawV: c.v
    })), q = [
      { label: t.ecoSourceSolar, vAbs: Math.abs(p), color: nt, fmt: `${p >= 0 ? "+" : ""}${p.toFixed(2)} €`, rawV: p },
      { label: t.ecoSourceBatt, vAbs: Math.abs(u), color: lt, fmt: `${u >= 0 ? "+" : ""}${u.toFixed(2)} €`, rawV: u }
    ].filter((c) => c.vAbs > 5e-4), te = q.reduce((c, F) => c + F.vAbs, 0), ee = q.length ? q.map((c) => ({ value: c.vAbs, color: c.color })) : Math.abs(H) > 5e-4 ? [{ value: 1, color: H >= 0 ? "#1976d2" : "#c62828" }] : [], Bt = q.length ? q.map((c) => ({ label: c.label, value: c.fmt, color: c.color, rawV: c.vAbs })) : [], jt = this._states(), re = r && E ? Cr(jt, o.cost, t) : null, Tt = E && this.hass?.states ? Hr(this.hass.states, o.cost) : null, mt = b.solarSurplus + b.batteryFull + b.switchLatency + b.unattributed;
    return v`
      <ha-card>
        <div class="header">
          <div class="header-title-side">
            <h2>Hub Énergie</h2>
            <span class="header-subtitle">${Sr($)}${C ? ` ${C}kVA` : ""}</span>
          </div>
          <div class="controls">
            <label>${t.date}</label>
            <input type="date" .value=${this._date} max=${M()} @change=${this._onDateChange} />
            <label>${t.range}</label>
            <div class="range-btns">
              ${["day", "week", "month", "year"].map((c) => v`
                <button class="range-btn ${this._rangePreset === c ? "active" : ""}" @click=${() => this._setRangePreset(c)}>
                  ${t[c]}
                </button>
              `)}
            </div>
            <span class="range-label">${br(s.startIso, s.endIso, e)}</span>
            <button class="btn" @click=${this._onRawToggle}>${this._showRaw ? t.hide : t.details}</button>
          </div>
        </div>

        ${this._histLoading ? v`<div class="loader">${t.loading}</div>` : y}

        <div class="meta-tempo-wrap">
          <div class="meta-days-stack">
            <div class="day-tile ${$ === "tempo" ? Fe(k) : "color-na"}">
              <span class="day-tile-line">${t.today} : ${j(w, $, t)}</span>
            </div>
            <div class="day-tile ${$ === "tempo" ? Fe(x) : "color-na"}">
              <span class="day-tile-line">${t.tomorrow} : ${$ === "tempo" ? kr(x, t) : t.emDash}</span>
            </div>
          </div>
          ${$ === "tempo" && _ && typeof _ == "object" ? v`
                <div class="tempo-days">
                  <div class="tempo-day tempo-blue">
                    ${t.tempoDayBlue} : ${_.blue?.remaining ?? 0}/${(_.blue?.elapsed ?? 0) + (_.blue?.remaining ?? 0)}
                  </div>
                  <div class="tempo-day tempo-white">
                    ${t.tempoDayWhite} : ${_.white?.remaining ?? 0}/${(_.white?.elapsed ?? 0) + (_.white?.remaining ?? 0)}
                  </div>
                  <div class="tempo-day tempo-red">
                    ${t.tempoDayRed} : ${_.red?.remaining ?? 0}/${(_.red?.elapsed ?? 0) + (_.red?.remaining ?? 0)}
                  </div>
                </div>
              ` : y}
        </div>

        <hub-power-now
          .i18n=${t}
          .data=${re}
          .graphOpen=${this._powerGraphOpen}
          @hub-power-now-toggle=${() => this._togglePowerGraph()}
        ></hub-power-now>
        <hub-power-graph
          .open=${this._powerGraphOpen}
          .i18n=${t}
          .locale=${e}
          .loading=${this._powerGraphLoading}
          .error=${this._powerGraphErr}
          .displaySeries=${this._powerGraphDisplaySeries()}
          .rollingHours=${this._powerGraphRollingHours}
          .isTodayGraph=${(this._date ?? M()) === M()}
          @hub-power-graph-window=${(c) => {
      const F = c.detail?.hours;
      F != null && this._setPowerGraphRollingHours(F);
    }}
        ></hub-power-graph>
        <hub-energie-battery-bar .i18n=${t} .data=${Tt} .numberLocale=${e}></hub-energie-battery-bar>
        <hub-insight-bar .i18n=${t} .totalMaison=${T} .originGrid=${m} .totalEur=${n} .ecoTotal=${H}></hub-insight-bar>
        ${this._renderRedHpWarning(a, $, T, g, t)}

        <section>
          <div class="section-head">
            <h3>${t.sectionConsumption}</h3>
            <div class="section-metric">${t.totalEnergy} <b>${fr(T)}</b></div>
          </div>
          <div class="bars">
            <hub-energy-strip
              .title=${t.consStripGridTitle}
              .segments=${Pt}
              .total=${N}
              .formatter=${X}
              .tooltip=${A.map((c) => `${j(c.id, $, t)}: ${X(c.v)}`).join(" · ")}
              .breakdown=${Jt}
              .showBreakdown=${!0}
              .displayValue=${X(N)}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>

            <hub-energy-strip
              .title=${t.consStripHomeTitle}
              .segments=${tt}
              .total=${$t}
              .formatter=${Q}
              .tooltip=${ut.map((c) => `${c.label}: ${Q(c.v)}`).join(" · ")}
              .breakdown=${V}
              .showBreakdown=${!0}
              .displayValue=${Q($t)}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>

            <hub-energy-strip
              .title=${t.consStripBattTitle}
              .segments=${z}
              .total=${St}
              .formatter=${dt}
              .tooltip=${O.map((c) => `${c.label}: ${dt(c.v)}`).join(" · ")}
              .breakdown=${Dt}
              .showBreakdown=${!0}
              .displayValue=${dt(St)}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>
          </div>
        </section>

        <section>
          <div class="bars">
            <hub-energy-strip
              .title=${t.costStripTitle}
              .segments=${Qt}
              .total=${n}
              .formatter=${(c) => `${Number(c).toFixed(2)} €`}
              .tooltip=${[
      ...L.map((c) => `${j(c.id, $, t)}: ${c.v.toFixed(2)} €${c.tooltip ? ` (${c.tooltip})` : ""}`),
      ...h > 5e-4 ? [`${t.costSubscription}: ${h.toFixed(2)} €`] : []
    ].join(" · ")}
              .breakdown=${Rt}
              .showBreakdown=${!0}
              .displayValue=${`${n.toFixed(2)} €`}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>
          </div>
        </section>

        <section>
          <div class="bars">
            <hub-energy-strip
              .title=${t.ecoStripTitle}
              .segments=${ee}
              .total=${te}
              .formatter=${(c) => `${Number(c).toFixed(2)} €`}
              .tooltip=${q.map((c) => `${c.label}: ${c.fmt}`).join(" · ")}
              .breakdown=${Bt.length ? Bt : [{ label: t.emDash, value: `${H >= 0 ? "+" : ""}${H.toFixed(2)} €` }]}
              .showBreakdown=${!0}
              .displayValue=${`${H >= 0 ? "+" : ""}${H.toFixed(2)} €`}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>
          </div>
        </section>

        <section>
          <div class="bars">
            <hub-energy-strip
              .title=${t.reinjStripTitle}
              .segments=${B}
              .total=${kt}
              .formatter=${gt}
              .tooltip=${et.map((c) => `${c.label}: ${gt(c.v)} · ${c.eur.toFixed(2)} €`).join(" · ")}
              .breakdown=${Ot}
              .showBreakdown=${!0}
              .displayValue=${`${gt(kt)} · ${b.oppTotalEur.toFixed(2)} €`}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>
          </div>
        </section>

        ${this._showRaw ? v`
              <section>
                <h3>${t.rawDataTitle}</h3>
                <div class="raw">
                  <div class="raw-grid">
                    <div>
                      <b>${t.rawSectionGridHome}</b>
                      ${R(t.rawLineGridTotal, { value: N.toFixed(3) })}<br />
                      ${R(t.rawLineHouseTotal, { value: T.toFixed(3) })}
                    </div>
                    <div>
                      <b>${t.rawSectionCost}</b>
                      ${R(t.rawLineCostTotal, { value: n.toFixed(3) })}<br />
                      ${R(t.rawLineSubscription, { value: h.toFixed(3) })}
                    </div>
                    <div>
                      <b>${t.rawSectionOrigin}</b>
                      ${R(t.rawLineOriginGrid, { value: m.toFixed(3) })}<br />
                      ${R(t.rawLineOriginSolar, { value: f.toFixed(3) })}
                    </div>
                    <div>
                      <b>${t.rawSectionSavings}</b>
                      ${R(t.rawLineSavingsSolar, { value: p.toFixed(3) })}<br />
                      ${R(t.rawLineSavingsBattery, { value: u.toFixed(3) })}
                    </div>
                    <div>
                      <b>${t.rawSectionImportBySlot}</b>
                      ${A.length > 0 ? A.map((c, F) => v`${F > 0 ? v`<br />` : y}${j(c.id, $, t)}: ${c.v.toFixed(3)} kWh`) : t.emDash}
                    </div>
                    <div>
                      <b>${t.rawSectionCostBySlot}</b>
                      ${L.length > 0 ? L.map((c, F) => v`${F > 0 ? v`<br />` : y}${j(c.id, $, t)}: ${c.v.toFixed(3)} €`) : t.emDash}
                    </div>
                    <div>
                      <b>${t.rawSectionUsageDetail}</b>
                      ${g.gridDirect.label} : ${g.gridDirect.v.toFixed(3)}<br />
                      ${g.gridBatt.label} : ${g.gridBatt.v.toFixed(3)}<br />
                      ${g.solarDirect.label} : ${g.solarDirect.v.toFixed(3)}<br />
                      ${g.solarBatt.label} : ${g.solarBatt.v.toFixed(3)}<br />
                      ${g.battHome.label} : ${g.battHome.v.toFixed(3)}
                    </div>
                    <div>
                      <b>${t.rawSectionBattChargeGridSlots}</b>
                      ${this._renderSlotMapRaw(S, $, t)}
                    </div>
                    <div>
                      <b>${t.rawSectionBattChargeSolarSlots}</b>
                      ${this._renderSlotMapRaw(D, $, t)}
                    </div>
                    <div>
                      <b>${t.rawSectionReinjection}</b>
                      ${t.reinjLabelSolarSurplus}
                      ${R(t.reinjLineKwhEur, { kwh: b.solarSurplus.toFixed(3), eur: b.oppSolarEur.toFixed(3) })}<br />
                      ${t.reinjLabelBatteryFull}
                      ${R(t.reinjLineKwhEur, { kwh: b.batteryFull.toFixed(3), eur: b.oppBatteryEur.toFixed(3) })}<br />
                      ${t.reinjLabelSwitchLatency}
                      ${R(t.reinjLineKwhEur, { kwh: b.switchLatency.toFixed(3), eur: b.oppLatencyEur.toFixed(3) })}<br />
                      ${t.reinjLabelOther}
                      ${R(t.reinjLineKwhEur, { kwh: b.unattributed.toFixed(3), eur: b.oppOtherEur.toFixed(3) })}<br />
                      ${t.reinjLabelTotal}
                      ${R(t.reinjLineKwhEur, { kwh: mt.toFixed(3), eur: b.oppTotalEur.toFixed(3) })}
                    </div>
                  </div>
                </div>
              </section>
            ` : y}
      </ha-card>
    `;
  }
}
const Jr = "2026.04.06-simple";
console.log("[hub-energie-card]", Jr);
customElements.get("hub-energie-card") || customElements.define("hub-energie-card", Zr);
window.customCards ??= [];
window.customCards.push({
  type: "hub-energie-card",
  name: "Hub Énergie",
  description: "Daily energy, cost and savings. Visual editor for main options; advanced keys stay in YAML.",
  preview: !1,
  documentationURL: "https://gitlab.com/zzcyph1/home-assistant/hub-energie"
});
