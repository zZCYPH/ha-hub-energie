const ut = globalThis, Nt = ut.ShadowRoot && (ut.ShadyCSS === void 0 || ut.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Mt = /* @__PURE__ */ Symbol(), Ot = /* @__PURE__ */ new WeakMap();
let ie = class {
  constructor(t, e, r) {
    if (this._$cssResult$ = !0, r !== Mt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (Nt && t === void 0) {
      const r = e !== void 0 && e.length === 1;
      r && (t = Ot.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), r && Ot.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Ee = (o) => new ie(typeof o == "string" ? o : o + "", void 0, Mt), nt = (o, ...t) => {
  const e = o.length === 1 ? o[0] : t.reduce((r, i, a) => r + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + o[a + 1], o[0]);
  return new ie(e, o, Mt);
}, Be = (o, t) => {
  if (Nt) o.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const r = document.createElement("style"), i = ut.litNonce;
    i !== void 0 && r.setAttribute("nonce", i), r.textContent = e.cssText, o.appendChild(r);
  }
}, Gt = Nt ? (o) => o : (o) => o instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const r of t.cssRules) e += r.cssText;
  return Ee(e);
})(o) : o;
const { is: Ce, defineProperty: Te, getOwnPropertyDescriptor: Fe, getOwnPropertyNames: Ne, getOwnPropertySymbols: Me, getPrototypeOf: De } = Object, bt = globalThis, Wt = bt.trustedTypes, Pe = Wt ? Wt.emptyScript : "", He = bt.reactiveElementPolyfillSupport, et = (o, t) => o, Ct = { toAttribute(o, t) {
  switch (t) {
    case Boolean:
      o = o ? Pe : null;
      break;
    case Object:
    case Array:
      o = o == null ? o : JSON.stringify(o);
  }
  return o;
}, fromAttribute(o, t) {
  let e = o;
  switch (t) {
    case Boolean:
      e = o !== null;
      break;
    case Number:
      e = o === null ? null : Number(o);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(o);
      } catch {
        e = null;
      }
  }
  return e;
} }, oe = (o, t) => !Ce(o, t), jt = { attribute: !0, type: String, converter: Ct, reflect: !1, useDefault: !1, hasChanged: oe };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), bt.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let Z = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = jt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const r = /* @__PURE__ */ Symbol(), i = this.getPropertyDescriptor(t, r, e);
      i !== void 0 && Te(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, r) {
    const { get: i, set: a } = Fe(this.prototype, t) ?? { get() {
      return this[e];
    }, set(n) {
      this[e] = n;
    } };
    return { get: i, set(n) {
      const c = i?.call(this);
      a?.call(this, n), this.requestUpdate(t, c, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? jt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(et("elementProperties"))) return;
    const t = De(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(et("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(et("properties"))) {
      const e = this.properties, r = [...Ne(e), ...Me(e)];
      for (const i of r) this.createProperty(i, e[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [r, i] of e) this.elementProperties.set(r, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, r] of this.elementProperties) {
      const i = this._$Eu(e, r);
      i !== void 0 && this._$Eh.set(i, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const r = new Set(t.flat(1 / 0).reverse());
      for (const i of r) e.unshift(Gt(i));
    } else t !== void 0 && e.push(Gt(t));
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
    return Be(t, this.constructor.elementStyles), t;
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
    const r = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, r);
    if (i !== void 0 && r.reflect === !0) {
      const a = (r.converter?.toAttribute !== void 0 ? r.converter : Ct).toAttribute(e, r.type);
      this._$Em = t, a == null ? this.removeAttribute(i) : this.setAttribute(i, a), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const r = this.constructor, i = r._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const a = r.getPropertyOptions(i), n = typeof a.converter == "function" ? { fromAttribute: a.converter } : a.converter?.fromAttribute !== void 0 ? a.converter : Ct;
      this._$Em = i;
      const c = n.fromAttribute(e, a.type);
      this[i] = c ?? this._$Ej?.get(i) ?? c, this._$Em = null;
    }
  }
  requestUpdate(t, e, r, i = !1, a) {
    if (t !== void 0) {
      const n = this.constructor;
      if (i === !1 && (a = this[t]), r ??= n.getPropertyOptions(t), !((r.hasChanged ?? oe)(a, e) || r.useDefault && r.reflect && a === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, r)))) return;
      this.C(t, e, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: r, reflect: i, wrapped: a }, n) {
    r && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, n ?? e ?? this[t]), a !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || r || (e = void 0), this._$AL.set(t, e)), i === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
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
        for (const [i, a] of this._$Ep) this[i] = a;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [i, a] of r) {
        const { wrapped: n } = a, c = this[i];
        n !== !0 || this._$AL.has(i) || c === void 0 || this.C(i, void 0, a, c);
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
Z.elementStyles = [], Z.shadowRootOptions = { mode: "open" }, Z[et("elementProperties")] = /* @__PURE__ */ new Map(), Z[et("finalized")] = /* @__PURE__ */ new Map(), He?.({ ReactiveElement: Z }), (bt.reactiveElementVersions ??= []).push("2.1.2");
const Dt = globalThis, zt = (o) => o, gt = Dt.trustedTypes, Ut = gt ? gt.createPolicy("lit-html", { createHTML: (o) => o }) : void 0, ae = "$lit$", z = `lit$${Math.random().toFixed(9).slice(2)}$`, se = "?" + z, Le = `<${se}>`, V = document, ot = () => V.createComment(""), at = (o) => o === null || typeof o != "object" && typeof o != "function", Pt = Array.isArray, Re = (o) => Pt(o) || typeof o?.[Symbol.iterator] == "function", Et = `[ 	
\f\r]`, tt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, It = /-->/g, Vt = />/g, U = RegExp(`>|${Et}(?:([^\\s"'>=/]+)(${Et}*=${Et}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Kt = /'/g, qt = /"/g, ne = /^(?:script|style|textarea|title)$/i, Oe = (o) => (t, ...e) => ({ _$litType$: o, strings: t, values: e }), _ = Oe(1), Y = /* @__PURE__ */ Symbol.for("lit-noChange"), f = /* @__PURE__ */ Symbol.for("lit-nothing"), Zt = /* @__PURE__ */ new WeakMap(), I = V.createTreeWalker(V, 129);
function le(o, t) {
  if (!Pt(o) || !o.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ut !== void 0 ? Ut.createHTML(t) : t;
}
const Ge = (o, t) => {
  const e = o.length - 1, r = [];
  let i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = tt;
  for (let c = 0; c < e; c++) {
    const d = o[c];
    let l, p, h = -1, $ = 0;
    for (; $ < d.length && (n.lastIndex = $, p = n.exec(d), p !== null); ) $ = n.lastIndex, n === tt ? p[1] === "!--" ? n = It : p[1] !== void 0 ? n = Vt : p[2] !== void 0 ? (ne.test(p[2]) && (i = RegExp("</" + p[2], "g")), n = U) : p[3] !== void 0 && (n = U) : n === U ? p[0] === ">" ? (n = i ?? tt, h = -1) : p[1] === void 0 ? h = -2 : (h = n.lastIndex - p[2].length, l = p[1], n = p[3] === void 0 ? U : p[3] === '"' ? qt : Kt) : n === qt || n === Kt ? n = U : n === It || n === Vt ? n = tt : (n = U, i = void 0);
    const g = n === U && o[c + 1].startsWith("/>") ? " " : "";
    a += n === tt ? d + Le : h >= 0 ? (r.push(l), d.slice(0, h) + ae + d.slice(h) + z + g) : d + z + (h === -2 ? c : g);
  }
  return [le(o, a + (o[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
};
class st {
  constructor({ strings: t, _$litType$: e }, r) {
    let i;
    this.parts = [];
    let a = 0, n = 0;
    const c = t.length - 1, d = this.parts, [l, p] = Ge(t, e);
    if (this.el = st.createElement(l, r), I.currentNode = this.el.content, e === 2 || e === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (i = I.nextNode()) !== null && d.length < c; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const h of i.getAttributeNames()) if (h.endsWith(ae)) {
          const $ = p[n++], g = i.getAttribute(h).split(z), x = /([.?@])?(.*)/.exec($);
          d.push({ type: 1, index: a, name: x[2], strings: g, ctor: x[1] === "." ? je : x[1] === "?" ? ze : x[1] === "@" ? Ue : mt }), i.removeAttribute(h);
        } else h.startsWith(z) && (d.push({ type: 6, index: a }), i.removeAttribute(h));
        if (ne.test(i.tagName)) {
          const h = i.textContent.split(z), $ = h.length - 1;
          if ($ > 0) {
            i.textContent = gt ? gt.emptyScript : "";
            for (let g = 0; g < $; g++) i.append(h[g], ot()), I.nextNode(), d.push({ type: 2, index: ++a });
            i.append(h[$], ot());
          }
        }
      } else if (i.nodeType === 8) if (i.data === se) d.push({ type: 2, index: a });
      else {
        let h = -1;
        for (; (h = i.data.indexOf(z, h + 1)) !== -1; ) d.push({ type: 7, index: a }), h += z.length - 1;
      }
      a++;
    }
  }
  static createElement(t, e) {
    const r = V.createElement("template");
    return r.innerHTML = t, r;
  }
}
function X(o, t, e = o, r) {
  if (t === Y) return t;
  let i = r !== void 0 ? e._$Co?.[r] : e._$Cl;
  const a = at(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(o), i._$AT(o, e, r)), r !== void 0 ? (e._$Co ??= [])[r] = i : e._$Cl = i), i !== void 0 && (t = X(o, i._$AS(o, t.values), i, r)), t;
}
class We {
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
    const { el: { content: e }, parts: r } = this._$AD, i = (t?.creationScope ?? V).importNode(e, !0);
    I.currentNode = i;
    let a = I.nextNode(), n = 0, c = 0, d = r[0];
    for (; d !== void 0; ) {
      if (n === d.index) {
        let l;
        d.type === 2 ? l = new lt(a, a.nextSibling, this, t) : d.type === 1 ? l = new d.ctor(a, d.name, d.strings, this, t) : d.type === 6 && (l = new Ie(a, this, t)), this._$AV.push(l), d = r[++c];
      }
      n !== d?.index && (a = I.nextNode(), n++);
    }
    return I.currentNode = V, i;
  }
  p(t) {
    let e = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(t, r, e), e += r.strings.length - 2) : r._$AI(t[e])), e++;
  }
}
class lt {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, r, i) {
    this.type = 2, this._$AH = f, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = r, this.options = i, this._$Cv = i?.isConnected ?? !0;
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
    t = X(this, t, e), at(t) ? t === f || t == null || t === "" ? (this._$AH !== f && this._$AR(), this._$AH = f) : t !== this._$AH && t !== Y && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Re(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== f && at(this._$AH) ? this._$AA.nextSibling.data = t : this.T(V.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: r } = t, i = typeof r == "number" ? this._$AC(t) : (r.el === void 0 && (r.el = st.createElement(le(r.h, r.h[0]), this.options)), r);
    if (this._$AH?._$AD === i) this._$AH.p(e);
    else {
      const a = new We(i, this), n = a.u(this.options);
      a.p(e), this.T(n), this._$AH = a;
    }
  }
  _$AC(t) {
    let e = Zt.get(t.strings);
    return e === void 0 && Zt.set(t.strings, e = new st(t)), e;
  }
  k(t) {
    Pt(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let r, i = 0;
    for (const a of t) i === e.length ? e.push(r = new lt(this.O(ot()), this.O(ot()), this, this.options)) : r = e[i], r._$AI(a), i++;
    i < e.length && (this._$AR(r && r._$AB.nextSibling, i), e.length = i);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const r = zt(t).nextSibling;
      zt(t).remove(), t = r;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class mt {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, r, i, a) {
    this.type = 1, this._$AH = f, this._$AN = void 0, this.element = t, this.name = e, this._$AM = i, this.options = a, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = f;
  }
  _$AI(t, e = this, r, i) {
    const a = this.strings;
    let n = !1;
    if (a === void 0) t = X(this, t, e, 0), n = !at(t) || t !== this._$AH && t !== Y, n && (this._$AH = t);
    else {
      const c = t;
      let d, l;
      for (t = a[0], d = 0; d < a.length - 1; d++) l = X(this, c[r + d], e, d), l === Y && (l = this._$AH[d]), n ||= !at(l) || l !== this._$AH[d], l === f ? t = f : t !== f && (t += (l ?? "") + a[d + 1]), this._$AH[d] = l;
    }
    n && !i && this.j(t);
  }
  j(t) {
    t === f ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class je extends mt {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === f ? void 0 : t;
  }
}
class ze extends mt {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== f);
  }
}
class Ue extends mt {
  constructor(t, e, r, i, a) {
    super(t, e, r, i, a), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = X(this, t, e, 0) ?? f) === Y) return;
    const r = this._$AH, i = t === f && r !== f || t.capture !== r.capture || t.once !== r.once || t.passive !== r.passive, a = t !== f && (r === f || i);
    i && this.element.removeEventListener(this.name, this, r), a && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Ie {
  constructor(t, e, r) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    X(this, t);
  }
}
const Ve = Dt.litHtmlPolyfillSupport;
Ve?.(st, lt), (Dt.litHtmlVersions ??= []).push("3.3.2");
const Ke = (o, t, e) => {
  const r = e?.renderBefore ?? t;
  let i = r._$litPart$;
  if (i === void 0) {
    const a = e?.renderBefore ?? null;
    r._$litPart$ = i = new lt(t.insertBefore(ot(), a), a, void 0, e ?? {});
  }
  return i._$AI(o), i;
};
const Ht = globalThis;
class W extends Z {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Ke(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return Y;
  }
}
W._$litElement$ = !0, W.finalized = !0, Ht.litElementHydrateSupport?.({ LitElement: W });
const qe = Ht.litElementPolyfillSupport;
qe?.({ LitElement: W });
(Ht.litElementVersions ??= []).push("4.2.2");
const Jt = Object.freeze({
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
    powerHistoryLastHours: "Dernières {hours} heures",
    battFullIn: "Plein dans :",
    battEmptyIn: "Vide dans :",
    battSocTitle: "Batterie"
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
    powerHistoryLastHours: "Last {hours} hours",
    battFullIn: "Full in:",
    battEmptyIn: "Empty in:",
    battSocTitle: "Battery"
  }
}), Yt = "#9e9e9e", Ze = "#8d6e63", Tt = "#7e57c2", rt = "#fdd835", it = "#66bb6a", G = Object.freeze([
  { id: "bleu_hc", label: "Bleu HC", color: "#1e88e5" },
  { id: "bleu_hp", label: "Bleu HP", color: "#1e88e5" },
  { id: "blanc_hc", label: "Blanc HC", color: "#b0bec5" },
  { id: "blanc_hp", label: "Blanc HP", color: "#b0bec5" },
  { id: "rouge_hc", label: "Rouge HC", color: "#e53935" },
  { id: "rouge_hp", label: "Rouge HP", color: "#e53935" }
]), ft = "Europe/Paris";
function ce(o = /* @__PURE__ */ new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ft,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(o);
}
const R = () => ce();
function J(o) {
  const t = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(o));
  if (!t) return /* @__PURE__ */ new Date(NaN);
  const e = `${t[1]}-${t[2]}-${t[3]}`, r = Number(t[1]), i = Number(t[2]), a = Number(t[3]), n = Date.UTC(r, i - 1, a - 1, 18, 0, 0), c = Date.UTC(r, i - 1, a + 1, 6, 0, 0), d = new Intl.DateTimeFormat("en-CA", {
    timeZone: ft,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  for (let l = n; l <= c; l += 6e4) {
    const p = d.formatToParts(new Date(l)), h = (g) => p.find((x) => x.type === g)?.value ?? "";
    if (`${h("year")}-${h("month")}-${h("day")}` === e && h("hour") === "00" && h("minute") === "00" && h("second") === "00")
      return new Date(l);
  }
  return /* @__PURE__ */ new Date(NaN);
}
function Ft(o, t) {
  const e = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(o));
  if (!e) return R();
  const r = Number(e[1]), i = Number(e[2]), a = Number(e[3]);
  return new Date(Date.UTC(r, i - 1, a + t)).toISOString().slice(0, 10);
}
function Je(o) {
  const t = J(o).getTime();
  if (!Number.isFinite(t)) return 0;
  const e = new Intl.DateTimeFormat("en-GB", {
    timeZone: ft,
    weekday: "short"
  }).format(new Date(t));
  return { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }[e] ?? 0;
}
const Ye = (o) => ce(new Date(o));
function Xe(o, t) {
  const r = /^\d{4}-\d{2}-\d{2}$/.test(String(o)) ? String(o) : R();
  let i;
  if (t === "week") {
    const a = Je(r);
    i = Ft(r, -a);
  } else t === "month" ? i = `${r.slice(0, 7)}-01` : t === "year" ? i = `${r.slice(0, 4)}-01-01` : i = r;
  return { startIso: i, endIso: r };
}
function Bt(o, t) {
  const e = J(o);
  return Number.isFinite(e.getTime()) ? e.toLocaleDateString(t, {
    timeZone: ft,
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }) : String(o);
}
function Qe(o, t, e) {
  return o === t ? Bt(t, e) : `${Bt(o, e)} - ${Bt(t, e)}`;
}
const C = (o, t) => {
  const e = parseFloat(o?.[t]?.state);
  return Number.isFinite(e) ? e : 0;
}, M = (o, t, e) => {
  const r = parseFloat(o?.[t]?.attributes?.[e]);
  return Number.isFinite(r) ? r : 0;
}, T = (o, t, e) => {
  const r = o?.[t]?.attributes?.[e];
  if (r == null || r === "") return null;
  const i = Number(r);
  return Number.isFinite(i) ? i : null;
}, j = (o) => {
  const t = Number(o);
  if (!Number.isFinite(t)) return "—";
  const e = Math.abs(t);
  return e >= 1e3 ? `${(t / 1e3).toFixed(e >= 1e4 ? 0 : 1)} kW` : `${Math.round(t)} W`;
}, tr = (o) => o < 1 ? `${Math.round(o * 1e3)} Wh` : `${o.toFixed(2)} kWh`, ht = (o) => {
  const t = (o ?? []).some((e) => Number(e) >= 1);
  return (e) => t ? `${Number(e).toFixed(2)} kWh` : `${Math.round(Number(e) * 1e3)} Wh`;
}, er = {
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
function rr(o) {
  const t = String(o ?? "").toLowerCase();
  for (const [e, r] of Object.entries(er))
    if (t.includes(e)) return r;
  return null;
}
function ir(o) {
  const t = String(o ?? "").toLowerCase();
  return /\b(bleu|blanc|rouge)\b/.test(t) || /\b(hc|hp)\b/.test(t);
}
function or(o) {
  const t = String(o ?? "").toLowerCase();
  return t.includes(" hc") || t.endsWith("hc") || t.includes("heures creuses") || t.includes("off-peak");
}
function ar(o) {
  const e = String(o ?? "").trim().match(/^#([0-9a-f]{6})$/i);
  if (!e) return !1;
  const r = e[1], i = parseInt(r.slice(0, 2), 16), a = parseInt(r.slice(2, 4), 16), n = parseInt(r.slice(4, 6), 16);
  return (0.2126 * i + 0.7152 * a + 0.0722 * n) / 255 >= 0.68;
}
function Xt(o) {
  const t = Math.max(0, Math.round(o)), e = Math.floor(t / 60), r = t % 60;
  return `${e}h ${r}min`;
}
const Qt = Object.freeze([
  ...G.map((o) => `${o.id}_eur`),
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
]);
function sr(o) {
  const t = o;
  return {
    grid: (e) => `${t}grid_${e}_kwh`,
    battCharge: (e) => `${t}batt_charge_${e}_kwh`,
    maison: (e) => `${t}maison_${e}_kwh`,
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
function nr(o) {
  return o === "hphc" ? "HP/HC" : o === "base" ? "BASE" : "TEMPO";
}
function N(o, t) {
  return o ? t === "base" ? "Base" : t === "hphc" ? o.endsWith("_hc") ? "HC" : "HP" : o.replace("_", " ").toUpperCase().replace("BLEU", "Bleu").replace("BLANC", "Blanc").replace("ROUGE", "Rouge") : "—";
}
function lr(o) {
  const t = String(o ?? "").toLowerCase();
  return t.includes("blue") || t.includes("bleu") ? "Bleu" : t.includes("white") || t.includes("blanc") ? "Blanc" : t.includes("red") || t.includes("rouge") ? "Rouge" : t === "n/a" ? "N/A" : t || "—";
}
function te(o) {
  const t = String(o ?? "").toLowerCase();
  return t.includes("blue") || t.includes("bleu") ? "color-blue" : t.includes("white") || t.includes("blanc") ? "color-white" : t.includes("red") || t.includes("rouge") ? "color-red" : "color-na";
}
function ee(o, t) {
  return !t || typeof t != "object" ? [] : G.map((e) => {
    const r = t[e.id], i = typeof r == "number" ? r : parseFloat(r);
    return !Number.isFinite(i) || i <= 1e-4 ? null : {
      label: N(e.id, o),
      v: i,
      color: e.color,
      isHc: e.id.endsWith("_hc")
    };
  }).filter(Boolean);
}
function re(o) {
  return !o || typeof o != "object" ? "" : G.map((t) => {
    const e = o[t.id], r = typeof e == "number" ? e : parseFloat(e);
    return `${t.id}:${Number.isFinite(r) ? r : 0}`;
  }).join(",");
}
class cr extends W {
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
    return nt`
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
    const e = (t ?? []).filter((i) => Number(i?.value) > 1e-3), r = e.reduce((i, a) => i + Number(a.value), 0) || 1;
    return e.map((i) => _`
      <span
        class="fill-seg ${i.className ?? ""}"
        style="width:${(Number(i.value) / r * 100).toFixed(1)}%;background-color:${i.color}"
      ></span>
    `);
  }
  _renderBreakdown() {
    const t = this.breakdown ?? [];
    if (!this.showBreakdown || !t.length) return f;
    const e = Number(this.total) || 0;
    return _`
      <div class="icon-brk">
        ${t.map((r) => {
      const i = r.icon ?? (ir(r.label) ? "mdi:transmission-tower" : rr(r.label)), a = ar(r.color) ? "swatch-icon-dark" : "";
      return _`
            <span class="icon-brk-item">
              ${r.color ? _`<span
                    class="icon-brk-swatch ${or(r.label) ? "fill-hc" : ""} ${a}"
                    style="background-color:${r.color}"
                  >
                    ${i ? _`<ha-icon icon=${i}></ha-icon>` : f}
                  </span>` : i ? _`<ha-icon icon=${i}></ha-icon>` : f}
              <span>${r.label}</span>&nbsp;<b>${r.value}</b>
              ${e > 0 && r.rawV != null ? _`<span class="icon-brk-pct">(${Math.round(Number(r.rawV) / e * 100)}%)</span>` : f}
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
      return _`
        <div class="cons-strip">
          <div class="cons-strip-cap">${this.title}</div>
          <p class="empty">${this.emptyLabel || "—"}</p>
        </div>
      `;
    const e = Math.max(0, Math.min(100, Number(this.fillPercent) || 0));
    return _`
      <div class="cons-strip">
        <div class="cons-strip-cap">${this.title}</div>
        <div class="bar-wrap" title=${this.tooltip || f}>
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
customElements.get("hub-energy-strip") || customElements.define("hub-energy-strip", cr);
class dr extends W {
  static get properties() {
    return {
      i18n: { attribute: !1 },
      data: { attribute: !1 }
    };
  }
  static get styles() {
    return nt`
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
    super(), this.i18n = {}, this.data = null;
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
    if (t == null) return f;
    const e = t.gridSigned != null ? Math.max(0, t.gridSigned) : 0, r = [];
    t.gridSigned != null && e > 0 && r.push({ w: e, c: Tt, t: `${this.i18n.segImport} +${j(e)}` }), t.battDis != null && t.battDis > 0 && r.push({ w: t.battDis, c: it, t: `${this.i18n.segBattDis} +${j(t.battDis)}` }), t.solar != null && t.solar > 0 && r.push({ w: t.solar, c: rt, t: `${this.i18n.segSolar} ${j(t.solar)}` });
    const i = r.reduce((p, h) => p + h.w, 0), a = t.gridSigned != null ? j(t.gridSigned) : t.exportW != null && t.exportW > 0 ? j(-t.exportW) : "—", n = t.solar != null ? j(t.solar) : "—", c = t.battDis != null || t.battChg != null ? (t.battDis ?? 0) - (t.battChg ?? 0) : null, d = c != null ? j(c) : "—", l = t.load != null ? j(t.load) : "—";
    return _`
      <div
        class="power-now-wrap"
        role="button"
        tabindex="0"
        aria-label=${this.i18n?.powerNowAria ?? this.i18n?.powerNow ?? "Power now"}
        @click=${this._emitToggle}
        @keydown=${this._onKeyDown}
      >
        <div class="cons-strip-cap">${this.i18n.powerNow}</div>
        <div class="pnl-wrap">
          <div class="pnl-bar" title=${t.tooltip}>
            ${i > 1 ? r.map((p) => _`
                  <span
                    class="pnl-seg"
                    style="width:${(p.w / i * 100).toFixed(1)}%;background:${p.c}"
                    title=${p.t}
                  ></span>
                `) : _`<span
                  class="pnl-seg"
                  style="width:100%;background:color-mix(in srgb, var(--divider-color) 85%, transparent)"
                  title="—"
                ></span>`}
          </div>
          <div class="pnl-load-overlay">${l} ${this.i18n.loadConsumed}</div>
        </div>
        <div class="icon-brk">
          <span class="icon-brk-item">
            <span class="icon-brk-swatch" style="background-color:${Tt}">
              <ha-icon icon="mdi:transmission-tower"></ha-icon>
            </span>
            <span>${this.i18n.colGrid}</span>&nbsp;<b>${a}</b>
          </span>
          <span class="icon-brk-item">
            <span class="icon-brk-swatch" style="background-color:${rt}">
              <ha-icon icon="mdi:weather-sunny"></ha-icon>
            </span>
            <span>${this.i18n.colSolar}</span>&nbsp;<b>${n}</b>
          </span>
          <span class="icon-brk-item" title=${this.i18n.colBattTip || f}>
            <span class="icon-brk-swatch" style="background-color:${it}">
              <ha-icon icon="mdi:battery"></ha-icon>
            </span>
            <span>${this.i18n.colBatt}</span>&nbsp;<b>${d}</b>
          </span>
        </div>
      </div>
    `;
  }
}
customElements.get("hub-power-now") || customElements.define("hub-power-now", dr);
class pr extends W {
  static get properties() {
    return {
      i18n: { attribute: !1 },
      data: { attribute: !1 },
      numberLocale: { type: String, attribute: "number-locale" }
    };
  }
  static get styles() {
    return nt`
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
      const e = t.soc ?? 0, r = t.capacity * (1 - e / 100), i = t.chargeW / 1e3;
      if (i > 0)
        return {
          icon: "mdi:battery-charging-high",
          time: Xt(r / i * 60)
        };
    } else if (t.dischargeW != null && t.dischargeW > 0) {
      const e = t.capacity * (t.soc ?? 0) / 100, r = t.dischargeW / 1e3;
      if (r > 0)
        return {
          icon: "mdi:battery-low",
          time: Xt(e / r * 60)
        };
    }
    return null;
  }
  /** @returns {"charging" | "discharging" | "idle"} */
  _flowMode(t) {
    if (!t) return "idle";
    const e = 40, r = t.chargeW != null ? Number(t.chargeW) : 0, i = t.dischargeW != null ? Number(t.dischargeW) : 0;
    return r > e ? "charging" : i > e ? "discharging" : "idle";
  }
  render() {
    const t = this.data;
    if (!t || t.soc == null || t.capacity == null || t.capacity <= 0) return f;
    const e = Math.max(0, Math.min(100, Number(t.socMin ?? 0)));
    let r = Math.max(e, Math.min(100, Number(t.socMax ?? 100)));
    const i = Math.max(0, Math.min(100, Number(t.soc))), a = Math.min(r, Math.max(e, i));
    let n = a;
    const c = t.capacity, d = t.available;
    if (d != null && Number.isFinite(d) && c > 0) {
      const y = e + d / c * 100;
      n = Math.min(Math.max(y, e), a, r);
    }
    const l = d != null && Number.isFinite(d) ? d : c * Math.max(0, a - e) / 100, p = Math.round(i).toLocaleString(this.numberLocale ?? "fr-FR"), h = `${this._fmtKwh(l)} / ${this._fmtKwh(c)} kWh (${p} %)`, $ = this._flowMode(t), g = $ === "charging" ? "batt-green--charging" : $ === "discharging" ? "batt-green--discharging" : "", x = 18, b = 100 / x, w = (y) => Math.max(0, Math.min(1, y)), k = (y, u, A, B) => Math.max(0, Math.min(u, B) - Math.max(y, A)), m = Array.from({ length: x }, (y, u) => {
      const A = u * b, B = (u + 1) * b, D = k(A, B, A, e) / b * 100, E = k(A, B, r, B) / b * 100, S = Math.max(A, e), P = Math.min(B, n, r), H = k(A, B, S, P) / b * 100, O = w((S - A) / b) * 100, K = `--hatch-l:${D.toFixed(3)};--hatch-r:${E.toFixed(3)};--fill-x:${O.toFixed(
        3
      )};--fill-w:${H.toFixed(3)};`;
      return _`<div class="batt-cell" style="${K}">
        <div class="batt-cell-hatch batt-cell-hatch--left"></div>
        <div class="batt-cell-hatch batt-cell-hatch--right"></div>
        <div class="batt-cell-fill"></div>
      </div>`;
    }), v = this._resolveEta();
    return _`
      <div class="batt-bar-container">
        <div class="batt-section-head">
          <h3>${this.i18n.battSocTitle}</h3>
        </div>
        <div class="batt-track-wrap" title="${Math.round(i)} % SOC">
          <div class="batt-track">
            <div class="batt-segments ${g}">${m}</div>
          </div>
          <div class="batt-bar-total">
            <div class="batt-bar-stack">
              <div class="batt-bar-row-main">
                <span class="batt-bar-total-text">${h}</span>
              </div>
              ${v ? _`<div class="batt-bar-eta-inline">
                    <ha-icon class="batt-eta-icon" icon=${v.icon}></ha-icon>
                    <span>${v.time}</span>
                  </div>` : f}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.get("hub-energie-battery-bar") || customElements.define("hub-energie-battery-bar", pr);
class hr extends W {
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
    return nt`
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
    if (!(this.totalMaison > 0)) return f;
    const t = Math.max(
      0,
      Math.min(100, Math.round((1 - Math.min(this.originGrid, this.totalMaison) / this.totalMaison) * 100))
    ), e = t >= 60 ? "eco" : t >= 30 ? "" : "warn", r = this.ecoTotal >= 0 ? "−" : "+", i = this.ecoTotal >= 0 ? "eco" : "neg";
    return _`
      <div class="insight-bar">
        <span class="insight-chip ${e}">☀️ ${t}% ${this.i18n.insightAutosuff}</span>
        <span class="insight-chip">💸 ${this.totalEur.toFixed(2)} €</span>
        <span class="insight-chip ${i}">
          ⚡ ${r}${Math.abs(this.ecoTotal).toFixed(2)}€ ${this.i18n.insightVsGrid}
        </span>
      </div>
    `;
  }
}
customElements.get("hub-insight-bar") || customElements.define("hub-insight-bar", hr);
async function ur(o, t, e, r, i) {
  const a = /^\d{4}-\d{2}-\d{2}$/.test(String(t)) ? String(t) : R(), n = /^\d{4}-\d{2}-\d{2}$/.test(String(e)) ? String(e) : R();
  let c = J(a), d = J(Ft(n, 1));
  Number.isFinite(c.getTime()) || (c = J(R())), Number.isFinite(d.getTime()) || (d = J(Ft(R(), 1)));
  const l = new URLSearchParams({
    filter_entity_id: r.join(","),
    end_time: d.toISOString()
  }), p = `history/period/${encodeURIComponent(c.toISOString())}?${l}`, h = await o.callApi("GET", p), $ = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map(), b = new Set(r);
  for (const m of Array.isArray(h) ? h : [])
    if (Array.isArray(m))
      for (const v of m) {
        const y = v?.entity_id;
        if (!y || !b.has(y)) continue;
        const u = Date.parse(v?.last_changed ?? v?.last_updated ?? "");
        if (!Number.isFinite(u)) continue;
        const A = Ye(u), B = parseFloat(v?.state);
        if (Number.isFinite(B)) {
          $.has(y) || $.set(y, /* @__PURE__ */ new Map());
          const E = $.get(y), S = E.get(A);
          (!S || u >= S.ts) && E.set(A, { ts: u, v: B });
        }
        if (y === i && v?.attributes && typeof v.attributes == "object")
          for (const E of Qt) {
            const S = parseFloat(v.attributes?.[E]);
            if (!Number.isFinite(S)) continue;
            g.has(E) || g.set(E, /* @__PURE__ */ new Map());
            const P = g.get(E), H = P.get(A);
            (!H || u >= H.ts) && P.set(A, { ts: u, v: S });
          }
        const D = x.get(y);
        (!D || u > D.ts) && x.set(y, { ts: u, state: v });
      }
  const w = (m) => [...m?.values() ?? []].reduce((v, y) => v + (y?.v ?? 0), 0), k = {};
  for (const m of b) {
    const y = { ...x.get(m)?.state?.attributes ?? {} };
    if (m === i)
      for (const u of Qt) y[u] = w(g.get(u));
    k[m] = {
      entity_id: m,
      state: String(w($.get(m))),
      attributes: y
    };
  }
  return k;
}
class gr extends W {
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
      _powerGraphSeries: { state: !0 }
    };
  }
  static get styles() {
    return nt`
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
      .power-graph {
        margin: 0 0 10px;
        padding: 8px 10px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--secondary-background-color) 80%, transparent);
        border: 1px solid color-mix(in srgb, var(--divider-color) 75%, transparent);
      }
      .power-graph-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
        margin: 0 0 6px;
      }
      .power-graph-title {
        font-size: 0.72rem;
        font-weight: 800;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0;
      }
      .power-graph-meta {
        font-size: 0.72rem;
        color: var(--secondary-text-color);
        white-space: nowrap;
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
      .power-xaxis {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        margin-top: 6px;
        font-size: 0.68rem;
        color: color-mix(in srgb, var(--primary-text-color) 35%, var(--secondary-text-color) 65%);
        font-variant-numeric: tabular-nums;
      }
    `;
  }
  constructor() {
    super(), this._config = {}, this._date = R(), this._rangePreset = "day", this._showRaw = !1, this._hist = null, this._histLoading = !1, this._histErr = null, this._prefixCache = null, this.__lastKey = null, this._powerGraphOpen = !1, this._powerGraphLoading = !1, this._powerGraphErr = null, this._powerGraphSeries = null;
  }
  setConfig(t) {
    this._config = t ?? {}, this._prefixCache = null, this.__lastKey = null;
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
  static getStubConfig() {
    return {
      type: "custom:hub-energie-card",
      cost_entity: "sensor.hub_energie_cost_detail",
      grid_span: 2
    };
  }
  shouldUpdate(t) {
    if (t.has("hass") && t.size === 1) {
      const e = this._stateKey();
      return e !== null && e === this.__lastKey ? !1 : (this.__lastKey = e, !0);
    }
    return !0;
  }
  updated(t) {
    super.updated(t), (t.has("hass") || t.has("_date") || t.has("_rangePreset")) && this._loadHistory();
  }
  _i18n() {
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? Jt.en : Jt.fr;
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
    return sr(this._prefix());
  }
  _getRange() {
    return Xe(this._date ?? R(), this._rangePreset ?? "day");
  }
  _isLiveMode() {
    const t = this._getRange();
    return (this._rangePreset ?? "day") === "day" && t.endIso === R();
  }
  _stateKey() {
    const t = this._getRange();
    if (!this._isLiveMode())
      return `hist:${t.startIso}:${t.endIso}:${this._rangePreset ?? "day"}:${this._histLoading ? "loading" : this._hist ? "ok" : "none"}:${this._histErr ?? ""}`;
    const e = this.hass?.states;
    if (!e) return null;
    const r = this._map(), i = [
      r.cost,
      ...G.flatMap((c) => [r.grid(c.id), r.maison(c.id), r.battCharge(c.id)]),
      r.ecoSolar,
      r.ecoBatt,
      r.originGrid,
      r.originSolar,
      r.usageGridDirect,
      r.usageGridBatt,
      r.usageSolarDirect,
      r.usageSolarBatt,
      r.usageBattHome
    ], a = e[r.cost]?.attributes ?? {}, n = [
      a.offer ?? "",
      a.contract_power ?? "",
      a.tariff_fetched_at ?? "",
      a.current_slot ?? "",
      JSON.stringify(a.tempo_days ?? {}),
      a.grid_power_signed_w ?? "",
      a.solar_power_w ?? "",
      a.solar_estimate_power_w ?? "",
      a.batt_discharge_power_w ?? "",
      a.batt_charge_power_w ?? "",
      a.load_power_w ?? "",
      a.export_power_w ?? "",
      a.battery_soc_percent ?? "",
      a.battery_capacity_kwh ?? "",
      re(a.usage_grid_batt_charge_by_slot_kwh),
      re(a.usage_solar_batt_charge_by_slot_kwh),
      e[r.cost]?.last_updated ?? ""
    ].join("|");
    return `${i.map((c) => e[c]?.state ?? "").join("|")}|${n}`;
  }
  _states() {
    return (this._isLiveMode() ? this.hass?.states : this._hist) ?? {};
  }
  _extract() {
    const t = this._states(), e = this._map(), r = t?.[e.cost]?.attributes ?? {}, i = String(r.offer ?? "tempo").toLowerCase(), a = String(r.contract_power ?? ""), n = String(r.current_slot ?? ""), c = r.tempo_days ?? null, d = r.today_color ?? null, l = r.tomorrow_color ?? null, p = {
      solarSurplus: M(t, e.cost, "export_due_to_solar_surplus_kwh"),
      batteryFull: M(t, e.cost, "export_due_to_battery_full_or_absent_kwh"),
      switchLatency: M(t, e.cost, "export_due_to_switch_latency_kwh"),
      unattributed: M(t, e.cost, "export_unattributed_kwh"),
      oppTotalEur: M(t, e.cost, "export_opportunity_cost_total_eur"),
      oppSolarEur: M(t, e.cost, "export_opportunity_cost_solar_surplus_eur"),
      oppBatteryEur: M(t, e.cost, "export_opportunity_cost_battery_full_or_absent_eur"),
      oppLatencyEur: M(t, e.cost, "export_opportunity_cost_switch_latency_eur"),
      oppOtherEur: M(t, e.cost, "export_opportunity_cost_unattributed_eur")
    }, h = G.map((u) => ({
      ...u,
      label: N(u.id, i),
      v: C(t, e.grid(u.id)),
      isHc: u.id.endsWith("_hc")
    })), $ = G.map((u) => ({
      ...u,
      label: N(u.id, i),
      v: C(t, e.maison(u.id)),
      isHc: u.id.endsWith("_hc")
    })), g = C(t, e.cost), x = G.map((u) => ({
      ...u,
      label: N(u.id, i),
      v: M(t, e.cost, `${u.id}_eur`),
      tooltip: `${C(t, e.grid(u.id)).toFixed(3)} kWh`,
      isHc: u.id.endsWith("_hc")
    })), b = M(t, e.cost, "abonnement_eur"), w = C(t, e.ecoSolar), k = C(t, e.ecoBatt), m = C(t, e.originGrid), v = C(t, e.originSolar), y = {
      gridDirect: { label: "Réseau direct (maison)", v: C(t, e.usageGridDirect), color: Tt },
      gridBatt: { label: "Réseau → charge batterie", v: C(t, e.usageGridBatt), color: Ze },
      solarDirect: { label: "Solaire (maison)", v: C(t, e.usageSolarDirect), color: rt },
      solarBatt: { label: "Solaire → charge batterie", v: C(t, e.usageSolarBatt), color: "#fbc02d" },
      battHome: { label: "Batterie → maison", v: C(t, e.usageBattHome), color: it }
    };
    return {
      grid: h,
      maison: $,
      totalEur: g,
      costs: x,
      abo: b,
      ecoSolar: w,
      ecoBatt: k,
      og: m,
      os: v,
      usage: y,
      costEntityOk: !!t[e.cost],
      offer: i,
      contractPower: a,
      currentSlot: n,
      tempoDays: c,
      todayColor: d,
      tomorrowColor: l,
      reinj: p,
      gridBattBySlot: r.usage_grid_batt_charge_by_slot_kwh,
      solarBattBySlot: r.usage_solar_batt_charge_by_slot_kwh
    };
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
      ...G.flatMap((i) => [t.grid(i.id), t.maison(i.id), t.battCharge(i.id)]),
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
    ur(this.hass, e.startIso, e.endIso, r, t.cost).then((i) => {
      this._hist = i, this._histErr = null;
    }).catch((i) => {
      this._histErr = i.message ?? String(i), this._hist = null;
    }).finally(() => {
      this._histLoading = !1, this.__lastKey = null;
    });
  }
  async _loadPowerGraph() {
    if (!this.hass) return;
    const e = this._map().cost;
    if (e && !(this._powerGraphLoading || this._powerGraphSeries !== null)) {
      this._powerGraphLoading = !0, this._powerGraphErr = null;
      try {
        const r = parseFloat(this._config?.power_history_hours), i = Number.isFinite(r) ? Math.max(1, Math.min(48, Math.trunc(r))) : 8, a = new Date(Date.now() - i * 60 * 60 * 1e3), n = new URLSearchParams({
          filter_entity_id: e,
          end_time: (/* @__PURE__ */ new Date()).toISOString(),
          minimal_response: "false",
          significant_changes_only: "false"
        }), c = `history/period/${encodeURIComponent(a.toISOString())}?${n}`, d = await this.hass.callApi("GET", c), l = Array.isArray(d) ? d : [], p = [];
        for (const b of l)
          if (Array.isArray(b))
            for (const w of b) {
              const k = Date.parse(w?.last_changed ?? w?.last_updated ?? w?.lc ?? w?.lu ?? "");
              if (!Number.isFinite(k)) continue;
              const m = w?.attributes ?? w?.a ?? {};
              if (!m || typeof m != "object") continue;
              const v = parseFloat(m.load_power_w), y = parseFloat(m.solar_power_w ?? m.solar_estimate_power_w), u = parseFloat(m.batt_discharge_power_w);
              p.push({
                ts: k,
                load: Number.isFinite(v) ? Math.max(0, v) : null,
                solar: Number.isFinite(y) ? Math.max(0, y) : null,
                batt: Number.isFinite(u) ? Math.max(0, u) : null
              });
            }
        p.sort((b, w) => b.ts - w.ts);
        const h = 160, g = ((b) => {
          if (b.length <= h) return b;
          const w = b.length / h, k = [];
          for (let m = 0; m < h; m++)
            k.push(b[Math.floor(m * w)]);
          return k;
        })(p), x = g.reduce((b, w) => Math.max(b, w.load ?? 0, w.solar ?? 0, w.batt ?? 0), 0);
        this._powerGraphSeries = {
          hoursBack: i,
          pts: g,
          maxV: x
        };
      } catch (r) {
        this._powerGraphErr = r?.message ?? String(r), this._powerGraphSeries = null;
      } finally {
        this._powerGraphLoading = !1, this.__lastKey = null;
      }
    }
  }
  _togglePowerGraph() {
    const t = !this._powerGraphOpen;
    this._powerGraphOpen = t, this.__lastKey = null, t && (this._powerGraphSeries = null, this._powerGraphErr = null, this._loadPowerGraph());
  }
  _svgAreaPath(t, e, r, i) {
    if (!t?.length || !Number.isFinite(e) || e <= 0) return "";
    const a = t.length, n = [];
    for (let l = 0; l < a; l++) {
      const p = Number(t[l] ?? 0), h = a === 1 ? 0 : l / (a - 1) * r, $ = i - Math.max(0, p) / e * i;
      n.push({ x: h, y: $ });
    }
    return `${`M ${n[0].x.toFixed(2)} ${n[0].y.toFixed(2)} ${n.slice(1).map((l) => `L ${l.x.toFixed(2)} ${l.y.toFixed(2)}`).join(" ")}`} L ${n[n.length - 1].x.toFixed(2)} ${i.toFixed(2)} L 0 ${i.toFixed(2)} Z`;
  }
  _svgLinePath(t, e, r, i) {
    if (!t?.length || !Number.isFinite(e) || e <= 0) return "";
    const a = t.length, n = [];
    for (let c = 0; c < a; c++) {
      const d = Number(t[c] ?? 0), l = a === 1 ? 0 : c / (a - 1) * r, p = i - Math.max(0, d) / e * i;
      n.push({ x: l, y: p });
    }
    return `M ${n[0].x.toFixed(2)} ${n[0].y.toFixed(2)} ${n.slice(1).map((c) => `L ${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(" ")}`;
  }
  _renderPowerGraph(t, e) {
    if (!this._powerGraphOpen) return f;
    const r = "rgba(126, 87, 194, 0.45)", i = "rgba(126, 87, 194, 0.95)", a = "rgba(251, 192, 45, 0.42)", n = "rgba(251, 192, 45, 0.95)", c = "rgba(76, 175, 80, 0.42)", d = "rgba(76, 175, 80, 0.95)";
    if (this._powerGraphLoading)
      return _`<div class="power-graph"><div class="loader">${t.loading}</div></div>`;
    if (this._powerGraphErr)
      return _`<div class="power-graph"><div class="alert">${this._powerGraphErr}</div></div>`;
    const l = this._powerGraphSeries;
    if (!l?.pts?.length || !Number.isFinite(l.maxV) || l.maxV <= 0)
      return _`<div class="power-graph"><div class="loader">${t.noData}</div></div>`;
    const p = 320, h = 120, $ = l.pts.map((S) => S.load ?? 0), g = l.pts.map((S) => S.solar ?? 0), x = l.pts.map((S) => S.batt ?? 0), b = (S) => new Intl.DateTimeFormat(e, { hour: "2-digit", minute: "2-digit" }).format(new Date(S)), w = l.pts[0].ts, k = l.pts[l.pts.length - 1].ts, m = w + (k - w) / 3, v = w + (k - w) * 2 / 3, y = this._svgAreaPath($, l.maxV, p, h), u = this._svgLinePath($, l.maxV, p, h), A = this._svgAreaPath(g, l.maxV, p, h), B = this._svgLinePath(g, l.maxV, p, h), D = this._svgAreaPath(x, l.maxV, p, h), E = this._svgLinePath(x, l.maxV, p, h);
    return _`
      <div class="power-graph">
        <div class="power-graph-head">
          <div class="power-graph-title">${t.powerHistoryTitle ?? "Power history"}</div>
          <div class="power-graph-meta">${String(t.powerHistoryLastHours ?? "Last {hours} hours").replace("{hours}", String(l.hoursBack))}</div>
        </div>
        <svg viewBox="0 0 ${p} ${h}" width="100%" height="120" preserveAspectRatio="none" aria-label="power history chart">
          <rect x="0" y="0" width="${p}" height="${h}" fill="transparent"></rect>
          <path d="${y}" fill="${r}" stroke="none"></path>
          <path d="${A}" fill="${a}" stroke="none"></path>
          <path d="${D}" fill="${c}" stroke="none"></path>

          <path d="${u}" fill="none" stroke="${i}" stroke-width="1.8"></path>
          <path d="${B}" fill="none" stroke="${n}" stroke-width="1.6"></path>
          <path d="${E}" fill="none" stroke="${d}" stroke-width="1.6"></path>
        </svg>
        <div class="power-xaxis">
          <span>${b(w)}</span>
          <span>${b(m)}</span>
          <span>${b(v)}</span>
          <span>${b(k)}</span>
        </div>
      </div>
    `;
  }
  _buildPowerNowData(t, e, r) {
    if (!t?.[e]) return null;
    const i = T(t, e, "grid_power_signed_w"), a = T(t, e, "solar_power_w") ?? T(t, e, "solar_estimate_power_w"), n = T(t, e, "batt_discharge_power_w"), c = T(t, e, "batt_charge_power_w"), d = T(t, e, "load_power_w"), l = T(t, e, "export_power_w"), p = [];
    return i != null ? p.push(i >= 0 ? `${r.segImport} ${i.toFixed(0)} W` : `${r.segExport} ${Math.abs(i).toFixed(0)} W`) : l != null && l > 0 && p.push(`${r.segExport} ${l.toFixed(0)} W`), a != null && p.push(`${r.segSolar} ${a.toFixed(0)} W`), n != null && n > 0 && p.push(`${r.segBattDis} ${n.toFixed(0)} W`), c != null && c > 0 && p.push(`${r.segBattChg} ${c.toFixed(0)} W`), {
      gridSigned: i,
      solar: a,
      battDis: n,
      battChg: c,
      load: d,
      exportW: l,
      tooltip: [r.powerBarTip, p.length ? p.join(" · ") : ""].filter(Boolean).join(" — ")
    };
  }
  _buildBatteryData(t, e) {
    const r = T(t, e, "battery_capacity_kwh"), i = T(t, e, "battery_soc_percent");
    if (r == null || r <= 0 || i == null) return null;
    const a = T(t, e, "battery_soc_min_percent"), n = T(t, e, "battery_soc_max_percent");
    return {
      soc: i,
      socMin: a ?? 0,
      socMax: n ?? 100,
      capacity: r,
      available: T(t, e, "battery_available_kwh"),
      chargeW: T(t, e, "batt_charge_power_w"),
      dischargeW: T(t, e, "batt_discharge_power_w")
    };
  }
  _renderRedHpWarning(t, e, r, i, a) {
    if (e !== "tempo" || r <= 0) return f;
    const c = (t ?? []).find((l) => l.id === "rouge_hp")?.v ?? 0;
    if (c < 0.1) return f;
    const d = (i.solarDirect?.v ?? 0) + (i.solarBatt?.v ?? 0) + (i.battHome?.v ?? 0);
    return c / r < 0.35 || c <= d ? f : _`<div class="red-hp-banner">⚠️ ${a.redHpWarning}</div>`;
  }
  _renderSlotMapRaw(t, e) {
    if (!t || typeof t != "object") return "—";
    const r = G.map((i) => {
      const a = t[i.id], n = typeof a == "number" ? a : parseFloat(a);
      return Number.isFinite(n) && n > 1e-5 ? { label: N(i.id, e), v: n } : null;
    }).filter(Boolean);
    return r.length ? r.map((i, a) => _`${a > 0 ? _`<br />` : f}${i.label}: ${i.v.toFixed(3)} kWh`) : "—";
  }
  render() {
    const t = this._i18n();
    if (!this.hass) return _`<ha-card></ha-card>`;
    const e = String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? "en-GB" : "fr-FR", r = this._isLiveMode(), i = this._getRange(), {
      grid: a,
      maison: n,
      totalEur: c,
      costs: d,
      abo: l,
      ecoSolar: p,
      ecoBatt: h,
      og: $,
      usage: g,
      costEntityOk: x,
      offer: b,
      contractPower: w,
      currentSlot: k,
      tempoDays: m,
      todayColor: v,
      tomorrowColor: y,
      reinj: u,
      gridBattBySlot: A,
      solarBattBySlot: B
    } = this._extract(), D = this._map(), E = a.reduce((s, F) => s + F.v, 0), S = n.reduce((s, F) => s + F.v, 0), P = a.filter((s) => s.v > 1e-3), H = d.filter((s) => s.v > 5e-4), O = p + h, K = ht([E, ...a.map((s) => s.v), g.gridDirect.v, g.gridBatt.v]), _t = g.gridDirect.v, wt = Math.max(0, g.solarDirect.v - g.solarBatt.v), yt = g.battHome.v, $t = _t + wt + yt, ct = ht([$t, _t, wt, yt]), xt = g.gridBatt.v + g.solarBatt.v, vt = x ? ee(b, A) : [], St = x ? ee(b, B) : [], de = x && (vt.length > 0 || St.length > 0), L = [];
    if (de) {
      if (St.length) {
        const s = St.reduce((F, Rt) => F + (Number.isFinite(Rt?.v) ? Rt.v : 0), 0);
        s > 1e-5 && L.push({
          label: t.brkTblSolar,
          v: s,
          color: g.solarBatt.color,
          isHc: !1
        });
      } else g.solarBatt.v > 1e-3 && L.push({
        label: t.brkTblSolar,
        v: g.solarBatt.v,
        color: g.solarBatt.color,
        isHc: !1
      });
      if (vt.length)
        for (const s of vt)
          L.push({
            label: `${t.brkTblGridHome} · ${s.label}`,
            v: s.v,
            color: s.color,
            isHc: s.isHc
          });
      else g.gridBatt.v > 1e-3 && L.push({
        label: t.brkTblGridHome,
        v: g.gridBatt.v,
        color: g.gridBatt.color,
        isHc: !1
      });
    } else
      g.gridBatt.v > 1e-3 && L.push({
        label: t.brkTblGridHome,
        v: g.gridBatt.v,
        color: g.gridBatt.color,
        isHc: !1
      }), g.solarBatt.v > 1e-3 && L.push({
        label: t.brkTblSolar,
        v: g.solarBatt.v,
        color: g.solarBatt.color,
        isHc: !1
      });
    const dt = ht([
      xt,
      ...L.map((s) => s.v)
    ]), pe = P.map((s) => ({ value: s.v, color: s.color, className: s.isHc ? "fill-hc" : "" })), he = P.map((s) => ({
      label: N(s.id, b),
      value: K(s.v),
      color: s.color,
      rawV: s.v
    })), kt = [
      { label: t.brkTblGridHome, v: _t, color: g.gridDirect.color },
      { label: t.brkTblSolar, v: wt, color: g.solarDirect.color },
      { label: t.brkTblBattHome, v: yt, color: g.battHome.color }
    ].filter((s) => s.v > 1e-3), ue = kt.map((s) => ({ value: s.v, color: s.color })), ge = kt.map((s) => ({
      label: s.label,
      value: ct(s.v),
      color: s.color,
      rawV: s.v
    })), be = L.map((s) => ({
      value: s.v,
      color: s.color,
      className: s.isHc ? "fill-hc" : ""
    })), me = L.map((s) => ({
      label: s.label,
      value: dt(s.v),
      color: s.color,
      rawV: s.v
    })), fe = [
      ...H.map((s) => ({ value: s.v, color: s.color, className: s.isHc ? "fill-hc" : "" })),
      ...l > 5e-4 ? [{ value: l, color: Yt }] : []
    ], _e = [
      ...H.map((s) => ({ label: N(s.id, b), value: `${s.v.toFixed(2)} €`, color: s.color, rawV: s.v })),
      ...l > 5e-4 ? [{ label: t.costSubscription, value: `${l.toFixed(2)} €`, color: Yt, rawV: l }] : []
    ], Q = [
      { label: "Surplus PV", v: u.solarSurplus, eur: u.oppSolarEur, color: rt },
      { label: "Batt pleine", v: u.batteryFull, eur: u.oppBatteryEur, color: it },
      { label: "Latence batt", v: u.switchLatency, eur: u.oppLatencyEur, color: "#ff7043" },
      { label: "Autre", v: u.unattributed, eur: u.oppOtherEur, color: "#90a4ae" }
    ].filter((s) => s.v > 1e-4), At = Q.reduce((s, F) => s + F.v, 0), pt = ht([At, ...Q.map((s) => s.v)]), we = Q.map((s) => ({ value: s.v, color: s.color })), ye = Q.map((s) => ({
      label: s.label,
      value: `${pt(s.v)} · ${s.eur.toFixed(2)} €`,
      color: s.color,
      rawV: s.v
    })), q = [
      { label: t.ecoSourceSolar, vAbs: Math.abs(p), color: rt, fmt: `${p >= 0 ? "+" : ""}${p.toFixed(2)} €`, rawV: p },
      { label: t.ecoSourceBatt, vAbs: Math.abs(h), color: it, fmt: `${h >= 0 ? "+" : ""}${h.toFixed(2)} €`, rawV: h }
    ].filter((s) => s.vAbs > 5e-4), $e = q.reduce((s, F) => s + F.vAbs, 0), xe = q.length ? q.map((s) => ({ value: s.vAbs, color: s.color })) : Math.abs(O) > 5e-4 ? [{ value: 1, color: O >= 0 ? "#1976d2" : "#c62828" }] : [], Lt = q.length ? q.map((s) => ({ label: s.label, value: s.fmt, color: s.color, rawV: s.vAbs })) : [], ve = this._states(), Se = r && x ? this._buildPowerNowData(ve, D.cost, t) : null, ke = x && this.hass?.states ? this._buildBatteryData(this.hass.states, D.cost) : null, Ae = u.solarSurplus + u.batteryFull + u.switchLatency + u.unattributed;
    return _`
      <ha-card>
        <div class="header">
          <div class="header-title-side">
            <h2>Hub Énergie</h2>
            <span class="header-subtitle">${nr(b)}${w ? ` ${w}kVA` : ""}</span>
          </div>
          <div class="controls">
            <label>${t.date}</label>
            <input type="date" .value=${this._date} max=${R()} @change=${this._onDateChange} />
            <label>${t.range}</label>
            <div class="range-btns">
              ${["day", "week", "month", "year"].map((s) => _`
                <button class="range-btn ${this._rangePreset === s ? "active" : ""}" @click=${() => this._setRangePreset(s)}>
                  ${t[s]}
                </button>
              `)}
            </div>
            <span class="range-label">${Qe(i.startIso, i.endIso, e)}</span>
            <button class="btn" @click=${this._onRawToggle}>${this._showRaw ? t.hide : t.details}</button>
          </div>
        </div>

        ${r && !x && this.hass?.states ? _`
              <div class="alert">
                Capteur <code>${D.cost}</code> introuvable.<br />
                Ajoutez dans la carte : <code>cost_entity: sensor.hub_energie_cost_detail</code><br />
                (Outils de développement → États, cherchez « hub energie cost detail »).
              </div>
            ` : f}

        ${this._histLoading ? _`<div class="loader">${t.loading}</div>` : f}

        <div class="meta-tempo-wrap">
          <div class="meta-days-stack">
            <div class="day-tile ${b === "tempo" ? te(v) : "color-na"}">
              <span class="day-tile-line">${t.today} : ${N(k, b)}</span>
            </div>
            <div class="day-tile ${b === "tempo" ? te(y) : "color-na"}">
              <span class="day-tile-line">${t.tomorrow} : ${b === "tempo" ? lr(y) : "—"}</span>
            </div>
          </div>
          ${b === "tempo" && m && typeof m == "object" ? _`
                <div class="tempo-days">
                  <div class="tempo-day tempo-blue">
                    ${t.tempoDayBlue} : ${m.blue?.remaining ?? 0}/${(m.blue?.elapsed ?? 0) + (m.blue?.remaining ?? 0)}
                  </div>
                  <div class="tempo-day tempo-white">
                    ${t.tempoDayWhite} : ${m.white?.remaining ?? 0}/${(m.white?.elapsed ?? 0) + (m.white?.remaining ?? 0)}
                  </div>
                  <div class="tempo-day tempo-red">
                    ${t.tempoDayRed} : ${m.red?.remaining ?? 0}/${(m.red?.elapsed ?? 0) + (m.red?.remaining ?? 0)}
                  </div>
                </div>
              ` : f}
        </div>

        <hub-power-now
          .i18n=${t}
          .data=${Se}
          @hub-power-now-toggle=${() => this._togglePowerGraph()}
        ></hub-power-now>
        ${this._renderPowerGraph(t, e)}
        <hub-energie-battery-bar .i18n=${t} .data=${ke} .numberLocale=${e}></hub-energie-battery-bar>
        <hub-insight-bar .i18n=${t} .totalMaison=${S} .originGrid=${$} .totalEur=${c} .ecoTotal=${O}></hub-insight-bar>
        ${this._renderRedHpWarning(a, b, S, g, t)}

        <section>
          <div class="section-head">
            <h3>Consommation</h3>
            <div class="section-metric">${t.totalEnergy} <b>${tr(S)}</b></div>
          </div>
          <div class="bars">
            <hub-energy-strip
              .title=${t.consStripGridTitle}
              .segments=${pe}
              .total=${E}
              .formatter=${K}
              .tooltip=${P.map((s) => `${N(s.id, b)}: ${K(s.v)}`).join(" · ")}
              .breakdown=${he}
              .showBreakdown=${!0}
              .displayValue=${K(E)}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>

            <hub-energy-strip
              .title=${t.consStripHomeTitle}
              .segments=${ue}
              .total=${$t}
              .formatter=${ct}
              .tooltip=${kt.map((s) => `${s.label}: ${ct(s.v)}`).join(" · ")}
              .breakdown=${ge}
              .showBreakdown=${!0}
              .displayValue=${ct($t)}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>

            <hub-energy-strip
              .title=${t.consStripBattTitle}
              .segments=${be}
              .total=${xt}
              .formatter=${dt}
              .tooltip=${L.map((s) => `${s.label}: ${dt(s.v)}`).join(" · ")}
              .breakdown=${me}
              .showBreakdown=${!0}
              .displayValue=${dt(xt)}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>
          </div>
        </section>

        <section>
          <div class="bars">
            <hub-energy-strip
              .title=${t.costStripTitle}
              .segments=${fe}
              .total=${c}
              .formatter=${(s) => `${Number(s).toFixed(2)} €`}
              .tooltip=${[
      ...H.map((s) => `${N(s.id, b)}: ${s.v.toFixed(2)} €${s.tooltip ? ` (${s.tooltip})` : ""}`),
      ...l > 5e-4 ? [`${t.costSubscription}: ${l.toFixed(2)} €`] : []
    ].join(" · ")}
              .breakdown=${_e}
              .showBreakdown=${!0}
              .displayValue=${`${c.toFixed(2)} €`}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>
          </div>
        </section>

        <section>
          <div class="bars">
            <hub-energy-strip
              .title=${t.ecoStripTitle}
              .segments=${xe}
              .total=${$e}
              .formatter=${(s) => `${Number(s).toFixed(2)} €`}
              .tooltip=${q.map((s) => `${s.label}: ${s.fmt}`).join(" · ")}
              .breakdown=${Lt.length ? Lt : [{ label: "—", value: `${O >= 0 ? "+" : ""}${O.toFixed(2)} €` }]}
              .showBreakdown=${!0}
              .displayValue=${`${O >= 0 ? "+" : ""}${O.toFixed(2)} €`}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>
          </div>
        </section>

        <section>
          <div class="bars">
            <hub-energy-strip
              .title=${t.reinjStripTitle}
              .segments=${we}
              .total=${At}
              .formatter=${pt}
              .tooltip=${Q.map((s) => `${s.label}: ${pt(s.v)} · ${s.eur.toFixed(2)} €`).join(" · ")}
              .breakdown=${ye}
              .showBreakdown=${!0}
              .displayValue=${`${pt(At)} · ${u.oppTotalEur.toFixed(2)} €`}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>
          </div>
        </section>

        ${this._showRaw ? _`
              <section>
                <h3>Données brutes</h3>
                <div class="raw">
                  <div class="raw-grid">
                    <div>
                      <b>Réseau / Maison</b>
                      Réseau total : ${E.toFixed(3)} kWh<br />
                      Maison total : ${S.toFixed(3)} kWh
                    </div>
                    <div>
                      <b>Coût</b>
                      Total : ${c.toFixed(3)} €<br />
                      Abonnement : ${l.toFixed(3)} €
                    </div>
                    <div>
                      <b>Origine</b>
                      Réseau : ${$.toFixed(3)} kWh<br />
                      Solaire : ${C(this._states(), this._map().originSolar).toFixed(3)} kWh
                    </div>
                    <div>
                      <b>Économies</b>
                      Solaire : ${p.toFixed(3)} €<br />
                      Batterie : ${h.toFixed(3)} €
                    </div>
                    <div>
                      <b>Import par créneau</b>
                      ${P.length > 0 ? P.map((s, F) => _`${F > 0 ? _`<br />` : f}${N(s.id, b)}: ${s.v.toFixed(3)} kWh`) : "—"}
                    </div>
                    <div>
                      <b>Coût par créneau</b>
                      ${H.length > 0 ? H.map((s, F) => _`${F > 0 ? _`<br />` : f}${N(s.id, b)}: ${s.v.toFixed(3)} €`) : "—"}
                    </div>
                    <div>
                      <b>Usage détaillé (kWh)</b>
                      Réseau direct (maison) : ${g.gridDirect.v.toFixed(3)}<br />
                      Réseau → charge batterie : ${g.gridBatt.v.toFixed(3)}<br />
                      Solaire (maison) : ${g.solarDirect.v.toFixed(3)}<br />
                      Solaire → charge batterie : ${g.solarBatt.v.toFixed(3)}<br />
                      Batterie → maison : ${g.battHome.v.toFixed(3)}
                    </div>
                    <div>
                      <b>Charge batt (réseau) par créneau</b>
                      ${this._renderSlotMapRaw(A, b)}
                    </div>
                    <div>
                      <b>Charge batt (solaire) par créneau</b>
                      ${this._renderSlotMapRaw(B, b)}
                    </div>
                    <div>
                      <b>Réinjection par cause</b>
                      Surplus PV : ${u.solarSurplus.toFixed(3)} kWh / ${u.oppSolarEur.toFixed(3)} €<br />
                      Batt pleine/absente : ${u.batteryFull.toFixed(3)} kWh / ${u.oppBatteryEur.toFixed(3)} €<br />
                      Latence batt : ${u.switchLatency.toFixed(3)} kWh / ${u.oppLatencyEur.toFixed(3)} €<br />
                      Autre : ${u.unattributed.toFixed(3)} kWh / ${u.oppOtherEur.toFixed(3)} €<br />
                      Total : ${Ae.toFixed(3)} kWh / ${u.oppTotalEur.toFixed(3)} €
                    </div>
                  </div>
                </div>
              </section>
            ` : f}
      </ha-card>
    `;
  }
}
const br = "2026.04.01-1";
console.log("[hub-energie-card]", br);
customElements.get("hub-energie-card") || customElements.define("hub-energie-card", gr);
window.customCards ??= [];
window.customCards.push({
  type: "hub-energie-card",
  name: "Hub Énergie",
  description: "Daily energy, cost and savings. Config: cost_entity: sensor.hub_energie_cost_detail",
  preview: !1,
  documentationURL: "https://github.com/"
});
