const P = globalThis, O = P.ShadowRoot && (P.ShadyCSS === void 0 || P.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, N = /* @__PURE__ */ Symbol(), I = /* @__PURE__ */ new WeakMap();
let te = class {
  constructor(e, t, o) {
    if (this._$cssResult$ = !0, o !== N) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (O && e === void 0) {
      const o = t !== void 0 && t.length === 1;
      o && (e = I.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), o && I.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const ce = (i) => new te(typeof i == "string" ? i : i + "", void 0, N), Ue = (i, ...e) => {
  const t = i.length === 1 ? i[0] : e.reduce((o, r, s) => o + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + i[s + 1], i[0]);
  return new te(t, i, N);
}, ue = (i, e) => {
  if (O) i.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const o = document.createElement("style"), r = P.litNonce;
    r !== void 0 && o.setAttribute("nonce", r), o.textContent = t.cssText, i.appendChild(o);
  }
}, F = O ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const o of e.cssRules) t += o.cssText;
  return ce(t);
})(i) : i;
const { is: de, defineProperty: he, getOwnPropertyDescriptor: pe, getOwnPropertyNames: fe, getOwnPropertySymbols: ge, getPrototypeOf: _e } = Object, k = globalThis, V = k.trustedTypes, me = V ? V.emptyScript : "", ye = k.reactiveElementPolyfillSupport, A = (i, e) => i, x = { toAttribute(i, e) {
  switch (e) {
    case Boolean:
      i = i ? me : null;
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
} }, oe = (i, e) => !de(i, e), q = { attribute: !0, type: String, converter: x, reflect: !1, useDefault: !1, hasChanged: oe };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), k.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let w = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = q) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const o = /* @__PURE__ */ Symbol(), r = this.getPropertyDescriptor(e, o, t);
      r !== void 0 && he(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, t, o) {
    const { get: r, set: s } = pe(this.prototype, e) ?? { get() {
      return this[t];
    }, set(n) {
      this[t] = n;
    } };
    return { get: r, set(n) {
      const l = r?.call(this);
      s?.call(this, n), this.requestUpdate(e, l, o);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? q;
  }
  static _$Ei() {
    if (this.hasOwnProperty(A("elementProperties"))) return;
    const e = _e(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(A("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(A("properties"))) {
      const t = this.properties, o = [...fe(t), ...ge(t)];
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
      for (const r of o) t.unshift(F(r));
    } else e !== void 0 && t.push(F(e));
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
      const s = (o.converter?.toAttribute !== void 0 ? o.converter : x).toAttribute(t, o.type);
      this._$Em = e, s == null ? this.removeAttribute(r) : this.setAttribute(r, s), this._$Em = null;
    }
  }
  _$AK(e, t) {
    const o = this.constructor, r = o._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const s = o.getPropertyOptions(r), n = typeof s.converter == "function" ? { fromAttribute: s.converter } : s.converter?.fromAttribute !== void 0 ? s.converter : x;
      this._$Em = r;
      const l = n.fromAttribute(t, s.type);
      this[r] = l ?? this._$Ej?.get(r) ?? l, this._$Em = null;
    }
  }
  requestUpdate(e, t, o, r = !1, s) {
    if (e !== void 0) {
      const n = this.constructor;
      if (r === !1 && (s = this[e]), o ??= n.getPropertyOptions(e), !((o.hasChanged ?? oe)(s, t) || o.useDefault && o.reflect && s === this._$Ej?.get(e) && !this.hasAttribute(n._$Eu(e, o)))) return;
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
        const { wrapped: n } = s, l = this[r];
        n !== !0 || this._$AL.has(r) || l === void 0 || this.C(r, void 0, s, l);
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
w.elementStyles = [], w.shadowRootOptions = { mode: "open" }, w[A("elementProperties")] = /* @__PURE__ */ new Map(), w[A("finalized")] = /* @__PURE__ */ new Map(), ye?.({ ReactiveElement: w }), (k.reactiveElementVersions ??= []).push("2.1.2");
const M = globalThis, z = (i) => i, D = M.trustedTypes, Y = D ? D.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, re = "$lit$", g = `lit$${Math.random().toFixed(9).slice(2)}$`, ie = "?" + g, we = `<${ie}>`, y = document, v = () => y.createComment(""), C = (i) => i === null || typeof i != "object" && typeof i != "function", G = Array.isArray, be = (i) => G(i) || typeof i?.[Symbol.iterator] == "function", j = `[ 	
\f\r]`, $ = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, K = /-->/g, J = />/g, _ = RegExp(`>|${j}(?:([^\\s"'>=/]+)(${j}*=${j}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Z = /'/g, X = /"/g, se = /^(?:script|style|textarea|title)$/i, ne = (i) => (e, ...t) => ({ _$litType$: i, strings: e, values: t }), Ie = ne(1), Fe = ne(2), b = /* @__PURE__ */ Symbol.for("lit-noChange"), h = /* @__PURE__ */ Symbol.for("lit-nothing"), Q = /* @__PURE__ */ new WeakMap(), m = y.createTreeWalker(y, 129);
function ae(i, e) {
  if (!G(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Y !== void 0 ? Y.createHTML(e) : e;
}
const Se = (i, e) => {
  const t = i.length - 1, o = [];
  let r, s = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", n = $;
  for (let l = 0; l < t; l++) {
    const a = i[l];
    let u, d, c = -1, p = 0;
    for (; p < a.length && (n.lastIndex = p, d = n.exec(a), d !== null); ) p = n.lastIndex, n === $ ? d[1] === "!--" ? n = K : d[1] !== void 0 ? n = J : d[2] !== void 0 ? (se.test(d[2]) && (r = RegExp("</" + d[2], "g")), n = _) : d[3] !== void 0 && (n = _) : n === _ ? d[0] === ">" ? (n = r ?? $, c = -1) : d[1] === void 0 ? c = -2 : (c = n.lastIndex - d[2].length, u = d[1], n = d[3] === void 0 ? _ : d[3] === '"' ? X : Z) : n === X || n === Z ? n = _ : n === K || n === J ? n = $ : (n = _, r = void 0);
    const f = n === _ && i[l + 1].startsWith("/>") ? " " : "";
    s += n === $ ? a + we : c >= 0 ? (o.push(u), a.slice(0, c) + re + a.slice(c) + g + f) : a + g + (c === -2 ? l : f);
  }
  return [ae(i, s + (i[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), o];
};
class E {
  constructor({ strings: e, _$litType$: t }, o) {
    let r;
    this.parts = [];
    let s = 0, n = 0;
    const l = e.length - 1, a = this.parts, [u, d] = Se(e, t);
    if (this.el = E.createElement(u, o), m.currentNode = this.el.content, t === 2 || t === 3) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (r = m.nextNode()) !== null && a.length < l; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const c of r.getAttributeNames()) if (c.endsWith(re)) {
          const p = d[n++], f = r.getAttribute(c).split(g), T = /([.?@])?(.*)/.exec(p);
          a.push({ type: 1, index: s, name: T[2], strings: f, ctor: T[1] === "." ? Ae : T[1] === "?" ? ve : T[1] === "@" ? Ce : L }), r.removeAttribute(c);
        } else c.startsWith(g) && (a.push({ type: 6, index: s }), r.removeAttribute(c));
        if (se.test(r.tagName)) {
          const c = r.textContent.split(g), p = c.length - 1;
          if (p > 0) {
            r.textContent = D ? D.emptyScript : "";
            for (let f = 0; f < p; f++) r.append(c[f], v()), m.nextNode(), a.push({ type: 2, index: ++s });
            r.append(c[p], v());
          }
        }
      } else if (r.nodeType === 8) if (r.data === ie) a.push({ type: 2, index: s });
      else {
        let c = -1;
        for (; (c = r.data.indexOf(g, c + 1)) !== -1; ) a.push({ type: 7, index: s }), c += g.length - 1;
      }
      s++;
    }
  }
  static createElement(e, t) {
    const o = y.createElement("template");
    return o.innerHTML = e, o;
  }
}
function S(i, e, t = i, o) {
  if (e === b) return e;
  let r = o !== void 0 ? t._$Co?.[o] : t._$Cl;
  const s = C(e) ? void 0 : e._$litDirective$;
  return r?.constructor !== s && (r?._$AO?.(!1), s === void 0 ? r = void 0 : (r = new s(i), r._$AT(i, t, o)), o !== void 0 ? (t._$Co ??= [])[o] = r : t._$Cl = r), r !== void 0 && (e = S(i, r._$AS(i, e.values), r, o)), e;
}
class $e {
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
    let s = m.nextNode(), n = 0, l = 0, a = o[0];
    for (; a !== void 0; ) {
      if (n === a.index) {
        let u;
        a.type === 2 ? u = new B(s, s.nextSibling, this, e) : a.type === 1 ? u = new a.ctor(s, a.name, a.strings, this, e) : a.type === 6 && (u = new Ee(s, this, e)), this._$AV.push(u), a = o[++l];
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
class B {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, t, o, r) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = o, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
    e = S(this, e, t), C(e) ? e === h || e == null || e === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : e !== this._$AH && e !== b && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : be(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== h && C(this._$AH) ? this._$AA.nextSibling.data = e : this.T(y.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: t, _$litType$: o } = e, r = typeof o == "number" ? this._$AC(e) : (o.el === void 0 && (o.el = E.createElement(ae(o.h, o.h[0]), this.options)), o);
    if (this._$AH?._$AD === r) this._$AH.p(t);
    else {
      const s = new $e(r, this), n = s.u(this.options);
      s.p(t), this.T(n), this._$AH = s;
    }
  }
  _$AC(e) {
    let t = Q.get(e.strings);
    return t === void 0 && Q.set(e.strings, t = new E(e)), t;
  }
  k(e) {
    G(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let o, r = 0;
    for (const s of e) r === t.length ? t.push(o = new B(this.O(v()), this.O(v()), this, this.options)) : o = t[r], o._$AI(s), r++;
    r < t.length && (this._$AR(o && o._$AB.nextSibling, r), t.length = r);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    for (this._$AP?.(!1, !0, t); e !== this._$AB; ) {
      const o = z(e).nextSibling;
      z(e).remove(), e = o;
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
  constructor(e, t, o, r, s) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = s, o.length > 2 || o[0] !== "" || o[1] !== "" ? (this._$AH = Array(o.length - 1).fill(new String()), this.strings = o) : this._$AH = h;
  }
  _$AI(e, t = this, o, r) {
    const s = this.strings;
    let n = !1;
    if (s === void 0) e = S(this, e, t, 0), n = !C(e) || e !== this._$AH && e !== b, n && (this._$AH = e);
    else {
      const l = e;
      let a, u;
      for (e = s[0], a = 0; a < s.length - 1; a++) u = S(this, l[o + a], t, a), u === b && (u = this._$AH[a]), n ||= !C(u) || u !== this._$AH[a], u === h ? e = h : e !== h && (e += (u ?? "") + s[a + 1]), this._$AH[a] = u;
    }
    n && !r && this.j(e);
  }
  j(e) {
    e === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Ae extends L {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === h ? void 0 : e;
  }
}
class ve extends L {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== h);
  }
}
class Ce extends L {
  constructor(e, t, o, r, s) {
    super(e, t, o, r, s), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = S(this, e, t, 0) ?? h) === b) return;
    const o = this._$AH, r = e === h && o !== h || e.capture !== o.capture || e.once !== o.once || e.passive !== o.passive, s = e !== h && (o === h || r);
    r && this.element.removeEventListener(this.name, this, o), s && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Ee {
  constructor(e, t, o) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = o;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    S(this, e);
  }
}
const He = M.litHtmlPolyfillSupport;
He?.(E, B), (M.litHtmlVersions ??= []).push("3.3.2");
const Be = (i, e, t) => {
  const o = t?.renderBefore ?? e;
  let r = o._$litPart$;
  if (r === void 0) {
    const s = t?.renderBefore ?? null;
    o._$litPart$ = r = new B(e.insertBefore(v(), s), s, void 0, t ?? {});
  }
  return r._$AI(i), r;
};
const U = globalThis;
class R extends w {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Be(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return b;
  }
}
R._$litElement$ = !0, R.finalized = !0, U.litElementHydrateSupport?.({ LitElement: R });
const Te = U.litElementPolyfillSupport;
Te?.({ LitElement: R });
(U.litElementVersions ??= []).push("4.2.2");
const Ve = Object.freeze({
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
    editorSiteLabel: "Site (installation)",
    editorSiteOption: "{index} — {segment}",
    editorSiteHint: "Quelle entrée Hub Énergie utiliser pour cette carte (même « pont » que dans Paramètres). « Auto » : la seule installation détectée, ou la plus petite clé d’entité en cas d’ambiguïté. Avec plusieurs entrées, choisissez l’index affiché (0, 1, …).",
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
    flowCardEntityHint: "Résolution auto : même logique de site que la carte principale (<code>site_index</code>) via le <code>cost_detail</code> Hub Énergie → paire <code>frontend_data</code> / <code>frontend_meta</code> avec le même segment (<code>hub_energie_…</code>). Sinon, renseignez les entités ou utilisez <code>sensor.frontend_data</code> / <code>sensor.frontend_meta</code>.",
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
    flowEditorEntityHint: "Vide = détection auto via le <code>cost_detail</code> du site (même segment <code>hub_energie_…</code> que sur la carte principale), puis <code>frontend_*</code> courts si besoin.",
    flowEditorReducedMotionNote: "Les animations des câbles suivent le réglage d’accessibilité « réduire les mouvements » du système (pas une option de performance).",
    flowEditorGlassPanel: "Panneau verre (expérimental)",
    flowEditorGlassHint: "Flou d’arrière-plan et ombre portée sur le diagramme. À tester sur l’app mobile Home Assistant : certains navigateurs ne gèrent pas bien backdrop-filter.",
    flowDataAgeLabel: "Live · {age}",
    flowDataAgeUnknown: "Live · —",
    flowAgeSeconds: "{n} s",
    flowAgeMinutes: "{n} min",
    flowAgeHours: "{n} h",
    flowAgeDays: "{n} j"
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
    editorSiteLabel: "Site (config entry)",
    editorSiteOption: "{index} — {segment}",
    editorSiteHint: 'Which Hub Énergie config entry this card uses (same as the integration tile under Settings). "Auto": the only install found, or the smallest entity id if ambiguous. With several entries, pick the listed index (0, 1, …).',
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
    flowCardEntityHint: "Auto-resolve: same site logic as the main card (<code>site_index</code>) via the Hub Énergie <code>cost_detail</code> sensor → <code>frontend_data</code> + <code>frontend_meta</code> with the same <code>hub_energie_…</code> segment. Otherwise set entities in the editor, or use <code>sensor.frontend_data</code> / <code>sensor.frontend_meta</code>.",
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
    flowEditorEntityHint: "Empty = auto-detect via the site’s <code>cost_detail</code> (same <code>hub_energie_…</code> segment as the main card), then short <code>frontend_*</code> if needed.",
    flowEditorReducedMotionNote: "Cable animations follow the system “reduce motion” accessibility setting (not a performance toggle).",
    flowEditorGlassPanel: "Glass panel (experimental)",
    flowEditorGlassHint: "Backdrop blur and drop shadow on the diagram. Verify on the Home Assistant mobile app: some WebViews handle backdrop-filter poorly.",
    flowDataAgeLabel: "Live · {age}",
    flowDataAgeUnknown: "Live · —",
    flowAgeSeconds: "{n} s",
    flowAgeMinutes: "{n} min",
    flowAgeHours: "{n} h",
    flowAgeDays: "{n} d"
  }
}), W = Object.freeze([
  { id: "bleu_hc", label: "Blue HC", color: "#1e88e5" },
  { id: "bleu_hp", label: "Blue HP", color: "#1e88e5" },
  { id: "blanc_hc", label: "White HC", color: "#b0bec5" },
  { id: "blanc_hp", label: "White HP", color: "#b0bec5" },
  { id: "rouge_hc", label: "Red HC", color: "#e53935" },
  { id: "rouge_hp", label: "Red HP", color: "#e53935" },
  { id: "unknown", label: "Unknown", color: "#78909c" }
]), Pe = Object.freeze([
  ...W.map((i) => `${i.id}_eur`),
  "abonnement_eur"
]), Re = Object.freeze([
  "export_due_to_solar_surplus_kwh",
  "export_due_to_battery_full_or_absent_kwh",
  "export_due_to_switch_latency_kwh",
  "export_unattributed_kwh",
  "export_opportunity_cost_total_eur",
  "export_opportunity_cost_solar_surplus_eur",
  "export_opportunity_cost_battery_full_or_absent_eur",
  "export_opportunity_cost_switch_latency_eur",
  "export_opportunity_cost_unattributed_eur"
]);
Object.freeze([...Pe, ...Re]);
const qe = Object.freeze([
  "grid_by_slot_kwh",
  "maison_by_slot_kwh"
]), De = "sensor.hub_energie_", ke = "card_site_index", ee = "card_site_segment", Le = "hub_energie_card_payload", je = Object.freeze([
  "ecoSolar",
  "ecoBatt",
  "originGrid",
  "originSolar",
  "usageGridDirect",
  "usageGridBatt",
  "usageSolarDirect",
  "usageSolarBatt",
  "usageBattHome"
]);
function le(i = De) {
  const e = i;
  return {
    cost: `${e}cost_detail`,
    frontendData: `${e}frontend_data`,
    frontendMeta: `${e}frontend_meta`,
    ecoSolar: `${e}savings_solar_eur`,
    ecoBatt: `${e}savings_battery_eur`,
    originGrid: `${e}origin_grid_kwh`,
    originSolar: `${e}origin_solar_kwh`,
    usageGridDirect: `${e}usage_grid_direct_kwh`,
    usageGridBatt: `${e}usage_grid_batt_charge_kwh`,
    usageSolarDirect: `${e}usage_solar_direct_kwh`,
    usageSolarBatt: `${e}usage_solar_batt_charge_kwh`,
    usageBattHome: `${e}usage_batt_home_kwh`,
    lovelaceCard: `${e}lovelace_card`
  };
}
function xe(i) {
  if (!i) return [];
  const e = /* @__PURE__ */ new Map();
  for (const [t, o] of Object.entries(i)) {
    const r = o?.attributes;
    if (!r || typeof r != "object") continue;
    const s = r.card_entity_ids;
    if (s && typeof s == "object" && s.cost === t) {
      const n = H(o, t) ?? 0, l = r[ee], a = typeof l == "string" && l.trim() !== "" ? String(l).trim() : String(n);
      e.set(n, { index: n, segment: a, costEntityId: t });
      continue;
    }
    if (typeof r.eco_solar == "number" && r.grid_by_slot_kwh != null && typeof r.grid_by_slot_kwh == "object") {
      const n = H(o, t) ?? 0;
      if (e.has(n)) continue;
      const l = r[ee], a = typeof l == "string" && l.trim() !== "" ? String(l).trim() : String(n);
      e.set(n, { index: n, segment: a, costEntityId: t });
    }
  }
  return [...e.values()].sort((t, o) => t.index - o.index);
}
function Oe(i) {
  return xe(i).length;
}
function Ne(i) {
  if (typeof i != "string" || !i.startsWith("sensor.")) return null;
  const e = i.slice(7), t = /^hub_energie_(\d+)_/.exec(e);
  if (!t) return null;
  const o = parseInt(t[1], 10);
  return Number.isFinite(o) ? o : null;
}
function H(i, e) {
  const t = i?.attributes;
  if (t && typeof t == "object") {
    const o = t[ke];
    if (typeof o == "number" && Number.isFinite(o)) return Math.trunc(o);
  }
  return Ne(e);
}
function ze(i, e) {
  const o = le().cost;
  if (!i) return o;
  const r = e === "" || e === void 0 || e === null ? null : Math.max(0, Math.trunc(Number(e))), s = [];
  for (const [a, u] of Object.entries(i)) {
    const d = u?.attributes;
    if (!d || typeof d != "object") continue;
    const c = d.card_entity_ids;
    if (!c || typeof c != "object" || c.cost !== a) continue;
    const p = H(u, a) ?? 0;
    r !== null && p !== r || s.push(a);
  }
  if (s.length === 1) return s[0];
  if (s.length > 1) return [...s].sort()[0];
  if (r === null && i[o]?.attributes) return o;
  const n = [];
  for (const [a, u] of Object.entries(i)) {
    const d = u?.attributes;
    if (!(!d || typeof d != "object") && typeof d.eco_solar == "number" && d.grid_by_slot_kwh != null && typeof d.grid_by_slot_kwh == "object") {
      const c = H(u, a);
      if (r !== null && c !== null && c !== r || r !== null && c === null) continue;
      n.push(a);
    }
  }
  if (n.length >= 1) return [...n].sort()[0];
  const l = Oe(i);
  return r === null && l <= 1 && i[o], o;
}
function Ye(i, e) {
  const o = le().lovelaceCard;
  if (!i) return o;
  const r = e === "" || e === void 0 || e === null ? null : Math.max(0, Math.trunc(Number(e))), s = [];
  for (const [n, l] of Object.entries(i)) {
    const a = l?.attributes;
    if (!a || typeof a != "object" || a[Le] !== !0) continue;
    const u = H(l, n) ?? 0;
    r !== null && u !== r || s.push(n);
  }
  return s.length === 1 ? s[0] : s.length > 1 ? [...s].sort()[0] : o;
}
function Ke(i, e, t) {
  const o = { ...e, cost: t }, r = i?.card_entity_ids;
  if (!r || typeof r != "object") return o;
  for (const s of je) {
    const n = r[s];
    typeof n == "string" && n.includes(".") && (o[s] = n);
  }
  return typeof r.lovelaceCard == "string" && r.lovelaceCard.includes(".") && (o.lovelaceCard = r.lovelaceCard), o;
}
function Je(i, e) {
  return { ...e && typeof e == "object" ? e : {}, ...i && typeof i == "object" ? i : {} };
}
function Ze(i, e) {
  if (!i || typeof i != "object") return 0;
  const t = i[e], o = typeof t == "number" ? t : parseFloat(t);
  return Number.isFinite(o) ? o : 0;
}
function Xe(i, e) {
  return !!i?.[e];
}
function Qe(i) {
  return i === "hphc" ? "HP/HC" : i === "base" ? "BASE" : "TEMPO";
}
function Me(i, e, t) {
  const o = t?.emDash ?? "—";
  return i ? e === "base" ? t?.slotBase ?? "Base" : e === "hphc" ? i.endsWith("_hc") ? t?.slotHc ?? "HC" : t?.slotHp ?? "HP" : {
    bleu_hc: t?.slotBleuHc,
    bleu_hp: t?.slotBleuHp,
    blanc_hc: t?.slotBlancHc,
    blanc_hp: t?.slotBlancHp,
    rouge_hc: t?.slotRougeHc,
    rouge_hp: t?.slotRougeHp,
    unknown: t?.slotUnknown
  }[i] ?? i : o;
}
function et(i, e) {
  const t = String(i ?? "").toLowerCase();
  return t.includes("blue") || t.includes("bleu") ? e?.tempoDayBlue ?? "Blue" : t.includes("white") || t.includes("blanc") ? e?.tempoDayWhite ?? "White" : t.includes("red") || t.includes("rouge") ? e?.tempoDayRed ?? "Red" : t === "n/a" ? e?.dayColorNA ?? "N/A" : t || (e?.emDash ?? "—");
}
function tt(i) {
  const e = String(i ?? "").toLowerCase();
  return e.includes("blue") || e.includes("bleu") ? "color-blue" : e.includes("white") || e.includes("blanc") ? "color-white" : e.includes("red") || e.includes("rouge") ? "color-red" : "color-na";
}
function ot(i, e, t) {
  return !e || typeof e != "object" ? [] : W.map((o) => {
    const r = e[o.id], s = typeof r == "number" ? r : parseFloat(r);
    return !Number.isFinite(s) || s <= 1e-4 ? null : {
      label: Me(o.id, i, t),
      v: s,
      color: o.color,
      isHc: o.id.endsWith("_hc")
    };
  }).filter(Boolean);
}
function rt(i) {
  return !i || typeof i != "object" ? "" : W.map((e) => {
    const t = i[e.id], o = typeof t == "number" ? t : parseFloat(t);
    return `${e.id}:${Number.isFinite(o) ? o : 0}`;
  }).join(",");
}
export {
  h as A,
  Pe as C,
  Ve as I,
  W as S,
  Ue as a,
  Ie as b,
  Re as c,
  qe as d,
  Xe as e,
  ze as f,
  Ke as g,
  xe as h,
  R as i,
  Ye as j,
  Le as k,
  rt as l,
  Je as m,
  ot as n,
  tt as o,
  et as p,
  le as q,
  Ze as r,
  Me as s,
  Qe as t,
  Fe as w
};
