
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
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
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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
            set_current_component(null);
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
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.7' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
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
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* node_modules/svelte-material-icons/PhoneInTalk.svelte generated by Svelte v3.29.7 */

    const file = "node_modules/svelte-material-icons/PhoneInTalk.svelte";

    function create_fragment(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M15,12H17A5,5 0 0,0 12,7V9A3,3 0 0,1 15,12M19,12H21C21,7 16.97,3 12,3V5C15.86,5 19,8.13 19,12M20,15.5C18.75,15.5 17.55,15.3 16.43,14.93C16.08,14.82 15.69,14.9 15.41,15.18L13.21,17.38C10.38,15.94 8.06,13.62 6.62,10.79L8.82,8.59C9.1,8.31 9.18,7.92 9.07,7.57C8.7,6.45 8.5,5.25 8.5,4A1,1 0 0,0 7.5,3H4A1,1 0 0,0 3,4A17,17 0 0,0 20,21A1,1 0 0,0 21,20V16.5A1,1 0 0,0 20,15.5Z");
    			attr_dev(path, "fill", /*color*/ ctx[2]);
    			add_location(path, file, 8, 59, 234);
    			attr_dev(svg, "width", /*width*/ ctx[0]);
    			attr_dev(svg, "height", /*height*/ ctx[1]);
    			attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
    			add_location(svg, file, 8, 0, 175);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*color*/ 4) {
    				attr_dev(path, "fill", /*color*/ ctx[2]);
    			}

    			if (dirty & /*width*/ 1) {
    				attr_dev(svg, "width", /*width*/ ctx[0]);
    			}

    			if (dirty & /*height*/ 2) {
    				attr_dev(svg, "height", /*height*/ ctx[1]);
    			}

    			if (dirty & /*viewBox*/ 8) {
    				attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PhoneInTalk", slots, []);
    	let { size = "1em" } = $$props;
    	let { width = size } = $$props;
    	let { height = size } = $$props;
    	let { color = "currentColor" } = $$props;
    	let { viewBox = "0 0 24 24" } = $$props;
    	const writable_props = ["size", "width", "height", "color", "viewBox"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PhoneInTalk> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("size" in $$props) $$invalidate(4, size = $$props.size);
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
    	};

    	$$self.$capture_state = () => ({ size, width, height, color, viewBox });

    	$$self.$inject_state = $$props => {
    		if ("size" in $$props) $$invalidate(4, size = $$props.size);
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width, height, color, viewBox, size];
    }

    class PhoneInTalk extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			size: 4,
    			width: 0,
    			height: 1,
    			color: 2,
    			viewBox: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PhoneInTalk",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get size() {
    		throw new Error("<PhoneInTalk>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<PhoneInTalk>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<PhoneInTalk>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<PhoneInTalk>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<PhoneInTalk>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<PhoneInTalk>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<PhoneInTalk>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<PhoneInTalk>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewBox() {
    		throw new Error("<PhoneInTalk>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewBox(value) {
    		throw new Error("<PhoneInTalk>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-material-icons/Email.svelte generated by Svelte v3.29.7 */

    const file$1 = "node_modules/svelte-material-icons/Email.svelte";

    function create_fragment$1(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z");
    			attr_dev(path, "fill", /*color*/ ctx[2]);
    			add_location(path, file$1, 8, 59, 234);
    			attr_dev(svg, "width", /*width*/ ctx[0]);
    			attr_dev(svg, "height", /*height*/ ctx[1]);
    			attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
    			add_location(svg, file$1, 8, 0, 175);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*color*/ 4) {
    				attr_dev(path, "fill", /*color*/ ctx[2]);
    			}

    			if (dirty & /*width*/ 1) {
    				attr_dev(svg, "width", /*width*/ ctx[0]);
    			}

    			if (dirty & /*height*/ 2) {
    				attr_dev(svg, "height", /*height*/ ctx[1]);
    			}

    			if (dirty & /*viewBox*/ 8) {
    				attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Email", slots, []);
    	let { size = "1em" } = $$props;
    	let { width = size } = $$props;
    	let { height = size } = $$props;
    	let { color = "currentColor" } = $$props;
    	let { viewBox = "0 0 24 24" } = $$props;
    	const writable_props = ["size", "width", "height", "color", "viewBox"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Email> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("size" in $$props) $$invalidate(4, size = $$props.size);
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
    	};

    	$$self.$capture_state = () => ({ size, width, height, color, viewBox });

    	$$self.$inject_state = $$props => {
    		if ("size" in $$props) $$invalidate(4, size = $$props.size);
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width, height, color, viewBox, size];
    }

    class Email extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			size: 4,
    			width: 0,
    			height: 1,
    			color: 2,
    			viewBox: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Email",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get size() {
    		throw new Error("<Email>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Email>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Email>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Email>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Email>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Email>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Email>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Email>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewBox() {
    		throw new Error("<Email>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewBox(value) {
    		throw new Error("<Email>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.29.7 */
    const file$2 = "src/components/Footer.svelte";

    function create_fragment$2(ctx) {
    	let footer;
    	let a0;
    	let phoneintalk;
    	let t;
    	let a1;
    	let email;
    	let current;

    	phoneintalk = new PhoneInTalk({
    			props: {
    				color: /*color*/ ctx[1],
    				size: /*size*/ ctx[0],
    				width: /*width*/ ctx[2],
    				height: /*height*/ ctx[3],
    				viewBox: /*viewBox*/ ctx[4]
    			},
    			$$inline: true
    		});

    	email = new Email({
    			props: {
    				color: /*color*/ ctx[1],
    				size: /*size*/ ctx[0],
    				width: /*width*/ ctx[2],
    				height: /*height*/ ctx[3],
    				viewBox: /*viewBox*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			a0 = element("a");
    			create_component(phoneintalk.$$.fragment);
    			t = space();
    			a1 = element("a");
    			create_component(email.$$.fragment);
    			attr_dev(a0, "href", "tel:07826 063491");
    			add_location(a0, file$2, 12, 1, 264);
    			attr_dev(a1, "href", "mailto:test@test.com");
    			add_location(a1, file$2, 15, 1, 358);
    			attr_dev(footer, "class", "svelte-1mp5b5j");
    			add_location(footer, file$2, 11, 0, 254);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, a0);
    			mount_component(phoneintalk, a0, null);
    			append_dev(footer, t);
    			append_dev(footer, a1);
    			mount_component(email, a1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(phoneintalk.$$.fragment, local);
    			transition_in(email.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(phoneintalk.$$.fragment, local);
    			transition_out(email.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			destroy_component(phoneintalk);
    			destroy_component(email);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	let size = "3em";
    	let color = "black";
    	let width = size;
    	let height = size;
    	let viewBox = "0 0 24 24";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		PhoneInTalk,
    		Email,
    		size,
    		color,
    		width,
    		height,
    		viewBox
    	});

    	$$self.$inject_state = $$props => {
    		if ("size" in $$props) $$invalidate(0, size = $$props.size);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("width" in $$props) $$invalidate(2, width = $$props.width);
    		if ("height" in $$props) $$invalidate(3, height = $$props.height);
    		if ("viewBox" in $$props) $$invalidate(4, viewBox = $$props.viewBox);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [size, color, width, height, viewBox];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Header.svelte generated by Svelte v3.29.7 */
    const file$3 = "src/components/Header.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (16:8) {#each items as item}
    function create_each_block(ctx) {
    	let li;
    	let div;
    	let t0_value = /*item*/ ctx[4] + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*item*/ ctx[4]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "svelte-1z05zjg");
    			toggle_class(div, "active", /*item*/ ctx[4] === /*activeItem*/ ctx[1]);
    			add_location(div, file$3, 17, 16, 409);
    			attr_dev(li, "class", "svelte-1z05zjg");
    			add_location(li, file$3, 16, 12, 343);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div);
    			append_dev(div, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*items*/ 1 && t0_value !== (t0_value = /*item*/ ctx[4] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*items, activeItem*/ 3) {
    				toggle_class(div, "active", /*item*/ ctx[4] === /*activeItem*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(16:8) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let span1;
    	let h3;
    	let span0;
    	let t1;
    	let t2;
    	let br;
    	let t3;
    	let ul;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			span1 = element("span");
    			h3 = element("h3");
    			span0 = element("span");
    			span0.textContent = "LWM";
    			t1 = text(" Driving School");
    			t2 = space();
    			br = element("br");
    			t3 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span0, "class", "LWM svelte-1z05zjg");
    			add_location(span0, file$3, 11, 12, 222);
    			attr_dev(h3, "class", "svelte-1z05zjg");
    			add_location(h3, file$3, 11, 8, 218);
    			attr_dev(span1, "class", "name svelte-1z05zjg");
    			add_location(span1, file$3, 10, 4, 190);
    			add_location(br, file$3, 13, 4, 287);
    			attr_dev(ul, "class", "svelte-1z05zjg");
    			add_location(ul, file$3, 14, 4, 296);
    			attr_dev(div, "class", "header svelte-1z05zjg");
    			add_location(div, file$3, 9, 0, 165);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span1);
    			append_dev(span1, h3);
    			append_dev(h3, span0);
    			append_dev(h3, t1);
    			append_dev(div, t2);
    			append_dev(div, br);
    			append_dev(div, t3);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dispatch, items, activeItem*/ 7) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
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
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	let dispatch = createEventDispatcher();
    	let { items } = $$props;
    	let { activeItem } = $$props;
    	const writable_props = ["items", "activeItem"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	const click_handler = item => dispatch("tabChange", item);

    	$$self.$$set = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    		if ("activeItem" in $$props) $$invalidate(1, activeItem = $$props.activeItem);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		items,
    		activeItem
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatch" in $$props) $$invalidate(2, dispatch = $$props.dispatch);
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    		if ("activeItem" in $$props) $$invalidate(1, activeItem = $$props.activeItem);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [items, activeItem, dispatch, click_handler];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { items: 0, activeItem: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*items*/ ctx[0] === undefined && !("items" in props)) {
    			console.warn("<Header> was created without expected prop 'items'");
    		}

    		if (/*activeItem*/ ctx[1] === undefined && !("activeItem" in props)) {
    			console.warn("<Header> was created without expected prop 'activeItem'");
    		}
    	}

    	get items() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeItem() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeItem(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/home.svelte generated by Svelte v3.29.7 */

    const file$4 = "src/pages/home.svelte";

    function create_fragment$4(ctx) {
    	let div3;
    	let div0;
    	let h30;
    	let t1;
    	let p0;
    	let t3;
    	let div1;
    	let h31;
    	let t5;
    	let p1;
    	let t7;
    	let div2;
    	let h32;
    	let t8;
    	let span;
    	let t10;
    	let t11;
    	let p2;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Bulletin";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel ex tempus, ornare erat eu, ornare velit. Pellentesque tempus neque ac neque tincidunt, ut volutpat urna fringilla. In quis feugiat felis, eget varius mi. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aliquam pharetra, ipsum vitae accumsan ullamcorper, neque mi eleifend velit, et convallis libero mauris quis est. Nunc a hendrerit quam. Nam magna metus, ullamcorper sed tristique id, egestas vel magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam bibendum bibendum leo.";
    			t3 = space();
    			div1 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Regional Information";
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "Image of a map of the regions that are covered by LWM to go here";
    			t7 = space();
    			div2 = element("div");
    			h32 = element("h3");
    			t8 = text("Why choose ");
    			span = element("span");
    			span.textContent = "LWM";
    			t10 = text(" Driving School?");
    			t11 = space();
    			p2 = element("p");
    			p2.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel ex tempus, ornare erat eu, ornare velit. Pellentesque tempus neque ac neque tincidunt, ut volutpat urna fringilla. In quis feugiat felis, eget varius mi. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aliquam pharetra, ipsum vitae accumsan ullamcorper, neque mi eleifend velit, et convallis libero mauris quis est. Nunc a hendrerit quam. Nam magna metus, ullamcorper sed tristique id, egestas vel magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam bibendum bibendum leo.";
    			attr_dev(h30, "class", "bulletin");
    			add_location(h30, file$4, 5, 8, 84);
    			add_location(p0, file$4, 6, 8, 127);
    			attr_dev(div0, "class", "Bulletin svelte-d9i0iz");
    			add_location(div0, file$4, 4, 4, 53);
    			add_location(h31, file$4, 10, 8, 804);
    			add_location(p1, file$4, 11, 8, 842);
    			attr_dev(div1, "class", "Regional-Info svelte-d9i0iz");
    			add_location(div1, file$4, 9, 4, 768);
    			attr_dev(span, "class", "LWM svelte-d9i0iz");
    			add_location(span, file$4, 14, 23, 974);
    			add_location(h32, file$4, 14, 8, 959);
    			add_location(p2, file$4, 15, 8, 1032);
    			attr_dev(div2, "class", "Why-LWM svelte-d9i0iz");
    			add_location(div2, file$4, 13, 4, 929);
    			attr_dev(div3, "class", "grid-container svelte-d9i0iz");
    			add_location(div3, file$4, 3, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, h30);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div3, t3);
    			append_dev(div3, div1);
    			append_dev(div1, h31);
    			append_dev(div1, t5);
    			append_dev(div1, p1);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div2, h32);
    			append_dev(h32, t8);
    			append_dev(h32, span);
    			append_dev(h32, t10);
    			append_dev(div2, t11);
    			append_dev(div2, p2);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/pages/about.svelte generated by Svelte v3.29.7 */

    const file$5 = "src/pages/about.svelte";

    function create_fragment$5(ctx) {
    	let div5;
    	let div0;
    	let h30;
    	let t0;
    	let span;
    	let t2;
    	let t3;
    	let p0;
    	let t5;
    	let p1;
    	let t7;
    	let p2;
    	let t9;
    	let div1;
    	let h31;
    	let t11;
    	let p3;
    	let t13;
    	let p4;
    	let t15;
    	let p5;
    	let t17;
    	let div2;
    	let img0;
    	let img0_src_value;
    	let t18;
    	let div3;
    	let img1;
    	let img1_src_value;
    	let t19;
    	let div4;
    	let h32;
    	let t21;
    	let p6;
    	let t23;
    	let p7;
    	let t25;
    	let p8;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			h30 = element("h3");
    			t0 = text("About ");
    			span = element("span");
    			span.textContent = "LWM";
    			t2 = text(" Driving School");
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "LWM Driving school aim to provide you with a calm and open learning experience to allow you to flourish into a calm and confident driver.";
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "With a 200% first time pass rate we consistently provide our students with every skill they could ever require on the road.";
    			t7 = space();
    			p2 = element("p");
    			p2.textContent = "We set ourselves apart from large chain driving schools by providing a bespoke training schedule based around each students individual requirements. These are formulated during the first 2 hours spent with the student and have been shown to increase first time pass rates.";
    			t9 = space();
    			div1 = element("div");
    			h31 = element("h3");
    			h31.textContent = "About Me";
    			t11 = space();
    			p3 = element("p");
    			p3.textContent = "My name is Martin and I'm a fully qualified Government approved Driving Instructor (ADI) and I am passionate about road safety.";
    			t13 = space();
    			p4 = element("p");
    			p4.textContent = "I decided to train to become a driving instructor because I wanted a job with real satisfaction and there is nothing better than seeing someone pass their test first time. I was also always being told by friends and work colleagues that I was a calm and relaxed type of person and that I would make a great driving instructor";
    			t15 = space();
    			p5 = element("p");
    			p5.textContent = "My lessons are always conducted in a calm, friendly and relaxed manner as I firmly believe in making pupils feel at ease during lessons.";
    			t17 = space();
    			div2 = element("div");
    			img0 = element("img");
    			t18 = space();
    			div3 = element("div");
    			img1 = element("img");
    			t19 = space();
    			div4 = element("div");
    			h32 = element("h3");
    			h32.textContent = "About The Car";
    			t21 = space();
    			p6 = element("p");
    			p6.textContent = "I am currently using an Alfa Romeo Gulia GTA as my training vehicle.";
    			t23 = space();
    			p7 = element("p");
    			p7.textContent = "Its 2.9L Twin-Turbo V6 engine provides the perfect amount of torque to allow learners to easily get off the line and builds confidence with every mile.";
    			t25 = space();
    			p8 = element("p");
    			p8.textContent = "The 8 speed \"automatic\" gearbox is technically an automated manual so who knows how the law looks at passing your test in one of these.";
    			attr_dev(span, "class", "LWM svelte-1nphtm8");
    			add_location(span, file$5, 6, 18, 96);
    			attr_dev(h30, "class", "svelte-1nphtm8");
    			add_location(h30, file$5, 6, 8, 86);
    			attr_dev(p0, "class", "svelte-1nphtm8");
    			add_location(p0, file$5, 7, 8, 153);
    			attr_dev(p1, "class", "svelte-1nphtm8");
    			add_location(p1, file$5, 8, 8, 306);
    			attr_dev(p2, "class", "svelte-1nphtm8");
    			add_location(p2, file$5, 9, 8, 445);
    			attr_dev(div0, "class", "About-LWM svelte-1nphtm8");
    			add_location(div0, file$5, 5, 4, 54);
    			attr_dev(h31, "class", "svelte-1nphtm8");
    			add_location(h31, file$5, 12, 8, 771);
    			attr_dev(p3, "class", "svelte-1nphtm8");
    			add_location(p3, file$5, 13, 8, 797);
    			attr_dev(p4, "class", "svelte-1nphtm8");
    			add_location(p4, file$5, 14, 8, 940);
    			attr_dev(p5, "class", "svelte-1nphtm8");
    			add_location(p5, file$5, 15, 8, 1281);
    			attr_dev(div1, "class", "About-Me svelte-1nphtm8");
    			add_location(div1, file$5, 11, 4, 740);
    			attr_dev(img0, "class", "person svelte-1nphtm8");
    			if (img0.src !== (img0_src_value = "https://image.freepik.com/free-vector/man-profile-cartoon_18591-58482.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Mr. Fender");
    			add_location(img0, file$5, 18, 8, 1471);
    			attr_dev(div2, "class", "Me-Photo svelte-1nphtm8");
    			add_location(div2, file$5, 17, 4, 1440);
    			attr_dev(img1, "class", "car svelte-1nphtm8");
    			if (img1.src !== (img1_src_value = "images/car.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "My Training Vehicle");
    			add_location(img1, file$5, 21, 8, 1636);
    			attr_dev(div3, "class", "Car-Photo svelte-1nphtm8");
    			add_location(div3, file$5, 20, 4, 1604);
    			attr_dev(h32, "class", "svelte-1nphtm8");
    			add_location(h32, file$5, 24, 8, 1752);
    			attr_dev(p6, "class", "svelte-1nphtm8");
    			add_location(p6, file$5, 25, 8, 1783);
    			attr_dev(p7, "class", "svelte-1nphtm8");
    			add_location(p7, file$5, 26, 8, 1867);
    			attr_dev(p8, "class", "svelte-1nphtm8");
    			add_location(p8, file$5, 27, 8, 2034);
    			attr_dev(div4, "class", "About-the-Car svelte-1nphtm8");
    			add_location(div4, file$5, 23, 4, 1716);
    			attr_dev(div5, "class", "grid-container svelte-1nphtm8");
    			add_location(div5, file$5, 4, 0, 21);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div0, h30);
    			append_dev(h30, t0);
    			append_dev(h30, span);
    			append_dev(h30, t2);
    			append_dev(div0, t3);
    			append_dev(div0, p0);
    			append_dev(div0, t5);
    			append_dev(div0, p1);
    			append_dev(div0, t7);
    			append_dev(div0, p2);
    			append_dev(div5, t9);
    			append_dev(div5, div1);
    			append_dev(div1, h31);
    			append_dev(div1, t11);
    			append_dev(div1, p3);
    			append_dev(div1, t13);
    			append_dev(div1, p4);
    			append_dev(div1, t15);
    			append_dev(div1, p5);
    			append_dev(div5, t17);
    			append_dev(div5, div2);
    			append_dev(div2, img0);
    			append_dev(div5, t18);
    			append_dev(div5, div3);
    			append_dev(div3, img1);
    			append_dev(div5, t19);
    			append_dev(div5, div4);
    			append_dev(div4, h32);
    			append_dev(div4, t21);
    			append_dev(div4, p6);
    			append_dev(div4, t23);
    			append_dev(div4, p7);
    			append_dev(div4, t25);
    			append_dev(div4, p8);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
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

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("About", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/TestimonialCard.svelte generated by Svelte v3.29.7 */

    const file$6 = "src/components/TestimonialCard.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let p;
    	let t;
    	let p_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t = text(/*text*/ ctx[1]);
    			attr_dev(p, "class", p_class_value = "" + (null_to_empty(/*text*/ ctx[1].length > 500 ? "long" : "") + " svelte-1qybbd6"));
    			add_location(p, file$6, 8, 4, 124);
    			attr_dev(div, "class", "container svelte-1qybbd6");
    			set_style(div, "--image", "url(" + /*photo*/ ctx[0] + ")");
    			add_location(div, file$6, 7, 0, 65);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 2) set_data_dev(t, /*text*/ ctx[1]);

    			if (dirty & /*text*/ 2 && p_class_value !== (p_class_value = "" + (null_to_empty(/*text*/ ctx[1].length > 500 ? "long" : "") + " svelte-1qybbd6"))) {
    				attr_dev(p, "class", p_class_value);
    			}

    			if (dirty & /*photo*/ 1) {
    				set_style(div, "--image", "url(" + /*photo*/ ctx[0] + ")");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TestimonialCard", slots, []);
    	let { photo } = $$props;
    	let { text } = $$props;
    	const writable_props = ["photo", "text"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TestimonialCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("photo" in $$props) $$invalidate(0, photo = $$props.photo);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({ photo, text });

    	$$self.$inject_state = $$props => {
    		if ("photo" in $$props) $$invalidate(0, photo = $$props.photo);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [photo, text];
    }

    class TestimonialCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { photo: 0, text: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TestimonialCard",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*photo*/ ctx[0] === undefined && !("photo" in props)) {
    			console.warn("<TestimonialCard> was created without expected prop 'photo'");
    		}

    		if (/*text*/ ctx[1] === undefined && !("text" in props)) {
    			console.warn("<TestimonialCard> was created without expected prop 'text'");
    		}
    	}

    	get photo() {
    		throw new Error("<TestimonialCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set photo(value) {
    		throw new Error("<TestimonialCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<TestimonialCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<TestimonialCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/testimonials.svelte generated by Svelte v3.29.7 */
    const file$7 = "src/pages/testimonials.svelte";

    function create_fragment$7(ctx) {
    	let div6;
    	let div0;
    	let testimonialcard0;
    	let t0;
    	let div1;
    	let testimonialcard1;
    	let t1;
    	let div2;
    	let testimonialcard2;
    	let t2;
    	let div3;
    	let testimonialcard3;
    	let t3;
    	let div4;
    	let testimonialcard4;
    	let t4;
    	let div5;
    	let testimonialcard5;
    	let current;

    	testimonialcard0 = new TestimonialCard({
    			props: {
    				photo: /*photo1*/ ctx[0],
    				text: /*text1*/ ctx[1]
    			},
    			$$inline: true
    		});

    	testimonialcard1 = new TestimonialCard({
    			props: {
    				photo: /*photo2*/ ctx[2],
    				text: /*text2*/ ctx[3]
    			},
    			$$inline: true
    		});

    	testimonialcard2 = new TestimonialCard({
    			props: {
    				photo: /*photo3*/ ctx[4],
    				text: /*text3*/ ctx[5]
    			},
    			$$inline: true
    		});

    	testimonialcard3 = new TestimonialCard({
    			props: {
    				photo: /*photo4*/ ctx[6],
    				text: /*text4*/ ctx[7]
    			},
    			$$inline: true
    		});

    	testimonialcard4 = new TestimonialCard({
    			props: {
    				photo: /*photo5*/ ctx[8],
    				text: /*text5*/ ctx[9]
    			},
    			$$inline: true
    		});

    	testimonialcard5 = new TestimonialCard({
    			props: {
    				photo: /*photo6*/ ctx[10],
    				text: /*text6*/ ctx[11]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div0 = element("div");
    			create_component(testimonialcard0.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(testimonialcard1.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			create_component(testimonialcard2.$$.fragment);
    			t2 = space();
    			div3 = element("div");
    			create_component(testimonialcard3.$$.fragment);
    			t3 = space();
    			div4 = element("div");
    			create_component(testimonialcard4.$$.fragment);
    			t4 = space();
    			div5 = element("div");
    			create_component(testimonialcard5.$$.fragment);
    			attr_dev(div0, "class", "Testimonial-1 svelte-odgufu");
    			add_location(div0, file$7, 19, 4, 2497);
    			attr_dev(div1, "class", "Testimonial-2 svelte-odgufu");
    			add_location(div1, file$7, 20, 4, 2581);
    			attr_dev(div2, "class", "Testimonial-3 svelte-odgufu");
    			add_location(div2, file$7, 21, 4, 2665);
    			attr_dev(div3, "class", "Testimonial-4 svelte-odgufu");
    			add_location(div3, file$7, 22, 4, 2749);
    			attr_dev(div4, "class", "Testimonial-5 svelte-odgufu");
    			add_location(div4, file$7, 23, 4, 2833);
    			attr_dev(div5, "class", "Testimonial-6 svelte-odgufu");
    			add_location(div5, file$7, 24, 4, 2917);
    			attr_dev(div6, "class", "grid-container svelte-odgufu");
    			add_location(div6, file$7, 18, 0, 2464);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div0);
    			mount_component(testimonialcard0, div0, null);
    			append_dev(div6, t0);
    			append_dev(div6, div1);
    			mount_component(testimonialcard1, div1, null);
    			append_dev(div6, t1);
    			append_dev(div6, div2);
    			mount_component(testimonialcard2, div2, null);
    			append_dev(div6, t2);
    			append_dev(div6, div3);
    			mount_component(testimonialcard3, div3, null);
    			append_dev(div6, t3);
    			append_dev(div6, div4);
    			mount_component(testimonialcard4, div4, null);
    			append_dev(div6, t4);
    			append_dev(div6, div5);
    			mount_component(testimonialcard5, div5, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(testimonialcard0.$$.fragment, local);
    			transition_in(testimonialcard1.$$.fragment, local);
    			transition_in(testimonialcard2.$$.fragment, local);
    			transition_in(testimonialcard3.$$.fragment, local);
    			transition_in(testimonialcard4.$$.fragment, local);
    			transition_in(testimonialcard5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(testimonialcard0.$$.fragment, local);
    			transition_out(testimonialcard1.$$.fragment, local);
    			transition_out(testimonialcard2.$$.fragment, local);
    			transition_out(testimonialcard3.$$.fragment, local);
    			transition_out(testimonialcard4.$$.fragment, local);
    			transition_out(testimonialcard5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_component(testimonialcard0);
    			destroy_component(testimonialcard1);
    			destroy_component(testimonialcard2);
    			destroy_component(testimonialcard3);
    			destroy_component(testimonialcard4);
    			destroy_component(testimonialcard5);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Testimonials", slots, []);
    	let photo1 = "https://www.passwithmartin.co.uk/images/user/image/2851/2851_ben_jewett.jpg";
    	let text1 = "Martin was a brilliant instructor! He was understanding, knowledgable and friendly and and got me a first time pass. I can not recommend him enough, his lessons are something I looked forward to every week! Thanks Martin.";
    	let photo2 = "https://www.passwithmartin.co.uk/images/user/image/2851/2851_fraya_fuller.jpg";
    	let text2 = "1st Time Pass with Martin!";
    	let photo3 = "https://www.passwithmartin.co.uk/images/user/image/2851/2851_rouen_de_villiers.jpg";
    	let text3 = "I recently had the privilege of having Martin Fender as my driving instructor. Although I only had a few lessons Martin quickly figured out where my strength and weaknesses were. Martin is great instructor, explained things very well, always friendly and very accommodating. Martin has a great demeanor and has a great sense of humor. Thank you very much Martin, God Bless.";
    	let photo4 = "https://www.passwithmartin.co.uk/images/user/image/2851/2851_matthew_prior.jpg";
    	let text4 = "1st Time Pass with 0 Minors!!";
    	let photo5 = "https://www.passwithmartin.co.uk/images/user/image/2851/2851_george-alexandru_caldaruse.jpg";
    	let text5 = "I am going to start by saying that my first driving instructor from another driving school wasn't the most pleasing. Once I started taking lessons with Martin I became more confident. He is a perfectionist therefore will try and push you to become better, giving you the necessary feedback for you to improve. He is an awesome person and you don't feel pressured, ashamed or feel any sort of discomfort driving with him. We occasionally made a few jokes here and there to burn some steam off and always tries to make your driving schedule as comfortable as it can be. Overall I have improved massively from the first lessons with my first instructor to how I am driving now thanks to Martin. 😁 Fully recommend taking lessons with this amazing person.😁";
    	let photo6 = "https://www.passwithmartin.co.uk/images/user/image/2851/2851_melissa_annis.jpg";
    	let text6 = "I would highly recommend Martin from LDC Driving School. From the start Martin made sure I was comfortable and ready to drive. He helped establish confidence while driving. He holds the bar high so that when you take your test you are more than ready.";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Testimonials> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		TestimonialCard,
    		photo1,
    		text1,
    		photo2,
    		text2,
    		photo3,
    		text3,
    		photo4,
    		text4,
    		photo5,
    		text5,
    		photo6,
    		text6
    	});

    	$$self.$inject_state = $$props => {
    		if ("photo1" in $$props) $$invalidate(0, photo1 = $$props.photo1);
    		if ("text1" in $$props) $$invalidate(1, text1 = $$props.text1);
    		if ("photo2" in $$props) $$invalidate(2, photo2 = $$props.photo2);
    		if ("text2" in $$props) $$invalidate(3, text2 = $$props.text2);
    		if ("photo3" in $$props) $$invalidate(4, photo3 = $$props.photo3);
    		if ("text3" in $$props) $$invalidate(5, text3 = $$props.text3);
    		if ("photo4" in $$props) $$invalidate(6, photo4 = $$props.photo4);
    		if ("text4" in $$props) $$invalidate(7, text4 = $$props.text4);
    		if ("photo5" in $$props) $$invalidate(8, photo5 = $$props.photo5);
    		if ("text5" in $$props) $$invalidate(9, text5 = $$props.text5);
    		if ("photo6" in $$props) $$invalidate(10, photo6 = $$props.photo6);
    		if ("text6" in $$props) $$invalidate(11, text6 = $$props.text6);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		photo1,
    		text1,
    		photo2,
    		text2,
    		photo3,
    		text3,
    		photo4,
    		text4,
    		photo5,
    		text5,
    		photo6,
    		text6
    	];
    }

    class Testimonials extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Testimonials",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/pages/pricing.svelte generated by Svelte v3.29.7 */

    const file$8 = "src/pages/pricing.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let h3;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			h3.textContent = "Pricing";
    			t1 = space();
    			p = element("p");
    			p.textContent = "I'm where all the pricing is gonna go!";
    			add_location(h3, file$8, 4, 4, 46);
    			add_location(p, file$8, 5, 4, 67);
    			attr_dev(div, "class", "pricing svelte-t6q4yg");
    			add_location(div, file$8, 3, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(div, t1);
    			append_dev(div, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Pricing", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Pricing> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Pricing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pricing",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.7 */
    const file$9 = "src/App.svelte";

    // (22:36) 
    function create_if_block_3(ctx) {
    	let pricing;
    	let current;
    	pricing = new Pricing({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(pricing.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(pricing, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pricing.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pricing.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pricing, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(22:36) ",
    		ctx
    	});

    	return block;
    }

    // (20:41) 
    function create_if_block_2(ctx) {
    	let testimonials;
    	let current;
    	testimonials = new Testimonials({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(testimonials.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(testimonials, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(testimonials.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(testimonials.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(testimonials, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(20:41) ",
    		ctx
    	});

    	return block;
    }

    // (18:34) 
    function create_if_block_1(ctx) {
    	let about;
    	let current;
    	about = new About({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(about.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(about, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(about.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(about.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(about, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(18:34) ",
    		ctx
    	});

    	return block;
    }

    // (16:1) {#if activeItem === 'Home'}
    function create_if_block(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(16:1) {#if activeItem === 'Home'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let header;
    	let t0;
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let t1;
    	let footer;
    	let current;

    	header = new Header({
    			props: {
    				activeItem: /*activeItem*/ ctx[0],
    				items: /*items*/ ctx[1]
    			},
    			$$inline: true
    		});

    	header.$on("tabChange", /*navChange*/ ctx[2]);
    	const if_block_creators = [create_if_block, create_if_block_1, create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*activeItem*/ ctx[0] === "Home") return 0;
    		if (/*activeItem*/ ctx[0] === "About") return 1;
    		if (/*activeItem*/ ctx[0] === "Testimonials") return 2;
    		if (/*activeItem*/ ctx[0] === "Pricing") return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			main = element("main");
    			if (if_block) if_block.c();
    			t1 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(main, "class", "svelte-6ak26w");
    			add_location(main, file$9, 14, 0, 496);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(main, null);
    			}

    			insert_dev(target, t1, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const header_changes = {};
    			if (dirty & /*activeItem*/ 1) header_changes.activeItem = /*activeItem*/ ctx[0];
    			header.$set(header_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			if (detaching) detach_dev(t1);
    			destroy_component(footer, detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let items = ["Home", "About", "Testimonials", "Pricing"];
    	let activeItem = "Home";
    	const navChange = e => $$invalidate(0, activeItem = e.detail);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Footer,
    		Header,
    		Home,
    		About,
    		Testimonials,
    		Pricing,
    		items,
    		activeItem,
    		navChange
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(1, items = $$props.items);
    		if ("activeItem" in $$props) $$invalidate(0, activeItem = $$props.activeItem);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeItem, items, navChange];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
