const Ot = globalThis, ne = Ot.ShadowRoot && (Ot.ShadyCSS === void 0 || Ot.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, le = /* @__PURE__ */ Symbol(), ue = /* @__PURE__ */ new WeakMap();
let He = class {
  constructor(t, e, r) {
    if (this._$cssResult$ = !0, r !== le) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (ne && t === void 0) {
      const r = e !== void 0 && e.length === 1;
      r && (t = ue.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), r && ue.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Ie = (i) => new He(typeof i == "string" ? i : i + "", void 0, le), Pt = (i, ...t) => {
  const e = i.length === 1 ? i[0] : t.reduce((r, o, s) => r + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + i[s + 1], i[0]);
  return new He(e, i, le);
}, je = (i, t) => {
  if (ne) i.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const r = document.createElement("style"), o = Ot.litNonce;
    o !== void 0 && r.setAttribute("nonce", o), r.textContent = e.cssText, i.appendChild(r);
  }
}, ge = ne ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const r of t.cssRules) e += r.cssText;
  return Ie(e);
})(i) : i;
const { is: We, defineProperty: ze, getOwnPropertyDescriptor: Ue, getOwnPropertyNames: Ve, getOwnPropertySymbols: Ke, getPrototypeOf: Xe } = Object, zt = globalThis, me = zt.trustedTypes, qe = me ? me.emptyScript : "", Ze = zt.reactiveElementPolyfillSupport, kt = (i, t) => i, ie = { toAttribute(i, t) {
  switch (t) {
    case Boolean:
      i = i ? qe : null;
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
} }, Me = (i, t) => !We(i, t), be = { attribute: !0, type: String, converter: ie, reflect: !1, useDefault: !1, hasChanged: Me };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), zt.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let ut = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = be) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const r = /* @__PURE__ */ Symbol(), o = this.getPropertyDescriptor(t, r, e);
      o !== void 0 && ze(this.prototype, t, o);
    }
  }
  static getPropertyDescriptor(t, e, r) {
    const { get: o, set: s } = Ue(this.prototype, t) ?? { get() {
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
    return this.elementProperties.get(t) ?? be;
  }
  static _$Ei() {
    if (this.hasOwnProperty(kt("elementProperties"))) return;
    const t = Xe(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(kt("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(kt("properties"))) {
      const e = this.properties, r = [...Ve(e), ...Ke(e)];
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
      for (const o of r) e.unshift(ge(o));
    } else t !== void 0 && e.push(ge(t));
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
    return je(t, this.constructor.elementStyles), t;
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
      const s = (r.converter?.toAttribute !== void 0 ? r.converter : ie).toAttribute(e, r.type);
      this._$Em = t, s == null ? this.removeAttribute(o) : this.setAttribute(o, s), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const r = this.constructor, o = r._$Eh.get(t);
    if (o !== void 0 && this._$Em !== o) {
      const s = r.getPropertyOptions(o), a = typeof s.converter == "function" ? { fromAttribute: s.converter } : s.converter?.fromAttribute !== void 0 ? s.converter : ie;
      this._$Em = o;
      const l = a.fromAttribute(e, s.type);
      this[o] = l ?? this._$Ej?.get(o) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, r, o = !1, s) {
    if (t !== void 0) {
      const a = this.constructor;
      if (o === !1 && (s = this[t]), r ??= a.getPropertyOptions(t), !((r.hasChanged ?? Me)(s, e) || r.useDefault && r.reflect && s === this._$Ej?.get(t) && !this.hasAttribute(a._$Eu(t, r)))) return;
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
ut.elementStyles = [], ut.shadowRootOptions = { mode: "open" }, ut[kt("elementProperties")] = /* @__PURE__ */ new Map(), ut[kt("finalized")] = /* @__PURE__ */ new Map(), Ze?.({ ReactiveElement: ut }), (zt.reactiveElementVersions ??= []).push("2.1.2");
const ce = globalThis, fe = (i) => i, It = ce.trustedTypes, we = It ? It.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, Ce = "$lit$", q = `lit$${Math.random().toFixed(9).slice(2)}$`, Ne = "?" + q, Je = `<${Ne}>`, at = document, Gt = () => at.createComment(""), At = (i) => i === null || typeof i != "object" && typeof i != "function", pe = Array.isArray, Ye = (i) => pe(i) || typeof i?.[Symbol.iterator] == "function", te = `[ 	
\f\r]`, $t = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, _e = /-->/g, ye = />/g, et = RegExp(`>|${te}(?:([^\\s"'>=/]+)(${te}*=${te}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), xe = /'/g, ve = /"/g, Le = /^(?:script|style|textarea|title)$/i, De = (i) => (t, ...e) => ({ _$litType$: i, strings: t, values: e }), x = De(1), dt = De(2), mt = /* @__PURE__ */ Symbol.for("lit-noChange"), _ = /* @__PURE__ */ Symbol.for("lit-nothing"), $e = /* @__PURE__ */ new WeakMap(), it = at.createTreeWalker(at, 129);
function Re(i, t) {
  if (!pe(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return we !== void 0 ? we.createHTML(t) : t;
}
const Qe = (i, t) => {
  const e = i.length - 1, r = [];
  let o, s = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", a = $t;
  for (let l = 0; l < e; l++) {
    const n = i[l];
    let h, d, p = -1, u = 0;
    for (; u < n.length && (a.lastIndex = u, d = a.exec(n), d !== null); ) u = a.lastIndex, a === $t ? d[1] === "!--" ? a = _e : d[1] !== void 0 ? a = ye : d[2] !== void 0 ? (Le.test(d[2]) && (o = RegExp("</" + d[2], "g")), a = et) : d[3] !== void 0 && (a = et) : a === et ? d[0] === ">" ? (a = o ?? $t, p = -1) : d[1] === void 0 ? p = -2 : (p = a.lastIndex - d[2].length, h = d[1], a = d[3] === void 0 ? et : d[3] === '"' ? ve : xe) : a === ve || a === xe ? a = et : a === _e || a === ye ? a = $t : (a = et, o = void 0);
    const b = a === et && i[l + 1].startsWith("/>") ? " " : "";
    s += a === $t ? n + Je : p >= 0 ? (r.push(h), n.slice(0, p) + Ce + n.slice(p) + q + b) : n + q + (p === -2 ? l : b);
  }
  return [Re(i, s + (i[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
};
class Et {
  constructor({ strings: t, _$litType$: e }, r) {
    let o;
    this.parts = [];
    let s = 0, a = 0;
    const l = t.length - 1, n = this.parts, [h, d] = Qe(t, e);
    if (this.el = Et.createElement(h, r), it.currentNode = this.el.content, e === 2 || e === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (o = it.nextNode()) !== null && n.length < l; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const p of o.getAttributeNames()) if (p.endsWith(Ce)) {
          const u = d[a++], b = o.getAttribute(p).split(q), f = /([.?@])?(.*)/.exec(u);
          n.push({ type: 1, index: s, name: f[2], strings: b, ctor: f[1] === "." ? er : f[1] === "?" ? rr : f[1] === "@" ? or : Ut }), o.removeAttribute(p);
        } else p.startsWith(q) && (n.push({ type: 6, index: s }), o.removeAttribute(p));
        if (Le.test(o.tagName)) {
          const p = o.textContent.split(q), u = p.length - 1;
          if (u > 0) {
            o.textContent = It ? It.emptyScript : "";
            for (let b = 0; b < u; b++) o.append(p[b], Gt()), it.nextNode(), n.push({ type: 2, index: ++s });
            o.append(p[u], Gt());
          }
        }
      } else if (o.nodeType === 8) if (o.data === Ne) n.push({ type: 2, index: s });
      else {
        let p = -1;
        for (; (p = o.data.indexOf(q, p + 1)) !== -1; ) n.push({ type: 7, index: s }), p += q.length - 1;
      }
      s++;
    }
  }
  static createElement(t, e) {
    const r = at.createElement("template");
    return r.innerHTML = t, r;
  }
}
function bt(i, t, e = i, r) {
  if (t === mt) return t;
  let o = r !== void 0 ? e._$Co?.[r] : e._$Cl;
  const s = At(t) ? void 0 : t._$litDirective$;
  return o?.constructor !== s && (o?._$AO?.(!1), s === void 0 ? o = void 0 : (o = new s(i), o._$AT(i, e, r)), r !== void 0 ? (e._$Co ??= [])[r] = o : e._$Cl = o), o !== void 0 && (t = bt(i, o._$AS(i, t.values), o, r)), t;
}
class tr {
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
        let h;
        n.type === 2 ? h = new Bt(s, s.nextSibling, this, t) : n.type === 1 ? h = new n.ctor(s, n.name, n.strings, this, t) : n.type === 6 && (h = new ir(s, this, t)), this._$AV.push(h), n = r[++l];
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
class Bt {
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
    t = bt(this, t, e), At(t) ? t === _ || t == null || t === "" ? (this._$AH !== _ && this._$AR(), this._$AH = _) : t !== this._$AH && t !== mt && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Ye(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== _ && At(this._$AH) ? this._$AA.nextSibling.data = t : this.T(at.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: r } = t, o = typeof r == "number" ? this._$AC(t) : (r.el === void 0 && (r.el = Et.createElement(Re(r.h, r.h[0]), this.options)), r);
    if (this._$AH?._$AD === o) this._$AH.p(e);
    else {
      const s = new tr(o, this), a = s.u(this.options);
      s.p(e), this.T(a), this._$AH = s;
    }
  }
  _$AC(t) {
    let e = $e.get(t.strings);
    return e === void 0 && $e.set(t.strings, e = new Et(t)), e;
  }
  k(t) {
    pe(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let r, o = 0;
    for (const s of t) o === e.length ? e.push(r = new Bt(this.O(Gt()), this.O(Gt()), this, this.options)) : r = e[o], r._$AI(s), o++;
    o < e.length && (this._$AR(r && r._$AB.nextSibling, o), e.length = o);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const r = fe(t).nextSibling;
      fe(t).remove(), t = r;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class Ut {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, r, o, s) {
    this.type = 1, this._$AH = _, this._$AN = void 0, this.element = t, this.name = e, this._$AM = o, this.options = s, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = _;
  }
  _$AI(t, e = this, r, o) {
    const s = this.strings;
    let a = !1;
    if (s === void 0) t = bt(this, t, e, 0), a = !At(t) || t !== this._$AH && t !== mt, a && (this._$AH = t);
    else {
      const l = t;
      let n, h;
      for (t = s[0], n = 0; n < s.length - 1; n++) h = bt(this, l[r + n], e, n), h === mt && (h = this._$AH[n]), a ||= !At(h) || h !== this._$AH[n], h === _ ? t = _ : t !== _ && (t += (h ?? "") + s[n + 1]), this._$AH[n] = h;
    }
    a && !o && this.j(t);
  }
  j(t) {
    t === _ ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class er extends Ut {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === _ ? void 0 : t;
  }
}
class rr extends Ut {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== _);
  }
}
class or extends Ut {
  constructor(t, e, r, o, s) {
    super(t, e, r, o, s), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = bt(this, t, e, 0) ?? _) === mt) return;
    const r = this._$AH, o = t === _ && r !== _ || t.capture !== r.capture || t.once !== r.once || t.passive !== r.passive, s = t !== _ && (r === _ || o);
    o && this.element.removeEventListener(this.name, this, r), s && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class ir {
  constructor(t, e, r) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    bt(this, t);
  }
}
const sr = ce.litHtmlPolyfillSupport;
sr?.(Et, Bt), (ce.litHtmlVersions ??= []).push("3.3.2");
const ar = (i, t, e) => {
  const r = e?.renderBefore ?? t;
  let o = r._$litPart$;
  if (o === void 0) {
    const s = e?.renderBefore ?? null;
    r._$litPart$ = o = new Bt(t.insertBefore(Gt(), s), s, void 0, e ?? {});
  }
  return o._$AI(i), o;
};
const he = globalThis;
class K extends ut {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = ar(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return mt;
  }
}
K._$litElement$ = !0, K.finalized = !0, he.litElementHydrateSupport?.({ LitElement: K });
const nr = he.litElementPolyfillSupport;
nr?.({ LitElement: K });
(he.litElementVersions ??= []).push("4.2.2");
const Se = Object.freeze({
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
    battSocTitle: "Battery"
  }
}), ke = "#9e9e9e", lr = "#8d6e63", Tt = "#7e57c2", rt = "#fdd835", ot = "#66bb6a", st = Object.freeze([
  { id: "bleu_hc", label: "Bleu HC", color: "#1e88e5" },
  { id: "bleu_hp", label: "Bleu HP", color: "#1e88e5" },
  { id: "blanc_hc", label: "Blanc HC", color: "#b0bec5" },
  { id: "blanc_hp", label: "Blanc HP", color: "#b0bec5" },
  { id: "rouge_hc", label: "Rouge HC", color: "#e53935" },
  { id: "rouge_hp", label: "Rouge HP", color: "#e53935" },
  { id: "unknown", label: "Indéterminé", color: "#78909c" }
]), Vt = "Europe/Paris";
function Oe(i = /* @__PURE__ */ new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: Vt,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(i);
}
const H = () => Oe();
function V(i) {
  const t = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(i));
  if (!t) return /* @__PURE__ */ new Date(NaN);
  const e = `${t[1]}-${t[2]}-${t[3]}`, r = Number(t[1]), o = Number(t[2]), s = Number(t[3]), a = Date.UTC(r, o - 1, s - 1, 18, 0, 0), l = Date.UTC(r, o - 1, s + 1, 6, 0, 0), n = new Intl.DateTimeFormat("en-CA", {
    timeZone: Vt,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  for (let h = a; h <= l; h += 6e4) {
    const d = n.formatToParts(new Date(h)), p = (b) => d.find((f) => f.type === b)?.value ?? "";
    if (`${p("year")}-${p("month")}-${p("day")}` === e && p("hour") === "00" && p("minute") === "00" && p("second") === "00")
      return new Date(h);
  }
  return /* @__PURE__ */ new Date(NaN);
}
function jt(i, t) {
  const e = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(i));
  if (!e) return H();
  const r = Number(e[1]), o = Number(e[2]), s = Number(e[3]);
  return new Date(Date.UTC(r, o - 1, s + t)).toISOString().slice(0, 10);
}
function cr(i) {
  const t = V(i).getTime();
  if (!Number.isFinite(t)) return 0;
  const e = new Intl.DateTimeFormat("en-GB", {
    timeZone: Vt,
    weekday: "short"
  }).format(new Date(t));
  return { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }[e] ?? 0;
}
const pr = (i) => Oe(new Date(i));
function hr(i, t) {
  const r = /^\d{4}-\d{2}-\d{2}$/.test(String(i)) ? String(i) : H();
  let o;
  if (t === "week") {
    const s = cr(r);
    o = jt(r, -s);
  } else t === "month" ? o = `${r.slice(0, 7)}-01` : t === "year" ? o = `${r.slice(0, 4)}-01-01` : o = r;
  return { startIso: o, endIso: r };
}
function ee(i, t) {
  const e = V(i);
  return Number.isFinite(e.getTime()) ? e.toLocaleDateString(t, {
    timeZone: Vt,
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }) : String(i);
}
function dr(i, t, e) {
  return i === t ? ee(t, e) : `${ee(i, e)} - ${ee(t, e)}`;
}
const W = (i, t) => {
  const e = parseFloat(i?.[t]?.state);
  return Number.isFinite(e) ? e : 0;
}, I = (i, t, e) => {
  const r = parseFloat(i?.[t]?.attributes?.[e]);
  return Number.isFinite(r) ? r : 0;
}, N = (i, t, e) => {
  const r = i?.[t]?.attributes?.[e];
  if (r == null || r === "") return null;
  const o = Number(r);
  return Number.isFinite(o) ? o : null;
}, C = (i) => {
  const t = Number(i);
  if (!Number.isFinite(t)) return "—";
  const e = Math.abs(t);
  return e >= 1e3 ? `${(t / 1e3).toFixed(e >= 1e4 ? 0 : 1)} kW` : `${Math.round(t)} W`;
}, ur = (i) => {
  const t = Number(i), e = Number.isFinite(t) ? t : 0;
  return e < 1 ? `${Math.round(e * 1e3)} Wh` : `${e.toFixed(2)} kWh`;
}, Dt = (i) => {
  const e = (i ?? []).map((r) => Number(r)).filter((r) => Number.isFinite(r)).some((r) => r >= 1);
  return (r) => {
    const o = Number(r), s = Number.isFinite(o) ? o : 0;
    return e ? `${s.toFixed(2)} kWh` : `${Math.round(s * 1e3)} Wh`;
  };
}, gr = {
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
function mr(i) {
  const t = String(i ?? "").toLowerCase();
  for (const [e, r] of Object.entries(gr))
    if (t.includes(e)) return r;
  return null;
}
function br(i) {
  const t = String(i ?? "").toLowerCase();
  return /\b(bleu|blanc|rouge)\b/.test(t) || /\b(hc|hp)\b/.test(t);
}
function fr(i) {
  const t = String(i ?? "").toLowerCase();
  return t.includes(" hc") || t.endsWith("hc") || t.includes("heures creuses") || t.includes("off-peak");
}
function wr(i) {
  const e = String(i ?? "").trim().match(/^#([0-9a-f]{6})$/i);
  if (!e) return !1;
  const r = e[1], o = parseInt(r.slice(0, 2), 16), s = parseInt(r.slice(2, 4), 16), a = parseInt(r.slice(4, 6), 16);
  return (0.2126 * o + 0.7152 * s + 0.0722 * a) / 255 >= 0.68;
}
function Te(i) {
  const t = Math.max(0, Math.round(i)), e = Math.floor(t / 60), r = t % 60;
  return `${e}h ${r}min`;
}
const Ge = Object.freeze([
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
]), Ae = Object.freeze([
  "grid_by_slot_kwh",
  "maison_by_slot_kwh"
]);
function _r(i) {
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
function re(i, t) {
  if (!i || typeof i != "object") return 0;
  const e = i[t], r = typeof e == "number" ? e : parseFloat(e);
  return Number.isFinite(r) ? r : 0;
}
function oe(i, t) {
  return !!i?.[t];
}
function yr(i) {
  return i === "hphc" ? "HP/HC" : i === "base" ? "BASE" : "TEMPO";
}
function O(i, t) {
  return i ? t === "base" ? "Base" : t === "hphc" ? i.endsWith("_hc") ? "HC" : "HP" : i.replace("_", " ").toUpperCase().replace("BLEU", "Bleu").replace("BLANC", "Blanc").replace("ROUGE", "Rouge") : "—";
}
function xr(i) {
  const t = String(i ?? "").toLowerCase();
  return t.includes("blue") || t.includes("bleu") ? "Bleu" : t.includes("white") || t.includes("blanc") ? "Blanc" : t.includes("red") || t.includes("rouge") ? "Rouge" : t === "n/a" ? "N/A" : t || "—";
}
function Ee(i) {
  const t = String(i ?? "").toLowerCase();
  return t.includes("blue") || t.includes("bleu") ? "color-blue" : t.includes("white") || t.includes("blanc") ? "color-white" : t.includes("red") || t.includes("rouge") ? "color-red" : "color-na";
}
function Pe(i, t) {
  return !t || typeof t != "object" ? [] : st.map((e) => {
    const r = t[e.id], o = typeof r == "number" ? r : parseFloat(r);
    return !Number.isFinite(o) || o <= 1e-4 ? null : {
      label: O(e.id, i),
      v: o,
      color: e.color,
      isHc: e.id.endsWith("_hc")
    };
  }).filter(Boolean);
}
function Rt(i) {
  return !i || typeof i != "object" ? "" : st.map((t) => {
    const e = i[t.id], r = typeof e == "number" ? e : parseFloat(e);
    return `${t.id}:${Number.isFinite(r) ? r : 0}`;
  }).join(",");
}
function Wt(...i) {
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
function vr(i) {
  if (typeof i == "number" && Number.isFinite(i)) return i;
  if (typeof i == "string") {
    const t = Date.parse(i);
    return Number.isFinite(t) ? t : NaN;
  }
  return NaN;
}
function gt(i, t = {}) {
  const e = !!t.allowNegative;
  if (!Array.isArray(i) || !i.length) return [];
  const r = [];
  for (const o of i) {
    const s = vr(o?.start), a = o?.mean ?? o?.state ?? o?.min ?? o?.max;
    if (!Number.isFinite(s) || a == null) continue;
    const l = parseFloat(a);
    if (!Number.isFinite(l)) continue;
    const n = e ? l : Math.max(0, l);
    r.push({ ts: s, w: n });
  }
  return r.sort((o, s) => o.ts - s.ts), r;
}
function $r(i) {
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
async function Sr(i, { startTimeIso: t, endTimeIso: e, statisticIds: r, period: o = "5minute" }) {
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
function kr(i, t) {
  const e = i.grid_entities;
  if (!Array.isArray(e) || !e.length) return [];
  const r = [];
  for (const a of e) {
    const l = typeof a == "string" ? a.trim() : "";
    l && r.push(gt(t[l], { allowNegative: !0 }));
  }
  if (!r.length) return [];
  const o = Wt(...r.map((a) => a.map((l) => l.ts)));
  let s = o.map(() => 0);
  for (const a of r) {
    const l = Z(a, o);
    s = s.map((n, h) => n + (l[h] ?? 0));
  }
  return o.map((a, l) => ({ ts: a, w: s[l] }));
}
function Tr(i, t) {
  const e = i.batteries ?? [];
  if (!Array.isArray(e) || !e.length) return [];
  const r = [];
  for (const a of e)
    if (a?.mode === "net" && a.entity) {
      const l = String(a.entity), n = gt(t[l], { allowNegative: !0 }).map((h) => {
        const d = a.net_sign === "positive_charge" ? -h.w : h.w;
        return { ts: h.ts, w: d };
      });
      r.push(n);
    } else if (a?.mode === "in_out") {
      const l = a.in ? String(a.in) : "", n = a.out ? String(a.out) : "", h = l ? gt(t[l]) : [], d = n ? gt(t[n]) : [], p = Wt(
        h.map((f) => f.ts),
        d.map((f) => f.ts)
      );
      if (!p.length) {
        r.push([]);
        continue;
      }
      const u = h.length ? Z(h, p) : p.map(() => null), b = d.length ? Z(d, p) : p.map(() => null);
      r.push(
        p.map((f, m) => ({
          ts: f,
          w: (b[m] ?? 0) - (u[m] ?? 0)
        }))
      );
    }
  if (!r.length) return [];
  const o = Wt(...r.map((a) => a.map((l) => l.ts)));
  let s = o.map(() => 0);
  for (const a of r) {
    if (!a.length) continue;
    const l = Z(a, o);
    s = s.map((n, h) => n + (l[h] ?? 0));
  }
  return o.map((a, l) => ({ ts: a, w: s[l] }));
}
function Gr(i, t) {
  if (!i || typeof i != "object" || !t || typeof t != "object") return null;
  const e = typeof i.solar_entity == "string" ? i.solar_entity.trim() : "", r = typeof i.load_entity == "string" ? i.load_entity.trim() : "", o = kr(i, t), s = e ? gt(t[e]) : [], a = Tr(i, t), l = r ? gt(t[r]) : [], n = Wt(
    o.map((w) => w.ts),
    s.map((w) => w.ts),
    a.map((w) => w.ts),
    l.map((w) => w.ts)
  );
  if (!n.length) return null;
  const h = o.length ? Z(o, n) : n.map(() => null), d = s.length ? Z(s, n) : n.map(() => null), p = a.length ? Z(a, n) : n.map(() => null), u = l.length ? Z(l, n) : n.map(() => null), b = n.map((w, y) => ({
    ts: w,
    grid: h[y],
    solar: d[y],
    batt: p[y],
    load: u[y]
  }));
  if (!b.some((w) => w.grid != null || w.solar != null || w.batt != null || w.load != null))
    return null;
  let f = 0, m = 0, B = 0, $ = l.length ? 0 : null;
  const A = [];
  for (const w of b)
    w.grid != null && (f = w.grid), w.solar != null && (m = w.solar), w.batt != null && (B = w.batt), l.length && w.load != null && ($ = w.load), A.push({ ts: w.ts, grid: f, solar: m, batt: B, load: l.length ? $ : null });
  return { filled: A };
}
function Ar(i) {
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
function Be(i, t) {
  if (!i?.states || !t || typeof t != "object") return null;
  const e = i.states, r = (b) => {
    if (b == null || typeof b != "string") return null;
    const f = b.trim();
    if (!f || !e[f]) return null;
    const m = parseFloat(e[f].state);
    return Number.isFinite(m) ? m : null;
  };
  let o = 0, s = 0;
  for (const b of t.grid_entities ?? []) {
    if (typeof b != "string") continue;
    const f = r(b);
    f != null && (o += f, s++);
  }
  const a = typeof t.solar_entity == "string" ? t.solar_entity.trim() : "", l = a ? r(a) : null, n = l != null ? Math.max(0, l) : null, h = typeof t.load_entity == "string" ? t.load_entity.trim() : "", d = h ? r(h) : null;
  let p = 0, u = 0;
  for (const b of t.batteries ?? [])
    if (b?.mode === "net" && b.entity) {
      const f = r(String(b.entity));
      if (f != null) {
        const m = b.net_sign === "positive_charge" ? -f : f;
        p += m, u++;
      }
    } else if (b?.mode === "in_out") {
      const f = b.in ? r(String(b.in)) : null, m = b.out ? r(String(b.out)) : null;
      (f != null || m != null) && (p += (m ?? 0) - (f ?? 0), u++);
    }
  return !s && n == null && !u && d == null ? null : {
    solar: n,
    batt: u > 0 ? p : null,
    grid: s > 0 ? o : null,
    load: d
  };
}
function Fe(i, t) {
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
class Er extends K {
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
    return Pt`
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
    return e.map((o) => x`
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
    return x`
      <div class="icon-brk">
        ${t.map((r) => {
      const o = r.icon ?? (br(r.label) ? "mdi:transmission-tower" : mr(r.label)), s = wr(r.color) ? "swatch-icon-dark" : "";
      return x`
            <span class="icon-brk-item">
              ${r.color ? x`<span
                    class="icon-brk-swatch ${fr(r.label) ? "fill-hc" : ""} ${s}"
                    style="background-color:${r.color}"
                  >
                    ${o ? x`<ha-icon icon=${o}></ha-icon>` : _}
                  </span>` : o ? x`<ha-icon icon=${o}></ha-icon>` : _}
              <span>${r.label}</span>&nbsp;<b>${r.value}</b>
              ${e > 0 && r.rawV != null ? x`<span class="icon-brk-pct">(${Math.round(Number(r.rawV) / e * 100)}%)</span>` : _}
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
      return x`
        <div class="cons-strip">
          <div class="cons-strip-cap">${this.title}</div>
          <p class="empty">${this.emptyLabel || "—"}</p>
        </div>
      `;
    const e = Math.max(0, Math.min(100, Number(this.fillPercent) || 0));
    return x`
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
customElements.get("hub-energy-strip") || customElements.define("hub-energy-strip", Er);
class Pr extends K {
  static get properties() {
    return {
      i18n: { attribute: !1 },
      data: { attribute: !1 },
      /** When true, power history panel is open (for aria-expanded). */
      graphOpen: { type: Boolean }
    };
  }
  static get styles() {
    return Pt`
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
    t.gridSigned != null && e > 0 && r.push({ w: e, c: Tt, t: `${this.i18n.segImport} +${C(e)}` }), t.battDis != null && t.battDis > 0 && r.push({ w: t.battDis, c: ot, t: `${this.i18n.segBattDis} +${C(t.battDis)}` }), t.solar != null && t.solar > 0 && r.push({ w: t.solar, c: rt, t: `${this.i18n.segSolar} ${C(t.solar)}` });
    const o = r.reduce((d, p) => d + p.w, 0), s = t.gridSigned != null ? C(t.gridSigned) : t.exportW != null && t.exportW > 0 ? C(-t.exportW) : "—", a = t.solar != null ? C(t.solar) : "—", l = t.battDis != null || t.battChg != null ? (t.battDis ?? 0) - (t.battChg ?? 0) : null, n = l != null ? C(l) : "—", h = t.load != null ? C(t.load) : "—";
    return x`
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
            ${o > 1 ? r.map((d) => x`
                  <span
                    class="pnl-seg"
                    style="width:${(d.w / o * 100).toFixed(1)}%;background:${d.c}"
                    title=${d.t}
                  ></span>
                `) : x`<span
                  class="pnl-seg"
                  style="width:100%;background:color-mix(in srgb, var(--divider-color) 85%, transparent)"
                  title="—"
                ></span>`}
          </div>
          <div class="pnl-load-overlay">${h} ${this.i18n.loadConsumed}</div>
        </div>
        <div class="icon-brk">
          <span class="icon-brk-item">
            <span class="icon-brk-swatch" style="background-color:${Tt}">
              <ha-icon icon="mdi:transmission-tower"></ha-icon>
            </span>
            <span>${this.i18n.colGrid}</span>&nbsp;<b>${s}</b>
          </span>
          <span class="icon-brk-item">
            <span class="icon-brk-swatch" style="background-color:${rt}">
              <ha-icon icon="mdi:weather-sunny"></ha-icon>
            </span>
            <span>${this.i18n.colSolar}</span>&nbsp;<b>${a}</b>
          </span>
          <span class="icon-brk-item" title=${this.i18n.colBattTip || _}>
            <span class="icon-brk-swatch" style="background-color:${ot}">
              <ha-icon icon="mdi:battery"></ha-icon>
            </span>
            <span>${this.i18n.colBatt}</span>&nbsp;<b>${n}</b>
          </span>
        </div>
      </div>
    `;
  }
}
customElements.get("hub-power-now") || customElements.define("hub-power-now", Pr);
class Br extends K {
  static get properties() {
    return {
      i18n: { attribute: !1 },
      data: { attribute: !1 },
      numberLocale: { type: String, attribute: "number-locale" }
    };
  }
  static get styles() {
    return Pt`
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
          time: Te(r / o * 60)
        };
    } else if (t.dischargeW != null && t.dischargeW > 0) {
      const e = t.capacity * (t.soc ?? 0) / 100, r = t.dischargeW / 1e3;
      if (r > 0)
        return {
          icon: "mdi:battery-low",
          time: Te(e / r * 60)
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
    const o = Math.max(0, Math.min(100, Number(t.soc))), s = Math.min(r, Math.max(e, o));
    let a = s;
    const l = t.capacity, n = t.available;
    if (n != null && Number.isFinite(n) && l > 0) {
      const y = e + n / l * 100;
      a = Math.min(Math.max(y, e), s, r);
    }
    const h = n != null && Number.isFinite(n) ? n : l * Math.max(0, s - e) / 100, d = Math.round(o).toLocaleString(this.numberLocale ?? "fr-FR"), p = `${this._fmtKwh(h)} / ${this._fmtKwh(l)} kWh (${d} %)`, u = this._flowMode(t), b = u === "charging" ? "batt-green--charging" : u === "discharging" ? "batt-green--discharging" : "", f = 18, m = 100 / f, B = (y) => Math.max(0, Math.min(1, y)), $ = (y, S, v, g) => Math.max(0, Math.min(S, g) - Math.max(y, v)), A = Array.from({ length: f }, (y, S) => {
      const v = S * m, g = (S + 1) * m, P = $(v, g, v, e) / m * 100, L = $(v, g, r, g) / m * 100, M = Math.max(v, e), k = Math.min(g, a, r), G = $(v, g, M, k) / m * 100, F = B((M - v) / m) * 100, E = `--hatch-l:${P.toFixed(3)};--hatch-r:${L.toFixed(3)};--fill-x:${F.toFixed(
        3
      )};--fill-w:${G.toFixed(3)};`;
      return x`<div class="batt-cell" style="${E}">
        <div class="batt-cell-hatch batt-cell-hatch--left"></div>
        <div class="batt-cell-hatch batt-cell-hatch--right"></div>
        <div class="batt-cell-fill"></div>
      </div>`;
    }), w = this._resolveEta();
    return x`
      <div class="batt-bar-container">
        <div class="batt-section-head">
          <h3>${this.i18n.battSocTitle}</h3>
        </div>
        <div class="batt-track-wrap" title="${Math.round(o)} % SOC">
          <div class="batt-track">
            <div class="batt-segments ${b}">${A}</div>
          </div>
          <div class="batt-bar-total">
            <div class="batt-bar-stack">
              <div class="batt-bar-row-main">
                <span class="batt-bar-total-text">${p}</span>
              </div>
              ${w ? x`<div class="batt-bar-eta-inline">
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
customElements.get("hub-energie-battery-bar") || customElements.define("hub-energie-battery-bar", Br);
class Fr extends K {
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
    return Pt`
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
    return x`
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
customElements.get("hub-insight-bar") || customElements.define("hub-insight-bar", Fr);
const se = [24, 12, 6, 3, 1], ae = 6, Hr = 100, Mr = 12, Cr = 168;
function St(i) {
  if (!Number.isFinite(i)) return ae;
  const t = Math.trunc(i);
  return se.includes(t) ? t : se.reduce(
    (e, r) => Math.abs(r - t) < Math.abs(e - t) ? r : e,
    ae
  );
}
function Nr(i, t, e, r) {
  const o = Math.max(0, Number(t) || 0), s = Math.max(0, Number(e) || 0), a = Math.max(0, Number(r) || 0), l = Math.max(0, Number(i) || 0);
  if (l < 1e-6) return { b: 0, g: 0, s: 0 };
  const n = s + o + a;
  if (n > l + 1e-6) {
    const b = l / n;
    return { b: s * b, g: o * b, s: a * b };
  }
  let h = Math.min(s, l), d = l - h, p = Math.min(o, d);
  d -= p;
  let u = Math.min(a, d);
  return d -= u, d > 1 && (u += d), { b: h, g: p, s: u };
}
function Lr(i) {
  const t = i.length, e = new Array(t), r = new Array(t), o = new Array(t);
  for (let s = 0; s < t; s++) {
    const a = i[s];
    let n = a.load != null && Number.isFinite(a.load) ? Math.max(0, a.load) : NaN;
    const h = Math.max(0, a.grid ?? 0), d = Math.max(0, a.batt ?? 0), p = Math.max(0, a.solar ?? 0);
    Number.isFinite(n) || (n = h + d + p);
    const u = Nr(n, a.grid ?? 0, a.batt ?? 0, a.solar ?? 0);
    e[s] = u.b, r[s] = u.g, o[s] = u.s;
  }
  return { sliceBatt: e, sliceGrid: r, sliceSolar: o };
}
async function Dr(i, t, e, r, o) {
  const s = /^\d{4}-\d{2}-\d{2}$/.test(String(t)) ? String(t) : H(), a = /^\d{4}-\d{2}-\d{2}$/.test(String(e)) ? String(e) : H();
  let l = V(s), n = V(jt(a, 1));
  Number.isFinite(l.getTime()) || (l = V(H())), Number.isFinite(n.getTime()) || (n = V(jt(H(), 1)));
  const h = new URLSearchParams({
    filter_entity_id: r.join(","),
    end_time: n.toISOString()
  }), d = `history/period/${encodeURIComponent(l.toISOString())}?${h}`, p = await i.callApi("GET", d), u = /* @__PURE__ */ new Map(), b = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), B = new Set(r);
  for (const y of Array.isArray(p) ? p : [])
    if (Array.isArray(y))
      for (const S of y) {
        const v = S?.entity_id;
        if (!v || !B.has(v)) continue;
        const g = Date.parse(S?.last_changed ?? S?.last_updated ?? "");
        if (!Number.isFinite(g)) continue;
        const P = pr(g), L = parseFloat(S?.state);
        if (Number.isFinite(L)) {
          u.has(v) || u.set(v, /* @__PURE__ */ new Map());
          const k = u.get(v), G = k.get(P);
          (!G || g >= G.ts) && k.set(P, { ts: g, v: L });
        }
        if (v === o && S?.attributes && typeof S.attributes == "object") {
          for (const k of Ge) {
            const G = parseFloat(S.attributes?.[k]);
            if (!Number.isFinite(G)) continue;
            b.has(k) || b.set(k, /* @__PURE__ */ new Map());
            const F = b.get(k), E = F.get(P);
            (!E || g >= E.ts) && F.set(P, { ts: g, v: G });
          }
          for (const k of Ae) {
            const G = S.attributes?.[k];
            if (!G || typeof G != "object") continue;
            f.has(k) || f.set(k, /* @__PURE__ */ new Map());
            const F = f.get(k), E = F.get(P);
            (!E || g >= E.ts) && F.set(P, { ts: g, dict: G });
          }
        }
        const M = m.get(v);
        (!M || g > M.ts) && m.set(v, { ts: g, state: S });
      }
  const $ = (y) => [...y?.values() ?? []].reduce((S, v) => S + (v?.v ?? 0), 0), A = (y) => {
    if (!y) return {};
    const S = {};
    for (const v of y.values())
      if (!(!v?.dict || typeof v.dict != "object"))
        for (const [g, P] of Object.entries(v.dict)) {
          const L = typeof P == "number" ? P : parseFloat(P);
          Number.isFinite(L) && (S[g] = (S[g] ?? 0) + L);
        }
    return S;
  }, w = {};
  for (const y of B) {
    const v = { ...m.get(y)?.state?.attributes ?? {} };
    if (y === o) {
      for (const g of Ge) v[g] = $(b.get(g));
      for (const g of Ae) v[g] = A(f.get(g));
    }
    w[y] = {
      entity_id: y,
      state: String($(u.get(y))),
      attributes: v
    };
  }
  return w;
}
class Rr extends K {
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
    return Pt`
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
    super(), this._config = {}, this._date = H(), this._rangePreset = "day", this._showRaw = !1, this._hist = null, this._histLoading = !1, this._histErr = null, this._prefixCache = null, this.__lastKey = null, this._powerGraphOpen = !1, this._powerGraphLoading = !1, this._powerGraphErr = null, this._powerGraphSeries = null, this._powerGraphHoverIdx = null, this._powerGraphTooltipXPct = null, this._hassRetryTimer = null, this._costMissingSinceMs = null, this._powerGraphPollTimer = null, this._powerGraphLoadId = 0, this._powerGraphRollingHours = ae, this._powerGraphRollingInited = !1;
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
    if (this._clearPowerGraphPollTimer(), !this._powerGraphOpen || !this.hass || (this._date ?? H()) !== H()) return;
    const e = parseFloat(this._config?.power_history_refresh_seconds), r = Number.isFinite(e) && e > 0 ? Math.max(15e3, Math.min(3e5, Math.round(e * 1e3))) : 12e4;
    this._powerGraphPollTimer = window.setInterval(() => {
      this._powerGraphOpen && this.hass && this._loadPowerGraph({ refresh: !0 });
    }, r);
  }
  _setPowerGraphRollingHours(t) {
    const e = St(t);
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
    if (oe(r, t))
      return this._costMissingSinceMs = null, !1;
    if (e.connected === !1)
      return this._scheduleHassRetry(), !0;
    if ((r && typeof r == "object" ? Object.keys(r).length : 0) === 0)
      return this._scheduleHassRetry(), !0;
    const s = performance.now();
    return this._costMissingSinceMs == null && (this._costMissingSinceMs = s), s - this._costMissingSinceMs < 1800 ? (this._scheduleHassRetry(), !0) : !1;
  }
  setConfig(t) {
    if (this._config = t ?? {}, this._prefixCache = null, this.__lastKey = null, !this._powerGraphRollingInited) {
      const e = parseFloat(this._config?.power_history_hours);
      this._powerGraphRollingHours = St(Number.isFinite(e) ? e : NaN), this._powerGraphRollingInited = !0;
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
          if (!oe(this.hass.states, e.cost))
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
    const e = t.querySelector(".power-graph-svg-wrap"), r = e?.querySelector("svg"), o = this._powerGraphDisplaySeries(), s = e?.getBoundingClientRect(), a = r?.getBoundingClientRect();
    if (!o?.pts?.length || !s?.width || !a?.width) return;
    const l = o.pts.length, n = Math.max(0, Math.min(l - 1, this._powerGraphHoverIdx)), h = l <= 1 ? 0.5 : n / Math.max(l - 1, 1), d = a.left + h * a.width, p = this._clampPowerGraphTooltipXPct(s, d);
    this._powerGraphTooltipXPct !== p && (this._powerGraphTooltipXPct = p);
  }
  _i18n() {
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? Se.en : Se.fr;
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
    return _r(this._prefix());
  }
  _getRange() {
    return hr(this._date ?? H(), this._rangePreset ?? "day");
  }
  _isLiveMode() {
    const t = this._getRange();
    return (this._rangePreset ?? "day") === "day" && t.endIso === H();
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
      Rt(s.grid_by_slot_kwh),
      Rt(s.maison_by_slot_kwh),
      Rt(s.usage_grid_batt_charge_by_slot_kwh),
      Rt(s.usage_solar_batt_charge_by_slot_kwh),
      e[r.cost]?.last_updated ?? ""
    ].join("|");
    return `${o.map((l) => e[l]?.state ?? "").join("|")}|${a}`;
  }
  _states() {
    return (this._isLiveMode() ? this.hass?.states : this._hist) ?? {};
  }
  _extract() {
    const t = this._states(), e = this._map(), r = t?.[e.cost]?.attributes ?? {}, o = String(r.offer ?? "tempo").toLowerCase(), s = String(r.contract_power ?? ""), a = String(r.current_slot ?? ""), l = r.tempo_days ?? null, n = r.today_color ?? null, h = r.tomorrow_color ?? null, d = {
      solarSurplus: I(t, e.cost, "export_due_to_solar_surplus_kwh"),
      batteryFull: I(t, e.cost, "export_due_to_battery_full_or_absent_kwh"),
      switchLatency: I(t, e.cost, "export_due_to_switch_latency_kwh"),
      unattributed: I(t, e.cost, "export_unattributed_kwh"),
      oppTotalEur: I(t, e.cost, "export_opportunity_cost_total_eur"),
      oppSolarEur: I(t, e.cost, "export_opportunity_cost_solar_surplus_eur"),
      oppBatteryEur: I(t, e.cost, "export_opportunity_cost_battery_full_or_absent_eur"),
      oppLatencyEur: I(t, e.cost, "export_opportunity_cost_switch_latency_eur"),
      oppOtherEur: I(t, e.cost, "export_opportunity_cost_unattributed_eur")
    }, p = r.grid_by_slot_kwh, u = r.maison_by_slot_kwh, b = st.map((g) => ({
      ...g,
      label: O(g.id, o),
      v: re(p, g.id),
      isHc: g.id.endsWith("_hc")
    })), f = st.map((g) => ({
      ...g,
      label: O(g.id, o),
      v: re(u, g.id),
      isHc: g.id.endsWith("_hc")
    })), m = W(t, e.cost), B = st.map((g) => ({
      ...g,
      label: O(g.id, o),
      v: I(t, e.cost, `${g.id}_eur`),
      tooltip: `${re(p, g.id).toFixed(3)} kWh`,
      isHc: g.id.endsWith("_hc")
    })), $ = I(t, e.cost, "abonnement_eur"), A = W(t, e.ecoSolar), w = W(t, e.ecoBatt), y = W(t, e.originGrid), S = W(t, e.originSolar), v = {
      gridDirect: { label: "Réseau direct (maison)", v: W(t, e.usageGridDirect), color: Tt },
      gridBatt: { label: "Réseau → charge batterie", v: W(t, e.usageGridBatt), color: lr },
      solarDirect: { label: "Solaire (maison)", v: W(t, e.usageSolarDirect), color: rt },
      solarBatt: { label: "Solaire → charge batterie", v: W(t, e.usageSolarBatt), color: "#fbc02d" },
      battHome: { label: "Batterie → maison", v: W(t, e.usageBattHome), color: ot }
    };
    return {
      grid: b,
      maison: f,
      totalEur: m,
      costs: B,
      abo: $,
      ecoSolar: A,
      ecoBatt: w,
      og: y,
      os: S,
      usage: v,
      costEntityOk: !!t[e.cost],
      offer: o,
      contractPower: s,
      currentSlot: a,
      tempoDays: l,
      todayColor: n,
      tomorrowColor: h,
      reinj: d,
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
    Dr(this.hass, e.startIso, e.endIso, r, t.cost).then((o) => {
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
      this._powerGraphLoading = !0, this._powerGraphErr = null, this._powerGraphHoverIdx = null, this._powerGraphTooltipXPct = null;
    }
    let a;
    e ? a = this._powerGraphLoadId : (this._powerGraphLoadId += 1, a = this._powerGraphLoadId);
    const l = this._date ?? H(), n = St(this._powerGraphRollingHours), h = l === H();
    let d, p, u = !1, b = "day", f = null, m = 24;
    if (h) {
      b = "rolling", f = n, m = n;
      const A = /* @__PURE__ */ new Date();
      p = A, d = new Date(A.getTime() - n * 60 * 60 * 1e3), u = !0;
    } else if (d = V(l), p = V(jt(l, 1)), !Number.isFinite(d.getTime()) || !Number.isFinite(p.getTime())) {
      !e && this._powerGraphLoadId === a && (this._powerGraphLoading = !1, this._powerGraphErr = this._i18n().noData, this._powerGraphSeries = null);
      return;
    }
    const B = {
      hoursBack: m,
      statsPts: [],
      hasLoadEntity: !1,
      useLiveTail: u,
      windowMode: b,
      rollingHours: f,
      dayIso: l
    }, $ = this._i18n();
    try {
      const A = this.hass.states[s]?.attributes?.power_graph_entity_map, w = A && typeof A == "object" ? A : null, y = $r(w);
      if (!y.length) {
        !e && this._powerGraphLoadId === a && (this._powerGraphErr = $.powerHistoryNoSensors, this._powerGraphSeries = { ...B });
        return;
      }
      const S = await Sr(this.hass, {
        startTimeIso: d.toISOString(),
        endTimeIso: p.toISOString(),
        statisticIds: y,
        period: "5minute"
      });
      if (this._powerGraphLoadId !== a || !this._powerGraphOpen || (this._date ?? H()) !== l || h && St(this._powerGraphRollingHours) !== n) return;
      const v = Gr(w, S);
      if (!v?.filled?.length) {
        !e && this._powerGraphLoadId === a && (this._powerGraphErr = $.powerHistoryNoStatistics, this._powerGraphSeries = {
          ...B,
          hasLoadEntity: typeof w?.load_entity == "string" && w.load_entity.trim() !== ""
        });
        return;
      }
      const g = v.filled, P = 160, M = ((k) => {
        if (k.length <= P) return k;
        const G = k.length / P, F = [];
        for (let E = 0; E < P; E++)
          F.push(k[Math.floor(E * G)]);
        return F;
      })(g);
      if (this._powerGraphLoadId === a) {
        this._powerGraphSeries = {
          hoursBack: m,
          statsPts: M,
          hasLoadEntity: typeof w?.load_entity == "string" && w.load_entity.trim() !== "",
          useLiveTail: u,
          windowMode: b,
          rollingHours: f,
          dayIso: l
        };
        let k = M.length;
        if (u && w) {
          const G = Be(this.hass, w);
          k = Fe(M, G).length;
        }
        if (this._powerGraphHoverIdx != null && k) {
          const G = k - 1;
          this._powerGraphHoverIdx > G && (this._powerGraphHoverIdx = G);
        }
      }
    } catch (A) {
      !e && this._powerGraphLoadId === a && (this._powerGraphErr = A?.message ?? String(A), this._powerGraphSeries = null);
    } finally {
      !e && this._powerGraphLoadId === a && (this._powerGraphLoading = !1), this.__lastKey = null;
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
    const e = t.useLiveTail === !0, o = this._map().cost, s = o ? this.hass?.states[o]?.attributes?.power_graph_entity_map : null, a = s && typeof s == "object" ? s : null, l = e && a && this.hass ? Be(this.hass, a) : null, n = e ? Fe(t.statsPts, l) : t.statsPts, { yMin: h, yMax: d } = Ar(n);
    return {
      hoursBack: t.hoursBack,
      pts: n,
      yMin: h,
      yMax: d,
      hasLoadEntity: t.hasLoadEntity === !0,
      windowMode: t.windowMode ?? "rolling",
      rollingHours: t.rollingHours ?? null,
      dayIso: t.dayIso ?? this._date ?? H(),
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
    const r = (e - t.left) / t.width * 100, o = Mr, s = typeof window < "u" ? window : null, a = s?.visualViewport ?? null, l = Number.isFinite(a?.offsetLeft) ? a.offsetLeft : 0, n = a && Number.isFinite(a.width) && a.width > 0 ? a.width : s?.innerWidth ?? 1e9, h = Math.min(
      Cr,
      Math.max(Hr, n * 0.48)
    );
    let d = Math.max(-8, Math.min(108, r)), p = t.left + d / 100 * t.width;
    if (Number.isFinite(n) && n > 2 * (h + o)) {
      const u = l + h + o, b = l + n - h - o;
      p = Math.max(u, Math.min(b, p)), d = (p - t.left) / t.width * 100;
    }
    return Math.round(d * 10) / 10;
  }
  /** @param {SVGSVGElement} el */
  _updatePowerGraphHoverFromClientX(t, e) {
    const r = this._powerGraphDisplaySeries();
    if (!r?.pts?.length) return;
    const o = t.getBoundingClientRect();
    if (o.width <= 0) return;
    const s = (e - o.left) / o.width, a = r.pts.length, l = Math.max(0, Math.min(a - 1, Math.round(s * Math.max(a - 1, 1)))), h = t.closest(".power-graph-svg-wrap")?.getBoundingClientRect(), d = h && h.width > 0 ? this._clampPowerGraphTooltipXPct(h, e) : a <= 1 ? 50 : l / Math.max(a - 1, 1) * 100;
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
    const s = t.length, a = [];
    for (let h = 0; h < s; h++) {
      const d = Number(t[h] ?? 0), p = s === 1 ? 0 : h / (s - 1) * r, u = o - Math.max(0, d) / e * o;
      a.push({ x: p, y: u });
    }
    return `${`M ${a[0].x.toFixed(2)} ${a[0].y.toFixed(2)} ${a.slice(1).map((h) => `L ${h.x.toFixed(2)} ${h.y.toFixed(2)}`).join(" ")}`} L ${a[a.length - 1].x.toFixed(2)} ${o.toFixed(2)} L 0 ${o.toFixed(2)} Z`;
  }
  _svgLinePath(t, e, r, o, s) {
    if (!t?.length || !Number.isFinite(e) || !Number.isFinite(r) || r <= e) return "";
    const a = r - e, l = t.length, n = [], h = (p) => l === 1 ? 0 : p / (l - 1) * o, d = (p) => s - (Number(p) - e) / a * s;
    for (let p = 0; p < l; p++) {
      const u = Number(t[p]);
      n.push({ x: h(p), y: d(Number.isFinite(u) ? u : 0) });
    }
    return `M ${n[0].x.toFixed(2)} ${n[0].y.toFixed(2)} ${n.slice(1).map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ")}`;
  }
  /** Closed path: curve (same as line) down to chart bottom (y = h), for area fill. */
  _svgAreaFillUnderLine(t, e, r, o, s) {
    const a = this._svgLinePath(t, e, r, o, s);
    if (!a) return "";
    const l = t.length, n = (p) => l === 1 ? 0 : p / (l - 1) * o, h = n(l - 1), d = n(0);
    return `${a} L ${h.toFixed(2)} ${s.toFixed(2)} L ${d.toFixed(2)} ${s.toFixed(2)} Z`;
  }
  /** Band between two value series (watts), same Y scale as line chart. Bottom edge reversed to close. */
  _svgStackedBandPath(t, e, r, o, s, a) {
    if (!t?.length || t.length !== e?.length) return "";
    const l = Math.max(o - r, 1e-9), n = t.length, h = (u) => n === 1 ? 0 : u / (n - 1) * s, d = (u) => a - (Number(u) - r) / l * a;
    let p = "";
    for (let u = 0; u < n; u++) {
      const b = h(u), f = d(Number(e[u]));
      p += u === 0 ? `M ${b.toFixed(2)} ${f.toFixed(2)}` : ` L ${b.toFixed(2)} ${f.toFixed(2)}`;
    }
    for (let u = n - 1; u >= 0; u--) {
      const b = h(u), f = d(Number(t[u]));
      p += ` L ${b.toFixed(2)} ${f.toFixed(2)}`;
    }
    return p += " Z", p;
  }
  _renderPowerGraph(t, e) {
    if (!this._powerGraphOpen) return _;
    const r = Tt, o = rt, s = ot, a = "#2e7d32", l = "var(--primary-text-color, #e0e0e0)";
    if (this._powerGraphLoading)
      return x`<div class="power-graph"><div class="loader">${t.loading}</div></div>`;
    if (this._powerGraphErr)
      return x`<div class="power-graph"><div class="alert">${this._powerGraphErr}</div></div>`;
    const n = this._powerGraphDisplaySeries();
    if (!n?.pts?.length)
      return x`<div class="power-graph"><div class="loader">${t.noData}</div></div>`;
    const h = 320, d = 120, p = n.yMin ?? 0, u = n.yMax ?? 1, b = n.pts.map((T) => T.solar ?? 0), f = n.pts.map((T) => Math.max(0, T.batt ?? 0)), m = n.pts.map((T) => Math.max(0, -(T.batt ?? 0))), B = n.pts.map((T) => T.grid ?? 0), $ = n.hasLoadEntity === !0, A = $ ? n.pts.map((T) => T.load == null ? 0 : T.load) : [], w = (T) => new Intl.DateTimeFormat(e, { hour: "2-digit", minute: "2-digit" }).format(new Date(T)), y = (T) => new Intl.DateTimeFormat(e, { dateStyle: "short", timeStyle: "short" }).format(new Date(T)), S = n.pts[0].ts, v = n.pts[n.pts.length - 1].ts, g = S + (v - S) / 3, P = S + (v - S) * 2 / 3, L = this._svgLinePath(b, p, u, h, d), M = this._svgLinePath(f, p, u, h, d), k = this._svgLinePath(m, p, u, h, d), G = this._svgLinePath(B, p, u, h, d), F = $ && A.length ? this._svgLinePath(A, p, u, h, d) : "";
    let E = "", X = "", J = "";
    if ($ && A.length) {
      const { sliceBatt: T, sliceGrid: U, sliceSolar: Jt } = Lr(n.pts), Yt = T.length, Ct = new Array(Yt).fill(0), Nt = T.slice(), Lt = T.map((vt, c) => vt + U[c]), Qt = T.map((vt, c) => vt + U[c] + Jt[c]);
      E = this._svgStackedBandPath(Ct, Nt, p, u, h, d), X = this._svgStackedBandPath(Nt, Lt, p, u, h, d), J = this._svgStackedBandPath(Lt, Qt, p, u, h, d);
    }
    const ft = `color-mix(in srgb, ${ot} 30%, transparent)`, wt = `color-mix(in srgb, ${Tt} 30%, transparent)`, _t = `color-mix(in srgb, ${rt} 30%, transparent)`, Y = "color-mix(in srgb, var(--divider-color) 70%, transparent)", yt = Math.max(u - p, 1e-9), nt = (T) => d - (T - p) / yt * d, lt = (p + u) / 2, Kt = C(u), R = C(lt), ct = C(p), Ft = nt(lt), Xt = p < 0 && u > 0, pt = nt(0), Q = n.pts.length, z = this._powerGraphHoverIdx, j = z != null && z >= 0 && z < Q ? n.pts[z] : null, Ht = Q <= 1 ? h / 2 : (z ?? 0) / Math.max(Q - 1, 1) * h, qt = this._powerGraphTooltipXPct != null ? this._powerGraphTooltipXPct : Q <= 1 ? 50 : (z ?? 0) / Math.max(Q - 1, 1) * 100, Mt = V(n.dayIso), tt = Number.isFinite(Mt.getTime()) ? new Intl.DateTimeFormat(e, { dateStyle: "medium" }).format(Mt) : n.dayIso, xt = String(t.powerHistoryFullDay).replace("{date}", tt), ht = St(this._powerGraphRollingHours), Zt = (this._date ?? H()) === H();
    return x`
      <div class="power-graph">
        <div class="power-graph-head">
          <div class="power-graph-title">${t.powerHistoryTitle ?? "Power history"}</div>
          <div class="power-graph-head-actions">
            ${Zt ? x`<div class="power-graph-window-btns">
                  <span class="range-label">${t.powerHistoryWindow}</span>
                  ${se.map(
      (T) => x`
                      <button
                        type="button"
                        class="range-btn ${ht === T ? "active" : ""}"
                        @click=${() => this._setPowerGraphRollingHours(T)}
                      >
                        ${T}h
                      </button>
                    `
    )}
                </div>` : x`<div class="power-graph-archive-day">${xt}</div>`}
          </div>
        </div>
        <div class="power-graph-chart-wrap">
          <div class="power-yaxis" aria-hidden="true">
            <span>${Kt}</span>
            <span>${R}</span>
            <span>${ct}</span>
          </div>
          <div class="power-graph-svg-wrap">
            ${j ? x`
                  <div class="power-graph-tooltip" style="--power-tooltip-x:${qt}%">
                    <div class="power-graph-tooltip-h">
                      ${t.powerGraphTooltipTime}: ${y(j.ts)}
                    </div>
                    ${$ ? x`
                          <div class="power-graph-tooltip-row">
                            <span class="power-graph-tooltip-k" style="color:${l}"
                              >${t.houseLoad}</span
                            >
                            <span class="power-graph-tooltip-v"
                              >${j.load != null ? C(j.load) : "—"}</span
                            >
                          </div>
                        ` : _}
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${o}"
                        >${t.powerGraphTooltipSolar}</span
                      >
                      <span class="power-graph-tooltip-v">${C(j.solar ?? 0)}</span>
                    </div>
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${s}"
                        >${t.segBattDis}</span
                      >
                      <span class="power-graph-tooltip-v">${C(Math.max(0, j.batt ?? 0))}</span>
                    </div>
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${a}"
                        >${t.segBattChg}</span
                      >
                      <span class="power-graph-tooltip-v">${C(Math.max(0, -(j.batt ?? 0)))}</span>
                    </div>
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${r}"
                        >${t.powerGraphTooltipGrid}</span
                      >
                      <span class="power-graph-tooltip-v">${C(j.grid ?? 0)}</span>
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
              <g class="power-grid-lines" stroke="${Y}" stroke-width="0.75" opacity="0.55" fill="none">
                <line x1="0" y1="0" x2="${h}" y2="0"></line>
                <line x1="0" y1="${Ft}" x2="${h}" y2="${Ft}" stroke-dasharray="3 3"></line>
                <line x1="0" y1="${d}" x2="${h}" y2="${d}"></line>
                ${Xt ? dt`<line
                      x1="0"
                      y1="${pt}"
                      x2="${h}"
                      y2="${pt}"
                      stroke-dasharray="4 3"
                      opacity="0.75"
                    ></line>` : _}
                <line x1="0" y1="0" x2="0" y2="${d}" stroke-width="1"></line>
              </g>
              ${E ? dt`<path
                    d="${E}"
                    fill="${ft}"
                    stroke="none"
                    pointer-events="none"
                  ></path>` : _}
              ${X ? dt`<path
                    d="${X}"
                    fill="${wt}"
                    stroke="none"
                    pointer-events="none"
                  ></path>` : _}
              ${J ? dt`<path
                    d="${J}"
                    fill="${_t}"
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
                d="${k}"
                fill="none"
                stroke="${a}"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
              ></path>
              <path
                d="${M}"
                fill="none"
                stroke="${s}"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
              ></path>
              <path
                d="${L}"
                fill="none"
                stroke="${o}"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
              ></path>
              ${F ? dt`<path
                    d="${F}"
                    fill="none"
                    stroke="${l}"
                    stroke-width="2.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    opacity="1"
                  ></path>` : _}
              ${z != null ? dt`<line
                    pointer-events="none"
                    x1="${Ht}"
                    y1="0"
                    x2="${Ht}"
                    y2="${d}"
                    stroke="${Y}"
                    stroke-width="1"
                    opacity="0.85"
                  ></line>` : _}
            </svg>
          </div>
        </div>
        <div class="power-xaxis">
          <span>${w(S)}</span>
          <span>${w(g)}</span>
          <span>${w(P)}</span>
          <span>${w(v)}</span>
        </div>
        <div class="power-graph-legend" aria-hidden="true">
          ${$ ? x`<span class="power-graph-chip"
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
  _buildPowerNowData(t, e, r) {
    if (!t?.[e]) return null;
    const o = N(t, e, "grid_power_signed_w"), s = N(t, e, "solar_power_w") ?? N(t, e, "solar_estimate_power_w"), a = N(t, e, "batt_discharge_power_w"), l = N(t, e, "batt_charge_power_w"), n = N(t, e, "load_power_w"), h = N(t, e, "export_power_w"), d = [];
    return o != null ? d.push(o >= 0 ? `${r.segImport} ${o.toFixed(0)} W` : `${r.segExport} ${Math.abs(o).toFixed(0)} W`) : h != null && h > 0 && d.push(`${r.segExport} ${h.toFixed(0)} W`), s != null && d.push(`${r.segSolar} ${s.toFixed(0)} W`), a != null && a > 0 && d.push(`${r.segBattDis} ${a.toFixed(0)} W`), l != null && l > 0 && d.push(`${r.segBattChg} ${l.toFixed(0)} W`), {
      gridSigned: o,
      solar: s,
      battDis: a,
      battChg: l,
      load: n,
      exportW: h,
      tooltip: [r.powerBarTip, d.length ? d.join(" · ") : ""].filter(Boolean).join(" — ")
    };
  }
  _buildBatteryData(t, e) {
    const r = N(t, e, "battery_capacity_kwh"), o = N(t, e, "battery_soc_percent");
    if (r == null || r <= 0 || o == null) return null;
    const s = N(t, e, "battery_soc_min_percent"), a = N(t, e, "battery_soc_max_percent");
    return {
      soc: o,
      socMin: s ?? 0,
      socMax: a ?? 100,
      capacity: r,
      available: N(t, e, "battery_available_kwh"),
      chargeW: N(t, e, "batt_charge_power_w"),
      dischargeW: N(t, e, "batt_discharge_power_w")
    };
  }
  _renderRedHpWarning(t, e, r, o, s) {
    if (e !== "tempo" || r <= 0) return _;
    const l = (t ?? []).find((h) => h.id === "rouge_hp")?.v ?? 0;
    if (l < 0.1) return _;
    const n = (o.solarDirect?.v ?? 0) + (o.solarBatt?.v ?? 0) + (o.battHome?.v ?? 0);
    return l / r < 0.35 || l <= n ? _ : x`<div class="red-hp-banner">⚠️ ${s.redHpWarning}</div>`;
  }
  _renderSlotMapRaw(t, e) {
    if (!t || typeof t != "object") return "—";
    const r = st.map((o) => {
      const s = t[o.id], a = typeof s == "number" ? s : parseFloat(s);
      return Number.isFinite(a) && a > 1e-5 ? { label: O(o.id, e), v: a } : null;
    }).filter(Boolean);
    return r.length ? r.map((o, s) => x`${s > 0 ? x`<br />` : _}${o.label}: ${o.v.toFixed(3)} kWh`) : "—";
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
      return x`<ha-card><div class="loader">${e}</div></ha-card>`;
    }
  }
  _renderCardImpl() {
    const t = this._i18n();
    if (!this.hass) return x`<ha-card></ha-card>`;
    const e = String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? "en-GB" : "fr-FR", r = this._isLiveMode(), o = this._map();
    if (r && !oe(this.hass?.states, o.cost))
      return this._liveBootstrapWaiting(o.cost) ? x`
          <ha-card>
            <div class="header"><h2>Hub Énergie</h2></div>
            <div class="loader">${t.waitingHassBootstrap}</div>
          </ha-card>
        ` : x`
        <ha-card>
          <div class="header"><h2>Hub Énergie</h2></div>
          <div class="alert">
            Capteur <code>${o.cost}</code> introuvable.<br />
            Ajoutez dans la carte : <code>cost_entity: sensor.hub_energie_cost_detail</code><br />
            (Outils de développement → États, cherchez « hub energie cost detail »).
          </div>
        </ha-card>
      `;
    const s = this._getRange(), {
      grid: a,
      maison: l,
      totalEur: n,
      costs: h,
      abo: d,
      ecoSolar: p,
      ecoBatt: u,
      og: b,
      os: f,
      usage: m,
      costEntityOk: B,
      offer: $,
      contractPower: A,
      currentSlot: w,
      tempoDays: y,
      todayColor: S,
      tomorrowColor: v,
      reinj: g,
      gridBattBySlot: P,
      solarBattBySlot: L
    } = this._extract(), M = a.reduce((c, D) => c + D.v, 0), k = l.reduce((c, D) => c + D.v, 0), G = a.filter((c) => c.v > 1e-3), F = h.filter((c) => c.v > 5e-4), E = p + u, X = Dt([M, ...a.map((c) => c.v), m.gridDirect.v, m.gridBatt.v]), J = m.gridDirect.v, ft = Math.max(0, m.solarDirect.v - m.solarBatt.v), wt = m.battHome.v, _t = J + ft + wt, Y = Dt([_t, J, ft, wt]), yt = m.gridBatt.v + m.solarBatt.v, nt = B ? Pe($, P) : [], lt = B ? Pe($, L) : [], Kt = B && (nt.length > 0 || lt.length > 0), R = [];
    if (Kt) {
      if (lt.length) {
        const c = lt.reduce((D, de) => D + (Number.isFinite(de?.v) ? de.v : 0), 0);
        c > 1e-5 && R.push({
          label: t.brkTblSolar,
          v: c,
          color: m.solarBatt.color,
          isHc: !1
        });
      } else m.solarBatt.v > 1e-3 && R.push({
        label: t.brkTblSolar,
        v: m.solarBatt.v,
        color: m.solarBatt.color,
        isHc: !1
      });
      if (nt.length)
        for (const c of nt)
          R.push({
            label: `${t.brkTblGridHome} · ${c.label}`,
            v: c.v,
            color: c.color,
            isHc: c.isHc
          });
      else m.gridBatt.v > 1e-3 && R.push({
        label: t.brkTblGridHome,
        v: m.gridBatt.v,
        color: m.gridBatt.color,
        isHc: !1
      });
    } else
      m.gridBatt.v > 1e-3 && R.push({
        label: t.brkTblGridHome,
        v: m.gridBatt.v,
        color: m.gridBatt.color,
        isHc: !1
      }), m.solarBatt.v > 1e-3 && R.push({
        label: t.brkTblSolar,
        v: m.solarBatt.v,
        color: m.solarBatt.color,
        isHc: !1
      });
    const ct = Dt([
      yt,
      ...R.map((c) => c.v)
    ]), Ft = G.map((c) => ({ value: c.v, color: c.color, className: c.isHc ? "fill-hc" : "" })), Xt = G.map((c) => ({
      label: O(c.id, $),
      value: X(c.v),
      color: c.color,
      rawV: c.v
    })), pt = [
      { label: t.brkTblGridHome, v: J, color: m.gridDirect.color },
      { label: t.brkTblSolar, v: ft, color: m.solarDirect.color },
      { label: t.brkTblBattHome, v: wt, color: m.battHome.color }
    ].filter((c) => c.v > 1e-3), Q = pt.map((c) => ({ value: c.v, color: c.color })), z = pt.map((c) => ({
      label: c.label,
      value: Y(c.v),
      color: c.color,
      rawV: c.v
    })), j = R.map((c) => ({
      value: c.v,
      color: c.color,
      className: c.isHc ? "fill-hc" : ""
    })), Ht = R.map((c) => ({
      label: c.label,
      value: ct(c.v),
      color: c.color,
      rawV: c.v
    })), qt = [
      ...F.map((c) => ({ value: c.v, color: c.color, className: c.isHc ? "fill-hc" : "" })),
      ...d > 5e-4 ? [{ value: d, color: ke }] : []
    ], Mt = [
      ...F.map((c) => ({ label: O(c.id, $), value: `${c.v.toFixed(2)} €`, color: c.color, rawV: c.v })),
      ...d > 5e-4 ? [{ label: t.costSubscription, value: `${d.toFixed(2)} €`, color: ke, rawV: d }] : []
    ], tt = [
      { label: "Surplus PV", v: g.solarSurplus, eur: g.oppSolarEur, color: rt },
      { label: "Batt pleine", v: g.batteryFull, eur: g.oppBatteryEur, color: ot },
      { label: "Latence batt", v: g.switchLatency, eur: g.oppLatencyEur, color: "#ff7043" },
      { label: "Autre", v: g.unattributed, eur: g.oppOtherEur, color: "#90a4ae" }
    ].filter((c) => c.v > 1e-4), xt = tt.reduce((c, D) => c + D.v, 0), ht = Dt([xt, ...tt.map((c) => c.v)]), Zt = tt.map((c) => ({ value: c.v, color: c.color })), T = tt.map((c) => ({
      label: c.label,
      value: `${ht(c.v)} · ${c.eur.toFixed(2)} €`,
      color: c.color,
      rawV: c.v
    })), U = [
      { label: t.ecoSourceSolar, vAbs: Math.abs(p), color: rt, fmt: `${p >= 0 ? "+" : ""}${p.toFixed(2)} €`, rawV: p },
      { label: t.ecoSourceBatt, vAbs: Math.abs(u), color: ot, fmt: `${u >= 0 ? "+" : ""}${u.toFixed(2)} €`, rawV: u }
    ].filter((c) => c.vAbs > 5e-4), Jt = U.reduce((c, D) => c + D.vAbs, 0), Yt = U.length ? U.map((c) => ({ value: c.vAbs, color: c.color })) : Math.abs(E) > 5e-4 ? [{ value: 1, color: E >= 0 ? "#1976d2" : "#c62828" }] : [], Ct = U.length ? U.map((c) => ({ label: c.label, value: c.fmt, color: c.color, rawV: c.vAbs })) : [], Nt = this._states(), Lt = r && B ? this._buildPowerNowData(Nt, o.cost, t) : null, Qt = B && this.hass?.states ? this._buildBatteryData(this.hass.states, o.cost) : null, vt = g.solarSurplus + g.batteryFull + g.switchLatency + g.unattributed;
    return x`
      <ha-card>
        <div class="header">
          <div class="header-title-side">
            <h2>Hub Énergie</h2>
            <span class="header-subtitle">${yr($)}${A ? ` ${A}kVA` : ""}</span>
          </div>
          <div class="controls">
            <label>${t.date}</label>
            <input type="date" .value=${this._date} max=${H()} @change=${this._onDateChange} />
            <label>${t.range}</label>
            <div class="range-btns">
              ${["day", "week", "month", "year"].map((c) => x`
                <button class="range-btn ${this._rangePreset === c ? "active" : ""}" @click=${() => this._setRangePreset(c)}>
                  ${t[c]}
                </button>
              `)}
            </div>
            <span class="range-label">${dr(s.startIso, s.endIso, e)}</span>
            <button class="btn" @click=${this._onRawToggle}>${this._showRaw ? t.hide : t.details}</button>
          </div>
        </div>

        ${this._histLoading ? x`<div class="loader">${t.loading}</div>` : _}

        <div class="meta-tempo-wrap">
          <div class="meta-days-stack">
            <div class="day-tile ${$ === "tempo" ? Ee(S) : "color-na"}">
              <span class="day-tile-line">${t.today} : ${O(w, $)}</span>
            </div>
            <div class="day-tile ${$ === "tempo" ? Ee(v) : "color-na"}">
              <span class="day-tile-line">${t.tomorrow} : ${$ === "tempo" ? xr(v) : "—"}</span>
            </div>
          </div>
          ${$ === "tempo" && y && typeof y == "object" ? x`
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
          .data=${Lt}
          .graphOpen=${this._powerGraphOpen}
          @hub-power-now-toggle=${() => this._togglePowerGraph()}
        ></hub-power-now>
        ${this._renderPowerGraph(t, e)}
        <hub-energie-battery-bar .i18n=${t} .data=${Qt} .numberLocale=${e}></hub-energie-battery-bar>
        <hub-insight-bar .i18n=${t} .totalMaison=${k} .originGrid=${b} .totalEur=${n} .ecoTotal=${E}></hub-insight-bar>
        ${this._renderRedHpWarning(a, $, k, m, t)}

        <section>
          <div class="section-head">
            <h3>Consommation</h3>
            <div class="section-metric">${t.totalEnergy} <b>${ur(k)}</b></div>
          </div>
          <div class="bars">
            <hub-energy-strip
              .title=${t.consStripGridTitle}
              .segments=${Ft}
              .total=${M}
              .formatter=${X}
              .tooltip=${G.map((c) => `${O(c.id, $)}: ${X(c.v)}`).join(" · ")}
              .breakdown=${Xt}
              .showBreakdown=${!0}
              .displayValue=${X(M)}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>

            <hub-energy-strip
              .title=${t.consStripHomeTitle}
              .segments=${Q}
              .total=${_t}
              .formatter=${Y}
              .tooltip=${pt.map((c) => `${c.label}: ${Y(c.v)}`).join(" · ")}
              .breakdown=${z}
              .showBreakdown=${!0}
              .displayValue=${Y(_t)}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>

            <hub-energy-strip
              .title=${t.consStripBattTitle}
              .segments=${j}
              .total=${yt}
              .formatter=${ct}
              .tooltip=${R.map((c) => `${c.label}: ${ct(c.v)}`).join(" · ")}
              .breakdown=${Ht}
              .showBreakdown=${!0}
              .displayValue=${ct(yt)}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>
          </div>
        </section>

        <section>
          <div class="bars">
            <hub-energy-strip
              .title=${t.costStripTitle}
              .segments=${qt}
              .total=${n}
              .formatter=${(c) => `${Number(c).toFixed(2)} €`}
              .tooltip=${[
      ...F.map((c) => `${O(c.id, $)}: ${c.v.toFixed(2)} €${c.tooltip ? ` (${c.tooltip})` : ""}`),
      ...d > 5e-4 ? [`${t.costSubscription}: ${d.toFixed(2)} €`] : []
    ].join(" · ")}
              .breakdown=${Mt}
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
              .segments=${Yt}
              .total=${Jt}
              .formatter=${(c) => `${Number(c).toFixed(2)} €`}
              .tooltip=${U.map((c) => `${c.label}: ${c.fmt}`).join(" · ")}
              .breakdown=${Ct.length ? Ct : [{ label: "—", value: `${E >= 0 ? "+" : ""}${E.toFixed(2)} €` }]}
              .showBreakdown=${!0}
              .displayValue=${`${E >= 0 ? "+" : ""}${E.toFixed(2)} €`}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>
          </div>
        </section>

        <section>
          <div class="bars">
            <hub-energy-strip
              .title=${t.reinjStripTitle}
              .segments=${Zt}
              .total=${xt}
              .formatter=${ht}
              .tooltip=${tt.map((c) => `${c.label}: ${ht(c.v)} · ${c.eur.toFixed(2)} €`).join(" · ")}
              .breakdown=${T}
              .showBreakdown=${!0}
              .displayValue=${`${ht(xt)} · ${g.oppTotalEur.toFixed(2)} €`}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>
          </div>
        </section>

        ${this._showRaw ? x`
              <section>
                <h3>Données brutes</h3>
                <div class="raw">
                  <div class="raw-grid">
                    <div>
                      <b>Réseau / Maison</b>
                      Réseau total : ${M.toFixed(3)} kWh<br />
                      Maison total : ${k.toFixed(3)} kWh
                    </div>
                    <div>
                      <b>Coût</b>
                      Total : ${n.toFixed(3)} €<br />
                      Abonnement : ${d.toFixed(3)} €
                    </div>
                    <div>
                      <b>Origine</b>
                      Réseau : ${b.toFixed(3)} kWh<br />
                      Solaire : ${f.toFixed(3)} kWh
                    </div>
                    <div>
                      <b>Économies</b>
                      Solaire : ${p.toFixed(3)} €<br />
                      Batterie : ${u.toFixed(3)} €
                    </div>
                    <div>
                      <b>Import par créneau</b>
                      ${G.length > 0 ? G.map((c, D) => x`${D > 0 ? x`<br />` : _}${O(c.id, $)}: ${c.v.toFixed(3)} kWh`) : "—"}
                    </div>
                    <div>
                      <b>Coût par créneau</b>
                      ${F.length > 0 ? F.map((c, D) => x`${D > 0 ? x`<br />` : _}${O(c.id, $)}: ${c.v.toFixed(3)} €`) : "—"}
                    </div>
                    <div>
                      <b>Usage détaillé (kWh)</b>
                      Réseau direct (maison) : ${m.gridDirect.v.toFixed(3)}<br />
                      Réseau → charge batterie : ${m.gridBatt.v.toFixed(3)}<br />
                      Solaire (maison) : ${m.solarDirect.v.toFixed(3)}<br />
                      Solaire → charge batterie : ${m.solarBatt.v.toFixed(3)}<br />
                      Batterie → maison : ${m.battHome.v.toFixed(3)}
                    </div>
                    <div>
                      <b>Charge batt (réseau) par créneau</b>
                      ${this._renderSlotMapRaw(P, $)}
                    </div>
                    <div>
                      <b>Charge batt (solaire) par créneau</b>
                      ${this._renderSlotMapRaw(L, $)}
                    </div>
                    <div>
                      <b>Réinjection par cause</b>
                      Surplus PV : ${g.solarSurplus.toFixed(3)} kWh / ${g.oppSolarEur.toFixed(3)} €<br />
                      Batt pleine/absente : ${g.batteryFull.toFixed(3)} kWh / ${g.oppBatteryEur.toFixed(3)} €<br />
                      Latence batt : ${g.switchLatency.toFixed(3)} kWh / ${g.oppLatencyEur.toFixed(3)} €<br />
                      Autre : ${g.unattributed.toFixed(3)} kWh / ${g.oppOtherEur.toFixed(3)} €<br />
                      Total : ${vt.toFixed(3)} kWh / ${g.oppTotalEur.toFixed(3)} €
                    </div>
                  </div>
                </div>
              </section>
            ` : _}
      </ha-card>
    `;
  }
}
const Or = "2026.04.04-2";
console.log("[hub-energie-card]", Or);
customElements.get("hub-energie-card") || customElements.define("hub-energie-card", Rr);
window.customCards ??= [];
window.customCards.push({
  type: "hub-energie-card",
  name: "Hub Énergie",
  description: "Daily energy, cost and savings. Config: cost_entity: sensor.hub_energie_cost_detail",
  preview: !1,
  documentationURL: "https://gitlab.com/zzcyph1/home-assistant/hub-energie"
});
