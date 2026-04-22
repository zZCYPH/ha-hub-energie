const T = globalThis, N = T.ShadowRoot && (T.ShadyCSS === void 0 || T.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, O = /* @__PURE__ */ Symbol(), G = /* @__PURE__ */ new WeakMap();
let Q = class {
  constructor(e, t, o) {
    if (this._$cssResult$ = !0, o !== O) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (N && e === void 0) {
      const o = t !== void 0 && t.length === 1;
      o && (e = G.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), o && G.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const se = (i) => new Q(typeof i == "string" ? i : i + "", void 0, O), Be = (i, ...e) => {
  const t = i.length === 1 ? i[0] : e.reduce((o, r, s) => o + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + i[s + 1], i[0]);
  return new Q(t, i, O);
}, ae = (i, e) => {
  if (N) i.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const o = document.createElement("style"), r = T.litNonce;
    r !== void 0 && o.setAttribute("nonce", r), o.textContent = t.cssText, i.appendChild(o);
  }
}, I = N ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const o of e.cssRules) t += o.cssText;
  return se(t);
})(i) : i;
const { is: ne, defineProperty: le, getOwnPropertyDescriptor: de, getOwnPropertyNames: he, getOwnPropertySymbols: ce, getPrototypeOf: ue } = Object, L = globalThis, W = L.trustedTypes, pe = W ? W.emptyScript : "", ge = L.reactiveElementPolyfillSupport, b = (i, e) => i, x = { toAttribute(i, e) {
  switch (e) {
    case Boolean:
      i = i ? pe : null;
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
} }, X = (i, e) => !ne(i, e), V = { attribute: !0, type: String, converter: x, reflect: !1, useDefault: !1, hasChanged: X };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), L.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let S = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = V) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const o = /* @__PURE__ */ Symbol(), r = this.getPropertyDescriptor(e, o, t);
      r !== void 0 && le(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, t, o) {
    const { get: r, set: s } = de(this.prototype, e) ?? { get() {
      return this[t];
    }, set(a) {
      this[t] = a;
    } };
    return { get: r, set(a) {
      const d = r?.call(this);
      s?.call(this, a), this.requestUpdate(e, d, o);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? V;
  }
  static _$Ei() {
    if (this.hasOwnProperty(b("elementProperties"))) return;
    const e = ue(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(b("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(b("properties"))) {
      const t = this.properties, o = [...he(t), ...ce(t)];
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
      for (const r of o) t.unshift(I(r));
    } else e !== void 0 && t.push(I(e));
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
    return ae(e, this.constructor.elementStyles), e;
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
      const s = (o.converter?.toAttribute !== void 0 ? o.converter : x).toAttribute(t, o.type);
      this._$Em = e, s == null ? this.removeAttribute(r) : this.setAttribute(r, s), this._$Em = null;
    }
  }
  _$AK(e, t) {
    const o = this.constructor, r = o._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const s = o.getPropertyOptions(r), a = typeof s.converter == "function" ? { fromAttribute: s.converter } : s.converter?.fromAttribute !== void 0 ? s.converter : x;
      this._$Em = r;
      const d = a.fromAttribute(t, s.type);
      this[r] = d ?? this._$Ej?.get(r) ?? d, this._$Em = null;
    }
  }
  requestUpdate(e, t, o, r = !1, s) {
    if (e !== void 0) {
      const a = this.constructor;
      if (r === !1 && (s = this[e]), o ??= a.getPropertyOptions(e), !((o.hasChanged ?? X)(s, t) || o.useDefault && o.reflect && s === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, o)))) return;
      this.C(e, t, o);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: o, reflect: r, wrapped: s }, a) {
    o && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), s !== !0 || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || o || (t = void 0), this._$AL.set(e, t)), r === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
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
        const { wrapped: a } = s, d = this[r];
        a !== !0 || this._$AL.has(r) || d === void 0 || this.C(r, void 0, s, d);
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
S.elementStyles = [], S.shadowRootOptions = { mode: "open" }, S[b("elementProperties")] = /* @__PURE__ */ new Map(), S[b("finalized")] = /* @__PURE__ */ new Map(), ge?.({ ReactiveElement: S }), (L.reactiveElementVersions ??= []).push("2.1.2");
const j = globalThis, F = (i) => i, D = j.trustedTypes, q = D ? D.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, ee = "$lit$", f = `lit$${Math.random().toFixed(9).slice(2)}$`, te = "?" + f, fe = `<${te}>`, m = document, v = () => m.createComment(""), E = (i) => i === null || typeof i != "object" && typeof i != "function", M = Array.isArray, ye = (i) => M(i) || typeof i?.[Symbol.iterator] == "function", k = `[ 	
\f\r]`, A = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, z = /-->/g, Y = />/g, y = RegExp(`>|${k}(?:([^\\s"'>=/]+)(${k}*=${k}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), J = /'/g, K = /"/g, oe = /^(?:script|style|textarea|title)$/i, re = (i) => (e, ...t) => ({ _$litType$: i, strings: e, values: t }), Te = re(1), Pe = re(2), $ = /* @__PURE__ */ Symbol.for("lit-noChange"), c = /* @__PURE__ */ Symbol.for("lit-nothing"), Z = /* @__PURE__ */ new WeakMap(), w = m.createTreeWalker(m, 129);
function ie(i, e) {
  if (!M(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return q !== void 0 ? q.createHTML(e) : e;
}
const we = (i, e) => {
  const t = i.length - 1, o = [];
  let r, s = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = A;
  for (let d = 0; d < t; d++) {
    const n = i[d];
    let h, u, l = -1, p = 0;
    for (; p < n.length && (a.lastIndex = p, u = a.exec(n), u !== null); ) p = a.lastIndex, a === A ? u[1] === "!--" ? a = z : u[1] !== void 0 ? a = Y : u[2] !== void 0 ? (oe.test(u[2]) && (r = RegExp("</" + u[2], "g")), a = y) : u[3] !== void 0 && (a = y) : a === y ? u[0] === ">" ? (a = r ?? A, l = -1) : u[1] === void 0 ? l = -2 : (l = a.lastIndex - u[2].length, h = u[1], a = u[3] === void 0 ? y : u[3] === '"' ? K : J) : a === K || a === J ? a = y : a === z || a === Y ? a = A : (a = y, r = void 0);
    const g = a === y && i[d + 1].startsWith("/>") ? " " : "";
    s += a === A ? n + fe : l >= 0 ? (o.push(h), n.slice(0, l) + ee + n.slice(l) + f + g) : n + f + (l === -2 ? d : g);
  }
  return [ie(i, s + (i[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), o];
};
class C {
  constructor({ strings: e, _$litType$: t }, o) {
    let r;
    this.parts = [];
    let s = 0, a = 0;
    const d = e.length - 1, n = this.parts, [h, u] = we(e, t);
    if (this.el = C.createElement(h, o), w.currentNode = this.el.content, t === 2 || t === 3) {
      const l = this.el.content.firstChild;
      l.replaceWith(...l.childNodes);
    }
    for (; (r = w.nextNode()) !== null && n.length < d; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const l of r.getAttributeNames()) if (l.endsWith(ee)) {
          const p = u[a++], g = r.getAttribute(l).split(f), H = /([.?@])?(.*)/.exec(p);
          n.push({ type: 1, index: s, name: H[2], strings: g, ctor: H[1] === "." ? Se : H[1] === "?" ? $e : H[1] === "@" ? _e : R }), r.removeAttribute(l);
        } else l.startsWith(f) && (n.push({ type: 6, index: s }), r.removeAttribute(l));
        if (oe.test(r.tagName)) {
          const l = r.textContent.split(f), p = l.length - 1;
          if (p > 0) {
            r.textContent = D ? D.emptyScript : "";
            for (let g = 0; g < p; g++) r.append(l[g], v()), w.nextNode(), n.push({ type: 2, index: ++s });
            r.append(l[p], v());
          }
        }
      } else if (r.nodeType === 8) if (r.data === te) n.push({ type: 2, index: s });
      else {
        let l = -1;
        for (; (l = r.data.indexOf(f, l + 1)) !== -1; ) n.push({ type: 7, index: s }), l += f.length - 1;
      }
      s++;
    }
  }
  static createElement(e, t) {
    const o = m.createElement("template");
    return o.innerHTML = e, o;
  }
}
function _(i, e, t = i, o) {
  if (e === $) return e;
  let r = o !== void 0 ? t._$Co?.[o] : t._$Cl;
  const s = E(e) ? void 0 : e._$litDirective$;
  return r?.constructor !== s && (r?._$AO?.(!1), s === void 0 ? r = void 0 : (r = new s(i), r._$AT(i, t, o)), o !== void 0 ? (t._$Co ??= [])[o] = r : t._$Cl = r), r !== void 0 && (e = _(i, r._$AS(i, e.values), r, o)), e;
}
class me {
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
    const { el: { content: t }, parts: o } = this._$AD, r = (e?.creationScope ?? m).importNode(t, !0);
    w.currentNode = r;
    let s = w.nextNode(), a = 0, d = 0, n = o[0];
    for (; n !== void 0; ) {
      if (a === n.index) {
        let h;
        n.type === 2 ? h = new B(s, s.nextSibling, this, e) : n.type === 1 ? h = new n.ctor(s, n.name, n.strings, this, e) : n.type === 6 && (h = new Ae(s, this, e)), this._$AV.push(h), n = o[++d];
      }
      a !== n?.index && (s = w.nextNode(), a++);
    }
    return w.currentNode = m, r;
  }
  p(e) {
    let t = 0;
    for (const o of this._$AV) o !== void 0 && (o.strings !== void 0 ? (o._$AI(e, o, t), t += o.strings.length - 2) : o._$AI(e[t])), t++;
  }
}
class B {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, t, o, r) {
    this.type = 2, this._$AH = c, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = o, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
    e = _(this, e, t), E(e) ? e === c || e == null || e === "" ? (this._$AH !== c && this._$AR(), this._$AH = c) : e !== this._$AH && e !== $ && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : ye(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== c && E(this._$AH) ? this._$AA.nextSibling.data = e : this.T(m.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: t, _$litType$: o } = e, r = typeof o == "number" ? this._$AC(e) : (o.el === void 0 && (o.el = C.createElement(ie(o.h, o.h[0]), this.options)), o);
    if (this._$AH?._$AD === r) this._$AH.p(t);
    else {
      const s = new me(r, this), a = s.u(this.options);
      s.p(t), this.T(a), this._$AH = s;
    }
  }
  _$AC(e) {
    let t = Z.get(e.strings);
    return t === void 0 && Z.set(e.strings, t = new C(e)), t;
  }
  k(e) {
    M(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let o, r = 0;
    for (const s of e) r === t.length ? t.push(o = new B(this.O(v()), this.O(v()), this, this.options)) : o = t[r], o._$AI(s), r++;
    r < t.length && (this._$AR(o && o._$AB.nextSibling, r), t.length = r);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    for (this._$AP?.(!1, !0, t); e !== this._$AB; ) {
      const o = F(e).nextSibling;
      F(e).remove(), e = o;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class R {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, o, r, s) {
    this.type = 1, this._$AH = c, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = s, o.length > 2 || o[0] !== "" || o[1] !== "" ? (this._$AH = Array(o.length - 1).fill(new String()), this.strings = o) : this._$AH = c;
  }
  _$AI(e, t = this, o, r) {
    const s = this.strings;
    let a = !1;
    if (s === void 0) e = _(this, e, t, 0), a = !E(e) || e !== this._$AH && e !== $, a && (this._$AH = e);
    else {
      const d = e;
      let n, h;
      for (e = s[0], n = 0; n < s.length - 1; n++) h = _(this, d[o + n], t, n), h === $ && (h = this._$AH[n]), a ||= !E(h) || h !== this._$AH[n], h === c ? e = c : e !== c && (e += (h ?? "") + s[n + 1]), this._$AH[n] = h;
    }
    a && !r && this.j(e);
  }
  j(e) {
    e === c ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Se extends R {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === c ? void 0 : e;
  }
}
class $e extends R {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== c);
  }
}
class _e extends R {
  constructor(e, t, o, r, s) {
    super(e, t, o, r, s), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = _(this, e, t, 0) ?? c) === $) return;
    const o = this._$AH, r = e === c && o !== c || e.capture !== o.capture || e.once !== o.once || e.passive !== o.passive, s = e !== c && (o === c || r);
    r && this.element.removeEventListener(this.name, this, o), s && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Ae {
  constructor(e, t, o) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = o;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    _(this, e);
  }
}
const be = j.litHtmlPolyfillSupport;
be?.(C, B), (j.litHtmlVersions ??= []).push("3.3.2");
const ve = (i, e, t) => {
  const o = t?.renderBefore ?? e;
  let r = o._$litPart$;
  if (r === void 0) {
    const s = t?.renderBefore ?? null;
    o._$litPart$ = r = new B(e.insertBefore(v(), s), s, void 0, t ?? {});
  }
  return r._$AI(i), r;
};
const U = globalThis;
class P extends S {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ve(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return $;
  }
}
P._$litElement$ = !0, P.finalized = !0, U.litElementHydrateSupport?.({ LitElement: P });
const Ee = U.litElementPolyfillSupport;
Ee?.({ LitElement: P });
(U.litElementVersions ??= []).push("4.2.2");
const De = Object.freeze({
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
    siteLabel: "Site",
    siteAuto: "Auto",
    editorSiteLabel: "Site",
    editorSiteHint: "Plusieurs intégrations Hub Énergie : choisissez l’index (0, 1, …). « Auto » si une seule installation.",
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
    editorShowRawControl: "Bouton Détails (données brutes)",
    flowCardTitle: "Flux de puissance",
    flowCardWaiting: "En attente des capteurs Frontend data / Frontend meta…",
    flowCardEntityHint: "IDs attendus : <code>sensor.hub_energie_frontend_data</code> + <code>…_meta</code>, ou les IDs courts <code>sensor.frontend_data</code> / <code>sensor.frontend_meta</code>. Sinon, forcez-les dans l’éditeur de carte.",
    flowNodeGrid: "Réseau",
    flowNodeSolar: "Solaire",
    flowNodeHome: "Maison",
    flowNodeBattery: "Batterie",
    flowBatteryIdle: "Au repos",
    flowBatteryUnknown: "Donnée indisponible",
    flowBatteryCharging: "Charge",
    flowBatteryDischarging: "Décharge",
    flowDebugBadge: "DEBUG",
    flowDebugConservationWarn: "Bilan maison incohérent : flux entrants {derived}, capteur maison {reported}, écart {delta}.",
    flowMetaSlot: "Créneau",
    flowMetaToday: "Aujourd'hui",
    flowMetaTomorrow: "Demain",
    flowMetaInputStatus: "Entrées",
    flowEditorTitle: "Titre (optionnel)",
    flowEditorLayout: "Disposition",
    flowEditorLayoutAuto: "Auto",
    flowEditorLayoutFull: "Complète",
    flowEditorLayoutCompact: "Compacte",
    flowEditorLayoutHint: "Auto bascule selon la largeur de la carte.",
    flowEditorDebug: "Mode debug",
    flowEditorDebugHint: "Affiche tous les flux, les valeurs faibles et le contrôle de conservation. Réservé au card editor.",
    flowEditorDataEntity: "Capteur live (frontend_data)",
    flowEditorMetaEntity: "Capteur meta (frontend_meta)",
    flowEditorEntityHint: "Vide = détection auto (<code>hub_energie_frontend_*</code> puis <code>frontend_*</code>)."
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
    siteLabel: "Site",
    siteAuto: "Auto",
    editorSiteLabel: "Site",
    editorSiteHint: 'Multiple Hub Énergie installs: pick the index (0, 1, …). "Auto" when only one site is present.',
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
    editorShowRawControl: "Details button (raw data)",
    flowCardTitle: "Power flow",
    flowCardWaiting: "Waiting for Frontend data / Frontend meta sensors…",
    flowCardEntityHint: "Expected IDs: <code>sensor.hub_energie_frontend_data</code> + <code>…_meta</code>, or short <code>sensor.frontend_data</code> / <code>sensor.frontend_meta</code>. Otherwise set them in the card editor.",
    flowNodeGrid: "Grid",
    flowNodeSolar: "Solar",
    flowNodeHome: "Home",
    flowNodeBattery: "Battery",
    flowBatteryIdle: "Idle",
    flowBatteryUnknown: "Data unavailable",
    flowBatteryCharging: "Charging",
    flowBatteryDischarging: "Discharging",
    flowDebugBadge: "DEBUG",
    flowDebugConservationWarn: "Home balance mismatch: incoming flows {derived}, home sensor {reported}, delta {delta}.",
    flowMetaSlot: "Slot",
    flowMetaToday: "Today",
    flowMetaTomorrow: "Tomorrow",
    flowMetaInputStatus: "Inputs",
    flowEditorTitle: "Title (optional)",
    flowEditorLayout: "Layout",
    flowEditorLayoutAuto: "Auto",
    flowEditorLayoutFull: "Full",
    flowEditorLayoutCompact: "Compact",
    flowEditorLayoutHint: "Auto switches according to the rendered card width.",
    flowEditorDebug: "Debug mode",
    flowEditorDebugHint: "Shows all flows, weak values and the conservation check. Exposed only from the card editor.",
    flowEditorDataEntity: "Live sensor (frontend_data)",
    flowEditorMetaEntity: "Meta sensor (frontend_meta)",
    flowEditorEntityHint: "Empty = auto-detect (<code>hub_energie_frontend_*</code> then <code>frontend_*</code>)."
  }
});
export {
  c as A,
  De as I,
  Be as a,
  Te as b,
  P as i,
  Pe as w
};
