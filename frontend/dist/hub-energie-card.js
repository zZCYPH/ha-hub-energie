const jt = globalThis, le = jt.ShadowRoot && (jt.ShadyCSS === void 0 || jt.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ce = /* @__PURE__ */ Symbol(), ge = /* @__PURE__ */ new WeakMap();
let Pe = class {
  constructor(t, e, r) {
    if (this._$cssResult$ = !0, r !== ce) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (le && t === void 0) {
      const r = e !== void 0 && e.length === 1;
      r && (t = ge.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), r && ge.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Ie = (a) => new Pe(typeof a == "string" ? a : a + "", void 0, ce), Et = (a, ...t) => {
  const e = a.length === 1 ? a[0] : t.reduce((r, o, i) => r + ((s) => {
    if (s._$cssResult$ === !0) return s.cssText;
    if (typeof s == "number") return s;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + s + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + a[i + 1], a[0]);
  return new Pe(e, a, ce);
}, We = (a, t) => {
  if (le) a.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const r = document.createElement("style"), o = jt.litNonce;
    o !== void 0 && r.setAttribute("nonce", o), r.textContent = e.cssText, a.appendChild(r);
  }
}, me = le ? (a) => a : (a) => a instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const r of t.cssRules) e += r.cssText;
  return Ie(e);
})(a) : a;
const { is: ze, defineProperty: Ue, getOwnPropertyDescriptor: Ve, getOwnPropertyNames: Ke, getOwnPropertySymbols: Xe, getPrototypeOf: qe } = Object, Ut = globalThis, be = Ut.trustedTypes, Ze = be ? be.emptyScript : "", Je = Ut.reactiveElementPolyfillSupport, Tt = (a, t) => a, ae = { toAttribute(a, t) {
  switch (t) {
    case Boolean:
      a = a ? Ze : null;
      break;
    case Object:
    case Array:
      a = a == null ? a : JSON.stringify(a);
  }
  return a;
}, fromAttribute(a, t) {
  let e = a;
  switch (t) {
    case Boolean:
      e = a !== null;
      break;
    case Number:
      e = a === null ? null : Number(a);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(a);
      } catch {
        e = null;
      }
  }
  return e;
} }, Fe = (a, t) => !ze(a, t), fe = { attribute: !0, type: String, converter: ae, reflect: !1, useDefault: !1, hasChanged: Fe };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), Ut.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let gt = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = fe) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const r = /* @__PURE__ */ Symbol(), o = this.getPropertyDescriptor(t, r, e);
      o !== void 0 && Ue(this.prototype, t, o);
    }
  }
  static getPropertyDescriptor(t, e, r) {
    const { get: o, set: i } = Ve(this.prototype, t) ?? { get() {
      return this[e];
    }, set(s) {
      this[e] = s;
    } };
    return { get: o, set(s) {
      const l = o?.call(this);
      i?.call(this, s), this.requestUpdate(t, l, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? fe;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Tt("elementProperties"))) return;
    const t = qe(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Tt("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Tt("properties"))) {
      const e = this.properties, r = [...Ke(e), ...Xe(e)];
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
      for (const o of r) e.unshift(me(o));
    } else t !== void 0 && e.push(me(t));
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
    return We(t, this.constructor.elementStyles), t;
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
      const i = (r.converter?.toAttribute !== void 0 ? r.converter : ae).toAttribute(e, r.type);
      this._$Em = t, i == null ? this.removeAttribute(o) : this.setAttribute(o, i), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const r = this.constructor, o = r._$Eh.get(t);
    if (o !== void 0 && this._$Em !== o) {
      const i = r.getPropertyOptions(o), s = typeof i.converter == "function" ? { fromAttribute: i.converter } : i.converter?.fromAttribute !== void 0 ? i.converter : ae;
      this._$Em = o;
      const l = s.fromAttribute(e, i.type);
      this[o] = l ?? this._$Ej?.get(o) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, r, o = !1, i) {
    if (t !== void 0) {
      const s = this.constructor;
      if (o === !1 && (i = this[t]), r ??= s.getPropertyOptions(t), !((r.hasChanged ?? Fe)(i, e) || r.useDefault && r.reflect && i === this._$Ej?.get(t) && !this.hasAttribute(s._$Eu(t, r)))) return;
      this.C(t, e, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: r, reflect: o, wrapped: i }, s) {
    r && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, s ?? e ?? this[t]), i !== !0 || s !== void 0) || (this._$AL.has(t) || (this.hasUpdated || r || (e = void 0), this._$AL.set(t, e)), o === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
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
        for (const [o, i] of this._$Ep) this[o] = i;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [o, i] of r) {
        const { wrapped: s } = i, l = this[o];
        s !== !0 || this._$AL.has(o) || l === void 0 || this.C(o, void 0, i, l);
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
gt.elementStyles = [], gt.shadowRootOptions = { mode: "open" }, gt[Tt("elementProperties")] = /* @__PURE__ */ new Map(), gt[Tt("finalized")] = /* @__PURE__ */ new Map(), Je?.({ ReactiveElement: gt }), (Ut.reactiveElementVersions ??= []).push("2.1.2");
const pe = globalThis, we = (a) => a, It = pe.trustedTypes, _e = It ? It.createPolicy("lit-html", { createHTML: (a) => a }) : void 0, Me = "$lit$", Z = `lit$${Math.random().toFixed(9).slice(2)}$`, Ne = "?" + Z, Ye = `<${Ne}>`, nt = document, Gt = () => nt.createComment(""), Ht = (a) => a === null || typeof a != "object" && typeof a != "function", he = Array.isArray, Qe = (a) => he(a) || typeof a?.[Symbol.iterator] == "function", ee = `[ 	
\f\r]`, St = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ye = /-->/g, ve = />/g, rt = RegExp(`>|${ee}(?:([^\\s"'>=/]+)(${ee}*=${ee}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), xe = /'/g, $e = /"/g, De = /^(?:script|style|textarea|title)$/i, Re = (a) => (t, ...e) => ({ _$litType$: a, strings: t, values: e }), v = Re(1), ut = Re(2), bt = /* @__PURE__ */ Symbol.for("lit-noChange"), _ = /* @__PURE__ */ Symbol.for("lit-nothing"), Se = /* @__PURE__ */ new WeakMap(), at = nt.createTreeWalker(nt, 129);
function Oe(a, t) {
  if (!he(a) || !a.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return _e !== void 0 ? _e.createHTML(t) : t;
}
const tr = (a, t) => {
  const e = a.length - 1, r = [];
  let o, i = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", s = St;
  for (let l = 0; l < e; l++) {
    const n = a[l];
    let h, d, p = -1, u = 0;
    for (; u < n.length && (s.lastIndex = u, d = s.exec(n), d !== null); ) u = s.lastIndex, s === St ? d[1] === "!--" ? s = ye : d[1] !== void 0 ? s = ve : d[2] !== void 0 ? (De.test(d[2]) && (o = RegExp("</" + d[2], "g")), s = rt) : d[3] !== void 0 && (s = rt) : s === rt ? d[0] === ">" ? (s = o ?? St, p = -1) : d[1] === void 0 ? p = -2 : (p = s.lastIndex - d[2].length, h = d[1], s = d[3] === void 0 ? rt : d[3] === '"' ? $e : xe) : s === $e || s === xe ? s = rt : s === ye || s === ve ? s = St : (s = rt, o = void 0);
    const m = s === rt && a[l + 1].startsWith("/>") ? " " : "";
    i += s === St ? n + Ye : p >= 0 ? (r.push(h), n.slice(0, p) + Me + n.slice(p) + Z + m) : n + Z + (p === -2 ? l : m);
  }
  return [Oe(a, i + (a[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
};
class At {
  constructor({ strings: t, _$litType$: e }, r) {
    let o;
    this.parts = [];
    let i = 0, s = 0;
    const l = t.length - 1, n = this.parts, [h, d] = tr(t, e);
    if (this.el = At.createElement(h, r), at.currentNode = this.el.content, e === 2 || e === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (o = at.nextNode()) !== null && n.length < l; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const p of o.getAttributeNames()) if (p.endsWith(Me)) {
          const u = d[s++], m = o.getAttribute(p).split(Z), f = /([.?@])?(.*)/.exec(u);
          n.push({ type: 1, index: i, name: f[2], strings: m, ctor: f[1] === "." ? rr : f[1] === "?" ? or : f[1] === "@" ? ir : Vt }), o.removeAttribute(p);
        } else p.startsWith(Z) && (n.push({ type: 6, index: i }), o.removeAttribute(p));
        if (De.test(o.tagName)) {
          const p = o.textContent.split(Z), u = p.length - 1;
          if (u > 0) {
            o.textContent = It ? It.emptyScript : "";
            for (let m = 0; m < u; m++) o.append(p[m], Gt()), at.nextNode(), n.push({ type: 2, index: ++i });
            o.append(p[u], Gt());
          }
        }
      } else if (o.nodeType === 8) if (o.data === Ne) n.push({ type: 2, index: i });
      else {
        let p = -1;
        for (; (p = o.data.indexOf(Z, p + 1)) !== -1; ) n.push({ type: 7, index: i }), p += Z.length - 1;
      }
      i++;
    }
  }
  static createElement(t, e) {
    const r = nt.createElement("template");
    return r.innerHTML = t, r;
  }
}
function ft(a, t, e = a, r) {
  if (t === bt) return t;
  let o = r !== void 0 ? e._$Co?.[r] : e._$Cl;
  const i = Ht(t) ? void 0 : t._$litDirective$;
  return o?.constructor !== i && (o?._$AO?.(!1), i === void 0 ? o = void 0 : (o = new i(a), o._$AT(a, e, r)), r !== void 0 ? (e._$Co ??= [])[r] = o : e._$Cl = o), o !== void 0 && (t = ft(a, o._$AS(a, t.values), o, r)), t;
}
class er {
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
    const { el: { content: e }, parts: r } = this._$AD, o = (t?.creationScope ?? nt).importNode(e, !0);
    at.currentNode = o;
    let i = at.nextNode(), s = 0, l = 0, n = r[0];
    for (; n !== void 0; ) {
      if (s === n.index) {
        let h;
        n.type === 2 ? h = new Ct(i, i.nextSibling, this, t) : n.type === 1 ? h = new n.ctor(i, n.name, n.strings, this, t) : n.type === 6 && (h = new ar(i, this, t)), this._$AV.push(h), n = r[++l];
      }
      s !== n?.index && (i = at.nextNode(), s++);
    }
    return at.currentNode = nt, o;
  }
  p(t) {
    let e = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(t, r, e), e += r.strings.length - 2) : r._$AI(t[e])), e++;
  }
}
class Ct {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, r, o) {
    this.type = 2, this._$AH = _, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = r, this.options = o, this._$Cv = o?.isConnected ?? !0;
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
    t = ft(this, t, e), Ht(t) ? t === _ || t == null || t === "" ? (this._$AH !== _ && this._$AR(), this._$AH = _) : t !== this._$AH && t !== bt && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Qe(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== _ && Ht(this._$AH) ? this._$AA.nextSibling.data = t : this.T(nt.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: r } = t, o = typeof r == "number" ? this._$AC(t) : (r.el === void 0 && (r.el = At.createElement(Oe(r.h, r.h[0]), this.options)), r);
    if (this._$AH?._$AD === o) this._$AH.p(e);
    else {
      const i = new er(o, this), s = i.u(this.options);
      i.p(e), this.T(s), this._$AH = i;
    }
  }
  _$AC(t) {
    let e = Se.get(t.strings);
    return e === void 0 && Se.set(t.strings, e = new At(t)), e;
  }
  k(t) {
    he(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let r, o = 0;
    for (const i of t) o === e.length ? e.push(r = new Ct(this.O(Gt()), this.O(Gt()), this, this.options)) : r = e[o], r._$AI(i), o++;
    o < e.length && (this._$AR(r && r._$AB.nextSibling, o), e.length = o);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const r = we(t).nextSibling;
      we(t).remove(), t = r;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class Vt {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, r, o, i) {
    this.type = 1, this._$AH = _, this._$AN = void 0, this.element = t, this.name = e, this._$AM = o, this.options = i, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = _;
  }
  _$AI(t, e = this, r, o) {
    const i = this.strings;
    let s = !1;
    if (i === void 0) t = ft(this, t, e, 0), s = !Ht(t) || t !== this._$AH && t !== bt, s && (this._$AH = t);
    else {
      const l = t;
      let n, h;
      for (t = i[0], n = 0; n < i.length - 1; n++) h = ft(this, l[r + n], e, n), h === bt && (h = this._$AH[n]), s ||= !Ht(h) || h !== this._$AH[n], h === _ ? t = _ : t !== _ && (t += (h ?? "") + i[n + 1]), this._$AH[n] = h;
    }
    s && !o && this.j(t);
  }
  j(t) {
    t === _ ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class rr extends Vt {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === _ ? void 0 : t;
  }
}
class or extends Vt {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== _);
  }
}
class ir extends Vt {
  constructor(t, e, r, o, i) {
    super(t, e, r, o, i), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = ft(this, t, e, 0) ?? _) === bt) return;
    const r = this._$AH, o = t === _ && r !== _ || t.capture !== r.capture || t.once !== r.once || t.passive !== r.passive, i = t !== _ && (r === _ || o);
    o && this.element.removeEventListener(this.name, this, r), i && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class ar {
  constructor(t, e, r) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    ft(this, t);
  }
}
const sr = pe.litHtmlPolyfillSupport;
sr?.(At, Ct), (pe.litHtmlVersions ??= []).push("3.3.2");
const nr = (a, t, e) => {
  const r = e?.renderBefore ?? t;
  let o = r._$litPart$;
  if (o === void 0) {
    const i = e?.renderBefore ?? null;
    r._$litPart$ = o = new Ct(t.insertBefore(Gt(), i), i, void 0, e ?? {});
  }
  return o._$AI(a), o;
};
const de = globalThis;
class X extends gt {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = nr(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return bt;
  }
}
X._$litElement$ = !0, X.finalized = !0, de.litElementHydrateSupport?.({ LitElement: X });
const lr = de.litElementPolyfillSupport;
lr?.({ LitElement: X });
(de.litElementVersions ??= []).push("4.2.2");
const ke = Object.freeze({
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
}), Te = "#9e9e9e", cr = "#8d6e63", Bt = "#7e57c2", ot = "#fdd835", it = "#66bb6a", st = Object.freeze([
  { id: "bleu_hc", label: "Blue HC", color: "#1e88e5" },
  { id: "bleu_hp", label: "Blue HP", color: "#1e88e5" },
  { id: "blanc_hc", label: "White HC", color: "#b0bec5" },
  { id: "blanc_hp", label: "White HP", color: "#b0bec5" },
  { id: "rouge_hc", label: "Red HC", color: "#e53935" },
  { id: "rouge_hp", label: "Red HP", color: "#e53935" },
  { id: "unknown", label: "Unknown", color: "#78909c" }
]), Kt = "Europe/Paris";
function je(a = /* @__PURE__ */ new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: Kt,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(a);
}
const L = () => je();
function K(a) {
  const t = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(a));
  if (!t) return /* @__PURE__ */ new Date(NaN);
  const e = `${t[1]}-${t[2]}-${t[3]}`, r = Number(t[1]), o = Number(t[2]), i = Number(t[3]), s = Date.UTC(r, o - 1, i - 1, 18, 0, 0), l = Date.UTC(r, o - 1, i + 1, 6, 0, 0), n = new Intl.DateTimeFormat("en-CA", {
    timeZone: Kt,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  for (let h = s; h <= l; h += 6e4) {
    const d = n.formatToParts(new Date(h)), p = (m) => d.find((f) => f.type === m)?.value ?? "";
    if (`${p("year")}-${p("month")}-${p("day")}` === e && p("hour") === "00" && p("minute") === "00" && p("second") === "00")
      return new Date(h);
  }
  return /* @__PURE__ */ new Date(NaN);
}
function Wt(a, t) {
  const e = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(a));
  if (!e) return L();
  const r = Number(e[1]), o = Number(e[2]), i = Number(e[3]);
  return new Date(Date.UTC(r, o - 1, i + t)).toISOString().slice(0, 10);
}
function pr(a) {
  const t = K(a).getTime();
  if (!Number.isFinite(t)) return 0;
  const e = new Intl.DateTimeFormat("en-GB", {
    timeZone: Kt,
    weekday: "short"
  }).format(new Date(t));
  return { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }[e] ?? 0;
}
const hr = (a) => je(new Date(a));
function dr(a, t) {
  const r = /^\d{4}-\d{2}-\d{2}$/.test(String(a)) ? String(a) : L();
  let o;
  if (t === "week") {
    const i = pr(r);
    o = Wt(r, -i);
  } else t === "month" ? o = `${r.slice(0, 7)}-01` : t === "year" ? o = `${r.slice(0, 4)}-01-01` : o = r;
  return { startIso: o, endIso: r };
}
function re(a, t) {
  const e = K(a);
  return Number.isFinite(e.getTime()) ? e.toLocaleDateString(t, {
    timeZone: Kt,
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }) : String(a);
}
function ur(a, t, e) {
  return a === t ? re(t, e) : `${re(a, e)} - ${re(t, e)}`;
}
const z = (a, t) => {
  const e = parseFloat(a?.[t]?.state);
  return Number.isFinite(e) ? e : 0;
}, I = (a, t, e) => {
  const r = parseFloat(a?.[t]?.attributes?.[e]);
  return Number.isFinite(r) ? r : 0;
}, M = (a, t, e) => {
  const r = a?.[t]?.attributes?.[e];
  if (r == null || r === "") return null;
  const o = Number(r);
  return Number.isFinite(o) ? o : null;
}, F = (a) => {
  const t = Number(a);
  if (!Number.isFinite(t)) return "—";
  const e = Math.abs(t);
  return e >= 1e3 ? `${(t / 1e3).toFixed(e >= 1e4 ? 0 : 1)} kW` : `${Math.round(t)} W`;
}, gr = (a) => {
  const t = Number(a), e = Number.isFinite(t) ? t : 0;
  return e < 1 ? `${Math.round(e * 1e3)} Wh` : `${e.toFixed(2)} kWh`;
}, Rt = (a) => {
  const e = (a ?? []).map((r) => Number(r)).filter((r) => Number.isFinite(r)).some((r) => r >= 1);
  return (r) => {
    const o = Number(r), i = Number.isFinite(o) ? o : 0;
    return e ? `${i.toFixed(2)} kWh` : `${Math.round(i * 1e3)} Wh`;
  };
}, mr = {
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
function br(a) {
  const t = String(a ?? "").toLowerCase();
  for (const [e, r] of Object.entries(mr))
    if (t.includes(e)) return r;
  return null;
}
function fr(a) {
  const t = String(a ?? "").toLowerCase();
  return /\b(bleu|blanc|rouge)\b/.test(t) || /\b(hc|hp)\b/.test(t);
}
function wr(a) {
  const t = String(a ?? "").toLowerCase();
  return t.includes(" hc") || t.endsWith("hc") || t.includes("heures creuses") || t.includes("off-peak");
}
function _r(a) {
  const e = String(a ?? "").trim().match(/^#([0-9a-f]{6})$/i);
  if (!e) return !1;
  const r = e[1], o = parseInt(r.slice(0, 2), 16), i = parseInt(r.slice(2, 4), 16), s = parseInt(r.slice(4, 6), 16);
  return (0.2126 * o + 0.7152 * i + 0.0722 * s) / 255 >= 0.68;
}
function Be(a) {
  const t = Math.max(0, Math.round(a)), e = Math.floor(t / 60), r = t % 60;
  return `${e}h ${r}min`;
}
const Ge = Object.freeze([
  ...st.map((a) => `${a.id}_eur`),
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
]), He = Object.freeze([
  "grid_by_slot_kwh",
  "maison_by_slot_kwh"
]);
function yr(a) {
  const t = a;
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
function oe(a, t) {
  if (!a || typeof a != "object") return 0;
  const e = a[t], r = typeof e == "number" ? e : parseFloat(e);
  return Number.isFinite(r) ? r : 0;
}
function ie(a, t) {
  return !!a?.[t];
}
function vr(a) {
  return a === "hphc" ? "HP/HC" : a === "base" ? "BASE" : "TEMPO";
}
function j(a, t, e) {
  const r = e?.emDash ?? "—";
  return a ? t === "base" ? e?.slotBase ?? "Base" : t === "hphc" ? a.endsWith("_hc") ? e?.slotHc ?? "HC" : e?.slotHp ?? "HP" : {
    bleu_hc: e?.slotBleuHc,
    bleu_hp: e?.slotBleuHp,
    blanc_hc: e?.slotBlancHc,
    blanc_hp: e?.slotBlancHp,
    rouge_hc: e?.slotRougeHc,
    rouge_hp: e?.slotRougeHp,
    unknown: e?.slotUnknown
  }[a] ?? a : r;
}
function xr(a, t) {
  const e = String(a ?? "").toLowerCase();
  return e.includes("blue") || e.includes("bleu") ? t?.tempoDayBlue ?? "Blue" : e.includes("white") || e.includes("blanc") ? t?.tempoDayWhite ?? "White" : e.includes("red") || e.includes("rouge") ? t?.tempoDayRed ?? "Red" : e === "n/a" ? t?.dayColorNA ?? "N/A" : e || (t?.emDash ?? "—");
}
function Ae(a) {
  const t = String(a ?? "").toLowerCase();
  return t.includes("blue") || t.includes("bleu") ? "color-blue" : t.includes("white") || t.includes("blanc") ? "color-white" : t.includes("red") || t.includes("rouge") ? "color-red" : "color-na";
}
function Ee(a, t, e) {
  return !t || typeof t != "object" ? [] : st.map((r) => {
    const o = t[r.id], i = typeof o == "number" ? o : parseFloat(o);
    return !Number.isFinite(i) || i <= 1e-4 ? null : {
      label: j(r.id, a, e),
      v: i,
      color: r.color,
      isHc: r.id.endsWith("_hc")
    };
  }).filter(Boolean);
}
function Ot(a) {
  return !a || typeof a != "object" ? "" : st.map((t) => {
    const e = a[t.id], r = typeof e == "number" ? e : parseFloat(e);
    return `${t.id}:${Number.isFinite(r) ? r : 0}`;
  }).join(",");
}
function zt(...a) {
  const t = /* @__PURE__ */ new Set();
  for (const e of a)
    for (const r of e) t.add(r);
  return [...t].sort((e, r) => e - r);
}
function J(a, t) {
  let e = 0, r = null;
  const o = [];
  for (const i of t) {
    for (; e < a.length && a[e].ts <= i; )
      r = a[e].w, e++;
    o.push(r);
  }
  return o;
}
function $r(a) {
  if (typeof a == "number" && Number.isFinite(a)) return a;
  if (typeof a == "string") {
    const t = Date.parse(a);
    return Number.isFinite(t) ? t : NaN;
  }
  return NaN;
}
function mt(a, t = {}) {
  const e = !!t.allowNegative;
  if (!Array.isArray(a) || !a.length) return [];
  const r = [];
  for (const o of a) {
    const i = $r(o?.start), s = o?.mean ?? o?.state ?? o?.min ?? o?.max;
    if (!Number.isFinite(i) || s == null) continue;
    const l = parseFloat(s);
    if (!Number.isFinite(l)) continue;
    const n = e ? l : Math.max(0, l);
    r.push({ ts: i, w: n });
  }
  return r.sort((o, i) => o.ts - i.ts), r;
}
function Sr(a) {
  if (!a || typeof a != "object") return [];
  const t = /* @__PURE__ */ new Set(), e = [], r = (o) => {
    if (o == null || typeof o != "string") return;
    const i = o.trim();
    !i || t.has(i) || (t.add(i), e.push(i));
  };
  for (const o of a.grid_entities ?? [])
    typeof o == "string" && r(o);
  r(a.solar_entity);
  for (const o of a.batteries ?? [])
    o?.mode === "net" ? r(o.entity) : o?.mode === "in_out" && (r(o.in), r(o.out));
  return r(a.load_entity), e;
}
async function kr(a, { startTimeIso: t, endTimeIso: e, statisticIds: r, period: o = "5minute" }) {
  const i = a?.connection;
  if (!i?.sendMessagePromise)
    throw new Error("Home Assistant WebSocket not available");
  const s = await i.sendMessagePromise({
    type: "recorder/statistics_during_period",
    start_time: t,
    end_time: e,
    statistic_ids: r,
    period: o,
    types: ["mean", "state"]
  });
  if (s && typeof s == "object" && s.success === !1)
    throw new Error(s.error?.message ?? "recorder/statistics_during_period failed");
  if (s && typeof s == "object" && "result" in s && s.result !== void 0 && !Array.isArray(s.result)) {
    const l = s.result;
    if (l && typeof l == "object") return l;
  }
  return s;
}
function Tr(a, t) {
  const e = a.grid_entities;
  if (!Array.isArray(e) || !e.length) return [];
  const r = [];
  for (const s of e) {
    const l = typeof s == "string" ? s.trim() : "";
    l && r.push(mt(t[l], { allowNegative: !0 }));
  }
  if (!r.length) return [];
  const o = zt(...r.map((s) => s.map((l) => l.ts)));
  let i = o.map(() => 0);
  for (const s of r) {
    const l = J(s, o);
    i = i.map((n, h) => n + (l[h] ?? 0));
  }
  return o.map((s, l) => ({ ts: s, w: i[l] }));
}
function Br(a, t) {
  const e = a.batteries ?? [];
  if (!Array.isArray(e) || !e.length) return [];
  const r = [];
  for (const s of e)
    if (s?.mode === "net" && s.entity) {
      const l = String(s.entity), n = mt(t[l], { allowNegative: !0 }).map((h) => {
        const d = s.net_sign === "positive_charge" ? -h.w : h.w;
        return { ts: h.ts, w: d };
      });
      r.push(n);
    } else if (s?.mode === "in_out") {
      const l = s.in ? String(s.in) : "", n = s.out ? String(s.out) : "", h = l ? mt(t[l]) : [], d = n ? mt(t[n]) : [], p = zt(
        h.map((f) => f.ts),
        d.map((f) => f.ts)
      );
      if (!p.length) {
        r.push([]);
        continue;
      }
      const u = h.length ? J(h, p) : p.map(() => null), m = d.length ? J(d, p) : p.map(() => null);
      r.push(
        p.map((f, g) => ({
          ts: f,
          w: (m[g] ?? 0) - (u[g] ?? 0)
        }))
      );
    }
  if (!r.length) return [];
  const o = zt(...r.map((s) => s.map((l) => l.ts)));
  let i = o.map(() => 0);
  for (const s of r) {
    if (!s.length) continue;
    const l = J(s, o);
    i = i.map((n, h) => n + (l[h] ?? 0));
  }
  return o.map((s, l) => ({ ts: s, w: i[l] }));
}
function Gr(a, t) {
  if (!a || typeof a != "object" || !t || typeof t != "object") return null;
  const e = typeof a.solar_entity == "string" ? a.solar_entity.trim() : "", r = typeof a.load_entity == "string" ? a.load_entity.trim() : "", o = Tr(a, t), i = e ? mt(t[e]) : [], s = Br(a, t), l = r ? mt(t[r]) : [], n = zt(
    o.map((w) => w.ts),
    i.map((w) => w.ts),
    s.map((w) => w.ts),
    l.map((w) => w.ts)
  );
  if (!n.length) return null;
  const h = o.length ? J(o, n) : n.map(() => null), d = i.length ? J(i, n) : n.map(() => null), p = s.length ? J(s, n) : n.map(() => null), u = l.length ? J(l, n) : n.map(() => null), m = n.map((w, y) => ({
    ts: w,
    grid: h[y],
    solar: d[y],
    batt: p[y],
    load: u[y]
  }));
  if (!m.some((w) => w.grid != null || w.solar != null || w.batt != null || w.load != null))
    return null;
  let f = 0, g = 0, E = 0, $ = l.length ? 0 : null;
  const H = [];
  for (const w of m)
    w.grid != null && (f = w.grid), w.solar != null && (g = w.solar), w.batt != null && (E = w.batt), l.length && w.load != null && ($ = w.load), H.push({ ts: w.ts, grid: f, solar: g, batt: E, load: l.length ? $ : null });
  return { filled: H };
}
function Hr(a) {
  let t = 0, e = 1;
  for (const r of a) {
    const o = [];
    r.load != null && Number.isFinite(r.load) && o.push(r.load), r.solar != null && Number.isFinite(r.solar) && o.push(r.solar);
    const i = r.batt;
    i != null && Number.isFinite(i) && o.push(Math.max(0, i), Math.max(0, -i)), r.grid != null && Number.isFinite(r.grid) && o.push(r.grid);
    for (const s of o)
      t = Math.min(t, s), e = Math.max(e, s);
  }
  return e - t < 1 && (e = t + 1), { yMin: t, yMax: e };
}
function Ce(a, t) {
  if (!a?.states || !t || typeof t != "object") return null;
  const e = a.states, r = (m) => {
    if (m == null || typeof m != "string") return null;
    const f = m.trim();
    if (!f || !e[f]) return null;
    const g = parseFloat(e[f].state);
    return Number.isFinite(g) ? g : null;
  };
  let o = 0, i = 0;
  for (const m of t.grid_entities ?? []) {
    if (typeof m != "string") continue;
    const f = r(m);
    f != null && (o += f, i++);
  }
  const s = typeof t.solar_entity == "string" ? t.solar_entity.trim() : "", l = s ? r(s) : null, n = l != null ? Math.max(0, l) : null, h = typeof t.load_entity == "string" ? t.load_entity.trim() : "", d = h ? r(h) : null;
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
  return !i && n == null && !u && d == null ? null : {
    solar: n,
    batt: u > 0 ? p : null,
    grid: i > 0 ? o : null,
    load: d
  };
}
function Le(a, t) {
  if (!a?.length) return [];
  if (!t) return a;
  const e = a[a.length - 1], o = {
    ts: Math.max(Date.now(), e.ts + 1),
    solar: t.solar != null ? t.solar : e.solar ?? 0,
    batt: t.batt != null ? t.batt : e.batt ?? 0,
    grid: t.grid != null ? t.grid : e.grid ?? 0,
    load: t.load != null ? t.load : e.load != null ? e.load : null
  };
  return [...a, o];
}
class Ar extends X {
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
    return Et`
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
    const e = (t ?? []).filter((o) => Number(o?.value) > 1e-3), r = e.reduce((o, i) => o + Number(i.value), 0) || 1;
    return e.map((o) => v`
      <span
        class="fill-seg ${o.className ?? ""}"
        style="width:${(Number(o.value) / r * 100).toFixed(1)}%;background-color:${o.color}"
      ></span>
    `);
  }
  _renderBreakdown() {
    const t = this.breakdown ?? [];
    if (!this.showBreakdown || !t.length) return _;
    const e = Number(this.total) || 0;
    return v`
      <div class="icon-brk">
        ${t.map((r) => {
      const o = r.icon ?? (fr(r.label) ? "mdi:transmission-tower" : br(r.label)), i = _r(r.color) ? "swatch-icon-dark" : "";
      return v`
            <span class="icon-brk-item">
              ${r.color ? v`<span
                    class="icon-brk-swatch ${wr(r.label) ? "fill-hc" : ""} ${i}"
                    style="background-color:${r.color}"
                  >
                    ${o ? v`<ha-icon icon=${o}></ha-icon>` : _}
                  </span>` : o ? v`<ha-icon icon=${o}></ha-icon>` : _}
              <span>${r.label}</span>&nbsp;<b>${r.value}</b>
              ${e > 0 && r.rawV != null ? v`<span class="icon-brk-pct">(${Math.round(Number(r.rawV) / e * 100)}%)</span>` : _}
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
        <div class="bar-wrap" title=${this.tooltip || _}>
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
customElements.get("hub-energy-strip") || customElements.define("hub-energy-strip", Ar);
class Er extends X {
  static get properties() {
    return {
      i18n: { attribute: !1 },
      data: { attribute: !1 },
      /** When true, power history panel is open (for aria-expanded). */
      graphOpen: { type: Boolean }
    };
  }
  static get styles() {
    return Et`
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
    if (t == null) return _;
    const e = t.gridSigned != null ? Math.max(0, t.gridSigned) : 0, r = [];
    t.gridSigned != null && e > 0 && r.push({ w: e, c: Bt, t: `${this.i18n.segImport} +${F(e)}` }), t.battDis != null && t.battDis > 0 && r.push({ w: t.battDis, c: it, t: `${this.i18n.segBattDis} +${F(t.battDis)}` }), t.solar != null && t.solar > 0 && r.push({ w: t.solar, c: ot, t: `${this.i18n.segSolar} ${F(t.solar)}` });
    const o = r.reduce((d, p) => d + p.w, 0), i = t.gridSigned != null ? F(t.gridSigned) : t.exportW != null && t.exportW > 0 ? F(-t.exportW) : "—", s = t.solar != null ? F(t.solar) : "—", l = t.battDis != null || t.battChg != null ? (t.battDis ?? 0) - (t.battChg ?? 0) : null, n = l != null ? F(l) : "—", h = t.load != null ? F(t.load) : "—";
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
            ${o > 1 ? r.map((d) => v`
                  <span
                    class="pnl-seg"
                    style="width:${(d.w / o * 100).toFixed(1)}%;background:${d.c}"
                    title=${d.t}
                  ></span>
                `) : v`<span
                  class="pnl-seg"
                  style="width:100%;background:color-mix(in srgb, var(--divider-color) 85%, transparent)"
                  title="—"
                ></span>`}
          </div>
          <div class="pnl-load-overlay">${h} ${this.i18n.loadConsumed}</div>
        </div>
        <div class="icon-brk">
          <span class="icon-brk-item">
            <span class="icon-brk-swatch" style="background-color:${Bt}">
              <ha-icon icon="mdi:transmission-tower"></ha-icon>
            </span>
            <span>${this.i18n.colGrid}</span>&nbsp;<b>${i}</b>
          </span>
          <span class="icon-brk-item">
            <span class="icon-brk-swatch" style="background-color:${ot}">
              <ha-icon icon="mdi:weather-sunny"></ha-icon>
            </span>
            <span>${this.i18n.colSolar}</span>&nbsp;<b>${s}</b>
          </span>
          <span class="icon-brk-item" title=${this.i18n.colBattTip || _}>
            <span class="icon-brk-swatch" style="background-color:${it}">
              <ha-icon icon="mdi:battery"></ha-icon>
            </span>
            <span>${this.i18n.colBatt}</span>&nbsp;<b>${n}</b>
          </span>
        </div>
      </div>
    `;
  }
}
customElements.get("hub-power-now") || customElements.define("hub-power-now", Er);
class Cr extends X {
  static get properties() {
    return {
      i18n: { attribute: !1 },
      data: { attribute: !1 },
      numberLocale: { type: String, attribute: "number-locale" }
    };
  }
  static get styles() {
    return Et`
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
          time: Be(r / o * 60)
        };
    } else if (t.dischargeW != null && t.dischargeW > 0) {
      const e = t.capacity * (t.soc ?? 0) / 100, r = t.dischargeW / 1e3;
      if (r > 0)
        return {
          icon: "mdi:battery-low",
          time: Be(e / r * 60)
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
    if (!t || t.soc == null || t.capacity == null || t.capacity <= 0) return _;
    const e = Math.max(0, Math.min(100, Number(t.socMin ?? 0)));
    let r = Math.max(e, Math.min(100, Number(t.socMax ?? 100)));
    const o = Math.max(0, Math.min(100, Number(t.soc))), i = Math.min(r, Math.max(e, o));
    let s = i;
    const l = t.capacity, n = t.available;
    if (n != null && Number.isFinite(n) && l > 0) {
      const y = e + n / l * 100;
      s = Math.min(Math.max(y, e), i, r);
    }
    const h = n != null && Number.isFinite(n) ? n : l * Math.max(0, i - e) / 100, d = Math.round(o).toLocaleString(this.numberLocale ?? "fr-FR"), p = `${this._fmtKwh(h)} / ${this._fmtKwh(l)} kWh (${d} %)`, u = this._flowMode(t), m = u === "charging" ? "batt-green--charging" : u === "discharging" ? "batt-green--discharging" : "", f = 18, g = 100 / f, E = (y) => Math.max(0, Math.min(1, y)), $ = (y, k, x, b) => Math.max(0, Math.min(k, b) - Math.max(y, x)), H = Array.from({ length: f }, (y, k) => {
      const x = k * g, b = (k + 1) * g, S = $(x, b, x, e) / g * 100, N = $(x, b, r, b) / g * 100, P = Math.max(x, e), T = Math.min(b, s, r), G = $(x, b, P, T) / g * 100, C = E((P - x) / g) * 100, A = `--hatch-l:${S.toFixed(3)};--hatch-r:${N.toFixed(3)};--fill-x:${C.toFixed(
        3
      )};--fill-w:${G.toFixed(3)};`;
      return v`<div class="batt-cell" style="${A}">
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
            <div class="batt-segments ${m}">${H}</div>
          </div>
          <div class="batt-bar-total">
            <div class="batt-bar-stack">
              <div class="batt-bar-row-main">
                <span class="batt-bar-total-text">${p}</span>
              </div>
              ${w ? v`<div class="batt-bar-eta-inline">
                    <ha-icon class="batt-eta-icon" icon=${w.icon}></ha-icon>
                    <span>${w.time}</span>
                  </div>` : _}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.get("hub-energie-battery-bar") || customElements.define("hub-energie-battery-bar", Cr);
class Lr extends X {
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
    return Et`
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
    if (!(this.totalMaison > 0)) return _;
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
customElements.get("hub-insight-bar") || customElements.define("hub-insight-bar", Lr);
function R(a, t) {
  let e = String(a);
  for (const [r, o] of Object.entries(t))
    e = e.split(`{${r}}`).join(String(o));
  return e;
}
const se = [24, 12, 6, 3, 1], ne = 6, Pr = 100, Fr = 12, Mr = 168;
function kt(a) {
  if (!Number.isFinite(a)) return ne;
  const t = Math.trunc(a);
  return se.includes(t) ? t : se.reduce(
    (e, r) => Math.abs(r - t) < Math.abs(e - t) ? r : e,
    ne
  );
}
function Nr(a, t, e, r) {
  const o = Math.max(0, Number(t) || 0), i = Math.max(0, Number(e) || 0), s = Math.max(0, Number(r) || 0), l = Math.max(0, Number(a) || 0);
  if (l < 1e-6) return { b: 0, g: 0, s: 0 };
  const n = i + o + s;
  if (n > l + 1e-6) {
    const m = l / n;
    return { b: i * m, g: o * m, s: s * m };
  }
  let h = Math.min(i, l), d = l - h, p = Math.min(o, d);
  d -= p;
  let u = Math.min(s, d);
  return d -= u, d > 1 && (u += d), { b: h, g: p, s: u };
}
function Dr(a) {
  const t = a.length, e = new Array(t), r = new Array(t), o = new Array(t);
  for (let i = 0; i < t; i++) {
    const s = a[i];
    let n = s.load != null && Number.isFinite(s.load) ? Math.max(0, s.load) : NaN;
    const h = Math.max(0, s.grid ?? 0), d = Math.max(0, s.batt ?? 0), p = Math.max(0, s.solar ?? 0);
    Number.isFinite(n) || (n = h + d + p);
    const u = Nr(n, s.grid ?? 0, s.batt ?? 0, s.solar ?? 0);
    e[i] = u.b, r[i] = u.g, o[i] = u.s;
  }
  return { sliceBatt: e, sliceGrid: r, sliceSolar: o };
}
async function Rr(a, t, e, r, o) {
  const i = /^\d{4}-\d{2}-\d{2}$/.test(String(t)) ? String(t) : L(), s = /^\d{4}-\d{2}-\d{2}$/.test(String(e)) ? String(e) : L();
  let l = K(i), n = K(Wt(s, 1));
  Number.isFinite(l.getTime()) || (l = K(L())), Number.isFinite(n.getTime()) || (n = K(Wt(L(), 1)));
  const h = new URLSearchParams({
    filter_entity_id: r.join(","),
    end_time: n.toISOString()
  }), d = `history/period/${encodeURIComponent(l.toISOString())}?${h}`, p = await a.callApi("GET", d), u = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), E = new Set(r);
  for (const y of Array.isArray(p) ? p : [])
    if (Array.isArray(y))
      for (const k of y) {
        const x = k?.entity_id;
        if (!x || !E.has(x)) continue;
        const b = Date.parse(k?.last_changed ?? k?.last_updated ?? "");
        if (!Number.isFinite(b)) continue;
        const S = hr(b), N = parseFloat(k?.state);
        if (Number.isFinite(N)) {
          u.has(x) || u.set(x, /* @__PURE__ */ new Map());
          const T = u.get(x), G = T.get(S);
          (!G || b >= G.ts) && T.set(S, { ts: b, v: N });
        }
        if (x === o && k?.attributes && typeof k.attributes == "object") {
          for (const T of Ge) {
            const G = parseFloat(k.attributes?.[T]);
            if (!Number.isFinite(G)) continue;
            m.has(T) || m.set(T, /* @__PURE__ */ new Map());
            const C = m.get(T), A = C.get(S);
            (!A || b >= A.ts) && C.set(S, { ts: b, v: G });
          }
          for (const T of He) {
            const G = k.attributes?.[T];
            if (!G || typeof G != "object") continue;
            f.has(T) || f.set(T, /* @__PURE__ */ new Map());
            const C = f.get(T), A = C.get(S);
            (!A || b >= A.ts) && C.set(S, { ts: b, dict: G });
          }
        }
        const P = g.get(x);
        (!P || b > P.ts) && g.set(x, { ts: b, state: k });
      }
  const $ = (y) => [...y?.values() ?? []].reduce((k, x) => k + (x?.v ?? 0), 0), H = (y) => {
    if (!y) return {};
    const k = {};
    for (const x of y.values())
      if (!(!x?.dict || typeof x.dict != "object"))
        for (const [b, S] of Object.entries(x.dict)) {
          const N = typeof S == "number" ? S : parseFloat(S);
          Number.isFinite(N) && (k[b] = (k[b] ?? 0) + N);
        }
    return k;
  }, w = {};
  for (const y of E) {
    const x = { ...g.get(y)?.state?.attributes ?? {} };
    if (y === o) {
      for (const b of Ge) x[b] = $(m.get(b));
      for (const b of He) x[b] = H(f.get(b));
    }
    w[y] = {
      entity_id: y,
      state: String($(u.get(y))),
      attributes: x
    };
  }
  return w;
}
class Or extends X {
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
      _powerGraphHoverIdx: { state: !0 },
      /** Clamped % `left` for tooltip (vs chart wrap); null when not hovering. */
      _powerGraphTooltipXPct: { state: !0 },
      _powerGraphRollingHours: { state: !0 }
    };
  }
  static get styles() {
    return Et`
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
    `;
  }
  constructor() {
    super(), this._config = {}, this._date = L(), this._rangePreset = "day", this._showRaw = !1, this._hist = null, this._histLoading = !1, this._histErr = null, this._prefixCache = null, this.__lastKey = null, this._powerGraphOpen = !1, this._powerGraphLoading = !1, this._powerGraphErr = null, this._powerGraphSeries = null, this._powerGraphHoverIdx = null, this._powerGraphTooltipXPct = null, this._hassRetryTimer = null, this._costMissingSinceMs = null, this._powerGraphPollTimer = null, this._powerGraphLoadId = 0, this._powerGraphRollingHours = ne, this._powerGraphRollingInited = !1;
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
    if (this._clearPowerGraphPollTimer(), !this._powerGraphOpen || !this.hass || (this._date ?? L()) !== L()) return;
    const e = parseFloat(this._config?.power_history_refresh_seconds), r = Number.isFinite(e) && e > 0 ? Math.max(15e3, Math.min(3e5, Math.round(e * 1e3))) : 12e4;
    this._powerGraphPollTimer = window.setInterval(() => {
      this._powerGraphOpen && this.hass && this._loadPowerGraph({ refresh: !0 });
    }, r);
  }
  _setPowerGraphRollingHours(t) {
    const e = kt(t);
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
    if (ie(r, t))
      return this._costMissingSinceMs = null, !1;
    if (e.connected === !1)
      return this._scheduleHassRetry(), !0;
    if ((r && typeof r == "object" ? Object.keys(r).length : 0) === 0)
      return this._scheduleHassRetry(), !0;
    const i = performance.now();
    return this._costMissingSinceMs == null && (this._costMissingSinceMs = i), i - this._costMissingSinceMs < 1800 ? (this._scheduleHassRetry(), !0) : !1;
  }
  setConfig(t) {
    if (this._config = t ?? {}, this._prefixCache = null, this.__lastKey = null, !this._powerGraphRollingInited) {
      const e = parseFloat(this._config?.power_history_hours);
      this._powerGraphRollingHours = kt(Number.isFinite(e) ? e : NaN), this._powerGraphRollingInited = !0;
    }
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
    if (t.has("hass") && t.size === 1 && this.hass)
      try {
        if (this._isLiveMode()) {
          const e = this._map();
          if (!ie(this.hass.states, e.cost))
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
    super.updated(t), (t.has("hass") || t.has("_date") || t.has("_rangePreset")) && this._loadHistory(), this._powerGraphOpen && (t.has("_date") || t.has("_powerGraphRollingHours")) && this.hass && (this._powerGraphSeries = null, this._powerGraphHoverIdx = null, this._powerGraphErr = null, this._loadPowerGraph({ force: !0 }), this._syncPowerGraphPollTimer()), this._powerGraphOpen && this._powerGraphHoverIdx != null && (t.has("_powerGraphHoverIdx") || t.has("_powerGraphSeries") || t.has("_powerGraphOpen") && this._powerGraphOpen) && queueMicrotask(() => this._syncPowerGraphTooltipXFromHover());
  }
  /** Re-apply viewport clamp from hover index after layout / series refresh (tooltip % vs SVG grid). */
  _syncPowerGraphTooltipXFromHover() {
    if (!this._powerGraphOpen || this._powerGraphHoverIdx == null) return;
    const t = this.renderRoot;
    if (!t) return;
    const e = t.querySelector(".power-graph-svg-wrap"), r = e?.querySelector("svg"), o = this._powerGraphDisplaySeries(), i = e?.getBoundingClientRect(), s = r?.getBoundingClientRect();
    if (!o?.pts?.length || !i?.width || !s?.width) return;
    const l = o.pts.length, n = Math.max(0, Math.min(l - 1, this._powerGraphHoverIdx)), h = l <= 1 ? 0.5 : n / Math.max(l - 1, 1), d = s.left + h * s.width, p = this._clampPowerGraphTooltipXPct(i, d);
    this._powerGraphTooltipXPct !== p && (this._powerGraphTooltipXPct = p);
  }
  _i18n() {
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? ke.en : ke.fr;
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
    return yr(this._prefix());
  }
  _getRange() {
    return dr(this._date ?? L(), this._rangePreset ?? "day");
  }
  _isLiveMode() {
    const t = this._getRange();
    return (this._rangePreset ?? "day") === "day" && t.endIso === L();
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
    ], i = e[r.cost]?.attributes ?? {}, s = [
      i.offer ?? "",
      i.contract_power ?? "",
      i.tariff_fetched_at ?? "",
      i.current_slot ?? "",
      this._fingerprintTempoDays(i.tempo_days),
      i.grid_power_signed_w ?? "",
      i.solar_power_w ?? "",
      i.solar_estimate_power_w ?? "",
      i.batt_discharge_power_w ?? "",
      i.batt_charge_power_w ?? "",
      i.load_power_w ?? "",
      i.export_power_w ?? "",
      i.battery_soc_percent ?? "",
      i.battery_capacity_kwh ?? "",
      Ot(i.grid_by_slot_kwh),
      Ot(i.maison_by_slot_kwh),
      Ot(i.usage_grid_batt_charge_by_slot_kwh),
      Ot(i.usage_solar_batt_charge_by_slot_kwh),
      e[r.cost]?.last_updated ?? ""
    ].join("|");
    return `${o.map((l) => e[l]?.state ?? "").join("|")}|${s}`;
  }
  _states() {
    return (this._isLiveMode() ? this.hass?.states : this._hist) ?? {};
  }
  _extract(t) {
    const e = this._states(), r = this._map(), o = e?.[r.cost]?.attributes ?? {}, i = String(o.offer ?? "tempo").toLowerCase(), s = String(o.contract_power ?? ""), l = String(o.current_slot ?? ""), n = o.tempo_days ?? null, h = o.today_color ?? null, d = o.tomorrow_color ?? null, p = {
      solarSurplus: I(e, r.cost, "export_due_to_solar_surplus_kwh"),
      batteryFull: I(e, r.cost, "export_due_to_battery_full_or_absent_kwh"),
      switchLatency: I(e, r.cost, "export_due_to_switch_latency_kwh"),
      unattributed: I(e, r.cost, "export_unattributed_kwh"),
      oppTotalEur: I(e, r.cost, "export_opportunity_cost_total_eur"),
      oppSolarEur: I(e, r.cost, "export_opportunity_cost_solar_surplus_eur"),
      oppBatteryEur: I(e, r.cost, "export_opportunity_cost_battery_full_or_absent_eur"),
      oppLatencyEur: I(e, r.cost, "export_opportunity_cost_switch_latency_eur"),
      oppOtherEur: I(e, r.cost, "export_opportunity_cost_unattributed_eur")
    }, u = o.grid_by_slot_kwh, m = o.maison_by_slot_kwh, f = st.map((S) => ({
      ...S,
      label: j(S.id, i, t),
      v: oe(u, S.id),
      isHc: S.id.endsWith("_hc")
    })), g = st.map((S) => ({
      ...S,
      label: j(S.id, i, t),
      v: oe(m, S.id),
      isHc: S.id.endsWith("_hc")
    })), E = z(e, r.cost), $ = st.map((S) => ({
      ...S,
      label: j(S.id, i, t),
      v: I(e, r.cost, `${S.id}_eur`),
      tooltip: `${oe(u, S.id).toFixed(3)} kWh`,
      isHc: S.id.endsWith("_hc")
    })), H = I(e, r.cost, "abonnement_eur"), w = z(e, r.ecoSolar), y = z(e, r.ecoBatt), k = z(e, r.originGrid), x = z(e, r.originSolar), b = {
      gridDirect: { label: t.usageGridDirect, v: z(e, r.usageGridDirect), color: Bt },
      gridBatt: { label: t.usageGridBatt, v: z(e, r.usageGridBatt), color: cr },
      solarDirect: { label: t.usageSolarDirect, v: z(e, r.usageSolarDirect), color: ot },
      solarBatt: { label: t.usageSolarBatt, v: z(e, r.usageSolarBatt), color: "#fbc02d" },
      battHome: { label: t.usageBattHome, v: z(e, r.usageBattHome), color: it }
    };
    return {
      grid: f,
      maison: g,
      totalEur: E,
      costs: $,
      abo: H,
      ecoSolar: w,
      ecoBatt: y,
      og: k,
      os: x,
      usage: b,
      costEntityOk: !!e[r.cost],
      offer: i,
      contractPower: s,
      currentSlot: l,
      tempoDays: n,
      todayColor: h,
      tomorrowColor: d,
      reinj: p,
      gridBattBySlot: o.usage_grid_batt_charge_by_slot_kwh,
      solarBattBySlot: o.usage_solar_batt_charge_by_slot_kwh
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
    Rr(this.hass, e.startIso, e.endIso, r, t.cost).then((o) => {
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
    const i = this._map().cost;
    if (!i) return;
    if (!e) {
      if (!r && (this._powerGraphLoading || this._powerGraphSeries !== null)) return;
      this._powerGraphLoading = !0, this._powerGraphErr = null, this._powerGraphHoverIdx = null, this._powerGraphTooltipXPct = null;
    }
    let s;
    e ? s = this._powerGraphLoadId : (this._powerGraphLoadId += 1, s = this._powerGraphLoadId);
    const l = this._date ?? L(), n = kt(this._powerGraphRollingHours), h = l === L();
    let d, p, u = !1, m = "day", f = null, g = 24;
    if (h) {
      m = "rolling", f = n, g = n;
      const H = /* @__PURE__ */ new Date();
      p = H, d = new Date(H.getTime() - n * 60 * 60 * 1e3), u = !0;
    } else if (d = K(l), p = K(Wt(l, 1)), !Number.isFinite(d.getTime()) || !Number.isFinite(p.getTime())) {
      !e && this._powerGraphLoadId === s && (this._powerGraphLoading = !1, this._powerGraphErr = this._i18n().noData, this._powerGraphSeries = null);
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
      const H = this.hass.states[i]?.attributes?.power_graph_entity_map, w = H && typeof H == "object" ? H : null, y = Sr(w);
      if (!y.length) {
        !e && this._powerGraphLoadId === s && (this._powerGraphErr = $.powerHistoryNoSensors, this._powerGraphSeries = { ...E });
        return;
      }
      const k = await kr(this.hass, {
        startTimeIso: d.toISOString(),
        endTimeIso: p.toISOString(),
        statisticIds: y,
        period: "5minute"
      });
      if (this._powerGraphLoadId !== s || !this._powerGraphOpen || (this._date ?? L()) !== l || h && kt(this._powerGraphRollingHours) !== n) return;
      const x = Gr(w, k);
      if (!x?.filled?.length) {
        !e && this._powerGraphLoadId === s && (this._powerGraphErr = $.powerHistoryNoStatistics, this._powerGraphSeries = {
          ...E,
          hasLoadEntity: typeof w?.load_entity == "string" && w.load_entity.trim() !== ""
        });
        return;
      }
      const b = x.filled, S = 160, P = ((T) => {
        if (T.length <= S) return T;
        const G = T.length / S, C = [];
        for (let A = 0; A < S; A++)
          C.push(T[Math.floor(A * G)]);
        return C;
      })(b);
      if (this._powerGraphLoadId === s) {
        this._powerGraphSeries = {
          hoursBack: g,
          statsPts: P,
          hasLoadEntity: typeof w?.load_entity == "string" && w.load_entity.trim() !== "",
          useLiveTail: u,
          windowMode: m,
          rollingHours: f,
          dayIso: l
        };
        let T = P.length;
        if (u && w) {
          const G = Ce(this.hass, w);
          T = Le(P, G).length;
        }
        if (this._powerGraphHoverIdx != null && T) {
          const G = T - 1;
          this._powerGraphHoverIdx > G && (this._powerGraphHoverIdx = G);
        }
      }
    } catch (H) {
      !e && this._powerGraphLoadId === s && (this._powerGraphErr = H?.message ?? String(H), this._powerGraphSeries = null);
    } finally {
      !e && this._powerGraphLoadId === s && (this._powerGraphLoading = !1), this.__lastKey = null;
    }
  }
  _togglePowerGraph() {
    const t = !this._powerGraphOpen;
    this._powerGraphOpen = t, this.__lastKey = null, t || (this._powerGraphHoverIdx = null, this._powerGraphTooltipXPct = null, this._clearPowerGraphPollTimer()), t && (this._powerGraphSeries = null, this._powerGraphErr = null, this._loadPowerGraph(), this._syncPowerGraphPollTimer());
  }
  _powerGraphDisplaySeries() {
    if (!this._powerGraphOpen) return null;
    const t = this._powerGraphSeries;
    if (!t?.statsPts?.length) return null;
    const e = t.useLiveTail === !0, o = this._map().cost, i = o ? this.hass?.states[o]?.attributes?.power_graph_entity_map : null, s = i && typeof i == "object" ? i : null, l = e && s && this.hass ? Ce(this.hass, s) : null, n = e ? Le(t.statsPts, l) : t.statsPts, { yMin: h, yMax: d } = Hr(n);
    return {
      hoursBack: t.hoursBack,
      pts: n,
      yMin: h,
      yMax: d,
      hasLoadEntity: t.hasLoadEntity === !0,
      windowMode: t.windowMode ?? "rolling",
      rollingHours: t.rollingHours ?? null,
      dayIso: t.dayIso ?? this._date ?? L(),
      useLiveTail: e
    };
  }
  /**
   * Horizontal center for tooltip: `left: pct%` + translateX(-50%).
   * Keeps the box inside the visual viewport (offsetLeft-aware); pct may go &lt;0 or &gt;100 if needed.
   * @param {DOMRect} wrapRect .power-graph-svg-wrap
   */
  _clampPowerGraphTooltipXPct(t, e) {
    if (!t || t.width <= 0) return 50;
    const r = (e - t.left) / t.width * 100, o = Fr, i = typeof window < "u" ? window : null, s = i?.visualViewport ?? null, l = Number.isFinite(s?.offsetLeft) ? s.offsetLeft : 0, n = s && Number.isFinite(s.width) && s.width > 0 ? s.width : i?.innerWidth ?? 1e9, h = Math.min(
      Mr,
      Math.max(Pr, n * 0.48)
    );
    let d = Math.max(-8, Math.min(108, r)), p = t.left + d / 100 * t.width;
    if (Number.isFinite(n) && n > 2 * (h + o)) {
      const u = l + h + o, m = l + n - h - o;
      p = Math.max(u, Math.min(m, p)), d = (p - t.left) / t.width * 100;
    }
    return Math.round(d * 10) / 10;
  }
  /** @param {SVGSVGElement} el */
  _updatePowerGraphHoverFromClientX(t, e) {
    const r = this._powerGraphDisplaySeries();
    if (!r?.pts?.length) return;
    const o = t.getBoundingClientRect();
    if (o.width <= 0) return;
    const i = (e - o.left) / o.width, s = r.pts.length, l = Math.max(0, Math.min(s - 1, Math.round(i * Math.max(s - 1, 1)))), h = t.closest(".power-graph-svg-wrap")?.getBoundingClientRect(), d = h && h.width > 0 ? this._clampPowerGraphTooltipXPct(h, e) : s <= 1 ? 50 : l / Math.max(s - 1, 1) * 100;
    this._powerGraphHoverIdx !== l && (this._powerGraphHoverIdx = l), this._powerGraphTooltipXPct !== d && (this._powerGraphTooltipXPct = d);
  }
  /** @param {MouseEvent & { currentTarget: SVGSVGElement }} e */
  _onPowerGraphSvgMove(t) {
    this._updatePowerGraphHoverFromClientX(t.currentTarget, t.clientX);
  }
  _onPowerGraphSvgLeave() {
    this._powerGraphHoverIdx != null && (this._powerGraphHoverIdx = null), this._powerGraphTooltipXPct != null && (this._powerGraphTooltipXPct = null);
  }
  /** @param {TouchEvent & { currentTarget: SVGSVGElement }} e */
  _onPowerGraphSvgTouch(t) {
    const e = t.touches?.[0];
    e && this._updatePowerGraphHoverFromClientX(t.currentTarget, e.clientX);
  }
  _onPowerGraphSvgTouchEnd() {
    this._powerGraphHoverIdx != null && (this._powerGraphHoverIdx = null), this._powerGraphTooltipXPct != null && (this._powerGraphTooltipXPct = null);
  }
  _svgAreaPath(t, e, r, o) {
    if (!t?.length || !Number.isFinite(e) || e <= 0) return "";
    const i = t.length, s = [];
    for (let h = 0; h < i; h++) {
      const d = Number(t[h] ?? 0), p = i === 1 ? 0 : h / (i - 1) * r, u = o - Math.max(0, d) / e * o;
      s.push({ x: p, y: u });
    }
    return `${`M ${s[0].x.toFixed(2)} ${s[0].y.toFixed(2)} ${s.slice(1).map((h) => `L ${h.x.toFixed(2)} ${h.y.toFixed(2)}`).join(" ")}`} L ${s[s.length - 1].x.toFixed(2)} ${o.toFixed(2)} L 0 ${o.toFixed(2)} Z`;
  }
  _svgLinePath(t, e, r, o, i) {
    if (!t?.length || !Number.isFinite(e) || !Number.isFinite(r) || r <= e) return "";
    const s = r - e, l = t.length, n = [], h = (p) => l === 1 ? 0 : p / (l - 1) * o, d = (p) => i - (Number(p) - e) / s * i;
    for (let p = 0; p < l; p++) {
      const u = Number(t[p]);
      n.push({ x: h(p), y: d(Number.isFinite(u) ? u : 0) });
    }
    return `M ${n[0].x.toFixed(2)} ${n[0].y.toFixed(2)} ${n.slice(1).map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ")}`;
  }
  /** Closed path: curve (same as line) down to chart bottom (y = h), for area fill. */
  _svgAreaFillUnderLine(t, e, r, o, i) {
    const s = this._svgLinePath(t, e, r, o, i);
    if (!s) return "";
    const l = t.length, n = (p) => l === 1 ? 0 : p / (l - 1) * o, h = n(l - 1), d = n(0);
    return `${s} L ${h.toFixed(2)} ${i.toFixed(2)} L ${d.toFixed(2)} ${i.toFixed(2)} Z`;
  }
  /** Band between two value series (watts), same Y scale as line chart. Bottom edge reversed to close. */
  _svgStackedBandPath(t, e, r, o, i, s) {
    if (!t?.length || t.length !== e?.length) return "";
    const l = Math.max(o - r, 1e-9), n = t.length, h = (u) => n === 1 ? 0 : u / (n - 1) * i, d = (u) => s - (Number(u) - r) / l * s;
    let p = "";
    for (let u = 0; u < n; u++) {
      const m = h(u), f = d(Number(e[u]));
      p += u === 0 ? `M ${m.toFixed(2)} ${f.toFixed(2)}` : ` L ${m.toFixed(2)} ${f.toFixed(2)}`;
    }
    for (let u = n - 1; u >= 0; u--) {
      const m = h(u), f = d(Number(t[u]));
      p += ` L ${m.toFixed(2)} ${f.toFixed(2)}`;
    }
    return p += " Z", p;
  }
  _renderPowerGraph(t, e) {
    if (!this._powerGraphOpen) return _;
    const r = Bt, o = ot, i = it, s = "#2e7d32", l = "var(--primary-text-color, #e0e0e0)";
    if (this._powerGraphLoading)
      return v`<div class="power-graph"><div class="loader">${t.loading}</div></div>`;
    if (this._powerGraphErr)
      return v`<div class="power-graph"><div class="alert">${this._powerGraphErr}</div></div>`;
    const n = this._powerGraphDisplaySeries();
    if (!n?.pts?.length)
      return v`<div class="power-graph"><div class="loader">${t.noData}</div></div>`;
    const h = 320, d = 120, p = n.yMin ?? 0, u = n.yMax ?? 1, m = n.pts.map((B) => B.solar ?? 0), f = n.pts.map((B) => Math.max(0, B.batt ?? 0)), g = n.pts.map((B) => Math.max(0, -(B.batt ?? 0))), E = n.pts.map((B) => B.grid ?? 0), $ = n.hasLoadEntity === !0, H = $ ? n.pts.map((B) => B.load == null ? 0 : B.load) : [], w = (B) => new Intl.DateTimeFormat(e, { hour: "2-digit", minute: "2-digit" }).format(new Date(B)), y = (B) => new Intl.DateTimeFormat(e, { dateStyle: "short", timeStyle: "short" }).format(new Date(B)), k = n.pts[0].ts, x = n.pts[n.pts.length - 1].ts, b = k + (x - k) / 3, S = k + (x - k) * 2 / 3, N = this._svgLinePath(m, p, u, h, d), P = this._svgLinePath(f, p, u, h, d), T = this._svgLinePath(g, p, u, h, d), G = this._svgLinePath(E, p, u, h, d), C = $ && H.length ? this._svgLinePath(H, p, u, h, d) : "";
    let A = "", q = "", Y = "";
    if ($ && H.length) {
      const { sliceBatt: B, sliceGrid: V, sliceSolar: Yt } = Dr(n.pts), Qt = B.length, Mt = new Array(Qt).fill(0), Nt = B.slice(), Dt = B.map(($t, c) => $t + V[c]), te = B.map(($t, c) => $t + V[c] + Yt[c]);
      A = this._svgStackedBandPath(Mt, Nt, p, u, h, d), q = this._svgStackedBandPath(Nt, Dt, p, u, h, d), Y = this._svgStackedBandPath(Dt, te, p, u, h, d);
    }
    const wt = `color-mix(in srgb, ${it} 30%, transparent)`, _t = `color-mix(in srgb, ${Bt} 30%, transparent)`, yt = `color-mix(in srgb, ${ot} 30%, transparent)`, Q = "color-mix(in srgb, var(--divider-color) 70%, transparent)", vt = Math.max(u - p, 1e-9), lt = (B) => d - (B - p) / vt * d, ct = (p + u) / 2, Xt = F(u), O = F(ct), pt = F(p), Lt = lt(ct), qt = p < 0 && u > 0, ht = lt(0), tt = n.pts.length, U = this._powerGraphHoverIdx, W = U != null && U >= 0 && U < tt ? n.pts[U] : null, Pt = tt <= 1 ? h / 2 : (U ?? 0) / Math.max(tt - 1, 1) * h, Zt = this._powerGraphTooltipXPct != null ? this._powerGraphTooltipXPct : tt <= 1 ? 50 : (U ?? 0) / Math.max(tt - 1, 1) * 100, Ft = K(n.dayIso), et = Number.isFinite(Ft.getTime()) ? new Intl.DateTimeFormat(e, { dateStyle: "medium" }).format(Ft) : n.dayIso, xt = String(t.powerHistoryFullDay).replace("{date}", et), dt = kt(this._powerGraphRollingHours), Jt = (this._date ?? L()) === L();
    return v`
      <div class="power-graph">
        <div class="power-graph-head">
          <div class="power-graph-title">${t.powerHistoryTitle ?? "Power history"}</div>
          <div class="power-graph-head-actions">
            ${Jt ? v`<div class="power-graph-window-btns">
                  <span class="range-label">${t.powerHistoryWindow}</span>
                  ${se.map(
      (B) => v`
                      <button
                        type="button"
                        class="range-btn ${dt === B ? "active" : ""}"
                        @click=${() => this._setPowerGraphRollingHours(B)}
                      >
                        ${B}h
                      </button>
                    `
    )}
                </div>` : v`<div class="power-graph-archive-day">${xt}</div>`}
          </div>
        </div>
        <div class="power-graph-chart-wrap">
          <div class="power-yaxis" aria-hidden="true">
            <span>${Xt}</span>
            <span>${O}</span>
            <span>${pt}</span>
          </div>
          <div class="power-graph-svg-wrap">
            ${W ? v`
                  <div class="power-graph-tooltip" style="--power-tooltip-x:${Zt}%">
                    <div class="power-graph-tooltip-h">
                      ${t.powerGraphTooltipTime}: ${y(W.ts)}
                    </div>
                    ${$ ? v`
                          <div class="power-graph-tooltip-row">
                            <span class="power-graph-tooltip-k" style="color:${l}"
                              >${t.houseLoad}</span
                            >
                            <span class="power-graph-tooltip-v"
                              >${W.load != null ? F(W.load) : t.emDash}</span
                            >
                          </div>
                        ` : _}
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${o}"
                        >${t.powerGraphTooltipSolar}</span
                      >
                      <span class="power-graph-tooltip-v">${F(W.solar ?? 0)}</span>
                    </div>
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${i}"
                        >${t.segBattDis}</span
                      >
                      <span class="power-graph-tooltip-v">${F(Math.max(0, W.batt ?? 0))}</span>
                    </div>
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${s}"
                        >${t.segBattChg}</span
                      >
                      <span class="power-graph-tooltip-v">${F(Math.max(0, -(W.batt ?? 0)))}</span>
                    </div>
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${r}"
                        >${t.powerGraphTooltipGrid}</span
                      >
                      <span class="power-graph-tooltip-v">${F(W.grid ?? 0)}</span>
                    </div>
                  </div>
                ` : _}
            <svg
              viewBox="0 0 ${h} ${d}"
              width="100%"
              height="120"
              preserveAspectRatio="none"
              aria-label="power history chart"
              @mousemove=${this._onPowerGraphSvgMove}
              @mouseleave=${this._onPowerGraphSvgLeave}
              @touchstart=${this._onPowerGraphSvgTouch}
              @touchmove=${this._onPowerGraphSvgTouch}
              @touchend=${this._onPowerGraphSvgTouchEnd}
              @touchcancel=${this._onPowerGraphSvgTouchEnd}
            >
              <g class="power-grid-lines" stroke="${Q}" stroke-width="0.75" opacity="0.55" fill="none">
                <line x1="0" y1="0" x2="${h}" y2="0"></line>
                <line x1="0" y1="${Lt}" x2="${h}" y2="${Lt}" stroke-dasharray="3 3"></line>
                <line x1="0" y1="${d}" x2="${h}" y2="${d}"></line>
                ${qt ? ut`<line
                      x1="0"
                      y1="${ht}"
                      x2="${h}"
                      y2="${ht}"
                      stroke-dasharray="4 3"
                      opacity="0.75"
                    ></line>` : _}
                <line x1="0" y1="0" x2="0" y2="${d}" stroke-width="1"></line>
              </g>
              ${A ? ut`<path
                    d="${A}"
                    fill="${wt}"
                    stroke="none"
                    pointer-events="none"
                  ></path>` : _}
              ${q ? ut`<path
                    d="${q}"
                    fill="${_t}"
                    stroke="none"
                    pointer-events="none"
                  ></path>` : _}
              ${Y ? ut`<path
                    d="${Y}"
                    fill="${yt}"
                    stroke="none"
                    pointer-events="none"
                  ></path>` : _}
              <path
                d="${G}"
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
                stroke="${s}"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
              ></path>
              <path
                d="${P}"
                fill="none"
                stroke="${i}"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
              ></path>
              <path
                d="${N}"
                fill="none"
                stroke="${o}"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
              ></path>
              ${C ? ut`<path
                    d="${C}"
                    fill="none"
                    stroke="${l}"
                    stroke-width="2.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    opacity="1"
                  ></path>` : _}
              ${U != null ? ut`<line
                    pointer-events="none"
                    x1="${Pt}"
                    y1="0"
                    x2="${Pt}"
                    y2="${d}"
                    stroke="${Q}"
                    stroke-width="1"
                    opacity="0.85"
                  ></line>` : _}
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
              >` : _}
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
              style="--swatch-line:${i}"
            ></span
            >${t.segBattDis}</span
          >
          <span class="power-graph-chip"
            ><span
              class="power-graph-swatch power-graph-swatch-line"
              style="--swatch-line:${s}"
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
  _buildPowerNowData(t, e, r) {
    if (!t?.[e]) return null;
    const o = M(t, e, "grid_power_signed_w"), i = M(t, e, "solar_power_w") ?? M(t, e, "solar_estimate_power_w"), s = M(t, e, "batt_discharge_power_w"), l = M(t, e, "batt_charge_power_w"), n = M(t, e, "load_power_w"), h = M(t, e, "export_power_w"), d = [];
    return o != null ? d.push(o >= 0 ? `${r.segImport} ${o.toFixed(0)} W` : `${r.segExport} ${Math.abs(o).toFixed(0)} W`) : h != null && h > 0 && d.push(`${r.segExport} ${h.toFixed(0)} W`), i != null && d.push(`${r.segSolar} ${i.toFixed(0)} W`), s != null && s > 0 && d.push(`${r.segBattDis} ${s.toFixed(0)} W`), l != null && l > 0 && d.push(`${r.segBattChg} ${l.toFixed(0)} W`), {
      gridSigned: o,
      solar: i,
      battDis: s,
      battChg: l,
      load: n,
      exportW: h,
      tooltip: [r.powerBarTip, d.length ? d.join(" · ") : ""].filter(Boolean).join(" — ")
    };
  }
  _buildBatteryData(t, e) {
    const r = M(t, e, "battery_capacity_kwh"), o = M(t, e, "battery_soc_percent");
    if (r == null || r <= 0 || o == null) return null;
    const i = M(t, e, "battery_soc_min_percent"), s = M(t, e, "battery_soc_max_percent");
    return {
      soc: o,
      socMin: i ?? 0,
      socMax: s ?? 100,
      capacity: r,
      available: M(t, e, "battery_available_kwh"),
      chargeW: M(t, e, "batt_charge_power_w"),
      dischargeW: M(t, e, "batt_discharge_power_w")
    };
  }
  _renderRedHpWarning(t, e, r, o, i) {
    if (e !== "tempo" || r <= 0) return _;
    const l = (t ?? []).find((h) => h.id === "rouge_hp")?.v ?? 0;
    if (l < 0.1) return _;
    const n = (o.solarDirect?.v ?? 0) + (o.solarBatt?.v ?? 0) + (o.battHome?.v ?? 0);
    return l / r < 0.35 || l <= n ? _ : v`<div class="red-hp-banner">⚠️ ${i.redHpWarning}</div>`;
  }
  _renderSlotMapRaw(t, e, r) {
    const o = r.emDash;
    if (!t || typeof t != "object") return o;
    const i = st.map((s) => {
      const l = t[s.id], n = typeof l == "number" ? l : parseFloat(l);
      return Number.isFinite(n) && n > 1e-5 ? { label: j(s.id, e, r), v: n } : null;
    }).filter(Boolean);
    return i.length ? i.map((s, l) => v`${l > 0 ? v`<br />` : _}${s.label}: ${s.v.toFixed(3)} kWh`) : o;
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
    if (r && !ie(this.hass?.states, o.cost))
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
    const i = this._getRange(), {
      grid: s,
      maison: l,
      totalEur: n,
      costs: h,
      abo: d,
      ecoSolar: p,
      ecoBatt: u,
      og: m,
      os: f,
      usage: g,
      costEntityOk: E,
      offer: $,
      contractPower: H,
      currentSlot: w,
      tempoDays: y,
      todayColor: k,
      tomorrowColor: x,
      reinj: b,
      gridBattBySlot: S,
      solarBattBySlot: N
    } = this._extract(t), P = s.reduce((c, D) => c + D.v, 0), T = l.reduce((c, D) => c + D.v, 0), G = s.filter((c) => c.v > 1e-3), C = h.filter((c) => c.v > 5e-4), A = p + u, q = Rt([P, ...s.map((c) => c.v), g.gridDirect.v, g.gridBatt.v]), Y = g.gridDirect.v, wt = Math.max(0, g.solarDirect.v - g.solarBatt.v), _t = g.battHome.v, yt = Y + wt + _t, Q = Rt([yt, Y, wt, _t]), vt = g.gridBatt.v + g.solarBatt.v, lt = E ? Ee($, S, t) : [], ct = E ? Ee($, N, t) : [], Xt = E && (lt.length > 0 || ct.length > 0), O = [];
    if (Xt) {
      if (ct.length) {
        const c = ct.reduce((D, ue) => D + (Number.isFinite(ue?.v) ? ue.v : 0), 0);
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
      if (lt.length)
        for (const c of lt)
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
    const pt = Rt([
      vt,
      ...O.map((c) => c.v)
    ]), Lt = G.map((c) => ({ value: c.v, color: c.color, className: c.isHc ? "fill-hc" : "" })), qt = G.map((c) => ({
      label: j(c.id, $, t),
      value: q(c.v),
      color: c.color,
      rawV: c.v
    })), ht = [
      { label: t.brkTblGridHome, v: Y, color: g.gridDirect.color },
      { label: t.brkTblSolar, v: wt, color: g.solarDirect.color },
      { label: t.brkTblBattHome, v: _t, color: g.battHome.color }
    ].filter((c) => c.v > 1e-3), tt = ht.map((c) => ({ value: c.v, color: c.color })), U = ht.map((c) => ({
      label: c.label,
      value: Q(c.v),
      color: c.color,
      rawV: c.v
    })), W = O.map((c) => ({
      value: c.v,
      color: c.color,
      className: c.isHc ? "fill-hc" : ""
    })), Pt = O.map((c) => ({
      label: c.label,
      value: pt(c.v),
      color: c.color,
      rawV: c.v
    })), Zt = [
      ...C.map((c) => ({ value: c.v, color: c.color, className: c.isHc ? "fill-hc" : "" })),
      ...d > 5e-4 ? [{ value: d, color: Te }] : []
    ], Ft = [
      ...C.map((c) => ({
        label: j(c.id, $, t),
        value: `${c.v.toFixed(2)} €`,
        color: c.color,
        rawV: c.v
      })),
      ...d > 5e-4 ? [{ label: t.costSubscription, value: `${d.toFixed(2)} €`, color: Te, rawV: d }] : []
    ], et = [
      { label: t.reinjCauseSolarSurplus, v: b.solarSurplus, eur: b.oppSolarEur, color: ot },
      { label: t.reinjCauseBatteryFull, v: b.batteryFull, eur: b.oppBatteryEur, color: it },
      { label: t.reinjCauseSwitchLatency, v: b.switchLatency, eur: b.oppLatencyEur, color: "#ff7043" },
      { label: t.reinjCauseOther, v: b.unattributed, eur: b.oppOtherEur, color: "#90a4ae" }
    ].filter((c) => c.v > 1e-4), xt = et.reduce((c, D) => c + D.v, 0), dt = Rt([xt, ...et.map((c) => c.v)]), Jt = et.map((c) => ({ value: c.v, color: c.color })), B = et.map((c) => ({
      label: c.label,
      value: `${dt(c.v)} · ${c.eur.toFixed(2)} €`,
      color: c.color,
      rawV: c.v
    })), V = [
      { label: t.ecoSourceSolar, vAbs: Math.abs(p), color: ot, fmt: `${p >= 0 ? "+" : ""}${p.toFixed(2)} €`, rawV: p },
      { label: t.ecoSourceBatt, vAbs: Math.abs(u), color: it, fmt: `${u >= 0 ? "+" : ""}${u.toFixed(2)} €`, rawV: u }
    ].filter((c) => c.vAbs > 5e-4), Yt = V.reduce((c, D) => c + D.vAbs, 0), Qt = V.length ? V.map((c) => ({ value: c.vAbs, color: c.color })) : Math.abs(A) > 5e-4 ? [{ value: 1, color: A >= 0 ? "#1976d2" : "#c62828" }] : [], Mt = V.length ? V.map((c) => ({ label: c.label, value: c.fmt, color: c.color, rawV: c.vAbs })) : [], Nt = this._states(), Dt = r && E ? this._buildPowerNowData(Nt, o.cost, t) : null, te = E && this.hass?.states ? this._buildBatteryData(this.hass.states, o.cost) : null, $t = b.solarSurplus + b.batteryFull + b.switchLatency + b.unattributed;
    return v`
      <ha-card>
        <div class="header">
          <div class="header-title-side">
            <h2>Hub Énergie</h2>
            <span class="header-subtitle">${vr($)}${H ? ` ${H}kVA` : ""}</span>
          </div>
          <div class="controls">
            <label>${t.date}</label>
            <input type="date" .value=${this._date} max=${L()} @change=${this._onDateChange} />
            <label>${t.range}</label>
            <div class="range-btns">
              ${["day", "week", "month", "year"].map((c) => v`
                <button class="range-btn ${this._rangePreset === c ? "active" : ""}" @click=${() => this._setRangePreset(c)}>
                  ${t[c]}
                </button>
              `)}
            </div>
            <span class="range-label">${ur(i.startIso, i.endIso, e)}</span>
            <button class="btn" @click=${this._onRawToggle}>${this._showRaw ? t.hide : t.details}</button>
          </div>
        </div>

        ${this._histLoading ? v`<div class="loader">${t.loading}</div>` : _}

        <div class="meta-tempo-wrap">
          <div class="meta-days-stack">
            <div class="day-tile ${$ === "tempo" ? Ae(k) : "color-na"}">
              <span class="day-tile-line">${t.today} : ${j(w, $, t)}</span>
            </div>
            <div class="day-tile ${$ === "tempo" ? Ae(x) : "color-na"}">
              <span class="day-tile-line">${t.tomorrow} : ${$ === "tempo" ? xr(x, t) : t.emDash}</span>
            </div>
          </div>
          ${$ === "tempo" && y && typeof y == "object" ? v`
                <div class="tempo-days">
                  <div class="tempo-day tempo-blue">
                    ${t.tempoDayBlue} : ${y.blue?.remaining ?? 0}/${(y.blue?.elapsed ?? 0) + (y.blue?.remaining ?? 0)}
                  </div>
                  <div class="tempo-day tempo-white">
                    ${t.tempoDayWhite} : ${y.white?.remaining ?? 0}/${(y.white?.elapsed ?? 0) + (y.white?.remaining ?? 0)}
                  </div>
                  <div class="tempo-day tempo-red">
                    ${t.tempoDayRed} : ${y.red?.remaining ?? 0}/${(y.red?.elapsed ?? 0) + (y.red?.remaining ?? 0)}
                  </div>
                </div>
              ` : _}
        </div>

        <hub-power-now
          .i18n=${t}
          .data=${Dt}
          .graphOpen=${this._powerGraphOpen}
          @hub-power-now-toggle=${() => this._togglePowerGraph()}
        ></hub-power-now>
        ${this._renderPowerGraph(t, e)}
        <hub-energie-battery-bar .i18n=${t} .data=${te} .numberLocale=${e}></hub-energie-battery-bar>
        <hub-insight-bar .i18n=${t} .totalMaison=${T} .originGrid=${m} .totalEur=${n} .ecoTotal=${A}></hub-insight-bar>
        ${this._renderRedHpWarning(s, $, T, g, t)}

        <section>
          <div class="section-head">
            <h3>${t.sectionConsumption}</h3>
            <div class="section-metric">${t.totalEnergy} <b>${gr(T)}</b></div>
          </div>
          <div class="bars">
            <hub-energy-strip
              .title=${t.consStripGridTitle}
              .segments=${Lt}
              .total=${P}
              .formatter=${q}
              .tooltip=${G.map((c) => `${j(c.id, $, t)}: ${q(c.v)}`).join(" · ")}
              .breakdown=${qt}
              .showBreakdown=${!0}
              .displayValue=${q(P)}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>

            <hub-energy-strip
              .title=${t.consStripHomeTitle}
              .segments=${tt}
              .total=${yt}
              .formatter=${Q}
              .tooltip=${ht.map((c) => `${c.label}: ${Q(c.v)}`).join(" · ")}
              .breakdown=${U}
              .showBreakdown=${!0}
              .displayValue=${Q(yt)}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>

            <hub-energy-strip
              .title=${t.consStripBattTitle}
              .segments=${W}
              .total=${vt}
              .formatter=${pt}
              .tooltip=${O.map((c) => `${c.label}: ${pt(c.v)}`).join(" · ")}
              .breakdown=${Pt}
              .showBreakdown=${!0}
              .displayValue=${pt(vt)}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>
          </div>
        </section>

        <section>
          <div class="bars">
            <hub-energy-strip
              .title=${t.costStripTitle}
              .segments=${Zt}
              .total=${n}
              .formatter=${(c) => `${Number(c).toFixed(2)} €`}
              .tooltip=${[
      ...C.map((c) => `${j(c.id, $, t)}: ${c.v.toFixed(2)} €${c.tooltip ? ` (${c.tooltip})` : ""}`),
      ...d > 5e-4 ? [`${t.costSubscription}: ${d.toFixed(2)} €`] : []
    ].join(" · ")}
              .breakdown=${Ft}
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
              .segments=${Qt}
              .total=${Yt}
              .formatter=${(c) => `${Number(c).toFixed(2)} €`}
              .tooltip=${V.map((c) => `${c.label}: ${c.fmt}`).join(" · ")}
              .breakdown=${Mt.length ? Mt : [{ label: t.emDash, value: `${A >= 0 ? "+" : ""}${A.toFixed(2)} €` }]}
              .showBreakdown=${!0}
              .displayValue=${`${A >= 0 ? "+" : ""}${A.toFixed(2)} €`}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>
          </div>
        </section>

        <section>
          <div class="bars">
            <hub-energy-strip
              .title=${t.reinjStripTitle}
              .segments=${Jt}
              .total=${xt}
              .formatter=${dt}
              .tooltip=${et.map((c) => `${c.label}: ${dt(c.v)} · ${c.eur.toFixed(2)} €`).join(" · ")}
              .breakdown=${B}
              .showBreakdown=${!0}
              .displayValue=${`${dt(xt)} · ${b.oppTotalEur.toFixed(2)} €`}
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
                      ${R(t.rawLineGridTotal, { value: P.toFixed(3) })}<br />
                      ${R(t.rawLineHouseTotal, { value: T.toFixed(3) })}
                    </div>
                    <div>
                      <b>${t.rawSectionCost}</b>
                      ${R(t.rawLineCostTotal, { value: n.toFixed(3) })}<br />
                      ${R(t.rawLineSubscription, { value: d.toFixed(3) })}
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
                      ${G.length > 0 ? G.map((c, D) => v`${D > 0 ? v`<br />` : _}${j(c.id, $, t)}: ${c.v.toFixed(3)} kWh`) : t.emDash}
                    </div>
                    <div>
                      <b>${t.rawSectionCostBySlot}</b>
                      ${C.length > 0 ? C.map((c, D) => v`${D > 0 ? v`<br />` : _}${j(c.id, $, t)}: ${c.v.toFixed(3)} €`) : t.emDash}
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
                      ${this._renderSlotMapRaw(N, $, t)}
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
                      ${R(t.reinjLineKwhEur, { kwh: $t.toFixed(3), eur: b.oppTotalEur.toFixed(3) })}
                    </div>
                  </div>
                </div>
              </section>
            ` : _}
      </ha-card>
    `;
  }
}
const jr = "2026.04.04-2";
console.log("[hub-energie-card]", jr);
customElements.get("hub-energie-card") || customElements.define("hub-energie-card", Or);
window.customCards ??= [];
window.customCards.push({
  type: "hub-energie-card",
  name: "Hub Énergie",
  description: "Daily energy, cost and savings. Config: cost_entity: sensor.hub_energie_cost_detail",
  preview: !1,
  documentationURL: "https://gitlab.com/zzcyph1/home-assistant/hub-energie"
});
