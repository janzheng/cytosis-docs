
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function convert (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    function Navaid(base, on404) {
    	var rgx, curr, routes=[], $={};

    	var fmt = $.format = function (uri) {
    		if (!uri) return uri;
    		uri = '/' + uri.replace(/^\/|\/$/g, '');
    		return rgx.test(uri) && uri.replace(rgx, '/');
    	};

    	base = '/' + (base || '').replace(/^\/|\/$/g, '');
    	rgx = base == '/' ? /^\/+/ : new RegExp('^\\' + base + '(?=\\/|$)\\/?', 'i');

    	$.route = function (uri, replace) {
    		if (uri[0] == '/' && !rgx.test(uri)) uri = base + uri;
    		history[(uri === curr || replace ? 'replace' : 'push') + 'State'](uri, null, uri);
    	};

    	$.on = function (pat, fn) {
    		(pat = convert(pat)).fn = fn;
    		routes.push(pat);
    		return $;
    	};

    	$.run = function (uri) {
    		var i=0, params={}, arr, obj;
    		if (uri = fmt(uri || location.pathname)) {
    			uri = uri.match(/[^\?#]*/)[0];
    			for (curr = uri; i < routes.length; i++) {
    				if (arr = (obj=routes[i]).pattern.exec(uri)) {
    					for (i=0; i < obj.keys.length;) {
    						params[obj.keys[i]] = arr[++i] || null;
    					}
    					obj.fn(params); // todo loop?
    					return $;
    				}
    			}
    			if (on404) on404(uri);
    		}
    		return $;
    	};

    	$.listen = function (u) {
    		wrap('push');
    		wrap('replace');

    		function run(e) {
    			$.run();
    		}

    		function click(e) {
    			var x = e.target.closest('a'), y = x && x.getAttribute('href');
    			if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.button || e.defaultPrevented) return;
    			if (!y || x.target || x.host !== location.host) return;
    			if (y[0] != '/' || rgx.test(y)) {
    				e.preventDefault();
    				$.route(y);
    			}
    		}

    		addEventListener('popstate', run);
    		addEventListener('replacestate', run);
    		addEventListener('pushstate', run);
    		addEventListener('click', click);

    		$.unlisten = function () {
    			removeEventListener('popstate', run);
    			removeEventListener('replacestate', run);
    			removeEventListener('pushstate', run);
    			removeEventListener('click', click);
    		};

    		return $.run(u);
    	};

    	return $;
    }

    function wrap(type, fn) {
    	if (history[type]) return;
    	history[type] = type;
    	fn = history[type += 'State'];
    	history[type] = function (uri) {
    		var ev = new Event(type.toLowerCase());
    		ev.uri = uri;
    		fn.apply(this, arguments);
    		return dispatchEvent(ev);
    	};
    }

    /* src/components/Nav.svelte generated by Svelte v3.24.0 */

    const file = "src/components/Nav.svelte";

    function create_fragment(ctx) {
    	let div3;
    	let a0;
    	let h1;
    	let t1;
    	let div2;
    	let div0;
    	let p0;
    	let strong0;
    	let t3;
    	let t4;
    	let p1;
    	let strong1;
    	let t6;
    	let t7;
    	let div1;
    	let a1;
    	let t9;
    	let a2;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			a0 = element("a");
    			h1 = element("h1");
    			h1.textContent = "Cytosis.js";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "Cytosis";
    			t3 = text(" — 'a transport mechanism for the movement of large quantities of molecules into and out of cells'");
    			t4 = space();
    			p1 = element("p");
    			strong1 = element("strong");
    			strong1.textContent = "Cytosis.js";
    			t6 = text(" — 'a transport mechanism for the movement of large quantities of data into and out of Airtable'");
    			t7 = space();
    			div1 = element("div");
    			a1 = element("a");
    			a1.textContent = "Cytosis Documentation demo base";
    			t9 = text(" | \n      ");
    			a2 = element("a");
    			a2.textContent = "Cytosis Editor public base";
    			attr_dev(h1, "class", "svelte-xymv4v");
    			add_location(h1, file, 2, 14, 21);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-xymv4v");
    			add_location(a0, file, 2, 2, 9);
    			attr_dev(strong0, "class", "svelte-xymv4v");
    			add_location(strong0, file, 6, 9, 156);
    			attr_dev(p0, "class", "svelte-xymv4v");
    			add_location(p0, file, 6, 6, 153);
    			attr_dev(strong1, "class", "svelte-xymv4v");
    			add_location(strong1, file, 9, 9, 300);
    			attr_dev(p1, "class", "svelte-xymv4v");
    			add_location(p1, file, 9, 6, 297);
    			attr_dev(div0, "class", "_grid-2 _grid-gap _margin-bottom-2 svelte-xymv4v");
    			add_location(div0, file, 5, 4, 98);
    			attr_dev(a1, "href", "https://airtable.com/shr2ITCNwUa0UCmPH");
    			attr_dev(a1, "class", "svelte-xymv4v");
    			add_location(a1, file, 14, 6, 488);
    			attr_dev(a2, "href", "https://airtable.com/shrW9Hz9VT2zhxDQ7");
    			attr_dev(a2, "class", "svelte-xymv4v");
    			add_location(a2, file, 15, 6, 582);
    			attr_dev(div1, "class", "_margin-bottom-2 svelte-xymv4v");
    			add_location(div1, file, 13, 4, 451);
    			attr_dev(div2, "class", "Header-section _margin-bottom-2 svelte-xymv4v");
    			add_location(div2, file, 3, 2, 47);
    			attr_dev(div3, "class", "svelte-xymv4v");
    			add_location(div3, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, a0);
    			append_dev(a0, h1);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, p0);
    			append_dev(p0, strong0);
    			append_dev(p0, t3);
    			append_dev(div0, t4);
    			append_dev(div0, p1);
    			append_dev(p1, strong1);
    			append_dev(p1, t6);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			append_dev(div1, a1);
    			append_dev(div1, t9);
    			append_dev(div1, a2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Nav", $$slots, []);
    	return [];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    var cytosis = writable(undefined);
    var makers = writable(undefined);
    var dropoff = writable(undefined);
    var content = writable(undefined);

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    function getCjsExportFromNamespace (n) {
    	return n && n['default'] || n;
    }

    var runtime_1 = createCommonjsModule(function (module) {
    /**
     * Copyright (c) 2014-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */

    var runtime = (function (exports) {

      var Op = Object.prototype;
      var hasOwn = Op.hasOwnProperty;
      var undefined$1; // More compressible than void 0.
      var $Symbol = typeof Symbol === "function" ? Symbol : {};
      var iteratorSymbol = $Symbol.iterator || "@@iterator";
      var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
      var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

      function wrap(innerFn, outerFn, self, tryLocsList) {
        // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
        var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
        var generator = Object.create(protoGenerator.prototype);
        var context = new Context(tryLocsList || []);

        // The ._invoke method unifies the implementations of the .next,
        // .throw, and .return methods.
        generator._invoke = makeInvokeMethod(innerFn, self, context);

        return generator;
      }
      exports.wrap = wrap;

      // Try/catch helper to minimize deoptimizations. Returns a completion
      // record like context.tryEntries[i].completion. This interface could
      // have been (and was previously) designed to take a closure to be
      // invoked without arguments, but in all the cases we care about we
      // already have an existing method we want to call, so there's no need
      // to create a new function object. We can even get away with assuming
      // the method takes exactly one argument, since that happens to be true
      // in every case, so we don't have to touch the arguments object. The
      // only additional allocation required is the completion record, which
      // has a stable shape and so hopefully should be cheap to allocate.
      function tryCatch(fn, obj, arg) {
        try {
          return { type: "normal", arg: fn.call(obj, arg) };
        } catch (err) {
          return { type: "throw", arg: err };
        }
      }

      var GenStateSuspendedStart = "suspendedStart";
      var GenStateSuspendedYield = "suspendedYield";
      var GenStateExecuting = "executing";
      var GenStateCompleted = "completed";

      // Returning this object from the innerFn has the same effect as
      // breaking out of the dispatch switch statement.
      var ContinueSentinel = {};

      // Dummy constructor functions that we use as the .constructor and
      // .constructor.prototype properties for functions that return Generator
      // objects. For full spec compliance, you may wish to configure your
      // minifier not to mangle the names of these two functions.
      function Generator() {}
      function GeneratorFunction() {}
      function GeneratorFunctionPrototype() {}

      // This is a polyfill for %IteratorPrototype% for environments that
      // don't natively support it.
      var IteratorPrototype = {};
      IteratorPrototype[iteratorSymbol] = function () {
        return this;
      };

      var getProto = Object.getPrototypeOf;
      var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
      if (NativeIteratorPrototype &&
          NativeIteratorPrototype !== Op &&
          hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
        // This environment has a native %IteratorPrototype%; use it instead
        // of the polyfill.
        IteratorPrototype = NativeIteratorPrototype;
      }

      var Gp = GeneratorFunctionPrototype.prototype =
        Generator.prototype = Object.create(IteratorPrototype);
      GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
      GeneratorFunctionPrototype.constructor = GeneratorFunction;
      GeneratorFunctionPrototype[toStringTagSymbol] =
        GeneratorFunction.displayName = "GeneratorFunction";

      // Helper for defining the .next, .throw, and .return methods of the
      // Iterator interface in terms of a single ._invoke method.
      function defineIteratorMethods(prototype) {
        ["next", "throw", "return"].forEach(function(method) {
          prototype[method] = function(arg) {
            return this._invoke(method, arg);
          };
        });
      }

      exports.isGeneratorFunction = function(genFun) {
        var ctor = typeof genFun === "function" && genFun.constructor;
        return ctor
          ? ctor === GeneratorFunction ||
            // For the native GeneratorFunction constructor, the best we can
            // do is to check its .name property.
            (ctor.displayName || ctor.name) === "GeneratorFunction"
          : false;
      };

      exports.mark = function(genFun) {
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
        } else {
          genFun.__proto__ = GeneratorFunctionPrototype;
          if (!(toStringTagSymbol in genFun)) {
            genFun[toStringTagSymbol] = "GeneratorFunction";
          }
        }
        genFun.prototype = Object.create(Gp);
        return genFun;
      };

      // Within the body of any async function, `await x` is transformed to
      // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
      // `hasOwn.call(value, "__await")` to determine if the yielded value is
      // meant to be awaited.
      exports.awrap = function(arg) {
        return { __await: arg };
      };

      function AsyncIterator(generator, PromiseImpl) {
        function invoke(method, arg, resolve, reject) {
          var record = tryCatch(generator[method], generator, arg);
          if (record.type === "throw") {
            reject(record.arg);
          } else {
            var result = record.arg;
            var value = result.value;
            if (value &&
                typeof value === "object" &&
                hasOwn.call(value, "__await")) {
              return PromiseImpl.resolve(value.__await).then(function(value) {
                invoke("next", value, resolve, reject);
              }, function(err) {
                invoke("throw", err, resolve, reject);
              });
            }

            return PromiseImpl.resolve(value).then(function(unwrapped) {
              // When a yielded Promise is resolved, its final value becomes
              // the .value of the Promise<{value,done}> result for the
              // current iteration.
              result.value = unwrapped;
              resolve(result);
            }, function(error) {
              // If a rejected Promise was yielded, throw the rejection back
              // into the async generator function so it can be handled there.
              return invoke("throw", error, resolve, reject);
            });
          }
        }

        var previousPromise;

        function enqueue(method, arg) {
          function callInvokeWithMethodAndArg() {
            return new PromiseImpl(function(resolve, reject) {
              invoke(method, arg, resolve, reject);
            });
          }

          return previousPromise =
            // If enqueue has been called before, then we want to wait until
            // all previous Promises have been resolved before calling invoke,
            // so that results are always delivered in the correct order. If
            // enqueue has not been called before, then it is important to
            // call invoke immediately, without waiting on a callback to fire,
            // so that the async generator function has the opportunity to do
            // any necessary setup in a predictable way. This predictability
            // is why the Promise constructor synchronously invokes its
            // executor callback, and why async functions synchronously
            // execute code before the first await. Since we implement simple
            // async functions in terms of async generators, it is especially
            // important to get this right, even though it requires care.
            previousPromise ? previousPromise.then(
              callInvokeWithMethodAndArg,
              // Avoid propagating failures to Promises returned by later
              // invocations of the iterator.
              callInvokeWithMethodAndArg
            ) : callInvokeWithMethodAndArg();
        }

        // Define the unified helper method that is used to implement .next,
        // .throw, and .return (see defineIteratorMethods).
        this._invoke = enqueue;
      }

      defineIteratorMethods(AsyncIterator.prototype);
      AsyncIterator.prototype[asyncIteratorSymbol] = function () {
        return this;
      };
      exports.AsyncIterator = AsyncIterator;

      // Note that simple async functions are implemented on top of
      // AsyncIterator objects; they just return a Promise for the value of
      // the final result produced by the iterator.
      exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
        if (PromiseImpl === void 0) PromiseImpl = Promise;

        var iter = new AsyncIterator(
          wrap(innerFn, outerFn, self, tryLocsList),
          PromiseImpl
        );

        return exports.isGeneratorFunction(outerFn)
          ? iter // If outerFn is a generator, return the full iterator.
          : iter.next().then(function(result) {
              return result.done ? result.value : iter.next();
            });
      };

      function makeInvokeMethod(innerFn, self, context) {
        var state = GenStateSuspendedStart;

        return function invoke(method, arg) {
          if (state === GenStateExecuting) {
            throw new Error("Generator is already running");
          }

          if (state === GenStateCompleted) {
            if (method === "throw") {
              throw arg;
            }

            // Be forgiving, per 25.3.3.3.3 of the spec:
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
            return doneResult();
          }

          context.method = method;
          context.arg = arg;

          while (true) {
            var delegate = context.delegate;
            if (delegate) {
              var delegateResult = maybeInvokeDelegate(delegate, context);
              if (delegateResult) {
                if (delegateResult === ContinueSentinel) continue;
                return delegateResult;
              }
            }

            if (context.method === "next") {
              // Setting context._sent for legacy support of Babel's
              // function.sent implementation.
              context.sent = context._sent = context.arg;

            } else if (context.method === "throw") {
              if (state === GenStateSuspendedStart) {
                state = GenStateCompleted;
                throw context.arg;
              }

              context.dispatchException(context.arg);

            } else if (context.method === "return") {
              context.abrupt("return", context.arg);
            }

            state = GenStateExecuting;

            var record = tryCatch(innerFn, self, context);
            if (record.type === "normal") {
              // If an exception is thrown from innerFn, we leave state ===
              // GenStateExecuting and loop back for another invocation.
              state = context.done
                ? GenStateCompleted
                : GenStateSuspendedYield;

              if (record.arg === ContinueSentinel) {
                continue;
              }

              return {
                value: record.arg,
                done: context.done
              };

            } else if (record.type === "throw") {
              state = GenStateCompleted;
              // Dispatch the exception by looping back around to the
              // context.dispatchException(context.arg) call above.
              context.method = "throw";
              context.arg = record.arg;
            }
          }
        };
      }

      // Call delegate.iterator[context.method](context.arg) and handle the
      // result, either by returning a { value, done } result from the
      // delegate iterator, or by modifying context.method and context.arg,
      // setting context.delegate to null, and returning the ContinueSentinel.
      function maybeInvokeDelegate(delegate, context) {
        var method = delegate.iterator[context.method];
        if (method === undefined$1) {
          // A .throw or .return when the delegate iterator has no .throw
          // method always terminates the yield* loop.
          context.delegate = null;

          if (context.method === "throw") {
            // Note: ["return"] must be used for ES3 parsing compatibility.
            if (delegate.iterator["return"]) {
              // If the delegate iterator has a return method, give it a
              // chance to clean up.
              context.method = "return";
              context.arg = undefined$1;
              maybeInvokeDelegate(delegate, context);

              if (context.method === "throw") {
                // If maybeInvokeDelegate(context) changed context.method from
                // "return" to "throw", let that override the TypeError below.
                return ContinueSentinel;
              }
            }

            context.method = "throw";
            context.arg = new TypeError(
              "The iterator does not provide a 'throw' method");
          }

          return ContinueSentinel;
        }

        var record = tryCatch(method, delegate.iterator, context.arg);

        if (record.type === "throw") {
          context.method = "throw";
          context.arg = record.arg;
          context.delegate = null;
          return ContinueSentinel;
        }

        var info = record.arg;

        if (! info) {
          context.method = "throw";
          context.arg = new TypeError("iterator result is not an object");
          context.delegate = null;
          return ContinueSentinel;
        }

        if (info.done) {
          // Assign the result of the finished delegate to the temporary
          // variable specified by delegate.resultName (see delegateYield).
          context[delegate.resultName] = info.value;

          // Resume execution at the desired location (see delegateYield).
          context.next = delegate.nextLoc;

          // If context.method was "throw" but the delegate handled the
          // exception, let the outer generator proceed normally. If
          // context.method was "next", forget context.arg since it has been
          // "consumed" by the delegate iterator. If context.method was
          // "return", allow the original .return call to continue in the
          // outer generator.
          if (context.method !== "return") {
            context.method = "next";
            context.arg = undefined$1;
          }

        } else {
          // Re-yield the result returned by the delegate method.
          return info;
        }

        // The delegate iterator is finished, so forget it and continue with
        // the outer generator.
        context.delegate = null;
        return ContinueSentinel;
      }

      // Define Generator.prototype.{next,throw,return} in terms of the
      // unified ._invoke helper method.
      defineIteratorMethods(Gp);

      Gp[toStringTagSymbol] = "Generator";

      // A Generator should always return itself as the iterator object when the
      // @@iterator function is called on it. Some browsers' implementations of the
      // iterator prototype chain incorrectly implement this, causing the Generator
      // object to not be returned from this call. This ensures that doesn't happen.
      // See https://github.com/facebook/regenerator/issues/274 for more details.
      Gp[iteratorSymbol] = function() {
        return this;
      };

      Gp.toString = function() {
        return "[object Generator]";
      };

      function pushTryEntry(locs) {
        var entry = { tryLoc: locs[0] };

        if (1 in locs) {
          entry.catchLoc = locs[1];
        }

        if (2 in locs) {
          entry.finallyLoc = locs[2];
          entry.afterLoc = locs[3];
        }

        this.tryEntries.push(entry);
      }

      function resetTryEntry(entry) {
        var record = entry.completion || {};
        record.type = "normal";
        delete record.arg;
        entry.completion = record;
      }

      function Context(tryLocsList) {
        // The root entry object (effectively a try statement without a catch
        // or a finally block) gives us a place to store values thrown from
        // locations where there is no enclosing try statement.
        this.tryEntries = [{ tryLoc: "root" }];
        tryLocsList.forEach(pushTryEntry, this);
        this.reset(true);
      }

      exports.keys = function(object) {
        var keys = [];
        for (var key in object) {
          keys.push(key);
        }
        keys.reverse();

        // Rather than returning an object with a next method, we keep
        // things simple and return the next function itself.
        return function next() {
          while (keys.length) {
            var key = keys.pop();
            if (key in object) {
              next.value = key;
              next.done = false;
              return next;
            }
          }

          // To avoid creating an additional object, we just hang the .value
          // and .done properties off the next function object itself. This
          // also ensures that the minifier will not anonymize the function.
          next.done = true;
          return next;
        };
      };

      function values(iterable) {
        if (iterable) {
          var iteratorMethod = iterable[iteratorSymbol];
          if (iteratorMethod) {
            return iteratorMethod.call(iterable);
          }

          if (typeof iterable.next === "function") {
            return iterable;
          }

          if (!isNaN(iterable.length)) {
            var i = -1, next = function next() {
              while (++i < iterable.length) {
                if (hasOwn.call(iterable, i)) {
                  next.value = iterable[i];
                  next.done = false;
                  return next;
                }
              }

              next.value = undefined$1;
              next.done = true;

              return next;
            };

            return next.next = next;
          }
        }

        // Return an iterator with no values.
        return { next: doneResult };
      }
      exports.values = values;

      function doneResult() {
        return { value: undefined$1, done: true };
      }

      Context.prototype = {
        constructor: Context,

        reset: function(skipTempReset) {
          this.prev = 0;
          this.next = 0;
          // Resetting context._sent for legacy support of Babel's
          // function.sent implementation.
          this.sent = this._sent = undefined$1;
          this.done = false;
          this.delegate = null;

          this.method = "next";
          this.arg = undefined$1;

          this.tryEntries.forEach(resetTryEntry);

          if (!skipTempReset) {
            for (var name in this) {
              // Not sure about the optimal order of these conditions:
              if (name.charAt(0) === "t" &&
                  hasOwn.call(this, name) &&
                  !isNaN(+name.slice(1))) {
                this[name] = undefined$1;
              }
            }
          }
        },

        stop: function() {
          this.done = true;

          var rootEntry = this.tryEntries[0];
          var rootRecord = rootEntry.completion;
          if (rootRecord.type === "throw") {
            throw rootRecord.arg;
          }

          return this.rval;
        },

        dispatchException: function(exception) {
          if (this.done) {
            throw exception;
          }

          var context = this;
          function handle(loc, caught) {
            record.type = "throw";
            record.arg = exception;
            context.next = loc;

            if (caught) {
              // If the dispatched exception was caught by a catch block,
              // then let that catch block handle the exception normally.
              context.method = "next";
              context.arg = undefined$1;
            }

            return !! caught;
          }

          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            var record = entry.completion;

            if (entry.tryLoc === "root") {
              // Exception thrown outside of any try block that could handle
              // it, so set the completion value of the entire function to
              // throw the exception.
              return handle("end");
            }

            if (entry.tryLoc <= this.prev) {
              var hasCatch = hasOwn.call(entry, "catchLoc");
              var hasFinally = hasOwn.call(entry, "finallyLoc");

              if (hasCatch && hasFinally) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                } else if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }

              } else if (hasCatch) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                }

              } else if (hasFinally) {
                if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }

              } else {
                throw new Error("try statement without catch or finally");
              }
            }
          }
        },

        abrupt: function(type, arg) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.tryLoc <= this.prev &&
                hasOwn.call(entry, "finallyLoc") &&
                this.prev < entry.finallyLoc) {
              var finallyEntry = entry;
              break;
            }
          }

          if (finallyEntry &&
              (type === "break" ||
               type === "continue") &&
              finallyEntry.tryLoc <= arg &&
              arg <= finallyEntry.finallyLoc) {
            // Ignore the finally entry if control is not jumping to a
            // location outside the try/catch block.
            finallyEntry = null;
          }

          var record = finallyEntry ? finallyEntry.completion : {};
          record.type = type;
          record.arg = arg;

          if (finallyEntry) {
            this.method = "next";
            this.next = finallyEntry.finallyLoc;
            return ContinueSentinel;
          }

          return this.complete(record);
        },

        complete: function(record, afterLoc) {
          if (record.type === "throw") {
            throw record.arg;
          }

          if (record.type === "break" ||
              record.type === "continue") {
            this.next = record.arg;
          } else if (record.type === "return") {
            this.rval = this.arg = record.arg;
            this.method = "return";
            this.next = "end";
          } else if (record.type === "normal" && afterLoc) {
            this.next = afterLoc;
          }

          return ContinueSentinel;
        },

        finish: function(finallyLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.finallyLoc === finallyLoc) {
              this.complete(entry.completion, entry.afterLoc);
              resetTryEntry(entry);
              return ContinueSentinel;
            }
          }
        },

        "catch": function(tryLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.tryLoc === tryLoc) {
              var record = entry.completion;
              if (record.type === "throw") {
                var thrown = record.arg;
                resetTryEntry(entry);
              }
              return thrown;
            }
          }

          // The context.catch method must only be called with a location
          // argument that corresponds to a known catch block.
          throw new Error("illegal catch attempt");
        },

        delegateYield: function(iterable, resultName, nextLoc) {
          this.delegate = {
            iterator: values(iterable),
            resultName: resultName,
            nextLoc: nextLoc
          };

          if (this.method === "next") {
            // Deliberately forget the last sent value so that we don't
            // accidentally pass it on to the delegate.
            this.arg = undefined$1;
          }

          return ContinueSentinel;
        }
      };

      // Regardless of whether this script is executing as a CommonJS module
      // or not, return the runtime object so that we can declare the variable
      // regeneratorRuntime in the outer scope, which allows this module to be
      // injected easily by `bin/regenerator --include-runtime script.js`.
      return exports;

    }(
      // If this script is executing as a CommonJS module, use module.exports
      // as the regeneratorRuntime namespace. Otherwise create a new empty
      // object. Either way, the resulting object will be used to initialize
      // the regeneratorRuntime variable at the top of this file.
       module.exports 
    ));

    try {
      regeneratorRuntime = runtime;
    } catch (accidentalStrictMode) {
      // This module should not be running in strict mode, so the above
      // assignment should always work unless something is misconfigured. Just
      // in case runtime.js accidentally runs in strict mode, we can escape
      // strict mode using a global Function call. This could conceivably fail
      // if a Content Security Policy forbids using Function, but in that case
      // the proper solution is to fix the accidental strict mode problem. If
      // you've misconfigured your bundler to force strict mode and applied a
      // CSP to forbid Function, and you're not willing to fix either of those
      // problems, please detail your unique predicament in a GitHub issue.
      Function("r", "regeneratorRuntime = r")(runtime);
    }
    });

    var regenerator = runtime_1;

    function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
      try {
        var info = gen[key](arg);
        var value = info.value;
      } catch (error) {
        reject(error);
        return;
      }

      if (info.done) {
        resolve(value);
      } else {
        Promise.resolve(value).then(_next, _throw);
      }
    }

    function _asyncToGenerator(fn) {
      return function () {
        var self = this,
            args = arguments;
        return new Promise(function (resolve, reject) {
          var gen = fn.apply(self, args);

          function _next(value) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
          }

          function _throw(err) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
          }

          _next(undefined);
        });
      };
    }

    var asyncToGenerator = _asyncToGenerator;

    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

    var defineProperty = _defineProperty;

    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;

      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    }

    var arrayLikeToArray = _arrayLikeToArray;

    function _arrayWithoutHoles(arr) {
      if (Array.isArray(arr)) return arrayLikeToArray(arr);
    }

    var arrayWithoutHoles = _arrayWithoutHoles;

    function _iterableToArray(iter) {
      if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
    }

    var iterableToArray = _iterableToArray;

    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
    }

    var unsupportedIterableToArray = _unsupportedIterableToArray;

    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var nonIterableSpread = _nonIterableSpread;

    function _toConsumableArray(arr) {
      return arrayWithoutHoles(arr) || iterableToArray(arr) || unsupportedIterableToArray(arr) || nonIterableSpread();
    }

    var toConsumableArray = _toConsumableArray;

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    var classCallCheck = _classCallCheck;

    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      return Constructor;
    }

    var createClass = _createClass;

    var global$1 = (typeof global !== "undefined" ? global :
                typeof self !== "undefined" ? self :
                typeof window !== "undefined" ? window : {});

    // shim for using process in browser
    // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

    function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
    }
    function defaultClearTimeout () {
        throw new Error('clearTimeout has not been defined');
    }
    var cachedSetTimeout = defaultSetTimout;
    var cachedClearTimeout = defaultClearTimeout;
    if (typeof global$1.setTimeout === 'function') {
        cachedSetTimeout = setTimeout;
    }
    if (typeof global$1.clearTimeout === 'function') {
        cachedClearTimeout = clearTimeout;
    }

    function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
            //normal enviroments in sane situations
            return setTimeout(fun, 0);
        }
        // if setTimeout wasn't available but was latter defined
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
            cachedSetTimeout = setTimeout;
            return setTimeout(fun, 0);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedSetTimeout(fun, 0);
        } catch(e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                return cachedSetTimeout.call(null, fun, 0);
            } catch(e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                return cachedSetTimeout.call(this, fun, 0);
            }
        }


    }
    function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
            //normal enviroments in sane situations
            return clearTimeout(marker);
        }
        // if clearTimeout wasn't available but was latter defined
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
            cachedClearTimeout = clearTimeout;
            return clearTimeout(marker);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedClearTimeout(marker);
        } catch (e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                return cachedClearTimeout.call(null, marker);
            } catch (e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                return cachedClearTimeout.call(this, marker);
            }
        }



    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;

    function cleanUpNextTick() {
        if (!draining || !currentQueue) {
            return;
        }
        draining = false;
        if (currentQueue.length) {
            queue = currentQueue.concat(queue);
        } else {
            queueIndex = -1;
        }
        if (queue.length) {
            drainQueue();
        }
    }

    function drainQueue() {
        if (draining) {
            return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;

        var len = queue.length;
        while(len) {
            currentQueue = queue;
            queue = [];
            while (++queueIndex < len) {
                if (currentQueue) {
                    currentQueue[queueIndex].run();
                }
            }
            queueIndex = -1;
            len = queue.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
    }
    function nextTick(fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                args[i - 1] = arguments[i];
            }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
            runTimeout(drainQueue);
        }
    }
    // v8 likes predictible objects
    function Item(fun, array) {
        this.fun = fun;
        this.array = array;
    }
    Item.prototype.run = function () {
        this.fun.apply(null, this.array);
    };
    var title = 'browser';
    var platform = 'browser';
    var browser = true;
    var env = {};
    var argv = [];
    var version = ''; // empty string to avoid regexp issues
    var versions = {};
    var release = {};
    var config = {};

    function noop$1() {}

    var on = noop$1;
    var addListener = noop$1;
    var once = noop$1;
    var off = noop$1;
    var removeListener = noop$1;
    var removeAllListeners = noop$1;
    var emit = noop$1;

    function binding(name) {
        throw new Error('process.binding is not supported');
    }

    function cwd () { return '/' }
    function chdir (dir) {
        throw new Error('process.chdir is not supported');
    }function umask() { return 0; }

    // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
    var performance = global$1.performance || {};
    var performanceNow =
      performance.now        ||
      performance.mozNow     ||
      performance.msNow      ||
      performance.oNow       ||
      performance.webkitNow  ||
      function(){ return (new Date()).getTime() };

    // generate timestamp or delta
    // see http://nodejs.org/api/process.html#process_process_hrtime
    function hrtime(previousTimestamp){
      var clocktime = performanceNow.call(performance)*1e-3;
      var seconds = Math.floor(clocktime);
      var nanoseconds = Math.floor((clocktime%1)*1e9);
      if (previousTimestamp) {
        seconds = seconds - previousTimestamp[0];
        nanoseconds = nanoseconds - previousTimestamp[1];
        if (nanoseconds<0) {
          seconds--;
          nanoseconds += 1e9;
        }
      }
      return [seconds,nanoseconds]
    }

    var startTime = new Date();
    function uptime() {
      var currentTime = new Date();
      var dif = currentTime - startTime;
      return dif / 1000;
    }

    var process = {
      nextTick: nextTick,
      title: title,
      browser: browser,
      env: env,
      argv: argv,
      version: version,
      versions: versions,
      on: on,
      addListener: addListener,
      once: once,
      off: off,
      removeListener: removeListener,
      removeAllListeners: removeAllListeners,
      emit: emit,
      binding: binding,
      cwd: cwd,
      chdir: chdir,
      umask: umask,
      hrtime: hrtime,
      platform: platform,
      release: release,
      config: config,
      uptime: uptime
    };

    /**
     * A specialized version of `_.forEach` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns `array`.
     */
    function arrayEach(array, iteratee) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }

    var _arrayEach = arrayEach;

    /**
     * Creates a base function for methods like `_.forIn` and `_.forOwn`.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */
    function createBaseFor(fromRight) {
      return function(object, iteratee, keysFunc) {
        var index = -1,
            iterable = Object(object),
            props = keysFunc(object),
            length = props.length;

        while (length--) {
          var key = props[fromRight ? length : ++index];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }

    var _createBaseFor = createBaseFor;

    /**
     * The base implementation of `baseForOwn` which iterates over `object`
     * properties returned by `keysFunc` and invokes `iteratee` for each property.
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @returns {Object} Returns `object`.
     */
    var baseFor = _createBaseFor();

    var _baseFor = baseFor;

    /**
     * The base implementation of `_.times` without support for iteratee shorthands
     * or max array length checks.
     *
     * @private
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     */
    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);

      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }

    var _baseTimes = baseTimes;

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

    var _freeGlobal = freeGlobal;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = _freeGlobal || freeSelf || Function('return this')();

    var _root = root;

    /** Built-in value references. */
    var Symbol$1 = _root.Symbol;

    var _Symbol = Symbol$1;

    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString = objectProto.toString;

    /** Built-in value references. */
    var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag),
          tag = value[symToStringTag];

      try {
        value[symToStringTag] = undefined;
        var unmasked = true;
      } catch (e) {}

      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }

    var _getRawTag = getRawTag;

    /** Used for built-in method references. */
    var objectProto$1 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString$1 = objectProto$1.toString;

    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */
    function objectToString(value) {
      return nativeObjectToString$1.call(value);
    }

    var _objectToString = objectToString;

    /** `Object#toString` result references. */
    var nullTag = '[object Null]',
        undefinedTag = '[object Undefined]';

    /** Built-in value references. */
    var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }
      return (symToStringTag$1 && symToStringTag$1 in Object(value))
        ? _getRawTag(value)
        : _objectToString(value);
    }

    var _baseGetTag = baseGetTag;

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }

    var isObjectLike_1 = isObjectLike;

    /** `Object#toString` result references. */
    var argsTag = '[object Arguments]';

    /**
     * The base implementation of `_.isArguments`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     */
    function baseIsArguments(value) {
      return isObjectLike_1(value) && _baseGetTag(value) == argsTag;
    }

    var _baseIsArguments = baseIsArguments;

    /** Used for built-in method references. */
    var objectProto$2 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

    /** Built-in value references. */
    var propertyIsEnumerable = objectProto$2.propertyIsEnumerable;

    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    var isArguments = _baseIsArguments(function() { return arguments; }()) ? _baseIsArguments : function(value) {
      return isObjectLike_1(value) && hasOwnProperty$1.call(value, 'callee') &&
        !propertyIsEnumerable.call(value, 'callee');
    };

    var isArguments_1 = isArguments;

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray = Array.isArray;

    var isArray_1 = isArray;

    /**
     * This method returns `false`.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {boolean} Returns `false`.
     * @example
     *
     * _.times(2, _.stubFalse);
     * // => [false, false]
     */
    function stubFalse() {
      return false;
    }

    var stubFalse_1 = stubFalse;

    var isBuffer_1 = createCommonjsModule(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports =  exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Built-in value references. */
    var Buffer = moduleExports ? _root.Buffer : undefined;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

    /**
     * Checks if `value` is a buffer.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
     * @example
     *
     * _.isBuffer(new Buffer(2));
     * // => true
     *
     * _.isBuffer(new Uint8Array(2));
     * // => false
     */
    var isBuffer = nativeIsBuffer || stubFalse_1;

    module.exports = isBuffer;
    });

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER = 9007199254740991;

    /** Used to detect unsigned integer values. */
    var reIsUint = /^(?:0|[1-9]\d*)$/;

    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER : length;

      return !!length &&
        (type == 'number' ||
          (type != 'symbol' && reIsUint.test(value))) &&
            (value > -1 && value % 1 == 0 && value < length);
    }

    var _isIndex = isIndex;

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER$1 = 9007199254740991;

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This method is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */
    function isLength(value) {
      return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
    }

    var isLength_1 = isLength;

    /** `Object#toString` result references. */
    var argsTag$1 = '[object Arguments]',
        arrayTag = '[object Array]',
        boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        errorTag = '[object Error]',
        funcTag = '[object Function]',
        mapTag = '[object Map]',
        numberTag = '[object Number]',
        objectTag = '[object Object]',
        regexpTag = '[object RegExp]',
        setTag = '[object Set]',
        stringTag = '[object String]',
        weakMapTag = '[object WeakMap]';

    var arrayBufferTag = '[object ArrayBuffer]',
        dataViewTag = '[object DataView]',
        float32Tag = '[object Float32Array]',
        float64Tag = '[object Float64Array]',
        int8Tag = '[object Int8Array]',
        int16Tag = '[object Int16Array]',
        int32Tag = '[object Int32Array]',
        uint8Tag = '[object Uint8Array]',
        uint8ClampedTag = '[object Uint8ClampedArray]',
        uint16Tag = '[object Uint16Array]',
        uint32Tag = '[object Uint32Array]';

    /** Used to identify `toStringTag` values of typed arrays. */
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
    typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
    typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
    typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
    typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
    typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
    typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
    typedArrayTags[errorTag] = typedArrayTags[funcTag] =
    typedArrayTags[mapTag] = typedArrayTags[numberTag] =
    typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
    typedArrayTags[setTag] = typedArrayTags[stringTag] =
    typedArrayTags[weakMapTag] = false;

    /**
     * The base implementation of `_.isTypedArray` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     */
    function baseIsTypedArray(value) {
      return isObjectLike_1(value) &&
        isLength_1(value.length) && !!typedArrayTags[_baseGetTag(value)];
    }

    var _baseIsTypedArray = baseIsTypedArray;

    /**
     * The base implementation of `_.unary` without support for storing metadata.
     *
     * @private
     * @param {Function} func The function to cap arguments for.
     * @returns {Function} Returns the new capped function.
     */
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }

    var _baseUnary = baseUnary;

    var _nodeUtil = createCommonjsModule(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports =  exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Detect free variable `process` from Node.js. */
    var freeProcess = moduleExports && _freeGlobal.process;

    /** Used to access faster Node.js helpers. */
    var nodeUtil = (function() {
      try {
        // Use `util.types` for Node.js 10+.
        var types = freeModule && freeModule.require && freeModule.require('util').types;

        if (types) {
          return types;
        }

        // Legacy `process.binding('util')` for Node.js < 10.
        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    }());

    module.exports = nodeUtil;
    });

    /* Node.js helper references. */
    var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;

    /**
     * Checks if `value` is classified as a typed array.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     * @example
     *
     * _.isTypedArray(new Uint8Array);
     * // => true
     *
     * _.isTypedArray([]);
     * // => false
     */
    var isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;

    var isTypedArray_1 = isTypedArray;

    /** Used for built-in method references. */
    var objectProto$3 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

    /**
     * Creates an array of the enumerable property names of the array-like `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @param {boolean} inherited Specify returning inherited property names.
     * @returns {Array} Returns the array of property names.
     */
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray_1(value),
          isArg = !isArr && isArguments_1(value),
          isBuff = !isArr && !isArg && isBuffer_1(value),
          isType = !isArr && !isArg && !isBuff && isTypedArray_1(value),
          skipIndexes = isArr || isArg || isBuff || isType,
          result = skipIndexes ? _baseTimes(value.length, String) : [],
          length = result.length;

      for (var key in value) {
        if ((inherited || hasOwnProperty$2.call(value, key)) &&
            !(skipIndexes && (
               // Safari 9 has enumerable `arguments.length` in strict mode.
               key == 'length' ||
               // Node.js 0.10 has enumerable non-index properties on buffers.
               (isBuff && (key == 'offset' || key == 'parent')) ||
               // PhantomJS 2 has enumerable non-index properties on typed arrays.
               (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
               // Skip index properties.
               _isIndex(key, length)
            ))) {
          result.push(key);
        }
      }
      return result;
    }

    var _arrayLikeKeys = arrayLikeKeys;

    /** Used for built-in method references. */
    var objectProto$4 = Object.prototype;

    /**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */
    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$4;

      return value === proto;
    }

    var _isPrototype = isPrototype;

    /**
     * Creates a unary function that invokes `func` with its argument transformed.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {Function} transform The argument transform.
     * @returns {Function} Returns the new function.
     */
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }

    var _overArg = overArg;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeKeys = _overArg(Object.keys, Object);

    var _nativeKeys = nativeKeys;

    /** Used for built-in method references. */
    var objectProto$5 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$3 = objectProto$5.hasOwnProperty;

    /**
     * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeys(object) {
      if (!_isPrototype(object)) {
        return _nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty$3.call(object, key) && key != 'constructor') {
          result.push(key);
        }
      }
      return result;
    }

    var _baseKeys = baseKeys;

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    var isObject_1 = isObject;

    /** `Object#toString` result references. */
    var asyncTag = '[object AsyncFunction]',
        funcTag$1 = '[object Function]',
        genTag = '[object GeneratorFunction]',
        proxyTag = '[object Proxy]';

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction(value) {
      if (!isObject_1(value)) {
        return false;
      }
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 9 which returns 'object' for typed arrays and other constructors.
      var tag = _baseGetTag(value);
      return tag == funcTag$1 || tag == genTag || tag == asyncTag || tag == proxyTag;
    }

    var isFunction_1 = isFunction;

    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */
    function isArrayLike(value) {
      return value != null && isLength_1(value.length) && !isFunction_1(value);
    }

    var isArrayLike_1 = isArrayLike;

    /**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * for more details.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keys(new Foo);
     * // => ['a', 'b'] (iteration order is not guaranteed)
     *
     * _.keys('hi');
     * // => ['0', '1']
     */
    function keys(object) {
      return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
    }

    var keys_1 = keys;

    /**
     * The base implementation of `_.forOwn` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Object} Returns `object`.
     */
    function baseForOwn(object, iteratee) {
      return object && _baseFor(object, iteratee, keys_1);
    }

    var _baseForOwn = baseForOwn;

    /**
     * Creates a `baseEach` or `baseEachRight` function.
     *
     * @private
     * @param {Function} eachFunc The function to iterate over a collection.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */
    function createBaseEach(eachFunc, fromRight) {
      return function(collection, iteratee) {
        if (collection == null) {
          return collection;
        }
        if (!isArrayLike_1(collection)) {
          return eachFunc(collection, iteratee);
        }
        var length = collection.length,
            index = fromRight ? length : -1,
            iterable = Object(collection);

        while ((fromRight ? index-- : ++index < length)) {
          if (iteratee(iterable[index], index, iterable) === false) {
            break;
          }
        }
        return collection;
      };
    }

    var _createBaseEach = createBaseEach;

    /**
     * The base implementation of `_.forEach` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array|Object} Returns `collection`.
     */
    var baseEach = _createBaseEach(_baseForOwn);

    var _baseEach = baseEach;

    /**
     * This method returns the first argument it receives.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'a': 1 };
     *
     * console.log(_.identity(object) === object);
     * // => true
     */
    function identity(value) {
      return value;
    }

    var identity_1 = identity;

    /**
     * Casts `value` to `identity` if it's not a function.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {Function} Returns cast function.
     */
    function castFunction(value) {
      return typeof value == 'function' ? value : identity_1;
    }

    var _castFunction = castFunction;

    /**
     * Iterates over elements of `collection` and invokes `iteratee` for each element.
     * The iteratee is invoked with three arguments: (value, index|key, collection).
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * **Note:** As with other "Collections" methods, objects with a "length"
     * property are iterated like arrays. To avoid this behavior use `_.forIn`
     * or `_.forOwn` for object iteration.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @alias each
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Array|Object} Returns `collection`.
     * @see _.forEachRight
     * @example
     *
     * _.forEach([1, 2], function(value) {
     *   console.log(value);
     * });
     * // => Logs `1` then `2`.
     *
     * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
     *   console.log(key);
     * });
     * // => Logs 'a' then 'b' (iteration order is not guaranteed).
     */
    function forEach(collection, iteratee) {
      var func = isArray_1(collection) ? _arrayEach : _baseEach;
      return func(collection, _castFunction(iteratee));
    }

    var forEach_1 = forEach;

    /** `Object#toString` result references. */
    var symbolTag = '[object Symbol]';

    /**
     * Checks if `value` is classified as a `Symbol` primitive or object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
     * @example
     *
     * _.isSymbol(Symbol.iterator);
     * // => true
     *
     * _.isSymbol('abc');
     * // => false
     */
    function isSymbol(value) {
      return typeof value == 'symbol' ||
        (isObjectLike_1(value) && _baseGetTag(value) == symbolTag);
    }

    var isSymbol_1 = isSymbol;

    /** Used to match property names within property paths. */
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
        reIsPlainProp = /^\w*$/;

    /**
     * Checks if `value` is a property name and not a property path.
     *
     * @private
     * @param {*} value The value to check.
     * @param {Object} [object] The object to query keys on.
     * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
     */
    function isKey(value, object) {
      if (isArray_1(value)) {
        return false;
      }
      var type = typeof value;
      if (type == 'number' || type == 'symbol' || type == 'boolean' ||
          value == null || isSymbol_1(value)) {
        return true;
      }
      return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
        (object != null && value in Object(object));
    }

    var _isKey = isKey;

    /** Used to detect overreaching core-js shims. */
    var coreJsData = _root['__core-js_shared__'];

    var _coreJsData = coreJsData;

    /** Used to detect methods masquerading as native. */
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
      return uid ? ('Symbol(src)_1.' + uid) : '';
    }());

    /**
     * Checks if `func` has its source masked.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` is masked, else `false`.
     */
    function isMasked(func) {
      return !!maskSrcKey && (maskSrcKey in func);
    }

    var _isMasked = isMasked;

    /** Used for built-in method references. */
    var funcProto = Function.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString = funcProto.toString;

    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to convert.
     * @returns {string} Returns the source code.
     */
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {}
        try {
          return (func + '');
        } catch (e) {}
      }
      return '';
    }

    var _toSource = toSource;

    /**
     * Used to match `RegExp`
     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
     */
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

    /** Used to detect host constructors (Safari). */
    var reIsHostCtor = /^\[object .+?Constructor\]$/;

    /** Used for built-in method references. */
    var funcProto$1 = Function.prototype,
        objectProto$6 = Object.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString$1 = funcProto$1.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty$4 = objectProto$6.hasOwnProperty;

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' +
      funcToString$1.call(hasOwnProperty$4).replace(reRegExpChar, '\\$&')
      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    /**
     * The base implementation of `_.isNative` without bad shim checks.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     */
    function baseIsNative(value) {
      if (!isObject_1(value) || _isMasked(value)) {
        return false;
      }
      var pattern = isFunction_1(value) ? reIsNative : reIsHostCtor;
      return pattern.test(_toSource(value));
    }

    var _baseIsNative = baseIsNative;

    /**
     * Gets the value at `key` of `object`.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */
    function getValue(object, key) {
      return object == null ? undefined : object[key];
    }

    var _getValue = getValue;

    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */
    function getNative(object, key) {
      var value = _getValue(object, key);
      return _baseIsNative(value) ? value : undefined;
    }

    var _getNative = getNative;

    /* Built-in method references that are verified to be native. */
    var nativeCreate = _getNative(Object, 'create');

    var _nativeCreate = nativeCreate;

    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */
    function hashClear() {
      this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
      this.size = 0;
    }

    var _hashClear = hashClear;

    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }

    var _hashDelete = hashDelete;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED = '__lodash_hash_undefined__';

    /** Used for built-in method references. */
    var objectProto$7 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$5 = objectProto$7.hasOwnProperty;

    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function hashGet(key) {
      var data = this.__data__;
      if (_nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
      }
      return hasOwnProperty$5.call(data, key) ? data[key] : undefined;
    }

    var _hashGet = hashGet;

    /** Used for built-in method references. */
    var objectProto$8 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$6 = objectProto$8.hasOwnProperty;

    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function hashHas(key) {
      var data = this.__data__;
      return _nativeCreate ? (data[key] !== undefined) : hasOwnProperty$6.call(data, key);
    }

    var _hashHas = hashHas;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = (_nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
      return this;
    }

    var _hashSet = hashSet;

    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Hash(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `Hash`.
    Hash.prototype.clear = _hashClear;
    Hash.prototype['delete'] = _hashDelete;
    Hash.prototype.get = _hashGet;
    Hash.prototype.has = _hashHas;
    Hash.prototype.set = _hashSet;

    var _Hash = Hash;

    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }

    var _listCacheClear = listCacheClear;

    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */
    function eq(value, other) {
      return value === other || (value !== value && other !== other);
    }

    var eq_1 = eq;

    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} key The key to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq_1(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }

    var _assocIndexOf = assocIndexOf;

    /** Used for built-in method references. */
    var arrayProto = Array.prototype;

    /** Built-in value references. */
    var splice = arrayProto.splice;

    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function listCacheDelete(key) {
      var data = this.__data__,
          index = _assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }

    var _listCacheDelete = listCacheDelete;

    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function listCacheGet(key) {
      var data = this.__data__,
          index = _assocIndexOf(data, key);

      return index < 0 ? undefined : data[index][1];
    }

    var _listCacheGet = listCacheGet;

    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function listCacheHas(key) {
      return _assocIndexOf(this.__data__, key) > -1;
    }

    var _listCacheHas = listCacheHas;

    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */
    function listCacheSet(key, value) {
      var data = this.__data__,
          index = _assocIndexOf(data, key);

      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }

    var _listCacheSet = listCacheSet;

    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function ListCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `ListCache`.
    ListCache.prototype.clear = _listCacheClear;
    ListCache.prototype['delete'] = _listCacheDelete;
    ListCache.prototype.get = _listCacheGet;
    ListCache.prototype.has = _listCacheHas;
    ListCache.prototype.set = _listCacheSet;

    var _ListCache = ListCache;

    /* Built-in method references that are verified to be native. */
    var Map$1 = _getNative(_root, 'Map');

    var _Map = Map$1;

    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        'hash': new _Hash,
        'map': new (_Map || _ListCache),
        'string': new _Hash
      };
    }

    var _mapCacheClear = mapCacheClear;

    /**
     * Checks if `value` is suitable for use as unique object key.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
     */
    function isKeyable(value) {
      var type = typeof value;
      return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
        ? (value !== '__proto__')
        : (value === null);
    }

    var _isKeyable = isKeyable;

    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */
    function getMapData(map, key) {
      var data = map.__data__;
      return _isKeyable(key)
        ? data[typeof key == 'string' ? 'string' : 'hash']
        : data.map;
    }

    var _getMapData = getMapData;

    /**
     * Removes `key` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function mapCacheDelete(key) {
      var result = _getMapData(this, key)['delete'](key);
      this.size -= result ? 1 : 0;
      return result;
    }

    var _mapCacheDelete = mapCacheDelete;

    /**
     * Gets the map value for `key`.
     *
     * @private
     * @name get
     * @memberOf MapCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function mapCacheGet(key) {
      return _getMapData(this, key).get(key);
    }

    var _mapCacheGet = mapCacheGet;

    /**
     * Checks if a map value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf MapCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function mapCacheHas(key) {
      return _getMapData(this, key).has(key);
    }

    var _mapCacheHas = mapCacheHas;

    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */
    function mapCacheSet(key, value) {
      var data = _getMapData(this, key),
          size = data.size;

      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }

    var _mapCacheSet = mapCacheSet;

    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function MapCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `MapCache`.
    MapCache.prototype.clear = _mapCacheClear;
    MapCache.prototype['delete'] = _mapCacheDelete;
    MapCache.prototype.get = _mapCacheGet;
    MapCache.prototype.has = _mapCacheHas;
    MapCache.prototype.set = _mapCacheSet;

    var _MapCache = MapCache;

    /** Error message constants. */
    var FUNC_ERROR_TEXT = 'Expected a function';

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided, it determines the cache key for storing the result based on the
     * arguments provided to the memoized function. By default, the first argument
     * provided to the memoized function is used as the map cache key. The `func`
     * is invoked with the `this` binding of the memoized function.
     *
     * **Note:** The cache is exposed as the `cache` property on the memoized
     * function. Its creation may be customized by replacing the `_.memoize.Cache`
     * constructor with one whose instances implement the
     * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
     * method interface of `clear`, `delete`, `get`, `has`, and `set`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] The function to resolve the cache key.
     * @returns {Function} Returns the new memoized function.
     * @example
     *
     * var object = { 'a': 1, 'b': 2 };
     * var other = { 'c': 3, 'd': 4 };
     *
     * var values = _.memoize(_.values);
     * values(object);
     * // => [1, 2]
     *
     * values(other);
     * // => [3, 4]
     *
     * object.a = 2;
     * values(object);
     * // => [1, 2]
     *
     * // Modify the result cache.
     * values.cache.set(object, ['a', 'b']);
     * values(object);
     * // => ['a', 'b']
     *
     * // Replace `_.memoize.Cache`.
     * _.memoize.Cache = WeakMap;
     */
    function memoize(func, resolver) {
      if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var memoized = function() {
        var args = arguments,
            key = resolver ? resolver.apply(this, args) : args[0],
            cache = memoized.cache;

        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result) || cache;
        return result;
      };
      memoized.cache = new (memoize.Cache || _MapCache);
      return memoized;
    }

    // Expose `MapCache`.
    memoize.Cache = _MapCache;

    var memoize_1 = memoize;

    /** Used as the maximum memoize cache size. */
    var MAX_MEMOIZE_SIZE = 500;

    /**
     * A specialized version of `_.memoize` which clears the memoized function's
     * cache when it exceeds `MAX_MEMOIZE_SIZE`.
     *
     * @private
     * @param {Function} func The function to have its output memoized.
     * @returns {Function} Returns the new memoized function.
     */
    function memoizeCapped(func) {
      var result = memoize_1(func, function(key) {
        if (cache.size === MAX_MEMOIZE_SIZE) {
          cache.clear();
        }
        return key;
      });

      var cache = result.cache;
      return result;
    }

    var _memoizeCapped = memoizeCapped;

    /** Used to match property names within property paths. */
    var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

    /** Used to match backslashes in property paths. */
    var reEscapeChar = /\\(\\)?/g;

    /**
     * Converts `string` to a property path array.
     *
     * @private
     * @param {string} string The string to convert.
     * @returns {Array} Returns the property path array.
     */
    var stringToPath = _memoizeCapped(function(string) {
      var result = [];
      if (string.charCodeAt(0) === 46 /* . */) {
        result.push('');
      }
      string.replace(rePropName, function(match, number, quote, subString) {
        result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
      });
      return result;
    });

    var _stringToPath = stringToPath;

    /**
     * A specialized version of `_.map` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */
    function arrayMap(array, iteratee) {
      var index = -1,
          length = array == null ? 0 : array.length,
          result = Array(length);

      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }

    var _arrayMap = arrayMap;

    /** Used as references for various `Number` constants. */
    var INFINITY = 1 / 0;

    /** Used to convert symbols to primitives and strings. */
    var symbolProto = _Symbol ? _Symbol.prototype : undefined,
        symbolToString = symbolProto ? symbolProto.toString : undefined;

    /**
     * The base implementation of `_.toString` which doesn't convert nullish
     * values to empty strings.
     *
     * @private
     * @param {*} value The value to process.
     * @returns {string} Returns the string.
     */
    function baseToString(value) {
      // Exit early for strings to avoid a performance hit in some environments.
      if (typeof value == 'string') {
        return value;
      }
      if (isArray_1(value)) {
        // Recursively convert values (susceptible to call stack limits).
        return _arrayMap(value, baseToString) + '';
      }
      if (isSymbol_1(value)) {
        return symbolToString ? symbolToString.call(value) : '';
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
    }

    var _baseToString = baseToString;

    /**
     * Converts `value` to a string. An empty string is returned for `null`
     * and `undefined` values. The sign of `-0` is preserved.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     * @example
     *
     * _.toString(null);
     * // => ''
     *
     * _.toString(-0);
     * // => '-0'
     *
     * _.toString([1, 2, 3]);
     * // => '1,2,3'
     */
    function toString(value) {
      return value == null ? '' : _baseToString(value);
    }

    var toString_1 = toString;

    /**
     * Casts `value` to a path array if it's not one.
     *
     * @private
     * @param {*} value The value to inspect.
     * @param {Object} [object] The object to query keys on.
     * @returns {Array} Returns the cast property path array.
     */
    function castPath(value, object) {
      if (isArray_1(value)) {
        return value;
      }
      return _isKey(value, object) ? [value] : _stringToPath(toString_1(value));
    }

    var _castPath = castPath;

    /** Used as references for various `Number` constants. */
    var INFINITY$1 = 1 / 0;

    /**
     * Converts `value` to a string key if it's not a string or symbol.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {string|symbol} Returns the key.
     */
    function toKey(value) {
      if (typeof value == 'string' || isSymbol_1(value)) {
        return value;
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
    }

    var _toKey = toKey;

    /**
     * The base implementation of `_.get` without support for default values.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @returns {*} Returns the resolved value.
     */
    function baseGet(object, path) {
      path = _castPath(path, object);

      var index = 0,
          length = path.length;

      while (object != null && index < length) {
        object = object[_toKey(path[index++])];
      }
      return (index && index == length) ? object : undefined;
    }

    var _baseGet = baseGet;

    /**
     * Gets the value at `path` of `object`. If the resolved value is
     * `undefined`, the `defaultValue` is returned in its place.
     *
     * @static
     * @memberOf _
     * @since 3.7.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @param {*} [defaultValue] The value returned for `undefined` resolved values.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
     *
     * _.get(object, 'a[0].b.c');
     * // => 3
     *
     * _.get(object, ['a', '0', 'b', 'c']);
     * // => 3
     *
     * _.get(object, 'a.b.c', 'default');
     * // => 'default'
     */
    function get(object, path, defaultValue) {
      var result = object == null ? undefined : _baseGet(object, path);
      return result === undefined ? defaultValue : result;
    }

    var get_1 = get;

    var defineProperty$1 = (function() {
      try {
        var func = _getNative(Object, 'defineProperty');
        func({}, '', {});
        return func;
      } catch (e) {}
    }());

    var _defineProperty$1 = defineProperty$1;

    /**
     * The base implementation of `assignValue` and `assignMergeValue` without
     * value checks.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function baseAssignValue(object, key, value) {
      if (key == '__proto__' && _defineProperty$1) {
        _defineProperty$1(object, key, {
          'configurable': true,
          'enumerable': true,
          'value': value,
          'writable': true
        });
      } else {
        object[key] = value;
      }
    }

    var _baseAssignValue = baseAssignValue;

    /** Used for built-in method references. */
    var objectProto$9 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$7 = objectProto$9.hasOwnProperty;

    /**
     * Assigns `value` to `key` of `object` if the existing value is not equivalent
     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty$7.call(object, key) && eq_1(objValue, value)) ||
          (value === undefined && !(key in object))) {
        _baseAssignValue(object, key, value);
      }
    }

    var _assignValue = assignValue;

    /**
     * Copies properties of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy properties from.
     * @param {Array} props The property identifiers to copy.
     * @param {Object} [object={}] The object to copy properties to.
     * @param {Function} [customizer] The function to customize copied values.
     * @returns {Object} Returns `object`.
     */
    function copyObject(source, props, object, customizer) {
      var isNew = !object;
      object || (object = {});

      var index = -1,
          length = props.length;

      while (++index < length) {
        var key = props[index];

        var newValue = customizer
          ? customizer(object[key], source[key], key, object, source)
          : undefined;

        if (newValue === undefined) {
          newValue = source[key];
        }
        if (isNew) {
          _baseAssignValue(object, key, newValue);
        } else {
          _assignValue(object, key, newValue);
        }
      }
      return object;
    }

    var _copyObject = copyObject;

    /**
     * A faster alternative to `Function#apply`, this function invokes `func`
     * with the `this` binding of `thisArg` and the arguments of `args`.
     *
     * @private
     * @param {Function} func The function to invoke.
     * @param {*} thisArg The `this` binding of `func`.
     * @param {Array} args The arguments to invoke `func` with.
     * @returns {*} Returns the result of `func`.
     */
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0: return func.call(thisArg);
        case 1: return func.call(thisArg, args[0]);
        case 2: return func.call(thisArg, args[0], args[1]);
        case 3: return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }

    var _apply = apply;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeMax = Math.max;

    /**
     * A specialized version of `baseRest` which transforms the rest array.
     *
     * @private
     * @param {Function} func The function to apply a rest parameter to.
     * @param {number} [start=func.length-1] The start position of the rest parameter.
     * @param {Function} transform The rest array transform.
     * @returns {Function} Returns the new function.
     */
    function overRest(func, start, transform) {
      start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
      return function() {
        var args = arguments,
            index = -1,
            length = nativeMax(args.length - start, 0),
            array = Array(length);

        while (++index < length) {
          array[index] = args[start + index];
        }
        index = -1;
        var otherArgs = Array(start + 1);
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = transform(array);
        return _apply(func, this, otherArgs);
      };
    }

    var _overRest = overRest;

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Util
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new constant function.
     * @example
     *
     * var objects = _.times(2, _.constant({ 'a': 1 }));
     *
     * console.log(objects);
     * // => [{ 'a': 1 }, { 'a': 1 }]
     *
     * console.log(objects[0] === objects[1]);
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    var constant_1 = constant;

    /**
     * The base implementation of `setToString` without support for hot loop shorting.
     *
     * @private
     * @param {Function} func The function to modify.
     * @param {Function} string The `toString` result.
     * @returns {Function} Returns `func`.
     */
    var baseSetToString = !_defineProperty$1 ? identity_1 : function(func, string) {
      return _defineProperty$1(func, 'toString', {
        'configurable': true,
        'enumerable': false,
        'value': constant_1(string),
        'writable': true
      });
    };

    var _baseSetToString = baseSetToString;

    /** Used to detect hot functions by number of calls within a span of milliseconds. */
    var HOT_COUNT = 800,
        HOT_SPAN = 16;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeNow = Date.now;

    /**
     * Creates a function that'll short out and invoke `identity` instead
     * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
     * milliseconds.
     *
     * @private
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new shortable function.
     */
    function shortOut(func) {
      var count = 0,
          lastCalled = 0;

      return function() {
        var stamp = nativeNow(),
            remaining = HOT_SPAN - (stamp - lastCalled);

        lastCalled = stamp;
        if (remaining > 0) {
          if (++count >= HOT_COUNT) {
            return arguments[0];
          }
        } else {
          count = 0;
        }
        return func.apply(undefined, arguments);
      };
    }

    var _shortOut = shortOut;

    /**
     * Sets the `toString` method of `func` to return `string`.
     *
     * @private
     * @param {Function} func The function to modify.
     * @param {Function} string The `toString` result.
     * @returns {Function} Returns `func`.
     */
    var setToString = _shortOut(_baseSetToString);

    var _setToString = setToString;

    /**
     * The base implementation of `_.rest` which doesn't validate or coerce arguments.
     *
     * @private
     * @param {Function} func The function to apply a rest parameter to.
     * @param {number} [start=func.length-1] The start position of the rest parameter.
     * @returns {Function} Returns the new function.
     */
    function baseRest(func, start) {
      return _setToString(_overRest(func, start, identity_1), func + '');
    }

    var _baseRest = baseRest;

    /**
     * Checks if the given arguments are from an iteratee call.
     *
     * @private
     * @param {*} value The potential iteratee value argument.
     * @param {*} index The potential iteratee index or key argument.
     * @param {*} object The potential iteratee object argument.
     * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
     *  else `false`.
     */
    function isIterateeCall(value, index, object) {
      if (!isObject_1(object)) {
        return false;
      }
      var type = typeof index;
      if (type == 'number'
            ? (isArrayLike_1(object) && _isIndex(index, object.length))
            : (type == 'string' && index in object)
          ) {
        return eq_1(object[index], value);
      }
      return false;
    }

    var _isIterateeCall = isIterateeCall;

    /**
     * Creates a function like `_.assign`.
     *
     * @private
     * @param {Function} assigner The function to assign values.
     * @returns {Function} Returns the new assigner function.
     */
    function createAssigner(assigner) {
      return _baseRest(function(object, sources) {
        var index = -1,
            length = sources.length,
            customizer = length > 1 ? sources[length - 1] : undefined,
            guard = length > 2 ? sources[2] : undefined;

        customizer = (assigner.length > 3 && typeof customizer == 'function')
          ? (length--, customizer)
          : undefined;

        if (guard && _isIterateeCall(sources[0], sources[1], guard)) {
          customizer = length < 3 ? undefined : customizer;
          length = 1;
        }
        object = Object(object);
        while (++index < length) {
          var source = sources[index];
          if (source) {
            assigner(object, source, index, customizer);
          }
        }
        return object;
      });
    }

    var _createAssigner = createAssigner;

    /** Used for built-in method references. */
    var objectProto$a = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$8 = objectProto$a.hasOwnProperty;

    /**
     * Assigns own enumerable string keyed properties of source objects to the
     * destination object. Source objects are applied from left to right.
     * Subsequent sources overwrite property assignments of previous sources.
     *
     * **Note:** This method mutates `object` and is loosely based on
     * [`Object.assign`](https://mdn.io/Object/assign).
     *
     * @static
     * @memberOf _
     * @since 0.10.0
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} [sources] The source objects.
     * @returns {Object} Returns `object`.
     * @see _.assignIn
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     * }
     *
     * function Bar() {
     *   this.c = 3;
     * }
     *
     * Foo.prototype.b = 2;
     * Bar.prototype.d = 4;
     *
     * _.assign({ 'a': 0 }, new Foo, new Bar);
     * // => { 'a': 1, 'c': 3 }
     */
    var assign$1 = _createAssigner(function(object, source) {
      if (_isPrototype(source) || isArrayLike_1(source)) {
        _copyObject(source, keys_1(source), object);
        return;
      }
      for (var key in source) {
        if (hasOwnProperty$8.call(source, key)) {
          _assignValue(object, key, source[key]);
        }
      }
    });

    var assign_1 = assign$1;

    /** Built-in value references. */
    var getPrototype = _overArg(Object.getPrototypeOf, Object);

    var _getPrototype = getPrototype;

    /** `Object#toString` result references. */
    var objectTag$1 = '[object Object]';

    /** Used for built-in method references. */
    var funcProto$2 = Function.prototype,
        objectProto$b = Object.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString$2 = funcProto$2.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty$9 = objectProto$b.hasOwnProperty;

    /** Used to infer the `Object` constructor. */
    var objectCtorString = funcToString$2.call(Object);

    /**
     * Checks if `value` is a plain object, that is, an object created by the
     * `Object` constructor or one with a `[[Prototype]]` of `null`.
     *
     * @static
     * @memberOf _
     * @since 0.8.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     * }
     *
     * _.isPlainObject(new Foo);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     *
     * _.isPlainObject(Object.create(null));
     * // => true
     */
    function isPlainObject(value) {
      if (!isObjectLike_1(value) || _baseGetTag(value) != objectTag$1) {
        return false;
      }
      var proto = _getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty$9.call(proto, 'constructor') && proto.constructor;
      return typeof Ctor == 'function' && Ctor instanceof Ctor &&
        funcToString$2.call(Ctor) == objectCtorString;
    }

    var isPlainObject_1 = isPlainObject;

    var win;

    if (typeof window !== "undefined") {
        win = window;
    } else if (typeof commonjsGlobal !== "undefined") {
        win = commonjsGlobal;
    } else if (typeof self !== "undefined"){
        win = self;
    } else {
        win = {};
    }

    var window_1 = win;

    var isFunction_1$1 = isFunction$1;

    var toString$1 = Object.prototype.toString;

    function isFunction$1 (fn) {
      if (!fn) {
        return false
      }
      var string = toString$1.call(fn);
      return string === '[object Function]' ||
        (typeof fn === 'function' && string !== '[object RegExp]') ||
        (typeof window !== 'undefined' &&
         // IE8 and below
         (fn === window.setTimeout ||
          fn === window.alert ||
          fn === window.confirm ||
          fn === window.prompt))
    }

    var trim = function(string) {
      return string.replace(/^\s+|\s+$/g, '');
    }
      , isArray$1 = function(arg) {
          return Object.prototype.toString.call(arg) === '[object Array]';
        };

    var parseHeaders = function (headers) {
      if (!headers)
        return {}

      var result = {};

      var headersArr = trim(headers).split('\n');

      for (var i = 0; i < headersArr.length; i++) {
        var row = headersArr[i];
        var index = row.indexOf(':')
        , key = trim(row.slice(0, index)).toLowerCase()
        , value = trim(row.slice(index + 1));

        if (typeof(result[key]) === 'undefined') {
          result[key] = value;
        } else if (isArray$1(result[key])) {
          result[key].push(value);
        } else {
          result[key] = [ result[key], value ];
        }
      }

      return result
    };

    var immutable = extend;

    var hasOwnProperty$a = Object.prototype.hasOwnProperty;

    function extend() {
        var target = {};

        for (var i = 0; i < arguments.length; i++) {
            var source = arguments[i];

            for (var key in source) {
                if (hasOwnProperty$a.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }

        return target
    }

    var xhr = createXHR;
    createXHR.XMLHttpRequest = window_1.XMLHttpRequest || noop$2;
    createXHR.XDomainRequest = "withCredentials" in (new createXHR.XMLHttpRequest()) ? createXHR.XMLHttpRequest : window_1.XDomainRequest;

    forEachArray(["get", "put", "post", "patch", "head", "delete"], function(method) {
        createXHR[method === "delete" ? "del" : method] = function(uri, options, callback) {
            options = initParams(uri, options, callback);
            options.method = method.toUpperCase();
            return _createXHR(options)
        };
    });

    function forEachArray(array, iterator) {
        for (var i = 0; i < array.length; i++) {
            iterator(array[i]);
        }
    }

    function isEmpty(obj){
        for(var i in obj){
            if(obj.hasOwnProperty(i)) return false
        }
        return true
    }

    function initParams(uri, options, callback) {
        var params = uri;

        if (isFunction_1$1(options)) {
            callback = options;
            if (typeof uri === "string") {
                params = {uri:uri};
            }
        } else {
            params = immutable(options, {uri: uri});
        }

        params.callback = callback;
        return params
    }

    function createXHR(uri, options, callback) {
        options = initParams(uri, options, callback);
        return _createXHR(options)
    }

    function _createXHR(options) {
        if(typeof options.callback === "undefined"){
            throw new Error("callback argument missing")
        }

        var called = false;
        var callback = function cbOnce(err, response, body){
            if(!called){
                called = true;
                options.callback(err, response, body);
            }
        };

        function readystatechange() {
            if (xhr.readyState === 4) {
                loadFunc();
            }
        }

        function getBody() {
            // Chrome with requestType=blob throws errors arround when even testing access to responseText
            var body = undefined;

            if (xhr.response) {
                body = xhr.response;
            } else {
                body = xhr.responseText || getXml(xhr);
            }

            if (isJson) {
                try {
                    body = JSON.parse(body);
                } catch (e) {}
            }

            return body
        }

        function errorFunc(evt) {
            clearTimeout(timeoutTimer);
            if(!(evt instanceof Error)){
                evt = new Error("" + (evt || "Unknown XMLHttpRequest Error") );
            }
            evt.statusCode = 0;
            return callback(evt, failureResponse)
        }

        // will load the data & process the response in a special response object
        function loadFunc() {
            if (aborted) return
            var status;
            clearTimeout(timeoutTimer);
            if(options.useXDR && xhr.status===undefined) {
                //IE8 CORS GET successful response doesn't have a status field, but body is fine
                status = 200;
            } else {
                status = (xhr.status === 1223 ? 204 : xhr.status);
            }
            var response = failureResponse;
            var err = null;

            if (status !== 0){
                response = {
                    body: getBody(),
                    statusCode: status,
                    method: method,
                    headers: {},
                    url: uri,
                    rawRequest: xhr
                };
                if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
                    response.headers = parseHeaders(xhr.getAllResponseHeaders());
                }
            } else {
                err = new Error("Internal XMLHttpRequest Error");
            }
            return callback(err, response, response.body)
        }

        var xhr = options.xhr || null;

        if (!xhr) {
            if (options.cors || options.useXDR) {
                xhr = new createXHR.XDomainRequest();
            }else {
                xhr = new createXHR.XMLHttpRequest();
            }
        }

        var key;
        var aborted;
        var uri = xhr.url = options.uri || options.url;
        var method = xhr.method = options.method || "GET";
        var body = options.body || options.data;
        var headers = xhr.headers = options.headers || {};
        var sync = !!options.sync;
        var isJson = false;
        var timeoutTimer;
        var failureResponse = {
            body: undefined,
            headers: {},
            statusCode: 0,
            method: method,
            url: uri,
            rawRequest: xhr
        };

        if ("json" in options && options.json !== false) {
            isJson = true;
            headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json"); //Don't override existing accept header declared by user
            if (method !== "GET" && method !== "HEAD") {
                headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json"); //Don't override existing accept header declared by user
                body = JSON.stringify(options.json === true ? body : options.json);
            }
        }

        xhr.onreadystatechange = readystatechange;
        xhr.onload = loadFunc;
        xhr.onerror = errorFunc;
        // IE9 must have onprogress be set to a unique function.
        xhr.onprogress = function () {
            // IE must die
        };
        xhr.onabort = function(){
            aborted = true;
        };
        xhr.ontimeout = errorFunc;
        xhr.open(method, uri, !sync, options.username, options.password);
        //has to be after open
        if(!sync) {
            xhr.withCredentials = !!options.withCredentials;
        }
        // Cannot set timeout with sync request
        // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
        // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
        if (!sync && options.timeout > 0 ) {
            timeoutTimer = setTimeout(function(){
                if (aborted) return
                aborted = true;//IE9 may still call readystatechange
                xhr.abort("timeout");
                var e = new Error("XMLHttpRequest timeout");
                e.code = "ETIMEDOUT";
                errorFunc(e);
            }, options.timeout );
        }

        if (xhr.setRequestHeader) {
            for(key in headers){
                if(headers.hasOwnProperty(key)){
                    xhr.setRequestHeader(key, headers[key]);
                }
            }
        } else if (options.headers && !isEmpty(options.headers)) {
            throw new Error("Headers cannot be set on an XDomainRequest object")
        }

        if ("responseType" in options) {
            xhr.responseType = options.responseType;
        }

        if ("beforeSend" in options &&
            typeof options.beforeSend === "function"
        ) {
            options.beforeSend(xhr);
        }

        // Microsoft Edge browser sends "undefined" when send is called with undefined value.
        // XMLHttpRequest spec says to pass null as body to indicate no body
        // See https://github.com/naugtur/xhr/issues/100.
        xhr.send(body || null);

        return xhr


    }

    function getXml(xhr) {
        if (xhr.responseType === "document") {
            return xhr.responseXML
        }
        var firefoxBugTakenEffect = xhr.status === 204 && xhr.responseXML && xhr.responseXML.documentElement.nodeName === "parsererror";
        if (xhr.responseType === "" && !firefoxBugTakenEffect) {
            return xhr.responseXML
        }

        return null
    }

    function noop$2() {}

    function AirtableError(error, message, statusCode) {
        this.error = error;
        this.message = message;
        this.statusCode = statusCode;
    }

    AirtableError.prototype.toString = function() {
        return [
            this.message,
            '(',
            this.error,
            ')',
            this.statusCode ? '[Http code ' + this.statusCode + ']' : '',
        ].join('');
    };

    var airtable_error = AirtableError;

    /**
     * Removes all key-value entries from the stack.
     *
     * @private
     * @name clear
     * @memberOf Stack
     */
    function stackClear() {
      this.__data__ = new _ListCache;
      this.size = 0;
    }

    var _stackClear = stackClear;

    /**
     * Removes `key` and its value from the stack.
     *
     * @private
     * @name delete
     * @memberOf Stack
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function stackDelete(key) {
      var data = this.__data__,
          result = data['delete'](key);

      this.size = data.size;
      return result;
    }

    var _stackDelete = stackDelete;

    /**
     * Gets the stack value for `key`.
     *
     * @private
     * @name get
     * @memberOf Stack
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function stackGet(key) {
      return this.__data__.get(key);
    }

    var _stackGet = stackGet;

    /**
     * Checks if a stack value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Stack
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function stackHas(key) {
      return this.__data__.has(key);
    }

    var _stackHas = stackHas;

    /** Used as the size to enable large array optimizations. */
    var LARGE_ARRAY_SIZE = 200;

    /**
     * Sets the stack `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Stack
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the stack cache instance.
     */
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof _ListCache) {
        var pairs = data.__data__;
        if (!_Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new _MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }

    var _stackSet = stackSet;

    /**
     * Creates a stack cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Stack(entries) {
      var data = this.__data__ = new _ListCache(entries);
      this.size = data.size;
    }

    // Add methods to `Stack`.
    Stack.prototype.clear = _stackClear;
    Stack.prototype['delete'] = _stackDelete;
    Stack.prototype.get = _stackGet;
    Stack.prototype.has = _stackHas;
    Stack.prototype.set = _stackSet;

    var _Stack = Stack;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

    /**
     * Adds `value` to the array cache.
     *
     * @private
     * @name add
     * @memberOf SetCache
     * @alias push
     * @param {*} value The value to cache.
     * @returns {Object} Returns the cache instance.
     */
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED$2);
      return this;
    }

    var _setCacheAdd = setCacheAdd;

    /**
     * Checks if `value` is in the array cache.
     *
     * @private
     * @name has
     * @memberOf SetCache
     * @param {*} value The value to search for.
     * @returns {number} Returns `true` if `value` is found, else `false`.
     */
    function setCacheHas(value) {
      return this.__data__.has(value);
    }

    var _setCacheHas = setCacheHas;

    /**
     *
     * Creates an array cache object to store unique values.
     *
     * @private
     * @constructor
     * @param {Array} [values] The values to cache.
     */
    function SetCache(values) {
      var index = -1,
          length = values == null ? 0 : values.length;

      this.__data__ = new _MapCache;
      while (++index < length) {
        this.add(values[index]);
      }
    }

    // Add methods to `SetCache`.
    SetCache.prototype.add = SetCache.prototype.push = _setCacheAdd;
    SetCache.prototype.has = _setCacheHas;

    var _SetCache = SetCache;

    /**
     * A specialized version of `_.some` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     */
    function arraySome(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }

    var _arraySome = arraySome;

    /**
     * Checks if a `cache` value for `key` exists.
     *
     * @private
     * @param {Object} cache The cache to query.
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function cacheHas(cache, key) {
      return cache.has(key);
    }

    var _cacheHas = cacheHas;

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG = 1,
        COMPARE_UNORDERED_FLAG = 2;

    /**
     * A specialized version of `baseIsEqualDeep` for arrays with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Array} array The array to compare.
     * @param {Array} other The other array to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `array` and `other` objects.
     * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
     */
    function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
          arrLength = array.length,
          othLength = other.length;

      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(array);
      if (stacked && stack.get(other)) {
        return stacked == other;
      }
      var index = -1,
          result = true,
          seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new _SetCache : undefined;

      stack.set(array, other);
      stack.set(other, array);

      // Ignore non-index properties.
      while (++index < arrLength) {
        var arrValue = array[index],
            othValue = other[index];

        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, arrValue, index, other, array, stack)
            : customizer(arrValue, othValue, index, array, other, stack);
        }
        if (compared !== undefined) {
          if (compared) {
            continue;
          }
          result = false;
          break;
        }
        // Recursively compare arrays (susceptible to call stack limits).
        if (seen) {
          if (!_arraySome(other, function(othValue, othIndex) {
                if (!_cacheHas(seen, othIndex) &&
                    (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
                  return seen.push(othIndex);
                }
              })) {
            result = false;
            break;
          }
        } else if (!(
              arrValue === othValue ||
                equalFunc(arrValue, othValue, bitmask, customizer, stack)
            )) {
          result = false;
          break;
        }
      }
      stack['delete'](array);
      stack['delete'](other);
      return result;
    }

    var _equalArrays = equalArrays;

    /** Built-in value references. */
    var Uint8Array = _root.Uint8Array;

    var _Uint8Array = Uint8Array;

    /**
     * Converts `map` to its key-value pairs.
     *
     * @private
     * @param {Object} map The map to convert.
     * @returns {Array} Returns the key-value pairs.
     */
    function mapToArray(map) {
      var index = -1,
          result = Array(map.size);

      map.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }

    var _mapToArray = mapToArray;

    /**
     * Converts `set` to an array of its values.
     *
     * @private
     * @param {Object} set The set to convert.
     * @returns {Array} Returns the values.
     */
    function setToArray(set) {
      var index = -1,
          result = Array(set.size);

      set.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }

    var _setToArray = setToArray;

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$1 = 1,
        COMPARE_UNORDERED_FLAG$1 = 2;

    /** `Object#toString` result references. */
    var boolTag$1 = '[object Boolean]',
        dateTag$1 = '[object Date]',
        errorTag$1 = '[object Error]',
        mapTag$1 = '[object Map]',
        numberTag$1 = '[object Number]',
        regexpTag$1 = '[object RegExp]',
        setTag$1 = '[object Set]',
        stringTag$1 = '[object String]',
        symbolTag$1 = '[object Symbol]';

    var arrayBufferTag$1 = '[object ArrayBuffer]',
        dataViewTag$1 = '[object DataView]';

    /** Used to convert symbols to primitives and strings. */
    var symbolProto$1 = _Symbol ? _Symbol.prototype : undefined,
        symbolValueOf = symbolProto$1 ? symbolProto$1.valueOf : undefined;

    /**
     * A specialized version of `baseIsEqualDeep` for comparing objects of
     * the same `toStringTag`.
     *
     * **Note:** This function only supports comparing values with tags of
     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {string} tag The `toStringTag` of the objects to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
      switch (tag) {
        case dataViewTag$1:
          if ((object.byteLength != other.byteLength) ||
              (object.byteOffset != other.byteOffset)) {
            return false;
          }
          object = object.buffer;
          other = other.buffer;

        case arrayBufferTag$1:
          if ((object.byteLength != other.byteLength) ||
              !equalFunc(new _Uint8Array(object), new _Uint8Array(other))) {
            return false;
          }
          return true;

        case boolTag$1:
        case dateTag$1:
        case numberTag$1:
          // Coerce booleans to `1` or `0` and dates to milliseconds.
          // Invalid dates are coerced to `NaN`.
          return eq_1(+object, +other);

        case errorTag$1:
          return object.name == other.name && object.message == other.message;

        case regexpTag$1:
        case stringTag$1:
          // Coerce regexes to strings and treat strings, primitives and objects,
          // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
          // for more details.
          return object == (other + '');

        case mapTag$1:
          var convert = _mapToArray;

        case setTag$1:
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1;
          convert || (convert = _setToArray);

          if (object.size != other.size && !isPartial) {
            return false;
          }
          // Assume cyclic values are equal.
          var stacked = stack.get(object);
          if (stacked) {
            return stacked == other;
          }
          bitmask |= COMPARE_UNORDERED_FLAG$1;

          // Recursively compare objects (susceptible to call stack limits).
          stack.set(object, other);
          var result = _equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
          stack['delete'](object);
          return result;

        case symbolTag$1:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
          }
      }
      return false;
    }

    var _equalByTag = equalByTag;

    /**
     * Appends the elements of `values` to `array`.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {Array} values The values to append.
     * @returns {Array} Returns `array`.
     */
    function arrayPush(array, values) {
      var index = -1,
          length = values.length,
          offset = array.length;

      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }

    var _arrayPush = arrayPush;

    /**
     * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
     * `keysFunc` and `symbolsFunc` to get the enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @param {Function} symbolsFunc The function to get the symbols of `object`.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray_1(object) ? result : _arrayPush(result, symbolsFunc(object));
    }

    var _baseGetAllKeys = baseGetAllKeys;

    /**
     * A specialized version of `_.filter` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */
    function arrayFilter(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }

    var _arrayFilter = arrayFilter;

    /**
     * This method returns a new empty array.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {Array} Returns the new empty array.
     * @example
     *
     * var arrays = _.times(2, _.stubArray);
     *
     * console.log(arrays);
     * // => [[], []]
     *
     * console.log(arrays[0] === arrays[1]);
     * // => false
     */
    function stubArray() {
      return [];
    }

    var stubArray_1 = stubArray;

    /** Used for built-in method references. */
    var objectProto$c = Object.prototype;

    /** Built-in value references. */
    var propertyIsEnumerable$1 = objectProto$c.propertyIsEnumerable;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeGetSymbols = Object.getOwnPropertySymbols;

    /**
     * Creates an array of the own enumerable symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbols = !nativeGetSymbols ? stubArray_1 : function(object) {
      if (object == null) {
        return [];
      }
      object = Object(object);
      return _arrayFilter(nativeGetSymbols(object), function(symbol) {
        return propertyIsEnumerable$1.call(object, symbol);
      });
    };

    var _getSymbols = getSymbols;

    /**
     * Creates an array of own enumerable property names and symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function getAllKeys(object) {
      return _baseGetAllKeys(object, keys_1, _getSymbols);
    }

    var _getAllKeys = getAllKeys;

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$2 = 1;

    /** Used for built-in method references. */
    var objectProto$d = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$b = objectProto$d.hasOwnProperty;

    /**
     * A specialized version of `baseIsEqualDeep` for objects with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2,
          objProps = _getAllKeys(object),
          objLength = objProps.length,
          othProps = _getAllKeys(other),
          othLength = othProps.length;

      if (objLength != othLength && !isPartial) {
        return false;
      }
      var index = objLength;
      while (index--) {
        var key = objProps[index];
        if (!(isPartial ? key in other : hasOwnProperty$b.call(other, key))) {
          return false;
        }
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked && stack.get(other)) {
        return stacked == other;
      }
      var result = true;
      stack.set(object, other);
      stack.set(other, object);

      var skipCtor = isPartial;
      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key],
            othValue = other[key];

        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, objValue, key, other, object, stack)
            : customizer(objValue, othValue, key, object, other, stack);
        }
        // Recursively compare objects (susceptible to call stack limits).
        if (!(compared === undefined
              ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
              : compared
            )) {
          result = false;
          break;
        }
        skipCtor || (skipCtor = key == 'constructor');
      }
      if (result && !skipCtor) {
        var objCtor = object.constructor,
            othCtor = other.constructor;

        // Non `Object` object instances with different constructors are not equal.
        if (objCtor != othCtor &&
            ('constructor' in object && 'constructor' in other) &&
            !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
              typeof othCtor == 'function' && othCtor instanceof othCtor)) {
          result = false;
        }
      }
      stack['delete'](object);
      stack['delete'](other);
      return result;
    }

    var _equalObjects = equalObjects;

    /* Built-in method references that are verified to be native. */
    var DataView = _getNative(_root, 'DataView');

    var _DataView = DataView;

    /* Built-in method references that are verified to be native. */
    var Promise$1 = _getNative(_root, 'Promise');

    var _Promise = Promise$1;

    /* Built-in method references that are verified to be native. */
    var Set$1 = _getNative(_root, 'Set');

    var _Set = Set$1;

    /* Built-in method references that are verified to be native. */
    var WeakMap = _getNative(_root, 'WeakMap');

    var _WeakMap = WeakMap;

    /** `Object#toString` result references. */
    var mapTag$2 = '[object Map]',
        objectTag$2 = '[object Object]',
        promiseTag = '[object Promise]',
        setTag$2 = '[object Set]',
        weakMapTag$1 = '[object WeakMap]';

    var dataViewTag$2 = '[object DataView]';

    /** Used to detect maps, sets, and weakmaps. */
    var dataViewCtorString = _toSource(_DataView),
        mapCtorString = _toSource(_Map),
        promiseCtorString = _toSource(_Promise),
        setCtorString = _toSource(_Set),
        weakMapCtorString = _toSource(_WeakMap);

    /**
     * Gets the `toStringTag` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    var getTag = _baseGetTag;

    // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
    if ((_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag$2) ||
        (_Map && getTag(new _Map) != mapTag$2) ||
        (_Promise && getTag(_Promise.resolve()) != promiseTag) ||
        (_Set && getTag(new _Set) != setTag$2) ||
        (_WeakMap && getTag(new _WeakMap) != weakMapTag$1)) {
      getTag = function(value) {
        var result = _baseGetTag(value),
            Ctor = result == objectTag$2 ? value.constructor : undefined,
            ctorString = Ctor ? _toSource(Ctor) : '';

        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString: return dataViewTag$2;
            case mapCtorString: return mapTag$2;
            case promiseCtorString: return promiseTag;
            case setCtorString: return setTag$2;
            case weakMapCtorString: return weakMapTag$1;
          }
        }
        return result;
      };
    }

    var _getTag = getTag;

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$3 = 1;

    /** `Object#toString` result references. */
    var argsTag$2 = '[object Arguments]',
        arrayTag$1 = '[object Array]',
        objectTag$3 = '[object Object]';

    /** Used for built-in method references. */
    var objectProto$e = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$c = objectProto$e.hasOwnProperty;

    /**
     * A specialized version of `baseIsEqual` for arrays and objects which performs
     * deep comparisons and tracks traversed objects enabling objects with circular
     * references to be compared.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} [stack] Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
      var objIsArr = isArray_1(object),
          othIsArr = isArray_1(other),
          objTag = objIsArr ? arrayTag$1 : _getTag(object),
          othTag = othIsArr ? arrayTag$1 : _getTag(other);

      objTag = objTag == argsTag$2 ? objectTag$3 : objTag;
      othTag = othTag == argsTag$2 ? objectTag$3 : othTag;

      var objIsObj = objTag == objectTag$3,
          othIsObj = othTag == objectTag$3,
          isSameTag = objTag == othTag;

      if (isSameTag && isBuffer_1(object)) {
        if (!isBuffer_1(other)) {
          return false;
        }
        objIsArr = true;
        objIsObj = false;
      }
      if (isSameTag && !objIsObj) {
        stack || (stack = new _Stack);
        return (objIsArr || isTypedArray_1(object))
          ? _equalArrays(object, other, bitmask, customizer, equalFunc, stack)
          : _equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
      }
      if (!(bitmask & COMPARE_PARTIAL_FLAG$3)) {
        var objIsWrapped = objIsObj && hasOwnProperty$c.call(object, '__wrapped__'),
            othIsWrapped = othIsObj && hasOwnProperty$c.call(other, '__wrapped__');

        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object,
              othUnwrapped = othIsWrapped ? other.value() : other;

          stack || (stack = new _Stack);
          return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
        }
      }
      if (!isSameTag) {
        return false;
      }
      stack || (stack = new _Stack);
      return _equalObjects(object, other, bitmask, customizer, equalFunc, stack);
    }

    var _baseIsEqualDeep = baseIsEqualDeep;

    /**
     * The base implementation of `_.isEqual` which supports partial comparisons
     * and tracks traversed objects.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @param {boolean} bitmask The bitmask flags.
     *  1 - Unordered comparison
     *  2 - Partial comparison
     * @param {Function} [customizer] The function to customize comparisons.
     * @param {Object} [stack] Tracks traversed `value` and `other` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(value, other, bitmask, customizer, stack) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || (!isObjectLike_1(value) && !isObjectLike_1(other))) {
        return value !== value && other !== other;
      }
      return _baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
    }

    var _baseIsEqual = baseIsEqual;

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$4 = 1,
        COMPARE_UNORDERED_FLAG$2 = 2;

    /**
     * The base implementation of `_.isMatch` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The object to inspect.
     * @param {Object} source The object of property values to match.
     * @param {Array} matchData The property names, values, and compare flags to match.
     * @param {Function} [customizer] The function to customize comparisons.
     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
     */
    function baseIsMatch(object, source, matchData, customizer) {
      var index = matchData.length,
          length = index,
          noCustomizer = !customizer;

      if (object == null) {
        return !length;
      }
      object = Object(object);
      while (index--) {
        var data = matchData[index];
        if ((noCustomizer && data[2])
              ? data[1] !== object[data[0]]
              : !(data[0] in object)
            ) {
          return false;
        }
      }
      while (++index < length) {
        data = matchData[index];
        var key = data[0],
            objValue = object[key],
            srcValue = data[1];

        if (noCustomizer && data[2]) {
          if (objValue === undefined && !(key in object)) {
            return false;
          }
        } else {
          var stack = new _Stack;
          if (customizer) {
            var result = customizer(objValue, srcValue, key, object, source, stack);
          }
          if (!(result === undefined
                ? _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$4 | COMPARE_UNORDERED_FLAG$2, customizer, stack)
                : result
              )) {
            return false;
          }
        }
      }
      return true;
    }

    var _baseIsMatch = baseIsMatch;

    /**
     * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` if suitable for strict
     *  equality comparisons, else `false`.
     */
    function isStrictComparable(value) {
      return value === value && !isObject_1(value);
    }

    var _isStrictComparable = isStrictComparable;

    /**
     * Gets the property names, values, and compare flags of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the match data of `object`.
     */
    function getMatchData(object) {
      var result = keys_1(object),
          length = result.length;

      while (length--) {
        var key = result[length],
            value = object[key];

        result[length] = [key, value, _isStrictComparable(value)];
      }
      return result;
    }

    var _getMatchData = getMatchData;

    /**
     * A specialized version of `matchesProperty` for source values suitable
     * for strict equality comparisons, i.e. `===`.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new spec function.
     */
    function matchesStrictComparable(key, srcValue) {
      return function(object) {
        if (object == null) {
          return false;
        }
        return object[key] === srcValue &&
          (srcValue !== undefined || (key in Object(object)));
      };
    }

    var _matchesStrictComparable = matchesStrictComparable;

    /**
     * The base implementation of `_.matches` which doesn't clone `source`.
     *
     * @private
     * @param {Object} source The object of property values to match.
     * @returns {Function} Returns the new spec function.
     */
    function baseMatches(source) {
      var matchData = _getMatchData(source);
      if (matchData.length == 1 && matchData[0][2]) {
        return _matchesStrictComparable(matchData[0][0], matchData[0][1]);
      }
      return function(object) {
        return object === source || _baseIsMatch(object, source, matchData);
      };
    }

    var _baseMatches = baseMatches;

    /**
     * The base implementation of `_.hasIn` without support for deep paths.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {Array|string} key The key to check.
     * @returns {boolean} Returns `true` if `key` exists, else `false`.
     */
    function baseHasIn(object, key) {
      return object != null && key in Object(object);
    }

    var _baseHasIn = baseHasIn;

    /**
     * Checks if `path` exists on `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @param {Function} hasFunc The function to check properties.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     */
    function hasPath(object, path, hasFunc) {
      path = _castPath(path, object);

      var index = -1,
          length = path.length,
          result = false;

      while (++index < length) {
        var key = _toKey(path[index]);
        if (!(result = object != null && hasFunc(object, key))) {
          break;
        }
        object = object[key];
      }
      if (result || ++index != length) {
        return result;
      }
      length = object == null ? 0 : object.length;
      return !!length && isLength_1(length) && _isIndex(key, length) &&
        (isArray_1(object) || isArguments_1(object));
    }

    var _hasPath = hasPath;

    /**
     * Checks if `path` is a direct or inherited property of `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     * @example
     *
     * var object = _.create({ 'a': _.create({ 'b': 2 }) });
     *
     * _.hasIn(object, 'a');
     * // => true
     *
     * _.hasIn(object, 'a.b');
     * // => true
     *
     * _.hasIn(object, ['a', 'b']);
     * // => true
     *
     * _.hasIn(object, 'b');
     * // => false
     */
    function hasIn(object, path) {
      return object != null && _hasPath(object, path, _baseHasIn);
    }

    var hasIn_1 = hasIn;

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG$5 = 1,
        COMPARE_UNORDERED_FLAG$3 = 2;

    /**
     * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
     *
     * @private
     * @param {string} path The path of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new spec function.
     */
    function baseMatchesProperty(path, srcValue) {
      if (_isKey(path) && _isStrictComparable(srcValue)) {
        return _matchesStrictComparable(_toKey(path), srcValue);
      }
      return function(object) {
        var objValue = get_1(object, path);
        return (objValue === undefined && objValue === srcValue)
          ? hasIn_1(object, path)
          : _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$5 | COMPARE_UNORDERED_FLAG$3);
      };
    }

    var _baseMatchesProperty = baseMatchesProperty;

    /**
     * The base implementation of `_.property` without support for deep paths.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @returns {Function} Returns the new accessor function.
     */
    function baseProperty(key) {
      return function(object) {
        return object == null ? undefined : object[key];
      };
    }

    var _baseProperty = baseProperty;

    /**
     * A specialized version of `baseProperty` which supports deep paths.
     *
     * @private
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new accessor function.
     */
    function basePropertyDeep(path) {
      return function(object) {
        return _baseGet(object, path);
      };
    }

    var _basePropertyDeep = basePropertyDeep;

    /**
     * Creates a function that returns the value at `path` of a given object.
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Util
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new accessor function.
     * @example
     *
     * var objects = [
     *   { 'a': { 'b': 2 } },
     *   { 'a': { 'b': 1 } }
     * ];
     *
     * _.map(objects, _.property('a.b'));
     * // => [2, 1]
     *
     * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
     * // => [1, 2]
     */
    function property(path) {
      return _isKey(path) ? _baseProperty(_toKey(path)) : _basePropertyDeep(path);
    }

    var property_1 = property;

    /**
     * The base implementation of `_.iteratee`.
     *
     * @private
     * @param {*} [value=_.identity] The value to convert to an iteratee.
     * @returns {Function} Returns the iteratee.
     */
    function baseIteratee(value) {
      // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
      // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
      if (typeof value == 'function') {
        return value;
      }
      if (value == null) {
        return identity_1;
      }
      if (typeof value == 'object') {
        return isArray_1(value)
          ? _baseMatchesProperty(value[0], value[1])
          : _baseMatches(value);
      }
      return property_1(value);
    }

    var _baseIteratee = baseIteratee;

    /**
     * The base implementation of `_.map` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */
    function baseMap(collection, iteratee) {
      var index = -1,
          result = isArrayLike_1(collection) ? Array(collection.length) : [];

      _baseEach(collection, function(value, key, collection) {
        result[++index] = iteratee(value, key, collection);
      });
      return result;
    }

    var _baseMap = baseMap;

    /**
     * Creates an array of values by running each element in `collection` thru
     * `iteratee`. The iteratee is invoked with three arguments:
     * (value, index|key, collection).
     *
     * Many lodash methods are guarded to work as iteratees for methods like
     * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
     *
     * The guarded methods are:
     * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
     * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
     * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
     * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     * @example
     *
     * function square(n) {
     *   return n * n;
     * }
     *
     * _.map([4, 8], square);
     * // => [16, 64]
     *
     * _.map({ 'a': 4, 'b': 8 }, square);
     * // => [16, 64] (iteration order is not guaranteed)
     *
     * var users = [
     *   { 'user': 'barney' },
     *   { 'user': 'fred' }
     * ];
     *
     * // The `_.property` iteratee shorthand.
     * _.map(users, 'user');
     * // => ['barney', 'fred']
     */
    function map(collection, iteratee) {
      var func = isArray_1(collection) ? _arrayMap : _baseMap;
      return func(collection, _baseIteratee(iteratee));
    }

    var map_1 = map;

    var didWarnForDeprecation = {};

    /**
     * Convenience function for marking a function as deprecated.
     *
     * Will emit a warning the first time that function is called.
     *
     * @param fn the function to mark as deprecated.
     * @param key a unique key identifying the function.
     * @param message the warning message.
     *
     * @return a wrapped function
     */
    function deprecate(fn, key, message) {
        return function() {
            if (!didWarnForDeprecation[key]) {
                didWarnForDeprecation[key] = true;
                console.warn(message);
            }
            fn.apply(this, arguments);
        };
    }

    var deprecate_1 = deprecate;

    /** `Object#toString` result references. */
    var stringTag$2 = '[object String]';

    /**
     * Checks if `value` is classified as a `String` primitive or object.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a string, else `false`.
     * @example
     *
     * _.isString('abc');
     * // => true
     *
     * _.isString(1);
     * // => false
     */
    function isString(value) {
      return typeof value == 'string' ||
        (!isArray_1(value) && isObjectLike_1(value) && _baseGetTag(value) == stringTag$2);
    }

    var isString_1 = isString;

    /** `Object#toString` result references. */
    var numberTag$2 = '[object Number]';

    /**
     * Checks if `value` is classified as a `Number` primitive or object.
     *
     * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are
     * classified as numbers, use the `_.isFinite` method.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a number, else `false`.
     * @example
     *
     * _.isNumber(3);
     * // => true
     *
     * _.isNumber(Number.MIN_VALUE);
     * // => true
     *
     * _.isNumber(Infinity);
     * // => true
     *
     * _.isNumber('3');
     * // => false
     */
    function isNumber(value) {
      return typeof value == 'number' ||
        (isObjectLike_1(value) && _baseGetTag(value) == numberTag$2);
    }

    var isNumber_1 = isNumber;

    /**
     * The base implementation of `_.findIndex` and `_.findLastIndex` without
     * support for iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {Function} predicate The function invoked per iteration.
     * @param {number} fromIndex The index to search from.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function baseFindIndex(array, predicate, fromIndex, fromRight) {
      var length = array.length,
          index = fromIndex + (fromRight ? 1 : -1);

      while ((fromRight ? index-- : ++index < length)) {
        if (predicate(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    var _baseFindIndex = baseFindIndex;

    /**
     * The base implementation of `_.isNaN` without support for number objects.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
     */
    function baseIsNaN(value) {
      return value !== value;
    }

    var _baseIsNaN = baseIsNaN;

    /**
     * A specialized version of `_.indexOf` which performs strict equality
     * comparisons of values, i.e. `===`.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} value The value to search for.
     * @param {number} fromIndex The index to search from.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function strictIndexOf(array, value, fromIndex) {
      var index = fromIndex - 1,
          length = array.length;

      while (++index < length) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    var _strictIndexOf = strictIndexOf;

    /**
     * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} value The value to search for.
     * @param {number} fromIndex The index to search from.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function baseIndexOf(array, value, fromIndex) {
      return value === value
        ? _strictIndexOf(array, value, fromIndex)
        : _baseFindIndex(array, _baseIsNaN, fromIndex);
    }

    var _baseIndexOf = baseIndexOf;

    /** Used as references for various `Number` constants. */
    var NAN = 0 / 0;

    /** Used to match leading and trailing whitespace. */
    var reTrim = /^\s+|\s+$/g;

    /** Used to detect bad signed hexadecimal string values. */
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

    /** Used to detect binary string values. */
    var reIsBinary = /^0b[01]+$/i;

    /** Used to detect octal string values. */
    var reIsOctal = /^0o[0-7]+$/i;

    /** Built-in method references without a dependency on `root`. */
    var freeParseInt = parseInt;

    /**
     * Converts `value` to a number.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to process.
     * @returns {number} Returns the number.
     * @example
     *
     * _.toNumber(3.2);
     * // => 3.2
     *
     * _.toNumber(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toNumber(Infinity);
     * // => Infinity
     *
     * _.toNumber('3.2');
     * // => 3.2
     */
    function toNumber(value) {
      if (typeof value == 'number') {
        return value;
      }
      if (isSymbol_1(value)) {
        return NAN;
      }
      if (isObject_1(value)) {
        var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
        value = isObject_1(other) ? (other + '') : other;
      }
      if (typeof value != 'string') {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, '');
      var isBinary = reIsBinary.test(value);
      return (isBinary || reIsOctal.test(value))
        ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
        : (reIsBadHex.test(value) ? NAN : +value);
    }

    var toNumber_1 = toNumber;

    /** Used as references for various `Number` constants. */
    var INFINITY$2 = 1 / 0,
        MAX_INTEGER = 1.7976931348623157e+308;

    /**
     * Converts `value` to a finite number.
     *
     * @static
     * @memberOf _
     * @since 4.12.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted number.
     * @example
     *
     * _.toFinite(3.2);
     * // => 3.2
     *
     * _.toFinite(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toFinite(Infinity);
     * // => 1.7976931348623157e+308
     *
     * _.toFinite('3.2');
     * // => 3.2
     */
    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber_1(value);
      if (value === INFINITY$2 || value === -INFINITY$2) {
        var sign = (value < 0 ? -1 : 1);
        return sign * MAX_INTEGER;
      }
      return value === value ? value : 0;
    }

    var toFinite_1 = toFinite;

    /**
     * Converts `value` to an integer.
     *
     * **Note:** This method is loosely based on
     * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted integer.
     * @example
     *
     * _.toInteger(3.2);
     * // => 3
     *
     * _.toInteger(Number.MIN_VALUE);
     * // => 0
     *
     * _.toInteger(Infinity);
     * // => 1.7976931348623157e+308
     *
     * _.toInteger('3.2');
     * // => 3
     */
    function toInteger(value) {
      var result = toFinite_1(value),
          remainder = result % 1;

      return result === result ? (remainder ? result - remainder : result) : 0;
    }

    var toInteger_1 = toInteger;

    /**
     * The base implementation of `_.values` and `_.valuesIn` which creates an
     * array of `object` property values corresponding to the property names
     * of `props`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array} props The property names to get values for.
     * @returns {Object} Returns the array of property values.
     */
    function baseValues(object, props) {
      return _arrayMap(props, function(key) {
        return object[key];
      });
    }

    var _baseValues = baseValues;

    /**
     * Creates an array of the own enumerable string keyed property values of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property values.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.values(new Foo);
     * // => [1, 2] (iteration order is not guaranteed)
     *
     * _.values('hi');
     * // => ['h', 'i']
     */
    function values(object) {
      return object == null ? [] : _baseValues(object, keys_1(object));
    }

    var values_1 = values;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeMax$1 = Math.max;

    /**
     * Checks if `value` is in `collection`. If `collection` is a string, it's
     * checked for a substring of `value`, otherwise
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * is used for equality comparisons. If `fromIndex` is negative, it's used as
     * the offset from the end of `collection`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object|string} collection The collection to inspect.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=0] The index to search from.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
     * @returns {boolean} Returns `true` if `value` is found, else `false`.
     * @example
     *
     * _.includes([1, 2, 3], 1);
     * // => true
     *
     * _.includes([1, 2, 3], 1, 2);
     * // => false
     *
     * _.includes({ 'a': 1, 'b': 2 }, 1);
     * // => true
     *
     * _.includes('abcd', 'bc');
     * // => true
     */
    function includes(collection, value, fromIndex, guard) {
      collection = isArrayLike_1(collection) ? collection : values_1(collection);
      fromIndex = (fromIndex && !guard) ? toInteger_1(fromIndex) : 0;

      var length = collection.length;
      if (fromIndex < 0) {
        fromIndex = nativeMax$1(length + fromIndex, 0);
      }
      return isString_1(collection)
        ? (fromIndex <= length && collection.indexOf(value, fromIndex) > -1)
        : (!!length && _baseIndexOf(collection, value, fromIndex) > -1);
    }

    var includes_1 = includes;

    /**
     * The base implementation of `_.assign` without support for multiple sources
     * or `customizer` functions.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @returns {Object} Returns `object`.
     */
    function baseAssign(object, source) {
      return object && _copyObject(source, keys_1(source), object);
    }

    var _baseAssign = baseAssign;

    /**
     * This function is like
     * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * except that it includes inherited enumerable properties.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function nativeKeysIn(object) {
      var result = [];
      if (object != null) {
        for (var key in Object(object)) {
          result.push(key);
        }
      }
      return result;
    }

    var _nativeKeysIn = nativeKeysIn;

    /** Used for built-in method references. */
    var objectProto$f = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$d = objectProto$f.hasOwnProperty;

    /**
     * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeysIn(object) {
      if (!isObject_1(object)) {
        return _nativeKeysIn(object);
      }
      var isProto = _isPrototype(object),
          result = [];

      for (var key in object) {
        if (!(key == 'constructor' && (isProto || !hasOwnProperty$d.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }

    var _baseKeysIn = baseKeysIn;

    /**
     * Creates an array of the own and inherited enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keysIn(new Foo);
     * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
     */
    function keysIn$1(object) {
      return isArrayLike_1(object) ? _arrayLikeKeys(object, true) : _baseKeysIn(object);
    }

    var keysIn_1 = keysIn$1;

    /**
     * The base implementation of `_.assignIn` without support for multiple sources
     * or `customizer` functions.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @returns {Object} Returns `object`.
     */
    function baseAssignIn(object, source) {
      return object && _copyObject(source, keysIn_1(source), object);
    }

    var _baseAssignIn = baseAssignIn;

    var _cloneBuffer = createCommonjsModule(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports =  exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Built-in value references. */
    var Buffer = moduleExports ? _root.Buffer : undefined,
        allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

    /**
     * Creates a clone of  `buffer`.
     *
     * @private
     * @param {Buffer} buffer The buffer to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Buffer} Returns the cloned buffer.
     */
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length = buffer.length,
          result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

      buffer.copy(result);
      return result;
    }

    module.exports = cloneBuffer;
    });

    /**
     * Copies the values of `source` to `array`.
     *
     * @private
     * @param {Array} source The array to copy values from.
     * @param {Array} [array=[]] The array to copy values to.
     * @returns {Array} Returns `array`.
     */
    function copyArray(source, array) {
      var index = -1,
          length = source.length;

      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }

    var _copyArray = copyArray;

    /**
     * Copies own symbols of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy symbols from.
     * @param {Object} [object={}] The object to copy symbols to.
     * @returns {Object} Returns `object`.
     */
    function copySymbols(source, object) {
      return _copyObject(source, _getSymbols(source), object);
    }

    var _copySymbols = copySymbols;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeGetSymbols$1 = Object.getOwnPropertySymbols;

    /**
     * Creates an array of the own and inherited enumerable symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbolsIn = !nativeGetSymbols$1 ? stubArray_1 : function(object) {
      var result = [];
      while (object) {
        _arrayPush(result, _getSymbols(object));
        object = _getPrototype(object);
      }
      return result;
    };

    var _getSymbolsIn = getSymbolsIn;

    /**
     * Copies own and inherited symbols of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy symbols from.
     * @param {Object} [object={}] The object to copy symbols to.
     * @returns {Object} Returns `object`.
     */
    function copySymbolsIn(source, object) {
      return _copyObject(source, _getSymbolsIn(source), object);
    }

    var _copySymbolsIn = copySymbolsIn;

    /**
     * Creates an array of own and inherited enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function getAllKeysIn(object) {
      return _baseGetAllKeys(object, keysIn_1, _getSymbolsIn);
    }

    var _getAllKeysIn = getAllKeysIn;

    /** Used for built-in method references. */
    var objectProto$g = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$e = objectProto$g.hasOwnProperty;

    /**
     * Initializes an array clone.
     *
     * @private
     * @param {Array} array The array to clone.
     * @returns {Array} Returns the initialized clone.
     */
    function initCloneArray(array) {
      var length = array.length,
          result = new array.constructor(length);

      // Add properties assigned by `RegExp#exec`.
      if (length && typeof array[0] == 'string' && hasOwnProperty$e.call(array, 'index')) {
        result.index = array.index;
        result.input = array.input;
      }
      return result;
    }

    var _initCloneArray = initCloneArray;

    /**
     * Creates a clone of `arrayBuffer`.
     *
     * @private
     * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
     * @returns {ArrayBuffer} Returns the cloned array buffer.
     */
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new _Uint8Array(result).set(new _Uint8Array(arrayBuffer));
      return result;
    }

    var _cloneArrayBuffer = cloneArrayBuffer;

    /**
     * Creates a clone of `dataView`.
     *
     * @private
     * @param {Object} dataView The data view to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned data view.
     */
    function cloneDataView(dataView, isDeep) {
      var buffer = isDeep ? _cloneArrayBuffer(dataView.buffer) : dataView.buffer;
      return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
    }

    var _cloneDataView = cloneDataView;

    /** Used to match `RegExp` flags from their coerced string values. */
    var reFlags = /\w*$/;

    /**
     * Creates a clone of `regexp`.
     *
     * @private
     * @param {Object} regexp The regexp to clone.
     * @returns {Object} Returns the cloned regexp.
     */
    function cloneRegExp(regexp) {
      var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
      result.lastIndex = regexp.lastIndex;
      return result;
    }

    var _cloneRegExp = cloneRegExp;

    /** Used to convert symbols to primitives and strings. */
    var symbolProto$2 = _Symbol ? _Symbol.prototype : undefined,
        symbolValueOf$1 = symbolProto$2 ? symbolProto$2.valueOf : undefined;

    /**
     * Creates a clone of the `symbol` object.
     *
     * @private
     * @param {Object} symbol The symbol object to clone.
     * @returns {Object} Returns the cloned symbol object.
     */
    function cloneSymbol(symbol) {
      return symbolValueOf$1 ? Object(symbolValueOf$1.call(symbol)) : {};
    }

    var _cloneSymbol = cloneSymbol;

    /**
     * Creates a clone of `typedArray`.
     *
     * @private
     * @param {Object} typedArray The typed array to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned typed array.
     */
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep ? _cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }

    var _cloneTypedArray = cloneTypedArray;

    /** `Object#toString` result references. */
    var boolTag$2 = '[object Boolean]',
        dateTag$2 = '[object Date]',
        mapTag$3 = '[object Map]',
        numberTag$3 = '[object Number]',
        regexpTag$2 = '[object RegExp]',
        setTag$3 = '[object Set]',
        stringTag$3 = '[object String]',
        symbolTag$2 = '[object Symbol]';

    var arrayBufferTag$2 = '[object ArrayBuffer]',
        dataViewTag$3 = '[object DataView]',
        float32Tag$1 = '[object Float32Array]',
        float64Tag$1 = '[object Float64Array]',
        int8Tag$1 = '[object Int8Array]',
        int16Tag$1 = '[object Int16Array]',
        int32Tag$1 = '[object Int32Array]',
        uint8Tag$1 = '[object Uint8Array]',
        uint8ClampedTag$1 = '[object Uint8ClampedArray]',
        uint16Tag$1 = '[object Uint16Array]',
        uint32Tag$1 = '[object Uint32Array]';

    /**
     * Initializes an object clone based on its `toStringTag`.
     *
     * **Note:** This function only supports cloning values with tags of
     * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
     *
     * @private
     * @param {Object} object The object to clone.
     * @param {string} tag The `toStringTag` of the object to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneByTag(object, tag, isDeep) {
      var Ctor = object.constructor;
      switch (tag) {
        case arrayBufferTag$2:
          return _cloneArrayBuffer(object);

        case boolTag$2:
        case dateTag$2:
          return new Ctor(+object);

        case dataViewTag$3:
          return _cloneDataView(object, isDeep);

        case float32Tag$1: case float64Tag$1:
        case int8Tag$1: case int16Tag$1: case int32Tag$1:
        case uint8Tag$1: case uint8ClampedTag$1: case uint16Tag$1: case uint32Tag$1:
          return _cloneTypedArray(object, isDeep);

        case mapTag$3:
          return new Ctor;

        case numberTag$3:
        case stringTag$3:
          return new Ctor(object);

        case regexpTag$2:
          return _cloneRegExp(object);

        case setTag$3:
          return new Ctor;

        case symbolTag$2:
          return _cloneSymbol(object);
      }
    }

    var _initCloneByTag = initCloneByTag;

    /** Built-in value references. */
    var objectCreate = Object.create;

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} proto The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    var baseCreate = (function() {
      function object() {}
      return function(proto) {
        if (!isObject_1(proto)) {
          return {};
        }
        if (objectCreate) {
          return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object;
        object.prototype = undefined;
        return result;
      };
    }());

    var _baseCreate = baseCreate;

    /**
     * Initializes an object clone.
     *
     * @private
     * @param {Object} object The object to clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneObject(object) {
      return (typeof object.constructor == 'function' && !_isPrototype(object))
        ? _baseCreate(_getPrototype(object))
        : {};
    }

    var _initCloneObject = initCloneObject;

    /** `Object#toString` result references. */
    var mapTag$4 = '[object Map]';

    /**
     * The base implementation of `_.isMap` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a map, else `false`.
     */
    function baseIsMap(value) {
      return isObjectLike_1(value) && _getTag(value) == mapTag$4;
    }

    var _baseIsMap = baseIsMap;

    /* Node.js helper references. */
    var nodeIsMap = _nodeUtil && _nodeUtil.isMap;

    /**
     * Checks if `value` is classified as a `Map` object.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a map, else `false`.
     * @example
     *
     * _.isMap(new Map);
     * // => true
     *
     * _.isMap(new WeakMap);
     * // => false
     */
    var isMap = nodeIsMap ? _baseUnary(nodeIsMap) : _baseIsMap;

    var isMap_1 = isMap;

    /** `Object#toString` result references. */
    var setTag$4 = '[object Set]';

    /**
     * The base implementation of `_.isSet` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a set, else `false`.
     */
    function baseIsSet(value) {
      return isObjectLike_1(value) && _getTag(value) == setTag$4;
    }

    var _baseIsSet = baseIsSet;

    /* Node.js helper references. */
    var nodeIsSet = _nodeUtil && _nodeUtil.isSet;

    /**
     * Checks if `value` is classified as a `Set` object.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a set, else `false`.
     * @example
     *
     * _.isSet(new Set);
     * // => true
     *
     * _.isSet(new WeakSet);
     * // => false
     */
    var isSet = nodeIsSet ? _baseUnary(nodeIsSet) : _baseIsSet;

    var isSet_1 = isSet;

    /** Used to compose bitmasks for cloning. */
    var CLONE_DEEP_FLAG = 1,
        CLONE_FLAT_FLAG = 2,
        CLONE_SYMBOLS_FLAG = 4;

    /** `Object#toString` result references. */
    var argsTag$3 = '[object Arguments]',
        arrayTag$2 = '[object Array]',
        boolTag$3 = '[object Boolean]',
        dateTag$3 = '[object Date]',
        errorTag$2 = '[object Error]',
        funcTag$2 = '[object Function]',
        genTag$1 = '[object GeneratorFunction]',
        mapTag$5 = '[object Map]',
        numberTag$4 = '[object Number]',
        objectTag$4 = '[object Object]',
        regexpTag$3 = '[object RegExp]',
        setTag$5 = '[object Set]',
        stringTag$4 = '[object String]',
        symbolTag$3 = '[object Symbol]',
        weakMapTag$2 = '[object WeakMap]';

    var arrayBufferTag$3 = '[object ArrayBuffer]',
        dataViewTag$4 = '[object DataView]',
        float32Tag$2 = '[object Float32Array]',
        float64Tag$2 = '[object Float64Array]',
        int8Tag$2 = '[object Int8Array]',
        int16Tag$2 = '[object Int16Array]',
        int32Tag$2 = '[object Int32Array]',
        uint8Tag$2 = '[object Uint8Array]',
        uint8ClampedTag$2 = '[object Uint8ClampedArray]',
        uint16Tag$2 = '[object Uint16Array]',
        uint32Tag$2 = '[object Uint32Array]';

    /** Used to identify `toStringTag` values supported by `_.clone`. */
    var cloneableTags = {};
    cloneableTags[argsTag$3] = cloneableTags[arrayTag$2] =
    cloneableTags[arrayBufferTag$3] = cloneableTags[dataViewTag$4] =
    cloneableTags[boolTag$3] = cloneableTags[dateTag$3] =
    cloneableTags[float32Tag$2] = cloneableTags[float64Tag$2] =
    cloneableTags[int8Tag$2] = cloneableTags[int16Tag$2] =
    cloneableTags[int32Tag$2] = cloneableTags[mapTag$5] =
    cloneableTags[numberTag$4] = cloneableTags[objectTag$4] =
    cloneableTags[regexpTag$3] = cloneableTags[setTag$5] =
    cloneableTags[stringTag$4] = cloneableTags[symbolTag$3] =
    cloneableTags[uint8Tag$2] = cloneableTags[uint8ClampedTag$2] =
    cloneableTags[uint16Tag$2] = cloneableTags[uint32Tag$2] = true;
    cloneableTags[errorTag$2] = cloneableTags[funcTag$2] =
    cloneableTags[weakMapTag$2] = false;

    /**
     * The base implementation of `_.clone` and `_.cloneDeep` which tracks
     * traversed objects.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} bitmask The bitmask flags.
     *  1 - Deep clone
     *  2 - Flatten inherited properties
     *  4 - Clone symbols
     * @param {Function} [customizer] The function to customize cloning.
     * @param {string} [key] The key of `value`.
     * @param {Object} [object] The parent object of `value`.
     * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, bitmask, customizer, key, object, stack) {
      var result,
          isDeep = bitmask & CLONE_DEEP_FLAG,
          isFlat = bitmask & CLONE_FLAT_FLAG,
          isFull = bitmask & CLONE_SYMBOLS_FLAG;

      if (customizer) {
        result = object ? customizer(value, key, object, stack) : customizer(value);
      }
      if (result !== undefined) {
        return result;
      }
      if (!isObject_1(value)) {
        return value;
      }
      var isArr = isArray_1(value);
      if (isArr) {
        result = _initCloneArray(value);
        if (!isDeep) {
          return _copyArray(value, result);
        }
      } else {
        var tag = _getTag(value),
            isFunc = tag == funcTag$2 || tag == genTag$1;

        if (isBuffer_1(value)) {
          return _cloneBuffer(value, isDeep);
        }
        if (tag == objectTag$4 || tag == argsTag$3 || (isFunc && !object)) {
          result = (isFlat || isFunc) ? {} : _initCloneObject(value);
          if (!isDeep) {
            return isFlat
              ? _copySymbolsIn(value, _baseAssignIn(result, value))
              : _copySymbols(value, _baseAssign(result, value));
          }
        } else {
          if (!cloneableTags[tag]) {
            return object ? value : {};
          }
          result = _initCloneByTag(value, tag, isDeep);
        }
      }
      // Check for circular references and return its corresponding clone.
      stack || (stack = new _Stack);
      var stacked = stack.get(value);
      if (stacked) {
        return stacked;
      }
      stack.set(value, result);

      if (isSet_1(value)) {
        value.forEach(function(subValue) {
          result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
        });
      } else if (isMap_1(value)) {
        value.forEach(function(subValue, key) {
          result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
        });
      }

      var keysFunc = isFull
        ? (isFlat ? _getAllKeysIn : _getAllKeys)
        : (isFlat ? keysIn : keys_1);

      var props = isArr ? undefined : keysFunc(value);
      _arrayEach(props || value, function(subValue, key) {
        if (props) {
          key = subValue;
          subValue = value[key];
        }
        // Recursively populate clone (susceptible to call stack limits).
        _assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
      });
      return result;
    }

    var _baseClone = baseClone;

    /** Used to compose bitmasks for cloning. */
    var CLONE_SYMBOLS_FLAG$1 = 4;

    /**
     * Creates a shallow clone of `value`.
     *
     * **Note:** This method is loosely based on the
     * [structured clone algorithm](https://mdn.io/Structured_clone_algorithm)
     * and supports cloning arrays, array buffers, booleans, date objects, maps,
     * numbers, `Object` objects, regexes, sets, strings, symbols, and typed
     * arrays. The own enumerable properties of `arguments` objects are cloned
     * as plain objects. An empty object is returned for uncloneable values such
     * as error objects, functions, DOM nodes, and WeakMaps.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to clone.
     * @returns {*} Returns the cloned value.
     * @see _.cloneDeep
     * @example
     *
     * var objects = [{ 'a': 1 }, { 'b': 2 }];
     *
     * var shallow = _.clone(objects);
     * console.log(shallow[0] === objects[0]);
     * // => true
     */
    function clone(value) {
      return _baseClone(value, CLONE_SYMBOLS_FLAG$1);
    }

    var clone_1 = clone;

    function check(fn, error) {
        return function(value) {
            if (fn(value)) {
                return {pass: true};
            } else {
                return {pass: false, error: error};
            }
        };
    }

    check.isOneOf = function isOneOf(options) {
        return includes_1.bind(this, options);
    };

    check.isArrayOf = function(itemValidator) {
        return function(value) {
            return isArray_1(value) && value.every(itemValidator);
        };
    };

    var typecheck = check;

    var es6Promise = createCommonjsModule(function (module, exports) {
    /*!
     * @overview es6-promise - a tiny implementation of Promises/A+.
     * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
     * @license   Licensed under MIT license
     *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
     * @version   v4.2.8+1e68dce6
     */

    (function (global, factory) {
    	 module.exports = factory() ;
    }(commonjsGlobal, (function () {
    function objectOrFunction(x) {
      var type = typeof x;
      return x !== null && (type === 'object' || type === 'function');
    }

    function isFunction(x) {
      return typeof x === 'function';
    }



    var _isArray = void 0;
    if (Array.isArray) {
      _isArray = Array.isArray;
    } else {
      _isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    }

    var isArray = _isArray;

    var len = 0;
    var vertxNext = void 0;
    var customSchedulerFn = void 0;

    var asap = function asap(callback, arg) {
      queue[len] = callback;
      queue[len + 1] = arg;
      len += 2;
      if (len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        if (customSchedulerFn) {
          customSchedulerFn(flush);
        } else {
          scheduleFlush();
        }
      }
    };

    function setScheduler(scheduleFn) {
      customSchedulerFn = scheduleFn;
    }

    function setAsap(asapFn) {
      asap = asapFn;
    }

    var browserWindow = typeof window !== 'undefined' ? window : undefined;
    var browserGlobal = browserWindow || {};
    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

    // node
    function useNextTick() {
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // see https://github.com/cujojs/when/issues/410 for details
      return function () {
        return nextTick(flush);
      };
    }

    // vertx
    function useVertxTimer() {
      if (typeof vertxNext !== 'undefined') {
        return function () {
          vertxNext(flush);
        };
      }

      return useSetTimeout();
    }

    function useMutationObserver() {
      var iterations = 0;
      var observer = new BrowserMutationObserver(flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function () {
        node.data = iterations = ++iterations % 2;
      };
    }

    // web worker
    function useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = flush;
      return function () {
        return channel.port2.postMessage(0);
      };
    }

    function useSetTimeout() {
      // Store setTimeout reference so es6-promise will be unaffected by
      // other code modifying setTimeout (like sinon.useFakeTimers())
      var globalSetTimeout = setTimeout;
      return function () {
        return globalSetTimeout(flush, 1);
      };
    }

    var queue = new Array(1000);
    function flush() {
      for (var i = 0; i < len; i += 2) {
        var callback = queue[i];
        var arg = queue[i + 1];

        callback(arg);

        queue[i] = undefined;
        queue[i + 1] = undefined;
      }

      len = 0;
    }

    function attemptVertx() {
      try {
        var vertx = Function('return this')().require('vertx');
        vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return useVertxTimer();
      } catch (e) {
        return useSetTimeout();
      }
    }

    var scheduleFlush = void 0;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (isNode) {
      scheduleFlush = useNextTick();
    } else if (BrowserMutationObserver) {
      scheduleFlush = useMutationObserver();
    } else if (isWorker) {
      scheduleFlush = useMessageChannel();
    } else if (browserWindow === undefined && typeof commonjsRequire === 'function') {
      scheduleFlush = attemptVertx();
    } else {
      scheduleFlush = useSetTimeout();
    }

    function then(onFulfillment, onRejection) {
      var parent = this;

      var child = new this.constructor(noop);

      if (child[PROMISE_ID] === undefined) {
        makePromise(child);
      }

      var _state = parent._state;


      if (_state) {
        var callback = arguments[_state - 1];
        asap(function () {
          return invokeCallback(_state, child, callback, parent._result);
        });
      } else {
        subscribe(parent, child, onFulfillment, onRejection);
      }

      return child;
    }

    /**
      `Promise.resolve` returns a promise that will become resolved with the
      passed `value`. It is shorthand for the following:

      ```javascript
      let promise = new Promise(function(resolve, reject){
        resolve(1);
      });

      promise.then(function(value){
        // value === 1
      });
      ```

      Instead of writing the above, your code now simply becomes the following:

      ```javascript
      let promise = Promise.resolve(1);

      promise.then(function(value){
        // value === 1
      });
      ```

      @method resolve
      @static
      @param {Any} value value that the returned promise will be resolved with
      Useful for tooling.
      @return {Promise} a promise that will become fulfilled with the given
      `value`
    */
    function resolve$1(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(noop);
      resolve(promise, object);
      return promise;
    }

    var PROMISE_ID = Math.random().toString(36).substring(2);

    function noop() {}

    var PENDING = void 0;
    var FULFILLED = 1;
    var REJECTED = 2;

    function selfFulfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
      try {
        then$$1.call(value, fulfillmentHandler, rejectionHandler);
      } catch (e) {
        return e;
      }
    }

    function handleForeignThenable(promise, thenable, then$$1) {
      asap(function (promise) {
        var sealed = false;
        var error = tryThen(then$$1, thenable, function (value) {
          if (sealed) {
            return;
          }
          sealed = true;
          if (thenable !== value) {
            resolve(promise, value);
          } else {
            fulfill(promise, value);
          }
        }, function (reason) {
          if (sealed) {
            return;
          }
          sealed = true;

          reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          reject(promise, error);
        }
      }, promise);
    }

    function handleOwnThenable(promise, thenable) {
      if (thenable._state === FULFILLED) {
        fulfill(promise, thenable._result);
      } else if (thenable._state === REJECTED) {
        reject(promise, thenable._result);
      } else {
        subscribe(thenable, undefined, function (value) {
          return resolve(promise, value);
        }, function (reason) {
          return reject(promise, reason);
        });
      }
    }

    function handleMaybeThenable(promise, maybeThenable, then$$1) {
      if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
        handleOwnThenable(promise, maybeThenable);
      } else {
        if (then$$1 === undefined) {
          fulfill(promise, maybeThenable);
        } else if (isFunction(then$$1)) {
          handleForeignThenable(promise, maybeThenable, then$$1);
        } else {
          fulfill(promise, maybeThenable);
        }
      }
    }

    function resolve(promise, value) {
      if (promise === value) {
        reject(promise, selfFulfillment());
      } else if (objectOrFunction(value)) {
        var then$$1 = void 0;
        try {
          then$$1 = value.then;
        } catch (error) {
          reject(promise, error);
          return;
        }
        handleMaybeThenable(promise, value, then$$1);
      } else {
        fulfill(promise, value);
      }
    }

    function publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      publish(promise);
    }

    function fulfill(promise, value) {
      if (promise._state !== PENDING) {
        return;
      }

      promise._result = value;
      promise._state = FULFILLED;

      if (promise._subscribers.length !== 0) {
        asap(publish, promise);
      }
    }

    function reject(promise, reason) {
      if (promise._state !== PENDING) {
        return;
      }
      promise._state = REJECTED;
      promise._result = reason;

      asap(publishRejection, promise);
    }

    function subscribe(parent, child, onFulfillment, onRejection) {
      var _subscribers = parent._subscribers;
      var length = _subscribers.length;


      parent._onerror = null;

      _subscribers[length] = child;
      _subscribers[length + FULFILLED] = onFulfillment;
      _subscribers[length + REJECTED] = onRejection;

      if (length === 0 && parent._state) {
        asap(publish, parent);
      }
    }

    function publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) {
        return;
      }

      var child = void 0,
          callback = void 0,
          detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function invokeCallback(settled, promise, callback, detail) {
      var hasCallback = isFunction(callback),
          value = void 0,
          error = void 0,
          succeeded = true;

      if (hasCallback) {
        try {
          value = callback(detail);
        } catch (e) {
          succeeded = false;
          error = e;
        }

        if (promise === value) {
          reject(promise, cannotReturnOwn());
          return;
        }
      } else {
        value = detail;
      }

      if (promise._state !== PENDING) ; else if (hasCallback && succeeded) {
        resolve(promise, value);
      } else if (succeeded === false) {
        reject(promise, error);
      } else if (settled === FULFILLED) {
        fulfill(promise, value);
      } else if (settled === REJECTED) {
        reject(promise, value);
      }
    }

    function initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value) {
          resolve(promise, value);
        }, function rejectPromise(reason) {
          reject(promise, reason);
        });
      } catch (e) {
        reject(promise, e);
      }
    }

    var id = 0;
    function nextId() {
      return id++;
    }

    function makePromise(promise) {
      promise[PROMISE_ID] = id++;
      promise._state = undefined;
      promise._result = undefined;
      promise._subscribers = [];
    }

    function validationError() {
      return new Error('Array Methods must be provided an Array');
    }

    var Enumerator = function () {
      function Enumerator(Constructor, input) {
        this._instanceConstructor = Constructor;
        this.promise = new Constructor(noop);

        if (!this.promise[PROMISE_ID]) {
          makePromise(this.promise);
        }

        if (isArray(input)) {
          this.length = input.length;
          this._remaining = input.length;

          this._result = new Array(this.length);

          if (this.length === 0) {
            fulfill(this.promise, this._result);
          } else {
            this.length = this.length || 0;
            this._enumerate(input);
            if (this._remaining === 0) {
              fulfill(this.promise, this._result);
            }
          }
        } else {
          reject(this.promise, validationError());
        }
      }

      Enumerator.prototype._enumerate = function _enumerate(input) {
        for (var i = 0; this._state === PENDING && i < input.length; i++) {
          this._eachEntry(input[i], i);
        }
      };

      Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
        var c = this._instanceConstructor;
        var resolve$$1 = c.resolve;


        if (resolve$$1 === resolve$1) {
          var _then = void 0;
          var error = void 0;
          var didError = false;
          try {
            _then = entry.then;
          } catch (e) {
            didError = true;
            error = e;
          }

          if (_then === then && entry._state !== PENDING) {
            this._settledAt(entry._state, i, entry._result);
          } else if (typeof _then !== 'function') {
            this._remaining--;
            this._result[i] = entry;
          } else if (c === Promise$1) {
            var promise = new c(noop);
            if (didError) {
              reject(promise, error);
            } else {
              handleMaybeThenable(promise, entry, _then);
            }
            this._willSettleAt(promise, i);
          } else {
            this._willSettleAt(new c(function (resolve$$1) {
              return resolve$$1(entry);
            }), i);
          }
        } else {
          this._willSettleAt(resolve$$1(entry), i);
        }
      };

      Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
        var promise = this.promise;


        if (promise._state === PENDING) {
          this._remaining--;

          if (state === REJECTED) {
            reject(promise, value);
          } else {
            this._result[i] = value;
          }
        }

        if (this._remaining === 0) {
          fulfill(promise, this._result);
        }
      };

      Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
        var enumerator = this;

        subscribe(promise, undefined, function (value) {
          return enumerator._settledAt(FULFILLED, i, value);
        }, function (reason) {
          return enumerator._settledAt(REJECTED, i, reason);
        });
      };

      return Enumerator;
    }();

    /**
      `Promise.all` accepts an array of promises, and returns a new promise which
      is fulfilled with an array of fulfillment values for the passed promises, or
      rejected with the reason of the first passed promise to be rejected. It casts all
      elements of the passed iterable to promises as it runs this algorithm.

      Example:

      ```javascript
      let promise1 = resolve(1);
      let promise2 = resolve(2);
      let promise3 = resolve(3);
      let promises = [ promise1, promise2, promise3 ];

      Promise.all(promises).then(function(array){
        // The array here would be [ 1, 2, 3 ];
      });
      ```

      If any of the `promises` given to `all` are rejected, the first promise
      that is rejected will be given as an argument to the returned promises's
      rejection handler. For example:

      Example:

      ```javascript
      let promise1 = resolve(1);
      let promise2 = reject(new Error("2"));
      let promise3 = reject(new Error("3"));
      let promises = [ promise1, promise2, promise3 ];

      Promise.all(promises).then(function(array){
        // Code here never runs because there are rejected promises!
      }, function(error) {
        // error.message === "2"
      });
      ```

      @method all
      @static
      @param {Array} entries array of promises
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise} promise that is fulfilled when all `promises` have been
      fulfilled, or rejected if any of them become rejected.
      @static
    */
    function all(entries) {
      return new Enumerator(this, entries).promise;
    }

    /**
      `Promise.race` returns a new promise which is settled in the same way as the
      first passed promise to settle.

      Example:

      ```javascript
      let promise1 = new Promise(function(resolve, reject){
        setTimeout(function(){
          resolve('promise 1');
        }, 200);
      });

      let promise2 = new Promise(function(resolve, reject){
        setTimeout(function(){
          resolve('promise 2');
        }, 100);
      });

      Promise.race([promise1, promise2]).then(function(result){
        // result === 'promise 2' because it was resolved before promise1
        // was resolved.
      });
      ```

      `Promise.race` is deterministic in that only the state of the first
      settled promise matters. For example, even if other promises given to the
      `promises` array argument are resolved, but the first settled promise has
      become rejected before the other promises became fulfilled, the returned
      promise will become rejected:

      ```javascript
      let promise1 = new Promise(function(resolve, reject){
        setTimeout(function(){
          resolve('promise 1');
        }, 200);
      });

      let promise2 = new Promise(function(resolve, reject){
        setTimeout(function(){
          reject(new Error('promise 2'));
        }, 100);
      });

      Promise.race([promise1, promise2]).then(function(result){
        // Code here never runs
      }, function(reason){
        // reason.message === 'promise 2' because promise 2 became rejected before
        // promise 1 became fulfilled
      });
      ```

      An example real-world use case is implementing timeouts:

      ```javascript
      Promise.race([ajax('foo.json'), timeout(5000)])
      ```

      @method race
      @static
      @param {Array} promises array of promises to observe
      Useful for tooling.
      @return {Promise} a promise which settles in the same way as the first passed
      promise to settle.
    */
    function race(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      if (!isArray(entries)) {
        return new Constructor(function (_, reject) {
          return reject(new TypeError('You must pass an array to race.'));
        });
      } else {
        return new Constructor(function (resolve, reject) {
          var length = entries.length;
          for (var i = 0; i < length; i++) {
            Constructor.resolve(entries[i]).then(resolve, reject);
          }
        });
      }
    }

    /**
      `Promise.reject` returns a promise rejected with the passed `reason`.
      It is shorthand for the following:

      ```javascript
      let promise = new Promise(function(resolve, reject){
        reject(new Error('WHOOPS'));
      });

      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```

      Instead of writing the above, your code now simply becomes the following:

      ```javascript
      let promise = Promise.reject(new Error('WHOOPS'));

      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```

      @method reject
      @static
      @param {Any} reason value that the returned promise will be rejected with.
      Useful for tooling.
      @return {Promise} a promise rejected with the given `reason`.
    */
    function reject$1(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(noop);
      reject(promise, reason);
      return promise;
    }

    function needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      let promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          let xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {Function} resolver
      Useful for tooling.
      @constructor
    */

    var Promise$1 = function () {
      function Promise(resolver) {
        this[PROMISE_ID] = nextId();
        this._result = this._state = undefined;
        this._subscribers = [];

        if (noop !== resolver) {
          typeof resolver !== 'function' && needsResolver();
          this instanceof Promise ? initializePromise(this, resolver) : needsNew();
        }
      }

      /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.
       ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```
       Chaining
      --------
       The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.
       ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });
       findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
       ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```
       Assimilation
      ------------
       Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.
       ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```
       If the assimliated promise rejects, then the downstream promise will also reject.
       ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```
       Simple Example
      --------------
       Synchronous Example
       ```javascript
      let result;
       try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```
       Errback Example
       ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```
       Promise Example;
       ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```
       Advanced Example
      --------------
       Synchronous Example
       ```javascript
      let author, books;
       try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```
       Errback Example
       ```js
       function foundBooks(books) {
       }
       function failure(reason) {
       }
       findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```
       Promise Example;
       ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```
       @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
      */

      /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.
      ```js
      function findAuthor(){
      throw new Error('couldn't find that author');
      }
      // synchronous
      try {
      findAuthor();
      } catch(reason) {
      // something went wrong
      }
      // async with promises
      findAuthor().catch(function(reason){
      // something went wrong
      });
      ```
      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
      */


      Promise.prototype.catch = function _catch(onRejection) {
        return this.then(null, onRejection);
      };

      /**
        `finally` will be invoked regardless of the promise's fate just as native
        try/catch/finally behaves
      
        Synchronous example:
      
        ```js
        findAuthor() {
          if (Math.random() > 0.5) {
            throw new Error();
          }
          return new Author();
        }
      
        try {
          return findAuthor(); // succeed or fail
        } catch(error) {
          return findOtherAuther();
        } finally {
          // always runs
          // doesn't affect the return value
        }
        ```
      
        Asynchronous example:
      
        ```js
        findAuthor().catch(function(reason){
          return findOtherAuther();
        }).finally(function(){
          // author was either found, or not
        });
        ```
      
        @method finally
        @param {Function} callback
        @return {Promise}
      */


      Promise.prototype.finally = function _finally(callback) {
        var promise = this;
        var constructor = promise.constructor;

        if (isFunction(callback)) {
          return promise.then(function (value) {
            return constructor.resolve(callback()).then(function () {
              return value;
            });
          }, function (reason) {
            return constructor.resolve(callback()).then(function () {
              throw reason;
            });
          });
        }

        return promise.then(callback, callback);
      };

      return Promise;
    }();

    Promise$1.prototype.then = then;
    Promise$1.all = all;
    Promise$1.race = race;
    Promise$1.resolve = resolve$1;
    Promise$1.reject = reject$1;
    Promise$1._setScheduler = setScheduler;
    Promise$1._setAsap = setAsap;
    Promise$1._asap = asap;

    /*global self*/
    function polyfill() {
      var local = void 0;

      if (typeof commonjsGlobal !== 'undefined') {
        local = commonjsGlobal;
      } else if (typeof self !== 'undefined') {
        local = self;
      } else {
        try {
          local = Function('return this')();
        } catch (e) {
          throw new Error('polyfill failed because global object is unavailable in this environment');
        }
      }

      var P = local.Promise;

      if (P) {
        var promiseToString = null;
        try {
          promiseToString = Object.prototype.toString.call(P.resolve());
        } catch (e) {
          // silently ignored
        }

        if (promiseToString === '[object Promise]' && !P.cast) {
          return;
        }
      }

      local.Promise = Promise$1;
    }

    // Strange compat..
    Promise$1.polyfill = polyfill;
    Promise$1.Promise = Promise$1;

    return Promise$1;

    })));



    //# sourceMappingURL=es6-promise.map
    });

    /* global Promise */


    var promise = typeof Promise === 'undefined' ? es6Promise.Promise : Promise;

    /**
     * Given a function fn that takes a callback as its last argument, returns
     * a new version of the function that takes the callback optionally. If
     * the function is not called with a callback for the last argument, the
     * function will return a promise instead.
     */
    function callbackToPromise(fn, context, callbackArgIndex) {
        return function() {
            var thisCallbackArgIndex;
            if (callbackArgIndex === void 0) {
                thisCallbackArgIndex = arguments.length > 0 ? arguments.length - 1 : 0;
            } else {
                thisCallbackArgIndex = callbackArgIndex;
            }
            var callbackArg = arguments[thisCallbackArgIndex];
            if (typeof callbackArg === 'function') {
                fn.apply(context, arguments);
                return void 0;
            } else {
                var args = [];
                // If an explicit callbackArgIndex is set, but the function is called
                // with too few arguments, we want to push undefined onto args so that
                // our constructed callback ends up at the right index.
                var argLen = Math.max(arguments.length, thisCallbackArgIndex);
                for (var i = 0; i < argLen; i++) {
                    args.push(arguments[i]);
                }
                return new promise(function(resolve, reject) {
                    args.push(function(err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                    fn.apply(context, args);
                });
            }
        };
    }

    var callback_to_promise = callbackToPromise;

    function Record(table, recordId, recordJson) {
        this._table = table;
        this.id = recordId || recordJson.id;
        this.setRawJson(recordJson);

        this.save = callback_to_promise(save, this);
        this.patchUpdate = callback_to_promise(patchUpdate, this);
        this.putUpdate = callback_to_promise(putUpdate, this);
        this.destroy = callback_to_promise(destroy, this);
        this.fetch = callback_to_promise(fetch, this);

        this.updateFields = this.patchUpdate;
        this.replaceFields = this.putUpdate;
    }

    Record.prototype.getId = function() {
        return this.id;
    };

    Record.prototype.get = function(columnName) {
        return this.fields[columnName];
    };

    Record.prototype.set = function(columnName, columnValue) {
        this.fields[columnName] = columnValue;
    };

    function save(done) {
        this.putUpdate(this.fields, done);
    }

    function patchUpdate(cellValuesByName, opts, done) {
        var that = this;
        if (!done) {
            done = opts;
            opts = {};
        }
        var updateBody = assign_1(
            {
                fields: cellValuesByName,
            },
            opts
        );

        this._table._base.runAction(
            'patch',
            '/' + this._table._urlEncodedNameOrId() + '/' + this.id,
            {},
            updateBody,
            function(err, response, results) {
                if (err) {
                    done(err);
                    return;
                }

                that.setRawJson(results);
                done(null, that);
            }
        );
    }

    function putUpdate(cellValuesByName, opts, done) {
        var that = this;
        if (!done) {
            done = opts;
            opts = {};
        }
        var updateBody = assign_1(
            {
                fields: cellValuesByName,
            },
            opts
        );
        this._table._base.runAction(
            'put',
            '/' + this._table._urlEncodedNameOrId() + '/' + this.id,
            {},
            updateBody,
            function(err, response, results) {
                if (err) {
                    done(err);
                    return;
                }

                that.setRawJson(results);
                done(null, that);
            }
        );
    }

    function destroy(done) {
        var that = this;
        this._table._base.runAction(
            'delete',
            '/' + this._table._urlEncodedNameOrId() + '/' + this.id,
            {},
            null,
            function(err) {
                if (err) {
                    done(err);
                    return;
                }

                done(null, that);
            }
        );
    }

    function fetch(done) {
        var that = this;
        this._table._base.runAction(
            'get',
            '/' + this._table._urlEncodedNameOrId() + '/' + this.id,
            {},
            null,
            function(err, response, results) {
                if (err) {
                    done(err);
                    return;
                }

                that.setRawJson(results);
                done(null, that);
            }
        );
    }

    Record.prototype.setRawJson = function(rawJson) {
        this._rawJson = rawJson;
        this.fields = (this._rawJson && this._rawJson.fields) || {};
    };

    var record = Record;

    function has(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    }

    var has_1 = has;

    /**
     * Builds a query object. Won't fetch until `firstPage` or
     * or `eachPage` is called.
     */
    function Query(table, params) {
        if (!isPlainObject_1(params)) {
            throw new Error('Expected query options to be an object');
        }

        forEach_1(keys_1(params), function(key) {
            var value = params[key];
            if (!Query.paramValidators[key] || !Query.paramValidators[key](value).pass) {
                throw new Error('Invalid parameter for Query: ' + key);
            }
        });

        this._table = table;
        this._params = params;

        this.firstPage = callback_to_promise(firstPage, this);
        this.eachPage = callback_to_promise(eachPage, this, 1);
        this.all = callback_to_promise(all, this);
    }

    /**
     * Fetches the first page of results for the query asynchronously,
     * then calls `done(error, records)`.
     */
    function firstPage(done) {
        if (!isFunction_1(done)) {
            throw new Error('The first parameter to `firstPage` must be a function');
        }

        this.eachPage(
            function(records) {
                done(null, records);
            },
            function(error) {
                done(error, null);
            }
        );
    }

    /**
     * Fetches each page of results for the query asynchronously.
     *
     * Calls `pageCallback(records, fetchNextPage)` for each
     * page. You must call `fetchNextPage()` to fetch the next page of
     * results.
     *
     * After fetching all pages, or if there's an error, calls
     * `done(error)`.
     */
    function eachPage(pageCallback, done) {
        if (!isFunction_1(pageCallback)) {
            throw new Error('The first parameter to `eachPage` must be a function');
        }

        if (!isFunction_1(done) && done !== void 0) {
            throw new Error('The second parameter to `eachPage` must be a function or undefined');
        }

        var that = this;
        var path = '/' + this._table._urlEncodedNameOrId();
        var params = clone_1(this._params);

        var inner = function() {
            that._table._base.runAction('get', path, params, null, function(err, response, result) {
                if (err) {
                    done(err, null);
                } else {
                    var next;
                    if (result.offset) {
                        params.offset = result.offset;
                        next = inner;
                    } else {
                        next = function() {
                            if (done) {
                                done(null);
                            }
                        };
                    }

                    var records = map_1(result.records, function(recordJson) {
                        return new record(that._table, null, recordJson);
                    });

                    pageCallback(records, next);
                }
            });
        };

        inner();
    }

    /**
     * Fetches all pages of results asynchronously. May take a long time.
     */
    function all(done) {
        if (!isFunction_1(done)) {
            throw new Error('The first parameter to `all` must be a function');
        }

        var allRecords = [];
        this.eachPage(
            function(pageRecords, fetchNextPage) {
                allRecords.push.apply(allRecords, pageRecords);
                fetchNextPage();
            },
            function(err) {
                if (err) {
                    done(err, null);
                } else {
                    done(null, allRecords);
                }
            }
        );
    }

    Query.paramValidators = {
        fields: typecheck(
            typecheck.isArrayOf(isString_1),
            'the value for `fields` should be an array of strings'
        ),

        filterByFormula: typecheck(isString_1, 'the value for `filterByFormula` should be a string'),

        maxRecords: typecheck(isNumber_1, 'the value for `maxRecords` should be a number'),

        pageSize: typecheck(isNumber_1, 'the value for `pageSize` should be a number'),

        sort: typecheck(
            typecheck.isArrayOf(function(obj) {
                return (
                    isPlainObject_1(obj) &&
                    isString_1(obj.field) &&
                    (obj.direction === void 0 || includes_1(['asc', 'desc'], obj.direction))
                );
            }),
            'the value for `sort` should be an array of sort objects. ' +
                'Each sort object must have a string `field` value, and an optional ' +
                '`direction` value that is "asc" or "desc".'
        ),

        view: typecheck(isString_1, 'the value for `view` should be a string'),

        cellFormat: typecheck(function(cellFormat) {
            return isString_1(cellFormat) && includes_1(['json', 'string'], cellFormat);
        }, 'the value for `cellFormat` should be "json" or "string"'),

        timeZone: typecheck(isString_1, 'the value for `timeZone` should be a string'),

        userLocale: typecheck(isString_1, 'the value for `userLocale` should be a string'),
    };

    /**
     * Validates the parameters for passing to the Query constructor.
     *
     * @return an object with two keys:
     *  validParams: the object that should be passed to the constructor.
     *  ignoredKeys: a list of keys that will be ignored.
     *  errors: a list of error messages.
     */
    Query.validateParams = function validateParams(params) {
        if (!isPlainObject_1(params)) {
            throw new Error('Expected query params to be an object');
        }

        var validParams = {};
        var ignoredKeys = [];
        var errors = [];

        forEach_1(keys_1(params), function(key) {
            var value = params[key];
            if (has_1(Query.paramValidators, key)) {
                var validator = Query.paramValidators[key];
                var validationResult = validator(value);
                if (validationResult.pass) {
                    validParams[key] = value;
                } else {
                    errors.push(validationResult.error);
                }
            } else {
                ignoredKeys.push(key);
            }
        });

        return {
            validParams: validParams,
            ignoredKeys: ignoredKeys,
            errors: errors,
        };
    };

    var query = Query;

    function Table(base, tableId, tableName) {
        if (!tableId && !tableName) {
            throw new Error('Table name or table ID is required');
        }

        this._base = base;
        this.id = tableId;
        this.name = tableName;

        // Public API
        this.find = callback_to_promise(this._findRecordById, this);
        this.select = this._selectRecords.bind(this);
        this.create = callback_to_promise(this._createRecords, this);
        this.update = callback_to_promise(this._updateRecords.bind(this, false), this);
        this.replace = callback_to_promise(this._updateRecords.bind(this, true), this);
        this.destroy = callback_to_promise(this._destroyRecord, this);

        // Deprecated API
        this.list = deprecate_1(
            this._listRecords.bind(this),
            'table.list',
            'Airtable: `list()` is deprecated. Use `select()` instead.'
        );
        this.forEach = deprecate_1(
            this._forEachRecord.bind(this),
            'table.forEach',
            'Airtable: `forEach()` is deprecated. Use `select()` instead.'
        );
    }

    Table.prototype._findRecordById = function(recordId, done) {
        var record$1 = new record(this, recordId);
        record$1.fetch(done);
    };

    Table.prototype._selectRecords = function(params) {
        if (params === void 0) {
            params = {};
        }

        if (arguments.length > 1) {
            console.warn(
                'Airtable: `select` takes only one parameter, but it was given ' +
                    arguments.length +
                    ' parameters. ' +
                    'Use `eachPage` or `firstPage` to fetch records.'
            );
        }

        if (isPlainObject_1(params)) {
            var validationResults = query.validateParams(params);

            if (validationResults.errors.length) {
                var formattedErrors = map_1(validationResults.errors, function(error) {
                    return '  * ' + error;
                });

                throw new Error(
                    'Airtable: invalid parameters for `select`:\n' + formattedErrors.join('\n')
                );
            }

            if (validationResults.ignoredKeys.length) {
                console.warn(
                    'Airtable: the following parameters to `select` will be ignored: ' +
                        validationResults.ignoredKeys.join(', ')
                );
            }

            return new query(this, validationResults.validParams);
        } else {
            throw new Error(
                'Airtable: the parameter for `select` should be a plain object or undefined.'
            );
        }
    };

    Table.prototype._urlEncodedNameOrId = function() {
        return this.id || encodeURIComponent(this.name);
    };

    Table.prototype._createRecords = function(recordsData, optionalParameters, done) {
        var that = this;
        var isCreatingMultipleRecords = isArray_1(recordsData);

        if (!done) {
            done = optionalParameters;
            optionalParameters = {};
        }
        var requestData;
        if (isCreatingMultipleRecords) {
            requestData = {records: recordsData};
        } else {
            requestData = {fields: recordsData};
        }
        assign_1(requestData, optionalParameters);
        this._base.runAction('post', '/' + that._urlEncodedNameOrId() + '/', {}, requestData, function(
            err,
            resp,
            body
        ) {
            if (err) {
                done(err);
                return;
            }

            var result;
            if (isCreatingMultipleRecords) {
                result = body.records.map(function(record$1) {
                    return new record(that, record$1.id, record$1);
                });
            } else {
                result = new record(that, body.id, body);
            }
            done(null, result);
        });
    };

    Table.prototype._updateRecords = function(
        isDestructiveUpdate,
        recordsDataOrRecordId,
        recordDataOrOptsOrDone,
        optsOrDone,
        done
    ) {
        var opts;

        if (isArray_1(recordsDataOrRecordId)) {
            var that = this;
            var recordsData = recordsDataOrRecordId;
            opts = isPlainObject_1(recordDataOrOptsOrDone) ? recordDataOrOptsOrDone : {};
            done = optsOrDone || recordDataOrOptsOrDone;

            var method = isDestructiveUpdate ? 'put' : 'patch';
            var requestData = assign_1({records: recordsData}, opts);
            this._base.runAction(
                method,
                '/' + this._urlEncodedNameOrId() + '/',
                {},
                requestData,
                function(err, resp, body) {
                    if (err) {
                        done(err);
                        return;
                    }

                    var result = body.records.map(function(record$1) {
                        return new record(that, record$1.id, record$1);
                    });
                    done(null, result);
                }
            );
        } else {
            var recordId = recordsDataOrRecordId;
            var recordData = recordDataOrOptsOrDone;
            opts = isPlainObject_1(optsOrDone) ? optsOrDone : {};
            done = done || optsOrDone;

            var record$1 = new record(this, recordId);
            if (isDestructiveUpdate) {
                record$1.putUpdate(recordData, opts, done);
            } else {
                record$1.patchUpdate(recordData, opts, done);
            }
        }
    };

    Table.prototype._destroyRecord = function(recordIdsOrId, done) {
        if (isArray_1(recordIdsOrId)) {
            var that = this;
            var queryParams = {records: recordIdsOrId};
            this._base.runAction(
                'delete',
                '/' + this._urlEncodedNameOrId(),
                queryParams,
                null,
                function(err, response, results) {
                    if (err) {
                        done(err);
                        return;
                    }

                    var records = map_1(results.records, function(recordJson) {
                        return new record(that, recordJson.id, null);
                    });
                    done(null, records);
                }
            );
        } else {
            var record$1 = new record(this, recordIdsOrId);
            record$1.destroy(done);
        }
    };

    Table.prototype._listRecords = function(limit, offset, opts, done) {
        var that = this;

        if (!done) {
            done = opts;
            opts = {};
        }
        var listRecordsParameters = assign_1(
            {
                limit: limit,
                offset: offset,
            },
            opts
        );

        this._base.runAction(
            'get',
            '/' + this._urlEncodedNameOrId() + '/',
            listRecordsParameters,
            null,
            function(err, response, results) {
                if (err) {
                    done(err);
                    return;
                }

                var records = map_1(results.records, function(recordJson) {
                    return new record(that, null, recordJson);
                });
                done(null, records, results.offset);
            }
        );
    };

    Table.prototype._forEachRecord = function(opts, callback, done) {
        if (arguments.length === 2) {
            done = callback;
            callback = opts;
            opts = {};
        }
        var that = this;
        var limit = Table.__recordsPerPageForIteration || 100;
        var offset = null;

        var nextPage = function() {
            that._listRecords(limit, offset, opts, function(err, page, newOffset) {
                if (err) {
                    done(err);
                    return;
                }

                forEach_1(page, callback);

                if (newOffset) {
                    offset = newOffset;
                    nextPage();
                } else {
                    done();
                }
            });
        };
        nextPage();
    };

    var table = Table;

    var isBrowser = typeof window !== 'undefined';

    function HttpHeaders() {
        this._headersByLowercasedKey = {};
    }

    HttpHeaders.prototype.set = function(headerKey, headerValue) {
        var lowercasedKey = headerKey.toLowerCase();

        if (lowercasedKey === 'x-airtable-user-agent') {
            lowercasedKey = 'user-agent';
            headerKey = 'User-Agent';
        }

        this._headersByLowercasedKey[lowercasedKey] = {
            headerKey: headerKey,
            headerValue: headerValue,
        };
    };

    HttpHeaders.prototype.toJSON = function() {
        var result = {};
        forEach_1(this._headersByLowercasedKey, function(headerDefinition, lowercasedKey) {
            var headerKey;
            if (isBrowser && lowercasedKey === 'user-agent') {
                // Some browsers do not allow overriding the user agent.
                // https://github.com/Airtable/airtable.js/issues/52
                headerKey = 'X-Airtable-User-Agent';
            } else {
                headerKey = headerDefinition.headerKey;
            }

            result[headerKey] = headerDefinition.headerValue;
        });
        return result;
    };

    var http_headers = HttpHeaders;

    var INITIAL_RETRY_DELAY_IF_RATE_LIMITED = 5000;
    var MAX_RETRY_DELAY_IF_RATE_LIMITED = 600000;
    var internal_config = {
    	INITIAL_RETRY_DELAY_IF_RATE_LIMITED: INITIAL_RETRY_DELAY_IF_RATE_LIMITED,
    	MAX_RETRY_DELAY_IF_RATE_LIMITED: MAX_RETRY_DELAY_IF_RATE_LIMITED
    };

    var internal_config$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        INITIAL_RETRY_DELAY_IF_RATE_LIMITED: INITIAL_RETRY_DELAY_IF_RATE_LIMITED,
        MAX_RETRY_DELAY_IF_RATE_LIMITED: MAX_RETRY_DELAY_IF_RATE_LIMITED,
        'default': internal_config
    });

    var internalConfig = getCjsExportFromNamespace(internal_config$1);

    // "Full Jitter" algorithm taken from https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
    function exponentialBackoffWithJitter(numberOfRetries) {
        var rawBackoffTimeMs =
            internalConfig.INITIAL_RETRY_DELAY_IF_RATE_LIMITED * Math.pow(2, numberOfRetries);
        var clippedBackoffTimeMs = Math.min(
            internalConfig.MAX_RETRY_DELAY_IF_RATE_LIMITED,
            rawBackoffTimeMs
        );
        var jitteredBackoffTimeMs = Math.random() * clippedBackoffTimeMs;
        return jitteredBackoffTimeMs;
    }

    var exponential_backoff_with_jitter = exponentialBackoffWithJitter;

    /**
     * Checks if `value` is `null` or `undefined`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
     * @example
     *
     * _.isNil(null);
     * // => true
     *
     * _.isNil(void 0);
     * // => true
     *
     * _.isNil(NaN);
     * // => false
     */
    function isNil(value) {
      return value == null;
    }

    var isNil_1 = isNil;

    // Adapted from jQuery.param:
    // https://github.com/jquery/jquery/blob/2.2-stable/src/serialize.js
    function buildParams(prefix, obj, addFn) {
        if (isArray_1(obj)) {
            // Serialize array item.
            forEach_1(obj, function(value, index) {
                if (/\[\]$/.test(prefix)) {
                    // Treat each array item as a scalar.
                    addFn(prefix, value);
                } else {
                    // Item is non-scalar (array or object), encode its numeric index.
                    buildParams(
                        prefix + '[' + (typeof value === 'object' && value !== null ? index : '') + ']',
                        value,
                        addFn
                    );
                }
            });
        } else if (typeof obj === 'object') {
            // Serialize object item.
            forEach_1(obj, function(value, key) {
                buildParams(prefix + '[' + key + ']', value, addFn);
            });
        } else {
            // Serialize scalar item.
            addFn(prefix, obj);
        }
    }

    function objectToQueryParamString(obj) {
        var parts = [];
        var addFn = function(key, value) {
            value = isNil_1(value) ? '' : value;
            parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        };

        forEach_1(obj, function(value, key) {
            buildParams(key, value, addFn);
        });

        return parts.join('&').replace(/%20/g, '+');
    }

    var object_to_query_param_string = objectToQueryParamString;

    var package_version_browser = process.env.npm_package_version;

    // This will become require('xhr') in the browser.


    var userAgent = 'Airtable.js/' + package_version_browser;

    function runAction(base, method, path, queryParams, bodyData, callback, numAttempts) {
        var url =
            base._airtable._endpointUrl +
            '/v' +
            base._airtable._apiVersionMajor +
            '/' +
            base._id +
            path +
            '?' +
            object_to_query_param_string(queryParams);

        var headers = {
            authorization: 'Bearer ' + base._airtable._apiKey,
            'x-api-version': base._airtable._apiVersion,
            'x-airtable-application-id': base.getId(),
        };
        var isBrowser = typeof window !== 'undefined';
        // Some browsers do not allow overriding the user agent.
        // https://github.com/Airtable/airtable.js/issues/52
        if (isBrowser) {
            headers['x-airtable-user-agent'] = userAgent;
        } else {
            headers['User-Agent'] = userAgent;
        }

        var options = {
            method: method.toUpperCase(),
            url: url,
            json: true,
            timeout: base._airtable.requestTimeout,
            headers: headers,
        };

        if (bodyData !== null) {
            options.body = bodyData;
        }

        xhr(options, function(error, resp, body) {
            if (error) {
                callback(error, resp, body);
                return;
            }

            if (resp.statusCode === 429 && !base._airtable._noRetryIfRateLimited) {
                var backoffDelayMs = exponential_backoff_with_jitter(numAttempts);
                setTimeout(function() {
                    runAction(base, method, path, queryParams, bodyData, callback, numAttempts + 1);
                }, backoffDelayMs);
                return;
            }

            error = base._checkStatusForError(resp.statusCode, body);
            callback(error, resp, body);
        });
    }

    var run_action = runAction;

    // This will become require('xhr') in the browser.










    var userAgent$1 = 'Airtable.js/' + package_version_browser;

    function Base(airtable, baseId) {
        this._airtable = airtable;
        this._id = baseId;
    }

    Base.prototype.table = function(tableName) {
        return new table(this, null, tableName);
    };

    Base.prototype.makeRequest = function(options) {
        var that = this;

        options = options || {};

        var method = get_1(options, 'method', 'GET').toUpperCase();

        var requestOptions = {
            method: method,
            url:
                this._airtable._endpointUrl +
                '/v' +
                this._airtable._apiVersionMajor +
                '/' +
                this._id +
                get_1(options, 'path', '/'),
            qs: get_1(options, 'qs', {}),
            headers: this._getRequestHeaders(get_1(options, 'headers', {})),
            json: true,
            timeout: this._airtable.requestTimeout,
        };
        if ('body' in options && _canRequestMethodIncludeBody(method)) {
            requestOptions.body = options.body;
        }

        return new promise(function(resolve, reject) {
            xhr(requestOptions, function(err, response, body) {
                if (!err && response.statusCode === 429 && !that._airtable._noRetryIfRateLimited) {
                    var numAttempts = get_1(options, '_numAttempts', 0);
                    var backoffDelayMs = exponential_backoff_with_jitter(numAttempts);
                    setTimeout(function() {
                        var newOptions = assign_1({}, options, {
                            _numAttempts: numAttempts + 1,
                        });
                        that.makeRequest(newOptions)
                            .then(resolve)
                            .catch(reject);
                    }, backoffDelayMs);
                    return;
                }

                if (err) {
                    err = new airtable_error('CONNECTION_ERROR', err.message, null);
                } else {
                    err =
                        that._checkStatusForError(response.statusCode, body) ||
                        _getErrorForNonObjectBody(response.statusCode, body);
                }

                if (err) {
                    reject(err);
                    return;
                }

                resolve({
                    statusCode: response.statusCode,
                    headers: response.headers,
                    body: body,
                });
            });
        });
    };

    // This method is deprecated.
    Base.prototype.runAction = function(method, path, queryParams, bodyData, callback) {
        run_action(this, method, path, queryParams, bodyData, callback, 0);
    };

    Base.prototype._getRequestHeaders = function(headers) {
        var result = new http_headers();

        result.set('Authorization', 'Bearer ' + this._airtable._apiKey);
        result.set('User-Agent', userAgent$1);
        forEach_1(headers, function(headerValue, headerKey) {
            result.set(headerKey, headerValue);
        });

        return result.toJSON();
    };

    Base.prototype._checkStatusForError = function(statusCode, body) {
        if (statusCode === 401) {
            return new airtable_error(
                'AUTHENTICATION_REQUIRED',
                'You should provide valid api key to perform this operation',
                statusCode
            );
        } else if (statusCode === 403) {
            return new airtable_error(
                'NOT_AUTHORIZED',
                'You are not authorized to perform this operation',
                statusCode
            );
        } else if (statusCode === 404) {
            return (function() {
                var message =
                    body && body.error && body.error.message
                        ? body.error.message
                        : 'Could not find what you are looking for';
                return new airtable_error('NOT_FOUND', message, statusCode);
            })();
        } else if (statusCode === 413) {
            return new airtable_error('REQUEST_TOO_LARGE', 'Request body is too large', statusCode);
        } else if (statusCode === 422) {
            return (function() {
                var type =
                    body && body.error && body.error.type ? body.error.type : 'UNPROCESSABLE_ENTITY';
                var message =
                    body && body.error && body.error.message
                        ? body.error.message
                        : 'The operation cannot be processed';
                return new airtable_error(type, message, statusCode);
            })();
        } else if (statusCode === 429) {
            return new airtable_error(
                'TOO_MANY_REQUESTS',
                'You have made too many requests in a short period of time. Please retry your request later',
                statusCode
            );
        } else if (statusCode === 500) {
            return new airtable_error(
                'SERVER_ERROR',
                'Try again. If the problem persists, contact support.',
                statusCode
            );
        } else if (statusCode === 503) {
            return new airtable_error(
                'SERVICE_UNAVAILABLE',
                'The service is temporarily unavailable. Please retry shortly.',
                statusCode
            );
        } else if (statusCode >= 400) {
            return (function() {
                var type = body && body.error && body.error.type ? body.error.type : 'UNEXPECTED_ERROR';
                var message =
                    body && body.error && body.error.message
                        ? body.error.message
                        : 'An unexpected error occurred';
                return new airtable_error(type, message, statusCode);
            })();
        } else {
            return null;
        }
    };

    Base.prototype.doCall = function(tableName) {
        return this.table(tableName);
    };

    Base.prototype.getId = function() {
        return this._id;
    };

    Base.createFunctor = function(airtable, baseId) {
        var base = new Base(airtable, baseId);
        var baseFn = function() {
            return base.doCall.apply(base, arguments);
        };
        forEach_1(['table', 'makeRequest', 'runAction', 'getId'], function(baseMethod) {
            baseFn[baseMethod] = base[baseMethod].bind(base);
        });
        baseFn._base = base;
        baseFn.tables = base.tables;
        return baseFn;
    };

    function _canRequestMethodIncludeBody(method) {
        return method !== 'GET' && method !== 'DELETE';
    }

    function _getErrorForNonObjectBody(statusCode, body) {
        if (isPlainObject_1(body)) {
            return null;
        } else {
            return new airtable_error(
                'UNEXPECTED_ERROR',
                'The response from Airtable was invalid JSON. Please try again soon.',
                statusCode
            );
        }
    }

    var base$1 = Base;

    function Airtable(opts) {
        opts = opts || {};

        var defaultConfig = Airtable.default_config();

        var apiVersion = opts.apiVersion || Airtable.apiVersion || defaultConfig.apiVersion;

        Object.defineProperties(this, {
            _apiKey: {
                value: opts.apiKey || Airtable.apiKey || defaultConfig.apiKey,
            },
            _endpointUrl: {
                value: opts.endpointUrl || Airtable.endpointUrl || defaultConfig.endpointUrl,
            },
            _apiVersion: {
                value: apiVersion,
            },
            _apiVersionMajor: {
                value: apiVersion.split('.')[0],
            },
            _noRetryIfRateLimited: {
                value:
                    opts.noRetryIfRateLimited ||
                    Airtable.noRetryIfRateLimited ||
                    defaultConfig.noRetryIfRateLimited,
            },
        });

        this.requestTimeout = opts.requestTimeout || defaultConfig.requestTimeout;

        if (!this._apiKey) {
            throw new Error('An API key is required to connect to Airtable');
        }
    }

    Airtable.prototype.base = function(baseId) {
        return base$1.createFunctor(this, baseId);
    };

    Airtable.default_config = function() {
        return {
            endpointUrl: process.env.AIRTABLE_ENDPOINT_URL || 'https://api.airtable.com',
            apiVersion: '0.1.0',
            apiKey: process.env.AIRTABLE_API_KEY,
            noRetryIfRateLimited: false,
            requestTimeout: 300 * 1000, // 5 minutes
        };
    };

    Airtable.configure = function(opts) {
        Airtable.apiKey = opts.apiKey;
        Airtable.endpointUrl = opts.endpointUrl;
        Airtable.apiVersion = opts.apiVersion;
        Airtable.noRetryIfRateLimited = opts.noRetryIfRateLimited;
    };

    Airtable.base = function(baseId) {
        return new Airtable().base(baseId);
    };

    Airtable.Base = base$1;
    Airtable.Record = record;
    Airtable.Table = table;
    Airtable.Error = airtable_error;

    var airtable = Airtable;

    function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

    function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

    function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$1(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

    function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }

    function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

    var Cytosis = /*#__PURE__*/function () {
      // opts:
      // airtableApi: env.airtable_api,
      // airBaseId: env.airtable_base
      // 
      // automatically get tables on init, unless given tables
      // (getting tables is expensive, and might not always be required on init)
      // options is a temporary view for initializing the table
      function Cytosis(opts) {
        classCallCheck(this, Cytosis);

        var _this = this;

        this.apiKey = opts.apiEditorKey || opts.apiKey; // editorKey overrides regular key

        this.apiEditorKey = opts.apiEditorKey; // admin / editor API, lets you save

        this.baseId = opts.baseId;
        this.routeDetails = opts.routeDetails; // "routeDetails" or other kind of identifier. Helps w/ debugging

        this.configObject = opts.configObject || undefined; // store the latest config for cache, backup, or review

        this.bases = opts.bases || [];
        this.tableOptions = opts.tableOptions || {
          view: "Grid view",
          keyword: undefined
        };
        this.configTableName = opts.configTableName || '_cytosis'; // Airtable table that stores all the configs

        this.configName = opts.configName || undefined; // row inside '_cytosis' that tells Cytosis what table(s) to grab

        this.getConfigOnly = opts.getConfigOnly || false; // if true, doesn't get tables and only returns config
        // pagination is only really useful for retrieving a single table
        // for multiple tables, just use two cytosis objects

        this.currentPage = opts.currentPage || 0; // pulls all pages as default

        this.pageDelay = opts.pageDelay || 150;
        this.cacheDuration = 1000 * 60 * 60 * 1; // ttl, 1 hour cache — used to prevent config from being pulled a lot

        this.tablesLoaded = []; // used by pagination to indicate if each table has finished loading
        // caching

        this.useConfigCache = opts.useConfigCache == false ? false : true; // tries a cache strat for config if true

        this.cacheStrategy = opts.cacheStrategy || 'localStorage';
        this.configCacheId = opts.configCacheId || undefined; // this is normally set in the cache fn
        // these are set by the _config ('_cytosis') table
        // if you provide bases, it'll skip the _config

        this.verbose = opts.verbose || false; // for verbose logging

        this.endpointUrl = opts.endpointUrl;
        this.results = {};
        this._lastUpdated; // configs

        this.debug = opts.debug || undefined; // this is normally set in the cache fn

        if (this.debug) console.log(this); // if no query, we just return this object
        // if(!_this.configName) {
        //   return this
        // }
        // return a promise if the callee needs to do something w/ the result

        return new Promise(function (resolve, reject) {
          // first retrieve the _cytosis table of tables
          // load config + data if given a configName
          // this loads the 
          Cytosis.initCytosis(_this).then(function (loaded) {
            // only return config and don't load tables
            if (_this.getConfigOnly) {
              resolve(_this);
              return;
            }

            if (loaded) {
              if (_this.verbose) console.log('[Cytosis] _cytosis initiated:', _this.bases); // then retrieve the actual data

              Cytosis.loadCytosisData(_this).then(function (newCytosis) {
                resolve(newCytosis);
              });
            } else {
              reject(_this);
            }
          }, function (err) {
            reject(new Error("[Cytosis/init] Cytosis initialization error: Couldn't setup Config ('_cytosis'). Make sure your Base has a config table, e.g. a table named '_cytosis' with the views configured!", err));
          });
        });
      }
      /*
      
          Methods
      
        */
      // Internal


      createClass(Cytosis, [{
        key: "find",
        value: function find(findStr) {
          var fields = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['Name'];
          return Cytosis.find(findStr, this.results, fields);
        } // getRemote (recordId) {
        //   // finds remotely maybe break this out in a different fn or run it
        //   // if not found locally?
        //   // base(table).find(recordId, function(err, record) {
        //   //   if (err) { 
        //   //     console.log('No record found? ' , record)
        //   //     console.error(err) return 
        //   //   }
        //   //   console.log('Record found: ' , record)
        //   //   resolve(record)
        //   // })
        // }
        // AIRTABLE MODIFIERS
        // — these require API key w/ write permission or they'll fail

      }, {
        key: "save",
        value: function save(object, tableName) {
          var recordId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
          return Cytosis.save(object, tableName, this, recordId);
        } // new model

      }, {
        key: "saveArray",
        value: function saveArray(objectArray, tableName) {
          var create = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
          var typecast = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
          return Cytosis.saveArray(objectArray, tableName, this, create, typecast);
        }
      }, {
        key: "delete",
        value: function _delete(tableName, recordId) {
          return Cytosis.delete(tableName, this, recordId);
        }
      }, {
        key: "saveLinkedTable",
        value: function saveLinkedTable(stringList, targetTableName, sourceTable) {
          var colName = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'Name';
          return Cytosis.saveLinkedTable(stringList, targetTableName, sourceTable, this, colName);
        }
        /*
        
        
          Static Methods
            - Helpers that make life easier / faster
        
          */
        // Input: base ID (from airtable)
        // Output: Airtable base object

      }], [{
        key: "getBase",
        value: function getBase(apiKey, baseId) {
          var endpointUrl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'https://api.airtable.com';
          // console.log('getBase:', apiKey, baseId, endpointUrl)
          airtable.configure({
            endpointUrl: endpointUrl,
            apiKey: apiKey
          });
          return airtable.base(baseId);
        }
      }, {
        key: "preCheck",
        value: function preCheck(_ref) {
          var apiKey = _ref.apiKey,
              baseId = _ref.baseId;
          var bases = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

          if (bases) {
            // give a pass; might do more rigorous checking later
            return true;
          }

          if (apiKey && baseId) return true;
          throw new Error('[Cytosis/precheck] Please provide an API key and Base ID'); // return false
        } // Get an object of airtable objects
        // NOTE: this is the ONLY function that pulls from Airtable API!
        // 
        // use map/get for useful data: list.map(e => (`${e.id} ${e.get('Name')}`))
        // filter is an airtable filter formula https://support.airtable.com/hc/en-us/articles/203255215-Formula-Field-Reference
        // no default sort: '[{field: 'Name', direction: 'asc'}]'
        // Input: 
        //    options: airtable API options {view, fields, sort, filter}
        //    cytosis: cytosis object (with base, apiKey, etc.)
        //    tables: array of table names ['tableOne','tableTwo', ...]
        // Output: 
        //    creates object of airtable table record arrays
        //    sets this.results to the object (overwrites any previous tables)
        //    returns the object
        // 
        //    this.results = {
        //      tableOne: [record object, record object, ...]
        //      ...
        //    }
        // getTables (options={}, tables=this.tableNames ) {
        // static getTables ({options, tables=this.tableNames}) {

        /*
            bases is built from a config file, or can be sent in directly looks like:
            [{
              query: "content-1",
              tables: ["Site Content"],
              options: {
                fields: undefined,
                filter: undefined,
                maxRecords: 1,
                pageSize: undefined,
                sort: undefined,
                view: "content-1--view",
                matchKeywordWithField: undefined,
                matchStyle: undefined,
              }
            }]
          */

      }, {
        key: "getTables",
        value: function getTables(_ref2) {
          var cytosis = _ref2.cytosis,
              bases = _ref2.bases,
              routeDetails = _ref2.routeDetails;
          bases = bases || cytosis.bases;
          var pTables = []; // tables (promise)
          // need to follow these defaults for airtable:
          // view='', fields=undefined, sort=undefined, filter='', 

          if (!Cytosis.preCheck(cytosis, bases)) return {}; // returns a promise from airtable

          var airtableFetch = function airtableFetch(_ref3) {
            var base = _ref3.base,
                tableName = _ref3.tableName,
                filterObj = _ref3.filterObj,
                list = _ref3.list;
            // console.log('[Cytosis] fetching table:', table, 'from', cytosis.baseId)
            return new Promise(function (resolve, reject) {
              var timedFetcher;
              base(tableName).select(filterObj).eachPage(function page(records, fetchNextPage) {
                // console.log('[Cytosis] Page Fetch for:', tableName, 'routeDetails:', routeDetails, 'page:', cytosis.currentPage, filterObj, records)
                cytosis.currentPage += 1; // This function (`page`) will get called for each page of records.

                records.forEach(function (record) {
                  // console.log('record:', record, list[list.length-1])
                  list = [].concat(toConsumableArray(list), [Cytosis.cleanRecord(record)]);
                });
                timedFetcher = setTimeout(fetchNextPage, cytosis.pageDelay);
              }, function done(err) {
                clearTimeout(timedFetcher);

                if (err) {
                  console.error('[Cytosis/getTablePromise/airtableFetch] Airtable Fetch Error @routeDetails:', routeDetails);
                  console.error('[Cytosis/getTablePromise/airtableFetch] Airtable Fetch Error [2]', 'Errored on table:', tableName, 'bases:', bases);
                  console.error('[Cytosis/getTablePromise/airtableFetch] Airtable Fetch Error >> error message:', err); // experiment with erroring silently
                  // reject(err)

                  reject(new Error("[Cytosis/getTablePromise/airtableFetch] No response from Airtable")); // return
                }

                cytosis.tablesLoaded = [].concat(toConsumableArray(cytosis.tablesLoaded), [tableName]); // indicate this table's done loading

                resolve(defineProperty({}, tableName, list));
              });
            });
          };

          var getTablePromise = function getTablePromise(_ref4) {
            var tableNames = _ref4.tableNames,
                options = _ref4.options,
                apiKey = _ref4.apiKey,
                baseId = _ref4.baseId;

            try {
              var _iterator = _createForOfIteratorHelper(tableNames),
                  _step;

              try {
                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                  var tableName = _step.value;
                  // for (let tableName of !cytosis.tablesLoaded.includes(tableNames)) {
                  var filterObj = Cytosis.getFilterOptions(options, tableName);
                  var list = [];

                  if (cytosis.tablesLoaded.includes(tableName)) {
                    // only process tables that haven't finished loading yet
                    continue;
                  } // console.log('[Cytosis/getTables] Retrieving:', tableName)
                  // table of promises


                  pTables.push(airtableFetch({
                    base: Cytosis.getBase(apiKey, baseId),
                    // airtable base object
                    tableName: tableName,
                    filterObj: filterObj,
                    list: list
                  }));
                }
              } catch (err) {
                _iterator.e(err);
              } finally {
                _iterator.f();
              }
            } catch (e) {
              console.error('[Cytosis/getTables/getTablePromise] Airtable caught general error', e); // return 
            }
          };

          bases.map(function (base) {
            // need to slow it down
            // setTimeout(function(){
            getTablePromise({
              tableNames: base.tables,
              // array of strings 
              options: base.options || {},
              apiKey: base.apiKey || cytosis.apiKey,
              baseId: base.baseId || cytosis.baseId
            }); // }, 200)
          });

          try {
            return Promise.all(pTables).then(function (tables) {
              var finalObj = {};

              var _iterator2 = _createForOfIteratorHelper(tables),
                  _step2;

              try {
                for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                  var table = _step2.value;
                  // finalObj = { ...finalObj, ...t, ...cytosis.data }
                  finalObj = _objectSpread(_objectSpread({}, finalObj), table);
                } // _this.airtable = finalObj
                // _this.results = finalObj

              } catch (err) {
                _iterator2.e(err);
              } finally {
                _iterator2.f();
              }

              if (tables.length == 0) {
                console.warn("[Cytosis/getTables] No tables found for your table configuration. Please check your configName, views, and filters for base:", base);
              } // console.log('getTables returning:', finalObj, tables)


              return finalObj; // return as a one promise object
            }, function (err) {
              console.error("[Cytosis/getTables] A table errored out or timed out: ", err); // return Error("[Cytosis/getTables] Fetch Error")

              return Promise.reject(new Error("[Cytosis/getTables] Fetch Error"));
            });
          } catch (err) {
            console.error("[Cytosis/getTables/pTablesPromiseHandling] An Airtable table errored out", err);
          }
        } // "paginate" through a table by getting more
        // airtable doesn't support real pagination (no max #, page #, offset)
        // base: {
        //   tableNames: base.tables, // array of strings — only takes the FIRST one listed
        //   options: base.options || {},
        //   apiKey: base.apiKey
        //   baseId: base.baseId
        // }
        // only cytosis necessary

      }, {
        key: "getPageTable",
        value: function getPageTable(_ref5, callback) {
          var cytosis = _ref5.cytosis,
              routeDetails = _ref5.routeDetails,
              apiKey = _ref5.apiKey,
              baseId = _ref5.baseId,
              tableName = _ref5.tableName,
              options = _ref5.options;
          var base = Cytosis.getBase(apiKey || cytosis.apiKey, baseId || cytosis.baseId); // airtable base object
          // only use the first attached table, otherwise pagination will be annoying

          if (!tableName) if (cytosis.bases[0].tables[0]) tableName = cytosis.bases[0].tables[0];else throw new Error('[Cytosis/getPageTable] Please give a table name for pagination');
          var filterObj = Cytosis.getFilterOptions(options || cytosis.bases[0].options);
          var results = [];
          var isDone = false; // note, returning a promise interferes with done(),
          // so we must use a callback
          // return new Promise(function(resolve, reject) {

          var baseSelect = base(tableName).select(filterObj); // const getNextPage = async (results, fetchNextPage) => {
          //   // await fetchNextPage()
          //   resolve('banana poo')
          // }

          var fetchResolve, lastBatch;
          baseSelect.eachPage(function page(records, fetchNextPage) {
            // if we use a promise)

            if (lastBatch && lastBatch[0].id === records[0].id) {
              isDone = true;
            }

            if (!isDone) {
              lastBatch = records;
              records.forEach(function (record) {
                // console.log('paged record:', record)
                results = [].concat(toConsumableArray(results), [Cytosis.cleanRecord(record)]); // results = Cytosis.cleanRecord(record)
              });
            }

            if (fetchResolve) fetchResolve(results);
            callback({
              results: results,
              isDone: isDone,
              getNextPage: function () {
                var _getNextPage = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
                  var _results2;

                  return regenerator.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          if (isDone) {
                            _context.next = 4;
                            break;
                          }

                          _context.next = 3;
                          return new Promise(function (_resolve, _reject) {
                            fetchResolve = _resolve;
                            fetchNextPage();
                          });

                        case 3:
                          _results2 = _context.sent;

                        case 4:
                          return _context.abrupt("return", {
                            results: results,
                            isDone: isDone
                          });

                        case 5:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _callee);
                }));

                function getNextPage() {
                  return _getNextPage.apply(this, arguments);
                }

                return getNextPage;
              }()
            }); // auto fetches everything
            // fetchNextPage()
            // can't use a promise
            // resolve({
            // results,
            // isDone,
            // getNextPage: async () => { 
            //   if(!isDone) {
            //     let results = await new Promise((_resolve, _reject) => {
            //       fetchResolve = _resolve
            //       fetchNextPage()
            //     })
            //     // getNextPage(fetchNextPage) 
            //   }
            //   return {
            //     results,
            //     isDone
            //   }
            // },
            // })
          }, function done(err) {
            if (err) {
              console.error('[Cytosis/getPageTable] Airtable Fetch Error @routeDetails:', routeDetails);
              console.error('[Cytosis/getPageTable] Airtable Fetch Error [2]', 'Errored on table:', tableName, 'tableNames:', tableNames);
              console.error('[Cytosis/getPageTable] Airtable Fetch Error >> error message:', err); // experiment with erroring silently
              // reject(err)

              reject(new Error("[Cytosis/getPageTable] No response from Airtable")); // return
            }

            isDone = true;
            console.log('done!', results);
            callback({
              results: results,
              isDone: isDone
            });
          }); // })
        } // formerly internal init
        // formerly initConfig() initializes _config table from Airtable pulls from _cytosis if no init data
        // will overwrite current table data useful to rehydrate data
        // (but pulls in EVERYTHING from Airtable)
        // assumes you want to "reinitialize" with new data if passed 'false',
        // skips initialization if data already exists
        // if given bases will skip all of setup and presume we can pull from the Base
        // if given a configObject, we can pull the setup data from the config object 

      }, {
        key: "initCytosis",
        value: function initCytosis(cytosis) {
          // console.log('Starting cytosis', cytosis)
          var _this = cytosis;
          if (_this.verbose) console.log('initializing from index: ', cytosis.configName);
          return new Promise(function (resolve, reject) {
            // if config exists, we skip retrieving _cytosis and go right to setup this saves some fetches
            if (_this.configObject) {
              // console.log('config found! skipping _cytosis', _this.config)
              // loadConfig sets the bases
              initFromConfig(_this.configObject);
              resolve(true);
              return;
            } // if we provided tables, but don't have config, 
            // we still skip config — we just default to whatever options were passed in


            if (_this.bases && _this.bases.length > 0) {
              resolve(true);
              return;
            } // if no config or tables setup, we grab config table


            if (!_this.configObject) {
              // if no table names are provided, it looked for a special '_cytosis' tab
              // this is required to initialize the Cytosis object
              // try the cache first
              if (_this.useConfigCache) {
                var _config = Cytosis.loadConfigCache(_this);

                if (_config) {
                  console.log('[Cytosis/init] Config loaded from cache:', _config);
                  _this.configObject = _config;
                  Cytosis.initFromConfig(_this, _config);
                  resolve(true);
                  return;
                }
              }

              console.log('[Cytosis/init] Loading config from table:', _this.configTableName);
              Cytosis.getTables({
                cytosis: _this,
                bases: [{
                  tables: [_this.configTableName],
                  options: {}
                }],
                routeDetails: "init-".concat(_this.configTableName, "-").concat(_this.routeDetails)
              }).then(function (_config) {
                if (!_config || _config[_this.configTableName].length == 0) {
                  reject(new Error("[Cytosis] \u2014 couldn\u2019t find a reference table named ".concat(_this.configTableName, " in the base with reference field: :").concat(_this.configName, " or 'tables' filled out with the names of tables to load")));
                }

                if (_config) {
                  Cytosis.initFromConfig(_this, _config); // sav config into cache if it's enabled

                  if (_this.useConfigCache) {
                    Cytosis.saveConfigCache(_this);
                  }
                } // console.log('Cytosis tables: ', _this.airBase, _this.tableNames)
                // return the initiated cytosis object on completion


                resolve(true);
              }, function (err) {
                reject(new Error("[Cytosis] Couldn't retrieve Config object from Airtable", err));
              });
            }
          });
        } // used to be part of initCytosis — separated so configs can be passed in separately
        // this loads the config table into cytosis.configObject as an object
        // also fills out cytosis.options and cytosis.bases
        // output: it changes cytosis directly; doesn't return anything

      }, {
        key: "initFromConfig",
        value: function initFromConfig(cytosis, _config) {
          cytosis.configObject = _config || cytosis.configObject; // this needs to be the _cytosis array
          // console.log('initFromConfig....', _config, _config[cytosis.configTableName])
          // this requires a table named '_cytosis' with a row (configName) that indicates where the information is coming from
          // need column 'Tables' with a Multiple Select of all the table names in the base
          // (this is required b/c Airtable API won't let you get all table names)
          // init tables from config if they don't exist

          var getOptions = function getOptions(config) {
            // some queries can contain options like fields, sort, maxRecords etc.
            // these can drastically cut back the amount of retrieved data
            // note that options can be sent thru the _config table or code; the table takes
            // precedence for flexibility
            var options = {
              fields: config.fields['fields'] || cytosis.tableOptions['fields'],
              // fields to retrieve in the results
              filter: config.fields['filterByFormula'] || cytosis.tableOptions['filterByFormula'],
              maxRecords: config.fields['maxRecords'] || cytosis.tableOptions['maxRecords'],
              pageSize: config.fields['pageSize'] || cytosis.tableOptions['pageSize'],
              view: config.fields['view'] || cytosis.tableOptions['view'],
              keyword: config.fields['keyword'] || cytosis.tableOptions['keyword'],
              // used for filter searching
              keywords: config.fields['keywords'] || cytosis.tableOptions['keywords'],
              // used for filter searching
              matchCase: config.fields['matchCase'] || cytosis.tableOptions['matchCase'],
              // if true, only matches if case is the same; otherwise performs a LOWER()
              matchKeywordWithField: config.fields['matchKeywordWithField'] || cytosis.tableOptions['matchKeywordWithField'],
              matchKeywordWithFields: config.fields['matchKeywordWithFields'] || cytosis.tableOptions['matchKeywordWithFields'],
              matchStyle: config.fields['matchStyle'] || cytosis.tableOptions['matchStyle'] // how are keywords matched?

            };

            if (cytosis.tableOptions['sort']) {
              options['sort'] = cytosis.tableOptions['sort']; // needs to be of format : "{sort: [blahblah]}"
            }

            if (config.fields['sort']) {
              options['sort'] = JSON.parse(config.fields['sort']); // needs to be of format : "{sort: [blahblah]}"
            }

            return options;
          };

          var _iterator3 = _createForOfIteratorHelper(_config[cytosis.configTableName]),
              _step3;

          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var config = _step3.value;

              // Option 1: find all the options in the Tables list
              if (config.fields['Name'] == cytosis.configName && config.fields['Tables']) {
                var options = getOptions(config); // tables is an array of strings that say which tables (tabs) in Airtable to pull from
                // cytosis.bases = config.fields['Tables']
                // cytosis.tableOptions = options

                cytosis.bases = [{
                  query: cytosis.configName,
                  tables: config.fields['Tables'],
                  options: options
                }];
              } // Option 2: find all the tableQueries in the linkedQueries (this lets you pull in mulitple queries) list
              else if (config.fields['Name'] == cytosis.configName && config.fields['linkedQueries']) {
                  (function () {
                    var linkedQueries = config.fields['linkedQueries']; // console.log('Linked Query Names: ', linkedQueries)
                    // this is a special case where instead of an array of strings, it's an
                    // array of objects {query (string), tables (array of strings), options (object)}

                    var bases = []; // for each linked query, find and store the correct query

                    linkedQueries.map(function (linkedquery) {
                      _config._cytosis.map(function (query) {
                        if (linkedquery == query.fields['Name']) {
                          var _options = getOptions(query);

                          console.log('linkedquery match:', linkedquery, query, _options); // const options = {
                          //   fields: query.fields['fields'], // fields to retrieve in the results
                          //   filter: query.fields['filterByFormula'],
                          //   maxRecords: query.fields['maxRecords'],
                          //   pageSize: query.fields['pageSize'],
                          //   sort: query.fields['sort'] ? JSON.parse(query.fields['sort'])['sort'] : undefined, // needs to be of format : "{sort: [blahblah]}"
                          //   view: query.fields['view'],
                          // }

                          bases.push({
                            query: linkedquery,
                            tables: query.fields['Tables'],
                            options: _options
                          });
                        }
                      });
                    });
                    cytosis.bases = bases;
                  })();
                }
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
        } // wrapper / helper for getTables — just pass in a Cytosis object
        // used to be in the class initializer and pulled out
        // sets Cytosis' tables
        // sets the new results by object reference into cytosis; doesn't return anything

      }, {
        key: "loadCytosisData",
        value: function loadCytosisData(cytosis) {
          var append = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
          var _this = cytosis;
          cytosis.tablesLoaded = []; // reset the tables loaded to allow for re-loading

          return new Promise(function (resolve, reject) {
            Cytosis.getTables({
              cytosis: _this,
              bases: _this.bases,
              routeDetails: _this.routeDetails
            }).then(function (_results) {
              if (append) _this.results = _objectSpread(_objectSpread({}, _this.results), _results);else _this.results = _results;
              _this._lastUpdated = new Date();
              resolve(_this);
            }, function (err) {
              reject(new Error("[Cytosis/loadCytosisData] Retrieval error: Couldn't retrieve all tables from your Base. Please double check your 'tables' and 'views' column to make sure the table names match and corresponding views exist", err));
            });
          });
        } // store config into a cache strategy

      }, {
        key: "saveConfigCache",
        value: function saveConfigCache(cytosis) {
          if (cytosis.useConfigCache == false) return false;

          try {
            if (cytosis && cytosis.configObject && localStorage) {
              var configCacheId = cytosis.configCacheId || "config-".concat(cytosis.baseId);
              var now = new Date();
              var cacheItem = {
                value: cytosis.configObject,
                expiry: now.getTime() + cytosis.cacheDuration
              };
              console.log('[Cytosis/saveConfigCache] Caching config:', configCacheId, cytosis.configObject);
              localStorage.setItem(configCacheId, JSON.stringify(cacheItem)); // const cacheId = cytosis

              return true;
            }

            console.warn('[Cytosis/saveConfigCache] Config not cached; please provide a Cytosis object, and ensure it has a configObject set');
            return false;
          } catch (e) {
            console.warn('[Cytosis/init/saveConfigCache] No localstorage available; skipping');
            return false;
          }
        } // load config from a cache strategy

      }, {
        key: "loadConfigCache",
        value: function loadConfigCache(cytosis) {
          var configCacheId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
          if (cytosis.useConfigCache == false) return false; // will just fail silently on server

          try {
            if (cytosis) configCacheId = cytosis.configCacheId || "config-".concat(cytosis.baseId); // console.log('loading config cache..', cytosis, localStorage)
            // this will fail if running on server

            if (localStorage && configCacheId) {
              var cacheItem = localStorage.getItem(configCacheId);

              if (!cacheItem) {
                return null;
              }

              var _JSON$parse = JSON.parse(cacheItem),
                  value = _JSON$parse.value,
                  expiry = _JSON$parse.expiry;

              var now = new Date(); // compare the expiry time of the item with the current time
              // console.log('[Cytosis/loadConfigCache] Cache expires ', expiry.toLocaleString())

              if (now.getTime() > expiry) {
                localStorage.removeItem(configCacheId);
                return null;
              }

              return value;
            }

            console.warn('[Cytosis/loadConfigCache] Need to provide Cytosis object to clear cache');
            return null;
          } catch (e) {
            console.warn('[Cytosis/init/loadconfigCache] No localstorage available; skipping');
            return false;
          }
        }
      }, {
        key: "resetConfigCache",
        value: function resetConfigCache(cytosis) {
          if (cytosis.useConfigCache == false) return false;

          try {
            if (cytosis && localStorage) {
              var configCacheId = cytosis.configCacheId || "config-".concat(cytosis.baseId);
              localStorage.removeItem(configCacheId);
              return truee;
            }

            console.warn('[Cytosis/resetConfigCache] Need to provide Cytosis object to clear cache');
            return false;
          } catch (e) {
            console.warn('[Cytosis/init/resetConfigCache] No localstorage available; skipping');
            return false;
          }
        } // given options, this builds the filter object
        // required by airtableFetch and anything else that pulls data
        // from Airtable

      }, {
        key: "getFilterOptions",
        value: function getFilterOptions(options, tableName) {
          var fields = options.fields,
              sort = options.sort,
              maxRecords = options.maxRecords,
              pageSize = options.pageSize;
          var view = options.view || '';
          var filter = options.filter || ''; // console.log('get Filter options:', tableName, options)
          // if matchKeywordWithField exists, and a keyword was passed into the cytosis options object,
          // we create a filterByFormula where the given keyword has to exist in the field
          // this is useful for matching articles by dynamic slug value, etc.

          if (options && options.keyword && options.matchKeywordWithField) {
            // this only works when there is an EXACT match
            // DEFAULT
            if (options.matchCase == true) {
              filter = "IF({".concat(options.matchKeywordWithField, "} = \"").concat(options.keyword, "\",TRUE(),FALSE())");
            } else {
              filter = "IF(LOWER({".concat(options.matchKeywordWithField, "}) = LOWER(\"").concat(options.keyword, "\"),TRUE(),FALSE())");
            } // this works when the string exists as a part
            // "exact" match is default so we don't have code for it


            if (options.matchStyle == "partial") {
              if (options.matchCase == true) {
                filter = "IF(SEARCH(\"".concat(options.keyword, "\",{").concat(options.matchKeywordWithField, "}) > 0,TRUE(),FALSE())");
              } else {
                filter = " IF(SEARCH(LOWER(\"".concat(options.keyword, "\"),LOWER({").concat(options.matchKeywordWithField, "})) > 0,TRUE(),FALSE())");
              }
            } // note: you can't use Filter formula to SEARCH through a string separated arrays, so that's tabled for now
            // it has to be handled on an API, or as a rollup or "search" field on the Airtable itself that has all the text compiled into one field
            // console.log('matchKeywordWithField filter: ', filter, ' for', options.keyword, ' with', options.matchKeywordWithField, ' and match style', options.matchStyle)

          } // works like matchKeywordWithField but takes an array of fields and wraps if statements around an OR()
          // replaces matchKeywordWithField


          function keywordFilter(keyword) {
            var filters = [];
            options.matchKeywordWithFields.map(function (fieldName) {
              if (!fieldName) // exclude names that don't exist
                return;

              if (options.matchCase == true) {
                filters.push("IF({".concat(fieldName, "} = \"").concat(keyword, "\",TRUE(),FALSE())"));
              } else {
                filters.push("IF(LOWER({".concat(fieldName, "}) = LOWER(\"").concat(keyword, "\"),TRUE(),FALSE())"));
              } // this works when the string exists as a part
              // "exact" match is default so we don't have code for it


              if (options.matchStyle == "partial") {
                if (options.matchCase == true) {
                  filters.push("IF(SEARCH(\"".concat(keyword, "\",{").concat(fieldName, "}) > 0,TRUE(),FALSE())"));
                } else {
                  filters.push("IF(SEARCH(LOWER(\"".concat(keyword, "\"),LOWER({").concat(fieldName, "})) > 0,TRUE(),FALSE())"));
                }
              }
            });
            filter = 'OR(';
            filters.map(function (_filter, i) {
              if (i > 0) filter += ',';
              filter += _filter;
            });
            filter += ')';
          }

          if (options && options.keyword && options.matchKeywordWithFields) {
            keywordFilter(options.keyword);
          } // multiple keywords will only work with `matchKeywordWithFields` option


          if (options && options.keywords && options.matchKeywordWithFields) {
            console.log('advanced search:', options.keywords, options.matchKeywordWithFields);
            var filters = [];
            options.keywords.map(function (keyword) {
              if (!keyword || keyword.trim().length == 0) return;
              keywordFilter(keyword.trim()); // sets filter independently

              filters.push(filter);
            });
            filter = 'OR(';
            filters.map(function (_filter, i) {
              if (i > 0) filter += ',';
              filter += _filter;
            });
            filter += ')';
          }

          var filterObj = {
            filterByFormula: filter,
            view: view
          };

          if (sort) {
            filterObj['sort'] = sort; // need to add this after-the-fact
          }

          if (maxRecords) {
            filterObj['maxRecords'] = maxRecords; // limit # of records inclusive of all pages
          }

          if (pageSize) {
            filterObj['pageSize'] = pageSize; // limit # of records for each page
          }

          if (fields && fields[tableName]) {
            // if a field for this table exists, add it (old structure, v1)
            filterObj['fields'] = fields[tableName];
          } else if (fields) {
            // new structure
            filterObj['fields'] = fields;
          }

          return filterObj;
        } // Retrieves a single record from the stored tables object
        // Note: this only searches locally
        // 
        // replaced: getRecord (recordId)
        // Input: recordId (Airtable record ID, a string)
        // Output: a single record object

      }, {
        key: "getById",
        value: function getById(recordId, tables) {
          // const base = this.getBase(this.baseId)
          // const tables = this.results // slice makes a shallow copy
          var result;

          if (tables) {
            // return new Promise(function(resolve, reject) {
            // iterate through every table, but only one should resolve, since recordIds are unique
            // replace with async iterator in the future this is expensive since it does a fetch for EACH table
            Object.keys(tables).map(function (table) {
              var _iterator4 = _createForOfIteratorHelper(tables[table]),
                  _step4;

              try {
                for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                  var record = _step4.value;

                  if (record.id == recordId) {
                    // return record
                    result = record;
                  }
                }
              } catch (err) {
                _iterator4.e(err);
              } finally {
                _iterator4.f();
              }
            });
            return result; // reject() // nothing found
            // })
          }

          return undefined; // return new Promise(function(resolve, reject) {
          //   reject(false)
          // })
        } // Retrieves a single record from Airtable
        // This performs a "base('TableName').find('recUKWFfOvY1lRwzM')"
        // 
        // Input: recordId (Airtable record ID, a string) / alternatively give it a base
        // Output: a single record object

      }, {
        key: "getRecord",
        value: function () {
          var _getRecord = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2(_ref6) {
            var recordId, base, tableName, apiKey, baseId, endpointUrl, record;
            return regenerator.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    recordId = _ref6.recordId, base = _ref6.base, tableName = _ref6.tableName, apiKey = _ref6.apiKey, baseId = _ref6.baseId, endpointUrl = _ref6.endpointUrl;
                    _context2.prev = 1;

                    if (tableName) {
                      _context2.next = 4;
                      break;
                    }

                    throw new Error("[Cytosis/getRecord] Please provide a table name");

                  case 4:
                    if (apiKey) {
                      _context2.next = 6;
                      break;
                    }

                    throw new Error("[Cytosis/getRecord] Please provide an apiKey");

                  case 6:
                    if (baseId) {
                      _context2.next = 8;
                      break;
                    }

                    throw new Error("[Cytosis/getRecord] Please provide a base ID");

                  case 8:
                    if (!base) {
                      base = Cytosis.getBase(apiKey, baseId, endpointUrl);
                    }

                    _context2.next = 11;
                    return base(tableName).find(recordId);

                  case 11:
                    record = _context2.sent;
                    return _context2.abrupt("return", Promise.resolve(record));

                  case 15:
                    _context2.prev = 15;
                    _context2.t0 = _context2["catch"](1);
                    // nothing found
                    console.error('[Cytosis/getRecord] Error:', _context2.t0);
                    return _context2.abrupt("return", Promise.reject(_context2.t0));

                  case 19:
                  case "end":
                    return _context2.stop();
                }
              }
            }, _callee2, null, [[1, 15]]);
          }));

          function getRecord(_x) {
            return _getRecord.apply(this, arguments);
          }

          return getRecord;
        }() // Will find a record within Cytosis.results, e.g. Cytosis.results = { TableOne: [ record, record, record], TableTwo: [ record, record, record ] } 
        // — it's a lot more efficient to require data to be pulled and cached rather than be pulled per find request
        // findStr = 'RowName' — (returns a record object!!) finds all items "RowName" inside the airtables object. Make sure Tables is the Cytosis.results >>>> RETURNS AN OBJECT
        // findStr = 'Content.Row Name' — (returns an array of records!!) finds all items "RowName" in the Content table. Tables needs to be an object where each key is the name of the table and pointing to arrays
        // findStr = 'Content.Row Name.ColName' — finds a specific ColName inside the Row and returns the results, e.g. if you have a URL column, it'll return the string
        //           if this is a linked record, it returns an array of records if it can find them with getById, otherwise it'll return an array of linked objects' record Id names)
        // findStr = 'Content.RowName.ColName.LinkedColName' — if a ColName contains links, LinkedColName refers to the field in the linked table. Very useful to get the names or other data
        // ex: cytosis.find('Content.slug', [this.cytosis.tables.Notes], ['Slug'])
        // - both RowName and ColName can contain spaces
        // * assumes Names are unique will return the first one found
        // 
        // Input:
        //    findStr: a specially formatted string used to retrieve data
        //    tables: an object of Airtable arrays, ex: { Tags: [records], Content: [records] }
        //    fields: an array of which fields (columns) to search in (an array of strings). Airtable's key field default is 'Name'
        // Output:
        //    if findStr is just a RowName, returns the first found // FUTURE: an array of results if many matches, or one result if only one found
        //    returns the field's contents, usually a string or array
        //    if the field is a link to another table, will return an array of recordIds
        // static find (findStr, tables=this.tables, fields=['Name']) {

      }, {
        key: "find",
        value: function find(findStr, tables) {
          var fields = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ['Name'];
          if (!findStr || !tables) return [];

          if (typeof fields == "string") {
            console.error('[Cytosis/find] "fields" argument must be an array');
            return undefined;
          }

          if (Array.isArray(tables) || Object.keys(tables) && Object.keys(tables).length == 0) {
            console.error('[Cytosis/find] "tables" needs to be an object that wraps your Table arrays, where each key is the name of the table, like so: {tableName: [records], tableName2: [records]}. If you use Cytosis, you can just pass in Cytosis.results. ');
            return undefined;
          } // console.log('tables:', typeof(tables), Object.keys(tables), Array.isArray(tables), tables, fields)
          // match a single string against all columns (fields) in all objects


          function matchField(str, tables, fields) {
            var results = []; // given an object...

            Object.keys(tables).map(function (table) {
              // console.log('Matching', str, tables, fields, table, tables[table])
              // console.log('Current object format:', tables)
              if (!tables[table]) throw new Error("[Cytosis/Find] \u2014 Couldn\u2019t find a match. Make sure you're looking in the right place. Reference table/string: (".concat(tables[table], " / ").concat(findStr, "). Required Format was probably wrong: { Content: [ row, row, row], Tags: [ row, row, row ] }. ")); // each airtable record

              var _iterator5 = _createForOfIteratorHelper(tables[table]),
                  _step5;

              try {
                for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                  var record = _step5.value;

                  var _iterator6 = _createForOfIteratorHelper(fields),
                      _step6;

                  try {
                    for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                      var field = _step6.value;

                      // check if field exists, and if the contents match
                      if (record && record.fields && record.fields[field] && str == record.fields[field]) {
                        // console.log('Match found in', record.fields.Name)
                        results.push(record);
                      }
                    }
                  } catch (err) {
                    _iterator6.e(err);
                  } finally {
                    _iterator6.f();
                  }
                }
              } catch (err) {
                _iterator5.e(err);
              } finally {
                _iterator5.f();
              }
            });
            return results;
          }

          var queries = findStr.split('.'); // console.log('Looking for', queries.join(', '), 'in', fields.join(), 'tables:', tables, queries.length)
          // when just looking for one value, match against the column (field) name

          if (queries.length == 1) return matchField(queries[0], tables, fields)[0]; // return the FIRST result

          if (queries.length == 2) return matchField(queries[1], {
            q: tables[queries[0]]
          }, fields); // when queries > 2, we need to return the contents of the record's field, and not the record itself!
          // this is just implemented for 3 levels deep for testing

          var records = matchField(queries[1], {
            q: tables[queries[0]]
          }, fields); // return if it's a string or nonarray
          // assume Name is unique, otherwise complicated return first found

          if (!Array.isArray(records[0].fields[queries[2]])) {
            return records[0].fields[queries[2]];
          } // could be an array of IDs... or array of strings and images


          var fieldContent = records[0].fields[queries[2]]; // 3 deep returns a field / column — if it's a linked field, we return the results
          // (if we can find them using getById)

          if (queries.length == 3) {
            var results = []; // can't use getByIds b/c we have no idea where they come from
            // (we don't have the metadata — BUT we could do a getId though?)
            // const linkedRecords = Cytosis.getByIds(fieldContent, tables, true)

            var _iterator7 = _createForOfIteratorHelper(fieldContent),
                _step7;

            try {
              for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
                var id = _step7.value;
                var record = Cytosis.getById(id, tables);
                if (record) results.push(record);
              }
            } catch (err) {
              _iterator7.e(err);
            } finally {
              _iterator7.f();
            }

            if (results.length > 0) {
              return results;
            }
          } // 4 deep returns the linked field's content, which we assume to be Ids


          if (queries.length == 4) {
            var _results3 = []; // can't use getByIds b/c we have no idea where they come from
            // (we don't have the metadata — BUT we could do a getId though?)
            // const linkedRecords = Cytosis.getByIds(fieldContent, tables, true)

            var _iterator8 = _createForOfIteratorHelper(fieldContent),
                _step8;

            try {
              for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
                var _id = _step8.value;

                var _record2 = Cytosis.getById(_id, tables);

                _results3.push(_record2.fields[queries[3]]);
              }
            } catch (err) {
              _iterator8.e(err);
            } finally {
              _iterator8.f();
            }

            return _results3.join(', '); // returns a joined string of linked objects' fields (e.g. the names of linked tags)
            // return fieldContent[0].fields[queries[3]] // returns the FIRST linked field
          } // otherwise just return whatever is in that field, e.g. an array of image objects, etc.


          return fieldContent;
        } // a simpler version of find, which was restrictive:
        // - had to take a table object like { Content: [table] }
        // - threw errors whenever something was broken
        // - returned an array of results, in case of duplicates
        //
        // this one is simpler:
        // - takes a string, just like in Find (above)
        // - takes an array of airtable objects (e.g. [table], or one of the tables that Find required)
        // - returns undefined if there's an error (doesn't throw an error)
        // - always returns one item (the first assumes lookup values are unique)
        // - is just a wrapper for Find
        // takes: 

      }, {
        key: "findOne",
        value: function findOne(findStr, table) {
          var fields = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ['Name'];
          if (!table) return undefined;

          if (typeof fields == "string") {
            console.error('[Cytosis] find "fields" argument must be an array');
            return undefined;
          } // the key has to match the source of the findStr
          // if it's in the form 'Content.something' then 'Content' is the key
          // otherwise if it doesn't have the structure, key doesn't matter


          var key = findStr.split('.').length > 0 ? findStr.split('.')[0] : '_key'; // console.log('findOne input', findStr, key, table, fields)

          var payload = {};
          payload[key] = table;
          var output = this.find(findStr, payload, fields); // console.log('findOne output', output)

          if (output && output.length && output.length > 0) // return the first el of an array, if using 'Content.something'
            return output[0];else if (output) return output; // if findStr doesn't have . separators, it'll return an object

          return undefined;
        } // findField
        // combines findOne with a way to get the field, with proper fallback
        // a common use cases is: this.$cytosis.findOne('home-featured', this.$store.state['Content'] ).fields['Content'],
        // but this crashes if the content can't be found, which is a fairly easy occurence
        // 
        // instead, this fn allows us to do:
        // this.$cytosis.findField('home-featured', this.$store.state['Content'], 'Content', ['Name'] )
        // 
        // - this gets the content from Markdown
        // - or returns undefined if it doesn't exist (rather than crashing)
        // 
        // input: findStr — the column item you're looking for
        // table: the airtable of contents
        // contentField: the content field you're looking for (e.g. 'Content')
        // fields: the columns you're trying to find a match 

      }, {
        key: "findField",
        value: function findField(findStr, table, contentField) {
          var fields = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : ['Name'];
          var element = Cytosis.findOne(findStr, table, fields);
          if (element && element.fields && element.fields[contentField]) return element.fields[contentField];
          return undefined;
        } // simple promise-based wrapper for saving to airtable
        // no recordId: creates a new record
        // recordId: replaces current record
        // note that the API requires tablename regardless either we find it or pass it in
        // Input: 
        //    payload: a JS object with one or more keys that match field (column) names in the table
        //    tableName: a string indicating what table to save to
        //    cytosis: cytosis object (w/ proper key/base)
        //    recordId: a string, if defined, would save the object into the existing record w/ recordId
        // 
        // If tableOptions.linkedObjects exists, save() will make sure those exist in linked tables, and fill in the details w/ a create()  
        // 
        // 
        // Output:
        //    an object: the saved record object as returned from Airtable

      }, {
        key: "save",
        value: function save(_ref7) {
          var payload = _ref7.payload,
              tableName = _ref7.tableName,
              apiKey = _ref7.apiKey,
              baseId = _ref7.baseId,
              cytosis = _ref7.cytosis,
              recordId = _ref7.recordId,
              tableOptions = _ref7.tableOptions;
          var base = Cytosis.getBase(apiKey || cytosis.apiKey, baseId || cytosis.baseId); // airtable base object

          var typecast = tableOptions && tableOptions.insertOptions && tableOptions.insertOptions.includes('typecast') ? true : false;
          var linkedObjects = {}; // create a linked object
          // first let typecast create the new object
          // then fill in the rest of the data in the newly created
          // (or already existing) linked object

          if (tableOptions.linkedObjects) {
            tableOptions.linkedObjects.map(function (obj) {
              linkedObjects[obj.field] = _objectSpread(_objectSpread({}, obj), {
                payload: payload[obj.field]
              }); // create an item that allows for typecast to create the object
              // which only works by passing it a string of the key field, e.g. Name 

              payload[obj.field] = payload[obj.field][obj.key];
            }); // console.log('linked objects:', linkedObjects, Object.keys(linkedObjects))
          } // after typecast's created the new linked object
          // look for it under Fields, grab the array of IDs, and update!
          // this can get API-intensive as it requires a lookup first


          var insertLinkedObjects = function insertLinkedObjects(record) {
            return new Promise(function (resolve, reject) {
              // console.log('inserting linked objects', record, linkedObjects)
              var pRecords = []; // promises of records pulled from the linked tables

              var pUpdated = []; // promises of records after they're all saved
              // for each linked object, find it in the record

              Object.keys(linkedObjects).map(function (linkedObjectKey) {
                var linkedFieldIds = record.fields[linkedObjectKey]; // console.log('linked field IDs:', linkedFieldIds, linkedObjectKey, linkedObjects[linkedObjectKey])
                // for each linked ID, get the record using find, so we can match against the key (e.g. Name)

                linkedFieldIds.map( /*#__PURE__*/function () {
                  var _ref8 = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee3(linkedId) {
                    return regenerator.wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            pRecords.push(new Promise(function (_resolve, _reject) {
                              // console.log('grabbing linked Id:', linkedId)
                              base(linkedObjects[linkedObjectKey].table).find(linkedId, function (err, _record) {
                                if (err) {
                                  console.error(err);
                                  Promise.reject(err);
                                  return;
                                } // console.log('pushing linked record:', _record)


                                _resolve(_record);
                              });
                            }));

                          case 1:
                          case "end":
                            return _context3.stop();
                        }
                      }
                    }, _callee3);
                  }));

                  return function (_x2) {
                    return _ref8.apply(this, arguments);
                  };
                }());
              }); // for each pulled record, now update it w/ the object

              Promise.all(pRecords).then(function (records) {
                // console.log('All pulled records.....', pRecords, records)
                records.map(function (record) {
                  // find a match to an object
                  Object.keys(linkedObjects).map(function (lkObjKey) {
                    // console.log('iterating records:', record, lkObjKey, linkedObjects[lkObjKey], linkedObjects[lkObjKey].payload[linkedObjects[lkObjKey].key])
                    if (linkedObjects[lkObjKey].payload[linkedObjects[lkObjKey].key] == record.fields[linkedObjects[lkObjKey].key]) {
                      pUpdated.push(new Promise(function (_resolve, _reject) {
                        var _newRec = _objectSpread(_objectSpread({}, {
                          id: record.id
                        }), {
                          fields: linkedObjects[lkObjKey].payload
                        }); // console.log('found record match ', linkedObjects[lkObjKey], record, ' new record:', _newRec, ' table:', linkedObjects[lkObjKey].table)


                        base(linkedObjects[lkObjKey].table).update([_newRec], {
                          typecast: true
                        }, function (err, _record) {
                          if (err) {
                            console.error(err);
                            Promise.reject(err);
                            return;
                          } // console.log('new record updated...', _record)


                          _resolve(_record);
                        });
                      }));
                    }
                  }); // base(tableName).create
                });
                resolve(true);
                Promise.all(pUpdated).then(function (updated) {
                  console.log('All successfully added!');
                  resolve(updated);
                });
              }); // resolve(true)
            });
          };

          try {
            return new Promise(function (resolve, reject) {
              if (!recordId) {
                base(tableName).create(payload, {
                  typecast: typecast
                }, /*#__PURE__*/function () {
                  var _ref9 = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee4(err, record) {
                    return regenerator.wrap(function _callee4$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            if (!err) {
                              _context4.next = 4;
                              break;
                            }

                            console.error('Airtable async save/create error', err);
                            reject(err);
                            return _context4.abrupt("return");

                          case 4:
                            console.log('New record: ', record.getId(), record.fields['Name']);

                            if (!(Object.keys(linkedObjects).length > 0)) {
                              _context4.next = 8;
                              break;
                            }

                            _context4.next = 8;
                            return insertLinkedObjects(record);

                          case 8:
                            resolve(record);

                          case 9:
                          case "end":
                            return _context4.stop();
                        }
                      }
                    }, _callee4);
                  }));

                  return function (_x3, _x4) {
                    return _ref9.apply(this, arguments);
                  };
                }());
              } else {
                // old API doesn't support typecast
                base(tableName).update(recordId, payload, {
                  typecast: typecast
                }, /*#__PURE__*/function () {
                  var _ref10 = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee5(err, record) {
                    return regenerator.wrap(function _callee5$(_context5) {
                      while (1) {
                        switch (_context5.prev = _context5.next) {
                          case 0:
                            if (!err) {
                              _context5.next = 4;
                              break;
                            }

                            console.error('Airtable async save error', err);
                            reject(err);
                            return _context5.abrupt("return");

                          case 4:
                            console.log('Updated record: ', record.getId(), record.fields['Name']);

                            if (!(Object.keys(linkedObjects).length > 0)) {
                              _context5.next = 8;
                              break;
                            }

                            _context5.next = 8;
                            return insertLinkedObjects(record);

                          case 8:
                            resolve(record);

                          case 9:
                          case "end":
                            return _context5.stop();
                        }
                      }
                    }, _callee5);
                  }));

                  return function (_x5, _x6) {
                    return _ref10.apply(this, arguments);
                  };
                }());
              }
            });
          } catch (e) {
            console.error('Save Object to Airtable error (do you have Creator permission?)', e);
            return;
          }
        } // uses the Airtable create/update/replace API by passing in an array as a payload 
        // in order to update or replace, each object must have an "id" field w/ a correct record ID
        // passes in an array of objects (id is embedded within the objects)
        // takes up to ten objects in the array (or Airtable will make it fail) TODO: accept more than 10 and break it up with a loop
        // set "create" to true to create has to be explicit, since it's easier to read 
        // to create: objectArray = [{fields: "name: {}, ..."}]
        // to update: objectArray = [{id: "123", fields: "name: {}, ..."}]
        // type: create | update | replace

      }, {
        key: "saveArray",
        value: function saveArray(_ref11) {
          var payload = _ref11.payload,
              tableName = _ref11.tableName,
              apiKey = _ref11.apiKey,
              baseId = _ref11.baseId,
              cytosis = _ref11.cytosis,
              tableOptions = _ref11.tableOptions,
              _ref11$type = _ref11.type,
              type = _ref11$type === void 0 ? "create" : _ref11$type;
          var base = Cytosis.getBase(apiKey || cytosis.apiKey, baseId || cytosis.baseId); // airtable base object

          var typecast = tableOptions && tableOptions.insertOptions && tableOptions.insertOptions.includes('typecast') ? true : false;

          if (!Array.isArray(payload) || Array.isArray(payload) && payload.length < 1) {
            console.error('saveArray payload needs to be an array of objects');
          }

          var finalPayload = []; // The Airtable object takes objects of shape { fields: {/* whatever fields here*/} } which is annoying, 
          // so we make sure the payload is properly formatted

          if (typeof payload[0].fields === 'undefined') {
            payload.map(function (item) {
              finalPayload.push({
                id: item.id,
                // id is required for saving/updating
                fields: item
              });
            });
          } else {
            payload.map(function (item) {
              finalPayload.push({
                id: item.id,
                // id is required for saving/updating
                fields: item.fields
              });
            });
          } // console.log('saving array:', finalPayload)


          try {
            return new Promise(function (resolve, reject) {
              if (type == 'create') {
                base(tableName).create(finalPayload, {
                  typecast: typecast
                }, function (err, records) {
                  if (err) {
                    console.error('Airtable async saveArray/create error', err);
                    reject(err);
                    return;
                  }

                  console.log('New records: ', records);
                  resolve(records);
                });
              } else if (type == 'update') {
                base(tableName).update(finalPayload, {
                  typecast: typecast
                }, function (err, records) {
                  if (err) {
                    console.error('Airtable async saveArray/update error', err);
                    reject(err);
                    return;
                  }

                  console.log('Updated records: ', records);
                  resolve(records);
                });
              } else if (type == 'replace') {
                // destructive updates (undefined fields will be cleared)
                base(tableName).replace(finalPayload, {
                  typecast: typecast
                }, function (err, records) {
                  if (err) {
                    console.error('Airtable async saveArray/update error', err);
                    reject(err);
                    return;
                  }

                  console.log('Updated records: ', records);
                  resolve(records);
                });
              }
            });
          } catch (e) {
            console.error('SaveArray Object to Airtable error (do you have permission?)', e);
            return;
          }
        } // Deletes an existing record from a table
        // The given API key needs account permission to delete
        // Input:
        //    tableName: a string, the name of the table
        //    cytosis: cytosis object (w/ proper key/base)
        //    recordId: a string, the Id of the record to be deleted
        // Output:
        //    an object: the deleted record object as returned from Airtable

      }, {
        key: "delete",
        value: function _delete(_ref12) {
          var tableName = _ref12.tableName,
              apiKey = _ref12.apiKey,
              baseId = _ref12.baseId,
              cytosis = _ref12.cytosis,
              recordId = _ref12.recordId;
          var base = Cytosis.getBase(apiKey || cytosis.apiKey, baseId || cytosis.baseId); // airtable base object

          if (!recordId) throw new Error('[Delete] Please provide a Record ID!');

          try {
            return new Promise(function (resolve, reject) {
              if (recordId) {
                base(tableName).destroy(recordId, function (err, record) {
                  if (err) {
                    console.error('Airtable async delete error', err);
                    reject(err);
                    return;
                  }

                  console.log('Deleted record: ', record.getId(), record.fields['Name']);
                  resolve(record);
                });
              }
            });
          } catch (e) {
            console.error('Delete Object from Airtable error (do you have permission?)', e);
            return;
          }
        } // this has been superceded by save() and insertLinkedObjects
        // the biggest difference is the API access requires Creator for 
        // typecast, but it takes some of the work off
        // 
        // Saves a list of strings to a target table
        // If a string is not matched, it's created as a unique record in the target table
        // If a string is found as a match in the target table (usually the key field 'Name'), a new record doesn't get created
        // Returns an array of ids of all matched or new records
        // 
        // Really useful for tables like Tags that basically just have 'Name'. This dedupes the rows, and makes sure saved items are 
        // tagged properly
        // - Make sure to use this on fields like "Tags" that have linked data
        // - This will return an array of ids that Airtable will save as Links to the other table
        // - *** Make sure to update your local tables getTables
        // 
        // NOTE: if typecast is true, Airtable will create a new object with the linked table with the new name, but will not let you add
        //       data in the other fields
        // 
        // resolves linked tables like tags and collections (b/c Airtable doesn’t return table details this has to be semi-manual)
        // takes a list of string or data objects, adds them to the base, and return a list of ids where they were just added
        // for each object in a list (e.g. a list of tag names):
        // 1. resolve against the existing objects (e.g. Tag records), if it exist, use the existing id
        // 2. if it’s a new object, add it to the table and get the id
        // 3. return the new array of ids
        // "Tags": fave.tags ? await resolveLinkedTable(base, fave.tags, 'Tags', _this.$store.state.data.tags) : [],
        // "Collections": fave.collections ? await resolveLinkedTable(base, fave.collections, 'Collections', _this.$store.state.data.collections) : [],
        // static async resolveLinkedTable(list, tableName, sourceTable, colName='Name') {
        // note, uses this.save, so can't be static!
        // Input:
        //    stringList: an array of strings that represent the records (e.g. Tag Names) in the target
        //    targetTableName: the name of the target table (e.g. "Tags")
        //    sourceTable: an array of Airtable record objects where the matches could be found
        //    cytosis: cytosis object (w/ proper key/base)
        //    colName: usually matches the 'Name' (default) field but could be anything
        // Output:
        //    an array of record Ids that match the list

      }, {
        key: "saveLinkedTable",
        value: function () {
          var _saveLinkedTable = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee7(stringList, targetTableName, sourceTable, cytosis) {
            var colName,
                recordIds,
                _args7 = arguments;
            return regenerator.wrap(function _callee7$(_context7) {
              while (1) {
                switch (_context7.prev = _context7.next) {
                  case 0:
                    colName = _args7.length > 4 && _args7[4] !== undefined ? _args7[4] : 'Name';
                    _context7.next = 3;
                    return stringList.reduce( /*#__PURE__*/function () {
                      var _ref13 = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee6(resultPromise, listItem) {
                        var _result, _iterator9, _step9, record, recordName, recordId;

                        return regenerator.wrap(function _callee6$(_context6) {
                          while (1) {
                            switch (_context6.prev = _context6.next) {
                              case 0:
                                _context6.next = 2;
                                return resultPromise;

                              case 2:
                                _result = _context6.sent;
                                // find a match and return the id
                                _iterator9 = _createForOfIteratorHelper(sourceTable);
                                _context6.prev = 4;

                                _iterator9.s();

                              case 6:
                                if ((_step9 = _iterator9.n()).done) {
                                  _context6.next = 13;
                                  break;
                                }

                                record = _step9.value;
                                recordName = record.fields[colName];

                                if (!(recordName && listItem.toLowerCase() == recordName.toLowerCase())) {
                                  _context6.next = 11;
                                  break;
                                }

                                return _context6.abrupt("return", _result.concat(record.getId()));

                              case 11:
                                _context6.next = 6;
                                break;

                              case 13:
                                _context6.next = 18;
                                break;

                              case 15:
                                _context6.prev = 15;
                                _context6.t0 = _context6["catch"](4);

                                _iterator9.e(_context6.t0);

                              case 18:
                                _context6.prev = 18;

                                _iterator9.f();

                                return _context6.finish(18);

                              case 21:
                                _context6.next = 23;
                                return Cytosis.save({
                                  'Name': listItem
                                }, targetTableName, cytosis);

                              case 23:
                                recordId = _context6.sent;
                                return _context6.abrupt("return", _result.concat(recordId.id));

                              case 25:
                              case "end":
                                return _context6.stop();
                            }
                          }
                        }, _callee6, null, [[4, 15, 18, 21]]);
                      }));

                      return function (_x11, _x12) {
                        return _ref13.apply(this, arguments);
                      };
                    }(), Promise.resolve([]));

                  case 3:
                    recordIds = _context7.sent;
                    return _context7.abrupt("return", recordIds);

                  case 5:
                  case "end":
                    return _context7.stop();
                }
              }
            }, _callee7);
          }));

          function saveLinkedTable(_x7, _x8, _x9, _x10) {
            return _saveLinkedTable.apply(this, arguments);
          }

          return saveLinkedTable;
        }() // takes a table and strips it of everything but the fields and ids
        // really useful for storing data w/o all the other airtable stuff
        // -- note, this does NOT iterate through all the returned tables
        // Input: 
        //    a table array (e.g. Content: [...])
        // Output: 
        //    a table array where each object only has id and fields, no helpers

      }, {
        key: "cleanTable",
        value: function cleanTable(table) {
          // clean up the cytosis table by only keeping id, fields, and basics of _table
          return table.map(function (entry) {
            // console.log('cleanData . entry', entry)
            return {
              fields: entry.fields,
              id: entry.id
            };
          });
        } // takes an airtable record and keeps field and id
        // and removes all the other stuff

      }, {
        key: "cleanRecord",
        value: function cleanRecord(record) {
          return {
            fields: record.fields,
            id: record.id // _rawJson: record._rawJson,
            // _table: {
            //   name: record._table.name,
            //   _base: {
            //     _id: record._table._base._id,
            //     // the record also exposes the airtable API key, but
            //     // it really shouldn't be exposed here
            //   }
            // }

          };
        } // takes a cytosis object and 
        // iterates through tables and cleans them all up.
        // really useful for caching and storing data
        // Input: 
        //    a cytosis object
        // Output: 
        //    a stripped down cytosis object

      }, {
        key: "strip",
        value: function strip(cytosis) {
          var _cytosis = {};
          _cytosis['config'] = {
            _cytosis: Cytosis.cleanTable(cytosis.config._cytosis)
          };
          _cytosis['airBase'] = cytosis['airBase'];
          _cytosis['apiKey'] = cytosis['apiKey'];
          _cytosis['endpointUrl'] = cytosis['endpointUrl'];
          _cytosis['routeDetails'] = cytosis['routeDetails'];
          _cytosis['results'] = {};
          Object.keys(cytosis['results']).map(function (tableName) {
            _cytosis['results'][tableName] = Cytosis.cleanTable(cytosis.tables[tableName]);
          });
          return _cytosis;
        } // from an airtable facebook group discussion / Nick Cappello
        // he's apparently created his own API, so this isn't super useful, but it shows how introspection works!
        // https://gist.github.com/hightide2020/d6a73b35958da1b26078344a26588fb8?fbclid=IwAR0qak04ksgMn3ta_G04xnZ3APVshw2Odg3m4GnZBOj3Hz6GqTcc57ump50

        /* get _blankFields
         * Returns a key-value Object of empty Fields.
             Introspection usage:
             const test = this.$cytosis.findOne('home-mission', this.$store.state['Content'] )
             let _this = this
            Object.defineProperty(test, 'blankFields', {
              get: _this.$cytosis.blankFields
            })
         */
        // static blankFields () {
        //   if (typeof this.fields !== 'object' || this.fields === null)
        //     return {}
        //   const entries = Object.entries(this.fields)
        //   const blankFields = {}
        //   for (const [key, settings] of entries) {
        //     console.log('entries:', entries, key, settings)
        //     if (settings === undefined) {
        //       const error = new Error(
        //         `Improper Field Definition in Table '${this.name}'.\n` +
        //         `Received: ${settings}`
        //       )
        //       error.name = 'TableError'
        //       throw error
        //     }
        //     if (typeof settings.name !== 'string') {
        //       const error = new Error(
        //         `Improper Field Definition in Table '${this.name}'.\n` +
        //         `Expected 'name' to be a string.\n` +
        //         `Received: ${settings}`
        //       )
        //       error.name = 'TableError'
        //       throw error
        //     }
        //     const args = [settings.name, undefined, { ...settings }]
        //     const blankField = typeof settings.type !== 'function' ? new UnknownField(...args) : new settings.type(...args)
        //     blankFields[key] = blankField
        //   }
        //   return blankFields
        // }
        // Given a list of recordIds, gets the record objects
        // 
        // getRecord works a little better, but requires multiple API calls this one uses local data
        // converts a list of record ids into a name (e.g. converts an Id from Tags to the name or the entire object)
        // these are stored inside the data category
        // old version would take a tableName, new one just takes a table
        // this works like "Lookup" of airtable
        // Input: 
        //    recordIds: ['recordId','recordId']
        //    sourceArray: array of records where the recordIds could be found, or a Cytosis.results object
        //    getObj: if true, will return entire object, otherwise just gets the name of the row
        //    CHANGED: if fieldName is provided, gets a field name, otherwise gets the object
        // Output:
        //    either an array of names or array of Airtable records

      }, {
        key: "getByIds",
        value: function getByIds(recordIdArray, source, fieldName) {
          if (!recordIdArray || !source) return []; // we expect source to be an array of records
          // but if it's a Cytosis.results object, we'll put all the records into one big array

          if (!Array.isArray(source) && Object.keys(source) && Object.keys(source).length > 0) {
            var newSource = [];
            Object.keys(source).map(function (tableName) {
              newSource = [].concat(toConsumableArray(newSource), toConsumableArray(source[tableName]));
            });
            source = newSource;
          }

          var records = [];

          var _iterator10 = _createForOfIteratorHelper(recordIdArray),
              _step10;

          try {
            for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
              var recordId = _step10.value;

              var _iterator11 = _createForOfIteratorHelper(source),
                  _step11;

              try {
                for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
                  var linkedRecord = _step11.value;

                  if (recordId == linkedRecord.id) {
                    // if(getObj) {
                    //   records.push(linkedRecord)
                    // } else {
                    if (fieldName) records.push(linkedRecord.fields[fieldName]);else records.push(linkedRecord); // }
                  }
                }
              } catch (err) {
                _iterator11.e(err);
              } finally {
                _iterator11.f();
              }
            }
          } catch (err) {
            _iterator10.e(err);
          } finally {
            _iterator10.f();
          }

          return records;
        } // gets the contents of a field/column (e.g. an Attachments or 'Links to Tags' column)
        // If linked, also converts them from a array of IDs to usable objects
        // Otherwise returns the array of contents that map to the original array
        //  - useful for getting image attachments and multiple select list values
        // FUTURE: eventually should work on duplicate names, but that gets super confusing to 
        // handle returned values findReplacing works really well if names are treated unique
        // Input:
        //    recordArray: array of Airtable record objects that we want more information on
        //    fieldName: name of the field/column to retrieve
        //    linkedTable: array of Airtable records that we pull linked content from (e.g. Tag info)
        //      - if linkedTable is left undefined, we'll just get an array of recordIds for each record
        // Output:
        //    An array of records: if we retrieve linked table records
        //    An array of results. results.len = recordArray.len
        //    each result could be an array, so the result is very likely a 2D array

      }, {
        key: "getFieldContent",
        value: function getFieldContent(recordArray, fieldName) {
          var linkedTable = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
          var results = []; // console.log(`Getting the ${fieldName} contents of`, recordArray)

          var _iterator12 = _createForOfIteratorHelper(recordArray),
              _step12;

          try {
            for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
              var record = _step12.value;

              if (linkedTable) {
                var recordIds = record.fields[fieldName];
                var linked = Cytosis.getByIds(recordIds, linkedTable); // console.log('linked:', recordIds, linkedTable, linked)

                if (linked.length > 0) {
                  // results = results.concat(linked)
                  results.push(linked);
                } else // results.concat(record.fields[fieldName])
                  results.push(record.fields[fieldName]);
              } else results.push(record.fields[fieldName]);
            }
          } catch (err) {
            _iterator12.e(err);
          } finally {
            _iterator12.f();
          }

          return results;
        } // (this version returns a one dimensional array, compared to getFieldContent)
        // gets the content in the form array of values from an array of records, given a field name
        // useful for getting all the Names from a record array, in a new array
        // similar to getNames and getFieldValues but w/ arbitrary fieldname and null filtering & deduplication
        // fieldName is a string

      }, {
        key: "getFields",
        value: function getFields(recordArray) {
          var fieldName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Name';
          var results = [];

          var _iterator13 = _createForOfIteratorHelper(recordArray),
              _step13;

          try {
            for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
              var record = _step13.value;

              if (record.fields && record.fields[fieldName]) {
                // results.push(record.fields[fieldName]) 
                results = [].concat(toConsumableArray(results), toConsumableArray(record.fields[fieldName])); // this spreads the results out
                // MIGHT lead to unintended results, for example w/ attachments
              }
            } // deduplicate fields

          } catch (err) {
            _iterator13.e(err);
          } finally {
            _iterator13.f();
          }

          return this.deduplicate(results); // return results
        } // is this the same as getFields? maybe leave this one alone,
        // gets a unique list of values for the entire given field (column)
        // this only shows what options have been selected, not possible single and multiple select values
        // e.g. used for Single and Multiple Select lists, this gets every option
        // Input:
        //    recordArray: an array of Airtable records
        //    field: the name of the field to get (string, ex: 'Tags')
        // Output:
        //    an array of values (NOT an array of Airtable objects)

      }, {
        key: "getFieldValues",
        value: function getFieldValues(recordArray, field) {
          var results = []; // console.log(`Getting the ${field} contents of`, recordArray)

          var _iterator14 = _createForOfIteratorHelper(recordArray),
              _step14;

          try {
            var _loop = function _loop() {
              var record = _step14.value;
              var recordValue = record.fields[field]; // if the value's an array, it's a multiple list, so we break it up

              if (Array.isArray(recordValue)) {
                var _iterator15 = _createForOfIteratorHelper(recordValue),
                    _step15;

                try {
                  var _loop2 = function _loop2() {
                    var rV = _step15.value;

                    if (!results.find(function (r) {
                      return r == rV;
                    })) {
                      results.push(rV);
                    }
                  };

                  for (_iterator15.s(); !(_step15 = _iterator15.n()).done;) {
                    _loop2();
                  }
                } catch (err) {
                  _iterator15.e(err);
                } finally {
                  _iterator15.f();
                }
              } else {
                if (!results.find(function (r) {
                  return r == recordValue;
                })) {
                  results.push(recordValue);
                }
              }
            };

            for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
              _loop();
            }
          } catch (err) {
            _iterator14.e(err);
          } finally {
            _iterator14.f();
          }

          return results;
        } // superceded by getFields
        // turns an array of Airtable records into an array of record names
        // useful for creating filter lists, etc.
        // Input:
        //    recordArray: an array of Airtable records
        // Output:
        //    an array of names (string values NOT an array of Airtable objects)
        // static getNames(recordArray, fieldName='Name') {
        //   let results = []
        //   for (let record of recordArray) {
        //     if(record)
        //       results.push(record.fields[fieldName])
        //   }
        //   return results
        // }
        // only let Airtable object arrays through that contain the string, in the given fields
        // multiple fields e.g. fieldsArray = ['Name','Hosts'], will search both
        // requires cytosis to search through linked fields
        // Input:
        //    str: search string
        //    source: array of records you're looking through, or the Cytosis.results object: results: { tableOne: [record, record], tableTwo: ...}
        //    opts:
        //      fields: (optional) array of field/column names e.g. ['Name','Tags'] — all fields will be searched if this is empty
        //      exactMatch: bool
        //      matchCase: bool
        //      linkedTables: array of Airtable arrays sources for any linked columns, e.g. for tags
        //      linkedTableKey: string of the key of the linked table (default is 'Name')
        // Output:
        //    array of filter-searched Airtable objects
        // add exact match? (give an exactmatch condition, and remove lowercase and instead of includes use '==')

      }, {
        key: "search",
        value: function search(str, source) {
          var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
          var _opts$fields = opts.fields,
              fields = _opts$fields === void 0 ? [] : _opts$fields,
              _opts$exactMatch = opts.exactMatch,
              exactMatch = _opts$exactMatch === void 0 ? false : _opts$exactMatch,
              _opts$matchCase = opts.matchCase,
              matchCase = _opts$matchCase === void 0 ? false : _opts$matchCase,
              _opts$linkedTables = opts.linkedTables,
              linkedTables = _opts$linkedTables === void 0 ? [] : _opts$linkedTables,
              _opts$linkedTableKey = opts.linkedTableKey,
              linkedTableKey = _opts$linkedTableKey === void 0 ? 'Name' : _opts$linkedTableKey;
          var searchterm = matchCase ? str : str.toLowerCase(); // if not matching case, make everything lowercase

          if (!str) return source; // pass through if no search string simplifies chaining
          // we expect source to be an array of records
          // but if it's a Cytosis.results object, we'll put all the records into one big array

          if (!Array.isArray(source) && Object.keys(source) && Object.keys(source).length > 0) {
            var newSource = [];
            Object.keys(source).map(function (tableName) {
              newSource = [].concat(toConsumableArray(newSource), toConsumableArray(source[tableName]));
            });
            source = newSource;
          } // if there's no fields, we construct it by going through each record
          // and identify the fields


          if (fields.length == 0) {
            source.map(function (record) {
              fields = [].concat(toConsumableArray(fields), toConsumableArray(Object.keys(record.fields)));
            });
          }

          fields = Cytosis.deduplicate(fields);
          return source.filter(function (obj) {
            var _iterator16 = _createForOfIteratorHelper(fields),
                _step16;

            try {
              for (_iterator16.s(); !(_step16 = _iterator16.n()).done;) {
                var field = _step16.value;

                // console.log('search', str, obj.get(field) )
                if (obj.fields[field]) {
                  if (typeof obj.fields[field] == 'string') {
                    var sourceStr = matchCase ? obj.fields[field] : obj.fields[field].toLowerCase();

                    if (exactMatch) {
                      if (sourceStr == searchterm) return true;
                    } else {
                      if (sourceStr.includes(searchterm)) return true;
                    }
                  } else if (Array.isArray(obj.fields[field])) {
                    // if it's an array of strings (e.g. multiple list)
                    // linked records are also a list of strings, so we have to check for a string match
                    // every time we see an array
                    var _iterator17 = _createForOfIteratorHelper(obj.fields[field]),
                        _step17;

                    try {
                      for (_iterator17.s(); !(_step17 = _iterator17.n()).done;) {
                        var strField = _step17.value;

                        // if (strField.toLowerCase().includes(searchterm)) return true
                        var _sourceStr2 = matchCase ? strField : strField.toLowerCase();

                        if (exactMatch) {
                          if (_sourceStr2 == searchterm) return true;
                        } else {
                          if (_sourceStr2.includes(searchterm)) return true;
                        }
                      }
                    } catch (err) {
                      _iterator17.e(err);
                    } finally {
                      _iterator17.f();
                    }

                    if (linkedTables && linkedTables.length > 0) {
                      if (Array.isArray(linkedTables) && linkedTables[0].fields) {
                        // throw new Error('[Cytosis/search] Make sure "linkedTables" is an array of tables — make sure to wrap your table in an array!')
                        // if just given a table of records, wrap it in an array
                        linkedTables = [linkedTables];
                      }

                      var _iterator18 = _createForOfIteratorHelper(linkedTables),
                          _step18;

                      try {
                        for (_iterator18.s(); !(_step18 = _iterator18.n()).done;) {
                          var linkedTable = _step18.value;
                          var records = Cytosis.getByIds(obj.fields[field], linkedTable);

                          var _iterator19 = _createForOfIteratorHelper(records),
                              _step19;

                          try {
                            for (_iterator19.s(); !(_step19 = _iterator19.n()).done;) {
                              var record = _step19.value;

                              // for linked records, only match against the name
                              // if (record.fields[linkedTableKey].toLowerCase().includes(searchterm)) return true
                              if (record) {
                                var _sourceStr = matchCase ? record.fields[linkedTableKey] : record.fields[linkedTableKey].toLowerCase();

                                if (exactMatch) {
                                  if (_sourceStr == searchterm) return true;
                                } else {
                                  if (_sourceStr.includes(searchterm)) return true;
                                }
                              }
                            }
                          } catch (err) {
                            _iterator19.e(err);
                          } finally {
                            _iterator19.f();
                          }
                        }
                      } catch (err) {
                        _iterator18.e(err);
                      } finally {
                        _iterator18.f();
                      }
                    }
                  }
                }
              }
            } catch (err) {
              _iterator16.e(err);
            } finally {
              _iterator16.f();
            }

            return false; // no match
            // return obj.fields.Name && obj.fields.Name.toLowerCase().includes(searchterm) ||
            //       obj.fields.Notes && obj.fields.Notes.toLowerCase().includes(searchterm) ||
            //       obj.fields.Description && obj.fields.Description.toLowerCase().includes(searchterm) ||
            //       obj.fields.URL && obj.fields.URL.toLowerCase().includes(searchterm) ||
            //       obj.fields.Domain && obj.fields.Domain.toLowerCase().includes(searchterm) ||
            //       obj.fields.Authors && obj.fields.Authors.toLowerCase().includes(searchterm)
          });
        } // Splits an object into many parts to be stored to Airtable
        // stores them as JSON useful for using Airtable as a "data warehouse"
        // 
        // Takes an Airtable record object { ... data ..., 'hugeField': {tons of data} }
        // and breaks it into multiple chunks (Airtable has a size limit of 100,000 chars for Long Text fields)
        // *** Requires the key-1, key-2, ... fields to exist in Airtable as Long Text columns
        // *** Requires enough chunks, as the API can't create new fields
        // *** Each chunk is 1-indexed!!!!
        // 
        // Input:
        //    record: Airtable record object (unstringified!)
        //    key: field/column name 
        // Output:
        //    Changes the original record so that 
        //    record = {
        //      hugeField: {chunks: i, chunkSize: #} // JSON.stringified and saved into the key field
        //      hugeField-1: chunk 1  // these are saved right into the record, so when an Airtable save will save these straight into a field
        //      hugeField-2: chunk 2
        //      ...
        //    }

      }, {
        key: "split",
        value: function split(record, key) {
          var maxChunks = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
          var chunkSize = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 100000;
          // TODO: convert confusing while loops into [...Array(5).keys()] and iterate for ... of like Python range()
          var itemString = JSON.stringify(record.fields[key]); // if the key (e.g. _data) doesn't exist, just return the object

          if (itemString === undefined) return record; // too big? split the output into an array and into columns _data-1, -2, -3 etc
          // originally if a item was small it wouldn't get split, but that introduced data irregularities
          // if( itemString.length >= chunkSize) {

          var parts = [];
          var i = 0;
          var length = itemString.length;

          while (length > 0) {
            parts.push(itemString.substr(i * chunkSize, chunkSize));
            length -= chunkSize;
            i++;
          } // save the metadata into the original key
          // _data stores the metadata


          record.fields[key] = JSON.stringify({
            chunks: i,
            chunkSize: chunkSize
          });
          var j = 0;

          if (i < maxChunks) {
            // hard limit 
            while (j < i) {
              record.fields["".concat(key, "-").concat(j + 1)] = parts[j];
              j++;
            }
          } else {
            throw new Error("[Cytosis] \u2014 couldn\u2019t split record \"".concat(record.fields.Name, "\" \u2014 not enough chunks"));
          } // }


          return record;
        } // Takes a split record and merges it together, removing the metadata in the process
        // Takes all the hugeField-1
        // The result will look like the original, too-long record
        // Input:
        //    record: The Airtable record w/ the split data
        //    key: The name of the field to unsplit (String)
        // Output:
        //    record: The Airtable record w/ the original key/data

      }, {
        key: "unsplit",
        value: function unsplit(record, key) {
          // a split record will always have chunks and chunkSize
          // return the record if it doesn't have a split
          if (!record.fields[key] || !JSON.parse(record.fields[key]).chunks) return JSON.parse(record.fields[key]);
          var chunks = JSON.parse(record.fields[key]).chunks;
          var itemString = '';
          var i = 0;

          while (i < chunks) {
            itemString += record.fields["".concat(key, "-").concat(i + 1)];
            delete record.fields["".concat(key, "-").concat(i + 1)]; // remove the chunked partials for memory

            i++;
          }

          var data = JSON.parse(itemString); // originally just returned the unsplit data
          // return JSON.parse(itemString)
          // now replaces metadata w/ regular data so the object doesn't "appear" mutated to user
          // the record deletes the chunked partials

          record.fields[key] = data;
          return record;
        } // deduplicate an array of anything (useful for generating list outputs)
        // Input: array of Airtable records
        // Output: array of unique Airtable records

      }, {
        key: "deduplicate",
        value: function deduplicate(array) {
          return array.filter(function (val, i, arr) {
            return arr.indexOf(val) == i;
          });
        } // Sorts an array of Airtable objects by a given column, A>Z
        // This is sort of just an example on how to sort, as it doesn't really do a whole lot
        // Input:
        //    recordArray: an array or Airtable records
        //    sortBy: field/column to sort values by
        //    sortFn: a sort function

      }, {
        key: "sort",
        value: function sort(recordArray) {
          var sortBy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Name';
          var sortFn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
          recordArray.sort(sortFn || function (a, b) {
            var nameA = a.fields[sortBy].toUpperCase(); // ignore upper and lowercase

            var nameB = b.fields[sortBy].toUpperCase(); // ignore upper and lowercase

            if (nameA < nameB) {
              return -1;
            }

            if (nameA > nameB) {
              return 1;
            }

            return 0;
          });
          return recordArray;
        } // 
        //  Filter Generators
        // 
        //  Airtable has a weird syntax for filters. It's pretty annoying.
        //  These help make them less annoying
        // 

      }, {
        key: "filter_or",
        value: function filter_or(keywords, field) {
          // field is a column name. Ex: "Slug" 
          // keywords is an array of keywords. Ex: "['jan-zheng', 'jessica-sacher']"
          // this generates: 'IF(OR({Slug}="jan-zheng", {Slug}="jessica-sacher"), TRUE())'
          var orArr = [];
          keywords.map(function (keyword) {
            // generates: {Slug}="jan-zheng", {Slug}="jessica-sacher"
            orArr.push("{".concat(field, "}=\"").concat(keyword, "\""));
          });
          return "IF(OR(".concat(orArr, "), TRUE())");
        } // CURRENTLY NOT FUNCTIONAL, and not really a use for it right now
        // joins/combines multiple tables into one new object
        // would be good to have a join (inner), join-left, join-right, outer-join (full) from SQL
        // useful for making combinations for infographics or tables for tallying, etc.
        // takes an array of objects in the form of
        // [{data: (tags object), fields: ['Name', 'Notes']}, {data: (people object), fields: ['Name', 'Tags']}]
        // - fields is optional leaving it out joins all fields
        // also takes a function that determines the name of each row if none given, the new object combines the first fields of each object
        // identical field names will be concatenated
        // static join (tables, nameFn=undefined) {
        //   let result = {}
        //   if(!tables || !Array.isArray(tables) || !tables.length < 1)
        //     return undefined
        //   tables.map((table) => {
        //     const data = table.data
        //     const fields = table.fields && Array.isArray(table.fields) ? table.fields : undefined
        //     for (let field of fields) {
        //       result[field] = { ...result[field], data[field]} // concatenate if field already exists
        //     }
        //     // define the name transform method
        //     nameFn = nameFn ? nameFn : function(result) {
        //       console.log('namefn result', result)
        //       return result
        //     }
        //     return nameFn(result)
        //   })
        // }

      }]);

      return Cytosis;
    }();

    /* src/components/CytosisWip.svelte generated by Svelte v3.24.0 */

    const { console: console_1 } = globals;
    const file$1 = "src/components/CytosisWip.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let div_id_value;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "Cytosis");
    			attr_dev(div, "id", div_id_value = "cytosis-" + /*options*/ ctx[0].configName);
    			add_location(div, file$1, 12, 0, 220);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*options*/ 1 && div_id_value !== (div_id_value = "cytosis-" + /*options*/ ctx[0].configName)) {
    				attr_dev(div, "id", div_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { isLoading = false } = $$props;
    	let { isError = false } = $$props;
    	let { options = {} } = $$props;
    	let { tableName = undefined } = $$props; // convenience — gets the table you want 
    	let { cytosis } = $$props; // the entire cytosis object
    	let { table } = $$props; // sets the table indicated in 'tableName'; convenient

    	let { loadCytosis = async function () {
    		console.log("CytosisWIP loading...", options);

    		// let hey = await getRecord({})
    		// console.log('???', getRecord)
    		try {
    			$$invalidate(1, isLoading = true);
    			const _cytosis = await new Cytosis(options);

    			// const _cytosis = await new Cytosis({
    			//   apiKey, 
    			//   apiEditorKey,
    			//   bases,
    			//   baseId,
    			//   configName,
    			//   routeDetails,
    			//   useConfigCache, 
    			//   tableOptions,
    			// });
    			// console.log('cydata/cytosis', _cytosis)
    			$$invalidate(3, cytosis = await _cytosis);

    			// for conveniently grabbing the table you want
    			if (tableName && table) $$invalidate(4, table = _cytosis.results[tableName]);

    			$$invalidate(1, isLoading = false);
    		} catch(err) {
    			$$invalidate(1, isLoading = false);
    			$$invalidate(2, isError = true);
    			console.error("[Cytosis Data Error]:", err);
    			return Promise.reject();
    		}
    	} } = $$props; // })

    	loadCytosis();

    	const writable_props = [
    		"isLoading",
    		"isError",
    		"options",
    		"tableName",
    		"cytosis",
    		"table",
    		"loadCytosis"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<CytosisWip> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CytosisWip", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("isLoading" in $$props) $$invalidate(1, isLoading = $$props.isLoading);
    		if ("isError" in $$props) $$invalidate(2, isError = $$props.isError);
    		if ("options" in $$props) $$invalidate(0, options = $$props.options);
    		if ("tableName" in $$props) $$invalidate(5, tableName = $$props.tableName);
    		if ("cytosis" in $$props) $$invalidate(3, cytosis = $$props.cytosis);
    		if ("table" in $$props) $$invalidate(4, table = $$props.table);
    		if ("loadCytosis" in $$props) $$invalidate(6, loadCytosis = $$props.loadCytosis);
    		if ("$$scope" in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Cytosis,
    		isLoading,
    		isError,
    		options,
    		tableName,
    		cytosis,
    		table,
    		loadCytosis
    	});

    	$$self.$inject_state = $$props => {
    		if ("isLoading" in $$props) $$invalidate(1, isLoading = $$props.isLoading);
    		if ("isError" in $$props) $$invalidate(2, isError = $$props.isError);
    		if ("options" in $$props) $$invalidate(0, options = $$props.options);
    		if ("tableName" in $$props) $$invalidate(5, tableName = $$props.tableName);
    		if ("cytosis" in $$props) $$invalidate(3, cytosis = $$props.cytosis);
    		if ("table" in $$props) $$invalidate(4, table = $$props.table);
    		if ("loadCytosis" in $$props) $$invalidate(6, loadCytosis = $$props.loadCytosis);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*options, loadCytosis*/ 65) {
    			 if (options) {
    				// update when options change
    				loadCytosis();
    			}
    		}
    	};

    	return [
    		options,
    		isLoading,
    		isError,
    		cytosis,
    		table,
    		tableName,
    		loadCytosis,
    		$$scope,
    		$$slots
    	];
    }

    class CytosisWip extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			isLoading: 1,
    			isError: 2,
    			options: 0,
    			tableName: 5,
    			cytosis: 3,
    			table: 4,
    			loadCytosis: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CytosisWip",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cytosis*/ ctx[3] === undefined && !("cytosis" in props)) {
    			console_1.warn("<CytosisWip> was created without expected prop 'cytosis'");
    		}

    		if (/*table*/ ctx[4] === undefined && !("table" in props)) {
    			console_1.warn("<CytosisWip> was created without expected prop 'table'");
    		}
    	}

    	get isLoading() {
    		throw new Error("<CytosisWip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isLoading(value) {
    		throw new Error("<CytosisWip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isError() {
    		throw new Error("<CytosisWip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isError(value) {
    		throw new Error("<CytosisWip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<CytosisWip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<CytosisWip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tableName() {
    		throw new Error("<CytosisWip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tableName(value) {
    		throw new Error("<CytosisWip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cytosis() {
    		throw new Error("<CytosisWip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cytosis(value) {
    		throw new Error("<CytosisWip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get table() {
    		throw new Error("<CytosisWip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set table(value) {
    		throw new Error("<CytosisWip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loadCytosis() {
    		throw new Error("<CytosisWip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loadCytosis(value) {
    		throw new Error("<CytosisWip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var defaults = createCommonjsModule(function (module) {
    function getDefaults() {
      return {
        baseUrl: null,
        breaks: false,
        gfm: true,
        headerIds: true,
        headerPrefix: '',
        highlight: null,
        langPrefix: 'language-',
        mangle: true,
        pedantic: false,
        renderer: null,
        sanitize: false,
        sanitizer: null,
        silent: false,
        smartLists: false,
        smartypants: false,
        xhtml: false
      };
    }

    function changeDefaults(newDefaults) {
      module.exports.defaults = newDefaults;
    }

    module.exports = {
      defaults: getDefaults(),
      getDefaults,
      changeDefaults
    };
    });
    var defaults_1 = defaults.defaults;
    var defaults_2 = defaults.getDefaults;
    var defaults_3 = defaults.changeDefaults;

    /**
     * Helpers
     */
    const escapeTest = /[&<>"']/;
    const escapeReplace = /[&<>"']/g;
    const escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
    const escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
    const escapeReplacements = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    const getEscapeReplacement = (ch) => escapeReplacements[ch];
    function escape(html, encode) {
      if (encode) {
        if (escapeTest.test(html)) {
          return html.replace(escapeReplace, getEscapeReplacement);
        }
      } else {
        if (escapeTestNoEncode.test(html)) {
          return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
        }
      }

      return html;
    }

    const unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;

    function unescape(html) {
      // explicitly match decimal, hex, and named HTML entities
      return html.replace(unescapeTest, (_, n) => {
        n = n.toLowerCase();
        if (n === 'colon') return ':';
        if (n.charAt(0) === '#') {
          return n.charAt(1) === 'x'
            ? String.fromCharCode(parseInt(n.substring(2), 16))
            : String.fromCharCode(+n.substring(1));
        }
        return '';
      });
    }

    const caret = /(^|[^\[])\^/g;
    function edit(regex, opt) {
      regex = regex.source || regex;
      opt = opt || '';
      const obj = {
        replace: (name, val) => {
          val = val.source || val;
          val = val.replace(caret, '$1');
          regex = regex.replace(name, val);
          return obj;
        },
        getRegex: () => {
          return new RegExp(regex, opt);
        }
      };
      return obj;
    }

    const nonWordAndColonTest = /[^\w:]/g;
    const originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;
    function cleanUrl(sanitize, base, href) {
      if (sanitize) {
        let prot;
        try {
          prot = decodeURIComponent(unescape(href))
            .replace(nonWordAndColonTest, '')
            .toLowerCase();
        } catch (e) {
          return null;
        }
        if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
          return null;
        }
      }
      if (base && !originIndependentUrl.test(href)) {
        href = resolveUrl(base, href);
      }
      try {
        href = encodeURI(href).replace(/%25/g, '%');
      } catch (e) {
        return null;
      }
      return href;
    }

    const baseUrls = {};
    const justDomain = /^[^:]+:\/*[^/]*$/;
    const protocol = /^([^:]+:)[\s\S]*$/;
    const domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;

    function resolveUrl(base, href) {
      if (!baseUrls[' ' + base]) {
        // we can ignore everything in base after the last slash of its path component,
        // but we might need to add _that_
        // https://tools.ietf.org/html/rfc3986#section-3
        if (justDomain.test(base)) {
          baseUrls[' ' + base] = base + '/';
        } else {
          baseUrls[' ' + base] = rtrim(base, '/', true);
        }
      }
      base = baseUrls[' ' + base];
      const relativeBase = base.indexOf(':') === -1;

      if (href.substring(0, 2) === '//') {
        if (relativeBase) {
          return href;
        }
        return base.replace(protocol, '$1') + href;
      } else if (href.charAt(0) === '/') {
        if (relativeBase) {
          return href;
        }
        return base.replace(domain, '$1') + href;
      } else {
        return base + href;
      }
    }

    const noopTest = { exec: function noopTest() {} };

    function merge(obj) {
      let i = 1,
        target,
        key;

      for (; i < arguments.length; i++) {
        target = arguments[i];
        for (key in target) {
          if (Object.prototype.hasOwnProperty.call(target, key)) {
            obj[key] = target[key];
          }
        }
      }

      return obj;
    }

    function splitCells(tableRow, count) {
      // ensure that every cell-delimiting pipe has a space
      // before it to distinguish it from an escaped pipe
      const row = tableRow.replace(/\|/g, (match, offset, str) => {
          let escaped = false,
            curr = offset;
          while (--curr >= 0 && str[curr] === '\\') escaped = !escaped;
          if (escaped) {
            // odd number of slashes means | is escaped
            // so we leave it alone
            return '|';
          } else {
            // add space before unescaped |
            return ' |';
          }
        }),
        cells = row.split(/ \|/);
      let i = 0;

      if (cells.length > count) {
        cells.splice(count);
      } else {
        while (cells.length < count) cells.push('');
      }

      for (; i < cells.length; i++) {
        // leading or trailing whitespace is ignored per the gfm spec
        cells[i] = cells[i].trim().replace(/\\\|/g, '|');
      }
      return cells;
    }

    // Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
    // /c*$/ is vulnerable to REDOS.
    // invert: Remove suffix of non-c chars instead. Default falsey.
    function rtrim(str, c, invert) {
      const l = str.length;
      if (l === 0) {
        return '';
      }

      // Length of suffix matching the invert condition.
      let suffLen = 0;

      // Step left until we fail to match the invert condition.
      while (suffLen < l) {
        const currChar = str.charAt(l - suffLen - 1);
        if (currChar === c && !invert) {
          suffLen++;
        } else if (currChar !== c && invert) {
          suffLen++;
        } else {
          break;
        }
      }

      return str.substr(0, l - suffLen);
    }

    function findClosingBracket(str, b) {
      if (str.indexOf(b[1]) === -1) {
        return -1;
      }
      const l = str.length;
      let level = 0,
        i = 0;
      for (; i < l; i++) {
        if (str[i] === '\\') {
          i++;
        } else if (str[i] === b[0]) {
          level++;
        } else if (str[i] === b[1]) {
          level--;
          if (level < 0) {
            return i;
          }
        }
      }
      return -1;
    }

    function checkSanitizeDeprecation(opt) {
      if (opt && opt.sanitize && !opt.silent) {
        console.warn('marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options');
      }
    }

    var helpers = {
      escape,
      unescape,
      edit,
      cleanUrl,
      resolveUrl,
      noopTest,
      merge,
      splitCells,
      rtrim,
      findClosingBracket,
      checkSanitizeDeprecation
    };

    const {
      noopTest: noopTest$1,
      edit: edit$1,
      merge: merge$1
    } = helpers;

    /**
     * Block-Level Grammar
     */
    const block = {
      newline: /^\n+/,
      code: /^( {4}[^\n]+\n*)+/,
      fences: /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?:\n+|$)|$)/,
      hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
      heading: /^ {0,3}(#{1,6}) +([^\n]*?)(?: +#+)? *(?:\n+|$)/,
      blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
      list: /^( {0,3})(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
      html: '^ {0,3}(?:' // optional indentation
        + '<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
        + '|comment[^\\n]*(\\n+|$)' // (2)
        + '|<\\?[\\s\\S]*?\\?>\\n*' // (3)
        + '|<![A-Z][\\s\\S]*?>\\n*' // (4)
        + '|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>\\n*' // (5)
        + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)' // (6)
        + '|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) open tag
        + '|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) closing tag
        + ')',
      def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
      nptable: noopTest$1,
      table: noopTest$1,
      lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
      // regex template, placeholders will be replaced according to different paragraph
      // interruption rules of commonmark and the original markdown spec:
      _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html)[^\n]+)*)/,
      text: /^[^\n]+/
    };

    block._label = /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/;
    block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
    block.def = edit$1(block.def)
      .replace('label', block._label)
      .replace('title', block._title)
      .getRegex();

    block.bullet = /(?:[*+-]|\d{1,9}\.)/;
    block.item = /^( *)(bull) ?[^\n]*(?:\n(?!\1bull ?)[^\n]*)*/;
    block.item = edit$1(block.item, 'gm')
      .replace(/bull/g, block.bullet)
      .getRegex();

    block.list = edit$1(block.list)
      .replace(/bull/g, block.bullet)
      .replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))')
      .replace('def', '\\n+(?=' + block.def.source + ')')
      .getRegex();

    block._tag = 'address|article|aside|base|basefont|blockquote|body|caption'
      + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption'
      + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe'
      + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option'
      + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr'
      + '|track|ul';
    block._comment = /<!--(?!-?>)[\s\S]*?-->/;
    block.html = edit$1(block.html, 'i')
      .replace('comment', block._comment)
      .replace('tag', block._tag)
      .replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/)
      .getRegex();

    block.paragraph = edit$1(block._paragraph)
      .replace('hr', block.hr)
      .replace('heading', ' {0,3}#{1,6} ')
      .replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
      .replace('blockquote', ' {0,3}>')
      .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
      .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)')
      .replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
      .getRegex();

    block.blockquote = edit$1(block.blockquote)
      .replace('paragraph', block.paragraph)
      .getRegex();

    /**
     * Normal Block Grammar
     */

    block.normal = merge$1({}, block);

    /**
     * GFM Block Grammar
     */

    block.gfm = merge$1({}, block.normal, {
      nptable: '^ *([^|\\n ].*\\|.*)\\n' // Header
        + ' *([-:]+ *\\|[-| :]*)' // Align
        + '(?:\\n((?:(?!\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)', // Cells
      table: '^ *\\|(.+)\\n' // Header
        + ' *\\|?( *[-:]+[-| :]*)' // Align
        + '(?:\\n *((?:(?!\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)' // Cells
    });

    block.gfm.nptable = edit$1(block.gfm.nptable)
      .replace('hr', block.hr)
      .replace('heading', ' {0,3}#{1,6} ')
      .replace('blockquote', ' {0,3}>')
      .replace('code', ' {4}[^\\n]')
      .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
      .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)')
      .replace('tag', block._tag) // tables can be interrupted by type (6) html blocks
      .getRegex();

    block.gfm.table = edit$1(block.gfm.table)
      .replace('hr', block.hr)
      .replace('heading', ' {0,3}#{1,6} ')
      .replace('blockquote', ' {0,3}>')
      .replace('code', ' {4}[^\\n]')
      .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
      .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)')
      .replace('tag', block._tag) // tables can be interrupted by type (6) html blocks
      .getRegex();

    /**
     * Pedantic grammar (original John Gruber's loose markdown specification)
     */

    block.pedantic = merge$1({}, block.normal, {
      html: edit$1(
        '^ *(?:comment *(?:\\n|\\s*$)'
        + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
        + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))')
        .replace('comment', block._comment)
        .replace(/tag/g, '(?!(?:'
          + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub'
          + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)'
          + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b')
        .getRegex(),
      def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
      heading: /^ *(#{1,6}) *([^\n]+?) *(?:#+ *)?(?:\n+|$)/,
      fences: noopTest$1, // fences not supported
      paragraph: edit$1(block.normal._paragraph)
        .replace('hr', block.hr)
        .replace('heading', ' *#{1,6} *[^\n]')
        .replace('lheading', block.lheading)
        .replace('blockquote', ' {0,3}>')
        .replace('|fences', '')
        .replace('|list', '')
        .replace('|html', '')
        .getRegex()
    });

    /**
     * Inline-Level Grammar
     */
    const inline = {
      escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
      autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
      url: noopTest$1,
      tag: '^comment'
        + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
        + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
        + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
        + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
        + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>', // CDATA section
      link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
      reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
      nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
      strong: /^__([^\s_])__(?!_)|^\*\*([^\s*])\*\*(?!\*)|^__([^\s][\s\S]*?[^\s])__(?!_)|^\*\*([^\s][\s\S]*?[^\s])\*\*(?!\*)/,
      em: /^_([^\s_])_(?!_)|^\*([^\s*<\[])\*(?!\*)|^_([^\s<][\s\S]*?[^\s_])_(?!_|[^\spunctuation])|^_([^\s_<][\s\S]*?[^\s])_(?!_|[^\spunctuation])|^\*([^\s<"][\s\S]*?[^\s\*])\*(?!\*|[^\spunctuation])|^\*([^\s*"<\[][\s\S]*?[^\s])\*(?!\*)/,
      code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
      br: /^( {2,}|\\)\n(?!\s*$)/,
      del: noopTest$1,
      text: /^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*]|\b_|$)|[^ ](?= {2,}\n))|(?= {2,}\n))/
    };

    // list of punctuation marks from common mark spec
    // without ` and ] to workaround Rule 17 (inline code blocks/links)
    inline._punctuation = '!"#$%&\'()*+,\\-./:;<=>?@\\[^_{|}~';
    inline.em = edit$1(inline.em).replace(/punctuation/g, inline._punctuation).getRegex();

    inline._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;

    inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
    inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
    inline.autolink = edit$1(inline.autolink)
      .replace('scheme', inline._scheme)
      .replace('email', inline._email)
      .getRegex();

    inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;

    inline.tag = edit$1(inline.tag)
      .replace('comment', block._comment)
      .replace('attribute', inline._attribute)
      .getRegex();

    inline._label = /(?:\[[^\[\]]*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
    inline._href = /<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*/;
    inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;

    inline.link = edit$1(inline.link)
      .replace('label', inline._label)
      .replace('href', inline._href)
      .replace('title', inline._title)
      .getRegex();

    inline.reflink = edit$1(inline.reflink)
      .replace('label', inline._label)
      .getRegex();

    /**
     * Normal Inline Grammar
     */

    inline.normal = merge$1({}, inline);

    /**
     * Pedantic Inline Grammar
     */

    inline.pedantic = merge$1({}, inline.normal, {
      strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
      em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/,
      link: edit$1(/^!?\[(label)\]\((.*?)\)/)
        .replace('label', inline._label)
        .getRegex(),
      reflink: edit$1(/^!?\[(label)\]\s*\[([^\]]*)\]/)
        .replace('label', inline._label)
        .getRegex()
    });

    /**
     * GFM Inline Grammar
     */

    inline.gfm = merge$1({}, inline.normal, {
      escape: edit$1(inline.escape).replace('])', '~|])').getRegex(),
      _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
      url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
      _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
      del: /^~+(?=\S)([\s\S]*?\S)~+/,
      text: /^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*~]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))|(?= {2,}\n|[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))/
    });

    inline.gfm.url = edit$1(inline.gfm.url, 'i')
      .replace('email', inline.gfm._extended_email)
      .getRegex();
    /**
     * GFM + Line Breaks Inline Grammar
     */

    inline.breaks = merge$1({}, inline.gfm, {
      br: edit$1(inline.br).replace('{2,}', '*').getRegex(),
      text: edit$1(inline.gfm.text)
        .replace('\\b_', '\\b_| {2,}\\n')
        .replace(/\{2,\}/g, '*')
        .getRegex()
    });

    var rules = {
      block,
      inline
    };

    const { defaults: defaults$1 } = defaults;
    const { block: block$1 } = rules;
    const {
      rtrim: rtrim$1,
      splitCells: splitCells$1,
      escape: escape$1
    } = helpers;

    /**
     * Block Lexer
     */
    var Lexer_1 = class Lexer {
      constructor(options) {
        this.tokens = [];
        this.tokens.links = Object.create(null);
        this.options = options || defaults$1;
        this.rules = block$1.normal;

        if (this.options.pedantic) {
          this.rules = block$1.pedantic;
        } else if (this.options.gfm) {
          this.rules = block$1.gfm;
        }
      }

      /**
       * Expose Block Rules
       */
      static get rules() {
        return block$1;
      }

      /**
       * Static Lex Method
       */
      static lex(src, options) {
        const lexer = new Lexer(options);
        return lexer.lex(src);
      };

      /**
       * Preprocessing
       */
      lex(src) {
        src = src
          .replace(/\r\n|\r/g, '\n')
          .replace(/\t/g, '    ');

        return this.token(src, true);
      };

      /**
       * Lexing
       */
      token(src, top) {
        src = src.replace(/^ +$/gm, '');
        let next,
          loose,
          cap,
          bull,
          b,
          item,
          listStart,
          listItems,
          t,
          space,
          i,
          tag,
          l,
          isordered,
          istask,
          ischecked;

        while (src) {
          // newline
          if (cap = this.rules.newline.exec(src)) {
            src = src.substring(cap[0].length);
            if (cap[0].length > 1) {
              this.tokens.push({
                type: 'space'
              });
            }
          }

          // code
          if (cap = this.rules.code.exec(src)) {
            const lastToken = this.tokens[this.tokens.length - 1];
            src = src.substring(cap[0].length);
            // An indented code block cannot interrupt a paragraph.
            if (lastToken && lastToken.type === 'paragraph') {
              lastToken.text += '\n' + cap[0].trimRight();
            } else {
              cap = cap[0].replace(/^ {4}/gm, '');
              this.tokens.push({
                type: 'code',
                codeBlockStyle: 'indented',
                text: !this.options.pedantic
                  ? rtrim$1(cap, '\n')
                  : cap
              });
            }
            continue;
          }

          // fences
          if (cap = this.rules.fences.exec(src)) {
            src = src.substring(cap[0].length);
            this.tokens.push({
              type: 'code',
              lang: cap[2] ? cap[2].trim() : cap[2],
              text: cap[3] || ''
            });
            continue;
          }

          // heading
          if (cap = this.rules.heading.exec(src)) {
            src = src.substring(cap[0].length);
            this.tokens.push({
              type: 'heading',
              depth: cap[1].length,
              text: cap[2]
            });
            continue;
          }

          // table no leading pipe (gfm)
          if (cap = this.rules.nptable.exec(src)) {
            item = {
              type: 'table',
              header: splitCells$1(cap[1].replace(/^ *| *\| *$/g, '')),
              align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
              cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
            };

            if (item.header.length === item.align.length) {
              src = src.substring(cap[0].length);

              for (i = 0; i < item.align.length; i++) {
                if (/^ *-+: *$/.test(item.align[i])) {
                  item.align[i] = 'right';
                } else if (/^ *:-+: *$/.test(item.align[i])) {
                  item.align[i] = 'center';
                } else if (/^ *:-+ *$/.test(item.align[i])) {
                  item.align[i] = 'left';
                } else {
                  item.align[i] = null;
                }
              }

              for (i = 0; i < item.cells.length; i++) {
                item.cells[i] = splitCells$1(item.cells[i], item.header.length);
              }

              this.tokens.push(item);

              continue;
            }
          }

          // hr
          if (cap = this.rules.hr.exec(src)) {
            src = src.substring(cap[0].length);
            this.tokens.push({
              type: 'hr'
            });
            continue;
          }

          // blockquote
          if (cap = this.rules.blockquote.exec(src)) {
            src = src.substring(cap[0].length);

            this.tokens.push({
              type: 'blockquote_start'
            });

            cap = cap[0].replace(/^ *> ?/gm, '');

            // Pass `top` to keep the current
            // "toplevel" state. This is exactly
            // how markdown.pl works.
            this.token(cap, top);

            this.tokens.push({
              type: 'blockquote_end'
            });

            continue;
          }

          // list
          if (cap = this.rules.list.exec(src)) {
            src = src.substring(cap[0].length);
            bull = cap[2];
            isordered = bull.length > 1;

            listStart = {
              type: 'list_start',
              ordered: isordered,
              start: isordered ? +bull : '',
              loose: false
            };

            this.tokens.push(listStart);

            // Get each top-level item.
            cap = cap[0].match(this.rules.item);

            listItems = [];
            next = false;
            l = cap.length;
            i = 0;

            for (; i < l; i++) {
              item = cap[i];

              // Remove the list item's bullet
              // so it is seen as the next token.
              space = item.length;
              item = item.replace(/^ *([*+-]|\d+\.) */, '');

              // Outdent whatever the
              // list item contains. Hacky.
              if (~item.indexOf('\n ')) {
                space -= item.length;
                item = !this.options.pedantic
                  ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
                  : item.replace(/^ {1,4}/gm, '');
              }

              // Determine whether the next list item belongs here.
              // Backpedal if it does not belong in this list.
              if (i !== l - 1) {
                b = block$1.bullet.exec(cap[i + 1])[0];
                if (bull.length > 1 ? b.length === 1
                  : (b.length > 1 || (this.options.smartLists && b !== bull))) {
                  src = cap.slice(i + 1).join('\n') + src;
                  i = l - 1;
                }
              }

              // Determine whether item is loose or not.
              // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
              // for discount behavior.
              loose = next || /\n\n(?!\s*$)/.test(item);
              if (i !== l - 1) {
                next = item.charAt(item.length - 1) === '\n';
                if (!loose) loose = next;
              }

              if (loose) {
                listStart.loose = true;
              }

              // Check for task list items
              istask = /^\[[ xX]\] /.test(item);
              ischecked = undefined;
              if (istask) {
                ischecked = item[1] !== ' ';
                item = item.replace(/^\[[ xX]\] +/, '');
              }

              t = {
                type: 'list_item_start',
                task: istask,
                checked: ischecked,
                loose: loose
              };

              listItems.push(t);
              this.tokens.push(t);

              // Recurse.
              this.token(item, false);

              this.tokens.push({
                type: 'list_item_end'
              });
            }

            if (listStart.loose) {
              l = listItems.length;
              i = 0;
              for (; i < l; i++) {
                listItems[i].loose = true;
              }
            }

            this.tokens.push({
              type: 'list_end'
            });

            continue;
          }

          // html
          if (cap = this.rules.html.exec(src)) {
            src = src.substring(cap[0].length);
            this.tokens.push({
              type: this.options.sanitize
                ? 'paragraph'
                : 'html',
              pre: !this.options.sanitizer
                && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
              text: this.options.sanitize ? (this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape$1(cap[0])) : cap[0]
            });
            continue;
          }

          // def
          if (top && (cap = this.rules.def.exec(src))) {
            src = src.substring(cap[0].length);
            if (cap[3]) cap[3] = cap[3].substring(1, cap[3].length - 1);
            tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
            if (!this.tokens.links[tag]) {
              this.tokens.links[tag] = {
                href: cap[2],
                title: cap[3]
              };
            }
            continue;
          }

          // table (gfm)
          if (cap = this.rules.table.exec(src)) {
            item = {
              type: 'table',
              header: splitCells$1(cap[1].replace(/^ *| *\| *$/g, '')),
              align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
              cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
            };

            if (item.header.length === item.align.length) {
              src = src.substring(cap[0].length);

              for (i = 0; i < item.align.length; i++) {
                if (/^ *-+: *$/.test(item.align[i])) {
                  item.align[i] = 'right';
                } else if (/^ *:-+: *$/.test(item.align[i])) {
                  item.align[i] = 'center';
                } else if (/^ *:-+ *$/.test(item.align[i])) {
                  item.align[i] = 'left';
                } else {
                  item.align[i] = null;
                }
              }

              for (i = 0; i < item.cells.length; i++) {
                item.cells[i] = splitCells$1(
                  item.cells[i].replace(/^ *\| *| *\| *$/g, ''),
                  item.header.length);
              }

              this.tokens.push(item);

              continue;
            }
          }

          // lheading
          if (cap = this.rules.lheading.exec(src)) {
            src = src.substring(cap[0].length);
            this.tokens.push({
              type: 'heading',
              depth: cap[2].charAt(0) === '=' ? 1 : 2,
              text: cap[1]
            });
            continue;
          }

          // top-level paragraph
          if (top && (cap = this.rules.paragraph.exec(src))) {
            src = src.substring(cap[0].length);
            this.tokens.push({
              type: 'paragraph',
              text: cap[1].charAt(cap[1].length - 1) === '\n'
                ? cap[1].slice(0, -1)
                : cap[1]
            });
            continue;
          }

          // text
          if (cap = this.rules.text.exec(src)) {
            // Top-level should never reach here.
            src = src.substring(cap[0].length);
            this.tokens.push({
              type: 'text',
              text: cap[0]
            });
            continue;
          }

          if (src) {
            throw new Error('Infinite loop on byte: ' + src.charCodeAt(0));
          }
        }

        return this.tokens;
      };
    };

    const { defaults: defaults$2 } = defaults;
    const {
      cleanUrl: cleanUrl$1,
      escape: escape$2
    } = helpers;

    /**
     * Renderer
     */
    var Renderer_1 = class Renderer {
      constructor(options) {
        this.options = options || defaults$2;
      }

      code(code, infostring, escaped) {
        const lang = (infostring || '').match(/\S*/)[0];
        if (this.options.highlight) {
          const out = this.options.highlight(code, lang);
          if (out != null && out !== code) {
            escaped = true;
            code = out;
          }
        }

        if (!lang) {
          return '<pre><code>'
            + (escaped ? code : escape$2(code, true))
            + '</code></pre>';
        }

        return '<pre><code class="'
          + this.options.langPrefix
          + escape$2(lang, true)
          + '">'
          + (escaped ? code : escape$2(code, true))
          + '</code></pre>\n';
      };

      blockquote(quote) {
        return '<blockquote>\n' + quote + '</blockquote>\n';
      };

      html(html) {
        return html;
      };

      heading(text, level, raw, slugger) {
        if (this.options.headerIds) {
          return '<h'
            + level
            + ' id="'
            + this.options.headerPrefix
            + slugger.slug(raw)
            + '">'
            + text
            + '</h'
            + level
            + '>\n';
        }
        // ignore IDs
        return '<h' + level + '>' + text + '</h' + level + '>\n';
      };

      hr() {
        return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
      };

      list(body, ordered, start) {
        const type = ordered ? 'ol' : 'ul',
          startatt = (ordered && start !== 1) ? (' start="' + start + '"') : '';
        return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
      };

      listitem(text) {
        return '<li>' + text + '</li>\n';
      };

      checkbox(checked) {
        return '<input '
          + (checked ? 'checked="" ' : '')
          + 'disabled="" type="checkbox"'
          + (this.options.xhtml ? ' /' : '')
          + '> ';
      };

      paragraph(text) {
        return '<p>' + text + '</p>\n';
      };

      table(header, body) {
        if (body) body = '<tbody>' + body + '</tbody>';

        return '<table>\n'
          + '<thead>\n'
          + header
          + '</thead>\n'
          + body
          + '</table>\n';
      };

      tablerow(content) {
        return '<tr>\n' + content + '</tr>\n';
      };

      tablecell(content, flags) {
        const type = flags.header ? 'th' : 'td';
        const tag = flags.align
          ? '<' + type + ' align="' + flags.align + '">'
          : '<' + type + '>';
        return tag + content + '</' + type + '>\n';
      };

      // span level renderer
      strong(text) {
        return '<strong>' + text + '</strong>';
      };

      em(text) {
        return '<em>' + text + '</em>';
      };

      codespan(text) {
        return '<code>' + text + '</code>';
      };

      br() {
        return this.options.xhtml ? '<br/>' : '<br>';
      };

      del(text) {
        return '<del>' + text + '</del>';
      };

      link(href, title, text) {
        href = cleanUrl$1(this.options.sanitize, this.options.baseUrl, href);
        if (href === null) {
          return text;
        }
        let out = '<a href="' + escape$2(href) + '"';
        if (title) {
          out += ' title="' + title + '"';
        }
        out += '>' + text + '</a>';
        return out;
      };

      image(href, title, text) {
        href = cleanUrl$1(this.options.sanitize, this.options.baseUrl, href);
        if (href === null) {
          return text;
        }

        let out = '<img src="' + href + '" alt="' + text + '"';
        if (title) {
          out += ' title="' + title + '"';
        }
        out += this.options.xhtml ? '/>' : '>';
        return out;
      };

      text(text) {
        return text;
      };
    };

    /**
     * Slugger generates header id
     */
    var Slugger_1 = class Slugger {
      constructor() {
        this.seen = {};
      }

      /**
       * Convert string to unique id
       */
      slug(value) {
        let slug = value
          .toLowerCase()
          .trim()
          // remove html tags
          .replace(/<[!\/a-z].*?>/ig, '')
          // remove unwanted chars
          .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
          .replace(/\s/g, '-');

        if (this.seen.hasOwnProperty(slug)) {
          const originalSlug = slug;
          do {
            this.seen[originalSlug]++;
            slug = originalSlug + '-' + this.seen[originalSlug];
          } while (this.seen.hasOwnProperty(slug));
        }
        this.seen[slug] = 0;

        return slug;
      };
    };

    const { defaults: defaults$3 } = defaults;
    const { inline: inline$1 } = rules;
    const {
      findClosingBracket: findClosingBracket$1,
      escape: escape$3
    } = helpers;

    /**
     * Inline Lexer & Compiler
     */
    var InlineLexer_1 = class InlineLexer {
      constructor(links, options) {
        this.options = options || defaults$3;
        this.links = links;
        this.rules = inline$1.normal;
        this.options.renderer = this.options.renderer || new Renderer_1();
        this.renderer = this.options.renderer;
        this.renderer.options = this.options;

        if (!this.links) {
          throw new Error('Tokens array requires a `links` property.');
        }

        if (this.options.pedantic) {
          this.rules = inline$1.pedantic;
        } else if (this.options.gfm) {
          if (this.options.breaks) {
            this.rules = inline$1.breaks;
          } else {
            this.rules = inline$1.gfm;
          }
        }
      }

      /**
       * Expose Inline Rules
       */
      static get rules() {
        return inline$1;
      }

      /**
       * Static Lexing/Compiling Method
       */
      static output(src, links, options) {
        const inline = new InlineLexer(links, options);
        return inline.output(src);
      }

      /**
       * Lexing/Compiling
       */
      output(src) {
        let out = '',
          link,
          text,
          href,
          title,
          cap,
          prevCapZero;

        while (src) {
          // escape
          if (cap = this.rules.escape.exec(src)) {
            src = src.substring(cap[0].length);
            out += escape$3(cap[1]);
            continue;
          }

          // tag
          if (cap = this.rules.tag.exec(src)) {
            if (!this.inLink && /^<a /i.test(cap[0])) {
              this.inLink = true;
            } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
              this.inLink = false;
            }
            if (!this.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
              this.inRawBlock = true;
            } else if (this.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
              this.inRawBlock = false;
            }

            src = src.substring(cap[0].length);
            out += this.renderer.html(this.options.sanitize
              ? (this.options.sanitizer
                ? this.options.sanitizer(cap[0])
                : escape$3(cap[0]))
              : cap[0]);
            continue;
          }

          // link
          if (cap = this.rules.link.exec(src)) {
            const lastParenIndex = findClosingBracket$1(cap[2], '()');
            if (lastParenIndex > -1) {
              const start = cap[0].indexOf('!') === 0 ? 5 : 4;
              const linkLen = start + cap[1].length + lastParenIndex;
              cap[2] = cap[2].substring(0, lastParenIndex);
              cap[0] = cap[0].substring(0, linkLen).trim();
              cap[3] = '';
            }
            src = src.substring(cap[0].length);
            this.inLink = true;
            href = cap[2];
            if (this.options.pedantic) {
              link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

              if (link) {
                href = link[1];
                title = link[3];
              } else {
                title = '';
              }
            } else {
              title = cap[3] ? cap[3].slice(1, -1) : '';
            }
            href = href.trim().replace(/^<([\s\S]*)>$/, '$1');
            out += this.outputLink(cap, {
              href: InlineLexer.escapes(href),
              title: InlineLexer.escapes(title)
            });
            this.inLink = false;
            continue;
          }

          // reflink, nolink
          if ((cap = this.rules.reflink.exec(src))
              || (cap = this.rules.nolink.exec(src))) {
            src = src.substring(cap[0].length);
            link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
            link = this.links[link.toLowerCase()];
            if (!link || !link.href) {
              out += cap[0].charAt(0);
              src = cap[0].substring(1) + src;
              continue;
            }
            this.inLink = true;
            out += this.outputLink(cap, link);
            this.inLink = false;
            continue;
          }

          // strong
          if (cap = this.rules.strong.exec(src)) {
            src = src.substring(cap[0].length);
            out += this.renderer.strong(this.output(cap[4] || cap[3] || cap[2] || cap[1]));
            continue;
          }

          // em
          if (cap = this.rules.em.exec(src)) {
            src = src.substring(cap[0].length);
            out += this.renderer.em(this.output(cap[6] || cap[5] || cap[4] || cap[3] || cap[2] || cap[1]));
            continue;
          }

          // code
          if (cap = this.rules.code.exec(src)) {
            src = src.substring(cap[0].length);
            out += this.renderer.codespan(escape$3(cap[2].trim(), true));
            continue;
          }

          // br
          if (cap = this.rules.br.exec(src)) {
            src = src.substring(cap[0].length);
            out += this.renderer.br();
            continue;
          }

          // del (gfm)
          if (cap = this.rules.del.exec(src)) {
            src = src.substring(cap[0].length);
            out += this.renderer.del(this.output(cap[1]));
            continue;
          }

          // autolink
          if (cap = this.rules.autolink.exec(src)) {
            src = src.substring(cap[0].length);
            if (cap[2] === '@') {
              text = escape$3(this.mangle(cap[1]));
              href = 'mailto:' + text;
            } else {
              text = escape$3(cap[1]);
              href = text;
            }
            out += this.renderer.link(href, null, text);
            continue;
          }

          // url (gfm)
          if (!this.inLink && (cap = this.rules.url.exec(src))) {
            if (cap[2] === '@') {
              text = escape$3(cap[0]);
              href = 'mailto:' + text;
            } else {
              // do extended autolink path validation
              do {
                prevCapZero = cap[0];
                cap[0] = this.rules._backpedal.exec(cap[0])[0];
              } while (prevCapZero !== cap[0]);
              text = escape$3(cap[0]);
              if (cap[1] === 'www.') {
                href = 'http://' + text;
              } else {
                href = text;
              }
            }
            src = src.substring(cap[0].length);
            out += this.renderer.link(href, null, text);
            continue;
          }

          // text
          if (cap = this.rules.text.exec(src)) {
            src = src.substring(cap[0].length);
            if (this.inRawBlock) {
              out += this.renderer.text(this.options.sanitize ? (this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape$3(cap[0])) : cap[0]);
            } else {
              out += this.renderer.text(escape$3(this.smartypants(cap[0])));
            }
            continue;
          }

          if (src) {
            throw new Error('Infinite loop on byte: ' + src.charCodeAt(0));
          }
        }

        return out;
      }

      static escapes(text) {
        return text ? text.replace(InlineLexer.rules._escapes, '$1') : text;
      }

      /**
       * Compile Link
       */
      outputLink(cap, link) {
        const href = link.href,
          title = link.title ? escape$3(link.title) : null;

        return cap[0].charAt(0) !== '!'
          ? this.renderer.link(href, title, this.output(cap[1]))
          : this.renderer.image(href, title, escape$3(cap[1]));
      }

      /**
       * Smartypants Transformations
       */
      smartypants(text) {
        if (!this.options.smartypants) return text;
        return text
          // em-dashes
          .replace(/---/g, '\u2014')
          // en-dashes
          .replace(/--/g, '\u2013')
          // opening singles
          .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
          // closing singles & apostrophes
          .replace(/'/g, '\u2019')
          // opening doubles
          .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
          // closing doubles
          .replace(/"/g, '\u201d')
          // ellipses
          .replace(/\.{3}/g, '\u2026');
      }

      /**
       * Mangle Links
       */
      mangle(text) {
        if (!this.options.mangle) return text;
        const l = text.length;
        let out = '',
          i = 0,
          ch;

        for (; i < l; i++) {
          ch = text.charCodeAt(i);
          if (Math.random() > 0.5) {
            ch = 'x' + ch.toString(16);
          }
          out += '&#' + ch + ';';
        }

        return out;
      }
    };

    /**
     * TextRenderer
     * returns only the textual part of the token
     */
    var TextRenderer_1 = class TextRenderer {
      // no need for block level renderers
      strong(text) {
        return text;
      }

      em(text) {
        return text;
      }

      codespan(text) {
        return text;
      }

      del(text) {
        return text;
      }

      html(text) {
        return text;
      }

      text(text) {
        return text;
      }

      link(href, title, text) {
        return '' + text;
      }

      image(href, title, text) {
        return '' + text;
      }

      br() {
        return '';
      }
    };

    const { defaults: defaults$4 } = defaults;
    const {
      merge: merge$2,
      unescape: unescape$1
    } = helpers;

    /**
     * Parsing & Compiling
     */
    var Parser_1 = class Parser {
      constructor(options) {
        this.tokens = [];
        this.token = null;
        this.options = options || defaults$4;
        this.options.renderer = this.options.renderer || new Renderer_1();
        this.renderer = this.options.renderer;
        this.renderer.options = this.options;
        this.slugger = new Slugger_1();
      }

      /**
       * Static Parse Method
       */
      static parse(tokens, options) {
        const parser = new Parser(options);
        return parser.parse(tokens);
      };

      /**
       * Parse Loop
       */
      parse(tokens) {
        this.inline = new InlineLexer_1(tokens.links, this.options);
        // use an InlineLexer with a TextRenderer to extract pure text
        this.inlineText = new InlineLexer_1(
          tokens.links,
          merge$2({}, this.options, { renderer: new TextRenderer_1() })
        );
        this.tokens = tokens.reverse();

        let out = '';
        while (this.next()) {
          out += this.tok();
        }

        return out;
      };

      /**
       * Next Token
       */
      next() {
        this.token = this.tokens.pop();
        return this.token;
      };

      /**
       * Preview Next Token
       */
      peek() {
        return this.tokens[this.tokens.length - 1] || 0;
      };

      /**
       * Parse Text Tokens
       */
      parseText() {
        let body = this.token.text;

        while (this.peek().type === 'text') {
          body += '\n' + this.next().text;
        }

        return this.inline.output(body);
      };

      /**
       * Parse Current Token
       */
      tok() {
        let body = '';
        switch (this.token.type) {
          case 'space': {
            return '';
          }
          case 'hr': {
            return this.renderer.hr();
          }
          case 'heading': {
            return this.renderer.heading(
              this.inline.output(this.token.text),
              this.token.depth,
              unescape$1(this.inlineText.output(this.token.text)),
              this.slugger);
          }
          case 'code': {
            return this.renderer.code(this.token.text,
              this.token.lang,
              this.token.escaped);
          }
          case 'table': {
            let header = '',
              i,
              row,
              cell,
              j;

            // header
            cell = '';
            for (i = 0; i < this.token.header.length; i++) {
              cell += this.renderer.tablecell(
                this.inline.output(this.token.header[i]),
                { header: true, align: this.token.align[i] }
              );
            }
            header += this.renderer.tablerow(cell);

            for (i = 0; i < this.token.cells.length; i++) {
              row = this.token.cells[i];

              cell = '';
              for (j = 0; j < row.length; j++) {
                cell += this.renderer.tablecell(
                  this.inline.output(row[j]),
                  { header: false, align: this.token.align[j] }
                );
              }

              body += this.renderer.tablerow(cell);
            }
            return this.renderer.table(header, body);
          }
          case 'blockquote_start': {
            body = '';

            while (this.next().type !== 'blockquote_end') {
              body += this.tok();
            }

            return this.renderer.blockquote(body);
          }
          case 'list_start': {
            body = '';
            const ordered = this.token.ordered,
              start = this.token.start;

            while (this.next().type !== 'list_end') {
              body += this.tok();
            }

            return this.renderer.list(body, ordered, start);
          }
          case 'list_item_start': {
            body = '';
            const loose = this.token.loose;
            const checked = this.token.checked;
            const task = this.token.task;

            if (this.token.task) {
              if (loose) {
                if (this.peek().type === 'text') {
                  const nextToken = this.peek();
                  nextToken.text = this.renderer.checkbox(checked) + ' ' + nextToken.text;
                } else {
                  this.tokens.push({
                    type: 'text',
                    text: this.renderer.checkbox(checked)
                  });
                }
              } else {
                body += this.renderer.checkbox(checked);
              }
            }

            while (this.next().type !== 'list_item_end') {
              body += !loose && this.token.type === 'text'
                ? this.parseText()
                : this.tok();
            }
            return this.renderer.listitem(body, task, checked);
          }
          case 'html': {
            // TODO parse inline content if parameter markdown=1
            return this.renderer.html(this.token.text);
          }
          case 'paragraph': {
            return this.renderer.paragraph(this.inline.output(this.token.text));
          }
          case 'text': {
            return this.renderer.paragraph(this.parseText());
          }
          default: {
            const errMsg = 'Token with "' + this.token.type + '" type was not found.';
            if (this.options.silent) {
              console.log(errMsg);
            } else {
              throw new Error(errMsg);
            }
          }
        }
      };
    };

    const {
      merge: merge$3,
      checkSanitizeDeprecation: checkSanitizeDeprecation$1,
      escape: escape$4
    } = helpers;
    const {
      getDefaults,
      changeDefaults,
      defaults: defaults$5
    } = defaults;

    /**
     * Marked
     */
    function marked(src, opt, callback) {
      // throw error in case of non string input
      if (typeof src === 'undefined' || src === null) {
        throw new Error('marked(): input parameter is undefined or null');
      }
      if (typeof src !== 'string') {
        throw new Error('marked(): input parameter is of type '
          + Object.prototype.toString.call(src) + ', string expected');
      }

      if (callback || typeof opt === 'function') {
        if (!callback) {
          callback = opt;
          opt = null;
        }

        opt = merge$3({}, marked.defaults, opt || {});
        checkSanitizeDeprecation$1(opt);
        const highlight = opt.highlight;
        let tokens,
          pending,
          i = 0;

        try {
          tokens = Lexer_1.lex(src, opt);
        } catch (e) {
          return callback(e);
        }

        pending = tokens.length;

        const done = function(err) {
          if (err) {
            opt.highlight = highlight;
            return callback(err);
          }

          let out;

          try {
            out = Parser_1.parse(tokens, opt);
          } catch (e) {
            err = e;
          }

          opt.highlight = highlight;

          return err
            ? callback(err)
            : callback(null, out);
        };

        if (!highlight || highlight.length < 3) {
          return done();
        }

        delete opt.highlight;

        if (!pending) return done();

        for (; i < tokens.length; i++) {
          (function(token) {
            if (token.type !== 'code') {
              return --pending || done();
            }
            return highlight(token.text, token.lang, function(err, code) {
              if (err) return done(err);
              if (code == null || code === token.text) {
                return --pending || done();
              }
              token.text = code;
              token.escaped = true;
              --pending || done();
            });
          })(tokens[i]);
        }

        return;
      }
      try {
        opt = merge$3({}, marked.defaults, opt || {});
        checkSanitizeDeprecation$1(opt);
        return Parser_1.parse(Lexer_1.lex(src, opt), opt);
      } catch (e) {
        e.message += '\nPlease report this to https://github.com/markedjs/marked.';
        if ((opt || marked.defaults).silent) {
          return '<p>An error occurred:</p><pre>'
            + escape$4(e.message + '', true)
            + '</pre>';
        }
        throw e;
      }
    }

    /**
     * Options
     */

    marked.options =
    marked.setOptions = function(opt) {
      merge$3(marked.defaults, opt);
      changeDefaults(marked.defaults);
      return marked;
    };

    marked.getDefaults = getDefaults;

    marked.defaults = defaults$5;

    /**
     * Expose
     */

    marked.Parser = Parser_1;
    marked.parser = Parser_1.parse;

    marked.Renderer = Renderer_1;
    marked.TextRenderer = TextRenderer_1;

    marked.Lexer = Lexer_1;
    marked.lexer = Lexer_1.lex;

    marked.InlineLexer = InlineLexer_1;
    marked.inlineLexer = InlineLexer_1.output;

    marked.Slugger = Slugger_1;

    marked.parse = marked;

    var marked_1 = marked;

    /* src/examples/DemoOne.svelte generated by Svelte v3.24.0 */

    const { console: console_1$1 } = globals;
    const file$2 = "src/examples/DemoOne.svelte";

    // (36:2) {#if cytosisLoading}
    function create_if_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("... loading Cytosis object ...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(36:2) {#if cytosisLoading}",
    		ctx
    	});

    	return block;
    }

    // (39:2) {#if cytosisObject}
    function create_if_block(ctx) {
    	let div;
    	let raw_value = marked_1(/*cytosisObject*/ ctx[2].results["Site Content"][0].fields["Content"]) + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "_card _padding --flat svelte-ch92db");
    			add_location(div, file$2, 39, 4, 1466);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cytosisObject*/ 4 && raw_value !== (raw_value = marked_1(/*cytosisObject*/ ctx[2].results["Site Content"][0].fields["Content"]) + "")) div.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(39:2) {#if cytosisObject}",
    		ctx
    	});

    	return block;
    }

    // (20:1) <CytosisWip     options={{       apiKey: 'keygfuzbhXK1VShlR',       baseId: 'appc0M3MdTYATe7RO',       configName: 'content-1',       routeDetails: 'Demo One',     }}     apiKey={'keygfuzbhXK1VShlR'}     baseId={'appc0M3MdTYATe7RO'}     configName={'content-1'}    routeDetails={'Cytosis One'}        bind:isLoading={cytosisLoading}    bind:cytosis={cytosisObject}  >
    function create_default_slot(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*cytosisLoading*/ ctx[3] && create_if_block_1(ctx);
    	let if_block1 = /*cytosisObject*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*cytosisLoading*/ ctx[3]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*cytosisObject*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(20:1) <CytosisWip     options={{       apiKey: 'keygfuzbhXK1VShlR',       baseId: 'appc0M3MdTYATe7RO',       configName: 'content-1',       routeDetails: 'Demo One',     }}     apiKey={'keygfuzbhXK1VShlR'}     baseId={'appc0M3MdTYATe7RO'}     configName={'content-1'}    routeDetails={'Cytosis One'}        bind:isLoading={cytosisLoading}    bind:cytosis={cytosisObject}  >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div2;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let raw0_value = marked_1(/*description*/ ctx[1]) + "";
    	let t2;
    	let h3;
    	let t4;
    	let div1;

    	let raw1_value = marked_1(`
### Cytosis setup

- Create a new table, or duplicate the [Cytosis documentation table](https://airtable.com/shr2ITCNwUa0UCmPH)
- Create another user to Airtable and invite that user to your table with read-only access. You can use an alternate or temporary e-mail address. Open that temporary user's account settings, and create an API key for that user. That API key will protect your Airtable from being vandalized
	- For experimentation purposes, you can use my public user account: public@janzheng.com, apiKey: keygfuzbhXK1VShlR
- Get the Base ID by clicking Help > API Documentation in the Airtable base, then copying the part that starts with "app" \`https://airtable.com/appc0M3MdTYATe7RO/api/docs#curl/introduction\` - (e.g. \`appc0M3MdTYATe7RO\` in this example)
	`) + "";

    	let t5;
    	let cytosiswip;
    	let updating_isLoading;
    	let updating_cytosis;
    	let current;

    	function cytosiswip_isLoading_binding(value) {
    		/*cytosiswip_isLoading_binding*/ ctx[4].call(null, value);
    	}

    	function cytosiswip_cytosis_binding(value) {
    		/*cytosiswip_cytosis_binding*/ ctx[5].call(null, value);
    	}

    	let cytosiswip_props = {
    		options: {
    			apiKey: "keygfuzbhXK1VShlR",
    			baseId: "appc0M3MdTYATe7RO",
    			configName: "content-1",
    			routeDetails: "Demo One"
    		},
    		apiKey: "keygfuzbhXK1VShlR",
    		baseId: "appc0M3MdTYATe7RO",
    		configName: "content-1",
    		routeDetails: "Cytosis One",
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	if (/*cytosisLoading*/ ctx[3] !== void 0) {
    		cytosiswip_props.isLoading = /*cytosisLoading*/ ctx[3];
    	}

    	if (/*cytosisObject*/ ctx[2] !== void 0) {
    		cytosiswip_props.cytosis = /*cytosisObject*/ ctx[2];
    	}

    	cytosiswip = new CytosisWip({ props: cytosiswip_props, $$inline: true });
    	binding_callbacks.push(() => bind(cytosiswip, "isLoading", cytosiswip_isLoading_binding));
    	binding_callbacks.push(() => bind(cytosiswip, "cytosis", cytosiswip_cytosis_binding));

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			h3 = element("h3");
    			h3.textContent = "Basic Usage";
    			t4 = space();
    			div1 = element("div");
    			t5 = space();
    			create_component(cytosiswip.$$.fragment);
    			attr_dev(h2, "class", "svelte-ch92db");
    			add_location(h2, file$2, 3, 1, 45);
    			attr_dev(div0, "class", "svelte-ch92db");
    			add_location(div0, file$2, 4, 1, 65);
    			attr_dev(h3, "class", "Basic-title title svelte-ch92db");
    			add_location(h3, file$2, 7, 1, 108);
    			attr_dev(div1, "class", "Basic-desc desc _margin-bottom-2 svelte-ch92db");
    			add_location(div1, file$2, 9, 1, 157);
    			attr_dev(div2, "class", " svelte-ch92db");
    			add_location(div2, file$2, 2, 0, 29);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h2);
    			append_dev(h2, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			div0.innerHTML = raw0_value;
    			append_dev(div2, t2);
    			append_dev(div2, h3);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			div1.innerHTML = raw1_value;
    			append_dev(div2, t5);
    			mount_component(cytosiswip, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if ((!current || dirty & /*description*/ 2) && raw0_value !== (raw0_value = marked_1(/*description*/ ctx[1]) + "")) div0.innerHTML = raw0_value;			const cytosiswip_changes = {};

    			if (dirty & /*$$scope, cytosisObject, cytosisLoading*/ 76) {
    				cytosiswip_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_isLoading && dirty & /*cytosisLoading*/ 8) {
    				updating_isLoading = true;
    				cytosiswip_changes.isLoading = /*cytosisLoading*/ ctx[3];
    				add_flush_callback(() => updating_isLoading = false);
    			}

    			if (!updating_cytosis && dirty & /*cytosisObject*/ 4) {
    				updating_cytosis = true;
    				cytosiswip_changes.cytosis = /*cytosisObject*/ ctx[2];
    				add_flush_callback(() => updating_cytosis = false);
    			}

    			cytosiswip.$set(cytosiswip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cytosiswip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cytosiswip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(cytosiswip);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	marked_1.setOptions({ gfm: true, breaks: true });
    	let { title = `1. Barebones Demo` } = $$props;
    	let { description = `This demo retrieves a table from the given Base, by reading a record in '_cytosis'` } = $$props;
    	let cytosisObject;
    	let cytosisLoading = false;
    	const writable_props = ["title", "description"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<DemoOne> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DemoOne", $$slots, []);

    	function cytosiswip_isLoading_binding(value) {
    		cytosisLoading = value;
    		$$invalidate(3, cytosisLoading);
    	}

    	function cytosiswip_cytosis_binding(value) {
    		cytosisObject = value;
    		$$invalidate(2, cytosisObject);
    	}

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    	};

    	$$self.$capture_state = () => ({
    		CytosisWip,
    		marked: marked_1,
    		title,
    		description,
    		cytosisObject,
    		cytosisLoading
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("cytosisObject" in $$props) $$invalidate(2, cytosisObject = $$props.cytosisObject);
    		if ("cytosisLoading" in $$props) $$invalidate(3, cytosisLoading = $$props.cytosisLoading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*cytosisObject*/ 4) {
    			 console.log(cytosisObject);
    		}
    	};

    	return [
    		title,
    		description,
    		cytosisObject,
    		cytosisLoading,
    		cytosiswip_isLoading_binding,
    		cytosiswip_cytosis_binding
    	];
    }

    class DemoOne extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { title: 0, description: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DemoOne",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get title() {
    		return this.$$.ctx[0];
    	}

    	set title(title) {
    		this.$set({ title });
    		flush();
    	}

    	get description() {
    		return this.$$.ctx[1];
    	}

    	set description(description) {
    		this.$set({ description });
    		flush();
    	}
    }

    /* src/examples/DemoTwo.svelte generated by Svelte v3.24.0 */

    const { console: console_1$2 } = globals;
    const file$3 = "src/examples/DemoTwo.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (24:3) {#if cytosisLoading}
    function create_if_block_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("... loading Cytosis object ...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(24:3) {#if cytosisLoading}",
    		ctx
    	});

    	return block;
    }

    // (28:3) {#if cytosisObject}
    function create_if_block$1(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = /*items*/ ctx[3];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[7].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items*/ 8) {
    				const each_value = /*items*/ ctx[3];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block, each_1_anchor, get_each_context);
    			}
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(28:3) {#if cytosisObject}",
    		ctx
    	});

    	return block;
    }

    // (30:4) {#each items as item (item.id)}
    function create_each_block(key_1, ctx) {
    	let div;
    	let t0_value = /*item*/ ctx[7].fields["Name"] + "";
    	let t0;
    	let t1;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "svelte-1nnjukx");
    			add_location(div, file$3, 30, 5, 598);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items*/ 8 && t0_value !== (t0_value = /*item*/ ctx[7].fields["Name"] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(30:4) {#each items as item (item.id)}",
    		ctx
    	});

    	return block;
    }

    // (7:2) <CytosisWip      options={{        apiKey: 'keygfuzbhXK1VShlR',        baseId: 'appc0M3MdTYATe7RO',        configName: 'items-all',        routeDetails: 'Demo Two',      }}      apiKey={'keygfuzbhXK1VShlR'}      baseId={'appc0M3MdTYATe7RO'}      configName={'items-all'}     routeDetails={'Demo Two'}          bind:isLoading={cytosisLoading}     bind:cytosis={cytosisObject}   >
    function create_default_slot$1(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*cytosisLoading*/ ctx[4] && create_if_block_1$1(ctx);
    	let if_block1 = /*cytosisObject*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*cytosisLoading*/ ctx[4]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*cytosisObject*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(7:2) <CytosisWip      options={{        apiKey: 'keygfuzbhXK1VShlR',        baseId: 'appc0M3MdTYATe7RO',        configName: 'items-all',        routeDetails: 'Demo Two',      }}      apiKey={'keygfuzbhXK1VShlR'}      baseId={'appc0M3MdTYATe7RO'}      configName={'items-all'}     routeDetails={'Demo Two'}          bind:isLoading={cytosisLoading}     bind:cytosis={cytosisObject}   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let raw_value = marked_1(/*description*/ ctx[1]) + "";
    	let t2;
    	let cytosiswip;
    	let updating_isLoading;
    	let updating_cytosis;
    	let current;

    	function cytosiswip_isLoading_binding(value) {
    		/*cytosiswip_isLoading_binding*/ ctx[5].call(null, value);
    	}

    	function cytosiswip_cytosis_binding(value) {
    		/*cytosiswip_cytosis_binding*/ ctx[6].call(null, value);
    	}

    	let cytosiswip_props = {
    		options: {
    			apiKey: "keygfuzbhXK1VShlR",
    			baseId: "appc0M3MdTYATe7RO",
    			configName: "items-all",
    			routeDetails: "Demo Two"
    		},
    		apiKey: "keygfuzbhXK1VShlR",
    		baseId: "appc0M3MdTYATe7RO",
    		configName: "items-all",
    		routeDetails: "Demo Two",
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	if (/*cytosisLoading*/ ctx[4] !== void 0) {
    		cytosiswip_props.isLoading = /*cytosisLoading*/ ctx[4];
    	}

    	if (/*cytosisObject*/ ctx[2] !== void 0) {
    		cytosiswip_props.cytosis = /*cytosisObject*/ ctx[2];
    	}

    	cytosiswip = new CytosisWip({ props: cytosiswip_props, $$inline: true });
    	binding_callbacks.push(() => bind(cytosiswip, "isLoading", cytosiswip_isLoading_binding));
    	binding_callbacks.push(() => bind(cytosiswip, "cytosis", cytosiswip_cytosis_binding));

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			create_component(cytosiswip.$$.fragment);
    			attr_dev(h2, "class", "svelte-1nnjukx");
    			add_location(h2, file$3, 3, 2, 20);
    			attr_dev(div0, "class", "svelte-1nnjukx");
    			add_location(div0, file$3, 4, 2, 41);
    			attr_dev(div1, "class", " svelte-1nnjukx");
    			add_location(div1, file$3, 2, 1, 3);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			div0.innerHTML = raw_value;
    			append_dev(div1, t2);
    			mount_component(cytosiswip, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if ((!current || dirty & /*description*/ 2) && raw_value !== (raw_value = marked_1(/*description*/ ctx[1]) + "")) div0.innerHTML = raw_value;			const cytosiswip_changes = {};

    			if (dirty & /*$$scope, items, cytosisObject, cytosisLoading*/ 1052) {
    				cytosiswip_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_isLoading && dirty & /*cytosisLoading*/ 16) {
    				updating_isLoading = true;
    				cytosiswip_changes.isLoading = /*cytosisLoading*/ ctx[4];
    				add_flush_callback(() => updating_isLoading = false);
    			}

    			if (!updating_cytosis && dirty & /*cytosisObject*/ 4) {
    				updating_cytosis = true;
    				cytosiswip_changes.cytosis = /*cytosisObject*/ ctx[2];
    				add_flush_callback(() => updating_cytosis = false);
    			}

    			cytosiswip.$set(cytosiswip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cytosiswip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cytosiswip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(cytosiswip);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	marked_1.setOptions({ gfm: true, breaks: true });
    	let { title = `2. Get Items Demo` } = $$props;
    	let { description = `This demo retrieves a ton of items from the Items Table in a non-paginated manner` } = $$props;
    	let cytosisObject;
    	let items;
    	let cytosisLoading = false;
    	const writable_props = ["title", "description"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<DemoTwo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DemoTwo", $$slots, []);

    	function cytosiswip_isLoading_binding(value) {
    		cytosisLoading = value;
    		$$invalidate(4, cytosisLoading);
    	}

    	function cytosiswip_cytosis_binding(value) {
    		cytosisObject = value;
    		$$invalidate(2, cytosisObject);
    	}

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    	};

    	$$self.$capture_state = () => ({
    		CytosisWip,
    		marked: marked_1,
    		title,
    		description,
    		cytosisObject,
    		items,
    		cytosisLoading
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("cytosisObject" in $$props) $$invalidate(2, cytosisObject = $$props.cytosisObject);
    		if ("items" in $$props) $$invalidate(3, items = $$props.items);
    		if ("cytosisLoading" in $$props) $$invalidate(4, cytosisLoading = $$props.cytosisLoading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*cytosisObject*/ 4) {
    			 if (cytosisObject) {
    				console.log("Demo Two:", cytosisObject);

    				// cytosisObject.getNextPage()
    				$$invalidate(3, items = cytosisObject["results"]["Items Table"]);
    			}
    		}
    	};

    	return [
    		title,
    		description,
    		cytosisObject,
    		items,
    		cytosisLoading,
    		cytosiswip_isLoading_binding,
    		cytosiswip_cytosis_binding
    	];
    }

    class DemoTwo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { title: 0, description: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DemoTwo",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get title() {
    		throw new Error("<DemoTwo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<DemoTwo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<DemoTwo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<DemoTwo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/CytosisPaginate.svelte generated by Svelte v3.24.0 */

    const { console: console_1$3 } = globals;
    const file$4 = "src/components/CytosisPaginate.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let div_id_value;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "Cytosis");
    			attr_dev(div, "id", div_id_value = "cytosis-" + /*configName*/ ctx[0]);
    			add_location(div, file$4, 14, 0, 222);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*configName*/ 1 && div_id_value !== (div_id_value = "cytosis-" + /*configName*/ ctx[0])) {
    				attr_dev(div, "id", div_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { isLoading = false } = $$props;
    	let { isError = false } = $$props;

    	let { apiKey } = $$props,
    		{ baseId } = $$props,
    		{ configName } = $$props,
    		{ routeDetails } = $$props;

    	let { cytosis } = $$props; // the entire cytosis object
    	let { data } = $$props; // sets the table indicated in 'tableName'; convenient

    	onMount(async () => {
    		try {
    			$$invalidate(1, isLoading = true);

    			$$invalidate(3, cytosis = await new Cytosis({
    					apiKey,
    					baseId,
    					configName,
    					routeDetails,
    					getConfigOnly: true
    				}));

    			// Cytosis.getPageTable({
    			// 	cytosis,
    			// 	routeDetails: 'Pagination demo',
    			// }).then((_results) => {
    			// 	// console.log('getPageTable page one:', _results)
    			// 	isLoading = false
    			// 	data = _results
    			// 	// items = [... items, ... await results.getNextPage()]
    			// })
    			Cytosis.getPageTable({ cytosis, routeDetails: "Pagination demo" }, _results => {
    				$$invalidate(1, isLoading = false);
    				$$invalidate(4, data = _results);
    			});
    		} catch(err) {
    			$$invalidate(1, isLoading = false);
    			$$invalidate(2, isError = true);
    			console.error("[Cytosis Data Error]:", err);
    			return Promise.reject();
    		}
    	});

    	const writable_props = [
    		"isLoading",
    		"isError",
    		"apiKey",
    		"baseId",
    		"configName",
    		"routeDetails",
    		"cytosis",
    		"data"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<CytosisPaginate> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CytosisPaginate", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("isLoading" in $$props) $$invalidate(1, isLoading = $$props.isLoading);
    		if ("isError" in $$props) $$invalidate(2, isError = $$props.isError);
    		if ("apiKey" in $$props) $$invalidate(5, apiKey = $$props.apiKey);
    		if ("baseId" in $$props) $$invalidate(6, baseId = $$props.baseId);
    		if ("configName" in $$props) $$invalidate(0, configName = $$props.configName);
    		if ("routeDetails" in $$props) $$invalidate(7, routeDetails = $$props.routeDetails);
    		if ("cytosis" in $$props) $$invalidate(3, cytosis = $$props.cytosis);
    		if ("data" in $$props) $$invalidate(4, data = $$props.data);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Cytosis,
    		isLoading,
    		isError,
    		apiKey,
    		baseId,
    		configName,
    		routeDetails,
    		cytosis,
    		data
    	});

    	$$self.$inject_state = $$props => {
    		if ("isLoading" in $$props) $$invalidate(1, isLoading = $$props.isLoading);
    		if ("isError" in $$props) $$invalidate(2, isError = $$props.isError);
    		if ("apiKey" in $$props) $$invalidate(5, apiKey = $$props.apiKey);
    		if ("baseId" in $$props) $$invalidate(6, baseId = $$props.baseId);
    		if ("configName" in $$props) $$invalidate(0, configName = $$props.configName);
    		if ("routeDetails" in $$props) $$invalidate(7, routeDetails = $$props.routeDetails);
    		if ("cytosis" in $$props) $$invalidate(3, cytosis = $$props.cytosis);
    		if ("data" in $$props) $$invalidate(4, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		configName,
    		isLoading,
    		isError,
    		cytosis,
    		data,
    		apiKey,
    		baseId,
    		routeDetails,
    		$$scope,
    		$$slots
    	];
    }

    class CytosisPaginate extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			isLoading: 1,
    			isError: 2,
    			apiKey: 5,
    			baseId: 6,
    			configName: 0,
    			routeDetails: 7,
    			cytosis: 3,
    			data: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CytosisPaginate",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*apiKey*/ ctx[5] === undefined && !("apiKey" in props)) {
    			console_1$3.warn("<CytosisPaginate> was created without expected prop 'apiKey'");
    		}

    		if (/*baseId*/ ctx[6] === undefined && !("baseId" in props)) {
    			console_1$3.warn("<CytosisPaginate> was created without expected prop 'baseId'");
    		}

    		if (/*configName*/ ctx[0] === undefined && !("configName" in props)) {
    			console_1$3.warn("<CytosisPaginate> was created without expected prop 'configName'");
    		}

    		if (/*routeDetails*/ ctx[7] === undefined && !("routeDetails" in props)) {
    			console_1$3.warn("<CytosisPaginate> was created without expected prop 'routeDetails'");
    		}

    		if (/*cytosis*/ ctx[3] === undefined && !("cytosis" in props)) {
    			console_1$3.warn("<CytosisPaginate> was created without expected prop 'cytosis'");
    		}

    		if (/*data*/ ctx[4] === undefined && !("data" in props)) {
    			console_1$3.warn("<CytosisPaginate> was created without expected prop 'data'");
    		}
    	}

    	get isLoading() {
    		throw new Error("<CytosisPaginate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isLoading(value) {
    		throw new Error("<CytosisPaginate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isError() {
    		throw new Error("<CytosisPaginate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isError(value) {
    		throw new Error("<CytosisPaginate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get apiKey() {
    		throw new Error("<CytosisPaginate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set apiKey(value) {
    		throw new Error("<CytosisPaginate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get baseId() {
    		throw new Error("<CytosisPaginate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set baseId(value) {
    		throw new Error("<CytosisPaginate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get configName() {
    		throw new Error("<CytosisPaginate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set configName(value) {
    		throw new Error("<CytosisPaginate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get routeDetails() {
    		throw new Error("<CytosisPaginate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routeDetails(value) {
    		throw new Error("<CytosisPaginate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cytosis() {
    		throw new Error("<CytosisPaginate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cytosis(value) {
    		throw new Error("<CytosisPaginate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<CytosisPaginate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<CytosisPaginate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/examples/DemoThree.svelte generated by Svelte v3.24.0 */

    const { console: console_1$4 } = globals;
    const file$5 = "src/examples/DemoThree.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (25:3) {#if cytosisLoading}
    function create_if_block_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("... loading Cytosis object ...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(25:3) {#if cytosisLoading}",
    		ctx
    	});

    	return block;
    }

    // (29:3) {#if data}
    function create_if_block$2(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*data*/ ctx[3].results.length + "";
    	let t1;
    	let t2;
    	let t3;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let if_block = /*data*/ ctx[3] && create_if_block_1$2(ctx);
    	let each_value = /*data*/ ctx[3].results;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[11].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("total: ");
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(div, "class", "svelte-19fb33v");
    			add_location(div, file$5, 30, 4, 586);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t3, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 8 && t1_value !== (t1_value = /*data*/ ctx[3].results.length + "")) set_data_dev(t1, t1_value);

    			if (/*data*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					if_block.m(t3.parentNode, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*data*/ 8) {
    				const each_value = /*data*/ ctx[3].results;
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$1, each_1_anchor, get_each_context$1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(29:3) {#if data}",
    		ctx
    	});

    	return block;
    }

    // (33:4) {#if data}
    function create_if_block_1$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (!/*data*/ ctx[3].isDone) return create_if_block_2;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if_block.c();
    			attr_dev(button, "class", "__outline __short __width_max _margin-top svelte-19fb33v");
    			add_location(button, file$5, 33, 5, 647);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if_block.m(button, null);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(button, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(33:4) {#if data}",
    		ctx
    	});

    	return block;
    }

    // (43:5) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("That's all folks!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:5) {#if !data.isDone}
    function create_if_block_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Get Next Page");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(41:5) {#if !data.isDone}",
    		ctx
    	});

    	return block;
    }

    // (50:4) {#each data.results as item (item.id)}
    function create_each_block$1(key_1, ctx) {
    	let div;
    	let t0_value = /*item*/ ctx[11].fields["Name"] + "";
    	let t0;
    	let t1;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "svelte-19fb33v");
    			add_location(div, file$5, 50, 5, 1040);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 8 && t0_value !== (t0_value = /*item*/ ctx[11].fields["Name"] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(50:4) {#each data.results as item (item.id)}",
    		ctx
    	});

    	return block;
    }

    // (7:2) <CytosisPaginate      options={{        apiKey: 'keygfuzbhXK1VShlR',        baseId: 'appc0M3MdTYATe7RO',        configName: 'items-paged',        routeDetails: 'Demo Three',      }}      apiKey={'keygfuzbhXK1VShlR'}      baseId={'appc0M3MdTYATe7RO'}      configName={'items-paged'}     routeDetails={'Demo Three'}          bind:isLoading={cytosisLoading}     bind:cytosis={cytosisObject}     bind:data={data}   >
    function create_default_slot$2(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*cytosisLoading*/ ctx[4] && create_if_block_3(ctx);
    	let if_block1 = /*data*/ ctx[3] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*cytosisLoading*/ ctx[4]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*data*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(7:2) <CytosisPaginate      options={{        apiKey: 'keygfuzbhXK1VShlR',        baseId: 'appc0M3MdTYATe7RO',        configName: 'items-paged',        routeDetails: 'Demo Three',      }}      apiKey={'keygfuzbhXK1VShlR'}      baseId={'appc0M3MdTYATe7RO'}      configName={'items-paged'}     routeDetails={'Demo Three'}          bind:isLoading={cytosisLoading}     bind:cytosis={cytosisObject}     bind:data={data}   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let raw_value = marked_1(/*description*/ ctx[1]) + "";
    	let t2;
    	let cytosispaginate;
    	let updating_isLoading;
    	let updating_cytosis;
    	let updating_data;
    	let current;

    	function cytosispaginate_isLoading_binding(value) {
    		/*cytosispaginate_isLoading_binding*/ ctx[6].call(null, value);
    	}

    	function cytosispaginate_cytosis_binding(value) {
    		/*cytosispaginate_cytosis_binding*/ ctx[7].call(null, value);
    	}

    	function cytosispaginate_data_binding(value) {
    		/*cytosispaginate_data_binding*/ ctx[8].call(null, value);
    	}

    	let cytosispaginate_props = {
    		options: {
    			apiKey: "keygfuzbhXK1VShlR",
    			baseId: "appc0M3MdTYATe7RO",
    			configName: "items-paged",
    			routeDetails: "Demo Three"
    		},
    		apiKey: "keygfuzbhXK1VShlR",
    		baseId: "appc0M3MdTYATe7RO",
    		configName: "items-paged",
    		routeDetails: "Demo Three",
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	if (/*cytosisLoading*/ ctx[4] !== void 0) {
    		cytosispaginate_props.isLoading = /*cytosisLoading*/ ctx[4];
    	}

    	if (/*cytosisObject*/ ctx[2] !== void 0) {
    		cytosispaginate_props.cytosis = /*cytosisObject*/ ctx[2];
    	}

    	if (/*data*/ ctx[3] !== void 0) {
    		cytosispaginate_props.data = /*data*/ ctx[3];
    	}

    	cytosispaginate = new CytosisPaginate({
    			props: cytosispaginate_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(cytosispaginate, "isLoading", cytosispaginate_isLoading_binding));
    	binding_callbacks.push(() => bind(cytosispaginate, "cytosis", cytosispaginate_cytosis_binding));
    	binding_callbacks.push(() => bind(cytosispaginate, "data", cytosispaginate_data_binding));

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			create_component(cytosispaginate.$$.fragment);
    			attr_dev(h2, "class", "svelte-19fb33v");
    			add_location(h2, file$5, 3, 2, 20);
    			attr_dev(div0, "class", "svelte-19fb33v");
    			add_location(div0, file$5, 4, 2, 41);
    			attr_dev(div1, "class", " svelte-19fb33v");
    			add_location(div1, file$5, 2, 1, 3);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			div0.innerHTML = raw_value;
    			append_dev(div1, t2);
    			mount_component(cytosispaginate, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if ((!current || dirty & /*description*/ 2) && raw_value !== (raw_value = marked_1(/*description*/ ctx[1]) + "")) div0.innerHTML = raw_value;			const cytosispaginate_changes = {};

    			if (dirty & /*$$scope, data, cytosisLoading*/ 16408) {
    				cytosispaginate_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_isLoading && dirty & /*cytosisLoading*/ 16) {
    				updating_isLoading = true;
    				cytosispaginate_changes.isLoading = /*cytosisLoading*/ ctx[4];
    				add_flush_callback(() => updating_isLoading = false);
    			}

    			if (!updating_cytosis && dirty & /*cytosisObject*/ 4) {
    				updating_cytosis = true;
    				cytosispaginate_changes.cytosis = /*cytosisObject*/ ctx[2];
    				add_flush_callback(() => updating_cytosis = false);
    			}

    			if (!updating_data && dirty & /*data*/ 8) {
    				updating_data = true;
    				cytosispaginate_changes.data = /*data*/ ctx[3];
    				add_flush_callback(() => updating_data = false);
    			}

    			cytosispaginate.$set(cytosispaginate_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cytosispaginate.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cytosispaginate.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(cytosispaginate);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	marked_1.setOptions({ gfm: true, breaks: true });
    	let { title = `3. Paginated Items Demo` } = $$props;
    	let { description = `This demo shows how to use 'getPageTable'` } = $$props;
    	let cytosisObject;
    	let data, items, isDone;
    	let cytosisLoading = true;
    	const writable_props = ["title", "description"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<DemoThree> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DemoThree", $$slots, []);

    	const click_handler = () => {
    		data.getNextPage().then(({ results, isDone }) => {
    			$$invalidate(3, data.results = results, data);
    			if (isDone) $$invalidate(3, data.isDone = isDone, data);
    		});
    	};

    	function cytosispaginate_isLoading_binding(value) {
    		cytosisLoading = value;
    		$$invalidate(4, cytosisLoading);
    	}

    	function cytosispaginate_cytosis_binding(value) {
    		cytosisObject = value;
    		$$invalidate(2, cytosisObject);
    	}

    	function cytosispaginate_data_binding(value) {
    		data = value;
    		$$invalidate(3, data);
    	}

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    	};

    	$$self.$capture_state = () => ({
    		CytosisPaginate,
    		marked: marked_1,
    		title,
    		description,
    		cytosisObject,
    		data,
    		items,
    		isDone,
    		cytosisLoading
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("cytosisObject" in $$props) $$invalidate(2, cytosisObject = $$props.cytosisObject);
    		if ("data" in $$props) $$invalidate(3, data = $$props.data);
    		if ("items" in $$props) items = $$props.items;
    		if ("isDone" in $$props) isDone = $$props.isDone;
    		if ("cytosisLoading" in $$props) $$invalidate(4, cytosisLoading = $$props.cytosisLoading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data*/ 8) {
    			 if (data) {
    				console.log("Sandbox Results:", data);
    			}
    		}
    	};

    	return [
    		title,
    		description,
    		cytosisObject,
    		data,
    		cytosisLoading,
    		click_handler,
    		cytosispaginate_isLoading_binding,
    		cytosispaginate_cytosis_binding,
    		cytosispaginate_data_binding
    	];
    }

    class DemoThree extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { title: 0, description: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DemoThree",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get title() {
    		throw new Error("<DemoThree>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<DemoThree>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<DemoThree>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<DemoThree>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/examples/DemoFour.svelte generated by Svelte v3.24.0 */

    const { console: console_1$5 } = globals;
    const file$6 = "src/examples/DemoFour.svelte";

    // (23:2) {#if cytosisLoading}
    function create_if_block_1$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("... loading Cytosis object ...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(23:2) {#if cytosisLoading}",
    		ctx
    	});

    	return block;
    }

    // (27:2) {#if cytosisObject}
    function create_if_block$3(ctx) {
    	let div0;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let div1;
    	let raw_value = marked_1(/*cytosisObject*/ ctx[3].results["Site Content"][0].fields["Content"]) + "";
    	let t4;
    	let div2;
    	let textarea;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Re-initialize Config";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Reload Data";
    			t3 = space();
    			div1 = element("div");
    			t4 = space();
    			div2 = element("div");
    			textarea = element("textarea");
    			attr_dev(button0, "class", "_button __short __outline _margin-none svelte-1ncc45f");
    			add_location(button0, file$6, 28, 4, 642);
    			attr_dev(button1, "class", "_button __short __outline _margin-none svelte-1ncc45f");
    			add_location(button1, file$6, 34, 4, 957);
    			attr_dev(div0, "class", "_grid-2-xs _margin-bottom svelte-1ncc45f");
    			add_location(div0, file$6, 27, 3, 598);
    			attr_dev(div1, "class", "_card _padding __flat svelte-1ncc45f");
    			add_location(div1, file$6, 43, 4, 1240);
    			attr_dev(textarea, "class", "configTextarea svelte-1ncc45f");
    			attr_dev(textarea, "name", "config");
    			attr_dev(textarea, "rows", "30");
    			textarea.value = /*configJson*/ ctx[5];
    			add_location(textarea, file$6, 46, 4, 1393);
    			attr_dev(div2, "class", "_margin-bottom svelte-1ncc45f");
    			add_location(div2, file$6, 45, 3, 1360);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, button0);
    			append_dev(div0, t1);
    			append_dev(div0, button1);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			div1.innerHTML = raw_value;
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, textarea);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[7], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[8], false, false, false),
    					listen_dev(textarea, "change", /*change_handler*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cytosisObject*/ 8 && raw_value !== (raw_value = marked_1(/*cytosisObject*/ ctx[3].results["Site Content"][0].fields["Content"]) + "")) div1.innerHTML = raw_value;
    			if (dirty & /*configJson*/ 32) {
    				prop_dev(textarea, "value", /*configJson*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(27:2) {#if cytosisObject}",
    		ctx
    	});

    	return block;
    }

    // (8:1) <CytosisWip     options={{       apiKey: 'keygfuzbhXK1VShlR',       baseId: 'appc0M3MdTYATe7RO',       configName: 'content-1',       routeDetails: 'Demo Four',     }}     apiKey={'keygfuzbhXK1VShlR'}     baseId={'appc0M3MdTYATe7RO'}     configName={'content-1'}    routeDetails={'Cytosis Four'}    bind:isLoading={cytosisLoading}    bind:cytosis={cytosisObject}  >
    function create_default_slot$3(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*cytosisLoading*/ ctx[4] && create_if_block_1$3(ctx);
    	let if_block1 = /*cytosisObject*/ ctx[3] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*cytosisLoading*/ ctx[4]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*cytosisObject*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(8:1) <CytosisWip     options={{       apiKey: 'keygfuzbhXK1VShlR',       baseId: 'appc0M3MdTYATe7RO',       configName: 'content-1',       routeDetails: 'Demo Four',     }}     apiKey={'keygfuzbhXK1VShlR'}     baseId={'appc0M3MdTYATe7RO'}     configName={'content-1'}    routeDetails={'Cytosis Four'}    bind:isLoading={cytosisLoading}    bind:cytosis={cytosisObject}  >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div2;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let raw0_value = marked_1(/*description*/ ctx[1]) + "";
    	let t2;
    	let div1;
    	let raw1_value = marked_1(/*more*/ ctx[2]) + "";
    	let t3;
    	let cytosiswip;
    	let updating_isLoading;
    	let updating_cytosis;
    	let current;

    	function cytosiswip_isLoading_binding(value) {
    		/*cytosiswip_isLoading_binding*/ ctx[10].call(null, value);
    	}

    	function cytosiswip_cytosis_binding(value) {
    		/*cytosiswip_cytosis_binding*/ ctx[11].call(null, value);
    	}

    	let cytosiswip_props = {
    		options: {
    			apiKey: "keygfuzbhXK1VShlR",
    			baseId: "appc0M3MdTYATe7RO",
    			configName: "content-1",
    			routeDetails: "Demo Four"
    		},
    		apiKey: "keygfuzbhXK1VShlR",
    		baseId: "appc0M3MdTYATe7RO",
    		configName: "content-1",
    		routeDetails: "Cytosis Four",
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	};

    	if (/*cytosisLoading*/ ctx[4] !== void 0) {
    		cytosiswip_props.isLoading = /*cytosisLoading*/ ctx[4];
    	}

    	if (/*cytosisObject*/ ctx[3] !== void 0) {
    		cytosiswip_props.cytosis = /*cytosisObject*/ ctx[3];
    	}

    	cytosiswip = new CytosisWip({ props: cytosiswip_props, $$inline: true });
    	binding_callbacks.push(() => bind(cytosiswip, "isLoading", cytosiswip_isLoading_binding));
    	binding_callbacks.push(() => bind(cytosiswip, "cytosis", cytosiswip_cytosis_binding));

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			div1 = element("div");
    			t3 = space();
    			create_component(cytosiswip.$$.fragment);
    			attr_dev(h2, "class", "svelte-1ncc45f");
    			add_location(h2, file$6, 3, 1, 45);
    			attr_dev(div0, "class", "svelte-1ncc45f");
    			add_location(div0, file$6, 4, 1, 65);
    			attr_dev(div1, "class", "svelte-1ncc45f");
    			add_location(div1, file$6, 5, 1, 106);
    			attr_dev(div2, "class", " svelte-1ncc45f");
    			add_location(div2, file$6, 2, 0, 29);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h2);
    			append_dev(h2, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			div0.innerHTML = raw0_value;
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			div1.innerHTML = raw1_value;
    			append_dev(div2, t3);
    			mount_component(cytosiswip, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if ((!current || dirty & /*description*/ 2) && raw0_value !== (raw0_value = marked_1(/*description*/ ctx[1]) + "")) div0.innerHTML = raw0_value;			if ((!current || dirty & /*more*/ 4) && raw1_value !== (raw1_value = marked_1(/*more*/ ctx[2]) + "")) div1.innerHTML = raw1_value;			const cytosiswip_changes = {};

    			if (dirty & /*$$scope, configJson, newConfigObject, cytosisObject, cytosisLoading*/ 8312) {
    				cytosiswip_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_isLoading && dirty & /*cytosisLoading*/ 16) {
    				updating_isLoading = true;
    				cytosiswip_changes.isLoading = /*cytosisLoading*/ ctx[4];
    				add_flush_callback(() => updating_isLoading = false);
    			}

    			if (!updating_cytosis && dirty & /*cytosisObject*/ 8) {
    				updating_cytosis = true;
    				cytosiswip_changes.cytosis = /*cytosisObject*/ ctx[3];
    				add_flush_callback(() => updating_cytosis = false);
    			}

    			cytosiswip.$set(cytosiswip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cytosiswip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cytosiswip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(cytosiswip);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	marked_1.setOptions({ gfm: true, breaks: true });
    	let { title = `4. Config & data reload/refresh` } = $$props;
    	let { description = `This demo shows how to retrieve a table from a custom or given config object` } = $$props;

    	let { more = `
This demo by default gets a config from 'content-1' from the '_cytosis' table — you can change the view from 'content-1--view' to 'content-2--view' see different content get pulled in. Make sure to reload config and data!

	` } = $$props;

    	let cytosisObject;
    	let cytosisLoading = false;
    	let configObject, configJson, newConfigObject;
    	const writable_props = ["title", "description", "more"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$5.warn(`<DemoFour> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DemoFour", $$slots, []);

    	const click_handler = () => {
    		console.log("re-initializing config", cytosisObject, newConfigObject);
    		const config = newConfigObject || cytosisObject.configObject;
    		Cytosis.initFromConfig(cytosisObject, config);
    	};

    	const click_handler_1 = () => {
    		console.log("reloading data");

    		Cytosis.loadCytosisData(cytosisObject).then(cytosis => {
    			$$invalidate(3, cytosisObject = cytosis); // force reactivity
    		});
    	};

    	const change_handler = () => {
    		$$invalidate(6, newConfigObject = JSON.parse(this.value));
    	};

    	function cytosiswip_isLoading_binding(value) {
    		cytosisLoading = value;
    		$$invalidate(4, cytosisLoading);
    	}

    	function cytosiswip_cytosis_binding(value) {
    		cytosisObject = value;
    		$$invalidate(3, cytosisObject);
    	}

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("more" in $$props) $$invalidate(2, more = $$props.more);
    	};

    	$$self.$capture_state = () => ({
    		CytosisWip,
    		Cytosis,
    		marked: marked_1,
    		title,
    		description,
    		more,
    		cytosisObject,
    		cytosisLoading,
    		configObject,
    		configJson,
    		newConfigObject
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("more" in $$props) $$invalidate(2, more = $$props.more);
    		if ("cytosisObject" in $$props) $$invalidate(3, cytosisObject = $$props.cytosisObject);
    		if ("cytosisLoading" in $$props) $$invalidate(4, cytosisLoading = $$props.cytosisLoading);
    		if ("configObject" in $$props) $$invalidate(12, configObject = $$props.configObject);
    		if ("configJson" in $$props) $$invalidate(5, configJson = $$props.configJson);
    		if ("newConfigObject" in $$props) $$invalidate(6, newConfigObject = $$props.newConfigObject);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*cytosisObject, configObject*/ 4104) {
    			 if (cytosisObject) {
    				$$invalidate(12, configObject = cytosisObject.configObject);
    				$$invalidate(5, configJson = JSON.stringify(configObject, undefined, 4));
    			}
    		}
    	};

    	return [
    		title,
    		description,
    		more,
    		cytosisObject,
    		cytosisLoading,
    		configJson,
    		newConfigObject,
    		click_handler,
    		click_handler_1,
    		change_handler,
    		cytosiswip_isLoading_binding,
    		cytosiswip_cytosis_binding
    	];
    }

    class DemoFour extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { title: 0, description: 1, more: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DemoFour",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get title() {
    		return this.$$.ctx[0];
    	}

    	set title(title) {
    		this.$set({ title });
    		flush();
    	}

    	get description() {
    		return this.$$.ctx[1];
    	}

    	set description(description) {
    		this.$set({ description });
    		flush();
    	}

    	get more() {
    		return this.$$.ctx[2];
    	}

    	set more(more) {
    		this.$set({ more });
    		flush();
    	}
    }

    /* src/examples/DemoFive.svelte generated by Svelte v3.24.0 */

    const { console: console_1$6 } = globals;
    const file$7 = "src/examples/DemoFive.svelte";

    // (29:1) {#if loadCytosis}
    function create_if_block$4(ctx) {
    	let cytosiswip;
    	let updating_isLoading;
    	let updating_cytosis;
    	let current;

    	function cytosiswip_isLoading_binding(value) {
    		/*cytosiswip_isLoading_binding*/ ctx[9].call(null, value);
    	}

    	function cytosiswip_cytosis_binding(value) {
    		/*cytosiswip_cytosis_binding*/ ctx[10].call(null, value);
    	}

    	let cytosiswip_props = {
    		options: {
    			apiKey: "keygfuzbhXK1VShlR",
    			baseId: "appc0M3MdTYATe7RO",
    			bases: /*bases*/ ctx[4],
    			routeDetails: "Demo Five"
    		},
    		apiKey: "keygfuzbhXK1VShlR",
    		baseId: "appc0M3MdTYATe7RO",
    		bases: /*bases*/ ctx[4],
    		routeDetails: "Cytosis Five",
    		$$slots: { default: [create_default_slot$4] },
    		$$scope: { ctx }
    	};

    	if (/*cytosisLoading*/ ctx[6] !== void 0) {
    		cytosiswip_props.isLoading = /*cytosisLoading*/ ctx[6];
    	}

    	if (/*cytosisObject*/ ctx[5] !== void 0) {
    		cytosiswip_props.cytosis = /*cytosisObject*/ ctx[5];
    	}

    	cytosiswip = new CytosisWip({ props: cytosiswip_props, $$inline: true });
    	binding_callbacks.push(() => bind(cytosiswip, "isLoading", cytosiswip_isLoading_binding));
    	binding_callbacks.push(() => bind(cytosiswip, "cytosis", cytosiswip_cytosis_binding));

    	const block = {
    		c: function create() {
    			create_component(cytosiswip.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cytosiswip, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const cytosiswip_changes = {};

    			if (dirty & /*bases*/ 16) cytosiswip_changes.options = {
    				apiKey: "keygfuzbhXK1VShlR",
    				baseId: "appc0M3MdTYATe7RO",
    				bases: /*bases*/ ctx[4],
    				routeDetails: "Demo Five"
    			};

    			if (dirty & /*bases*/ 16) cytosiswip_changes.bases = /*bases*/ ctx[4];

    			if (dirty & /*$$scope, cytosisObject, cytosisLoading*/ 2144) {
    				cytosiswip_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_isLoading && dirty & /*cytosisLoading*/ 64) {
    				updating_isLoading = true;
    				cytosiswip_changes.isLoading = /*cytosisLoading*/ ctx[6];
    				add_flush_callback(() => updating_isLoading = false);
    			}

    			if (!updating_cytosis && dirty & /*cytosisObject*/ 32) {
    				updating_cytosis = true;
    				cytosiswip_changes.cytosis = /*cytosisObject*/ ctx[5];
    				add_flush_callback(() => updating_cytosis = false);
    			}

    			cytosiswip.$set(cytosiswip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cytosiswip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cytosiswip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cytosiswip, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(29:1) {#if loadCytosis}",
    		ctx
    	});

    	return block;
    }

    // (46:3) {#if cytosisLoading}
    function create_if_block_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("... loading Cytosis object ...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(46:3) {#if cytosisLoading}",
    		ctx
    	});

    	return block;
    }

    // (50:3) {#if cytosisObject}
    function create_if_block_1$4(ctx) {
    	let div;
    	let raw_value = marked_1(/*cytosisObject*/ ctx[5].results["Site Content"][0].fields["Content"]) + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "_card _padding __flat svelte-1o2ynun");
    			add_location(div, file$7, 51, 5, 1058);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cytosisObject*/ 32 && raw_value !== (raw_value = marked_1(/*cytosisObject*/ ctx[5].results["Site Content"][0].fields["Content"]) + "")) div.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(50:3) {#if cytosisObject}",
    		ctx
    	});

    	return block;
    }

    // (30:2) <CytosisWip      options={{        apiKey: 'keygfuzbhXK1VShlR',        baseId: 'appc0M3MdTYATe7RO',        bases:  bases,        routeDetails: 'Demo Five',      }}      apiKey={'keygfuzbhXK1VShlR'}      baseId={'appc0M3MdTYATe7RO'}     bases={bases}     routeDetails={'Cytosis Five'}          bind:isLoading={cytosisLoading}     bind:cytosis={cytosisObject}   >
    function create_default_slot$4(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*cytosisLoading*/ ctx[6] && create_if_block_2$1(ctx);
    	let if_block1 = /*cytosisObject*/ ctx[5] && create_if_block_1$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*cytosisLoading*/ ctx[6]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*cytosisObject*/ ctx[5]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$4(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(30:2) <CytosisWip      options={{        apiKey: 'keygfuzbhXK1VShlR',        baseId: 'appc0M3MdTYATe7RO',        bases:  bases,        routeDetails: 'Demo Five',      }}      apiKey={'keygfuzbhXK1VShlR'}      baseId={'appc0M3MdTYATe7RO'}     bases={bases}     routeDetails={'Cytosis Five'}          bind:isLoading={cytosisLoading}     bind:cytosis={cytosisObject}   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div4;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let raw0_value = marked_1(/*description*/ ctx[1]) + "";
    	let t2;
    	let div1;
    	let raw1_value = marked_1(/*more*/ ctx[2]) + "";
    	let t3;
    	let div3;
    	let textarea;
    	let textarea_value_value;
    	let t4;
    	let div2;
    	let button;
    	let t6;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*loadCytosis*/ ctx[3] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			div1 = element("div");
    			t3 = space();
    			div3 = element("div");
    			textarea = element("textarea");
    			t4 = space();
    			div2 = element("div");
    			button = element("button");
    			button.textContent = "Load Cytosis";
    			t6 = space();
    			if (if_block) if_block.c();
    			attr_dev(h2, "class", "svelte-1o2ynun");
    			add_location(h2, file$7, 3, 1, 45);
    			attr_dev(div0, "class", "svelte-1o2ynun");
    			add_location(div0, file$7, 4, 1, 65);
    			attr_dev(div1, "class", "svelte-1o2ynun");
    			add_location(div1, file$7, 5, 1, 106);
    			attr_dev(textarea, "class", "configTextarea svelte-1o2ynun");
    			attr_dev(textarea, "name", "config");
    			attr_dev(textarea, "rows", "11");
    			textarea.value = textarea_value_value = JSON.stringify(/*bases*/ ctx[4], undefined, 4);
    			add_location(textarea, file$7, 10, 2, 187);
    			attr_dev(button, "class", "_button __short __outline __width-full _margin-none svelte-1o2ynun");
    			add_location(button, file$7, 19, 3, 406);
    			attr_dev(div2, "class", " svelte-1o2ynun");
    			add_location(div2, file$7, 18, 2, 388);
    			attr_dev(div3, "class", "_grid-2-1-xs _margin-bottom svelte-1o2ynun");
    			add_location(div3, file$7, 8, 1, 142);
    			attr_dev(div4, "class", " svelte-1o2ynun");
    			add_location(div4, file$7, 2, 0, 29);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, h2);
    			append_dev(h2, t0);
    			append_dev(div4, t1);
    			append_dev(div4, div0);
    			div0.innerHTML = raw0_value;
    			append_dev(div4, t2);
    			append_dev(div4, div1);
    			div1.innerHTML = raw1_value;
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, textarea);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, button);
    			append_dev(div4, t6);
    			if (if_block) if_block.m(div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "change", /*change_handler*/ ctx[7], false, false, false),
    					listen_dev(button, "click", /*click_handler*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if ((!current || dirty & /*description*/ 2) && raw0_value !== (raw0_value = marked_1(/*description*/ ctx[1]) + "")) div0.innerHTML = raw0_value;			if ((!current || dirty & /*more*/ 4) && raw1_value !== (raw1_value = marked_1(/*more*/ ctx[2]) + "")) div1.innerHTML = raw1_value;
    			if (!current || dirty & /*bases*/ 16 && textarea_value_value !== (textarea_value_value = JSON.stringify(/*bases*/ ctx[4], undefined, 4))) {
    				prop_dev(textarea, "value", textarea_value_value);
    			}

    			if (/*loadCytosis*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*loadCytosis*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div4, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	marked_1.setOptions({ gfm: true, breaks: true });
    	let loadCytosis = false; // gate Cytosis from loading
    	let { title = `5. Bypassing config and directly setting your bases ` } = $$props;
    	let { description = `This demo shows how to completely bypass config, to speed up loading` } = $$props;

    	let { more = `
This demo shows how to pull data from Cytosis without using a config table like '_cytosis', by passing in an array of 'bases'. Here's an example of what a base config object looks like. (As a note, base config objects are built from the '_cytosis' config table)

	` } = $$props;

    	let bases = [
    		{
    			tables: ["Site Content"],
    			options: {
    				"view": "content-2--view",
    				"maxRecords": 1
    			}
    		}
    	];

    	let cytosisObject;
    	let cytosisLoading = false;
    	const writable_props = ["title", "description", "more"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$6.warn(`<DemoFive> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DemoFive", $$slots, []);

    	const change_handler = () => {
    		$$invalidate(3, loadCytosis = false);
    		$$invalidate(4, bases = JSON.parse(this.value));
    	};

    	const click_handler = () => {
    		$$invalidate(3, loadCytosis = true);
    	};

    	function cytosiswip_isLoading_binding(value) {
    		cytosisLoading = value;
    		$$invalidate(6, cytosisLoading);
    	}

    	function cytosiswip_cytosis_binding(value) {
    		cytosisObject = value;
    		$$invalidate(5, cytosisObject);
    	}

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("more" in $$props) $$invalidate(2, more = $$props.more);
    	};

    	$$self.$capture_state = () => ({
    		CytosisWip,
    		Cytosis,
    		marked: marked_1,
    		loadCytosis,
    		title,
    		description,
    		more,
    		bases,
    		cytosisObject,
    		cytosisLoading
    	});

    	$$self.$inject_state = $$props => {
    		if ("loadCytosis" in $$props) $$invalidate(3, loadCytosis = $$props.loadCytosis);
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("more" in $$props) $$invalidate(2, more = $$props.more);
    		if ("bases" in $$props) $$invalidate(4, bases = $$props.bases);
    		if ("cytosisObject" in $$props) $$invalidate(5, cytosisObject = $$props.cytosisObject);
    		if ("cytosisLoading" in $$props) $$invalidate(6, cytosisLoading = $$props.cytosisLoading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*cytosisObject*/ 32) {
    			 if (cytosisObject) {
    				console.log("cytosisObject", cytosisObject);
    			}
    		}
    	};

    	return [
    		title,
    		description,
    		more,
    		loadCytosis,
    		bases,
    		cytosisObject,
    		cytosisLoading,
    		change_handler,
    		click_handler,
    		cytosiswip_isLoading_binding,
    		cytosiswip_cytosis_binding
    	];
    }

    class DemoFive extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { title: 0, description: 1, more: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DemoFive",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get title() {
    		return this.$$.ctx[0];
    	}

    	set title(title) {
    		this.$set({ title });
    		flush();
    	}

    	get description() {
    		return this.$$.ctx[1];
    	}

    	set description(description) {
    		this.$set({ description });
    		flush();
    	}

    	get more() {
    		return this.$$.ctx[2];
    	}

    	set more(more) {
    		this.$set({ more });
    		flush();
    	}
    }

    /* src/examples/DemoSix.svelte generated by Svelte v3.24.0 */

    const { console: console_1$7 } = globals;
    const file$8 = "src/examples/DemoSix.svelte";

    // (26:2) {#if cytosisLoading}
    function create_if_block_2$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("... loading Cytosis object ...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(26:2) {#if cytosisLoading}",
    		ctx
    	});

    	return block;
    }

    // (29:2) {#if cytosisObject}
    function create_if_block$5(ctx) {
    	let div0;
    	let raw_value = marked_1(/*cytosisObject*/ ctx[3].results["Site Content"][0].fields["Content"]) + "";
    	let t0;
    	let div1;
    	let t1;
    	let p;
    	let t3;
    	let pre;
    	let t4_value = JSON.stringify(/*loadedConfig*/ ctx[4], undefined, 4) + "";
    	let t4;
    	let if_block = /*status*/ ctx[6] && create_if_block_1$5(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t1 = space();
    			p = element("p");
    			p.textContent = "Loaded config Object:";
    			t3 = space();
    			pre = element("pre");
    			t4 = text(t4_value);
    			attr_dev(div0, "class", "_card _padding --flat svelte-zfz5ff");
    			add_location(div0, file$8, 29, 4, 595);
    			attr_dev(p, "class", "svelte-zfz5ff");
    			add_location(p, file$8, 35, 5, 808);
    			attr_dev(pre, "class", "svelte-zfz5ff");
    			add_location(pre, file$8, 36, 5, 842);
    			attr_dev(div1, "class", "_card _padding --flat svelte-zfz5ff");
    			add_location(div1, file$8, 31, 4, 716);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			div0.innerHTML = raw_value;
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, p);
    			append_dev(div1, t3);
    			append_dev(div1, pre);
    			append_dev(pre, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cytosisObject*/ 8 && raw_value !== (raw_value = marked_1(/*cytosisObject*/ ctx[3].results["Site Content"][0].fields["Content"]) + "")) div0.innerHTML = raw_value;			if (/*status*/ ctx[6]) if_block.p(ctx, dirty);
    			if (dirty & /*loadedConfig*/ 16 && t4_value !== (t4_value = JSON.stringify(/*loadedConfig*/ ctx[4], undefined, 4) + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(29:2) {#if cytosisObject}",
    		ctx
    	});

    	return block;
    }

    // (33:5) {#if status}
    function create_if_block_1$5(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = `${/*status*/ ctx[6]}`;
    			attr_dev(p, "class", "svelte-zfz5ff");
    			add_location(p, file$8, 33, 6, 776);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(33:5) {#if status}",
    		ctx
    	});

    	return block;
    }

    // (10:1) <CytosisWip     options={{       apiKey: 'keygfuzbhXK1VShlR',       baseId: 'appc0M3MdTYATe7RO',       configName: 'content-1',       routeDetails: 'Demo Six',     }}     apiKey={'keygfuzbhXK1VShlR'}     baseId={'appc0M3MdTYATe7RO'}     configName={'content-1'}    routeDetails={'Cytosis Six'}     bind:isLoading={cytosisLoading}    bind:cytosis={cytosisObject}  >
    function create_default_slot$5(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*cytosisLoading*/ ctx[5] && create_if_block_2$2(ctx);
    	let if_block1 = /*cytosisObject*/ ctx[3] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*cytosisLoading*/ ctx[5]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_2$2(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*cytosisObject*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$5(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(10:1) <CytosisWip     options={{       apiKey: 'keygfuzbhXK1VShlR',       baseId: 'appc0M3MdTYATe7RO',       configName: 'content-1',       routeDetails: 'Demo Six',     }}     apiKey={'keygfuzbhXK1VShlR'}     baseId={'appc0M3MdTYATe7RO'}     configName={'content-1'}    routeDetails={'Cytosis Six'}     bind:isLoading={cytosisLoading}    bind:cytosis={cytosisObject}  >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let raw0_value = marked_1(/*description*/ ctx[1]) + "";
    	let t2;
    	let p;
    	let raw1_value = marked_1(/*more*/ ctx[2]) + "";
    	let t3;
    	let cytosiswip;
    	let updating_isLoading;
    	let updating_cytosis;
    	let current;

    	function cytosiswip_isLoading_binding(value) {
    		/*cytosiswip_isLoading_binding*/ ctx[7].call(null, value);
    	}

    	function cytosiswip_cytosis_binding(value) {
    		/*cytosiswip_cytosis_binding*/ ctx[8].call(null, value);
    	}

    	let cytosiswip_props = {
    		options: {
    			apiKey: "keygfuzbhXK1VShlR",
    			baseId: "appc0M3MdTYATe7RO",
    			configName: "content-1",
    			routeDetails: "Demo Six"
    		},
    		apiKey: "keygfuzbhXK1VShlR",
    		baseId: "appc0M3MdTYATe7RO",
    		configName: "content-1",
    		routeDetails: "Cytosis Six",
    		$$slots: { default: [create_default_slot$5] },
    		$$scope: { ctx }
    	};

    	if (/*cytosisLoading*/ ctx[5] !== void 0) {
    		cytosiswip_props.isLoading = /*cytosisLoading*/ ctx[5];
    	}

    	if (/*cytosisObject*/ ctx[3] !== void 0) {
    		cytosiswip_props.cytosis = /*cytosisObject*/ ctx[3];
    	}

    	cytosiswip = new CytosisWip({ props: cytosiswip_props, $$inline: true });
    	binding_callbacks.push(() => bind(cytosiswip, "isLoading", cytosiswip_isLoading_binding));
    	binding_callbacks.push(() => bind(cytosiswip, "cytosis", cytosiswip_cytosis_binding));

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			p = element("p");
    			t3 = space();
    			create_component(cytosiswip.$$.fragment);
    			attr_dev(h2, "class", "svelte-zfz5ff");
    			add_location(h2, file$8, 3, 1, 45);
    			attr_dev(div0, "class", "svelte-zfz5ff");
    			add_location(div0, file$8, 4, 1, 65);
    			attr_dev(p, "class", "svelte-zfz5ff");
    			add_location(p, file$8, 6, 1, 107);
    			attr_dev(div1, "class", " svelte-zfz5ff");
    			add_location(div1, file$8, 2, 0, 29);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			div0.innerHTML = raw0_value;
    			append_dev(div1, t2);
    			append_dev(div1, p);
    			p.innerHTML = raw1_value;
    			append_dev(div1, t3);
    			mount_component(cytosiswip, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if ((!current || dirty & /*description*/ 2) && raw0_value !== (raw0_value = marked_1(/*description*/ ctx[1]) + "")) div0.innerHTML = raw0_value;			if ((!current || dirty & /*more*/ 4) && raw1_value !== (raw1_value = marked_1(/*more*/ ctx[2]) + "")) p.innerHTML = raw1_value;			const cytosiswip_changes = {};

    			if (dirty & /*$$scope, loadedConfig, cytosisObject, cytosisLoading*/ 2104) {
    				cytosiswip_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_isLoading && dirty & /*cytosisLoading*/ 32) {
    				updating_isLoading = true;
    				cytosiswip_changes.isLoading = /*cytosisLoading*/ ctx[5];
    				add_flush_callback(() => updating_isLoading = false);
    			}

    			if (!updating_cytosis && dirty & /*cytosisObject*/ 8) {
    				updating_cytosis = true;
    				cytosiswip_changes.cytosis = /*cytosisObject*/ ctx[3];
    				add_flush_callback(() => updating_cytosis = false);
    			}

    			cytosiswip.$set(cytosiswip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cytosiswip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cytosiswip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(cytosiswip);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	marked_1.setOptions({ gfm: true, breaks: true });
    	let { title = `6. Caching strategies` } = $$props;
    	let { description = `This demo shows how localStorage, browser-based cache helpers work.` } = $$props;
    	let { more = `The cached config is pulld in automatically if Cytosis finds a cache. By dfault, the cache.` } = $$props;
    	let status;
    	let cytosisObject, loadedConfig;
    	let cytosisLoading = false;

    	let storeCache = function () {
    		if (cytosisObject) {
    			Cytosis.saveConfigCache(cytosisObject);
    			console.log("cache saved!!");
    		}
    	};

    	let loadCache = function () {
    		if (cytosisObject) {
    			console.log("loading cache!!");
    			$$invalidate(4, loadedConfig = Cytosis.loadConfigCache(cytosisObject));
    			console.log("loaded config: ", loadedConfig);
    		}
    	};

    	const writable_props = ["title", "description", "more"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$7.warn(`<DemoSix> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DemoSix", $$slots, []);

    	function cytosiswip_isLoading_binding(value) {
    		cytosisLoading = value;
    		$$invalidate(5, cytosisLoading);
    	}

    	function cytosiswip_cytosis_binding(value) {
    		cytosisObject = value;
    		$$invalidate(3, cytosisObject);
    	}

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("more" in $$props) $$invalidate(2, more = $$props.more);
    	};

    	$$self.$capture_state = () => ({
    		Cytosis,
    		CytosisWip,
    		marked: marked_1,
    		title,
    		description,
    		more,
    		status,
    		cytosisObject,
    		loadedConfig,
    		cytosisLoading,
    		storeCache,
    		loadCache
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("more" in $$props) $$invalidate(2, more = $$props.more);
    		if ("status" in $$props) $$invalidate(6, status = $$props.status);
    		if ("cytosisObject" in $$props) $$invalidate(3, cytosisObject = $$props.cytosisObject);
    		if ("loadedConfig" in $$props) $$invalidate(4, loadedConfig = $$props.loadedConfig);
    		if ("cytosisLoading" in $$props) $$invalidate(5, cytosisLoading = $$props.cytosisLoading);
    		if ("storeCache" in $$props) $$invalidate(9, storeCache = $$props.storeCache);
    		if ("loadCache" in $$props) $$invalidate(10, loadCache = $$props.loadCache);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*cytosisObject*/ 8) {
    			 if (cytosisObject) {
    				console.log("cytosis loading, storing cache ... ");
    				storeCache();
    				loadCache();
    			}
    		}
    	};

    	return [
    		title,
    		description,
    		more,
    		cytosisObject,
    		loadedConfig,
    		cytosisLoading,
    		status,
    		cytosiswip_isLoading_binding,
    		cytosiswip_cytosis_binding
    	];
    }

    class DemoSix extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { title: 0, description: 1, more: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DemoSix",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get title() {
    		return this.$$.ctx[0];
    	}

    	set title(title) {
    		this.$set({ title });
    		flush();
    	}

    	get description() {
    		return this.$$.ctx[1];
    	}

    	set description(description) {
    		this.$set({ description });
    		flush();
    	}

    	get more() {
    		return this.$$.ctx[2];
    	}

    	set more(more) {
    		this.$set({ more });
    		flush();
    	}
    }

    /* src/examples/DemoSeven.svelte generated by Svelte v3.24.0 */
    const file$9 = "src/examples/DemoSeven.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[43] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[43] = list[i];
    	return child_ctx;
    }

    // (26:4) {#if cytosisLoading_One}
    function create_if_block_9(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("... loading Cytosis object ...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(26:4) {#if cytosisLoading_One}",
    		ctx
    	});

    	return block;
    }

    // (29:4) {#if cytosisObject_One}
    function create_if_block_8(ctx) {
    	let div;
    	let raw_value = marked_1(/*cytosisObject_One*/ ctx[11].results["Site Content"][0].fields["Content"]) + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "_card _padding --flat svelte-tz74mh");
    			add_location(div, file$9, 29, 6, 683);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cytosisObject_One*/ 2048 && raw_value !== (raw_value = marked_1(/*cytosisObject_One*/ ctx[11].results["Site Content"][0].fields["Content"]) + "")) div.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(29:4) {#if cytosisObject_One}",
    		ctx
    	});

    	return block;
    }

    // (11:2) <CytosisWip     options={{       apiKey: 'keygfuzbhXK1VShlR',       baseId: 'appc0M3MdTYATe7RO',       configName: 'content-preview',       routeDetails: 'Demo Seven, Example 1',     }}      apiKey={'keygfuzbhXK1VShlR'}      baseId={'appc0M3MdTYATe7RO'}      configName={'content-preview'}     routeDetails={'Demo Seven, Example 1'}     bind:isLoading={cytosisLoading_One}     bind:cytosis={cytosisObject_One}   >
    function create_default_slot_4(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*cytosisLoading_One*/ ctx[12] && create_if_block_9(ctx);
    	let if_block1 = /*cytosisObject_One*/ ctx[11] && create_if_block_8(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*cytosisLoading_One*/ ctx[12]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_9(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*cytosisObject_One*/ ctx[11]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_8(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(11:2) <CytosisWip     options={{       apiKey: 'keygfuzbhXK1VShlR',       baseId: 'appc0M3MdTYATe7RO',       configName: 'content-preview',       routeDetails: 'Demo Seven, Example 1',     }}      apiKey={'keygfuzbhXK1VShlR'}      baseId={'appc0M3MdTYATe7RO'}      configName={'content-preview'}     routeDetails={'Demo Seven, Example 1'}     bind:isLoading={cytosisLoading_One}     bind:cytosis={cytosisObject_One}   >",
    		ctx
    	});

    	return block;
    }

    // (61:4) {#if cytosisLoading_Two}
    function create_if_block_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("... loading Cytosis object ...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(61:4) {#if cytosisLoading_Two}",
    		ctx
    	});

    	return block;
    }

    // (64:4) {#if cytosisObject_Two}
    function create_if_block_6(ctx) {
    	let div;
    	let raw_value = marked_1(/*cytosisObject_Two*/ ctx[13].results["Site Content"][0].fields["Content"]) + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "_card _padding --flat svelte-tz74mh");
    			add_location(div, file$9, 64, 6, 1584);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cytosisObject_Two*/ 8192 && raw_value !== (raw_value = marked_1(/*cytosisObject_Two*/ ctx[13].results["Site Content"][0].fields["Content"]) + "")) div.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(64:4) {#if cytosisObject_Two}",
    		ctx
    	});

    	return block;
    }

    // (41:2) <CytosisWip     options={{       apiKey: 'keygfuzbhXK1VShlR',       baseId: 'appc0M3MdTYATe7RO',       configName: 'content-all',       routeDetails: 'Demo Seven, Example 2',       tableOptions: {         filterByFormula: "{Status} = \"Preview\""       }     }}     apiKey={'keygfuzbhXK1VShlR'}      baseId={'appc0M3MdTYATe7RO'}      configName={'content-all'}     routeDetails={'Demo Seven, Example 2'}     tableOptions={{       filterByFormula: "{Status} = \"Preview\""     }}     bind:isLoading={cytosisLoading_Two}     bind:cytosis={cytosisObject_Two}   >
    function create_default_slot_3(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*cytosisLoading_Two*/ ctx[14] && create_if_block_7(ctx);
    	let if_block1 = /*cytosisObject_Two*/ ctx[13] && create_if_block_6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*cytosisLoading_Two*/ ctx[14]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*cytosisObject_Two*/ ctx[13]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_6(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(41:2) <CytosisWip     options={{       apiKey: 'keygfuzbhXK1VShlR',       baseId: 'appc0M3MdTYATe7RO',       configName: 'content-all',       routeDetails: 'Demo Seven, Example 2',       tableOptions: {         filterByFormula: \\\"{Status} = \\\\\"Preview\\\\\"\\\"       }     }}     apiKey={'keygfuzbhXK1VShlR'}      baseId={'appc0M3MdTYATe7RO'}      configName={'content-all'}     routeDetails={'Demo Seven, Example 2'}     tableOptions={{       filterByFormula: \\\"{Status} = \\\\\"Preview\\\\\"\\\"     }}     bind:isLoading={cytosisLoading_Two}     bind:cytosis={cytosisObject_Two}   >",
    		ctx
    	});

    	return block;
    }

    // (110:6) {#if cytosisLoading_Three}
    function create_if_block_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("... loading Cytosis object ...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(110:6) {#if cytosisLoading_Three}",
    		ctx
    	});

    	return block;
    }

    // (113:6) {#if cytosisObject_Three}
    function create_if_block_4(ctx) {
    	let div;
    	let raw_value = marked_1(/*cytosisObject_Three*/ ctx[15].results["Site Content"][0].fields["Content"]) + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "_card _padding --flat svelte-tz74mh");
    			add_location(div, file$9, 113, 8, 3377);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cytosisObject_Three*/ 32768 && raw_value !== (raw_value = marked_1(/*cytosisObject_Three*/ ctx[15].results["Site Content"][0].fields["Content"]) + "")) div.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(113:6) {#if cytosisObject_Three}",
    		ctx
    	});

    	return block;
    }

    // (97:4) <CytosisWip       options={{         apiKey: 'keygfuzbhXK1VShlR',         baseId: 'appc0M3MdTYATe7RO',         configName: 'content-all',         routeDetails: 'Demo Seven, Example 3',         tableOptions: {                   filterByFormula: `FIND("${filterChoice}",Tags)`                 }       }}       bind:isLoading={cytosisLoading_Three}       bind:cytosis={cytosisObject_Three}     >
    function create_default_slot_2(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*cytosisLoading_Three*/ ctx[16] && create_if_block_5(ctx);
    	let if_block1 = /*cytosisObject_Three*/ ctx[15] && create_if_block_4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*cytosisLoading_Three*/ ctx[16]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*cytosisObject_Three*/ ctx[15]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(97:4) <CytosisWip       options={{         apiKey: 'keygfuzbhXK1VShlR',         baseId: 'appc0M3MdTYATe7RO',         configName: 'content-all',         routeDetails: 'Demo Seven, Example 3',         tableOptions: {                   filterByFormula: `FIND(\\\"${filterChoice}\\\",Tags)`                 }       }}       bind:isLoading={cytosisLoading_Three}       bind:cytosis={cytosisObject_Three}     >",
    		ctx
    	});

    	return block;
    }

    // (164:6) {#if cytosisLoading_Four}
    function create_if_block_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("... loading Cytosis object ...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(164:6) {#if cytosisLoading_Four}",
    		ctx
    	});

    	return block;
    }

    // (167:6) {#if cytosisObject_Four}
    function create_if_block_2$3(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value_1 = /*cytosisObject_Four*/ ctx[17].results["Site Content"];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*item*/ ctx[43].id + /*sortChoice*/ ctx[7];
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "_card _padding --flat svelte-tz74mh");
    			add_location(div, file$9, 167, 8, 4812);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cytosisObject_Four*/ 131072) {
    				const each_value_1 = /*cytosisObject_Four*/ ctx[17].results["Site Content"];
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, destroy_block, create_each_block_1, null, get_each_context_1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(167:6) {#if cytosisObject_Four}",
    		ctx
    	});

    	return block;
    }

    // (169:10) {#each cytosisObject_Four.results['Site Content'] as item (item.id+sortChoice)}
    function create_each_block_1(key_1, ctx) {
    	let p;
    	let t0;
    	let t1_value = /*item*/ ctx[43].fields["Name"] + "";
    	let t1;
    	let t2;
    	let html_tag;
    	let raw_value = /*item*/ ctx[43].fields["Content"] + "";
    	let t3;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			p = element("p");
    			t0 = text("Name: ");
    			t1 = text(t1_value);
    			t2 = text(" — \n              Content: ");
    			t3 = space();
    			html_tag = new HtmlTag(t3);
    			attr_dev(p, "class", "svelte-tz74mh");
    			add_location(p, file$9, 169, 12, 4950);
    			this.first = p;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			html_tag.m(raw_value, p);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cytosisObject_Four*/ 131072 && t1_value !== (t1_value = /*item*/ ctx[43].fields["Name"] + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*cytosisObject_Four*/ 131072 && raw_value !== (raw_value = /*item*/ ctx[43].fields["Content"] + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(169:10) {#each cytosisObject_Four.results['Site Content'] as item (item.id+sortChoice)}",
    		ctx
    	});

    	return block;
    }

    // (151:4) <CytosisWip       options={{         apiKey: 'keygfuzbhXK1VShlR',         baseId: 'appc0M3MdTYATe7RO',         configName: 'sort-content',         routeDetails: 'Demo Seven, Example 4',         tableOptions: {           sort: sortArray,         }       }}       bind:isLoading={cytosisLoading_Four}       bind:cytosis={cytosisObject_Four}     >
    function create_default_slot_1(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*cytosisLoading_Four*/ ctx[18] && create_if_block_3$1(ctx);
    	let if_block1 = /*cytosisObject_Four*/ ctx[17] && create_if_block_2$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*cytosisLoading_Four*/ ctx[18]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*cytosisObject_Four*/ ctx[17]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$3(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(151:4) <CytosisWip       options={{         apiKey: 'keygfuzbhXK1VShlR',         baseId: 'appc0M3MdTYATe7RO',         configName: 'sort-content',         routeDetails: 'Demo Seven, Example 4',         tableOptions: {           sort: sortArray,         }       }}       bind:isLoading={cytosisLoading_Four}       bind:cytosis={cytosisObject_Four}     >",
    		ctx
    	});

    	return block;
    }

    // (226:6) {#if cytosisLoading_Five}
    function create_if_block_1$6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("... loading Cytosis object ...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(226:6) {#if cytosisLoading_Five}",
    		ctx
    	});

    	return block;
    }

    // (229:6) {#if cytosisObject_Five}
    function create_if_block$6(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*cytosisObject_Five*/ ctx[19].results["Site Content"];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[43].id;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "_card _padding --flat svelte-tz74mh");
    			add_location(div, file$9, 229, 8, 6257);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cytosisObject_Five*/ 524288) {
    				const each_value = /*cytosisObject_Five*/ ctx[19].results["Site Content"];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block$2, null, get_each_context$2);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(229:6) {#if cytosisObject_Five}",
    		ctx
    	});

    	return block;
    }

    // (231:10) {#each cytosisObject_Five.results['Site Content'] as item (item.id)}
    function create_each_block$2(key_1, ctx) {
    	let p;
    	let t0;
    	let html_tag;
    	let raw0_value = /*item*/ ctx[43].fields["Content"] + "";
    	let t1;
    	let html_tag_1;
    	let raw1_value = /*item*/ ctx[43].fields["Tags"] + "";
    	let t2;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			p = element("p");
    			t0 = text("Content: ");
    			t1 = text(" |\n              Tags: ");
    			t2 = space();
    			html_tag = new HtmlTag(t1);
    			html_tag_1 = new HtmlTag(t2);
    			attr_dev(p, "class", "svelte-tz74mh");
    			add_location(p, file$9, 231, 12, 6384);
    			this.first = p;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			html_tag.m(raw0_value, p);
    			append_dev(p, t1);
    			html_tag_1.m(raw1_value, p);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cytosisObject_Five*/ 524288 && raw0_value !== (raw0_value = /*item*/ ctx[43].fields["Content"] + "")) html_tag.p(raw0_value);
    			if (dirty[0] & /*cytosisObject_Five*/ 524288 && raw1_value !== (raw1_value = /*item*/ ctx[43].fields["Tags"] + "")) html_tag_1.p(raw1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(231:10) {#each cytosisObject_Five.results['Site Content'] as item (item.id)}",
    		ctx
    	});

    	return block;
    }

    // (210:4) <CytosisWip       options={{         apiKey: 'keygfuzbhXK1VShlR',         baseId: 'appc0M3MdTYATe7RO',         configName: 'filter-all',         routeDetails: 'Demo Seven, Example 5',         tableOptions: {           fields: [             ...(showTagsField ? ['Tags'] : []),             ...(showContentField ? ['Content'] : []),           ],         }       }}       bind:isLoading={cytosisLoading_Five}       bind:cytosis={cytosisObject_Five}     >
    function create_default_slot$6(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*cytosisLoading_Five*/ ctx[20] && create_if_block_1$6(ctx);
    	let if_block1 = /*cytosisObject_Five*/ ctx[19] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*cytosisLoading_Five*/ ctx[20]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1$6(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*cytosisObject_Five*/ ctx[19]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$6(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(210:4) <CytosisWip       options={{         apiKey: 'keygfuzbhXK1VShlR',         baseId: 'appc0M3MdTYATe7RO',         configName: 'filter-all',         routeDetails: 'Demo Seven, Example 5',         tableOptions: {           fields: [             ...(showTagsField ? ['Tags'] : []),             ...(showContentField ? ['Content'] : []),           ],         }       }}       bind:isLoading={cytosisLoading_Five}       bind:cytosis={cytosisObject_Five}     >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div14;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let raw0_value = marked_1(/*description*/ ctx[1]) + "";
    	let t2;
    	let h30;
    	let t4;
    	let p0;
    	let raw1_value = marked_1(/*views*/ ctx[2]) + "";
    	let t5;
    	let cytosiswip0;
    	let updating_isLoading;
    	let updating_cytosis;
    	let t6;
    	let h31;
    	let t8;
    	let p1;
    	let raw2_value = marked_1(/*filters*/ ctx[3]) + "";
    	let t9;
    	let cytosiswip1;
    	let updating_isLoading_1;
    	let updating_cytosis_1;
    	let t10;
    	let p2;
    	let t11;
    	let t12;
    	let t13;
    	let t14;
    	let div5;
    	let div4;
    	let p3;
    	let t15;
    	let t16;
    	let t17;
    	let div1;
    	let label0;
    	let input0;
    	let input0_value_value;
    	let t18;
    	let t19;
    	let div2;
    	let label1;
    	let input1;
    	let input1_value_value;
    	let t20;
    	let t21;
    	let div3;
    	let label2;
    	let input2;
    	let input2_value_value;
    	let t22;
    	let t23;
    	let cytosiswip2;
    	let updating_isLoading_2;
    	let updating_cytosis_2;
    	let t24;
    	let h32;
    	let t26;
    	let p4;
    	let raw3_value = marked_1(/*sorting*/ ctx[4]) + "";
    	let t27;
    	let div9;
    	let div8;
    	let p5;
    	let t28;
    	let t29;
    	let t30;
    	let t31_value = JSON.stringify(/*sortArray*/ ctx[8]) + "";
    	let t31;
    	let t32;
    	let div6;
    	let label3;
    	let input3;
    	let input3_value_value;
    	let t33;
    	let t34;
    	let div7;
    	let label4;
    	let input4;
    	let input4_value_value;
    	let t35;
    	let t36;
    	let cytosiswip3;
    	let updating_isLoading_3;
    	let updating_cytosis_3;
    	let t37;
    	let h33;
    	let t39;
    	let p6;
    	let raw4_value = marked_1(/*fields*/ ctx[5]) + "";
    	let t40;
    	let div13;
    	let div12;
    	let div10;
    	let label5;
    	let input5;
    	let t41;
    	let t42;
    	let div11;
    	let label6;
    	let input6;
    	let t43;
    	let t44;
    	let cytosiswip4;
    	let updating_isLoading_4;
    	let updating_cytosis_4;
    	let current;
    	let mounted;
    	let dispose;

    	function cytosiswip0_isLoading_binding(value) {
    		/*cytosiswip0_isLoading_binding*/ ctx[21].call(null, value);
    	}

    	function cytosiswip0_cytosis_binding(value) {
    		/*cytosiswip0_cytosis_binding*/ ctx[22].call(null, value);
    	}

    	let cytosiswip0_props = {
    		options: {
    			apiKey: "keygfuzbhXK1VShlR",
    			baseId: "appc0M3MdTYATe7RO",
    			configName: "content-preview",
    			routeDetails: "Demo Seven, Example 1"
    		},
    		apiKey: "keygfuzbhXK1VShlR",
    		baseId: "appc0M3MdTYATe7RO",
    		configName: "content-preview",
    		routeDetails: "Demo Seven, Example 1",
    		$$slots: { default: [create_default_slot_4] },
    		$$scope: { ctx }
    	};

    	if (/*cytosisLoading_One*/ ctx[12] !== void 0) {
    		cytosiswip0_props.isLoading = /*cytosisLoading_One*/ ctx[12];
    	}

    	if (/*cytosisObject_One*/ ctx[11] !== void 0) {
    		cytosiswip0_props.cytosis = /*cytosisObject_One*/ ctx[11];
    	}

    	cytosiswip0 = new CytosisWip({ props: cytosiswip0_props, $$inline: true });
    	binding_callbacks.push(() => bind(cytosiswip0, "isLoading", cytosiswip0_isLoading_binding));
    	binding_callbacks.push(() => bind(cytosiswip0, "cytosis", cytosiswip0_cytosis_binding));

    	function cytosiswip1_isLoading_binding(value) {
    		/*cytosiswip1_isLoading_binding*/ ctx[23].call(null, value);
    	}

    	function cytosiswip1_cytosis_binding(value) {
    		/*cytosiswip1_cytosis_binding*/ ctx[24].call(null, value);
    	}

    	let cytosiswip1_props = {
    		options: {
    			apiKey: "keygfuzbhXK1VShlR",
    			baseId: "appc0M3MdTYATe7RO",
    			configName: "content-all",
    			routeDetails: "Demo Seven, Example 2",
    			tableOptions: {
    				filterByFormula: "{Status} = \"Preview\""
    			}
    		},
    		apiKey: "keygfuzbhXK1VShlR",
    		baseId: "appc0M3MdTYATe7RO",
    		configName: "content-all",
    		routeDetails: "Demo Seven, Example 2",
    		tableOptions: {
    			filterByFormula: "{Status} = \"Preview\""
    		},
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	};

    	if (/*cytosisLoading_Two*/ ctx[14] !== void 0) {
    		cytosiswip1_props.isLoading = /*cytosisLoading_Two*/ ctx[14];
    	}

    	if (/*cytosisObject_Two*/ ctx[13] !== void 0) {
    		cytosiswip1_props.cytosis = /*cytosisObject_Two*/ ctx[13];
    	}

    	cytosiswip1 = new CytosisWip({ props: cytosiswip1_props, $$inline: true });
    	binding_callbacks.push(() => bind(cytosiswip1, "isLoading", cytosiswip1_isLoading_binding));
    	binding_callbacks.push(() => bind(cytosiswip1, "cytosis", cytosiswip1_cytosis_binding));

    	function cytosiswip2_isLoading_binding(value) {
    		/*cytosiswip2_isLoading_binding*/ ctx[29].call(null, value);
    	}

    	function cytosiswip2_cytosis_binding(value) {
    		/*cytosiswip2_cytosis_binding*/ ctx[30].call(null, value);
    	}

    	let cytosiswip2_props = {
    		options: {
    			apiKey: "keygfuzbhXK1VShlR",
    			baseId: "appc0M3MdTYATe7RO",
    			configName: "content-all",
    			routeDetails: "Demo Seven, Example 3",
    			tableOptions: {
    				filterByFormula: `FIND("${/*filterChoice*/ ctx[6]}",Tags)`
    			}
    		},
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	};

    	if (/*cytosisLoading_Three*/ ctx[16] !== void 0) {
    		cytosiswip2_props.isLoading = /*cytosisLoading_Three*/ ctx[16];
    	}

    	if (/*cytosisObject_Three*/ ctx[15] !== void 0) {
    		cytosiswip2_props.cytosis = /*cytosisObject_Three*/ ctx[15];
    	}

    	cytosiswip2 = new CytosisWip({ props: cytosiswip2_props, $$inline: true });
    	binding_callbacks.push(() => bind(cytosiswip2, "isLoading", cytosiswip2_isLoading_binding));
    	binding_callbacks.push(() => bind(cytosiswip2, "cytosis", cytosiswip2_cytosis_binding));

    	function cytosiswip3_isLoading_binding(value) {
    		/*cytosiswip3_isLoading_binding*/ ctx[35].call(null, value);
    	}

    	function cytosiswip3_cytosis_binding(value) {
    		/*cytosiswip3_cytosis_binding*/ ctx[36].call(null, value);
    	}

    	let cytosiswip3_props = {
    		options: {
    			apiKey: "keygfuzbhXK1VShlR",
    			baseId: "appc0M3MdTYATe7RO",
    			configName: "sort-content",
    			routeDetails: "Demo Seven, Example 4",
    			tableOptions: { sort: /*sortArray*/ ctx[8] }
    		},
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	if (/*cytosisLoading_Four*/ ctx[18] !== void 0) {
    		cytosiswip3_props.isLoading = /*cytosisLoading_Four*/ ctx[18];
    	}

    	if (/*cytosisObject_Four*/ ctx[17] !== void 0) {
    		cytosiswip3_props.cytosis = /*cytosisObject_Four*/ ctx[17];
    	}

    	cytosiswip3 = new CytosisWip({ props: cytosiswip3_props, $$inline: true });
    	binding_callbacks.push(() => bind(cytosiswip3, "isLoading", cytosiswip3_isLoading_binding));
    	binding_callbacks.push(() => bind(cytosiswip3, "cytosis", cytosiswip3_cytosis_binding));

    	function cytosiswip4_isLoading_binding(value) {
    		/*cytosiswip4_isLoading_binding*/ ctx[39].call(null, value);
    	}

    	function cytosiswip4_cytosis_binding(value) {
    		/*cytosiswip4_cytosis_binding*/ ctx[40].call(null, value);
    	}

    	let cytosiswip4_props = {
    		options: {
    			apiKey: "keygfuzbhXK1VShlR",
    			baseId: "appc0M3MdTYATe7RO",
    			configName: "filter-all",
    			routeDetails: "Demo Seven, Example 5",
    			tableOptions: {
    				fields: [
    					.../*showTagsField*/ ctx[9] ? ["Tags"] : [],
    					.../*showContentField*/ ctx[10] ? ["Content"] : []
    				]
    			}
    		},
    		$$slots: { default: [create_default_slot$6] },
    		$$scope: { ctx }
    	};

    	if (/*cytosisLoading_Five*/ ctx[20] !== void 0) {
    		cytosiswip4_props.isLoading = /*cytosisLoading_Five*/ ctx[20];
    	}

    	if (/*cytosisObject_Five*/ ctx[19] !== void 0) {
    		cytosiswip4_props.cytosis = /*cytosisObject_Five*/ ctx[19];
    	}

    	cytosiswip4 = new CytosisWip({ props: cytosiswip4_props, $$inline: true });
    	binding_callbacks.push(() => bind(cytosiswip4, "isLoading", cytosiswip4_isLoading_binding));
    	binding_callbacks.push(() => bind(cytosiswip4, "cytosis", cytosiswip4_cytosis_binding));

    	const block = {
    		c: function create() {
    			div14 = element("div");
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			h30 = element("h3");
    			h30.textContent = "Views";
    			t4 = space();
    			p0 = element("p");
    			t5 = space();
    			create_component(cytosiswip0.$$.fragment);
    			t6 = space();
    			h31 = element("h3");
    			h31.textContent = "Filtering";
    			t8 = space();
    			p1 = element("p");
    			t9 = space();
    			create_component(cytosiswip1.$$.fragment);
    			t10 = space();
    			p2 = element("p");
    			t11 = text("This next example shows how dynamic filtering might work, where we filter the field Tags against a phrase like ");
    			t12 = text(/*filterChoice*/ ctx[6]);
    			t13 = text(". In this example we use a FIND() filter, which means the more specific the phrase is, the more accurate the results will be. Unfortunately, Airtable doesn't have a lot of advanced filter capabilities, so it's usually be better to do the final filtering step after pulling in the data.");
    			t14 = space();
    			div5 = element("div");
    			div4 = element("div");
    			p3 = element("p");
    			t15 = text("Sort Choice: ");
    			t16 = text(/*filterChoice*/ ctx[6]);
    			t17 = space();
    			div1 = element("div");
    			label0 = element("label");
    			input0 = element("input");
    			t18 = text("\n          Filter One");
    			t19 = space();
    			div2 = element("div");
    			label1 = element("label");
    			input1 = element("input");
    			t20 = text("\n          Filter Two");
    			t21 = space();
    			div3 = element("div");
    			label2 = element("label");
    			input2 = element("input");
    			t22 = text("\n          Filter Three");
    			t23 = space();
    			create_component(cytosiswip2.$$.fragment);
    			t24 = space();
    			h32 = element("h3");
    			h32.textContent = "Sorting";
    			t26 = space();
    			p4 = element("p");
    			t27 = space();
    			div9 = element("div");
    			div8 = element("div");
    			p5 = element("p");
    			t28 = text("Sort Choice: ");
    			t29 = text(/*sortChoice*/ ctx[7]);
    			t30 = text(" / ");
    			t31 = text(t31_value);
    			t32 = space();
    			div6 = element("div");
    			label3 = element("label");
    			input3 = element("input");
    			t33 = text("\n          Sort by Name");
    			t34 = space();
    			div7 = element("div");
    			label4 = element("label");
    			input4 = element("input");
    			t35 = text("\n          Sort by Content");
    			t36 = space();
    			create_component(cytosiswip3.$$.fragment);
    			t37 = space();
    			h33 = element("h3");
    			h33.textContent = "Fields";
    			t39 = space();
    			p6 = element("p");
    			t40 = space();
    			div13 = element("div");
    			div12 = element("div");
    			div10 = element("div");
    			label5 = element("label");
    			input5 = element("input");
    			t41 = text("\n          Show Content field");
    			t42 = space();
    			div11 = element("div");
    			label6 = element("label");
    			input6 = element("input");
    			t43 = text("\n          Show Tags field");
    			t44 = space();
    			create_component(cytosiswip4.$$.fragment);
    			attr_dev(h2, "class", "svelte-tz74mh");
    			add_location(h2, file$9, 3, 1, 45);
    			attr_dev(div0, "class", "svelte-tz74mh");
    			add_location(div0, file$9, 4, 1, 65);
    			attr_dev(h30, "class", "svelte-tz74mh");
    			add_location(h30, file$9, 8, 2, 110);
    			attr_dev(p0, "class", "svelte-tz74mh");
    			add_location(p0, file$9, 9, 2, 127);
    			attr_dev(h31, "class", "_margin-top-2 svelte-tz74mh");
    			add_location(h31, file$9, 38, 2, 837);
    			attr_dev(p1, "class", "svelte-tz74mh");
    			add_location(p1, file$9, 39, 2, 880);
    			attr_dev(p2, "class", "_margin-top-2 svelte-tz74mh");
    			add_location(p2, file$9, 68, 2, 1733);
    			attr_dev(p3, "class", "svelte-tz74mh");
    			add_location(p3, file$9, 72, 6, 2250);
    			attr_dev(input0, "type", "radio");
    			input0.__value = input0_value_value = "Filter One";
    			input0.value = input0.__value;
    			attr_dev(input0, "class", "svelte-tz74mh");
    			/*$$binding_groups*/ ctx[26][0].push(input0);
    			add_location(input0, file$9, 76, 10, 2353);
    			attr_dev(label0, "class", "svelte-tz74mh");
    			add_location(label0, file$9, 75, 8, 2335);
    			attr_dev(div1, "class", "_form-radio __inline svelte-tz74mh");
    			add_location(div1, file$9, 74, 6, 2292);
    			attr_dev(input1, "type", "radio");
    			input1.__value = input1_value_value = "Filter Two";
    			input1.value = input1.__value;
    			attr_dev(input1, "class", "svelte-tz74mh");
    			/*$$binding_groups*/ ctx[26][0].push(input1);
    			add_location(input1, file$9, 83, 10, 2538);
    			attr_dev(label1, "class", "svelte-tz74mh");
    			add_location(label1, file$9, 82, 8, 2520);
    			attr_dev(div2, "class", "_form-radio __inline svelte-tz74mh");
    			add_location(div2, file$9, 81, 6, 2477);
    			attr_dev(input2, "type", "radio");
    			input2.__value = input2_value_value = "Filter Three";
    			input2.value = input2.__value;
    			attr_dev(input2, "class", "svelte-tz74mh");
    			/*$$binding_groups*/ ctx[26][0].push(input2);
    			add_location(input2, file$9, 90, 10, 2723);
    			attr_dev(label2, "class", "svelte-tz74mh");
    			add_location(label2, file$9, 89, 8, 2705);
    			attr_dev(div3, "class", "_form-radio __inline svelte-tz74mh");
    			add_location(div3, file$9, 88, 6, 2662);
    			attr_dev(div4, "clas", "_form-radiogroup");
    			attr_dev(div4, "class", "svelte-tz74mh");
    			add_location(div4, file$9, 71, 4, 2214);
    			attr_dev(div5, "class", "_grid-1-3 _grid-gap svelte-tz74mh");
    			add_location(div5, file$9, 70, 2, 2176);
    			attr_dev(h32, "class", "_margin-top-2 svelte-tz74mh");
    			add_location(h32, file$9, 124, 2, 3547);
    			attr_dev(p4, "class", "svelte-tz74mh");
    			add_location(p4, file$9, 125, 2, 3588);
    			attr_dev(p5, "class", "svelte-tz74mh");
    			add_location(p5, file$9, 129, 6, 3697);
    			attr_dev(input3, "type", "radio");
    			input3.__value = input3_value_value = "Sort by Name";
    			input3.value = input3.__value;
    			attr_dev(input3, "class", "svelte-tz74mh");
    			/*$$binding_groups*/ ctx[26][1].push(input3);
    			add_location(input3, file$9, 133, 10, 3829);
    			attr_dev(label3, "class", "svelte-tz74mh");
    			add_location(label3, file$9, 132, 8, 3811);
    			attr_dev(div6, "class", "_form-radio __inline svelte-tz74mh");
    			add_location(div6, file$9, 131, 6, 3768);
    			attr_dev(input4, "type", "radio");
    			input4.__value = input4_value_value = "Sort by Content";
    			input4.value = input4.__value;
    			attr_dev(input4, "class", "svelte-tz74mh");
    			/*$$binding_groups*/ ctx[26][1].push(input4);
    			add_location(input4, file$9, 142, 10, 4108);
    			attr_dev(label4, "class", "svelte-tz74mh");
    			add_location(label4, file$9, 141, 8, 4090);
    			attr_dev(div7, "class", "_form-radio __inline svelte-tz74mh");
    			add_location(div7, file$9, 140, 6, 4047);
    			attr_dev(div8, "clas", "_form-radiogroup");
    			attr_dev(div8, "class", "svelte-tz74mh");
    			add_location(div8, file$9, 128, 4, 3661);
    			attr_dev(div9, "class", "_grid-1-3 _grid-gap svelte-tz74mh");
    			add_location(div9, file$9, 127, 2, 3623);
    			attr_dev(h33, "class", "_margin-top-2 svelte-tz74mh");
    			add_location(h33, file$9, 186, 2, 5152);
    			attr_dev(p6, "class", "svelte-tz74mh");
    			add_location(p6, file$9, 188, 2, 5193);
    			attr_dev(input5, "type", "checkbox");
    			attr_dev(input5, "class", "svelte-tz74mh");
    			add_location(input5, file$9, 195, 10, 5366);
    			attr_dev(label5, "class", "svelte-tz74mh");
    			add_location(label5, file$9, 194, 8, 5348);
    			attr_dev(div10, "class", "_form-checkbox __inline svelte-tz74mh");
    			add_location(div10, file$9, 193, 6, 5302);
    			attr_dev(input6, "type", "checkbox");
    			attr_dev(input6, "class", "svelte-tz74mh");
    			add_location(input6, file$9, 203, 10, 5561);
    			attr_dev(label6, "class", "svelte-tz74mh");
    			add_location(label6, file$9, 202, 8, 5543);
    			attr_dev(div11, "class", "_form-checkbox __inline svelte-tz74mh");
    			add_location(div11, file$9, 201, 6, 5497);
    			attr_dev(div12, "clas", "_form-radiogroup");
    			attr_dev(div12, "class", "svelte-tz74mh");
    			add_location(div12, file$9, 191, 4, 5265);
    			attr_dev(div13, "class", "_grid-1-3 _grid-gap svelte-tz74mh");
    			add_location(div13, file$9, 190, 2, 5227);
    			attr_dev(div14, "class", " svelte-tz74mh");
    			add_location(div14, file$9, 2, 0, 29);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div14, anchor);
    			append_dev(div14, h2);
    			append_dev(h2, t0);
    			append_dev(div14, t1);
    			append_dev(div14, div0);
    			div0.innerHTML = raw0_value;
    			append_dev(div14, t2);
    			append_dev(div14, h30);
    			append_dev(div14, t4);
    			append_dev(div14, p0);
    			p0.innerHTML = raw1_value;
    			append_dev(div14, t5);
    			mount_component(cytosiswip0, div14, null);
    			append_dev(div14, t6);
    			append_dev(div14, h31);
    			append_dev(div14, t8);
    			append_dev(div14, p1);
    			p1.innerHTML = raw2_value;
    			append_dev(div14, t9);
    			mount_component(cytosiswip1, div14, null);
    			append_dev(div14, t10);
    			append_dev(div14, p2);
    			append_dev(p2, t11);
    			append_dev(p2, t12);
    			append_dev(p2, t13);
    			append_dev(div14, t14);
    			append_dev(div14, div5);
    			append_dev(div5, div4);
    			append_dev(div4, p3);
    			append_dev(p3, t15);
    			append_dev(p3, t16);
    			append_dev(div4, t17);
    			append_dev(div4, div1);
    			append_dev(div1, label0);
    			append_dev(label0, input0);
    			input0.checked = input0.__value === /*filterChoice*/ ctx[6];
    			append_dev(label0, t18);
    			append_dev(div4, t19);
    			append_dev(div4, div2);
    			append_dev(div2, label1);
    			append_dev(label1, input1);
    			input1.checked = input1.__value === /*filterChoice*/ ctx[6];
    			append_dev(label1, t20);
    			append_dev(div4, t21);
    			append_dev(div4, div3);
    			append_dev(div3, label2);
    			append_dev(label2, input2);
    			input2.checked = input2.__value === /*filterChoice*/ ctx[6];
    			append_dev(label2, t22);
    			append_dev(div5, t23);
    			mount_component(cytosiswip2, div5, null);
    			append_dev(div14, t24);
    			append_dev(div14, h32);
    			append_dev(div14, t26);
    			append_dev(div14, p4);
    			p4.innerHTML = raw3_value;
    			append_dev(div14, t27);
    			append_dev(div14, div9);
    			append_dev(div9, div8);
    			append_dev(div8, p5);
    			append_dev(p5, t28);
    			append_dev(p5, t29);
    			append_dev(p5, t30);
    			append_dev(p5, t31);
    			append_dev(div8, t32);
    			append_dev(div8, div6);
    			append_dev(div6, label3);
    			append_dev(label3, input3);
    			input3.checked = input3.__value === /*sortChoice*/ ctx[7];
    			append_dev(label3, t33);
    			append_dev(div8, t34);
    			append_dev(div8, div7);
    			append_dev(div7, label4);
    			append_dev(label4, input4);
    			input4.checked = input4.__value === /*sortChoice*/ ctx[7];
    			append_dev(label4, t35);
    			append_dev(div9, t36);
    			mount_component(cytosiswip3, div9, null);
    			append_dev(div14, t37);
    			append_dev(div14, h33);
    			append_dev(div14, t39);
    			append_dev(div14, p6);
    			p6.innerHTML = raw4_value;
    			append_dev(div14, t40);
    			append_dev(div14, div13);
    			append_dev(div13, div12);
    			append_dev(div12, div10);
    			append_dev(div10, label5);
    			append_dev(label5, input5);
    			input5.checked = /*showContentField*/ ctx[10];
    			append_dev(label5, t41);
    			append_dev(div12, t42);
    			append_dev(div12, div11);
    			append_dev(div11, label6);
    			append_dev(label6, input6);
    			input6.checked = /*showTagsField*/ ctx[9];
    			append_dev(label6, t43);
    			append_dev(div13, t44);
    			mount_component(cytosiswip4, div13, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[25]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[27]),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[28]),
    					listen_dev(input3, "change", /*input3_change_handler*/ ctx[31]),
    					listen_dev(input3, "click", /*click_handler*/ ctx[32], false, false, false),
    					listen_dev(input4, "change", /*input4_change_handler*/ ctx[33]),
    					listen_dev(input4, "click", /*click_handler_1*/ ctx[34], false, false, false),
    					listen_dev(input5, "change", /*input5_change_handler*/ ctx[37]),
    					listen_dev(input6, "change", /*input6_change_handler*/ ctx[38])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if ((!current || dirty[0] & /*description*/ 2) && raw0_value !== (raw0_value = marked_1(/*description*/ ctx[1]) + "")) div0.innerHTML = raw0_value;			if ((!current || dirty[0] & /*views*/ 4) && raw1_value !== (raw1_value = marked_1(/*views*/ ctx[2]) + "")) p0.innerHTML = raw1_value;			const cytosiswip0_changes = {};

    			if (dirty[0] & /*cytosisObject_One, cytosisLoading_One*/ 6144 | dirty[1] & /*$$scope*/ 131072) {
    				cytosiswip0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_isLoading && dirty[0] & /*cytosisLoading_One*/ 4096) {
    				updating_isLoading = true;
    				cytosiswip0_changes.isLoading = /*cytosisLoading_One*/ ctx[12];
    				add_flush_callback(() => updating_isLoading = false);
    			}

    			if (!updating_cytosis && dirty[0] & /*cytosisObject_One*/ 2048) {
    				updating_cytosis = true;
    				cytosiswip0_changes.cytosis = /*cytosisObject_One*/ ctx[11];
    				add_flush_callback(() => updating_cytosis = false);
    			}

    			cytosiswip0.$set(cytosiswip0_changes);
    			if ((!current || dirty[0] & /*filters*/ 8) && raw2_value !== (raw2_value = marked_1(/*filters*/ ctx[3]) + "")) p1.innerHTML = raw2_value;			const cytosiswip1_changes = {};

    			if (dirty[0] & /*cytosisObject_Two, cytosisLoading_Two*/ 24576 | dirty[1] & /*$$scope*/ 131072) {
    				cytosiswip1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_isLoading_1 && dirty[0] & /*cytosisLoading_Two*/ 16384) {
    				updating_isLoading_1 = true;
    				cytosiswip1_changes.isLoading = /*cytosisLoading_Two*/ ctx[14];
    				add_flush_callback(() => updating_isLoading_1 = false);
    			}

    			if (!updating_cytosis_1 && dirty[0] & /*cytosisObject_Two*/ 8192) {
    				updating_cytosis_1 = true;
    				cytosiswip1_changes.cytosis = /*cytosisObject_Two*/ ctx[13];
    				add_flush_callback(() => updating_cytosis_1 = false);
    			}

    			cytosiswip1.$set(cytosiswip1_changes);
    			if (!current || dirty[0] & /*filterChoice*/ 64) set_data_dev(t12, /*filterChoice*/ ctx[6]);
    			if (!current || dirty[0] & /*filterChoice*/ 64) set_data_dev(t16, /*filterChoice*/ ctx[6]);

    			if (dirty[0] & /*filterChoice*/ 64) {
    				input0.checked = input0.__value === /*filterChoice*/ ctx[6];
    			}

    			if (dirty[0] & /*filterChoice*/ 64) {
    				input1.checked = input1.__value === /*filterChoice*/ ctx[6];
    			}

    			if (dirty[0] & /*filterChoice*/ 64) {
    				input2.checked = input2.__value === /*filterChoice*/ ctx[6];
    			}

    			const cytosiswip2_changes = {};

    			if (dirty[0] & /*filterChoice*/ 64) cytosiswip2_changes.options = {
    				apiKey: "keygfuzbhXK1VShlR",
    				baseId: "appc0M3MdTYATe7RO",
    				configName: "content-all",
    				routeDetails: "Demo Seven, Example 3",
    				tableOptions: {
    					filterByFormula: `FIND("${/*filterChoice*/ ctx[6]}",Tags)`
    				}
    			};

    			if (dirty[0] & /*cytosisObject_Three, cytosisLoading_Three*/ 98304 | dirty[1] & /*$$scope*/ 131072) {
    				cytosiswip2_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_isLoading_2 && dirty[0] & /*cytosisLoading_Three*/ 65536) {
    				updating_isLoading_2 = true;
    				cytosiswip2_changes.isLoading = /*cytosisLoading_Three*/ ctx[16];
    				add_flush_callback(() => updating_isLoading_2 = false);
    			}

    			if (!updating_cytosis_2 && dirty[0] & /*cytosisObject_Three*/ 32768) {
    				updating_cytosis_2 = true;
    				cytosiswip2_changes.cytosis = /*cytosisObject_Three*/ ctx[15];
    				add_flush_callback(() => updating_cytosis_2 = false);
    			}

    			cytosiswip2.$set(cytosiswip2_changes);
    			if ((!current || dirty[0] & /*sorting*/ 16) && raw3_value !== (raw3_value = marked_1(/*sorting*/ ctx[4]) + "")) p4.innerHTML = raw3_value;			if (!current || dirty[0] & /*sortChoice*/ 128) set_data_dev(t29, /*sortChoice*/ ctx[7]);
    			if ((!current || dirty[0] & /*sortArray*/ 256) && t31_value !== (t31_value = JSON.stringify(/*sortArray*/ ctx[8]) + "")) set_data_dev(t31, t31_value);

    			if (dirty[0] & /*sortChoice*/ 128) {
    				input3.checked = input3.__value === /*sortChoice*/ ctx[7];
    			}

    			if (dirty[0] & /*sortChoice*/ 128) {
    				input4.checked = input4.__value === /*sortChoice*/ ctx[7];
    			}

    			const cytosiswip3_changes = {};

    			if (dirty[0] & /*sortArray*/ 256) cytosiswip3_changes.options = {
    				apiKey: "keygfuzbhXK1VShlR",
    				baseId: "appc0M3MdTYATe7RO",
    				configName: "sort-content",
    				routeDetails: "Demo Seven, Example 4",
    				tableOptions: { sort: /*sortArray*/ ctx[8] }
    			};

    			if (dirty[0] & /*cytosisObject_Four, cytosisLoading_Four*/ 393216 | dirty[1] & /*$$scope*/ 131072) {
    				cytosiswip3_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_isLoading_3 && dirty[0] & /*cytosisLoading_Four*/ 262144) {
    				updating_isLoading_3 = true;
    				cytosiswip3_changes.isLoading = /*cytosisLoading_Four*/ ctx[18];
    				add_flush_callback(() => updating_isLoading_3 = false);
    			}

    			if (!updating_cytosis_3 && dirty[0] & /*cytosisObject_Four*/ 131072) {
    				updating_cytosis_3 = true;
    				cytosiswip3_changes.cytosis = /*cytosisObject_Four*/ ctx[17];
    				add_flush_callback(() => updating_cytosis_3 = false);
    			}

    			cytosiswip3.$set(cytosiswip3_changes);
    			if ((!current || dirty[0] & /*fields*/ 32) && raw4_value !== (raw4_value = marked_1(/*fields*/ ctx[5]) + "")) p6.innerHTML = raw4_value;
    			if (dirty[0] & /*showContentField*/ 1024) {
    				input5.checked = /*showContentField*/ ctx[10];
    			}

    			if (dirty[0] & /*showTagsField*/ 512) {
    				input6.checked = /*showTagsField*/ ctx[9];
    			}

    			const cytosiswip4_changes = {};

    			if (dirty[0] & /*showTagsField, showContentField*/ 1536) cytosiswip4_changes.options = {
    				apiKey: "keygfuzbhXK1VShlR",
    				baseId: "appc0M3MdTYATe7RO",
    				configName: "filter-all",
    				routeDetails: "Demo Seven, Example 5",
    				tableOptions: {
    					fields: [
    						.../*showTagsField*/ ctx[9] ? ["Tags"] : [],
    						.../*showContentField*/ ctx[10] ? ["Content"] : []
    					]
    				}
    			};

    			if (dirty[0] & /*cytosisObject_Five, cytosisLoading_Five*/ 1572864 | dirty[1] & /*$$scope*/ 131072) {
    				cytosiswip4_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_isLoading_4 && dirty[0] & /*cytosisLoading_Five*/ 1048576) {
    				updating_isLoading_4 = true;
    				cytosiswip4_changes.isLoading = /*cytosisLoading_Five*/ ctx[20];
    				add_flush_callback(() => updating_isLoading_4 = false);
    			}

    			if (!updating_cytosis_4 && dirty[0] & /*cytosisObject_Five*/ 524288) {
    				updating_cytosis_4 = true;
    				cytosiswip4_changes.cytosis = /*cytosisObject_Five*/ ctx[19];
    				add_flush_callback(() => updating_cytosis_4 = false);
    			}

    			cytosiswip4.$set(cytosiswip4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cytosiswip0.$$.fragment, local);
    			transition_in(cytosiswip1.$$.fragment, local);
    			transition_in(cytosiswip2.$$.fragment, local);
    			transition_in(cytosiswip3.$$.fragment, local);
    			transition_in(cytosiswip4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cytosiswip0.$$.fragment, local);
    			transition_out(cytosiswip1.$$.fragment, local);
    			transition_out(cytosiswip2.$$.fragment, local);
    			transition_out(cytosiswip3.$$.fragment, local);
    			transition_out(cytosiswip4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div14);
    			destroy_component(cytosiswip0);
    			destroy_component(cytosiswip1);
    			/*$$binding_groups*/ ctx[26][0].splice(/*$$binding_groups*/ ctx[26][0].indexOf(input0), 1);
    			/*$$binding_groups*/ ctx[26][0].splice(/*$$binding_groups*/ ctx[26][0].indexOf(input1), 1);
    			/*$$binding_groups*/ ctx[26][0].splice(/*$$binding_groups*/ ctx[26][0].indexOf(input2), 1);
    			destroy_component(cytosiswip2);
    			/*$$binding_groups*/ ctx[26][1].splice(/*$$binding_groups*/ ctx[26][1].indexOf(input3), 1);
    			/*$$binding_groups*/ ctx[26][1].splice(/*$$binding_groups*/ ctx[26][1].indexOf(input4), 1);
    			destroy_component(cytosiswip3);
    			destroy_component(cytosiswip4);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	marked_1.setOptions({ gfm: true, breaks: true });
    	let { title = `7. Views, filtering, sorting, and fields` } = $$props;
    	let { description = `This demo shows how to take advantage of the Airtable API and Cytosis' views, filtering, sorting, and fields mechanisms.` } = $$props;

    	let { views = `In Airtable, each Table can have one or more views, that let you look at the data in different ways. For example, you might have a view with a filter that only lets you look at items with a Status (a single select) option of "Published". The view might also be able to sort and filter the data accordingly.

Because views are created and managed directly in Airtable, they're an easy way to control how data shows up on your site.

In this example, we look at a view that only shows "preview" content by creating a view in Airtable called "Preview", adding a filter that only show rows with "Status" marked as "Preview", and adding a config row in the _cytosis table called "content-published" that's set to use the view "Preview".

  Be aware that setting content to "Published" doesn't completely hide it from Cytosis, it just allows you to control what the site sees. Users could still dig into the code and find content with a "Published" tag — the view is just there to control what shows up on your site, not for security reasons. If you need it to be secure, you can use a serverless/microservice with Cytosis installed, as a proxy,   

  ` } = $$props;

    	let { filters = `Most of the time you only really need to access filters and sorting through views — that's the easiest way to set up your data. Code-based views and filters can useful if you need your filters to be programmatic, or because your use case requires too many different views to be manageable in Airtable, or if you need dynamic views.

  In this example, we query all items in the 'Site Content' table with the 'site-content-all' query, but we then apply an Airtable [Filter Formula](https://support.airtable.com/hc/en-us/articles/203255215-Formula-Field-Reference) to only get the Preview item.

  For example, to only include records where Name isn't empty, pass in \`NOT({Name} = '')\`. Formulas can get tricky to test and write here, but in Airtable, just create a new formula field (column), and you can test your formulas that way before copying them into code. For this example, we use the formula: \`{Status} = "Preview"\`
  ` } = $$props;

    	let { sorting = `Sorting takes a sorting object, which wraps a sort array (check the base-specific API docs by going to Help > API Documentation in Airtable). In this example we can either sort by the Name field or by the Content field.
  ` } = $$props;

    	let { fields = `In Airtable, a "field" is a column. The Fields field lets you specify the fields that Airtable returns, which could help reduce data load, if you have a large table. Airtable fields takes an array of field names like 'fields: ["Name", "Content"]'. If both fields are removed from the array, Airtable will return all fields.
  ` } = $$props;

    	let status, filterChoice = "Filter One";
    	let sortChoice = "Sort by Name", sortArray = [{ field: "Name", direction: "asc" }];
    	let showTagsField = true, showContentField = true, fieldsArray = [];
    	let cytosisObject_One, cytosisLoading_One = false;
    	let cytosisObject_Two, cytosisLoading_Two = false;
    	let cytosisObject_Three, cytosisLoading_Three = false;
    	let cytosisObject_Four, cytosisLoading_Four = false;
    	let cytosisObject_Five, cytosisLoading_Five = false;
    	const writable_props = ["title", "description", "views", "filters", "sorting", "fields"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DemoSeven> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DemoSeven", $$slots, []);
    	const $$binding_groups = [[], []];

    	function cytosiswip0_isLoading_binding(value) {
    		cytosisLoading_One = value;
    		$$invalidate(12, cytosisLoading_One);
    	}

    	function cytosiswip0_cytosis_binding(value) {
    		cytosisObject_One = value;
    		$$invalidate(11, cytosisObject_One);
    	}

    	function cytosiswip1_isLoading_binding(value) {
    		cytosisLoading_Two = value;
    		$$invalidate(14, cytosisLoading_Two);
    	}

    	function cytosiswip1_cytosis_binding(value) {
    		cytosisObject_Two = value;
    		$$invalidate(13, cytosisObject_Two);
    	}

    	function input0_change_handler() {
    		filterChoice = this.__value;
    		$$invalidate(6, filterChoice);
    	}

    	function input1_change_handler() {
    		filterChoice = this.__value;
    		$$invalidate(6, filterChoice);
    	}

    	function input2_change_handler() {
    		filterChoice = this.__value;
    		$$invalidate(6, filterChoice);
    	}

    	function cytosiswip2_isLoading_binding(value) {
    		cytosisLoading_Three = value;
    		$$invalidate(16, cytosisLoading_Three);
    	}

    	function cytosiswip2_cytosis_binding(value) {
    		cytosisObject_Three = value;
    		$$invalidate(15, cytosisObject_Three);
    	}

    	function input3_change_handler() {
    		sortChoice = this.__value;
    		$$invalidate(7, sortChoice);
    	}

    	const click_handler = () => {
    		$$invalidate(8, sortArray = [{ field: "Name", direction: "asc" }]);
    	};

    	function input4_change_handler() {
    		sortChoice = this.__value;
    		$$invalidate(7, sortChoice);
    	}

    	const click_handler_1 = () => {
    		$$invalidate(8, sortArray = [{ field: "Content", direction: "asc" }]);
    	};

    	function cytosiswip3_isLoading_binding(value) {
    		cytosisLoading_Four = value;
    		$$invalidate(18, cytosisLoading_Four);
    	}

    	function cytosiswip3_cytosis_binding(value) {
    		cytosisObject_Four = value;
    		$$invalidate(17, cytosisObject_Four);
    	}

    	function input5_change_handler() {
    		showContentField = this.checked;
    		$$invalidate(10, showContentField);
    	}

    	function input6_change_handler() {
    		showTagsField = this.checked;
    		$$invalidate(9, showTagsField);
    	}

    	function cytosiswip4_isLoading_binding(value) {
    		cytosisLoading_Five = value;
    		$$invalidate(20, cytosisLoading_Five);
    	}

    	function cytosiswip4_cytosis_binding(value) {
    		cytosisObject_Five = value;
    		$$invalidate(19, cytosisObject_Five);
    	}

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("views" in $$props) $$invalidate(2, views = $$props.views);
    		if ("filters" in $$props) $$invalidate(3, filters = $$props.filters);
    		if ("sorting" in $$props) $$invalidate(4, sorting = $$props.sorting);
    		if ("fields" in $$props) $$invalidate(5, fields = $$props.fields);
    	};

    	$$self.$capture_state = () => ({
    		Cytosis,
    		CytosisWip,
    		marked: marked_1,
    		title,
    		description,
    		views,
    		filters,
    		sorting,
    		fields,
    		status,
    		filterChoice,
    		sortChoice,
    		sortArray,
    		showTagsField,
    		showContentField,
    		fieldsArray,
    		cytosisObject_One,
    		cytosisLoading_One,
    		cytosisObject_Two,
    		cytosisLoading_Two,
    		cytosisObject_Three,
    		cytosisLoading_Three,
    		cytosisObject_Four,
    		cytosisLoading_Four,
    		cytosisObject_Five,
    		cytosisLoading_Five
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("views" in $$props) $$invalidate(2, views = $$props.views);
    		if ("filters" in $$props) $$invalidate(3, filters = $$props.filters);
    		if ("sorting" in $$props) $$invalidate(4, sorting = $$props.sorting);
    		if ("fields" in $$props) $$invalidate(5, fields = $$props.fields);
    		if ("status" in $$props) status = $$props.status;
    		if ("filterChoice" in $$props) $$invalidate(6, filterChoice = $$props.filterChoice);
    		if ("sortChoice" in $$props) $$invalidate(7, sortChoice = $$props.sortChoice);
    		if ("sortArray" in $$props) $$invalidate(8, sortArray = $$props.sortArray);
    		if ("showTagsField" in $$props) $$invalidate(9, showTagsField = $$props.showTagsField);
    		if ("showContentField" in $$props) $$invalidate(10, showContentField = $$props.showContentField);
    		if ("fieldsArray" in $$props) fieldsArray = $$props.fieldsArray;
    		if ("cytosisObject_One" in $$props) $$invalidate(11, cytosisObject_One = $$props.cytosisObject_One);
    		if ("cytosisLoading_One" in $$props) $$invalidate(12, cytosisLoading_One = $$props.cytosisLoading_One);
    		if ("cytosisObject_Two" in $$props) $$invalidate(13, cytosisObject_Two = $$props.cytosisObject_Two);
    		if ("cytosisLoading_Two" in $$props) $$invalidate(14, cytosisLoading_Two = $$props.cytosisLoading_Two);
    		if ("cytosisObject_Three" in $$props) $$invalidate(15, cytosisObject_Three = $$props.cytosisObject_Three);
    		if ("cytosisLoading_Three" in $$props) $$invalidate(16, cytosisLoading_Three = $$props.cytosisLoading_Three);
    		if ("cytosisObject_Four" in $$props) $$invalidate(17, cytosisObject_Four = $$props.cytosisObject_Four);
    		if ("cytosisLoading_Four" in $$props) $$invalidate(18, cytosisLoading_Four = $$props.cytosisLoading_Four);
    		if ("cytosisObject_Five" in $$props) $$invalidate(19, cytosisObject_Five = $$props.cytosisObject_Five);
    		if ("cytosisLoading_Five" in $$props) $$invalidate(20, cytosisLoading_Five = $$props.cytosisLoading_Five);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		description,
    		views,
    		filters,
    		sorting,
    		fields,
    		filterChoice,
    		sortChoice,
    		sortArray,
    		showTagsField,
    		showContentField,
    		cytosisObject_One,
    		cytosisLoading_One,
    		cytosisObject_Two,
    		cytosisLoading_Two,
    		cytosisObject_Three,
    		cytosisLoading_Three,
    		cytosisObject_Four,
    		cytosisLoading_Four,
    		cytosisObject_Five,
    		cytosisLoading_Five,
    		cytosiswip0_isLoading_binding,
    		cytosiswip0_cytosis_binding,
    		cytosiswip1_isLoading_binding,
    		cytosiswip1_cytosis_binding,
    		input0_change_handler,
    		$$binding_groups,
    		input1_change_handler,
    		input2_change_handler,
    		cytosiswip2_isLoading_binding,
    		cytosiswip2_cytosis_binding,
    		input3_change_handler,
    		click_handler,
    		input4_change_handler,
    		click_handler_1,
    		cytosiswip3_isLoading_binding,
    		cytosiswip3_cytosis_binding,
    		input5_change_handler,
    		input6_change_handler,
    		cytosiswip4_isLoading_binding,
    		cytosiswip4_cytosis_binding
    	];
    }

    class DemoSeven extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$9,
    			create_fragment$9,
    			safe_not_equal,
    			{
    				title: 0,
    				description: 1,
    				views: 2,
    				filters: 3,
    				sorting: 4,
    				fields: 5
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DemoSeven",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get title() {
    		return this.$$.ctx[0];
    	}

    	set title(title) {
    		this.$set({ title });
    		flush();
    	}

    	get description() {
    		return this.$$.ctx[1];
    	}

    	set description(description) {
    		this.$set({ description });
    		flush();
    	}

    	get views() {
    		return this.$$.ctx[2];
    	}

    	set views(views) {
    		this.$set({ views });
    		flush();
    	}

    	get filters() {
    		return this.$$.ctx[3];
    	}

    	set filters(filters) {
    		this.$set({ filters });
    		flush();
    	}

    	get sorting() {
    		return this.$$.ctx[4];
    	}

    	set sorting(sorting) {
    		this.$set({ sorting });
    		flush();
    	}

    	get fields() {
    		return this.$$.ctx[5];
    	}

    	set fields(fields) {
    		this.$set({ fields });
    		flush();
    	}
    }

    /* src/examples/DemoEight.svelte generated by Svelte v3.24.0 */

    const { console: console_1$8 } = globals;
    const file$a = "src/examples/DemoEight.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    // (74:4) {#if cytosisLoading}
    function create_if_block_2$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("... loading Cytosis object ...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(74:4) {#if cytosisLoading}",
    		ctx
    	});

    	return block;
    }

    // (77:4) {#if cytosisObject}
    function create_if_block$7(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t;
    	let each_value = /*cytosisObject*/ ctx[11].results["Site Content"];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[22].id;
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	let if_block = /*cytosisObject*/ ctx[11].results["Site Content"].length == 0 && create_if_block_1$7(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "_card _padding --flat svelte-14285hj");
    			add_location(div, file$a, 77, 6, 2201);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*marked, cytosisObject*/ 2048) {
    				const each_value = /*cytosisObject*/ ctx[11].results["Site Content"];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block$3, t, get_each_context$3);
    			}

    			if (/*cytosisObject*/ ctx[11].results["Site Content"].length == 0) {
    				if (if_block) ; else {
    					if_block = create_if_block_1$7(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(77:4) {#if cytosisObject}",
    		ctx
    	});

    	return block;
    }

    // (79:8) {#each cytosisObject.results['Site Content'] as item (item.id)}
    function create_each_block$3(key_1, ctx) {
    	let p;
    	let raw_value = marked_1(/*item*/ ctx[22].fields["Content"]) + "";

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			p = element("p");
    			attr_dev(p, "class", "svelte-14285hj");
    			add_location(p, file$a, 79, 12, 2321);
    			this.first = p;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			p.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cytosisObject*/ 2048 && raw_value !== (raw_value = marked_1(/*item*/ ctx[22].fields["Content"]) + "")) p.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(79:8) {#each cytosisObject.results['Site Content'] as item (item.id)}",
    		ctx
    	});

    	return block;
    }

    // (82:8) {#if cytosisObject.results['Site Content'].length ==0}
    function create_if_block_1$7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("No results — please tweak your search terms");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$7.name,
    		type: "if",
    		source: "(82:8) {#if cytosisObject.results['Site Content'].length ==0}",
    		ctx
    	});

    	return block;
    }

    // (56:2) <CytosisWip     options={{       apiKey: 'keygfuzbhXK1VShlR',       baseId: 'appc0M3MdTYATe7RO',       configName: 'content-all',       routeDetails: 'Demo Eight',       tableOptions: {         keyword: searchTerm && !searchArray ? searchTerm : undefined,         keywords : searchTerm && searchArray,         // matchKeywordWithField: 'Content',         matchKeywordWithFields: matchFields,         matchStyle: exactMatch == true ? 'exact' : 'partial',         matchCase,       }     }}     bind:isLoading={cytosisLoading}     bind:cytosis={cytosisObject}   >
    function create_default_slot$7(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*cytosisLoading*/ ctx[12] && create_if_block_2$4(ctx);
    	let if_block1 = /*cytosisObject*/ ctx[11] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*cytosisLoading*/ ctx[12]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_2$4(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*cytosisObject*/ ctx[11]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$7(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(56:2) <CytosisWip     options={{       apiKey: 'keygfuzbhXK1VShlR',       baseId: 'appc0M3MdTYATe7RO',       configName: 'content-all',       routeDetails: 'Demo Eight',       tableOptions: {         keyword: searchTerm && !searchArray ? searchTerm : undefined,         keywords : searchTerm && searchArray,         // matchKeywordWithField: 'Content',         matchKeywordWithFields: matchFields,         matchStyle: exactMatch == true ? 'exact' : 'partial',         matchCase,       }     }}     bind:isLoading={cytosisLoading}     bind:cytosis={cytosisObject}   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div11;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let raw0_value = marked_1(/*description*/ ctx[1]) + "";
    	let t2;
    	let div1;
    	let raw1_value = marked_1(/*more*/ ctx[2]) + "";
    	let t3;
    	let div10;
    	let label0;
    	let t4;
    	let t5_value = (/*searchTerm*/ ctx[3] || "type something") + "";
    	let t5;
    	let t6;
    	let t7;
    	let input0;
    	let t8;
    	let div9;
    	let div4;
    	let div2;
    	let label1;
    	let input1;
    	let t9;
    	let t10;
    	let div3;
    	let label2;
    	let input2;
    	let t11;
    	let t12;
    	let div8;
    	let div5;
    	let label3;
    	let input3;
    	let t13;
    	let t14;
    	let div6;
    	let label4;
    	let input4;
    	let t15;
    	let t16;
    	let div7;
    	let label5;
    	let input5;
    	let t17;
    	let t18;
    	let cytosiswip;
    	let updating_isLoading;
    	let updating_cytosis;
    	let current;
    	let mounted;
    	let dispose;

    	function cytosiswip_isLoading_binding(value) {
    		/*cytosiswip_isLoading_binding*/ ctx[19].call(null, value);
    	}

    	function cytosiswip_cytosis_binding(value) {
    		/*cytosiswip_cytosis_binding*/ ctx[20].call(null, value);
    	}

    	let cytosiswip_props = {
    		options: {
    			apiKey: "keygfuzbhXK1VShlR",
    			baseId: "appc0M3MdTYATe7RO",
    			configName: "content-all",
    			routeDetails: "Demo Eight",
    			tableOptions: {
    				keyword: /*searchTerm*/ ctx[3] && !/*searchArray*/ ctx[4]
    				? /*searchTerm*/ ctx[3]
    				: undefined,
    				keywords: /*searchTerm*/ ctx[3] && /*searchArray*/ ctx[4],
    				// matchKeywordWithField: 'Content',
    				matchKeywordWithFields: /*matchFields*/ ctx[10],
    				matchStyle: /*exactMatch*/ ctx[5] == true ? "exact" : "partial",
    				matchCase: /*matchCase*/ ctx[6]
    			}
    		},
    		$$slots: { default: [create_default_slot$7] },
    		$$scope: { ctx }
    	};

    	if (/*cytosisLoading*/ ctx[12] !== void 0) {
    		cytosiswip_props.isLoading = /*cytosisLoading*/ ctx[12];
    	}

    	if (/*cytosisObject*/ ctx[11] !== void 0) {
    		cytosiswip_props.cytosis = /*cytosisObject*/ ctx[11];
    	}

    	cytosiswip = new CytosisWip({ props: cytosiswip_props, $$inline: true });
    	binding_callbacks.push(() => bind(cytosiswip, "isLoading", cytosiswip_isLoading_binding));
    	binding_callbacks.push(() => bind(cytosiswip, "cytosis", cytosiswip_cytosis_binding));

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			div1 = element("div");
    			t3 = space();
    			div10 = element("div");
    			label0 = element("label");
    			t4 = text("Search: (");
    			t5 = text(t5_value);
    			t6 = text(")");
    			t7 = space();
    			input0 = element("input");
    			t8 = space();
    			div9 = element("div");
    			div4 = element("div");
    			div2 = element("div");
    			label1 = element("label");
    			input1 = element("input");
    			t9 = text("\n            Exact match?");
    			t10 = space();
    			div3 = element("div");
    			label2 = element("label");
    			input2 = element("input");
    			t11 = text("\n            Match case?");
    			t12 = space();
    			div8 = element("div");
    			div5 = element("div");
    			label3 = element("label");
    			input3 = element("input");
    			t13 = text("\n            Use [Name] field");
    			t14 = space();
    			div6 = element("div");
    			label4 = element("label");
    			input4 = element("input");
    			t15 = text("\n            Use [Content] field");
    			t16 = space();
    			div7 = element("div");
    			label5 = element("label");
    			input5 = element("input");
    			t17 = text("\n            Use [Id] field");
    			t18 = space();
    			create_component(cytosiswip.$$.fragment);
    			attr_dev(h2, "class", "svelte-14285hj");
    			add_location(h2, file$a, 3, 2, 46);
    			attr_dev(div0, "class", "svelte-14285hj");
    			add_location(div0, file$a, 4, 2, 67);
    			attr_dev(div1, "class", "svelte-14285hj");
    			add_location(div1, file$a, 5, 2, 109);
    			attr_dev(label0, "class", "_form-label svelte-14285hj");
    			add_location(label0, file$a, 10, 4, 202);
    			attr_dev(input0, "class", "_form-input __width-full svelte-14285hj");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$a, 11, 4, 285);
    			attr_dev(input1, "type", "checkbox");
    			attr_dev(input1, "class", "svelte-14285hj");
    			add_location(input1, file$a, 16, 12, 524);
    			attr_dev(label1, "class", "svelte-14285hj");
    			add_location(label1, file$a, 15, 10, 504);
    			attr_dev(div2, "class", "_form-checkbox __inline _padding-top svelte-14285hj");
    			add_location(div2, file$a, 14, 8, 443);
    			attr_dev(input2, "type", "checkbox");
    			attr_dev(input2, "class", "svelte-14285hj");
    			add_location(input2, file$a, 23, 12, 721);
    			attr_dev(label2, "class", "svelte-14285hj");
    			add_location(label2, file$a, 22, 10, 701);
    			attr_dev(div3, "class", "_form-checkbox __inline  svelte-14285hj");
    			add_location(div3, file$a, 21, 8, 652);
    			attr_dev(div4, "class", "_card _padding svelte-14285hj");
    			add_location(div4, file$a, 13, 6, 406);
    			attr_dev(input3, "type", "checkbox");
    			attr_dev(input3, "class", "svelte-14285hj");
    			add_location(input3, file$a, 32, 12, 976);
    			attr_dev(label3, "class", "svelte-14285hj");
    			add_location(label3, file$a, 31, 10, 956);
    			attr_dev(div5, "class", "_form-checkbox __inline _padding-top svelte-14285hj");
    			add_location(div5, file$a, 30, 8, 895);
    			attr_dev(input4, "type", "checkbox");
    			attr_dev(input4, "class", "svelte-14285hj");
    			add_location(input4, file$a, 39, 12, 1176);
    			attr_dev(label4, "class", "svelte-14285hj");
    			add_location(label4, file$a, 38, 10, 1156);
    			attr_dev(div6, "class", "_form-checkbox __inline  svelte-14285hj");
    			add_location(div6, file$a, 37, 8, 1107);
    			attr_dev(input5, "type", "checkbox");
    			attr_dev(input5, "class", "svelte-14285hj");
    			add_location(input5, file$a, 46, 12, 1382);
    			attr_dev(label5, "class", "svelte-14285hj");
    			add_location(label5, file$a, 45, 10, 1362);
    			attr_dev(div7, "class", "_form-checkbox __inline  svelte-14285hj");
    			add_location(div7, file$a, 44, 8, 1313);
    			attr_dev(div8, "class", "_card _padding svelte-14285hj");
    			add_location(div8, file$a, 29, 6, 858);
    			attr_dev(div9, "class", "_grid-2 _margin-top svelte-14285hj");
    			add_location(div9, file$a, 12, 4, 366);
    			attr_dev(div10, "class", "Formlet Formlet-input _form-control svelte-14285hj");
    			add_location(div10, file$a, 9, 2, 147);
    			attr_dev(div11, "class", " svelte-14285hj");
    			add_location(div11, file$a, 2, 0, 29);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			append_dev(div11, h2);
    			append_dev(h2, t0);
    			append_dev(div11, t1);
    			append_dev(div11, div0);
    			div0.innerHTML = raw0_value;
    			append_dev(div11, t2);
    			append_dev(div11, div1);
    			div1.innerHTML = raw1_value;
    			append_dev(div11, t3);
    			append_dev(div11, div10);
    			append_dev(div10, label0);
    			append_dev(label0, t4);
    			append_dev(label0, t5);
    			append_dev(label0, t6);
    			append_dev(div10, t7);
    			append_dev(div10, input0);
    			set_input_value(input0, /*searchTerm*/ ctx[3]);
    			append_dev(div10, t8);
    			append_dev(div10, div9);
    			append_dev(div9, div4);
    			append_dev(div4, div2);
    			append_dev(div2, label1);
    			append_dev(label1, input1);
    			input1.checked = /*exactMatch*/ ctx[5];
    			append_dev(label1, t9);
    			append_dev(div4, t10);
    			append_dev(div4, div3);
    			append_dev(div3, label2);
    			append_dev(label2, input2);
    			input2.checked = /*matchCase*/ ctx[6];
    			append_dev(label2, t11);
    			append_dev(div9, t12);
    			append_dev(div9, div8);
    			append_dev(div8, div5);
    			append_dev(div5, label3);
    			append_dev(label3, input3);
    			input3.checked = /*matchName*/ ctx[7];
    			append_dev(label3, t13);
    			append_dev(div8, t14);
    			append_dev(div8, div6);
    			append_dev(div6, label4);
    			append_dev(label4, input4);
    			input4.checked = /*matchContent*/ ctx[8];
    			append_dev(label4, t15);
    			append_dev(div8, t16);
    			append_dev(div8, div7);
    			append_dev(div7, label5);
    			append_dev(label5, input5);
    			input5.checked = /*matchId*/ ctx[9];
    			append_dev(label5, t17);
    			append_dev(div11, t18);
    			mount_component(cytosiswip, div11, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[13]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[14]),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[15]),
    					listen_dev(input3, "change", /*input3_change_handler*/ ctx[16]),
    					listen_dev(input4, "change", /*input4_change_handler*/ ctx[17]),
    					listen_dev(input5, "change", /*input5_change_handler*/ ctx[18])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if ((!current || dirty & /*description*/ 2) && raw0_value !== (raw0_value = marked_1(/*description*/ ctx[1]) + "")) div0.innerHTML = raw0_value;			if ((!current || dirty & /*more*/ 4) && raw1_value !== (raw1_value = marked_1(/*more*/ ctx[2]) + "")) div1.innerHTML = raw1_value;			if ((!current || dirty & /*searchTerm*/ 8) && t5_value !== (t5_value = (/*searchTerm*/ ctx[3] || "type something") + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*searchTerm*/ 8 && input0.value !== /*searchTerm*/ ctx[3]) {
    				set_input_value(input0, /*searchTerm*/ ctx[3]);
    			}

    			if (dirty & /*exactMatch*/ 32) {
    				input1.checked = /*exactMatch*/ ctx[5];
    			}

    			if (dirty & /*matchCase*/ 64) {
    				input2.checked = /*matchCase*/ ctx[6];
    			}

    			if (dirty & /*matchName*/ 128) {
    				input3.checked = /*matchName*/ ctx[7];
    			}

    			if (dirty & /*matchContent*/ 256) {
    				input4.checked = /*matchContent*/ ctx[8];
    			}

    			if (dirty & /*matchId*/ 512) {
    				input5.checked = /*matchId*/ ctx[9];
    			}

    			const cytosiswip_changes = {};

    			if (dirty & /*searchTerm, searchArray, matchFields, exactMatch, matchCase*/ 1144) cytosiswip_changes.options = {
    				apiKey: "keygfuzbhXK1VShlR",
    				baseId: "appc0M3MdTYATe7RO",
    				configName: "content-all",
    				routeDetails: "Demo Eight",
    				tableOptions: {
    					keyword: /*searchTerm*/ ctx[3] && !/*searchArray*/ ctx[4]
    					? /*searchTerm*/ ctx[3]
    					: undefined,
    					keywords: /*searchTerm*/ ctx[3] && /*searchArray*/ ctx[4],
    					// matchKeywordWithField: 'Content',
    					matchKeywordWithFields: /*matchFields*/ ctx[10],
    					matchStyle: /*exactMatch*/ ctx[5] == true ? "exact" : "partial",
    					matchCase: /*matchCase*/ ctx[6]
    				}
    			};

    			if (dirty & /*$$scope, cytosisObject, cytosisLoading*/ 33560576) {
    				cytosiswip_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_isLoading && dirty & /*cytosisLoading*/ 4096) {
    				updating_isLoading = true;
    				cytosiswip_changes.isLoading = /*cytosisLoading*/ ctx[12];
    				add_flush_callback(() => updating_isLoading = false);
    			}

    			if (!updating_cytosis && dirty & /*cytosisObject*/ 2048) {
    				updating_cytosis = true;
    				cytosiswip_changes.cytosis = /*cytosisObject*/ ctx[11];
    				add_flush_callback(() => updating_cytosis = false);
    			}

    			cytosiswip.$set(cytosiswip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cytosiswip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cytosiswip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div11);
    			destroy_component(cytosiswip);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	marked_1.setOptions({ gfm: true, breaks: true });
    	let { title = `8. Search` } = $$props;
    	let { description = `This demo shows how to use cytosis to search and retrieve from Airtable.` } = $$props;

    	let { more = `In Airtable, each Table can have one or more views, that let you look at the data in different ways. For example, you might have a view with a filter that only lets you look at items with a Status (a single select) option of "Published". The view might also be able to sort and filter the data accordingly.

This example searches the Content field and returns the results. Try typing something like "Sorted" — with exact match, only the one term will show up, otherwise all the terms that contain "Sorted" will show up
  ` } = $$props;

    	let status, searchTerm = "", searchArray, exactMatch = false, matchCase = false;
    	let matchName = false, matchContent = true, matchId = true, matchFields = [];
    	let cytosisObject, cytosisLoading = false;
    	const writable_props = ["title", "description", "more"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$8.warn(`<DemoEight> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DemoEight", $$slots, []);

    	function input0_input_handler() {
    		searchTerm = this.value;
    		$$invalidate(3, searchTerm);
    	}

    	function input1_change_handler() {
    		exactMatch = this.checked;
    		$$invalidate(5, exactMatch);
    	}

    	function input2_change_handler() {
    		matchCase = this.checked;
    		$$invalidate(6, matchCase);
    	}

    	function input3_change_handler() {
    		matchName = this.checked;
    		$$invalidate(7, matchName);
    	}

    	function input4_change_handler() {
    		matchContent = this.checked;
    		$$invalidate(8, matchContent);
    	}

    	function input5_change_handler() {
    		matchId = this.checked;
    		$$invalidate(9, matchId);
    	}

    	function cytosiswip_isLoading_binding(value) {
    		cytosisLoading = value;
    		$$invalidate(12, cytosisLoading);
    	}

    	function cytosiswip_cytosis_binding(value) {
    		cytosisObject = value;
    		$$invalidate(11, cytosisObject);
    	}

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("more" in $$props) $$invalidate(2, more = $$props.more);
    	};

    	$$self.$capture_state = () => ({
    		Cytosis,
    		CytosisWip,
    		marked: marked_1,
    		title,
    		description,
    		more,
    		status,
    		searchTerm,
    		searchArray,
    		exactMatch,
    		matchCase,
    		matchName,
    		matchContent,
    		matchId,
    		matchFields,
    		cytosisObject,
    		cytosisLoading
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("more" in $$props) $$invalidate(2, more = $$props.more);
    		if ("status" in $$props) status = $$props.status;
    		if ("searchTerm" in $$props) $$invalidate(3, searchTerm = $$props.searchTerm);
    		if ("searchArray" in $$props) $$invalidate(4, searchArray = $$props.searchArray);
    		if ("exactMatch" in $$props) $$invalidate(5, exactMatch = $$props.exactMatch);
    		if ("matchCase" in $$props) $$invalidate(6, matchCase = $$props.matchCase);
    		if ("matchName" in $$props) $$invalidate(7, matchName = $$props.matchName);
    		if ("matchContent" in $$props) $$invalidate(8, matchContent = $$props.matchContent);
    		if ("matchId" in $$props) $$invalidate(9, matchId = $$props.matchId);
    		if ("matchFields" in $$props) $$invalidate(10, matchFields = $$props.matchFields);
    		if ("cytosisObject" in $$props) $$invalidate(11, cytosisObject = $$props.cytosisObject);
    		if ("cytosisLoading" in $$props) $$invalidate(12, cytosisLoading = $$props.cytosisLoading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*matchName, matchContent, matchId*/ 896) {
    			 $$invalidate(10, matchFields = [
    				matchName ? "Name" : undefined,
    				matchContent ? "Content" : undefined,
    				matchId ? "Id" : undefined
    			]);
    		}

    		if ($$self.$$.dirty & /*matchFields*/ 1024) {
    			 console.log("matchf", matchFields);
    		}

    		if ($$self.$$.dirty & /*searchTerm, searchArray*/ 24) {
    			 if (searchTerm.split(",").length > 1) {
    				$$invalidate(4, searchArray = searchTerm.split(","));
    				console.log("multiple search?", searchTerm, searchArray);
    			} else {
    				$$invalidate(4, searchArray = null);
    			}
    		}
    	};

    	return [
    		title,
    		description,
    		more,
    		searchTerm,
    		searchArray,
    		exactMatch,
    		matchCase,
    		matchName,
    		matchContent,
    		matchId,
    		matchFields,
    		cytosisObject,
    		cytosisLoading,
    		input0_input_handler,
    		input1_change_handler,
    		input2_change_handler,
    		input3_change_handler,
    		input4_change_handler,
    		input5_change_handler,
    		cytosiswip_isLoading_binding,
    		cytosiswip_cytosis_binding
    	];
    }

    class DemoEight extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { title: 0, description: 1, more: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DemoEight",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get title() {
    		return this.$$.ctx[0];
    	}

    	set title(title) {
    		this.$set({ title });
    		flush();
    	}

    	get description() {
    		return this.$$.ctx[1];
    	}

    	set description(description) {
    		this.$set({ description });
    		flush();
    	}

    	get more() {
    		return this.$$.ctx[2];
    	}

    	set more(more) {
    		this.$set({ more });
    		flush();
    	}
    }

    /* src/examples/DemoNine.svelte generated by Svelte v3.24.0 */

    const { Object: Object_1 } = globals;
    const file$b = "src/examples/DemoNine.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (21:4) {#if cytosisLoading}
    function create_if_block_1$8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("... loading Cytosis object ...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$8.name,
    		type: "if",
    		source: "(21:4) {#if cytosisLoading}",
    		ctx
    	});

    	return block;
    }

    // (24:4) {#if cytosisObject}
    function create_if_block$8(ctx) {
    	let p;
    	let t0;
    	let t1_value = Object.keys(/*cytosisObject*/ ctx[3].results).join(", ") + "";
    	let t1;
    	let t2;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = Object.keys(/*cytosisObject*/ ctx[3].results);
    	validate_each_argument(each_value);
    	const get_key = ctx => /*table*/ ctx[9];
    	validate_each_keys(ctx, each_value, get_each_context$4, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$4(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Tables: ");
    			t1 = text(t1_value);
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(p, "class", "svelte-mihllb");
    			add_location(p, file$b, 24, 6, 495);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			insert_dev(target, t2, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cytosisObject*/ 8 && t1_value !== (t1_value = Object.keys(/*cytosisObject*/ ctx[3].results).join(", ") + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*cytosisObject, Object, marked*/ 8) {
    				const each_value = Object.keys(/*cytosisObject*/ ctx[3].results);
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$4, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$4, each_1_anchor, get_each_context$4);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(24:4) {#if cytosisObject}",
    		ctx
    	});

    	return block;
    }

    // (28:8) {#each cytosisObject.results[table] as item (item.id)}
    function create_each_block_1$1(key_1, ctx) {
    	let p;
    	let raw_value = marked_1(/*item*/ ctx[12].fields["Content"]) + "";

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			p = element("p");
    			attr_dev(p, "class", "svelte-mihllb");
    			add_location(p, file$b, 28, 10, 731);
    			this.first = p;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			p.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cytosisObject*/ 8 && raw_value !== (raw_value = marked_1(/*item*/ ctx[12].fields["Content"]) + "")) p.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(28:8) {#each cytosisObject.results[table] as item (item.id)}",
    		ctx
    	});

    	return block;
    }

    // (26:6) {#each Object.keys(cytosisObject.results) as table (table)}
    function create_each_block$4(key_1, ctx) {
    	let h4;
    	let t0;
    	let t1_value = /*table*/ ctx[9] + "";
    	let t1;
    	let t2;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value_1 = /*cytosisObject*/ ctx[3].results[/*table*/ ctx[9]];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*item*/ ctx[12].id;
    	validate_each_keys(ctx, each_value_1, get_each_context_1$1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$1(key, child_ctx));
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			h4 = element("h4");
    			t0 = text("Table: ");
    			t1 = text(t1_value);
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(h4, "class", "svelte-mihllb");
    			add_location(h4, file$b, 26, 8, 632);
    			this.first = h4;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			append_dev(h4, t0);
    			append_dev(h4, t1);
    			insert_dev(target, t2, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cytosisObject*/ 8 && t1_value !== (t1_value = /*table*/ ctx[9] + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*marked, cytosisObject, Object*/ 8) {
    				const each_value_1 = /*cytosisObject*/ ctx[3].results[/*table*/ ctx[9]];
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block_1$1, each_1_anchor, get_each_context_1$1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(26:6) {#each Object.keys(cytosisObject.results) as table (table)}",
    		ctx
    	});

    	return block;
    }

    // (10:2) <CytosisWip     options={{       apiKey: 'keygfuzbhXK1VShlR',       baseId: 'appc0M3MdTYATe7RO',       configName: 'linked-query-example',       routeDetails: 'Demo Nine',     }}      bind:isLoading={cytosisLoading}     bind:cytosis={cytosisObject}   >
    function create_default_slot$8(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*cytosisLoading*/ ctx[4] && create_if_block_1$8(ctx);
    	let if_block1 = /*cytosisObject*/ ctx[3] && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*cytosisLoading*/ ctx[4]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1$8(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*cytosisObject*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$8(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(10:2) <CytosisWip     options={{       apiKey: 'keygfuzbhXK1VShlR',       baseId: 'appc0M3MdTYATe7RO',       configName: 'linked-query-example',       routeDetails: 'Demo Nine',     }}      bind:isLoading={cytosisLoading}     bind:cytosis={cytosisObject}   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let raw0_value = marked_1(/*description*/ ctx[1]) + "";
    	let t2;
    	let p;
    	let raw1_value = marked_1(/*more*/ ctx[2]) + "";
    	let t3;
    	let cytosiswip;
    	let updating_isLoading;
    	let updating_cytosis;
    	let current;

    	function cytosiswip_isLoading_binding(value) {
    		/*cytosiswip_isLoading_binding*/ ctx[5].call(null, value);
    	}

    	function cytosiswip_cytosis_binding(value) {
    		/*cytosiswip_cytosis_binding*/ ctx[6].call(null, value);
    	}

    	let cytosiswip_props = {
    		options: {
    			apiKey: "keygfuzbhXK1VShlR",
    			baseId: "appc0M3MdTYATe7RO",
    			configName: "linked-query-example",
    			routeDetails: "Demo Nine"
    		},
    		$$slots: { default: [create_default_slot$8] },
    		$$scope: { ctx }
    	};

    	if (/*cytosisLoading*/ ctx[4] !== void 0) {
    		cytosiswip_props.isLoading = /*cytosisLoading*/ ctx[4];
    	}

    	if (/*cytosisObject*/ ctx[3] !== void 0) {
    		cytosiswip_props.cytosis = /*cytosisObject*/ ctx[3];
    	}

    	cytosiswip = new CytosisWip({ props: cytosiswip_props, $$inline: true });
    	binding_callbacks.push(() => bind(cytosiswip, "isLoading", cytosiswip_isLoading_binding));
    	binding_callbacks.push(() => bind(cytosiswip, "cytosis", cytosiswip_cytosis_binding));

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			p = element("p");
    			t3 = space();
    			create_component(cytosiswip.$$.fragment);
    			attr_dev(h2, "class", "svelte-mihllb");
    			add_location(h2, file$b, 3, 1, 45);
    			attr_dev(div0, "class", "svelte-mihllb");
    			add_location(div0, file$b, 4, 1, 65);
    			attr_dev(p, "class", "svelte-mihllb");
    			add_location(p, file$b, 6, 1, 107);
    			attr_dev(div1, "class", " svelte-mihllb");
    			add_location(div1, file$b, 2, 0, 29);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			div0.innerHTML = raw0_value;
    			append_dev(div1, t2);
    			append_dev(div1, p);
    			p.innerHTML = raw1_value;
    			append_dev(div1, t3);
    			mount_component(cytosiswip, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if ((!current || dirty & /*description*/ 2) && raw0_value !== (raw0_value = marked_1(/*description*/ ctx[1]) + "")) div0.innerHTML = raw0_value;			if ((!current || dirty & /*more*/ 4) && raw1_value !== (raw1_value = marked_1(/*more*/ ctx[2]) + "")) p.innerHTML = raw1_value;			const cytosiswip_changes = {};

    			if (dirty & /*$$scope, cytosisObject, cytosisLoading*/ 32792) {
    				cytosiswip_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_isLoading && dirty & /*cytosisLoading*/ 16) {
    				updating_isLoading = true;
    				cytosiswip_changes.isLoading = /*cytosisLoading*/ ctx[4];
    				add_flush_callback(() => updating_isLoading = false);
    			}

    			if (!updating_cytosis && dirty & /*cytosisObject*/ 8) {
    				updating_cytosis = true;
    				cytosiswip_changes.cytosis = /*cytosisObject*/ ctx[3];
    				add_flush_callback(() => updating_cytosis = false);
    			}

    			cytosiswip.$set(cytosiswip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cytosiswip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cytosiswip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(cytosiswip);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	marked_1.setOptions({ gfm: true, breaks: true });
    	let { title = `9. Linked Queries` } = $$props;
    	let { description = `This demo shows how combine queries into a single query in config. This is really useful for splitting and creating complex, fine-grained queries.` } = $$props;
    	let { more = `This example shows how to combine two different table queries in _cytosis, by specifying a linked query ("linked-query-example" in this case). This example draws data from the Items Table and the Sorted records of the Site Content table. Note that we can't control the order the tables come back in.` } = $$props;

    	/*
      - matchKeywordWithField
        - show a few field settings
        - show partial — a piece of text appears in a field
        - show regular — for example retrieving a slug or page name


    */
    	let status;

    	let cytosisObject, loadedConfig;
    	let cytosisLoading = false;
    	const writable_props = ["title", "description", "more"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DemoNine> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DemoNine", $$slots, []);

    	function cytosiswip_isLoading_binding(value) {
    		cytosisLoading = value;
    		$$invalidate(4, cytosisLoading);
    	}

    	function cytosiswip_cytosis_binding(value) {
    		cytosisObject = value;
    		$$invalidate(3, cytosisObject);
    	}

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("more" in $$props) $$invalidate(2, more = $$props.more);
    	};

    	$$self.$capture_state = () => ({
    		Cytosis,
    		CytosisWip,
    		marked: marked_1,
    		title,
    		description,
    		more,
    		status,
    		cytosisObject,
    		loadedConfig,
    		cytosisLoading
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("more" in $$props) $$invalidate(2, more = $$props.more);
    		if ("status" in $$props) status = $$props.status;
    		if ("cytosisObject" in $$props) $$invalidate(3, cytosisObject = $$props.cytosisObject);
    		if ("loadedConfig" in $$props) loadedConfig = $$props.loadedConfig;
    		if ("cytosisLoading" in $$props) $$invalidate(4, cytosisLoading = $$props.cytosisLoading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		description,
    		more,
    		cytosisObject,
    		cytosisLoading,
    		cytosiswip_isLoading_binding,
    		cytosiswip_cytosis_binding
    	];
    }

    class DemoNine extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { title: 0, description: 1, more: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DemoNine",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get title() {
    		return this.$$.ctx[0];
    	}

    	set title(title) {
    		this.$set({ title });
    		flush();
    	}

    	get description() {
    		return this.$$.ctx[1];
    	}

    	set description(description) {
    		this.$set({ description });
    		flush();
    	}

    	get more() {
    		return this.$$.ctx[2];
    	}

    	set more(more) {
    		this.$set({ more });
    		flush();
    	}
    }

    /* src/examples/DemoTen.svelte generated by Svelte v3.24.0 */

    const { Object: Object_1$1 } = globals;
    const file$c = "src/examples/DemoTen.svelte";

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (19:4) {#if cytosisLoading}
    function create_if_block_1$9(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("... loading Cytosis object ...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$9.name,
    		type: "if",
    		source: "(19:4) {#if cytosisLoading}",
    		ctx
    	});

    	return block;
    }

    // (22:4) {#if cytosisObject}
    function create_if_block$9(ctx) {
    	let p;
    	let t0;
    	let t1_value = Object.keys(/*cytosisObject*/ ctx[2].results).join(", ") + "";
    	let t1;
    	let t2;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = Object.keys(/*cytosisObject*/ ctx[2].results);
    	validate_each_argument(each_value);
    	const get_key = ctx => /*table*/ ctx[10];
    	validate_each_keys(ctx, each_value, get_each_context$5, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$5(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Tables: ");
    			t1 = text(t1_value);
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(p, "class", "svelte-1qo73fi");
    			add_location(p, file$c, 22, 6, 412);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			insert_dev(target, t2, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cytosisObject*/ 4 && t1_value !== (t1_value = Object.keys(/*cytosisObject*/ ctx[2].results).join(", ") + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*cytosisObject, Object, marked*/ 4) {
    				const each_value = Object.keys(/*cytosisObject*/ ctx[2].results);
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$5, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$5, each_1_anchor, get_each_context$5);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(22:4) {#if cytosisObject}",
    		ctx
    	});

    	return block;
    }

    // (26:8) {#each cytosisObject.results[table] as item (item.id)}
    function create_each_block_1$2(key_1, ctx) {
    	let p;

    	let raw_value = (/*item*/ ctx[13].fields["Content"]
    	? marked_1(/*item*/ ctx[13].fields["Content"])
    	: /*item*/ ctx[13].fields["Name"]) + "";

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			p = element("p");
    			attr_dev(p, "class", "svelte-1qo73fi");
    			add_location(p, file$c, 26, 10, 648);
    			this.first = p;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			p.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cytosisObject*/ 4 && raw_value !== (raw_value = (/*item*/ ctx[13].fields["Content"]
    			? marked_1(/*item*/ ctx[13].fields["Content"])
    			: /*item*/ ctx[13].fields["Name"]) + "")) p.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(26:8) {#each cytosisObject.results[table] as item (item.id)}",
    		ctx
    	});

    	return block;
    }

    // (24:6) {#each Object.keys(cytosisObject.results) as table (table)}
    function create_each_block$5(key_1, ctx) {
    	let h4;
    	let t0;
    	let t1_value = /*table*/ ctx[10] + "";
    	let t1;
    	let t2;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value_1 = /*cytosisObject*/ ctx[2].results[/*table*/ ctx[10]];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*item*/ ctx[13].id;
    	validate_each_keys(ctx, each_value_1, get_each_context_1$2, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$2(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$2(key, child_ctx));
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			h4 = element("h4");
    			t0 = text("Table: ");
    			t1 = text(t1_value);
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(h4, "class", "svelte-1qo73fi");
    			add_location(h4, file$c, 24, 8, 549);
    			this.first = h4;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			append_dev(h4, t0);
    			append_dev(h4, t1);
    			insert_dev(target, t2, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cytosisObject*/ 4 && t1_value !== (t1_value = /*table*/ ctx[10] + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*cytosisObject, Object, marked*/ 4) {
    				const each_value_1 = /*cytosisObject*/ ctx[2].results[/*table*/ ctx[10]];
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block_1$2, each_1_anchor, get_each_context_1$2);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(24:6) {#each Object.keys(cytosisObject.results) as table (table)}",
    		ctx
    	});

    	return block;
    }

    // (10:2) <CytosisWip     options={{       bases:  bases,       routeDetails: 'Demo Ten',     }}      bind:isLoading={cytosisLoading}     bind:cytosis={cytosisObject}   >
    function create_default_slot$9(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*cytosisLoading*/ ctx[3] && create_if_block_1$9(ctx);
    	let if_block1 = /*cytosisObject*/ ctx[2] && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*cytosisLoading*/ ctx[3]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1$9(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*cytosisObject*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$9(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$9.name,
    		type: "slot",
    		source: "(10:2) <CytosisWip     options={{       bases:  bases,       routeDetails: 'Demo Ten',     }}      bind:isLoading={cytosisLoading}     bind:cytosis={cytosisObject}   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let raw_value = marked_1(/*description*/ ctx[1]) + "";
    	let t2;
    	let cytosiswip;
    	let updating_isLoading;
    	let updating_cytosis;
    	let current;

    	function cytosiswip_isLoading_binding(value) {
    		/*cytosiswip_isLoading_binding*/ ctx[6].call(null, value);
    	}

    	function cytosiswip_cytosis_binding(value) {
    		/*cytosiswip_cytosis_binding*/ ctx[7].call(null, value);
    	}

    	let cytosiswip_props = {
    		options: {
    			bases: /*bases*/ ctx[4],
    			routeDetails: "Demo Ten"
    		},
    		$$slots: { default: [create_default_slot$9] },
    		$$scope: { ctx }
    	};

    	if (/*cytosisLoading*/ ctx[3] !== void 0) {
    		cytosiswip_props.isLoading = /*cytosisLoading*/ ctx[3];
    	}

    	if (/*cytosisObject*/ ctx[2] !== void 0) {
    		cytosiswip_props.cytosis = /*cytosisObject*/ ctx[2];
    	}

    	cytosiswip = new CytosisWip({ props: cytosiswip_props, $$inline: true });
    	binding_callbacks.push(() => bind(cytosiswip, "isLoading", cytosiswip_isLoading_binding));
    	binding_callbacks.push(() => bind(cytosiswip, "cytosis", cytosiswip_cytosis_binding));

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			create_component(cytosiswip.$$.fragment);
    			attr_dev(h2, "class", "svelte-1qo73fi");
    			add_location(h2, file$c, 3, 1, 45);
    			attr_dev(div0, "class", "svelte-1qo73fi");
    			add_location(div0, file$c, 4, 1, 65);
    			attr_dev(div1, "class", " svelte-1qo73fi");
    			add_location(div1, file$c, 2, 0, 29);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			div0.innerHTML = raw_value;
    			append_dev(div1, t2);
    			mount_component(cytosiswip, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if ((!current || dirty & /*description*/ 2) && raw_value !== (raw_value = marked_1(/*description*/ ctx[1]) + "")) div0.innerHTML = raw_value;			const cytosiswip_changes = {};

    			if (dirty & /*$$scope, cytosisObject, cytosisLoading*/ 65548) {
    				cytosiswip_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_isLoading && dirty & /*cytosisLoading*/ 8) {
    				updating_isLoading = true;
    				cytosiswip_changes.isLoading = /*cytosisLoading*/ ctx[3];
    				add_flush_callback(() => updating_isLoading = false);
    			}

    			if (!updating_cytosis && dirty & /*cytosisObject*/ 4) {
    				updating_cytosis = true;
    				cytosiswip_changes.cytosis = /*cytosisObject*/ ctx[2];
    				add_flush_callback(() => updating_cytosis = false);
    			}

    			cytosiswip.$set(cytosiswip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cytosiswip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cytosiswip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(cytosiswip);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	marked_1.setOptions({ gfm: true, breaks: true });
    	let { title = `10. Multiple Airtables` } = $$props;
    	let { description = `This demo shows to combine multiple bases into one Cytosis.` } = $$props;
    	const more = `This example is similar to [Demo Five](/demos/demoFive) in that it doesn't use a config (though you could do that too), and sends in each base in a 'bases' array, each with its own base and API keys. The second base is the "Editor Public" base we'll use in the Write-capable examples. Keep in mind that you might run into API limits pretty soon if you do this in production, so this is either best for prototype development, or for a server to cache it somewhere`;

    	/*
      - matchKeywordWithField
        - show a few field settings
        - show partial — a piece of text appears in a field
        - show regular — for example retrieving a slug or page name


    */
    	let status;

    	let cytosisObject, loadedConfig;
    	let cytosisLoading = false;

    	let bases = [
    		{
    			apiKey: "keygfuzbhXK1VShlR",
    			baseId: "appc0M3MdTYATe7RO",
    			tables: ["Site Content"],
    			options: { "view": "Published" }
    		},
    		{
    			apiKey: "keygfuzbhXK1VShlR",
    			baseId: "app9xsC0ykwoAYHoC",
    			tables: ["Pets"],
    			options: { "view": "Grid view" }
    		}
    	];

    	const writable_props = ["title", "description"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DemoTen> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DemoTen", $$slots, []);

    	function cytosiswip_isLoading_binding(value) {
    		cytosisLoading = value;
    		$$invalidate(3, cytosisLoading);
    	}

    	function cytosiswip_cytosis_binding(value) {
    		cytosisObject = value;
    		$$invalidate(2, cytosisObject);
    	}

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    	};

    	$$self.$capture_state = () => ({
    		Cytosis,
    		CytosisWip,
    		marked: marked_1,
    		title,
    		description,
    		more,
    		status,
    		cytosisObject,
    		loadedConfig,
    		cytosisLoading,
    		bases
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("status" in $$props) status = $$props.status;
    		if ("cytosisObject" in $$props) $$invalidate(2, cytosisObject = $$props.cytosisObject);
    		if ("loadedConfig" in $$props) loadedConfig = $$props.loadedConfig;
    		if ("cytosisLoading" in $$props) $$invalidate(3, cytosisLoading = $$props.cytosisLoading);
    		if ("bases" in $$props) $$invalidate(4, bases = $$props.bases);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		description,
    		cytosisObject,
    		cytosisLoading,
    		bases,
    		more,
    		cytosiswip_isLoading_binding,
    		cytosiswip_cytosis_binding
    	];
    }

    class DemoTen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { title: 0, description: 1, more: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DemoTen",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get title() {
    		return this.$$.ctx[0];
    	}

    	set title(title) {
    		this.$set({ title });
    		flush();
    	}

    	get description() {
    		return this.$$.ctx[1];
    	}

    	set description(description) {
    		this.$set({ description });
    		flush();
    	}

    	get more() {
    		return this.$$.ctx[5];
    	}

    	set more(value) {
    		throw new Error("<DemoTen>: Cannot set read-only property 'more'");
    	}
    }

    /* src/examples/DemoEleven.svelte generated by Svelte v3.24.0 */
    const file$d = "src/examples/DemoEleven.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (23:1) {:catch error}
    function create_catch_block(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*error*/ ctx[13] + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Error: ");
    			t1 = text(t1_value);
    			attr_dev(div, "class", "_card _padding --flat svelte-11t96kd");
    			add_location(div, file$d, 23, 3, 639);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(23:1) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (21:1) {:then value}
    function create_then_block(ctx) {
    	let div;
    	let html_tag;
    	let raw_value = marked_1(/*value*/ ctx[12].fields["Content"]) + "";
    	let t0;
    	let t1_value = /*value*/ ctx[12].id + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(" — ID: ");
    			t1 = text(t1_value);
    			html_tag = new HtmlTag(t0);
    			attr_dev(div, "class", "_card _padding --flat svelte-11t96kd");
    			add_location(div, file$d, 21, 3, 520);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			html_tag.m(raw_value, div);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(21:1) {:then value}",
    		ctx
    	});

    	return block;
    }

    // (19:5)    <p>...loading record...</p>  {:then value}
    function create_pending_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "...loading record...";
    			attr_dev(p, "class", "svelte-11t96kd");
    			add_location(p, file$d, 19, 2, 474);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(19:5)    <p>...loading record...</p>  {:then value}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {#if cytosisLoading}
    function create_if_block_2$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("... loading Cytosis object ...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$5.name,
    		type: "if",
    		source: "(43:2) {#if cytosisLoading}",
    		ctx
    	});

    	return block;
    }

    // (46:2) {#if cytosisObject}
    function create_if_block_1$a(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*cytosisObject*/ ctx[2].results["Site Content"].length + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Cytosis Loaded. # of records loaded: ");
    			t1 = text(t1_value);
    			attr_dev(div, "class", "_card _padding --flat svelte-11t96kd");
    			add_location(div, file$d, 46, 4, 1176);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cytosisObject*/ 4 && t1_value !== (t1_value = /*cytosisObject*/ ctx[2].results["Site Content"].length + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$a.name,
    		type: "if",
    		source: "(46:2) {#if cytosisObject}",
    		ctx
    	});

    	return block;
    }

    // (32:1) <CytosisWip     options={{       apiKey: 'keygfuzbhXK1VShlR',       baseId: 'appc0M3MdTYATe7RO',       configName: 'all-data',       routeDetails: 'Demo Eleven',     }}        bind:isLoading={cytosisLoading}    bind:cytosis={cytosisObject}  >
    function create_default_slot$a(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*cytosisLoading*/ ctx[3] && create_if_block_2$5(ctx);
    	let if_block1 = /*cytosisObject*/ ctx[2] && create_if_block_1$a(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*cytosisLoading*/ ctx[3]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_2$5(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*cytosisObject*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$a(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$a.name,
    		type: "slot",
    		source: "(32:1) <CytosisWip     options={{       apiKey: 'keygfuzbhXK1VShlR',       baseId: 'appc0M3MdTYATe7RO',       configName: 'all-data',       routeDetails: 'Demo Eleven',     }}        bind:isLoading={cytosisLoading}    bind:cytosis={cytosisObject}  >",
    		ctx
    	});

    	return block;
    }

    // (52:1) {#if cytosisObject}
    function create_if_block$a(ctx) {
    	let h40;
    	let t1;
    	let p0;
    	let raw0_value = marked_1(`\`getById\` does is similar to getRecord and finds a record by its Airtable ID from a loaded Cytosis object instead Airtable's API.`) + "";
    	let t2;
    	let div0;
    	let t3_value = Cytosis.getById("rec525Ip5YJCJMS7F", /*cytosisObject*/ ctx[2].results).fields["Content"] + "";
    	let t3;
    	let t4;
    	let t5_value = Cytosis.getById("rec525Ip5YJCJMS7F", /*cytosisObject*/ ctx[2].results).id + "";
    	let t5;
    	let t6;
    	let h41;
    	let t8;
    	let p1;
    	let raw1_value = marked_1(`\`getByIds(recordIdArray, source, fieldName)'\` — this is similar to getById, but takes an array of record IDs. In this example, we get the linked records of linked-item-0 and linked-item-0>3. By default this returns an object, but if a fieldName is provided, it will just return the content of the given field. `) + "";
    	let t9;
    	let div1;
    	let p2;
    	let t10_value = Cytosis.getByIds(["recNzgaz2uU24SV8L", "recByHLgbfKWTEObU"], /*cytosisObject*/ ctx[2].results, "Name").join(", ") + "";
    	let t10;
    	let t11;
    	let h42;
    	let t13;
    	let p3;
    	let raw2_value = marked_1(`\`findOne()\` will find a string that matches a cell or record, given a table and a field name. This one is really useful for grabbing content quickly by the key field (usually 'Name'), rather than by ID. In this case it's 'content-1'`) + "";
    	let t14;
    	let div2;
    	let t15_value = Cytosis.findOne("content-1", /*cytosisObject*/ ctx[2].results["Site Content"]).fields["Content"] + "";
    	let t15;
    	let t16;
    	let h43;
    	let t18;
    	let p4;
    	let raw3_value = marked_1(`\`findField()\` is a convenience function for 'findOne'. This returns a specific field instead of the entire object.`) + "";
    	let t19;
    	let div3;
    	let t20_value = Cytosis.findField("content-1", /*cytosisObject*/ ctx[2].results["Site Content"], "Content") + "";
    	let t20;
    	let t21;
    	let h30;
    	let t23;
    	let h44;
    	let t25;
    	let p5;
    	let raw4_value = marked_1(`\`find\` gets a specific record or records based on a special string request, as explained below (for string matching, use ".search()" below). Format the string request depending on what kind of data you need. This is useful for the CDN-version where ES6 functions aren't available`) + "";
    	let t26;
    	let h50;
    	let t28;
    	let p6;
    	let raw5_value = marked_1(`\`find(findStr, tables[], fields=['Name']) | findStr = 'recordName'\` gets the first item from a given array of tables that exactly matches the string to the given fields. In this example we match the 'archived-content' record in 'Site Content'. This returns a record.`) + "";
    	let t29;
    	let div4;
    	let t30_value = Cytosis.find("content-1", /*cytosisObject*/ ctx[2].results).fields["Content"] + "";
    	let t30;
    	let t31;
    	let p7;
    	let raw6_value = marked_1(`But we can also match any fields we want, so in this example we match the content of the 'filter-3' record in 'Site Content'`) + "";
    	let t32;
    	let div5;
    	let t33_value = Cytosis.find("Content for Filter 3", /*cytosisObject*/ ctx[2].results, ["Content"]).fields["Content"] + "";
    	let t33;
    	let t34;
    	let h51;
    	let t36;
    	let p8;
    	let raw7_value = marked_1(`\`find(findStr, tables[], fields=['Name']) | findStr = 'tableName.recordName'\` — sometimes you want to explicitly specify which table you want a result from. This is useful for join operations, where sometimes the same value exists in two tables. Be aware that this returns an array of objects.`) + "";
    	let t37;
    	let div6;
    	let p9;
    	let t38_value = Cytosis.find("Site Content.content-1", /*cytosisObject*/ ctx[2].results)[0].fields["Content"] + "";
    	let t38;
    	let t39;
    	let p10;
    	let t40_value = Cytosis.find("Items Table.Dummy Item 1", /*cytosisObject*/ ctx[2].results)[0].fields["Content"] + "";
    	let t40;
    	let t41;
    	let h52;
    	let t43;
    	let p11;
    	let raw8_value = marked_1(`\`find(findStr, tables[], fields=['Name']) | findStr = 'tableName.recordName.fieldName'\` — sometimes you just want a specific column, like a piece of content or metadata. If a field is linked to another table, this will get an array of linked records (if it's able to find them).`) + "";
    	let t44;
    	let div8;
    	let p12;
    	let t45_value = Cytosis.find("Site Content.filter-1.Tags", /*cytosisObject*/ ctx[2].results).join(", ") + "";
    	let t45;
    	let t46;
    	let hr0;
    	let t47;
    	let div7;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t48;
    	let h53;
    	let t50;
    	let p13;
    	let raw9_value = marked_1(`\`find(findStr, tables[], fields=['Name']) | findStr = 'tableName.recordName.fieldName.linkedFieldName'\` — sometimes getting a piece of data from a linked field can be really useful, like an email or address field. In Airtable it's called a "Lookup" and we mimic that functionality here.`) + "";
    	let t51;
    	let div9;
    	let p14;
    	let t52_value = Cytosis.find("Site Content.linked-item-0>3.Linked Items.Content", /*cytosisObject*/ ctx[2].results) + "";
    	let t52;
    	let t53;
    	let h45;
    	let t55;
    	let p15;
    	let raw10_value = marked_1(`\`.search()\` — while Find() takes a specially formatted query string, Search is more like a traditional string matching search.`) + "";
    	let t56;
    	let h54;
    	let t58;
    	let p16;
    	let raw11_value = marked_1(`\`search(matchStr, source, fieldsArray, linkedTableArray[], linkedTableKey) | .\` — where matchStr is the string you're trying to match, source is either an array of records or a Cytosis.results object. fieldsArray is optionally an array of the fields you're matching your results in (if you leave it blank, all fields will be searched). If you're searching records that contain linked records, but you don't want to match the linked record itself (e.g. tableOne contains a record that matches a string from the linked field "Tags" and you want to return the record from tableOne, and not the tag.`) + "";
    	let t59;
    	let div10;
    	let p17;
    	let html_tag;
    	let raw12_value = marked_1(`\`Cytosis.search('Content for Filter', cytosisObject.results)\`:`) + "";
    	let t60;
    	let t61_value = Cytosis.getFieldValues(Cytosis.search("Content for Filter", /*cytosisObject*/ ctx[2].results), "Name").join(", ") + "";
    	let t61;
    	let t62;
    	let hr1;
    	let t63;
    	let p18;
    	let html_tag_1;
    	let raw13_value = marked_1(`\`Cytosis.search('SORTED', cytosisObject.results['Site Content'], {fields: ['Content']})\`:`) + "";
    	let t64;
    	let t65_value = Cytosis.getFieldValues(Cytosis.search("Sorted", /*cytosisObject*/ ctx[2].results["Site Content"], { fields: ["Content"] }), "Name").join(", ") + "";
    	let t65;
    	let t66;
    	let hr2;
    	let t67;
    	let p19;
    	let html_tag_2;
    	let raw14_value = marked_1(`\`Cytosis.search('Sorted', cytosisObject.results['Site Content'], {fields: ['Content'], exactMatch: true})\`:`) + "";
    	let t68;
    	let t69_value = Cytosis.getFieldValues(Cytosis.search("Sorted", /*cytosisObject*/ ctx[2].results["Site Content"], { fields: ["Content"], exactMatch: true }), "Name").join(", ") + "";
    	let t69;
    	let t70;
    	let hr3;
    	let t71;
    	let p20;
    	let html_tag_3;
    	let raw15_value = marked_1(`\`Cytosis.search('Sorted', cytosisObject.results['Site Content'], {fields: ['Content'], exactMatch: true})\`:`) + "";
    	let t72;
    	let t73_value = Cytosis.getFieldValues(Cytosis.search("Filter Example", /*cytosisObject*/ ctx[2].results["Site Content"], { fields: ["Tags"] }), "Name").join(", ") + "";
    	let t73;
    	let t74;
    	let hr4;
    	let t75;
    	let p21;
    	let html_tag_4;
    	let raw16_value = marked_1(`\`Cytosis.search('Sorted', cytosisObject.results['Site Content'], {fields: ['Content'], exactMatch: true})\`: (this finds "dummy item 0" in the linked table field and returns the record that includes the linked item)`) + "";
    	let t76;

    	let t77_value = Cytosis.getFieldValues(
    		Cytosis.search("dummy item 0", /*cytosisObject*/ ctx[2].results["Site Content"], {
    			fields: ["Linked Items"],
    			linkedTables: /*cytosisObject*/ ctx[2].results["Items Table"]
    		}),
    		"Name"
    	).join(", ") + "";

    	let t77;
    	let t78;
    	let h31;
    	let t80;
    	let h46;
    	let t82;
    	let p22;
    	let raw17_value = marked_1(`\`getFields(recordArray, fieldName='Name')\` — gets the content in the form of an array of values from an array of records, given a field name. Useful for getting all the Names from a record array, in a new array. In this example we get every value from every Tag field in Site Content `) + "";
    	let t83;
    	let div11;
    	let p23;
    	let t84_value = Cytosis.getFields(/*cytosisObject*/ ctx[2].results["Site Content"], "Tags").join(", ") + "";
    	let t84;
    	let t85;
    	let p24;
    	let t86_value = Cytosis.getFields(/*cytosisObject*/ ctx[2].results["Site Content"], "Linked Items").join(", ") + "";
    	let t86;
    	let t87;
    	let h47;
    	let t89;
    	let p25;
    	let raw18_value = marked_1(`\`getFieldContent(recordArray, fieldName='Name')\` — gets the value of a field in the form of a 2D array, because sometimes you want to preserve the dimensionality. This means that if a field is empty, it will appear as "undefined" in the returned array. This also brings in data from linked records.`) + "";
    	let t90;
    	let div13;
    	let p26;
    	let t91_value = Cytosis.getFieldContent(/*cytosisObject*/ ctx[2].results["Site Content"], "Tags").join(", ") + "";
    	let t91;
    	let t92;
    	let hr5;
    	let t93;
    	let div12;
    	let each_value_1 = Cytosis.find("Site Content.linked-item-0>3.Linked Items", /*cytosisObject*/ ctx[2].results);
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*item*/ ctx[9].id;
    	validate_each_keys(ctx, each_value_1, get_each_context_1$3, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$3(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1$3(key, child_ctx));
    	}

    	let each_value = Cytosis.getFieldContent(/*cytosisObject*/ ctx[2].results["Site Content"], "Linked Items", /*cytosisObject*/ ctx[2].results["Items Table"]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h40 = element("h4");
    			h40.textContent = ".getById()";
    			t1 = space();
    			p0 = element("p");
    			t2 = space();
    			div0 = element("div");
    			t3 = text(t3_value);
    			t4 = text(" — ID: ");
    			t5 = text(t5_value);
    			t6 = space();
    			h41 = element("h4");
    			h41.textContent = ".getByIds()";
    			t8 = space();
    			p1 = element("p");
    			t9 = space();
    			div1 = element("div");
    			p2 = element("p");
    			t10 = text(t10_value);
    			t11 = space();
    			h42 = element("h4");
    			h42.textContent = ".findOne()";
    			t13 = space();
    			p3 = element("p");
    			t14 = space();
    			div2 = element("div");
    			t15 = text(t15_value);
    			t16 = space();
    			h43 = element("h4");
    			h43.textContent = ".findField()";
    			t18 = space();
    			p4 = element("p");
    			t19 = space();
    			div3 = element("div");
    			t20 = text(t20_value);
    			t21 = space();
    			h30 = element("h3");
    			h30.textContent = "Finding and Searching";
    			t23 = space();
    			h44 = element("h4");
    			h44.textContent = ".find()";
    			t25 = space();
    			p5 = element("p");
    			t26 = space();
    			h50 = element("h5");
    			h50.textContent = "Finding a Record by Name";
    			t28 = space();
    			p6 = element("p");
    			t29 = space();
    			div4 = element("div");
    			t30 = text(t30_value);
    			t31 = space();
    			p7 = element("p");
    			t32 = space();
    			div5 = element("div");
    			t33 = text(t33_value);
    			t34 = space();
    			h51 = element("h5");
    			h51.textContent = "Finding a Record by Table and Row";
    			t36 = space();
    			p8 = element("p");
    			t37 = space();
    			div6 = element("div");
    			p9 = element("p");
    			t38 = text(t38_value);
    			t39 = space();
    			p10 = element("p");
    			t40 = text(t40_value);
    			t41 = space();
    			h52 = element("h5");
    			h52.textContent = "Finding a Record's Field (column) Data";
    			t43 = space();
    			p11 = element("p");
    			t44 = space();
    			div8 = element("div");
    			p12 = element("p");
    			t45 = text(t45_value);
    			t46 = space();
    			hr0 = element("hr");
    			t47 = space();
    			div7 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t48 = space();
    			h53 = element("h5");
    			h53.textContent = "Finding a Record's Linked Field's Field Data (linked table lookup)";
    			t50 = space();
    			p13 = element("p");
    			t51 = space();
    			div9 = element("div");
    			p14 = element("p");
    			t52 = text(t52_value);
    			t53 = space();
    			h45 = element("h4");
    			h45.textContent = ".search()";
    			t55 = space();
    			p15 = element("p");
    			t56 = space();
    			h54 = element("h5");
    			h54.textContent = "String matching";
    			t58 = space();
    			p16 = element("p");
    			t59 = space();
    			div10 = element("div");
    			p17 = element("p");
    			t60 = text("\n\t\t\t\tRecords: ");
    			t61 = text(t61_value);
    			t62 = space();
    			hr1 = element("hr");
    			t63 = space();
    			p18 = element("p");
    			t64 = text("\n\t\t\t\tRecords: ");
    			t65 = text(t65_value);
    			t66 = space();
    			hr2 = element("hr");
    			t67 = space();
    			p19 = element("p");
    			t68 = text("\n\t\t\t\tRecords: ");
    			t69 = text(t69_value);
    			t70 = space();
    			hr3 = element("hr");
    			t71 = space();
    			p20 = element("p");
    			t72 = text("\n\t\t\t\tRecords: ");
    			t73 = text(t73_value);
    			t74 = space();
    			hr4 = element("hr");
    			t75 = space();
    			p21 = element("p");
    			t76 = text("\n\t\t\t\tRecords: ");
    			t77 = text(t77_value);
    			t78 = space();
    			h31 = element("h3");
    			h31.textContent = "Getter Helpers";
    			t80 = space();
    			h46 = element("h4");
    			h46.textContent = ".getFields()";
    			t82 = space();
    			p22 = element("p");
    			t83 = space();
    			div11 = element("div");
    			p23 = element("p");
    			t84 = text(t84_value);
    			t85 = space();
    			p24 = element("p");
    			t86 = text(t86_value);
    			t87 = space();
    			h47 = element("h4");
    			h47.textContent = ".getFieldContent()";
    			t89 = space();
    			p25 = element("p");
    			t90 = space();
    			div13 = element("div");
    			p26 = element("p");
    			t91 = text(t91_value);
    			t92 = space();
    			hr5 = element("hr");
    			t93 = space();
    			div12 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h40, "class", "svelte-11t96kd");
    			add_location(h40, file$d, 53, 2, 1354);
    			attr_dev(p0, "class", "svelte-11t96kd");
    			add_location(p0, file$d, 55, 2, 1377);
    			attr_dev(div0, "class", "_card _padding --flat svelte-11t96kd");
    			add_location(div0, file$d, 56, 2, 1536);
    			attr_dev(h41, "class", "svelte-11t96kd");
    			add_location(h41, file$d, 59, 2, 1738);
    			attr_dev(p1, "class", "svelte-11t96kd");
    			add_location(p1, file$d, 60, 2, 1761);
    			attr_dev(p2, "class", "svelte-11t96kd");
    			add_location(p2, file$d, 62, 3, 2140);
    			attr_dev(div1, "class", "_card _padding --flat svelte-11t96kd");
    			add_location(div1, file$d, 61, 2, 2101);
    			attr_dev(h42, "class", "svelte-11t96kd");
    			add_location(h42, file$d, 65, 2, 2266);
    			attr_dev(p3, "class", "svelte-11t96kd");
    			add_location(p3, file$d, 66, 2, 2288);
    			attr_dev(div2, "class", "_card _padding --flat svelte-11t96kd");
    			add_location(div2, file$d, 67, 2, 2550);
    			attr_dev(h43, "class", "svelte-11t96kd");
    			add_location(h43, file$d, 71, 2, 2686);
    			attr_dev(p4, "class", "svelte-11t96kd");
    			add_location(p4, file$d, 72, 2, 2710);
    			attr_dev(div3, "class", "_card _padding --flat svelte-11t96kd");
    			add_location(div3, file$d, 73, 2, 2854);
    			attr_dev(h30, "class", "svelte-11t96kd");
    			add_location(h30, file$d, 76, 2, 2983);
    			attr_dev(h44, "class", "svelte-11t96kd");
    			add_location(h44, file$d, 78, 2, 3017);
    			attr_dev(p5, "class", "svelte-11t96kd");
    			add_location(p5, file$d, 79, 2, 3036);
    			attr_dev(h50, "class", "svelte-11t96kd");
    			add_location(h50, file$d, 81, 2, 3346);
    			attr_dev(p6, "class", "svelte-11t96kd");
    			add_location(p6, file$d, 82, 2, 3382);
    			attr_dev(div4, "class", "_card _padding --flat svelte-11t96kd");
    			add_location(div4, file$d, 83, 2, 3678);
    			attr_dev(p7, "class", "svelte-11t96kd");
    			add_location(p7, file$d, 84, 2, 3792);
    			attr_dev(div5, "class", "_card _padding --flat svelte-11t96kd");
    			add_location(div5, file$d, 85, 2, 3944);
    			attr_dev(h51, "class", "svelte-11t96kd");
    			add_location(h51, file$d, 87, 2, 4083);
    			attr_dev(p8, "class", "svelte-11t96kd");
    			add_location(p8, file$d, 88, 2, 4128);
    			attr_dev(p9, "class", "svelte-11t96kd");
    			add_location(p9, file$d, 90, 3, 4490);
    			attr_dev(p10, "class", "svelte-11t96kd");
    			add_location(p10, file$d, 91, 3, 4587);
    			attr_dev(div6, "class", "_card _padding --flat svelte-11t96kd");
    			add_location(div6, file$d, 89, 2, 4451);
    			attr_dev(h52, "class", "svelte-11t96kd");
    			add_location(h52, file$d, 95, 2, 4850);
    			attr_dev(p11, "class", "svelte-11t96kd");
    			add_location(p11, file$d, 96, 2, 4900);
    			attr_dev(p12, "class", "svelte-11t96kd");
    			add_location(p12, file$d, 98, 3, 5247);
    			attr_dev(hr0, "class", "svelte-11t96kd");
    			add_location(hr0, file$d, 99, 3, 5338);
    			attr_dev(div7, "class", "svelte-11t96kd");
    			add_location(div7, file$d, 100, 3, 5348);
    			attr_dev(div8, "class", "_card _padding --flat svelte-11t96kd");
    			add_location(div8, file$d, 97, 2, 5208);
    			attr_dev(h53, "class", "svelte-11t96kd");
    			add_location(h53, file$d, 108, 2, 5536);
    			attr_dev(p13, "class", "svelte-11t96kd");
    			add_location(p13, file$d, 109, 2, 5614);
    			attr_dev(p14, "class", "svelte-11t96kd");
    			add_location(p14, file$d, 111, 3, 5969);
    			attr_dev(div9, "class", "_card _padding --flat svelte-11t96kd");
    			add_location(div9, file$d, 110, 2, 5930);
    			attr_dev(h45, "class", "svelte-11t96kd");
    			add_location(h45, file$d, 119, 2, 6086);
    			attr_dev(p15, "class", "svelte-11t96kd");
    			add_location(p15, file$d, 120, 2, 6107);
    			attr_dev(h54, "class", "svelte-11t96kd");
    			add_location(h54, file$d, 122, 2, 6266);
    			attr_dev(p16, "class", "svelte-11t96kd");
    			add_location(p16, file$d, 123, 2, 6294);
    			html_tag = new HtmlTag(t60);
    			attr_dev(p17, "class", "svelte-11t96kd");
    			add_location(p17, file$d, 125, 3, 6958);
    			attr_dev(hr1, "class", "svelte-11t96kd");
    			add_location(hr1, file$d, 128, 3, 7175);
    			html_tag_1 = new HtmlTag(t64);
    			attr_dev(p18, "class", "svelte-11t96kd");
    			add_location(p18, file$d, 129, 3, 7183);
    			attr_dev(hr2, "class", "svelte-11t96kd");
    			add_location(hr2, file$d, 132, 3, 7454);
    			html_tag_2 = new HtmlTag(t68);
    			attr_dev(p19, "class", "svelte-11t96kd");
    			add_location(p19, file$d, 133, 3, 7462);
    			attr_dev(hr3, "class", "svelte-11t96kd");
    			add_location(hr3, file$d, 136, 3, 7769);
    			html_tag_3 = new HtmlTag(t72);
    			attr_dev(p20, "class", "svelte-11t96kd");
    			add_location(p20, file$d, 137, 3, 7777);
    			attr_dev(hr4, "class", "svelte-11t96kd");
    			add_location(hr4, file$d, 140, 3, 8071);
    			html_tag_4 = new HtmlTag(t76);
    			attr_dev(p21, "class", "svelte-11t96kd");
    			add_location(p21, file$d, 141, 3, 8079);
    			attr_dev(div10, "class", "_card _padding --flat svelte-11t96kd");
    			add_location(div10, file$d, 124, 2, 6919);
    			attr_dev(h31, "class", "svelte-11t96kd");
    			add_location(h31, file$d, 150, 2, 8551);
    			attr_dev(h46, "class", "svelte-11t96kd");
    			add_location(h46, file$d, 154, 2, 8580);
    			attr_dev(p22, "class", "svelte-11t96kd");
    			add_location(p22, file$d, 155, 2, 8604);
    			attr_dev(p23, "class", "svelte-11t96kd");
    			add_location(p23, file$d, 157, 3, 8957);
    			attr_dev(p24, "class", "svelte-11t96kd");
    			add_location(p24, file$d, 158, 3, 9047);
    			attr_dev(div11, "class", "_card _padding --flat svelte-11t96kd");
    			add_location(div11, file$d, 156, 2, 8918);
    			attr_dev(h47, "class", "svelte-11t96kd");
    			add_location(h47, file$d, 161, 2, 9154);
    			attr_dev(p25, "class", "svelte-11t96kd");
    			add_location(p25, file$d, 162, 2, 9184);
    			attr_dev(p26, "class", "svelte-11t96kd");
    			add_location(p26, file$d, 164, 3, 9551);
    			attr_dev(hr5, "class", "svelte-11t96kd");
    			add_location(hr5, file$d, 165, 3, 9647);
    			attr_dev(div12, "class", "svelte-11t96kd");
    			add_location(div12, file$d, 166, 3, 9655);
    			attr_dev(div13, "class", "_card _padding --flat svelte-11t96kd");
    			add_location(div13, file$d, 163, 2, 9512);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h40, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			p0.innerHTML = raw0_value;
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t3);
    			append_dev(div0, t4);
    			append_dev(div0, t5);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, h41, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, p1, anchor);
    			p1.innerHTML = raw1_value;
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p2);
    			append_dev(p2, t10);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, h42, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, p3, anchor);
    			p3.innerHTML = raw2_value;
    			insert_dev(target, t14, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, t15);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, h43, anchor);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, p4, anchor);
    			p4.innerHTML = raw3_value;
    			insert_dev(target, t19, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, t20);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, h30, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, h44, anchor);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, p5, anchor);
    			p5.innerHTML = raw4_value;
    			insert_dev(target, t26, anchor);
    			insert_dev(target, h50, anchor);
    			insert_dev(target, t28, anchor);
    			insert_dev(target, p6, anchor);
    			p6.innerHTML = raw5_value;
    			insert_dev(target, t29, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, t30);
    			insert_dev(target, t31, anchor);
    			insert_dev(target, p7, anchor);
    			p7.innerHTML = raw6_value;
    			insert_dev(target, t32, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, t33);
    			insert_dev(target, t34, anchor);
    			insert_dev(target, h51, anchor);
    			insert_dev(target, t36, anchor);
    			insert_dev(target, p8, anchor);
    			p8.innerHTML = raw7_value;
    			insert_dev(target, t37, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, p9);
    			append_dev(p9, t38);
    			append_dev(div6, t39);
    			append_dev(div6, p10);
    			append_dev(p10, t40);
    			insert_dev(target, t41, anchor);
    			insert_dev(target, h52, anchor);
    			insert_dev(target, t43, anchor);
    			insert_dev(target, p11, anchor);
    			p11.innerHTML = raw8_value;
    			insert_dev(target, t44, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, p12);
    			append_dev(p12, t45);
    			append_dev(div8, t46);
    			append_dev(div8, hr0);
    			append_dev(div8, t47);
    			append_dev(div8, div7);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div7, null);
    			}

    			insert_dev(target, t48, anchor);
    			insert_dev(target, h53, anchor);
    			insert_dev(target, t50, anchor);
    			insert_dev(target, p13, anchor);
    			p13.innerHTML = raw9_value;
    			insert_dev(target, t51, anchor);
    			insert_dev(target, div9, anchor);
    			append_dev(div9, p14);
    			append_dev(p14, t52);
    			insert_dev(target, t53, anchor);
    			insert_dev(target, h45, anchor);
    			insert_dev(target, t55, anchor);
    			insert_dev(target, p15, anchor);
    			p15.innerHTML = raw10_value;
    			insert_dev(target, t56, anchor);
    			insert_dev(target, h54, anchor);
    			insert_dev(target, t58, anchor);
    			insert_dev(target, p16, anchor);
    			p16.innerHTML = raw11_value;
    			insert_dev(target, t59, anchor);
    			insert_dev(target, div10, anchor);
    			append_dev(div10, p17);
    			html_tag.m(raw12_value, p17);
    			append_dev(p17, t60);
    			append_dev(p17, t61);
    			append_dev(div10, t62);
    			append_dev(div10, hr1);
    			append_dev(div10, t63);
    			append_dev(div10, p18);
    			html_tag_1.m(raw13_value, p18);
    			append_dev(p18, t64);
    			append_dev(p18, t65);
    			append_dev(div10, t66);
    			append_dev(div10, hr2);
    			append_dev(div10, t67);
    			append_dev(div10, p19);
    			html_tag_2.m(raw14_value, p19);
    			append_dev(p19, t68);
    			append_dev(p19, t69);
    			append_dev(div10, t70);
    			append_dev(div10, hr3);
    			append_dev(div10, t71);
    			append_dev(div10, p20);
    			html_tag_3.m(raw15_value, p20);
    			append_dev(p20, t72);
    			append_dev(p20, t73);
    			append_dev(div10, t74);
    			append_dev(div10, hr4);
    			append_dev(div10, t75);
    			append_dev(div10, p21);
    			html_tag_4.m(raw16_value, p21);
    			append_dev(p21, t76);
    			append_dev(p21, t77);
    			insert_dev(target, t78, anchor);
    			insert_dev(target, h31, anchor);
    			insert_dev(target, t80, anchor);
    			insert_dev(target, h46, anchor);
    			insert_dev(target, t82, anchor);
    			insert_dev(target, p22, anchor);
    			p22.innerHTML = raw17_value;
    			insert_dev(target, t83, anchor);
    			insert_dev(target, div11, anchor);
    			append_dev(div11, p23);
    			append_dev(p23, t84);
    			append_dev(div11, t85);
    			append_dev(div11, p24);
    			append_dev(p24, t86);
    			insert_dev(target, t87, anchor);
    			insert_dev(target, h47, anchor);
    			insert_dev(target, t89, anchor);
    			insert_dev(target, p25, anchor);
    			p25.innerHTML = raw18_value;
    			insert_dev(target, t90, anchor);
    			insert_dev(target, div13, anchor);
    			append_dev(div13, p26);
    			append_dev(p26, t91);
    			append_dev(div13, t92);
    			append_dev(div13, hr5);
    			append_dev(div13, t93);
    			append_dev(div13, div12);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div12, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cytosisObject*/ 4 && t3_value !== (t3_value = Cytosis.getById("rec525Ip5YJCJMS7F", /*cytosisObject*/ ctx[2].results).fields["Content"] + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*cytosisObject*/ 4 && t5_value !== (t5_value = Cytosis.getById("rec525Ip5YJCJMS7F", /*cytosisObject*/ ctx[2].results).id + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*cytosisObject*/ 4 && t10_value !== (t10_value = Cytosis.getByIds(["recNzgaz2uU24SV8L", "recByHLgbfKWTEObU"], /*cytosisObject*/ ctx[2].results, "Name").join(", ") + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*cytosisObject*/ 4 && t15_value !== (t15_value = Cytosis.findOne("content-1", /*cytosisObject*/ ctx[2].results["Site Content"]).fields["Content"] + "")) set_data_dev(t15, t15_value);
    			if (dirty & /*cytosisObject*/ 4 && t20_value !== (t20_value = Cytosis.findField("content-1", /*cytosisObject*/ ctx[2].results["Site Content"], "Content") + "")) set_data_dev(t20, t20_value);
    			if (dirty & /*cytosisObject*/ 4 && t30_value !== (t30_value = Cytosis.find("content-1", /*cytosisObject*/ ctx[2].results).fields["Content"] + "")) set_data_dev(t30, t30_value);
    			if (dirty & /*cytosisObject*/ 4 && t33_value !== (t33_value = Cytosis.find("Content for Filter 3", /*cytosisObject*/ ctx[2].results, ["Content"]).fields["Content"] + "")) set_data_dev(t33, t33_value);
    			if (dirty & /*cytosisObject*/ 4 && t38_value !== (t38_value = Cytosis.find("Site Content.content-1", /*cytosisObject*/ ctx[2].results)[0].fields["Content"] + "")) set_data_dev(t38, t38_value);
    			if (dirty & /*cytosisObject*/ 4 && t40_value !== (t40_value = Cytosis.find("Items Table.Dummy Item 1", /*cytosisObject*/ ctx[2].results)[0].fields["Content"] + "")) set_data_dev(t40, t40_value);
    			if (dirty & /*cytosisObject*/ 4 && t45_value !== (t45_value = Cytosis.find("Site Content.filter-1.Tags", /*cytosisObject*/ ctx[2].results).join(", ") + "")) set_data_dev(t45, t45_value);

    			if (dirty & /*Cytosis, cytosisObject*/ 4) {
    				const each_value_1 = Cytosis.find("Site Content.linked-item-0>3.Linked Items", /*cytosisObject*/ ctx[2].results);
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1$3, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, div7, destroy_block, create_each_block_1$3, null, get_each_context_1$3);
    			}

    			if (dirty & /*cytosisObject*/ 4 && t52_value !== (t52_value = Cytosis.find("Site Content.linked-item-0>3.Linked Items.Content", /*cytosisObject*/ ctx[2].results) + "")) set_data_dev(t52, t52_value);
    			if (dirty & /*cytosisObject*/ 4 && t61_value !== (t61_value = Cytosis.getFieldValues(Cytosis.search("Content for Filter", /*cytosisObject*/ ctx[2].results), "Name").join(", ") + "")) set_data_dev(t61, t61_value);
    			if (dirty & /*cytosisObject*/ 4 && t65_value !== (t65_value = Cytosis.getFieldValues(Cytosis.search("Sorted", /*cytosisObject*/ ctx[2].results["Site Content"], { fields: ["Content"] }), "Name").join(", ") + "")) set_data_dev(t65, t65_value);
    			if (dirty & /*cytosisObject*/ 4 && t69_value !== (t69_value = Cytosis.getFieldValues(Cytosis.search("Sorted", /*cytosisObject*/ ctx[2].results["Site Content"], { fields: ["Content"], exactMatch: true }), "Name").join(", ") + "")) set_data_dev(t69, t69_value);
    			if (dirty & /*cytosisObject*/ 4 && t73_value !== (t73_value = Cytosis.getFieldValues(Cytosis.search("Filter Example", /*cytosisObject*/ ctx[2].results["Site Content"], { fields: ["Tags"] }), "Name").join(", ") + "")) set_data_dev(t73, t73_value);

    			if (dirty & /*cytosisObject*/ 4 && t77_value !== (t77_value = Cytosis.getFieldValues(
    				Cytosis.search("dummy item 0", /*cytosisObject*/ ctx[2].results["Site Content"], {
    					fields: ["Linked Items"],
    					linkedTables: /*cytosisObject*/ ctx[2].results["Items Table"]
    				}),
    				"Name"
    			).join(", ") + "")) set_data_dev(t77, t77_value);

    			if (dirty & /*cytosisObject*/ 4 && t84_value !== (t84_value = Cytosis.getFields(/*cytosisObject*/ ctx[2].results["Site Content"], "Tags").join(", ") + "")) set_data_dev(t84, t84_value);
    			if (dirty & /*cytosisObject*/ 4 && t86_value !== (t86_value = Cytosis.getFields(/*cytosisObject*/ ctx[2].results["Site Content"], "Linked Items").join(", ") + "")) set_data_dev(t86, t86_value);
    			if (dirty & /*cytosisObject*/ 4 && t91_value !== (t91_value = Cytosis.getFieldContent(/*cytosisObject*/ ctx[2].results["Site Content"], "Tags").join(", ") + "")) set_data_dev(t91, t91_value);

    			if (dirty & /*Cytosis, cytosisObject*/ 4) {
    				each_value = Cytosis.getFieldContent(/*cytosisObject*/ ctx[2].results["Site Content"], "Linked Items", /*cytosisObject*/ ctx[2].results["Items Table"]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div12, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h40);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(h41);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(h42);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(h43);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(h30);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(h44);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(h50);
    			if (detaching) detach_dev(t28);
    			if (detaching) detach_dev(p6);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t31);
    			if (detaching) detach_dev(p7);
    			if (detaching) detach_dev(t32);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t34);
    			if (detaching) detach_dev(h51);
    			if (detaching) detach_dev(t36);
    			if (detaching) detach_dev(p8);
    			if (detaching) detach_dev(t37);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t41);
    			if (detaching) detach_dev(h52);
    			if (detaching) detach_dev(t43);
    			if (detaching) detach_dev(p11);
    			if (detaching) detach_dev(t44);
    			if (detaching) detach_dev(div8);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			if (detaching) detach_dev(t48);
    			if (detaching) detach_dev(h53);
    			if (detaching) detach_dev(t50);
    			if (detaching) detach_dev(p13);
    			if (detaching) detach_dev(t51);
    			if (detaching) detach_dev(div9);
    			if (detaching) detach_dev(t53);
    			if (detaching) detach_dev(h45);
    			if (detaching) detach_dev(t55);
    			if (detaching) detach_dev(p15);
    			if (detaching) detach_dev(t56);
    			if (detaching) detach_dev(h54);
    			if (detaching) detach_dev(t58);
    			if (detaching) detach_dev(p16);
    			if (detaching) detach_dev(t59);
    			if (detaching) detach_dev(div10);
    			if (detaching) detach_dev(t78);
    			if (detaching) detach_dev(h31);
    			if (detaching) detach_dev(t80);
    			if (detaching) detach_dev(h46);
    			if (detaching) detach_dev(t82);
    			if (detaching) detach_dev(p22);
    			if (detaching) detach_dev(t83);
    			if (detaching) detach_dev(div11);
    			if (detaching) detach_dev(t87);
    			if (detaching) detach_dev(h47);
    			if (detaching) detach_dev(t89);
    			if (detaching) detach_dev(p25);
    			if (detaching) detach_dev(t90);
    			if (detaching) detach_dev(div13);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(52:1) {#if cytosisObject}",
    		ctx
    	});

    	return block;
    }

    // (102:4) {#each Cytosis.find('Site Content.linked-item-0>3.Linked Items', cytosisObject.results) as item (item.id)}
    function create_each_block_1$3(key_1, ctx) {
    	let p;
    	let t_value = /*item*/ ctx[9].fields["Name"] + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-11t96kd");
    			add_location(p, file$d, 102, 5, 5470);
    			this.first = p;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cytosisObject*/ 4 && t_value !== (t_value = /*item*/ ctx[9].fields["Name"] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(102:4) {#each Cytosis.find('Site Content.linked-item-0>3.Linked Items', cytosisObject.results) as item (item.id)}",
    		ctx
    	});

    	return block;
    }

    // (168:4) {#each Cytosis.getFieldContent(cytosisObject.results['Site Content'], 'Linked Items', cytosisObject.results['Items Table']) as _arr}
    function create_each_block$6(ctx) {
    	let p;
    	let t_value = (/*_arr*/ ctx[6] ? /*_arr*/ ctx[6].join(", ") : "[]") + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-11t96kd");
    			add_location(p, file$d, 168, 5, 9803);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cytosisObject*/ 4 && t_value !== (t_value = (/*_arr*/ ctx[6] ? /*_arr*/ ctx[6].join(", ") : "[]") + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(168:4) {#each Cytosis.getFieldContent(cytosisObject.results['Site Content'], 'Linked Items', cytosisObject.results['Items Table']) as _arr}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div1;
    	let h20;
    	let t0;
    	let t1;
    	let div0;
    	let raw0_value = marked_1(/*description*/ ctx[1]) + "";
    	let t2;
    	let h4;
    	let t4;
    	let p0;

    	let raw1_value = marked_1(`\`getRecord\` uses Airtable's \`.find()\` function to grab a single record straight from Airtable. In Svelte, we use an #await block to display it.
	`) + "";

    	let t5;
    	let promise;
    	let t6;
    	let h21;
    	let t8;
    	let p1;
    	let raw2_value = marked_1(`For the following examples, we've pulled the Site Content table using Cytosis`) + "";
    	let t9;
    	let cytosiswip;
    	let updating_isLoading;
    	let updating_cytosis;
    	let t10;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 12,
    		error: 13
    	};

    	handle_promise(
    		promise = Cytosis.getRecord({
    			recordId: "rec525Ip5YJCJMS7F",
    			tableName: "Site Content",
    			apiKey: "keygfuzbhXK1VShlR",
    			baseId: "appc0M3MdTYATe7RO"
    		}),
    		info
    	);

    	function cytosiswip_isLoading_binding(value) {
    		/*cytosiswip_isLoading_binding*/ ctx[4].call(null, value);
    	}

    	function cytosiswip_cytosis_binding(value) {
    		/*cytosiswip_cytosis_binding*/ ctx[5].call(null, value);
    	}

    	let cytosiswip_props = {
    		options: {
    			apiKey: "keygfuzbhXK1VShlR",
    			baseId: "appc0M3MdTYATe7RO",
    			configName: "all-data",
    			routeDetails: "Demo Eleven"
    		},
    		$$slots: { default: [create_default_slot$a] },
    		$$scope: { ctx }
    	};

    	if (/*cytosisLoading*/ ctx[3] !== void 0) {
    		cytosiswip_props.isLoading = /*cytosisLoading*/ ctx[3];
    	}

    	if (/*cytosisObject*/ ctx[2] !== void 0) {
    		cytosiswip_props.cytosis = /*cytosisObject*/ ctx[2];
    	}

    	cytosiswip = new CytosisWip({ props: cytosiswip_props, $$inline: true });
    	binding_callbacks.push(() => bind(cytosiswip, "isLoading", cytosiswip_isLoading_binding));
    	binding_callbacks.push(() => bind(cytosiswip, "cytosis", cytosiswip_cytosis_binding));
    	let if_block = /*cytosisObject*/ ctx[2] && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h20 = element("h2");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			h4 = element("h4");
    			h4.textContent = ".getRecord()";
    			t4 = space();
    			p0 = element("p");
    			t5 = space();
    			info.block.c();
    			t6 = space();
    			h21 = element("h2");
    			h21.textContent = "Cytosis getters";
    			t8 = space();
    			p1 = element("p");
    			t9 = space();
    			create_component(cytosiswip.$$.fragment);
    			t10 = space();
    			if (if_block) if_block.c();
    			attr_dev(h20, "class", "svelte-11t96kd");
    			add_location(h20, file$d, 3, 1, 45);
    			attr_dev(div0, "class", "svelte-11t96kd");
    			add_location(div0, file$d, 4, 1, 65);
    			attr_dev(h4, "class", "svelte-11t96kd");
    			add_location(h4, file$d, 8, 1, 109);
    			attr_dev(p0, "class", "svelte-11t96kd");
    			add_location(p0, file$d, 10, 1, 133);
    			attr_dev(h21, "class", "svelte-11t96kd");
    			add_location(h21, file$d, 27, 1, 710);
    			attr_dev(p1, "class", "svelte-11t96kd");
    			add_location(p1, file$d, 29, 1, 737);
    			attr_dev(div1, "class", " svelte-11t96kd");
    			add_location(div1, file$d, 2, 0, 29);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h20);
    			append_dev(h20, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			div0.innerHTML = raw0_value;
    			append_dev(div1, t2);
    			append_dev(div1, h4);
    			append_dev(div1, t4);
    			append_dev(div1, p0);
    			p0.innerHTML = raw1_value;
    			append_dev(div1, t5);
    			info.block.m(div1, info.anchor = null);
    			info.mount = () => div1;
    			info.anchor = t6;
    			append_dev(div1, t6);
    			append_dev(div1, h21);
    			append_dev(div1, t8);
    			append_dev(div1, p1);
    			p1.innerHTML = raw2_value;
    			append_dev(div1, t9);
    			mount_component(cytosiswip, div1, null);
    			append_dev(div1, t10);
    			if (if_block) if_block.m(div1, null);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if ((!current || dirty & /*description*/ 2) && raw0_value !== (raw0_value = marked_1(/*description*/ ctx[1]) + "")) div0.innerHTML = raw0_value;
    			{
    				const child_ctx = ctx.slice();
    				child_ctx[12] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			const cytosiswip_changes = {};

    			if (dirty & /*$$scope, cytosisObject, cytosisLoading*/ 16396) {
    				cytosiswip_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_isLoading && dirty & /*cytosisLoading*/ 8) {
    				updating_isLoading = true;
    				cytosiswip_changes.isLoading = /*cytosisLoading*/ ctx[3];
    				add_flush_callback(() => updating_isLoading = false);
    			}

    			if (!updating_cytosis && dirty & /*cytosisObject*/ 4) {
    				updating_cytosis = true;
    				cytosiswip_changes.cytosis = /*cytosisObject*/ ctx[2];
    				add_flush_callback(() => updating_cytosis = false);
    			}

    			cytosiswip.$set(cytosiswip_changes);

    			if (/*cytosisObject*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$a(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cytosiswip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cytosiswip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			info.block.d();
    			info.token = null;
    			info = null;
    			destroy_component(cytosiswip);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	marked_1.setOptions({ gfm: true, breaks: true });
    	let { title = `11. Getting and finding what you need` } = $$props;
    	let { description = `This demo shows how to use Get, Find, and other retrieval functions` } = $$props;
    	let cytosisObject;
    	let cytosisLoading = false;
    	const writable_props = ["title", "description"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DemoEleven> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DemoEleven", $$slots, []);

    	function cytosiswip_isLoading_binding(value) {
    		cytosisLoading = value;
    		$$invalidate(3, cytosisLoading);
    	}

    	function cytosiswip_cytosis_binding(value) {
    		cytosisObject = value;
    		$$invalidate(2, cytosisObject);
    	}

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    	};

    	$$self.$capture_state = () => ({
    		Cytosis,
    		CytosisWip,
    		marked: marked_1,
    		title,
    		description,
    		cytosisObject,
    		cytosisLoading
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("cytosisObject" in $$props) $$invalidate(2, cytosisObject = $$props.cytosisObject);
    		if ("cytosisLoading" in $$props) $$invalidate(3, cytosisLoading = $$props.cytosisLoading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		description,
    		cytosisObject,
    		cytosisLoading,
    		cytosiswip_isLoading_binding,
    		cytosiswip_cytosis_binding
    	];
    }

    class DemoEleven extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { title: 0, description: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DemoEleven",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get title() {
    		return this.$$.ctx[0];
    	}

    	set title(title) {
    		this.$set({ title });
    		flush();
    	}

    	get description() {
    		return this.$$.ctx[1];
    	}

    	set description(description) {
    		this.$set({ description });
    		flush();
    	}
    }

    /* src/examples/DemoTwelve.svelte generated by Svelte v3.24.0 */

    const { console: console_1$9 } = globals;
    const file$e = "src/examples/DemoTwelve.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	return child_ctx;
    }

    // (31:4) {#if cytosisLoading}
    function create_if_block_3$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("... loading Cytosis object ...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(31:4) {#if cytosisLoading}",
    		ctx
    	});

    	return block;
    }

    // (34:4) {#if cytosisObject}
    function create_if_block_2$6(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value_1 = /*cytosisObject*/ ctx[9].results["Pets"];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*pet*/ ctx[27].id;
    	validate_each_keys(ctx, each_value_1, get_each_context_1$4, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$4(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$4(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "_card _padding --flat svelte-1ea629c");
    			add_location(div, file$e, 34, 6, 1314);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cytosisObject*/ 512) {
    				const each_value_1 = /*cytosisObject*/ ctx[9].results["Pets"];
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1$4, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, destroy_block, create_each_block_1$4, null, get_each_context_1$4);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$6.name,
    		type: "if",
    		source: "(34:4) {#if cytosisObject}",
    		ctx
    	});

    	return block;
    }

    // (36:8) {#each cytosisObject.results['Pets'] as pet (pet.id)}
    function create_each_block_1$4(key_1, ctx) {
    	let div;
    	let html_tag;
    	let raw_value = marked_1(/*pet*/ ctx[27].fields["Name"]) + "";
    	let t0;
    	let t1_value = /*pet*/ ctx[27].fields["Animal"] + "";
    	let t1;
    	let t2;

    	let t3_value = (/*pet*/ ctx[27].fields["Tags"]
    	? /*pet*/ ctx[27].fields["Tags"].join(", ")
    	: "(no tags)") + "";

    	let t3;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t0 = text(" | Animal: ");
    			t1 = text(t1_value);
    			t2 = text(" | tags: ");
    			t3 = text(t3_value);
    			html_tag = new HtmlTag(t0);
    			attr_dev(div, "class", "pet svelte-1ea629c");
    			add_location(div, file$e, 36, 10, 1422);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			html_tag.m(raw_value, div);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cytosisObject*/ 512 && raw_value !== (raw_value = marked_1(/*pet*/ ctx[27].fields["Name"]) + "")) html_tag.p(raw_value);
    			if (dirty[0] & /*cytosisObject*/ 512 && t1_value !== (t1_value = /*pet*/ ctx[27].fields["Animal"] + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*cytosisObject*/ 512 && t3_value !== (t3_value = (/*pet*/ ctx[27].fields["Tags"]
    			? /*pet*/ ctx[27].fields["Tags"].join(", ")
    			: "(no tags)") + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$4.name,
    		type: "each",
    		source: "(36:8) {#each cytosisObject.results['Pets'] as pet (pet.id)}",
    		ctx
    	});

    	return block;
    }

    // (20:2) <CytosisWip     options={{       apiKey: 'keyIXVoSGhtPXrTnI',       baseId: 'app9xsC0ykwoAYHoC',       configName: 'pets-all',       routeDetails: 'Demo Twelve',     }}     bind:loadCytosis={loadCytosis}     bind:isLoading={cytosisLoading}     bind:cytosis={cytosisObject}   >
    function create_default_slot$b(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*cytosisLoading*/ ctx[11] && create_if_block_3$2(ctx);
    	let if_block1 = /*cytosisObject*/ ctx[9] && create_if_block_2$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*cytosisLoading*/ ctx[11]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_3$2(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*cytosisObject*/ ctx[9]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$6(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$b.name,
    		type: "slot",
    		source: "(20:2) <CytosisWip     options={{       apiKey: 'keyIXVoSGhtPXrTnI',       baseId: 'app9xsC0ykwoAYHoC',       configName: 'pets-all',       routeDetails: 'Demo Twelve',     }}     bind:loadCytosis={loadCytosis}     bind:isLoading={cytosisLoading}     bind:cytosis={cytosisObject}   >",
    		ctx
    	});

    	return block;
    }

    // (47:2) {#if cytosisLoading}
    function create_if_block_1$b(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("... loading Cytosis object ...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$b.name,
    		type: "if",
    		source: "(47:2) {#if cytosisLoading}",
    		ctx
    	});

    	return block;
    }

    // (50:2) {#if cytosisObject}
    function create_if_block$b(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*cytosisObject*/ ctx[9].results["Pets"];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*pet*/ ctx[27].id;
    	validate_each_keys(ctx, each_value, get_each_context$7, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$7(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$7(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "_card _padding --flat svelte-1ea629c");
    			add_location(div, file$e, 50, 4, 1838);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cytosisObject, getPetNames*/ 16896) {
    				const each_value = /*cytosisObject*/ ctx[9].results["Pets"];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$7, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block$7, null, get_each_context$7);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(50:2) {#if cytosisObject}",
    		ctx
    	});

    	return block;
    }

    // (52:6) {#each cytosisObject.results['Pets'] as pet (pet.id)}
    function create_each_block$7(key_1, ctx) {
    	let div;
    	let html_tag;
    	let raw_value = marked_1(/*pet*/ ctx[27].fields["Name"]) + "";
    	let t0;
    	let t1_value = /*getPetNames*/ ctx[14](/*pet*/ ctx[27]) + "";
    	let t1;
    	let t2;

    	let t3_value = (/*pet*/ ctx[27].fields["Tags"]
    	? /*pet*/ ctx[27].fields["Tags"].join(", ")
    	: "(no tags)") + "";

    	let t3;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t0 = text(" | Animal: ");
    			t1 = text(t1_value);
    			t2 = text(" | tags: ");
    			t3 = text(t3_value);
    			html_tag = new HtmlTag(t0);
    			attr_dev(div, "class", "pet svelte-1ea629c");
    			add_location(div, file$e, 52, 8, 1942);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			html_tag.m(raw_value, div);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cytosisObject*/ 512 && raw_value !== (raw_value = marked_1(/*pet*/ ctx[27].fields["Name"]) + "")) html_tag.p(raw_value);
    			if (dirty[0] & /*cytosisObject*/ 512 && t1_value !== (t1_value = /*getPetNames*/ ctx[14](/*pet*/ ctx[27]) + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*cytosisObject*/ 512 && t3_value !== (t3_value = (/*pet*/ ctx[27].fields["Tags"]
    			? /*pet*/ ctx[27].fields["Tags"].join(", ")
    			: "(no tags)") + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(52:6) {#each cytosisObject.results['Pets'] as pet (pet.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div5;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let raw0_value = marked_1(/*description*/ ctx[1]) + "";
    	let t2;
    	let p0;
    	let raw1_value = marked_1(/*more*/ ctx[2]) + "";
    	let t3;
    	let div2;
    	let label0;
    	let t5;
    	let div1;
    	let input0;
    	let t6;
    	let input1;
    	let t7;
    	let input2;
    	let t8;
    	let input3;
    	let t9;
    	let cytosiswip;
    	let updating_loadCytosis;
    	let updating_isLoading;
    	let updating_cytosis;
    	let t10;
    	let h40;
    	let t12;
    	let p1;
    	let raw2_value = marked_1(/*linkedTables*/ ctx[3]) + "";
    	let t13;
    	let t14;
    	let t15;
    	let h41;
    	let t17;
    	let p2;
    	let raw3_value = marked_1(/*savingLinkedTables*/ ctx[4]) + "";
    	let t18;
    	let div4;
    	let label1;
    	let t20;
    	let div3;
    	let input4;
    	let t21;
    	let input5;
    	let t22;
    	let input6;
    	let t23;
    	let input7;
    	let t24;
    	let input8;
    	let t25;
    	let p3;
    	let t27;
    	let iframe;
    	let iframe_src_value;
    	let current;
    	let mounted;
    	let dispose;

    	function cytosiswip_loadCytosis_binding(value) {
    		/*cytosiswip_loadCytosis_binding*/ ctx[18].call(null, value);
    	}

    	function cytosiswip_isLoading_binding(value) {
    		/*cytosiswip_isLoading_binding*/ ctx[19].call(null, value);
    	}

    	function cytosiswip_cytosis_binding(value) {
    		/*cytosiswip_cytosis_binding*/ ctx[20].call(null, value);
    	}

    	let cytosiswip_props = {
    		options: {
    			apiKey: "keyIXVoSGhtPXrTnI",
    			baseId: "app9xsC0ykwoAYHoC",
    			configName: "pets-all",
    			routeDetails: "Demo Twelve"
    		},
    		$$slots: { default: [create_default_slot$b] },
    		$$scope: { ctx }
    	};

    	if (/*loadCytosis*/ ctx[10] !== void 0) {
    		cytosiswip_props.loadCytosis = /*loadCytosis*/ ctx[10];
    	}

    	if (/*cytosisLoading*/ ctx[11] !== void 0) {
    		cytosiswip_props.isLoading = /*cytosisLoading*/ ctx[11];
    	}

    	if (/*cytosisObject*/ ctx[9] !== void 0) {
    		cytosiswip_props.cytosis = /*cytosisObject*/ ctx[9];
    	}

    	cytosiswip = new CytosisWip({ props: cytosiswip_props, $$inline: true });
    	binding_callbacks.push(() => bind(cytosiswip, "loadCytosis", cytosiswip_loadCytosis_binding));
    	binding_callbacks.push(() => bind(cytosiswip, "isLoading", cytosiswip_isLoading_binding));
    	binding_callbacks.push(() => bind(cytosiswip, "cytosis", cytosiswip_cytosis_binding));
    	let if_block0 = /*cytosisLoading*/ ctx[11] && create_if_block_1$b(ctx);
    	let if_block1 = /*cytosisObject*/ ctx[9] && create_if_block$b(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			p0 = element("p");
    			t3 = space();
    			div2 = element("div");
    			label0 = element("label");
    			label0.textContent = "Type your pet's name, what kind of animal it is, and some tags (if you want)!";
    			t5 = space();
    			div1 = element("div");
    			input0 = element("input");
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			input2 = element("input");
    			t8 = space();
    			input3 = element("input");
    			t9 = space();
    			create_component(cytosiswip.$$.fragment);
    			t10 = space();
    			h40 = element("h4");
    			h40.textContent = "Linked Tables";
    			t12 = space();
    			p1 = element("p");
    			t13 = space();
    			if (if_block0) if_block0.c();
    			t14 = space();
    			if (if_block1) if_block1.c();
    			t15 = space();
    			h41 = element("h4");
    			h41.textContent = "Saving Linked Tables";
    			t17 = space();
    			p2 = element("p");
    			t18 = space();
    			div4 = element("div");
    			label1 = element("label");
    			label1.textContent = "Type your pet's name, what kind of animal it is, and some tags (if you want)!";
    			t20 = space();
    			div3 = element("div");
    			input4 = element("input");
    			t21 = space();
    			input5 = element("input");
    			t22 = space();
    			input6 = element("input");
    			t23 = space();
    			input7 = element("input");
    			t24 = space();
    			input8 = element("input");
    			t25 = space();
    			p3 = element("p");
    			p3.textContent = "Here's what the actual Airtable looks like:";
    			t27 = space();
    			iframe = element("iframe");
    			attr_dev(h2, "class", "svelte-1ea629c");
    			add_location(h2, file$e, 3, 1, 45);
    			attr_dev(div0, "class", "svelte-1ea629c");
    			add_location(div0, file$e, 4, 1, 65);
    			attr_dev(p0, "class", " svelte-1ea629c");
    			add_location(p0, file$e, 6, 1, 107);
    			attr_dev(label0, "class", "_form-label svelte-1ea629c");
    			add_location(label0, file$e, 10, 4, 204);
    			attr_dev(input0, "class", "_form-input __width-full _margin-right svelte-1ea629c");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Type your pet name");
    			add_location(input0, file$e, 12, 6, 381);
    			attr_dev(input1, "class", "_form-input __width-full _margin-right svelte-1ea629c");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "Animal type, e.g. 'Cat' or 'Dog'");
    			add_location(input1, file$e, 13, 6, 510);
    			attr_dev(input2, "class", "_form-input __width-full _margin-right svelte-1ea629c");
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "placeholder", "Type tag like 'fluffy, 'derpy'");
    			add_location(input2, file$e, 14, 6, 656);
    			attr_dev(input3, "class", "submit-button _button _flex-1 __outline __short _margin-bottom-none  svelte-1ea629c");
    			attr_dev(input3, "type", "submit");
    			add_location(input3, file$e, 15, 6, 795);
    			attr_dev(div1, "class", "_action _flex-row-sm _padding-top-half svelte-1ea629c");
    			add_location(div1, file$e, 11, 4, 322);
    			attr_dev(div2, "class", "Formlet Formlet-input _form-control svelte-1ea629c");
    			add_location(div2, file$e, 9, 2, 149);
    			attr_dev(h40, "class", "_margin-top-2 svelte-1ea629c");
    			add_location(h40, file$e, 43, 2, 1652);
    			attr_dev(p1, "class", " svelte-1ea629c");
    			add_location(p1, file$e, 44, 2, 1699);
    			attr_dev(h41, "class", "_margin-top-2 svelte-1ea629c");
    			add_location(h41, file$e, 58, 2, 2146);
    			attr_dev(p2, "class", " svelte-1ea629c");
    			add_location(p2, file$e, 59, 2, 2200);
    			attr_dev(label1, "class", "_form-label svelte-1ea629c");
    			add_location(label1, file$e, 61, 4, 2309);
    			attr_dev(input4, "class", "_form-input __width-full _margin-right svelte-1ea629c");
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "placeholder", "Type your pet name");
    			add_location(input4, file$e, 63, 6, 2486);
    			attr_dev(input5, "class", "_form-input __width-full _margin-right svelte-1ea629c");
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "placeholder", "Animal type, e.g. 'Cat' or 'Dog'");
    			add_location(input5, file$e, 64, 6, 2615);
    			attr_dev(input6, "class", "_form-input __width-full _margin-right svelte-1ea629c");
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "placeholder", "A note about the animal");
    			add_location(input6, file$e, 65, 6, 2761);
    			attr_dev(input7, "class", "_form-input __width-full _margin-right svelte-1ea629c");
    			attr_dev(input7, "type", "text");
    			attr_dev(input7, "placeholder", "Type tag like 'fluffy, 'derpy'");
    			add_location(input7, file$e, 66, 6, 2899);
    			attr_dev(input8, "class", "submit-button _button _flex-1 __outline __short _margin-bottom-none  svelte-1ea629c");
    			attr_dev(input8, "type", "submit");
    			add_location(input8, file$e, 67, 6, 3038);
    			attr_dev(div3, "class", "_action _flex-row-sm _padding-top-half svelte-1ea629c");
    			add_location(div3, file$e, 62, 4, 2427);
    			attr_dev(div4, "class", "Formlet Formlet-input _form-control svelte-1ea629c");
    			add_location(div4, file$e, 60, 2, 2254);
    			attr_dev(div5, "class", " svelte-1ea629c");
    			add_location(div5, file$e, 2, 0, 29);
    			attr_dev(p3, "class", "_divider-top svelte-1ea629c");
    			add_location(p3, file$e, 77, 0, 3196);
    			attr_dev(iframe, "title", "Airtable example source");
    			attr_dev(iframe, "class", "airtable-embed svelte-1ea629c");
    			if (iframe.src !== (iframe_src_value = "https://airtable.com/embed/shrW9Hz9VT2zhxDQ7?backgroundColor=cyan")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "onmousewheel", "");
    			attr_dev(iframe, "width", "100%");
    			attr_dev(iframe, "height", "533");
    			set_style(iframe, "background", "transparent");
    			set_style(iframe, "border", "1px solid #ccc");
    			add_location(iframe, file$e, 78, 0, 3268);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, h2);
    			append_dev(h2, t0);
    			append_dev(div5, t1);
    			append_dev(div5, div0);
    			div0.innerHTML = raw0_value;
    			append_dev(div5, t2);
    			append_dev(div5, p0);
    			p0.innerHTML = raw1_value;
    			append_dev(div5, t3);
    			append_dev(div5, div2);
    			append_dev(div2, label0);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, input0);
    			set_input_value(input0, /*petName*/ ctx[5]);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			set_input_value(input1, /*animalName*/ ctx[7]);
    			append_dev(div1, t7);
    			append_dev(div1, input2);
    			set_input_value(input2, /*tags*/ ctx[6]);
    			append_dev(div1, t8);
    			append_dev(div1, input3);
    			append_dev(div5, t9);
    			mount_component(cytosiswip, div5, null);
    			append_dev(div5, t10);
    			append_dev(div5, h40);
    			append_dev(div5, t12);
    			append_dev(div5, p1);
    			p1.innerHTML = raw2_value;
    			append_dev(div5, t13);
    			if (if_block0) if_block0.m(div5, null);
    			append_dev(div5, t14);
    			if (if_block1) if_block1.m(div5, null);
    			append_dev(div5, t15);
    			append_dev(div5, h41);
    			append_dev(div5, t17);
    			append_dev(div5, p2);
    			p2.innerHTML = raw3_value;
    			append_dev(div5, t18);
    			append_dev(div5, div4);
    			append_dev(div4, label1);
    			append_dev(div4, t20);
    			append_dev(div4, div3);
    			append_dev(div3, input4);
    			set_input_value(input4, /*petName*/ ctx[5]);
    			append_dev(div3, t21);
    			append_dev(div3, input5);
    			set_input_value(input5, /*animalName*/ ctx[7]);
    			append_dev(div3, t22);
    			append_dev(div3, input6);
    			set_input_value(input6, /*animalNote*/ ctx[8]);
    			append_dev(div3, t23);
    			append_dev(div3, input7);
    			set_input_value(input7, /*tags*/ ctx[6]);
    			append_dev(div3, t24);
    			append_dev(div3, input8);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, iframe, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[15]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[16]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[17]),
    					listen_dev(input3, "click", /*addPet*/ ctx[12], false, false, false),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[21]),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[22]),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[23]),
    					listen_dev(input7, "input", /*input7_input_handler*/ ctx[24]),
    					listen_dev(input8, "click", /*addLinkedPet*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if ((!current || dirty[0] & /*description*/ 2) && raw0_value !== (raw0_value = marked_1(/*description*/ ctx[1]) + "")) div0.innerHTML = raw0_value;
    			if (dirty[0] & /*petName*/ 32 && input0.value !== /*petName*/ ctx[5]) {
    				set_input_value(input0, /*petName*/ ctx[5]);
    			}

    			if (dirty[0] & /*animalName*/ 128 && input1.value !== /*animalName*/ ctx[7]) {
    				set_input_value(input1, /*animalName*/ ctx[7]);
    			}

    			if (dirty[0] & /*tags*/ 64 && input2.value !== /*tags*/ ctx[6]) {
    				set_input_value(input2, /*tags*/ ctx[6]);
    			}

    			const cytosiswip_changes = {};

    			if (dirty[0] & /*cytosisObject, cytosisLoading*/ 2560 | dirty[1] & /*$$scope*/ 2) {
    				cytosiswip_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_loadCytosis && dirty[0] & /*loadCytosis*/ 1024) {
    				updating_loadCytosis = true;
    				cytosiswip_changes.loadCytosis = /*loadCytosis*/ ctx[10];
    				add_flush_callback(() => updating_loadCytosis = false);
    			}

    			if (!updating_isLoading && dirty[0] & /*cytosisLoading*/ 2048) {
    				updating_isLoading = true;
    				cytosiswip_changes.isLoading = /*cytosisLoading*/ ctx[11];
    				add_flush_callback(() => updating_isLoading = false);
    			}

    			if (!updating_cytosis && dirty[0] & /*cytosisObject*/ 512) {
    				updating_cytosis = true;
    				cytosiswip_changes.cytosis = /*cytosisObject*/ ctx[9];
    				add_flush_callback(() => updating_cytosis = false);
    			}

    			cytosiswip.$set(cytosiswip_changes);

    			if (/*cytosisLoading*/ ctx[11]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1$b(ctx);
    					if_block0.c();
    					if_block0.m(div5, t14);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*cytosisObject*/ ctx[9]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$b(ctx);
    					if_block1.c();
    					if_block1.m(div5, t15);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty[0] & /*petName*/ 32 && input4.value !== /*petName*/ ctx[5]) {
    				set_input_value(input4, /*petName*/ ctx[5]);
    			}

    			if (dirty[0] & /*animalName*/ 128 && input5.value !== /*animalName*/ ctx[7]) {
    				set_input_value(input5, /*animalName*/ ctx[7]);
    			}

    			if (dirty[0] & /*animalNote*/ 256 && input6.value !== /*animalNote*/ ctx[8]) {
    				set_input_value(input6, /*animalNote*/ ctx[8]);
    			}

    			if (dirty[0] & /*tags*/ 64 && input7.value !== /*tags*/ ctx[6]) {
    				set_input_value(input7, /*tags*/ ctx[6]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cytosiswip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cytosiswip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(cytosiswip);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(iframe);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	marked_1.setOptions({ gfm: true, breaks: true });
    	let { title = `12. Saving to Cytosis` } = $$props;
    	let { description = `This demo shows how to use a form to save directly to Cytosis.` } = $$props;

    	const more = `⚠️ Be careful! If you expose an Editor user's API key to your table to the browser, anyone can add, edit, or delete the contents on your table. You need to either use a server (or serverless/microservice), or create a second table that protects the content from the main table. Then, you can create a second user, and share your table with that user with Read Only or Editor permissions, and you can use that user's API key to access the table.

To add new items like linked tables and single and multiple select values, you can use "typecast" which creates new items in Airtable. For this to work, make sure the API key's user has **Creator Access** and not merely editor access. This works for both single and multiple select fields and linked fields
`;

    	const linkedTables = `You might have noticed the Animal field is a linked table, and doesn't show up properly, because it's in another table (Animals). For those to show up, you have to get the linked record with 'getByIds'
`;

    	const savingLinkedTables = `Here is an example of how to save to linked tables with Cytosis' insertLinked() function, which doesn't require typecasting. (However, do note that new Multi Select items still need typecasting and Creator permissions to create new options)
`;

    	/*
      - matchKeywordWithField
        - show a few field settings
        - show partial — a piece of text appears in a field
        - show regular — for example retrieving a slug or page name


    */
    	let status, petName = "", tags = "", animalName = null, animalNote = null;

    	let cytosisObject, loadedConfig, loadCytosis;
    	let cytosisLoading = false;

    	const addPet = async () => {
    		await Cytosis.save({
    			apiKey: "keyIXVoSGhtPXrTnI",
    			baseId: "app9xsC0ykwoAYHoC",
    			tableName: "Pets",
    			tableOptions: { insertOptions: ["typecast"] },
    			payload: {
    				Name: petName,
    				Animal: animalName,
    				Tags: tags.length > 0
    				? tags.split(",").map(item => item.trim())
    				: null
    			}
    		});

    		$$invalidate(7, animalName = "");
    		$$invalidate(5, petName = "");
    		$$invalidate(6, tags = "");
    		await loadCytosis();
    	};

    	const addLinkedPet = async () => {
    		console.log("adding a linked pet!");

    		await Cytosis.save({
    			apiKey: "keyIXVoSGhtPXrTnI",
    			baseId: "app9xsC0ykwoAYHoC",
    			tableName: "Pets",
    			tableOptions: {
    				insertOptions: ["typecast"],
    				linkedObjects: [
    					{
    						key: "Name",
    						field: "Animal",
    						table: "Animals"
    					}
    				]
    			},
    			payload: {
    				Name: petName,
    				Animal: { "Name": animalName, "Notes": animalNote },
    				Tags: tags.length > 0
    				? tags.split(",").map(item => item.trim())
    				: null
    			}
    		});

    		$$invalidate(5, petName = "");
    		$$invalidate(6, tags = "");
    		$$invalidate(7, animalName = "");
    		$$invalidate(8, animalNote = "");
    		await loadCytosis();
    	};

    	const getPetNames = pet => {
    		const animals = Cytosis.getByIds(pet.fields["Animal"], cytosisObject.results["Animals"]);
    		let pets = [];

    		animals.map(pet => {
    			pets.push(pet.fields["Name"]);
    		});

    		return pets.join(", ");
    	};

    	const writable_props = ["title", "description"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$9.warn(`<DemoTwelve> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DemoTwelve", $$slots, []);

    	function input0_input_handler() {
    		petName = this.value;
    		$$invalidate(5, petName);
    	}

    	function input1_input_handler() {
    		animalName = this.value;
    		$$invalidate(7, animalName);
    	}

    	function input2_input_handler() {
    		tags = this.value;
    		$$invalidate(6, tags);
    	}

    	function cytosiswip_loadCytosis_binding(value) {
    		loadCytosis = value;
    		$$invalidate(10, loadCytosis);
    	}

    	function cytosiswip_isLoading_binding(value) {
    		cytosisLoading = value;
    		$$invalidate(11, cytosisLoading);
    	}

    	function cytosiswip_cytosis_binding(value) {
    		cytosisObject = value;
    		$$invalidate(9, cytosisObject);
    	}

    	function input4_input_handler() {
    		petName = this.value;
    		$$invalidate(5, petName);
    	}

    	function input5_input_handler() {
    		animalName = this.value;
    		$$invalidate(7, animalName);
    	}

    	function input6_input_handler() {
    		animalNote = this.value;
    		$$invalidate(8, animalNote);
    	}

    	function input7_input_handler() {
    		tags = this.value;
    		$$invalidate(6, tags);
    	}

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    	};

    	$$self.$capture_state = () => ({
    		Cytosis,
    		CytosisWip,
    		marked: marked_1,
    		title,
    		description,
    		more,
    		linkedTables,
    		savingLinkedTables,
    		status,
    		petName,
    		tags,
    		animalName,
    		animalNote,
    		cytosisObject,
    		loadedConfig,
    		loadCytosis,
    		cytosisLoading,
    		addPet,
    		addLinkedPet,
    		getPetNames
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("status" in $$props) status = $$props.status;
    		if ("petName" in $$props) $$invalidate(5, petName = $$props.petName);
    		if ("tags" in $$props) $$invalidate(6, tags = $$props.tags);
    		if ("animalName" in $$props) $$invalidate(7, animalName = $$props.animalName);
    		if ("animalNote" in $$props) $$invalidate(8, animalNote = $$props.animalNote);
    		if ("cytosisObject" in $$props) $$invalidate(9, cytosisObject = $$props.cytosisObject);
    		if ("loadedConfig" in $$props) loadedConfig = $$props.loadedConfig;
    		if ("loadCytosis" in $$props) $$invalidate(10, loadCytosis = $$props.loadCytosis);
    		if ("cytosisLoading" in $$props) $$invalidate(11, cytosisLoading = $$props.cytosisLoading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		description,
    		more,
    		linkedTables,
    		savingLinkedTables,
    		petName,
    		tags,
    		animalName,
    		animalNote,
    		cytosisObject,
    		loadCytosis,
    		cytosisLoading,
    		addPet,
    		addLinkedPet,
    		getPetNames,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		cytosiswip_loadCytosis_binding,
    		cytosiswip_isLoading_binding,
    		cytosiswip_cytosis_binding,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler,
    		input7_input_handler
    	];
    }

    class DemoTwelve extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$e,
    			create_fragment$e,
    			safe_not_equal,
    			{
    				title: 0,
    				description: 1,
    				more: 2,
    				linkedTables: 3,
    				savingLinkedTables: 4
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DemoTwelve",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get title() {
    		return this.$$.ctx[0];
    	}

    	set title(title) {
    		this.$set({ title });
    		flush();
    	}

    	get description() {
    		return this.$$.ctx[1];
    	}

    	set description(description) {
    		this.$set({ description });
    		flush();
    	}

    	get more() {
    		return this.$$.ctx[2];
    	}

    	set more(value) {
    		throw new Error("<DemoTwelve>: Cannot set read-only property 'more'");
    	}

    	get linkedTables() {
    		return this.$$.ctx[3];
    	}

    	set linkedTables(value) {
    		throw new Error("<DemoTwelve>: Cannot set read-only property 'linkedTables'");
    	}

    	get savingLinkedTables() {
    		return this.$$.ctx[4];
    	}

    	set savingLinkedTables(value) {
    		throw new Error("<DemoTwelve>: Cannot set read-only property 'savingLinkedTables'");
    	}
    }

    /* src/examples/DemoThirteen.svelte generated by Svelte v3.24.0 */

    const { console: console_1$a } = globals;
    const file$f = "src/examples/DemoThirteen.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[33] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[33] = list[i];
    	child_ctx[36] = list;
    	child_ctx[37] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[33] = list[i];
    	return child_ctx;
    }

    // (21:4) {#if petArray.length > 0}
    function create_if_block_3$3(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*petArray*/ ctx[11];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "Save these to Airtable";
    			attr_dev(button, "class", "_button _flex-1 __outline __short _margin-top _margin-bottom-none __nowrap svelte-7dmcv7");
    			add_location(button, file$f, 26, 10, 1247);
    			attr_dev(div0, "class", "svelte-7dmcv7");
    			add_location(div0, file$f, 25, 8, 1231);
    			attr_dev(div1, "class", "_card _padding svelte-7dmcv7");
    			add_location(div1, file$f, 21, 6, 1072);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*savePets*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*petArray*/ 2048) {
    				each_value_2 = /*petArray*/ ctx[11];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(21:4) {#if petArray.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (23:8) {#each petArray as pet}
    function create_each_block_2(ctx) {
    	let div;
    	let t0_value = /*pet*/ ctx[33]["Name"] + "";
    	let t0;
    	let t1;
    	let t2_value = /*pet*/ ctx[33]["Animal"] + "";
    	let t2;
    	let t3;
    	let t4_value = /*pet*/ ctx[33]["Tags"] + "";
    	let t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			t4 = text(t4_value);
    			attr_dev(div, "class", " svelte-7dmcv7");
    			add_location(div, file$f, 23, 10, 1143);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*petArray*/ 2048 && t0_value !== (t0_value = /*pet*/ ctx[33]["Name"] + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*petArray*/ 2048 && t2_value !== (t2_value = /*pet*/ ctx[33]["Animal"] + "")) set_data_dev(t2, t2_value);
    			if (dirty[0] & /*petArray*/ 2048 && t4_value !== (t4_value = /*pet*/ ctx[33]["Tags"] + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(23:8) {#each petArray as pet}",
    		ctx
    	});

    	return block;
    }

    // (56:2) {:else}
    function create_else_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "To test out Updating, Replacing, or Deleting data, please add one or more animals in the previous section!";
    			attr_dev(div, "class", "_card _padding svelte-7dmcv7");
    			add_location(div, file$f, 56, 4, 2934);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(56:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (36:2) {#if petResults.length > 0}
    function create_if_block_2$7(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let button0;
    	let t2;
    	let button1;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*petResults*/ ctx[12];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$5(get_each_context_1$5(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Update pet data";
    			t2 = space();
    			button1 = element("button");
    			button1.textContent = "Replace pet data";
    			attr_dev(button0, "class", "_button _flex-1 __outline __short _margin-top _margin-bottom-none __nowrap svelte-7dmcv7");
    			add_location(button0, file$f, 50, 8, 2563);
    			attr_dev(button1, "class", "_button _flex-1 __outline __short _margin-top _margin-bottom-none __nowrap svelte-7dmcv7");
    			add_location(button1, file$f, 51, 8, 2728);
    			attr_dev(div0, "class", "svelte-7dmcv7");
    			add_location(div0, file$f, 49, 6, 2549);
    			attr_dev(div1, "class", "_card _padding svelte-7dmcv7");
    			add_location(div1, file$f, 36, 4, 1609);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t2);
    			append_dev(div0, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler_1*/ ctx[24], false, false, false),
    					listen_dev(button1, "click", /*click_handler_2*/ ctx[25], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*removePet, petResults*/ 69632) {
    				each_value_1 = /*petResults*/ ctx[12];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$5(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$7.name,
    		type: "if",
    		source: "(36:2) {#if petResults.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (38:6) {#each petResults as pet, i}
    function create_each_block_1$5(ctx) {
    	let div1;
    	let label;
    	let t1;
    	let div0;
    	let input0;
    	let t2;
    	let input1;
    	let t3;
    	let input2;
    	let t4;
    	let button;
    	let mounted;
    	let dispose;

    	function input0_input_handler_1() {
    		/*input0_input_handler_1*/ ctx[20].call(input0, /*each_value_1*/ ctx[36], /*i*/ ctx[37]);
    	}

    	function input1_input_handler_1() {
    		/*input1_input_handler_1*/ ctx[21].call(input1, /*each_value_1*/ ctx[36], /*i*/ ctx[37]);
    	}

    	function input2_input_handler_1() {
    		/*input2_input_handler_1*/ ctx[22].call(input2, /*each_value_1*/ ctx[36], /*i*/ ctx[37]);
    	}

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[23](/*i*/ ctx[37], ...args);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			label = element("label");
    			label.textContent = "Edit the pets you just entered!";
    			t1 = space();
    			div0 = element("div");
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			t3 = space();
    			input2 = element("input");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Remove";
    			attr_dev(label, "class", "_form-label svelte-7dmcv7");
    			add_location(label, file$f, 39, 10, 1742);
    			attr_dev(input0, "class", "_form-input __width-full _margin-right svelte-7dmcv7");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Type your pet name");
    			add_location(input0, file$f, 41, 12, 1885);
    			attr_dev(input1, "class", "_form-input __width-full _margin-right svelte-7dmcv7");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "Animal type, e.g. 'Cat' or 'Dog'");
    			add_location(input1, file$f, 42, 12, 2031);
    			attr_dev(input2, "class", "_form-input __width-full _margin-right svelte-7dmcv7");
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "placeholder", "Type tag like 'fluffy, 'derpy'");
    			add_location(input2, file$f, 43, 12, 2193);
    			attr_dev(button, "class", "_button _flex-1 __outline __short _margin-bottom-none __nowrap svelte-7dmcv7");
    			add_location(button, file$f, 44, 12, 2352);
    			attr_dev(div0, "class", "_action _flex-row-sm _padding-top-half svelte-7dmcv7");
    			add_location(div0, file$f, 40, 10, 1820);
    			attr_dev(div1, "class", "Formlet Formlet-input _form-control svelte-7dmcv7");
    			add_location(div1, file$f, 38, 8, 1681);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, label);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, input0);
    			set_input_value(input0, /*pet*/ ctx[33].fields["Name"]);
    			append_dev(div0, t2);
    			append_dev(div0, input1);
    			set_input_value(input1, /*pet*/ ctx[33].fields["Animal"]);
    			append_dev(div0, t3);
    			append_dev(div0, input2);
    			set_input_value(input2, /*pet*/ ctx[33].fields["Tags"]);
    			append_dev(div0, t4);
    			append_dev(div0, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", input0_input_handler_1),
    					listen_dev(input1, "input", input1_input_handler_1),
    					listen_dev(input2, "input", input2_input_handler_1),
    					listen_dev(button, "click", click_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*petResults*/ 4096 && input0.value !== /*pet*/ ctx[33].fields["Name"]) {
    				set_input_value(input0, /*pet*/ ctx[33].fields["Name"]);
    			}

    			if (dirty[0] & /*petResults*/ 4096 && input1.value !== /*pet*/ ctx[33].fields["Animal"]) {
    				set_input_value(input1, /*pet*/ ctx[33].fields["Animal"]);
    			}

    			if (dirty[0] & /*petResults*/ 4096 && input2.value !== /*pet*/ ctx[33].fields["Tags"]) {
    				set_input_value(input2, /*pet*/ ctx[33].fields["Tags"]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$5.name,
    		type: "each",
    		source: "(38:6) {#each petResults as pet, i}",
    		ctx
    	});

    	return block;
    }

    // (75:4) {#if cytosisLoading}
    function create_if_block_1$c(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("... loading Cytosis object ...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$c.name,
    		type: "if",
    		source: "(75:4) {#if cytosisLoading}",
    		ctx
    	});

    	return block;
    }

    // (78:4) {#if cytosisObject}
    function create_if_block$c(ctx) {
    	let h4;
    	let t1;
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*cytosisObject*/ ctx[8].results["Pets"];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*pet*/ ctx[33].id;
    	validate_each_keys(ctx, each_value, get_each_context$8, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$8(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$8(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			h4.textContent = "Received Airtable Data";
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h4, "class", "_margin-top-2 svelte-7dmcv7");
    			add_location(h4, file$f, 78, 6, 3481);
    			attr_dev(div, "class", "_card _padding --flat svelte-7dmcv7");
    			add_location(div, file$f, 79, 6, 3541);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cytosisObject*/ 256) {
    				const each_value = /*cytosisObject*/ ctx[8].results["Pets"];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$8, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block$8, null, get_each_context$8);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(78:4) {#if cytosisObject}",
    		ctx
    	});

    	return block;
    }

    // (81:8) {#each cytosisObject.results['Pets'] as pet (pet.id)}
    function create_each_block$8(key_1, ctx) {
    	let div;
    	let html_tag;
    	let raw_value = marked_1(/*pet*/ ctx[33].fields["Name"]) + "";
    	let t0;
    	let t1_value = /*pet*/ ctx[33].fields["Animal"] + "";
    	let t1;
    	let t2;

    	let t3_value = (/*pet*/ ctx[33].fields["Tags"]
    	? /*pet*/ ctx[33].fields["Tags"].join(", ")
    	: "(no tags)") + "";

    	let t3;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t0 = text(" | Animal: ");
    			t1 = text(t1_value);
    			t2 = text(" | tags: ");
    			t3 = text(t3_value);
    			html_tag = new HtmlTag(t0);
    			attr_dev(div, "class", "pet svelte-7dmcv7");
    			add_location(div, file$f, 81, 10, 3649);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			html_tag.m(raw_value, div);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cytosisObject*/ 256 && raw_value !== (raw_value = marked_1(/*pet*/ ctx[33].fields["Name"]) + "")) html_tag.p(raw_value);
    			if (dirty[0] & /*cytosisObject*/ 256 && t1_value !== (t1_value = /*pet*/ ctx[33].fields["Animal"] + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*cytosisObject*/ 256 && t3_value !== (t3_value = (/*pet*/ ctx[33].fields["Tags"]
    			? /*pet*/ ctx[33].fields["Tags"].join(", ")
    			: "(no tags)") + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(81:8) {#each cytosisObject.results['Pets'] as pet (pet.id)}",
    		ctx
    	});

    	return block;
    }

    // (64:2) <CytosisWip     options={{       apiKey: 'keyIXVoSGhtPXrTnI',       baseId: 'app9xsC0ykwoAYHoC',       configName: 'pets-all',       routeDetails: 'Demo Twelve',     }}     bind:loadCytosis={loadCytosis}     bind:isLoading={cytosisLoading}     bind:cytosis={cytosisObject}   >
    function create_default_slot$c(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*cytosisLoading*/ ctx[10] && create_if_block_1$c(ctx);
    	let if_block1 = /*cytosisObject*/ ctx[8] && create_if_block$c(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*cytosisLoading*/ ctx[10]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1$c(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*cytosisObject*/ ctx[8]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$c(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$c.name,
    		type: "slot",
    		source: "(64:2) <CytosisWip     options={{       apiKey: 'keyIXVoSGhtPXrTnI',       baseId: 'app9xsC0ykwoAYHoC',       configName: 'pets-all',       routeDetails: 'Demo Twelve',     }}     bind:loadCytosis={loadCytosis}     bind:isLoading={cytosisLoading}     bind:cytosis={cytosisObject}   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div3;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let raw0_value = marked_1(/*description*/ ctx[1]) + "";
    	let t2;
    	let p0;
    	let raw1_value = marked_1(/*more*/ ctx[2]) + "";
    	let t3;
    	let h40;
    	let t5;
    	let p1;
    	let raw2_value = marked_1(/*createMultiple*/ ctx[3]) + "";
    	let t6;
    	let div2;
    	let label;
    	let t8;
    	let div1;
    	let input0;
    	let t9;
    	let input1;
    	let t10;
    	let input2;
    	let t11;
    	let button;
    	let t13;
    	let t14;
    	let h41;
    	let t16;
    	let p2;
    	let raw3_value = marked_1(/*updateReplaceTables*/ ctx[4]) + "";
    	let t17;
    	let t18;
    	let cytosiswip;
    	let updating_loadCytosis;
    	let updating_isLoading;
    	let updating_cytosis;
    	let t19;
    	let p3;
    	let t21;
    	let iframe;
    	let iframe_src_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*petArray*/ ctx[11].length > 0 && create_if_block_3$3(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*petResults*/ ctx[12].length > 0) return create_if_block_2$7;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	function cytosiswip_loadCytosis_binding(value) {
    		/*cytosiswip_loadCytosis_binding*/ ctx[26].call(null, value);
    	}

    	function cytosiswip_isLoading_binding(value) {
    		/*cytosiswip_isLoading_binding*/ ctx[27].call(null, value);
    	}

    	function cytosiswip_cytosis_binding(value) {
    		/*cytosiswip_cytosis_binding*/ ctx[28].call(null, value);
    	}

    	let cytosiswip_props = {
    		options: {
    			apiKey: "keyIXVoSGhtPXrTnI",
    			baseId: "app9xsC0ykwoAYHoC",
    			configName: "pets-all",
    			routeDetails: "Demo Twelve"
    		},
    		$$slots: { default: [create_default_slot$c] },
    		$$scope: { ctx }
    	};

    	if (/*loadCytosis*/ ctx[9] !== void 0) {
    		cytosiswip_props.loadCytosis = /*loadCytosis*/ ctx[9];
    	}

    	if (/*cytosisLoading*/ ctx[10] !== void 0) {
    		cytosiswip_props.isLoading = /*cytosisLoading*/ ctx[10];
    	}

    	if (/*cytosisObject*/ ctx[8] !== void 0) {
    		cytosiswip_props.cytosis = /*cytosisObject*/ ctx[8];
    	}

    	cytosiswip = new CytosisWip({ props: cytosiswip_props, $$inline: true });
    	binding_callbacks.push(() => bind(cytosiswip, "loadCytosis", cytosiswip_loadCytosis_binding));
    	binding_callbacks.push(() => bind(cytosiswip, "isLoading", cytosiswip_isLoading_binding));
    	binding_callbacks.push(() => bind(cytosiswip, "cytosis", cytosiswip_cytosis_binding));

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			p0 = element("p");
    			t3 = space();
    			h40 = element("h4");
    			h40.textContent = "Creating Multiple Values";
    			t5 = space();
    			p1 = element("p");
    			t6 = space();
    			div2 = element("div");
    			label = element("label");
    			label.textContent = "Type your pet's name, what kind of animal it is, and some tags (if you want)!";
    			t8 = space();
    			div1 = element("div");
    			input0 = element("input");
    			t9 = space();
    			input1 = element("input");
    			t10 = space();
    			input2 = element("input");
    			t11 = space();
    			button = element("button");
    			button.textContent = "Add Pet";
    			t13 = space();
    			if (if_block0) if_block0.c();
    			t14 = space();
    			h41 = element("h4");
    			h41.textContent = "Updating, Replacing, Deleting Multiple Values";
    			t16 = space();
    			p2 = element("p");
    			t17 = space();
    			if_block1.c();
    			t18 = space();
    			create_component(cytosiswip.$$.fragment);
    			t19 = space();
    			p3 = element("p");
    			p3.textContent = "Here's what the actual Airtable looks like:";
    			t21 = space();
    			iframe = element("iframe");
    			attr_dev(h2, "class", "svelte-7dmcv7");
    			add_location(h2, file$f, 3, 1, 45);
    			attr_dev(div0, "class", "svelte-7dmcv7");
    			add_location(div0, file$f, 4, 1, 65);
    			attr_dev(p0, "class", " svelte-7dmcv7");
    			add_location(p0, file$f, 6, 1, 107);
    			attr_dev(h40, "class", "_margin-top-2 svelte-7dmcv7");
    			add_location(h40, file$f, 8, 2, 148);
    			attr_dev(p1, "class", " svelte-7dmcv7");
    			add_location(p1, file$f, 9, 2, 206);
    			attr_dev(label, "class", "_form-label svelte-7dmcv7");
    			add_location(label, file$f, 12, 4, 312);
    			attr_dev(input0, "class", "_form-input __width-full _margin-right svelte-7dmcv7");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Type your pet name");
    			add_location(input0, file$f, 14, 6, 489);
    			attr_dev(input1, "class", "_form-input __width-full _margin-right svelte-7dmcv7");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "Animal type, e.g. 'Cat' or 'Dog'");
    			add_location(input1, file$f, 15, 6, 618);
    			attr_dev(input2, "class", "_form-input __width-full _margin-right svelte-7dmcv7");
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "placeholder", "Type tag like 'fluffy, 'derpy'");
    			add_location(input2, file$f, 16, 6, 764);
    			attr_dev(button, "class", "_button _flex-1 __outline __short _margin-bottom-none __nowrap svelte-7dmcv7");
    			add_location(button, file$f, 17, 6, 903);
    			attr_dev(div1, "class", "_action _flex-row-sm _padding-top-half svelte-7dmcv7");
    			add_location(div1, file$f, 13, 4, 430);
    			attr_dev(div2, "class", "Formlet Formlet-input _form-control svelte-7dmcv7");
    			add_location(div2, file$f, 11, 2, 257);
    			attr_dev(h41, "class", "_margin-top-2 svelte-7dmcv7");
    			add_location(h41, file$f, 32, 2, 1442);
    			attr_dev(p2, "class", " svelte-7dmcv7");
    			add_location(p2, file$f, 33, 2, 1521);
    			attr_dev(div3, "class", " svelte-7dmcv7");
    			add_location(div3, file$f, 2, 0, 29);
    			attr_dev(p3, "class", "_divider-top svelte-7dmcv7");
    			add_location(p3, file$f, 91, 0, 3884);
    			attr_dev(iframe, "title", "Airtable example source");
    			attr_dev(iframe, "class", "airtable-embed svelte-7dmcv7");
    			if (iframe.src !== (iframe_src_value = "https://airtable.com/embed/shrW9Hz9VT2zhxDQ7?backgroundColor=cyan")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "onmousewheel", "");
    			attr_dev(iframe, "width", "100%");
    			attr_dev(iframe, "height", "533");
    			set_style(iframe, "background", "transparent");
    			set_style(iframe, "border", "1px solid #ccc");
    			add_location(iframe, file$f, 92, 0, 3956);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, h2);
    			append_dev(h2, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div0);
    			div0.innerHTML = raw0_value;
    			append_dev(div3, t2);
    			append_dev(div3, p0);
    			p0.innerHTML = raw1_value;
    			append_dev(div3, t3);
    			append_dev(div3, h40);
    			append_dev(div3, t5);
    			append_dev(div3, p1);
    			p1.innerHTML = raw2_value;
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, label);
    			append_dev(div2, t8);
    			append_dev(div2, div1);
    			append_dev(div1, input0);
    			set_input_value(input0, /*petName*/ ctx[5]);
    			append_dev(div1, t9);
    			append_dev(div1, input1);
    			set_input_value(input1, /*animalName*/ ctx[7]);
    			append_dev(div1, t10);
    			append_dev(div1, input2);
    			set_input_value(input2, /*tags*/ ctx[6]);
    			append_dev(div1, t11);
    			append_dev(div1, button);
    			append_dev(div2, t13);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div3, t14);
    			append_dev(div3, h41);
    			append_dev(div3, t16);
    			append_dev(div3, p2);
    			p2.innerHTML = raw3_value;
    			append_dev(div3, t17);
    			if_block1.m(div3, null);
    			append_dev(div3, t18);
    			mount_component(cytosiswip, div3, null);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, iframe, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[17]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[18]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[19]),
    					listen_dev(button, "click", /*addPetToArray*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if ((!current || dirty[0] & /*description*/ 2) && raw0_value !== (raw0_value = marked_1(/*description*/ ctx[1]) + "")) div0.innerHTML = raw0_value;
    			if (dirty[0] & /*petName*/ 32 && input0.value !== /*petName*/ ctx[5]) {
    				set_input_value(input0, /*petName*/ ctx[5]);
    			}

    			if (dirty[0] & /*animalName*/ 128 && input1.value !== /*animalName*/ ctx[7]) {
    				set_input_value(input1, /*animalName*/ ctx[7]);
    			}

    			if (dirty[0] & /*tags*/ 64 && input2.value !== /*tags*/ ctx[6]) {
    				set_input_value(input2, /*tags*/ ctx[6]);
    			}

    			if (/*petArray*/ ctx[11].length > 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$3(ctx);
    					if_block0.c();
    					if_block0.m(div2, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div3, t18);
    				}
    			}

    			const cytosiswip_changes = {};

    			if (dirty[0] & /*cytosisObject, cytosisLoading*/ 1280 | dirty[1] & /*$$scope*/ 512) {
    				cytosiswip_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_loadCytosis && dirty[0] & /*loadCytosis*/ 512) {
    				updating_loadCytosis = true;
    				cytosiswip_changes.loadCytosis = /*loadCytosis*/ ctx[9];
    				add_flush_callback(() => updating_loadCytosis = false);
    			}

    			if (!updating_isLoading && dirty[0] & /*cytosisLoading*/ 1024) {
    				updating_isLoading = true;
    				cytosiswip_changes.isLoading = /*cytosisLoading*/ ctx[10];
    				add_flush_callback(() => updating_isLoading = false);
    			}

    			if (!updating_cytosis && dirty[0] & /*cytosisObject*/ 256) {
    				updating_cytosis = true;
    				cytosiswip_changes.cytosis = /*cytosisObject*/ ctx[8];
    				add_flush_callback(() => updating_cytosis = false);
    			}

    			cytosiswip.$set(cytosiswip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cytosiswip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cytosiswip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			destroy_component(cytosiswip);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(iframe);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	marked_1.setOptions({ gfm: true, breaks: true });
    	let { title = `13. Saving and Deleting Multiple Objects` } = $$props;
    	let { description = `This demo shows how to save using arrays of objects using the bulk create or update function.` } = $$props;

    	const more = `⚠️ Be careful! If you expose an Editor user's API key to your table to the browser, anyone can add, edit, or delete the contents on your table. You need to either use a server (or serverless/microservice), or create a second table that protects the content from the main table. Then, you can create a second user, and share your table with that user with Read Only or Editor permissions, and you can use that user's API key to access the table.

To add new items like linked tables and single and multiple select values, you can use "typecast" which creates new items in Airtable. For this to work, make sure the API key's user has **Creator Access** and not merely editor access. This works for both single and multiple select fields and linked fields
`;

    	const createMultiple = `Use saveArray() to save multiple items by passing an array of objects into 'payload'. Note that the Airtable API only allows ten items to be saved at once. Linked item creation is supported through typecasting (needs Creator-level access).

~~~
  saveArray({payload, tableName, apiKey, baseId, cytosis, tableOptions, type="create"})
~~~
`;

    	const updateReplaceTables = `Updating and Replacing works very similarly to Saving. The difference is that each object requires an 'id' field, and the type needs to specify 'update' or 'replace'
`;

    	/*
      - matchKeywordWithField
        - show a few field settings
        - show partial — a piece of text appears in a field
        - show regular — for example retrieving a slug or page name


    */
    	let status, petName = "", tags = undefined, animalName = null, animalNote = null;

    	let cytosisObject, loadedConfig, loadCytosis;
    	let cytosisLoading = false;
    	let petArray = [], petResults = [];

    	const addPetToArray = async () => {
    		petArray.push({
    			Name: petName,
    			Animal: animalName,
    			Tags: tags
    		});

    		$$invalidate(11, petArray);
    		$$invalidate(7, animalName = "");
    		$$invalidate(5, petName = "");
    		$$invalidate(6, tags = "");
    	};

    	const savePets = async () => {
    		$$invalidate(12, petResults = await Cytosis.saveArray({
    			apiKey: "keyIXVoSGhtPXrTnI",
    			baseId: "app9xsC0ykwoAYHoC",
    			tableName: "Pets",
    			tableOptions: { insertOptions: ["typecast"] },
    			payload: petArray
    		}));

    		$$invalidate(7, animalName = "");
    		$$invalidate(5, petName = "");
    		$$invalidate(6, tags = "");

    		// console.log('save results:', petResults)
    		await loadCytosis();
    	};

    	const updateReplacePetData = async (type = "update") => {
    		console.log("updateReplacePetData", type, petResults);

    		petResults.map(pet => {
    			delete pet.fields["Created time"]; // computed fields aren't ignored by the API
    		});

    		let newResults = await Cytosis.saveArray({
    			apiKey: "keyIXVoSGhtPXrTnI",
    			baseId: "app9xsC0ykwoAYHoC",
    			tableName: "Pets",
    			tableOptions: { insertOptions: ["typecast"] },
    			type,
    			payload: petResults
    		});

    		$$invalidate(7, animalName = "");
    		$$invalidate(5, petName = "");
    		$$invalidate(6, tags = undefined);
    		$$invalidate(12, petResults = newResults);

    		// console.log('save results:', petResults)
    		await loadCytosis();
    	};

    	const removePet = async (id, i) => {
    		let deleteResult = await Cytosis.delete({
    			apiKey: "keyIXVoSGhtPXrTnI",
    			baseId: "app9xsC0ykwoAYHoC",
    			tableName: "Pets",
    			recordId: id
    		});

    		// update local results
    		petResults.splice(i, 1);

    		$$invalidate(12, petResults);
    		$$invalidate(7, animalName = "");
    		$$invalidate(5, petName = "");
    		$$invalidate(6, tags = undefined);
    		console.log("Delete resluts:", deleteResult);
    		await loadCytosis();
    	};

    	const getPetNames = pet => {
    		const animals = Cytosis.getByIds(pet.fields["Animal"], cytosisObject.results["Animals"]);
    		let pets = [];

    		animals.map(pet => {
    			pets.push(pet.fields["Name"]);
    		});

    		return pets.join(", ");
    	};

    	const writable_props = ["title", "description"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$a.warn(`<DemoThirteen> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DemoThirteen", $$slots, []);

    	function input0_input_handler() {
    		petName = this.value;
    		$$invalidate(5, petName);
    	}

    	function input1_input_handler() {
    		animalName = this.value;
    		$$invalidate(7, animalName);
    	}

    	function input2_input_handler() {
    		tags = this.value;
    		$$invalidate(6, tags);
    	}

    	function input0_input_handler_1(each_value_1, i) {
    		each_value_1[i].fields["Name"] = this.value;
    		$$invalidate(12, petResults);
    	}

    	function input1_input_handler_1(each_value_1, i) {
    		each_value_1[i].fields["Animal"] = this.value;
    		$$invalidate(12, petResults);
    	}

    	function input2_input_handler_1(each_value_1, i) {
    		each_value_1[i].fields["Tags"] = this.value;
    		$$invalidate(12, petResults);
    	}

    	const click_handler = i => {
    		removePet(petResults[i].id, i);
    	};

    	const click_handler_1 = () => {
    		updateReplacePetData();
    	};

    	const click_handler_2 = () => {
    		updateReplacePetData("replace");
    	};

    	function cytosiswip_loadCytosis_binding(value) {
    		loadCytosis = value;
    		$$invalidate(9, loadCytosis);
    	}

    	function cytosiswip_isLoading_binding(value) {
    		cytosisLoading = value;
    		$$invalidate(10, cytosisLoading);
    	}

    	function cytosiswip_cytosis_binding(value) {
    		cytosisObject = value;
    		$$invalidate(8, cytosisObject);
    	}

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    	};

    	$$self.$capture_state = () => ({
    		Cytosis,
    		CytosisWip,
    		marked: marked_1,
    		title,
    		description,
    		more,
    		createMultiple,
    		updateReplaceTables,
    		status,
    		petName,
    		tags,
    		animalName,
    		animalNote,
    		cytosisObject,
    		loadedConfig,
    		loadCytosis,
    		cytosisLoading,
    		petArray,
    		petResults,
    		addPetToArray,
    		savePets,
    		updateReplacePetData,
    		removePet,
    		getPetNames
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("status" in $$props) status = $$props.status;
    		if ("petName" in $$props) $$invalidate(5, petName = $$props.petName);
    		if ("tags" in $$props) $$invalidate(6, tags = $$props.tags);
    		if ("animalName" in $$props) $$invalidate(7, animalName = $$props.animalName);
    		if ("animalNote" in $$props) animalNote = $$props.animalNote;
    		if ("cytosisObject" in $$props) $$invalidate(8, cytosisObject = $$props.cytosisObject);
    		if ("loadedConfig" in $$props) loadedConfig = $$props.loadedConfig;
    		if ("loadCytosis" in $$props) $$invalidate(9, loadCytosis = $$props.loadCytosis);
    		if ("cytosisLoading" in $$props) $$invalidate(10, cytosisLoading = $$props.cytosisLoading);
    		if ("petArray" in $$props) $$invalidate(11, petArray = $$props.petArray);
    		if ("petResults" in $$props) $$invalidate(12, petResults = $$props.petResults);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		description,
    		more,
    		createMultiple,
    		updateReplaceTables,
    		petName,
    		tags,
    		animalName,
    		cytosisObject,
    		loadCytosis,
    		cytosisLoading,
    		petArray,
    		petResults,
    		addPetToArray,
    		savePets,
    		updateReplacePetData,
    		removePet,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input0_input_handler_1,
    		input1_input_handler_1,
    		input2_input_handler_1,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		cytosiswip_loadCytosis_binding,
    		cytosiswip_isLoading_binding,
    		cytosiswip_cytosis_binding
    	];
    }

    class DemoThirteen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$f,
    			create_fragment$f,
    			safe_not_equal,
    			{
    				title: 0,
    				description: 1,
    				more: 2,
    				createMultiple: 3,
    				updateReplaceTables: 4
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DemoThirteen",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get title() {
    		return this.$$.ctx[0];
    	}

    	set title(title) {
    		this.$set({ title });
    		flush();
    	}

    	get description() {
    		return this.$$.ctx[1];
    	}

    	set description(description) {
    		this.$set({ description });
    		flush();
    	}

    	get more() {
    		return this.$$.ctx[2];
    	}

    	set more(value) {
    		throw new Error("<DemoThirteen>: Cannot set read-only property 'more'");
    	}

    	get createMultiple() {
    		return this.$$.ctx[3];
    	}

    	set createMultiple(value) {
    		throw new Error("<DemoThirteen>: Cannot set read-only property 'createMultiple'");
    	}

    	get updateReplaceTables() {
    		return this.$$.ctx[4];
    	}

    	set updateReplaceTables(value) {
    		throw new Error("<DemoThirteen>: Cannot set read-only property 'updateReplaceTables'");
    	}
    }

    /* src/examples/DemoSandbox.svelte generated by Svelte v3.24.0 */

    const { console: console_1$b } = globals;
    const file$g = "src/examples/DemoSandbox.svelte";

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (17:3) {#if cytosisLoading}
    function create_if_block_3$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("... loading Cytosis object ...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$4.name,
    		type: "if",
    		source: "(17:3) {#if cytosisLoading}",
    		ctx
    	});

    	return block;
    }

    // (21:3) {#if data}
    function create_if_block$d(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*data*/ ctx[3].results.length + "";
    	let t1;
    	let t2;
    	let t3;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let if_block = /*data*/ ctx[3] && create_if_block_1$d(ctx);
    	let each_value = /*data*/ ctx[3].results;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[11].id;
    	validate_each_keys(ctx, each_value, get_each_context$9, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$9(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$9(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("total: ");
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(div, "class", "svelte-14y4gpy");
    			add_location(div, file$g, 22, 4, 424);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t3, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 8 && t1_value !== (t1_value = /*data*/ ctx[3].results.length + "")) set_data_dev(t1, t1_value);

    			if (/*data*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$d(ctx);
    					if_block.c();
    					if_block.m(t3.parentNode, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*data*/ 8) {
    				const each_value = /*data*/ ctx[3].results;
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$9, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$9, each_1_anchor, get_each_context$9);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$d.name,
    		type: "if",
    		source: "(21:3) {#if data}",
    		ctx
    	});

    	return block;
    }

    // (25:4) {#if data}
    function create_if_block_1$d(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (!/*data*/ ctx[3].isDone) return create_if_block_2$8;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if_block.c();
    			attr_dev(button, "class", "__outline __short __width_max _margin-top svelte-14y4gpy");
    			add_location(button, file$g, 25, 5, 485);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if_block.m(button, null);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(button, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$d.name,
    		type: "if",
    		source: "(25:4) {#if data}",
    		ctx
    	});

    	return block;
    }

    // (35:5) {:else}
    function create_else_block$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("That's all folks!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(35:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (33:5) {#if !data.isDone}
    function create_if_block_2$8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Get Next Page");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$8.name,
    		type: "if",
    		source: "(33:5) {#if !data.isDone}",
    		ctx
    	});

    	return block;
    }

    // (42:4) {#each data.results as item (item.id)}
    function create_each_block$9(key_1, ctx) {
    	let div;
    	let t0_value = /*item*/ ctx[11].fields["Name"] + "";
    	let t0;
    	let t1;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "svelte-14y4gpy");
    			add_location(div, file$g, 42, 5, 878);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 8 && t0_value !== (t0_value = /*item*/ ctx[11].fields["Name"] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$9.name,
    		type: "each",
    		source: "(42:4) {#each data.results as item (item.id)}",
    		ctx
    	});

    	return block;
    }

    // (7:2) <CytosisPaginate     apiKey={'keygfuzbhXK1VShlR'}      baseId={'appc0M3MdTYATe7RO'}      configName={'items-paged'}     routeDetails={'Testing paged items'}     bind:isLoading={cytosisLoading}     bind:cytosis={cytosisObject}     bind:data={data}   >
    function create_default_slot$d(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*cytosisLoading*/ ctx[4] && create_if_block_3$4(ctx);
    	let if_block1 = /*data*/ ctx[3] && create_if_block$d(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*cytosisLoading*/ ctx[4]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_3$4(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*data*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$d(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$d.name,
    		type: "slot",
    		source: "(7:2) <CytosisPaginate     apiKey={'keygfuzbhXK1VShlR'}      baseId={'appc0M3MdTYATe7RO'}      configName={'items-paged'}     routeDetails={'Testing paged items'}     bind:isLoading={cytosisLoading}     bind:cytosis={cytosisObject}     bind:data={data}   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let raw_value = marked_1(/*description*/ ctx[1]) + "";
    	let t2;
    	let cytosispaginate;
    	let updating_isLoading;
    	let updating_cytosis;
    	let updating_data;
    	let current;

    	function cytosispaginate_isLoading_binding(value) {
    		/*cytosispaginate_isLoading_binding*/ ctx[6].call(null, value);
    	}

    	function cytosispaginate_cytosis_binding(value) {
    		/*cytosispaginate_cytosis_binding*/ ctx[7].call(null, value);
    	}

    	function cytosispaginate_data_binding(value) {
    		/*cytosispaginate_data_binding*/ ctx[8].call(null, value);
    	}

    	let cytosispaginate_props = {
    		apiKey: "keygfuzbhXK1VShlR",
    		baseId: "appc0M3MdTYATe7RO",
    		configName: "items-paged",
    		routeDetails: "Testing paged items",
    		$$slots: { default: [create_default_slot$d] },
    		$$scope: { ctx }
    	};

    	if (/*cytosisLoading*/ ctx[4] !== void 0) {
    		cytosispaginate_props.isLoading = /*cytosisLoading*/ ctx[4];
    	}

    	if (/*cytosisObject*/ ctx[2] !== void 0) {
    		cytosispaginate_props.cytosis = /*cytosisObject*/ ctx[2];
    	}

    	if (/*data*/ ctx[3] !== void 0) {
    		cytosispaginate_props.data = /*data*/ ctx[3];
    	}

    	cytosispaginate = new CytosisPaginate({
    			props: cytosispaginate_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(cytosispaginate, "isLoading", cytosispaginate_isLoading_binding));
    	binding_callbacks.push(() => bind(cytosispaginate, "cytosis", cytosispaginate_cytosis_binding));
    	binding_callbacks.push(() => bind(cytosispaginate, "data", cytosispaginate_data_binding));

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			create_component(cytosispaginate.$$.fragment);
    			attr_dev(h2, "class", "svelte-14y4gpy");
    			add_location(h2, file$g, 3, 2, 20);
    			attr_dev(div0, "class", "svelte-14y4gpy");
    			add_location(div0, file$g, 4, 2, 41);
    			attr_dev(div1, "class", " svelte-14y4gpy");
    			add_location(div1, file$g, 2, 1, 3);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			div0.innerHTML = raw_value;
    			append_dev(div1, t2);
    			mount_component(cytosispaginate, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if ((!current || dirty & /*description*/ 2) && raw_value !== (raw_value = marked_1(/*description*/ ctx[1]) + "")) div0.innerHTML = raw_value;			const cytosispaginate_changes = {};

    			if (dirty & /*$$scope, data, cytosisLoading*/ 16408) {
    				cytosispaginate_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_isLoading && dirty & /*cytosisLoading*/ 16) {
    				updating_isLoading = true;
    				cytosispaginate_changes.isLoading = /*cytosisLoading*/ ctx[4];
    				add_flush_callback(() => updating_isLoading = false);
    			}

    			if (!updating_cytosis && dirty & /*cytosisObject*/ 4) {
    				updating_cytosis = true;
    				cytosispaginate_changes.cytosis = /*cytosisObject*/ ctx[2];
    				add_flush_callback(() => updating_cytosis = false);
    			}

    			if (!updating_data && dirty & /*data*/ 8) {
    				updating_data = true;
    				cytosispaginate_changes.data = /*data*/ ctx[3];
    				add_flush_callback(() => updating_data = false);
    			}

    			cytosispaginate.$set(cytosispaginate_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cytosispaginate.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cytosispaginate.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(cytosispaginate);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	marked_1.setOptions({ gfm: true, breaks: true });
    	let { title = `X. Sandbox` } = $$props;
    	let { description = `This is a sandbox. Have fun!` } = $$props;
    	let cytosisObject;
    	let data, items, isDone;
    	let cytosisLoading = true;
    	const writable_props = ["title", "description"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$b.warn(`<DemoSandbox> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DemoSandbox", $$slots, []);

    	const click_handler = () => {
    		data.getNextPage().then(({ results, isDone }) => {
    			$$invalidate(3, data.results = results, data);
    			if (isDone) $$invalidate(3, data.isDone = isDone, data);
    		});
    	};

    	function cytosispaginate_isLoading_binding(value) {
    		cytosisLoading = value;
    		$$invalidate(4, cytosisLoading);
    	}

    	function cytosispaginate_cytosis_binding(value) {
    		cytosisObject = value;
    		$$invalidate(2, cytosisObject);
    	}

    	function cytosispaginate_data_binding(value) {
    		data = value;
    		$$invalidate(3, data);
    	}

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    	};

    	$$self.$capture_state = () => ({
    		CytosisPaginate,
    		marked: marked_1,
    		title,
    		description,
    		cytosisObject,
    		data,
    		items,
    		isDone,
    		cytosisLoading
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("cytosisObject" in $$props) $$invalidate(2, cytosisObject = $$props.cytosisObject);
    		if ("data" in $$props) $$invalidate(3, data = $$props.data);
    		if ("items" in $$props) items = $$props.items;
    		if ("isDone" in $$props) isDone = $$props.isDone;
    		if ("cytosisLoading" in $$props) $$invalidate(4, cytosisLoading = $$props.cytosisLoading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data*/ 8) {
    			 if (data) {
    				// items = data.results
    				// isDone = data.isDone
    				// getNextPage = data.getNextPage
    				console.log("Sandbox Results:", data);
    			} // cytosisObject.getNextPage()
    			// items = cytosisObject['results']['Items Table']
    		}
    	};

    	return [
    		title,
    		description,
    		cytosisObject,
    		data,
    		cytosisLoading,
    		click_handler,
    		cytosispaginate_isLoading_binding,
    		cytosispaginate_cytosis_binding,
    		cytosispaginate_data_binding
    	];
    }

    class DemoSandbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { title: 0, description: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DemoSandbox",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get title() {
    		throw new Error("<DemoSandbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<DemoSandbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<DemoSandbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<DemoSandbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/DemoMenu.svelte generated by Svelte v3.24.0 */

    const { Object: Object_1$2 } = globals;

    const file$h = "src/components/DemoMenu.svelte";

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (7:4) {#each Object.keys(basicDemos) as demo}
    function create_each_block_1$6(ctx) {
    	let li;
    	let a;
    	let t0_value = /*basicDemos*/ ctx[0][/*demo*/ ctx[5]].title + "";
    	let t0;
    	let a_class_value;
    	let a_href_value;
    	let t1;
    	let t2_value = /*basicDemos*/ ctx[0][/*demo*/ ctx[5]].description + "";
    	let t2;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = text(" — ");
    			t2 = text(t2_value);
    			attr_dev(a, "class", a_class_value = "" + (null_to_empty(/*isActive*/ ctx[2](/*demo*/ ctx[5])) + " svelte-cjv210"));
    			attr_dev(a, "href", a_href_value = "/demos/" + /*demo*/ ctx[5]);
    			add_location(a, file$h, 7, 10, 227);
    			attr_dev(li, "class", "svelte-cjv210");
    			add_location(li, file$h, 7, 6, 223);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*basicDemos*/ 1 && t0_value !== (t0_value = /*basicDemos*/ ctx[0][/*demo*/ ctx[5]].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*isActive, basicDemos*/ 5 && a_class_value !== (a_class_value = "" + (null_to_empty(/*isActive*/ ctx[2](/*demo*/ ctx[5])) + " svelte-cjv210"))) {
    				attr_dev(a, "class", a_class_value);
    			}

    			if (dirty & /*basicDemos*/ 1 && a_href_value !== (a_href_value = "/demos/" + /*demo*/ ctx[5])) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*basicDemos*/ 1 && t2_value !== (t2_value = /*basicDemos*/ ctx[0][/*demo*/ ctx[5]].description + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$6.name,
    		type: "each",
    		source: "(7:4) {#each Object.keys(basicDemos) as demo}",
    		ctx
    	});

    	return block;
    }

    // (15:4) {#each Object.keys(writeDemos) as demo}
    function create_each_block$a(ctx) {
    	let li;
    	let a;
    	let t0_value = /*writeDemos*/ ctx[1][/*demo*/ ctx[5]].title + "";
    	let t0;
    	let a_class_value;
    	let a_href_value;
    	let t1;
    	let t2_value = /*writeDemos*/ ctx[1][/*demo*/ ctx[5]].description + "";
    	let t2;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = text(" — ");
    			t2 = text(t2_value);
    			attr_dev(a, "class", a_class_value = "" + (null_to_empty(/*isActive*/ ctx[2](/*demo*/ ctx[5])) + " svelte-cjv210"));
    			attr_dev(a, "href", a_href_value = "/demos/" + /*demo*/ ctx[5]);
    			add_location(a, file$h, 15, 10, 518);
    			attr_dev(li, "class", "svelte-cjv210");
    			add_location(li, file$h, 15, 6, 514);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*writeDemos*/ 2 && t0_value !== (t0_value = /*writeDemos*/ ctx[1][/*demo*/ ctx[5]].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*isActive, writeDemos*/ 6 && a_class_value !== (a_class_value = "" + (null_to_empty(/*isActive*/ ctx[2](/*demo*/ ctx[5])) + " svelte-cjv210"))) {
    				attr_dev(a, "class", a_class_value);
    			}

    			if (dirty & /*writeDemos*/ 2 && a_href_value !== (a_href_value = "/demos/" + /*demo*/ ctx[5])) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*writeDemos*/ 2 && t2_value !== (t2_value = /*writeDemos*/ ctx[1][/*demo*/ ctx[5]].description + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$a.name,
    		type: "each",
    		source: "(15:4) {#each Object.keys(writeDemos) as demo}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let main;
    	let h50;
    	let t1;
    	let ul0;
    	let t2;
    	let h51;
    	let t4;
    	let ul1;
    	let each_value_1 = Object.keys(/*basicDemos*/ ctx[0]);
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$6(get_each_context_1$6(ctx, each_value_1, i));
    	}

    	let each_value = Object.keys(/*writeDemos*/ ctx[1]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$a(get_each_context$a(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			h50 = element("h5");
    			h50.textContent = "Basic Cytosis Examples";
    			t1 = space();
    			ul0 = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			h51 = element("h5");
    			h51.textContent = "Write-capable Examples";
    			t4 = space();
    			ul1 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h50, "class", "_font-bold svelte-cjv210");
    			add_location(h50, file$h, 4, 2, 80);
    			attr_dev(ul0, "class", "demo-list _margin-bottom-2 svelte-cjv210");
    			add_location(ul0, file$h, 5, 2, 133);
    			attr_dev(h51, "class", "_font-bold svelte-cjv210");
    			add_location(h51, file$h, 12, 2, 371);
    			attr_dev(ul1, "class", "demo-list _margin-bottom-2 svelte-cjv210");
    			add_location(ul1, file$h, 13, 2, 424);
    			attr_dev(main, "class", "Demos _card __outline _padding-2 svelte-cjv210");
    			add_location(main, file$h, 2, 0, 29);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h50);
    			append_dev(main, t1);
    			append_dev(main, ul0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul0, null);
    			}

    			append_dev(main, t2);
    			append_dev(main, h51);
    			append_dev(main, t4);
    			append_dev(main, ul1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul1, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*basicDemos, Object, isActive*/ 5) {
    				each_value_1 = Object.keys(/*basicDemos*/ ctx[0]);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$6(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$6(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*writeDemos, Object, isActive*/ 6) {
    				each_value = Object.keys(/*writeDemos*/ ctx[1]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$a(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$a(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { demoName } = $$props;

    	let { basicDemos = {
    		"demoOne": {
    			name: "Demo One",
    			component: DemoOne,
    			title: "1. Basics",
    			description: "This demo retrieves a table from the given Base, by reading a record in '_cytosis'"
    		},
    		"demoTwo": {
    			name: "Demo Two",
    			component: DemoTwo,
    			title: "2. Get a table of items",
    			description: "This demo retrieves a ton of items from the Items Table in a non-paginated manner"
    		},
    		"demoThree": {
    			name: "Demo Three",
    			component: DemoThree,
    			title: "3. Get a table of items in a paginated way",
    			description: "This demo shows how to use 'getPageTable'"
    		},
    		"demoFour": {
    			name: "Demo Four",
    			component: DemoFour,
    			title: "4. Config & data reload/refresh",
    			description: "This is how to use custom configs and tables without needing a '_cytosis' table"
    		},
    		"demoFive": {
    			name: "Demo Five",
    			component: DemoFive,
    			title: "5. Bypassing config and directly setting your bases ",
    			description: "This demo shows how to completely bypass config, to speed up loading"
    		},
    		"demoSix": {
    			name: "Demo Six",
    			component: DemoSix,
    			title: "6. Caching strategies",
    			description: "This demo shows how localStorage, browser-based cache helpers work."
    		},
    		"demoSeven": {
    			name: "Demo Seven",
    			component: DemoSeven,
    			title: "7. Views, filtering, sorting, and fields",
    			description: "This demo shows how to take advantage of the Airtable API and Cytosis' views, filtering, sorting, and fields mechanisms."
    		},
    		"demoEight": {
    			name: "Demo Eight",
    			component: DemoEight,
    			title: "8. Search",
    			description: "This demo shows how to use cytosis to search and retrieve from Airtable."
    		},
    		"demoNine": {
    			name: "Demo Nine",
    			component: DemoNine,
    			title: "9. Linked Queries",
    			description: "This demo shows how combine queries into a single query in config. This is really useful for splitting and creating complex, fine-grained queries."
    		},
    		"demoTen": {
    			name: "Demo Ten",
    			component: DemoTen,
    			title: "10. Multiple Airtables",
    			description: "This demo shows to combine multiple bases into one Cytosis."
    		},
    		"demoEleven": {
    			name: "Demo Eleven",
    			component: DemoEleven,
    			title: "11. Getting and finding what you need",
    			description: "This demo shows how to use Get, Find, and other retrieval functions."
    		}
    	} } = $$props; // 'sandbox': {name: "Sandbox", component: DemoSandbox, title: "Sandbox", description: "This is a sandbox. Have fun!"},

    	let { writeDemos = {
    		"demoTwelve": {
    			name: "Demo Twelve",
    			component: DemoTwelve,
    			title: "12. Saving to Cytosis",
    			description: "This demo shows how to save a form directly to Cytosis."
    		},
    		"demoThirteen": {
    			name: "Demo Thirteen",
    			component: DemoThirteen,
    			title: "13. Saving multiple objects",
    			description: "This demo shows how to save arrays of objects to Cytosis."
    		}
    	} } = $$props; // 'demoFourteen': {name: "Demo Fourteen", component: DemoFourteen, title: "14. Deleting data", description: "This demo shows how to delete data from Cytosis."},

    	const demos = { ...basicDemos, ...writeDemos };
    	const writable_props = ["demoName", "basicDemos", "writeDemos"];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DemoMenu> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DemoMenu", $$slots, []);

    	$$self.$set = $$props => {
    		if ("demoName" in $$props) $$invalidate(3, demoName = $$props.demoName);
    		if ("basicDemos" in $$props) $$invalidate(0, basicDemos = $$props.basicDemos);
    		if ("writeDemos" in $$props) $$invalidate(1, writeDemos = $$props.writeDemos);
    	};

    	$$self.$capture_state = () => ({
    		cytosis,
    		makers,
    		dropoff,
    		content,
    		DemoOne,
    		DemoTwo,
    		DemoThree,
    		DemoFour,
    		DemoFive,
    		DemoSix,
    		DemoSeven,
    		DemoEight,
    		DemoNine,
    		DemoTen,
    		DemoEleven,
    		DemoTwelve,
    		DemoThirteen,
    		DemoSandbox,
    		demoName,
    		basicDemos,
    		writeDemos,
    		demos,
    		isActive
    	});

    	$$self.$inject_state = $$props => {
    		if ("demoName" in $$props) $$invalidate(3, demoName = $$props.demoName);
    		if ("basicDemos" in $$props) $$invalidate(0, basicDemos = $$props.basicDemos);
    		if ("writeDemos" in $$props) $$invalidate(1, writeDemos = $$props.writeDemos);
    		if ("isActive" in $$props) $$invalidate(2, isActive = $$props.isActive);
    	};

    	let isActive;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*demoName*/ 8) {
    			 $$invalidate(2, isActive = str => demoName === str ? "selected" : "");
    		}
    	};

    	return [basicDemos, writeDemos, isActive, demoName, demos];
    }

    class DemoMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			demoName: 3,
    			basicDemos: 0,
    			writeDemos: 1,
    			demos: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DemoMenu",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*demoName*/ ctx[3] === undefined && !("demoName" in props)) {
    			console.warn("<DemoMenu> was created without expected prop 'demoName'");
    		}
    	}

    	get demoName() {
    		return this.$$.ctx[3];
    	}

    	set demoName(demoName) {
    		this.$set({ demoName });
    		flush();
    	}

    	get basicDemos() {
    		return this.$$.ctx[0];
    	}

    	set basicDemos(basicDemos) {
    		this.$set({ basicDemos });
    		flush();
    	}

    	get writeDemos() {
    		return this.$$.ctx[1];
    	}

    	set writeDemos(writeDemos) {
    		this.$set({ writeDemos });
    		flush();
    	}

    	get demos() {
    		return this.$$.ctx[4];
    	}

    	set demos(value) {
    		throw new Error("<DemoMenu>: Cannot set read-only property 'demos'");
    	}
    }

    /* src/sections/BasicSection.svelte generated by Svelte v3.24.0 */
    const file$i = "src/sections/BasicSection.svelte";

    function create_fragment$i(ctx) {
    	let div1;
    	let h2;
    	let t1;
    	let div0;

    	let raw_value = marked_1(`
### Cytosis setup

- Create a new table, or duplicate the [Cytosis documentation table](https://airtable.com/shr2ITCNwUa0UCmPH)
- Create another user to Airtable and invite that user to your table with read-only access. You can use an alternate or temporary e-mail address. Open that temporary user's account settings, and create an API key for that user. That API key will protect your Airtable from being vandalized
	- For experimentation purposes, you can use my public user account: public@janzheng.com, apiKey: keygfuzbhXK1VShlR
- Get the Base ID by clicking Help > API Documentation in the Airtable base, then copying the part that starts with "app" \`https://airtable.com/appc0M3MdTYATe7RO/api/docs#curl/introduction\` - (e.g. \`appc0M3MdTYATe7RO\` in this example)
	`) + "";

    	let t2;
    	let demoone;
    	let current;
    	demoone = new DemoOne({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Basic Usage";
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			create_component(demoone.$$.fragment);
    			attr_dev(h2, "class", "Basic-title title svelte-1juzwdx");
    			add_location(h2, file$i, 3, 1, 39);
    			attr_dev(div0, "class", "Basic-desc desc _margin-bottom-2 svelte-1juzwdx");
    			add_location(div0, file$i, 5, 1, 88);
    			attr_dev(div1, "class", "Basic-section section svelte-1juzwdx");
    			add_location(div1, file$i, 1, 0, 1);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			div0.innerHTML = raw_value;
    			append_dev(div1, t2);
    			mount_component(demoone, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(demoone.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(demoone.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(demoone);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	marked_1.setOptions({ gfm: true, breaks: true });
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BasicSection> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("BasicSection", $$slots, []);
    	$$self.$capture_state = () => ({ DemoOne, DemoTwo, marked: marked_1 });
    	return [];
    }

    class BasicSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BasicSection",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src/sections/FooterSection.svelte generated by Svelte v3.24.0 */

    const file$j = "src/sections/FooterSection.svelte";

    function create_fragment$j(ctx) {
    	let div1;
    	let div0;
    	let t1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Notice";
    			t1 = text("\n\tCytosis is still under development. Translation: it's still janky as hell, so use with caution. There's a small chance it'll delete all your Airtable data, so you've been warned. Lol.");
    			attr_dev(div0, "class", "_font-bold _margin-bottom svelte-11aomvy");
    			add_location(div0, file$j, 1, 1, 59);
    			attr_dev(div1, "class", "Footer-Section _divider-top _divider-bottom svelte-11aomvy");
    			add_location(div1, file$j, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FooterSection> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("FooterSection", $$slots, []);
    	return [];
    }

    class FooterSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FooterSection",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src/routes/Home.svelte generated by Svelte v3.24.0 */
    const file$k = "src/routes/Home.svelte";

    function create_fragment$k(ctx) {
    	let main;
    	let demomenu;
    	let t;
    	let footersection;
    	let current;
    	demomenu = new DemoMenu({ $$inline: true });
    	footersection = new FooterSection({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(demomenu.$$.fragment);
    			t = space();
    			create_component(footersection.$$.fragment);
    			attr_dev(main, "class", "Home svelte-cv2787");
    			add_location(main, file$k, 3, 0, 3);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(demomenu, main, null);
    			append_dev(main, t);
    			mount_component(footersection, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(demomenu.$$.fragment, local);
    			transition_in(footersection.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(demomenu.$$.fragment, local);
    			transition_out(footersection.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(demomenu);
    			destroy_component(footersection);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);

    	$$self.$capture_state = () => ({
    		cytosis,
    		makers,
    		dropoff,
    		content,
    		DemoMenu,
    		BasicSection,
    		FooterSection
    	});

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src/routes/About.svelte generated by Svelte v3.24.0 */

    const file$l = "src/routes/About.svelte";

    function create_fragment$l(ctx) {
    	let h2;
    	let t1;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "About Page";
    			t1 = text("\n\nThis is the about page!");
    			add_location(h2, file$l, 1, 0, 1);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("About", $$slots, []);
    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src/routes/Demos.svelte generated by Svelte v3.24.0 */
    const file$m = "src/routes/Demos.svelte";

    // (7:2) {#if demos && demos[demoName]}
    function create_if_block$e(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*demos*/ ctx[1][/*demoName*/ ctx[0]].component;

    	function switch_props(ctx) {
    		return {
    			props: {
    				title: /*demos*/ ctx[1][/*demoName*/ ctx[0]].title,
    				description: /*demos*/ ctx[1][/*demoName*/ ctx[0]].description
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*demos, demoName*/ 3) switch_instance_changes.title = /*demos*/ ctx[1][/*demoName*/ ctx[0]].title;
    			if (dirty & /*demos, demoName*/ 3) switch_instance_changes.description = /*demos*/ ctx[1][/*demoName*/ ctx[0]].description;

    			if (switch_value !== (switch_value = /*demos*/ ctx[1][/*demoName*/ ctx[0]].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$e.name,
    		type: "if",
    		source: "(7:2) {#if demos && demos[demoName]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let main;
    	let demomenu;
    	let updating_demos;
    	let t0;
    	let t1;
    	let footersection;
    	let current;

    	function demomenu_demos_binding(value) {
    		/*demomenu_demos_binding*/ ctx[3].call(null, value);
    	}

    	let demomenu_props = { demoName: true };

    	if (/*demos*/ ctx[1] !== void 0) {
    		demomenu_props.demos = /*demos*/ ctx[1];
    	}

    	demomenu = new DemoMenu({ props: demomenu_props, $$inline: true });
    	binding_callbacks.push(() => bind(demomenu, "demos", demomenu_demos_binding));
    	let if_block = /*demos*/ ctx[1] && /*demos*/ ctx[1][/*demoName*/ ctx[0]] && create_if_block$e(ctx);
    	footersection = new FooterSection({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(demomenu.$$.fragment);
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			create_component(footersection.$$.fragment);
    			attr_dev(main, "class", "Demos svelte-5mbfec");
    			add_location(main, file$m, 2, 0, 29);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(demomenu, main, null);
    			append_dev(main, t0);
    			if (if_block) if_block.m(main, null);
    			append_dev(main, t1);
    			mount_component(footersection, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const demomenu_changes = {};

    			if (!updating_demos && dirty & /*demos*/ 2) {
    				updating_demos = true;
    				demomenu_changes.demos = /*demos*/ ctx[1];
    				add_flush_callback(() => updating_demos = false);
    			}

    			demomenu.$set(demomenu_changes);

    			if (/*demos*/ ctx[1] && /*demos*/ ctx[1][/*demoName*/ ctx[0]]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*demos, demoName*/ 3) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$e(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(demomenu.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(footersection.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(demomenu.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(footersection.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(demomenu);
    			if (if_block) if_block.d();
    			destroy_component(footersection);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { demoName } = $$props, { demos } = $$props, { params } = $$props;
    	const writable_props = ["demoName", "demos", "params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Demos> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Demos", $$slots, []);

    	function demomenu_demos_binding(value) {
    		demos = value;
    		$$invalidate(1, demos);
    	}

    	$$self.$set = $$props => {
    		if ("demoName" in $$props) $$invalidate(0, demoName = $$props.demoName);
    		if ("demos" in $$props) $$invalidate(1, demos = $$props.demos);
    		if ("params" in $$props) $$invalidate(2, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		cytosis,
    		makers,
    		dropoff,
    		content,
    		DemoMenu,
    		FooterSection,
    		demoName,
    		demos,
    		params
    	});

    	$$self.$inject_state = $$props => {
    		if ("demoName" in $$props) $$invalidate(0, demoName = $$props.demoName);
    		if ("demos" in $$props) $$invalidate(1, demos = $$props.demos);
    		if ("params" in $$props) $$invalidate(2, params = $$props.params);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*params*/ 4) {
    			 $$invalidate(0, demoName = params["demoName"]); // from router
    		}
    	};

    	return [demoName, demos, params, demomenu_demos_binding];
    }

    class Demos extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { demoName: 0, demos: 1, params: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Demos",
    			options,
    			id: create_fragment$m.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*demoName*/ ctx[0] === undefined && !("demoName" in props)) {
    			console.warn("<Demos> was created without expected prop 'demoName'");
    		}

    		if (/*demos*/ ctx[1] === undefined && !("demos" in props)) {
    			console.warn("<Demos> was created without expected prop 'demos'");
    		}

    		if (/*params*/ ctx[2] === undefined && !("params" in props)) {
    			console.warn("<Demos> was created without expected prop 'params'");
    		}
    	}

    	get demoName() {
    		return this.$$.ctx[0];
    	}

    	set demoName(demoName) {
    		this.$set({ demoName });
    		flush();
    	}

    	get demos() {
    		return this.$$.ctx[1];
    	}

    	set demos(demos) {
    		this.$set({ demos });
    		flush();
    	}

    	get params() {
    		return this.$$.ctx[2];
    	}

    	set params(params) {
    		this.$set({ params });
    		flush();
    	}
    }

    /* src/routes/404.svelte generated by Svelte v3.24.0 */

    const file$n = "src/routes/404.svelte";

    function create_fragment$n(ctx) {
    	let t0;
    	let h1;
    	let t2;
    	let p;

    	const block = {
    		c: function create() {
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "404";
    			t2 = space();
    			p = element("p");
    			p.textContent = "Route not found.";
    			document.title = "404";
    			add_location(h1, file$n, 4, 0, 50);
    			add_location(p, file$n, 6, 0, 64);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_404> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_404", $$slots, []);
    	return [];
    }

    class _404 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_404",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    /* src/components/App.svelte generated by Svelte v3.24.0 */

    const { console: console_1$c } = globals;

    const file$o = "src/components/App.svelte";

    function create_fragment$o(ctx) {
    	let main;
    	let nav;
    	let t;
    	let switch_instance;
    	let current;

    	nav = new Nav({
    			props: { active: /*active*/ ctx[2] },
    			$$inline: true
    		});

    	var switch_value = /*Route*/ ctx[0];

    	function switch_props(ctx) {
    		return {
    			props: { params: /*params*/ ctx[1] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(nav.$$.fragment);
    			t = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(main, "class", "Appy _section-page _margin-center svelte-1una9ov");
    			add_location(main, file$o, 1, 0, 1);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(nav, main, null);
    			append_dev(main, t);

    			if (switch_instance) {
    				mount_component(switch_instance, main, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const nav_changes = {};
    			if (dirty & /*active*/ 4) nav_changes.active = /*active*/ ctx[2];
    			nav.$set(nav_changes);
    			const switch_instance_changes = {};
    			if (dirty & /*params*/ 2) switch_instance_changes.params = /*params*/ ctx[1];

    			if (switch_value !== (switch_value = /*Route*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, main, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(nav);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let Route, params = {}, active;
    	let uri = location.pathname;

    	// router, copied from svelte-demo
    	// function run(thunk, obj) {
    	//   const target = uri;
    	//   thunk.then(m => {
    	//     if (target !== uri) return;
    	//     params = obj || {};
    	//     if (m.preload) {
    	//       m.preload({ params }).then(() => {
    	//         if (target !== uri) return;
    	//         Route = m.default;
    	//         window.scrollTo(0, 0);
    	//       });
    	//     } else {
    	//       Route = m.default;
    	//       window.scrollTo(0, 0);
    	//     }
    	//   });
    	// }
    	const router = Navaid("/", () => {
    		console.log("404!");
    		$$invalidate(0, Route = _404);
    		window.scrollTo(0, 0);
    	}).on("/", () => {
    		console.log("/home");
    		$$invalidate(0, Route = Home);
    		window.scrollTo(0, 0);
    	}).on("/about", () => {
    		$$invalidate(0, Route = About);
    		window.scrollTo(0, 0);
    	}).// .on('/sandbox', () => {
    	//   Route = Sandbox;
    	//   window.scrollTo(0, 0);
    	// })
    	on("/demos/:demoName", _params => {
    		console.log("/demos");
    		$$invalidate(0, Route = Demos);
    		$$invalidate(1, params = _params);
    		window.scrollTo(0, 0);
    	}).// .on('/blog/:postid', obj => run(import('../routes/Article.svelte'), obj))
    	listen();

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$c.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		Navaid,
    		onDestroy,
    		Nav,
    		Home,
    		About,
    		Demos,
    		FourOhFour: _404,
    		Route,
    		params,
    		active,
    		uri,
    		router
    	});

    	$$self.$inject_state = $$props => {
    		if ("Route" in $$props) $$invalidate(0, Route = $$props.Route);
    		if ("params" in $$props) $$invalidate(1, params = $$props.params);
    		if ("active" in $$props) $$invalidate(2, active = $$props.active);
    		if ("uri" in $$props) $$invalidate(3, uri = $$props.uri);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 $$invalidate(2, active = uri.split("/")[1] || "home");
    	return [Route, params, active];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    var app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
