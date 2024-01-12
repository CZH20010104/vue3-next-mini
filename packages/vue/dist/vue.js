var Vue = (function (exports) {
    'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    var isArray = Array.isArray;
    var isObject = function (val) {
        return val !== null && typeof val === 'object';
    };
    /**
     * 对比两个数据是否发生变化
     */
    var hasChanged = function (value, oldValue) {
        return !Object.is(value, oldValue);
    };
    var isFunction = function (val) {
        return typeof val === 'function';
    };
    var isString = function (val) { return typeof val === 'string'; };
    var extend = Object.assign;
    var EMPTY_OBJ = {};
    var onRE = /^on[^a-z]/;
    var isOn = function (key) { return onRE.test(key); };

    var createDep = function (effects) {
        var dep = new Set(effects);
        return dep;
    };

    var targetMap = new WeakMap();
    function effect(fn, options) {
        var _effect = new ReactiveEffect(fn);
        if (options) {
            extend(_effect, options);
        }
        if (!options || !options.lazy) {
            _effect.run();
        }
    }
    var activeEffect;
    var ReactiveEffect = /** @class */ (function () {
        function ReactiveEffect(fn, scheduler) {
            if (scheduler === void 0) { scheduler = null; }
            this.fn = fn;
            this.scheduler = scheduler;
        }
        ReactiveEffect.prototype.run = function () {
            activeEffect = this;
            return this.fn();
        };
        ReactiveEffect.prototype.stop = function () { };
        return ReactiveEffect;
    }());
    /**
     * 收集依赖
     * @param target
     * @param key
     */
    function track(target, key) {
        if (!activeEffect)
            return;
        var depsMap = targetMap.get(target);
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()));
        }
        var dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = createDep()));
        }
        trackEffects(dep);
    }
    /**
     * 利用dep依次跟踪指定的key的所有effect
     * @param dep
     */
    function trackEffects(dep) {
        dep.add(activeEffect);
    }
    /**
     * 触发依赖
     * @param target
     * @param key
     * @param newValue
     */
    function trigger(target, key, newValue) {
        var depsMap = targetMap.get(target);
        if (!depsMap) {
            return;
        }
        var dep = depsMap.get(key);
        if (!dep) {
            return;
        }
        triggerEffects(dep);
    }
    /**
     * 依次触发dep中保存的依赖
     * @param dep
     */
    function triggerEffects(dep) {
        var e_1, _a, e_2, _b;
        var effects = isArray(dep) ? dep : __spreadArray([], __read(dep), false);
        try {
            // 依次触发依赖
            for (var effects_1 = __values(effects), effects_1_1 = effects_1.next(); !effects_1_1.done; effects_1_1 = effects_1.next()) {
                var effect_1 = effects_1_1.value;
                if (effect_1.computed) {
                    triggerEffect(effect_1);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (effects_1_1 && !effects_1_1.done && (_a = effects_1.return)) _a.call(effects_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        try {
            for (var effects_2 = __values(effects), effects_2_1 = effects_2.next(); !effects_2_1.done; effects_2_1 = effects_2.next()) {
                var effect_2 = effects_2_1.value;
                if (!effect_2.computed) {
                    triggerEffect(effect_2);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (effects_2_1 && !effects_2_1.done && (_b = effects_2.return)) _b.call(effects_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    /**
     * 触发指定依赖
     * @param effect
     */
    function triggerEffect(effect) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }

    var get = createGetter();
    function createGetter() {
        return function get(target, key, receiver) {
            var res = Reflect.get(target, key, receiver);
            track(target, key);
            return res;
        };
    }
    var set = createSetter();
    function createSetter() {
        return function set(target, key, value, receiver) {
            var res = Reflect.set(target, key, value, receiver);
            trigger(target, key);
            return res;
        };
    }
    var mutableHandlers = {
        get: get,
        set: set
    };

    var reactiveMap = new WeakMap();
    function reactive(target) {
        return createReactiveObject(target, mutableHandlers, reactiveMap);
    }
    function createReactiveObject(target, baseHandlers, proxyMap) {
        var existingProxy = proxyMap.get(target);
        if (existingProxy) {
            return existingProxy;
        }
        var proxy = new Proxy(target, baseHandlers);
        proxy["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */] = true;
        proxyMap.set(target, proxy);
        return proxy;
    }
    var toReactive = function (value) {
        return isObject(value) ? reactive(value) : value;
    };
    function isReactive(value) {
        return !!(value && value["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */]);
    }

    function ref(vaule) {
        return createRef(vaule, false);
    }
    function createRef(rawValue, shallow) {
        if (isRef(rawValue)) {
            return rawValue;
        }
        return new RefImpl(rawValue, shallow);
    }
    var RefImpl = /** @class */ (function () {
        function RefImpl(value, __v_isShallow) {
            this.__v_isShallow = __v_isShallow;
            this.dep = undefined;
            this.__v_isRef = true;
            this._rawValue = value;
            this._value = __v_isShallow ? value : toReactive(value);
        }
        Object.defineProperty(RefImpl.prototype, "value", {
            get: function () {
                trackRefValue(this);
                return this._value;
            },
            set: function (newValue) {
                if (hasChanged(newValue, this._rawValue)) {
                    this._rawValue = newValue;
                    this._value = toReactive(newValue);
                    triggerRefValue(this);
                }
            },
            enumerable: false,
            configurable: true
        });
        return RefImpl;
    }());
    /**
     * 收集依赖
     */
    function trackRefValue(ref) {
        if (activeEffect) {
            trackEffects(ref.dep || (ref.dep = createDep()));
        }
    }
    /**
     * 触发依赖
     */
    function triggerRefValue(ref) {
        if (ref.dep) {
            triggerEffects(ref.dep);
        }
    }
    /**
     * 是否 ref
     *
     */
    function isRef(r) {
        return !!(r && r.__value_isRef === true);
    }

    var ComputedRefImpl = /** @class */ (function () {
        function ComputedRefImpl(getter) {
            var _this = this;
            this.dep = undefined;
            this.__v_isRef = true;
            this._dirty = true;
            this.effect = new ReactiveEffect(getter, function () {
                if (!_this._dirty) {
                    _this._dirty = true;
                    triggerRefValue(_this);
                }
            });
            this.effect.computed = this;
        }
        Object.defineProperty(ComputedRefImpl.prototype, "value", {
            get: function () {
                trackRefValue(this);
                if (this._dirty) {
                    this._dirty = false;
                    this._value = this.effect.run();
                }
                return this._value;
            },
            enumerable: false,
            configurable: true
        });
        return ComputedRefImpl;
    }());
    function computed(getterOrOptions) {
        var getter;
        var onlyGetter = isFunction(getterOrOptions);
        if (onlyGetter) {
            getter = getterOrOptions;
        }
        var cRef = new ComputedRefImpl(getter);
        return cRef;
    }

    var isFlushPending = false;
    var resolvedPromise = Promise.resolve();
    var pendingPreFlushCbs = [];
    function queuePreFlushCb(cb) {
        queueCb(cb);
    }
    function queueCb(cb, pendingQueue) {
        pendingPreFlushCbs.push(cb);
        queueFlush();
    }
    function queueFlush() {
        if (!isFlushPending) {
            isFlushPending = true;
            resolvedPromise.then(flushJobs);
        }
    }
    function flushJobs() {
        isFlushPending = false;
        flushPreFlushCbs();
    }
    function flushPreFlushCbs() {
        if (pendingPreFlushCbs.length) {
            var activePreFlushCbs = __spreadArray([], __read(new Set(pendingPreFlushCbs)), false);
            pendingPreFlushCbs.length = 0;
            for (var i = 0; i < activePreFlushCbs.length; i++) {
                activePreFlushCbs[i]();
            }
        }
    }

    function watch(source, cb, options) {
        return doWatch(source, cb, options);
    }
    function doWatch(source, cb, _a) {
        var _b = _a === void 0 ? EMPTY_OBJ : _a, immediate = _b.immediate, deep = _b.deep;
        var getter;
        if (isReactive(source)) {
            getter = function () { return source; };
            deep = true;
        }
        else {
            getter = function () { };
        }
        if (cb && deep) {
            var baseGetter_1 = getter;
            getter = function () { return traveres(baseGetter_1()); };
        }
        var oldValue = {};
        var job = function () {
            if (cb) {
                var newValue = effect.run();
                if (deep || hasChanged(newValue, oldValue)) {
                    cb(newValue, oldValue);
                    oldValue = newValue;
                }
            }
        };
        var scheduler = function () { return queuePreFlushCb(job); };
        var effect = new ReactiveEffect(getter, scheduler);
        if (cb) {
            if (immediate) {
                job();
            }
            else {
                oldValue = effect.run();
            }
        }
        else {
            effect.run();
        }
        return function () {
            effect.stop();
        };
    }
    function traveres(value) {
        if (!isObject(value)) {
            return value;
        }
        for (var key in value) {
            traveres(value[key]);
        }
        return value;
    }

    function normalizeClass(value) {
        var res = '';
        if (isString(value)) {
            res = value;
        }
        else if (isArray(value)) {
            for (var i = 0; i < value.length; i++) {
                var normalize = normalizeClass(value[i]);
                if (normalize) {
                    res += normalize + ' ';
                }
            }
        }
        else if (isObject(value)) {
            for (var name_1 in value) {
                if (value[name_1]) {
                    res += name_1 + ' ';
                }
            }
        }
        return res.trim();
    }
    function normalizeStyle(value) {
        if (isArray(value)) {
            var res = {};
            for (var i = 0; i < value.length; i++) {
                var item = value[i];
                var normalized = isString(item)
                    ? parseStringStyle(item)
                    : normalizeStyle(item);
                if (normalized) {
                    for (var key in normalized) {
                        res[key] = normalized[key];
                    }
                }
            }
            return res;
        }
        else if (isString(value) || isObject(value)) {
            return value;
        }
    }
    var listDelimiterRE = /;(?![^(]*\))/g;
    var propertyDelimiterRE = /:([^]+)/;
    var styleCommentRE = /\/\*[^]*?\*\//g;
    function parseStringStyle(cssText) {
        var ret = {};
        cssText
            .replace(styleCommentRE, '')
            .split(listDelimiterRE)
            .forEach(function (item) {
            if (item) {
                var tmp = item.split(propertyDelimiterRE);
                tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
            }
        });
        return ret;
    }

    var Fragment = Symbol('Fragment');
    var Text = Symbol('Text');
    var Comment = Symbol('Comment');
    function isVNode(value) {
        return value ? value.__v_isVNode === true : false;
    }
    function createVNode(type, props, children) {
        if (props) {
            var klass = props.class, style = props.style;
            if (klass && !isString(klass)) {
                props.class = normalizeClass(klass);
            }
            if (style && isObject(style)) {
                props.style = normalizeStyle(style);
            }
        }
        var shapeFlag = isString(type)
            ? 1 /* ShapeFlags.ELEMENT */
            : isObject(type)
                ? 4 /* ShapeFlags.STATEFUL_COMPONENT */
                : 0;
        return createBaseVNode(type, props, children, shapeFlag);
    }
    function createBaseVNode(type, props, children, shapeFlag) {
        var vnode = {
            __v_isVNode: true,
            type: type,
            props: props,
            shapeFlag: shapeFlag
        };
        normalizeChildren(vnode, children);
        return vnode;
    }
    function normalizeChildren(vnode, children) {
        var type = 0;
        if (children == null) {
            children = null;
        }
        else if (isArray(children)) {
            type = 16 /* ShapeFlags.ARRAY_CHILDREN */;
        }
        else if (typeof children === 'object') ;
        else if (isFunction(children)) ;
        else {
            children = String(children);
            type = 8 /* ShapeFlags.TEXT_CHILDREN */;
        }
        vnode.children = children;
        vnode.shapeFlag |= type;
    }
    function isSameVNodeType(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key;
    }

    function h(type, propsOrChildren, children) {
        var l = arguments.length;
        if (l === 2) {
            if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
                if (isVNode(propsOrChildren)) {
                    return createVNode(type, null, [propsOrChildren]);
                }
                return createVNode(type, propsOrChildren, []);
            }
            else {
                return createVNode(type, null, propsOrChildren);
            }
        }
        else {
            if (l > 3) {
                children = Array.prototype.slice.call(arguments, 2);
            }
            else if (l === 3 && isVNode(children)) {
                children = [children];
            }
            return createVNode(type, propsOrChildren, children);
        }
    }

    function createRenderer(options) {
        return baseCreateRenderer(options);
    }
    function baseCreateRenderer(options) {
        var hostInsert = options.insert, hostPatchProp = options.patchProp, hostCreateElement = options.createElement, hostSetElementText = options.setElementText, hostRemove = options.remove;
        var processElement = function (oldVNode, newVNode, container, anchor) {
            // 如果旧节点存在就是更新操作  不存在就是挂载操作
            if (oldVNode == null) {
                // 挂载
                mountElement(newVNode, container, anchor);
            }
            else {
                // 更新
                patchElement(oldVNode, newVNode);
            }
        };
        var mountElement = function (vnode, container, anchor) {
            var type = vnode.type, props = vnode.props, shapeFlag = vnode.shapeFlag;
            // 1、创建 element
            var el = (vnode.el = hostCreateElement(type));
            if (shapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
                // 2、设置文本
                hostSetElementText(el, vnode.children);
            }
            // 3、设置props
            if (props) {
                for (var key in props) {
                    hostPatchProp(el, key, null, props[key]);
                }
            }
            // 4、插入
            hostInsert(el, container, anchor);
        };
        var patchElement = function (oldVNode, newVNode) {
            var el = (newVNode.el = oldVNode.el);
            var oldProps = oldVNode.props || EMPTY_OBJ;
            var newProps = newVNode.props || EMPTY_OBJ;
            patchChildren(oldVNode, newVNode, el);
            patchProps(el, newVNode, oldProps, newProps);
        };
        var patchChildren = function (oldVNode, newVNode, container, anchor) {
            var c1 = oldVNode && oldVNode.children;
            var prevShapeFlag = oldVNode ? oldVNode.shapeFlag : 0;
            var c2 = newVNode && newVNode.children;
            var shapeFlag = newVNode.shapeFlag;
            if (shapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
                if (c2 !== c1) {
                    // 挂载新节点的文本
                    hostSetElementText(container, c2);
                }
            }
            else {
                if (prevShapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) ;
                else {
                    if (prevShapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
                        // 删除旧节点的text
                        hostSetElementText(container, '');
                    }
                }
            }
        };
        var patchProps = function (el, vnode, oldProps, newProps) {
            if (oldProps !== newProps) {
                for (var key in newProps) {
                    var next = newProps[key];
                    var prev = oldProps[key];
                    if (next !== prev) {
                        hostPatchProp(el, key, prev, next);
                    }
                }
                if (oldProps !== EMPTY_OBJ) {
                    for (var key in oldProps) {
                        if (!(key in newProps)) {
                            hostPatchProp(el, key, oldProps[key], null);
                        }
                    }
                }
            }
        };
        var patch = function (oldVNode, newVNode, container, anchor) {
            if (anchor === void 0) { anchor = null; }
            if (oldVNode === newVNode) {
                return;
            }
            if (oldVNode && !isSameVNodeType(oldVNode, newVNode)) {
                unmount(oldVNode);
                oldVNode = null;
            }
            var type = newVNode.type, shapeFlag = newVNode.shapeFlag;
            switch (type) {
                case Text:
                    break;
                case Comment:
                    break;
                case Fragment:
                    break;
                default:
                    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                        processElement(oldVNode, newVNode, container, anchor);
                    }
            }
        };
        var unmount = function (vnode) {
            hostRemove(vnode.el);
        };
        var render = function (vnode, container) {
            if (vnode == null) {
                // 卸载
                if (container._vnode) {
                    unmount(container._vnode);
                }
            }
            else {
                patch(container._vnode || null, vnode, container);
            }
            container._vnode = vnode;
        };
        return {
            render: render
        };
    }

    var doc = document;
    var nodeOps = {
        insert: function (child, parent, anchor) {
            parent.insertBefore(child, anchor || null);
        },
        createElement: function (tag) {
            var el = doc.createElement(tag);
            return el;
        },
        setElementText: function (el, text) {
            el.textContent = text;
        },
        remove: function (child) {
            var parent = child.parentNode;
            if (parent) {
                parent.removeChild(child);
            }
        }
    };

    function patchClass(el, value) {
        if (value === null) {
            el.removeAttribute('class');
        }
        else {
            el.className = value;
        }
    }

    function patchDOMProp(el, key, value) {
        try {
            el[key] = value;
        }
        catch (e) { }
    }

    function patchAttr(el, key, value) {
        if (value === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, value);
        }
    }

    var patchProp = function (el, key, prevValue, nextValue) {
        if (key === 'class') {
            patchClass(el, nextValue);
        }
        else if (key === 'style') ;
        else if (isOn(key)) ;
        else if (shouldSetAsProp(el, key)) {
            patchDOMProp(el, key, nextValue);
        }
        else {
            patchAttr(el, key, nextValue);
        }
    };
    function shouldSetAsProp(el, key) {
        if (key === 'form') {
            return false;
        }
        if (key === 'list' && el.tagName === 'INPUT') {
            return false;
        }
        if (key === 'type' && el.tagName === 'TEXTAREA') {
            return false;
        }
        return key in el;
    }

    var rendererOptions = extend({ patchProp: patchProp }, nodeOps);
    var renderer;
    function ensureRenderer() {
        return renderer || (renderer = createRenderer(rendererOptions));
    }
    var render = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        (_a = ensureRenderer()).render.apply(_a, __spreadArray([], __read(args), false));
    };

    exports.Comment = Comment;
    exports.Fragment = Fragment;
    exports.Text = Text;
    exports.computed = computed;
    exports.effect = effect;
    exports.h = h;
    exports.queuePreFlushCb = queuePreFlushCb;
    exports.reactive = reactive;
    exports.ref = ref;
    exports.render = render;
    exports.watch = watch;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=vue.js.map
