<template>
  <div>
    <div
      class="coco-modal-wrapper"
      v-show="visible"
      ref="wrapper"
      @click.self="beforeCloseFn('mask')"
      @scroll="scrollModal"
    >
      <div
        class="coco-modal"
        ref="modal"
        :style="{ width: width }"
        role="modal"
        aria-modal="true"
      >
        <div
          class="coco-modal-content"
          ref="modalContent"
          :style="{ borderRadius: borderRadius }"
          role="modal-content"
        >
          <div
            ref="closeButtonEl"
            class="coco-modal-close"
            v-if="closeButton"
            @click="beforeCloseFn('closeButton')"
          ></div>
          <div class="coco-modal-header" ref="headerEl" v-if="header">
            <div class="coco-modal-title" ref="titleEl">
              <span ref="titleSpan">{{ title }}</span>
            </div>
          </div>
          <div class="coco-modal-body" ref="bodyEl">
            <div v-if="inputAttrs" ref="inputWrapper">
              <div>
                <input
                  ref="inputEl"
                  @keyup.enter="beforeCloseFn('ok')"
                  v-model="inputValue"
                  class="coco-input"
                  type="text"
                />
              </div>
            </div>
            <slot></slot>
            <div class="coco-error-text" ref="errorEl" v-show="errorText">
              {{ errorText }}
            </div>
          </div>
          <div class="coco-modal-footer" ref="footerEl" v-if="$slots.footer">
            <slot name="footer"></slot>
          </div>
          <div
            class="coco-modal-footer"
            ref="footerEl"
            v-else-if="!$slots.footer && footer"
          >
            <button
              class="coco-btn cancel"
              ref="cancelButtonEl"
              @click="beforeCloseFn('cancel')"
              v-if="cancelButton"
            >
              <span ref="cancelButtonSpan">{{ cancelText }}</span>
            </button>
            <button
              class="coco-btn ok"
              :style="{ backgroundColor: buttonColor }"
              :class="[isLoading ? 'coco-is-loading' : '']"
              ref="okButtonEl"
              @click="beforeCloseFn('ok')"
              @keypress.enter.prevent
              @keyup.enter="beforeCloseFn('ok')"
              v-if="okButton"
            >
              <span
                class="coco-loading"
                :style="{ display: isLoading ? 'inline-block' : 'none' }"
                ref="loadingEl"
              ></span>
              <span ref="okButtonSpan">{{ okText }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
let props = {
  title: {
    type: [String, Number],
    default: "提示",
  },

  width: {
    type: String,
    default: "500px",
  },
  top: {
    type: [String, Number],
    default: "15vh",
  },
  maskClose: {
    type: Boolean,
    default: true,
  },
  header: {
    type: Boolean,
    default: true,
  },
  footer: {
    type: Boolean,
    default: true,
  },
  escClose: {
    type: Boolean,
    default: true,
  },
  inputAttrs: {
    type: [Object],
  },

  okButton: {
    type: Boolean,
    default: true,
  },
  cancelButton: {
    type: Boolean,
    default: true,
  },
  closeButton: {
    type: Boolean,
    default: true,
  },
  okText: {
    type: [String, Number],
    default: "确定",
  },
  cancelText: {
    type: [String, Number],
    default: "取消",
  },
  zIndexOfModal: {
    type: Number,
    default: 1995,
  },
  zIndexOfMask: {
    type: Number,
    default: 2008,
  },
  zIndexOfActiveModal: {
    type: Number,
    default: 2020,
  },
  onClose: {
    type: Function,
    default: null,
  },
  onMount: {
    type: Function,
    default: null,
  },
  autoFocusOkButton: {
    type: Boolean,
    default: true,
  },
  autoFocusInput: {
    type: Boolean,
    default: true,
  },
  fullScreen: {
    type: Boolean,
    default: false,
  },
  blur: {
    type: Boolean,
    default: false,
  },
  borderRadius: {
    type: [String, Number],
    default: "",
  },
  buttonColor: {
    type: String,
    default: "",
  },
  animation: {
    type: Boolean,
    default: true,
  },
  hooks: {
    type: Object,
    default: () => {},
  },
  value: {
    type: Boolean,
    default: false,
  },
};
let initOptions = {
  visible: false,
  maskClose: true,
  header: true,
  footer: true,
  title: "提示",
  text: "",
  width: "",
  top: "",
  inputAttrs: false,
  escClose: true,
  okButton: true,
  cancelButton: true,
  okText: "确定",
  cancelText: "取消",
  closeButton: true,
  zIndexOfModal: 1995,
  zIndexOfMask: 2008,
  zIndexOfActiveModal: 2020,
  autoFocusOkButton: true,
  autoFocusInput: true,
  fullScreen: false,
  borderRadius: "",
  blur: false,
  buttonColor: "",
  hooks: {},
  destroy: false,
  animation: true,
  onClose: null,
};
if (window && window.CocoConfig) {
  for (const key in initOptions) {
    if (window.CocoConfig[key] !== undefined) {
      initOptions[key] = window.CocoConfig[key];
    }
  }
}
if (window && window.CocoConfig) {
  for (const key in props) {
    if (window.CocoConfig[key] !== undefined && key !== "value") {
      props[key].default = window.CocoConfig[key];
    }
  }
}

let w = window;
let doc = null;
let body = null;
let docEl = null;
let scrollbarWidth = 0;

let bodyStyle = {};

let inBrowser = typeof w !== "undefined";
let isAnimation = (anm) => {
  return ieVersion() > 9 ? anm : false;
};

function getRaf() {
  let res;
  ["r", "webkitR", "mozR", "msR", "O"].forEach(function (prefix) {
    let name = prefix + "equestAnimationFrame";
    if (name in w) res = w[name];
  });
  return res;
}
let raf = inBrowser
  ? getRaf()
    ? getRaf().bind(w)
    : setTimeout
  : function (fn) {
      return fn();
    };

function ieVersion() {
  var userAgent = navigator.userAgent;
  var isIE =
    userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1;
  var isEdge = userAgent.indexOf("Edge") > -1 && !isIE;
  var isIE11 =
    userAgent.indexOf("Trident") > -1 && userAgent.indexOf("rv:11.0") > -1;
  if (isIE) {
    var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
    reIE.test(userAgent);
    var fIEVersion = parseFloat(RegExp["$1"]);
    if (fIEVersion == 7) {
      return 7;
    } else if (fIEVersion == 8) {
      return 8;
    } else if (fIEVersion == 9) {
      return 9;
    } else if (fIEVersion == 10) {
      return 10;
    } else {
      return 6;
    }
  } else if (isEdge) {
    return "edge";
  } else if (isIE11) {
    return 11;
  } else {
    return 100;
  }
}

function nowTime() {
  return Date.now();
}

function rafTimeout(fn, time) {
  let now = nowTime();
  let res = {
    stop: false,
  };
  function step() {
    if (nowTime() - now < time) {
      raf(step);
    } else {
      !res.stop && fn();
    }
  }
  raf(step);
  return res;
}

let cancelRaf = (res) => {
  if (res) res.stop = true;
};
rafTimeout = w.requestAnimationFrame ? rafTimeout : w.setTimeout;

let MousePos = {};
let clickTime = 0;
let keyDownTime = 0;

function setPointerPosition(e) {
  MousePos.x = e.clientX;
  MousePos.y = e.clientY;
  clickTime = nowTime();
}

function beforeClose(a, way) {
  let isOk = way == "ok";
  a.closeType = way;
  let aa = Object.assign({}, a);

  if (a.isLoading && way == "ok") {
    return;
  }
  if (a.beforeCloseFn) {
    if (a.beforeCloseFn.length < 2) {
      a.beforeCloseFn(isOk);
      closeModal(a);
    } else if (a.beforeCloseFn.length === 2) {
      a.beforeCloseFn(isOk, aa);
      closeModal(a);
    } else {
      a.beforeCloseFn(isOk, aa, () => {
        closeModal(a);
      });
    }
  } else {
    closeModal(a);
  }
}
function addSomeEvents() {
  addEvent(docEl, "click", setPointerPosition, true);
  addEvent(
    w,
    "keydown",
    () => {
      keyDownTime = nowTime();
    },
    true
  );
  addEvent(w, "keyup", (e) => {
    let l = wrapperArray.length;
    if (e.code === "Escape" && l) {
      let a = wrapperArray[l - 1];
      if (a.escClose) {
        if (a.$el) {
          a.close("esc");
        } else {
          beforeClose(a, "esc");
        }
      }
    }
  });

  addEvent(w, "resize", () => {
    let modal = null;
    wrapperArray.forEach((md) => {
      modal = md.modal;
      setTransformOrigin(modal);
    });
  });
}

function addClass(el, s) {
  let c = el.className || "";
  if (!hasClass(c, s)) {
    let arr = c.split(/\s+/);
    arr.push(s);
    el.className = arr.join(" ");
  }
}

function hasClass(c, s) {
  return c.indexOf(s) > -1 ? !0 : !1;
}

function removeClass(el, s) {
  let c = el.className || "";
  if (hasClass(c, s)) {
    let arr = c.split(/\s+/);
    let i = arr.indexOf(s);
    arr.splice(i, 1);
    el.className = arr.join(" ");
  }
  if (el.getAttribute("class") === "") {
    el.removeAttribute("class");
  }
}

function addEvent(el, name, fn, c) {
  el.addEventListener(name, fn, c);
}

function getStyle(el, value) {
  if (w.getComputedStyle) {
    return getComputedStyle(el)[value];
  } else {
    return el.currentStyle[value];
  }
}
function isHideScrollbar() {
  body.scrollHeight > window.CocoMask.offsetHeight &&
    getStyle(body, "overflowY") !== "hidden" &&
    hideBodyBar(window.CocoMask.offsetWidth);
}
function hideBodyBar(windowWidth) {
  let width = getStyle(body, "width");
  let bodyWidth = body.style.width;
  let bodyOverflow = body.style.overflow;
  let bodyPosition = body.style.position;

  bodyStyle.position = bodyPosition;
  bodyStyle.overflow = bodyOverflow;
  bodyStyle.width = bodyWidth;

  width =
    windowWidth < parseFloat(width)
      ? width
      : `calc(100% - ${scrollbarWidth}px)`;

  css(body, {
    position: bodyPosition === "" ? "relative" : bodyPosition,
    overflow: "hidden",
    width,
  });
}

function deleteBodyStyle() {
  css(body, {
    position: bodyStyle.position,
    overflow: bodyStyle.overflow === "visible" ? "" : bodyStyle.overflow,
    width: bodyStyle.width,
  });
}

function getBarWidth() {
  let d = doc.createElement("div"),
    d1 = doc.createElement("div"),
    w1 = 0,
    w2 = 0;
  d.style.width = "1000px";
  d.style.position = "fixed";
  d.style.top = "100%";
  d.style.overflow = "scroll";
  d1.style.width = "100%";
  d.appendChild(d1);
  body.appendChild(d);
  w1 = d.offsetWidth;
  w2 = d1.offsetWidth;
  removeChildNode(d);
  return w1 - w2;
}

const r = (node, children = []) => {
  let { el } = node;
  el = doc.createElement(node.el || "div");

  delete node.el;
  for (const key in node) {
    if (key === "is") {
      let arr = node[key];
      arr[0][arr[1]] = el;
      continue;
    }
    if (node.hasOwnProperty(key)) {
      let val = node[key];
      if (key[0] === "@") {
        let name = key.slice(1);
        addEvent(el, name, val);
      } else {
        el.setAttribute(key, val);
      }
    }
  }
  if (typeof children === "object") {
    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      el.appendChild(child);
    }
  }
  return el;
};

function css(el, css) {
  for (let key in css) {
    el.style[key] = css[key];
  }
  if (el.getAttribute("style") === "") {
    el.removeAttribute("style");
  }
}

function showMask(a) {
  if (window.CocoMask) return;
  window.CocoMask = r({
    class: "coco-modal-mask blur",
    "@click": () => {
      if (typeof process !== undefined) {
        removeChildNode(window.CocoMask);
        window.CocoMask = null;
        wrapperArray = [];
        deleteBodyStyle();
      }
    },
  });
  a.mask = window.CocoMask;

  body.appendChild(window.CocoMask);
}

let wrapperArray = [];

function blurModal() {
  let l = wrapperArray.length;
  if (l) {
    let a = wrapperArray[l - 1] && wrapperArray[l - 1];
    a.inputEl && a.inputEl.blur();
    a.okButtonEl && a.okButtonEl.blur();
  }
}
let modalElID = {};

function initModal(a) {
  let { wrapper, modal, okButtonEl, destroy, el, inputAttrs } = a;
  initModalData(a);
  needRender(a);
  addEvent(wrapper, "scroll", (_) => {
    scrollOrigin(a, wrapper, modal);
  });
  if (inputAttrs) {
    initInput(a);
  }
  addEvent(okButtonEl, "keyup", (e) => {
    if (e.code === "Enter") {
      beforeClose(a, "ok");
    }
  });

  if (el) {
    let elm = modalElID[el];
    if (!elm) {
      try {
        if (el.tagName === undefined) {
          elm = doc.querySelector(el);
        } else {
          elm = el;
        }
      } catch (error) {
        throw new Error(error);
      }
      modalElID[el] = elm;
    }
    if (destroy) {
      elm = elm.cloneNode(true);
    }
    css(elm, {
      display: "",
    });
    a.domEl.appendChild(elm);
  }
  let div = r({});
  a.div = div;
  div.appendChild(wrapper);
  body.appendChild(div);
  css(wrapper, {
    display: "none",
  });
  showModal(a);
}
let cocoFocusEl = null;

function scrollOrigin(a, wrapper, modal) {
  let offsetX = wrapper.scrollLeft - a.scrollLeft;
  let offsetY = wrapper.scrollTop - a.scrollTop;
  let x = a.originX + offsetX;
  let y = a.originY + offsetY;
  let origin = x + "px " + y + "px";
  setTransformOrigin(modal, origin);
}

function displayModal(wrapper) {
  css(wrapper, {
    display: "",
  });
  css(window.CocoMask, {
    display: "",
  });
}

function isBlur(blur, modalContent) {
  if (blur) {
    addClass(window.CocoMask, "blur");
    addClass(modalContent, "coco-no-shadow");
  } else {
    window.CocoMask && removeClass(window.CocoMask, "blur");
    modalContent && removeClass(modalContent, "coco-no-shadow");
  }
}

function addModal(a) {
  wrapperArray.push(a);
}

function startAnimation(el, name, type) {
  type = type ? "enter" : "leave";
  addClass(el, name + "-" + type);
  addClass(el, name + "-" + type + "-active");
}

function clearClass(el, name, type) {
  type = type ? "enter" : "leave";
  removeClass(el, name + "-" + type);
  removeClass(el, name + "-" + type + "-" + "active");
}

function setModalZIndex(a) {
  let { wrapper, zIndexOfMask, zIndexOfActiveModal } = a;
  css(wrapper, {
    zIndex: zIndexOfActiveModal,
  });
  css(window.CocoMask, {
    zIndex: zIndexOfMask,
  });
}

function showModal(a) {
  let {
    wrapper,
    modal,
    blur,
    modalContent,
    animation,
    onMount,
    notMount,
    fullScreen,
    hooks,
    inputAttrs,
  } = a;

  if (!wrapper) {
    return;
  }
  removeClass(wrapper, "coco-p-e-n");
  if (!doc) {
    doc = w.document;
    body = doc.body;
    docEl = doc.documentElement;
  }

  !a.isOpen && clearClose(a);

  let duration = isAnimation(animation) ? 380 : 0;
  a.isOpen = true;
  cocoFocusEl = doc.activeElement;

  showMask(a);
  setModalZIndex(a);
  isBlur(blur, modalContent);
  blurModal();
  addModal(a);

  wrapperArray.length > 1 && resetModalIndex();
  displayModal(wrapper);

  isHideScrollbar();
  a.scrollTop = wrapper.scrollTop;
  a.scrollLeft = wrapper.scrollLeft;
  if (wrapperArray.length === 1) {
    animation && startAnimation(window.CocoMask, "fade", true);
  }
  if (inputAttrs) {
    a.inputValue = a.inputEl.value || "";
  }
  fullScreen && fullScreenModal(a);

  paddingBottom(modal, modalContent);
  positionCenter(a);
  animation && isOrigin(a, modal);
  animation && startAnimation(modal, "zoom", true);
  notMount && onMount && onMount(a);
  a.notMount = false;
  hooks && hooks.open && hooks.open(a);
  isFocusEl(modal);
  a.rafTimerOpen = rafTimeout(() => {
    clearClass(modal, "zoom", true);
    clearClass(window.CocoMask, "fade", true);
    hooks && hooks.opened && hooks.opened(a);
  }, duration);
}

function clearOpen(a) {
  cancelRaf(a.rafTimerOpen);
  clearClass(a.modal, "zoom", true);
  clearClass(window.CocoMask, "fade", true);
}

function closeModal(a) {
  let { wrapper, modal, isOpen, destroy, div, animation, args, hooks, $el } = a;

  if (!wrapper) {
    return;
  }
  let duration = isAnimation(animation) ? 280 : 0;
  isOpen && clearOpen(a);

  a.isOpen = false;
  addClass(wrapper, "coco-p-e-n");
  deleteArrayItems(a, wrapperArray);

  animation && startAnimation(modal, "zoom");
  if (!wrapperArray.length) {
    animation && startAnimation(window.CocoMask, "fade");
  }

  hooks && hooks.close && hooks.close(a);
  a.rafTimerClose = rafTimeout(() => {
    $el && a.$emit("input", false);
    a.notChange = true;
    wrapperArray.length > 0 && resetModalIndex();
    clearClass(modal, "zoom");
    clearClass(window.CocoMask, "fade");
    if (!wrapperArray.length) {
      if (destroy) {
        body.contains(window.CocoMask) && removeChildNode(window.CocoMask);
        window.CocoMask = null;
      } else {
        css(window.CocoMask, {
          display: "none",
        });
      }
      deleteBodyStyle();
    }
    cocoFocusEl && cocoFocusEl.focus();
    hooks && hooks.closed && hooks.closed(a);
    if (destroy && !$el) {
      body.contains(div) && removeChildNode(div);
      deleteArrayItems(
        {
          a,
          args,
        },
        CocoArgsArray,
        true
      );
      for (const key in a) {
        if (a.hasOwnProperty(key)) {
          a[key] = null;
          delete a[key];
        }
      }
      a = null;
    } else {
      css(wrapper, {
        display: "none",
      });
    }
  }, duration);
}

function clearClose(a) {
  let { modal, destroy, $el, args, div } = a;
  if (!window.CocoMask) {
    return;
  }
  cancelRaf(a.rafTimerClose);
  wrapperArray.length > 0 && resetModalIndex();
  clearClass(modal, "zoom");
  clearClass(window.CocoMask, "fade");
  if (!wrapperArray.length) {
    if (destroy) {
      body.contains(window.CocoMask) && removeChildNode(window.CocoMask);
      window.CocoMask = null;
    } else {
      css(window.CocoMask, {
        display: "none",
      });
    }
    deleteBodyStyle();
  }

  cocoFocusEl && cocoFocusEl.focus();

  if (destroy && !$el) {
    body.contains(div) && removeChildNode(div);
    deleteArrayItems(
      {
        a,
        args,
      },
      CocoArgsArray,
      true
    );
    for (const key in a) {
      if (a.hasOwnProperty(key)) {
        a[key] = null;
        delete a[key];
      }
    }
    a = null;
  }
}
function paddingBottom(modal, modalContent) {
  let needPaddingBottom =
    modalContent.offsetHeight + modalContent.offsetTop >
    window.CocoMask.offsetHeight;
  if (needPaddingBottom) {
    css(modal, {
      paddingBottom: "30px",
    });
  }
}

function isFocusEl(modal) {
  if (
    modal.offsetHeight <= window.CocoMask.offsetHeight &&
    modal.offsetWidth <= window.CocoMask.offsetWidth
  ) {
    focusEl();
  }
}

function deleteArrayItems(item, arr, args) {
  let i = 0;
  if (args) {
    arr.forEach((it, index) => {
      if (it.a === item.a) {
        i = index;
        arr.splice(i, 1);
      }
    });
  } else {
    arr.forEach((it, index) => {
      if (it === item) {
        i = index;
        arr.splice(i, 1);
      }
    });
  }
  return i;
}

function setTransformOrigin(node, value) {
  let style = node.style;
  value = value ? value : "";
  ["t", "webkitT", "MozT", "msT", "OT"].forEach(function (prefix) {
    if (prefix + "ransformOrigin" in style)
      style[prefix + "ransformOrigin"] = value;
  });
}

function pos(el) {
  let rect = el.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
  };
}

function isOrigin(a, modal) {
  let isClick = nowTime() - clickTime < 120;
  let notKeyDown = Math.abs(clickTime - keyDownTime) >= 60;
  if (isClick && notKeyDown) {
    let { left, top } = pos(modal);
    let x = MousePos.x - left;
    let y = MousePos.y - top;
    let origin = x + "px " + y + "px";
    a.originX = x;
    a.originY = y;
    setTransformOrigin(modal, origin);
  } else {
    setTransformOrigin(modal);
  }
}

function positionCenter({ top, modal, fullScreen }) {
  if (top === "center") {
    let windowHeight = window.CocoMask.offsetHeight;

    top = (windowHeight - modal.offsetHeight) / 2;
    top = top >= 30 ? top : 30;
    top += "px";
    css(modal, {
      marginTop: top,
    });
  } else {
    !fullScreen &&
      css(modal, {
        marginTop: top,
      });
  }
}

function fullScreenModal({ bodyEl, headerEl, footerEl, modal, modalContent }) {
  let height = 0;
  css(modal, {
    width: "100%",
    height: "100%",

    marginTop: "0px",
    padding: 0,
  });
  css(modalContent, {
    borderRadius: 0,
  });
  height =
    window.CocoMask.offsetHeight -
    (headerEl ? headerEl.offsetHeight : 0) -
    (footerEl ? footerEl.offsetHeight : 0) -
    1 +
    "px";
  css(bodyEl, {
    height,
  });
}

function focusEl() {
  let l = wrapperArray.length;
  if (!l) return;
  let a = wrapperArray[l - 1];
  if (a.inputAttrs) {
    a.autoFocusInput && a.inputEl && a.inputEl.focus();
  } else {
    a.autoFocusOkButton && a.okButtonEl && a.okButtonEl.focus();
  }
}

function resetModalIndex() {
  let a;
  wrapperArray.forEach((md, index) => {
    a = md;
    md = md.wrapper;

    if (index === wrapperArray.length - 1) {
      css(md, {
        zIndex: a.zIndexOfActiveModal,
      });
    } else {
      css(md, {
        zIndex: a.zIndexOfModal,
      });
    }
  });
}

const createModalEl = (a) => {
  let el = r(
    {
      class: "coco-modal-wrapper",
      role: "dialog-wrapper",
      tabindex: "-1",

      "@click"(e) {
        if (a.notMouseUp === 2 && a.maskClose && e.target === el) {
          beforeClose(a, "mask");
        }
        a.notMouseUp = 0;
      },
      "@mousedown"(e) {
        a.notMouseUp = 0;
        if (a.maskClose && e.target === el) {
          a.notMouseUp++;
        }
      },
      "@mouseup"(e) {
        if (a.maskClose && e.target === el) {
          a.notMouseUp++;
        }
      },
      is: [a, "wrapper"],
    },
    [
      r(
        {
          class: "coco-modal",
          role: "dialog",
          is: [a, "modal"],
        },
        [
          r(
            {
              class: "coco-modal-content",
              is: [a, "modalContent"],
            },
            [
              r({
                class: "coco-modal-close",
                "@click"() {
                  beforeClose(a, "closeButton");
                },
                is: [a, "closeButtonEl"],
              }),
              r(
                {
                  class: "coco-modal-header",
                  is: [a, "headerEl"],
                },
                [
                  r(
                    {
                      class: "coco-modal-title",
                      is: [a, "titleEl"],
                    },
                    [
                      r({
                        el: "span",
                        is: [a, "titleSpan"],
                      }),
                    ]
                  ),
                ]
              ),
              r(
                {
                  class: "coco-modal-body",
                  is: [a, "bodyEl"],
                },
                [
                  r({
                    el: "span",
                    is: [a, "textEl"],
                  }),
                  r({
                    is: [a, "htmlEl"],
                  }),
                  r(
                    {
                      class: "coco-input-wrapper",
                      is: [a, "inputWrapper"],
                    },
                    [
                      r({}, [
                        r({
                          el: "input",
                          class: "coco-input",
                          is: [a, "inputEl"],
                        }),
                      ]),
                    ]
                  ),
                  r({}, [
                    r({
                      class: "",
                      is: [a, "domEl"],
                    }),
                  ]),
                  r({}, [
                    r({
                      class: "coco-error-text",
                      is: [a, "errorEl"],
                    }),
                  ]),
                ]
              ),
              r(
                {
                  class: "coco-modal-footer",
                  is: [a, "footerEl"],
                },
                [
                  r(
                    {
                      el: "button",
                      class: "coco-btn cancel",
                      is: [a, "cancelButtonEl"],
                    },
                    [
                      r({
                        el: "span",
                        is: [a, "cancelButtonSpan"],
                      }),
                    ]
                  ),
                  r(
                    {
                      el: "button",
                      class: "coco-btn ok",
                      is: [a, "okButtonEl"],
                    },
                    [
                      r({
                        el: "span",
                        class: "coco-loading",
                        style: "display:none",
                        is: [a, "loadingEl"],
                      }),
                      r({
                        el: "span",
                        is: [a, "okButtonSpan"],
                      }),
                    ]
                  ),
                ]
              ),
            ]
          ),
        ]
      ),
    ]
  );
};

function needRender(a) {
  let {
    headerEl,
    footerEl,
    inputWrapper,
    htmlEl,
    html,
    okButtonEl,
    cancelButtonEl,
    okButton,
    cancelButton,
    header,
    footer,
    inputAttrs,
    closeButton,
    closeButtonEl,
    el,
    domEl,
  } = a;

  !el && removeChildNode(domEl);
  !header && removeChildNode(headerEl);
  !footer && removeChildNode(footerEl);
  !inputAttrs && removeChildNode(inputWrapper);
  !okButton && removeChildNode(okButtonEl);
  !cancelButton && removeChildNode(cancelButtonEl);
  !closeButton && removeChildNode(closeButtonEl);
  !html && removeChildNode(htmlEl);
}

function removeChildNode(el) {
  el.parentNode.removeChild(el);
}

function initModalData(a) {
  let {
    modal,
    okButtonSpan,
    cancelButtonSpan,
    okText,
    cancelText,
    textEl,
    text,
    htmlEl,
    html,
    title,
    titleSpan,
    borderRadius,
    okButtonEl,
    buttonColor,
    top,
    width,
    errorEl,
  } = a;

  css(modal, {
    marginTop: top,
    width,
    borderRadius,
  });
  css(okButtonEl, {
    backgroundColor: buttonColor,
  });

  a.errorText = "";
  a.setErrorText = (text) => {
    errorEl.innerText = text;
    a.errorText = text;
  };
  titleSpan.innerText = title;
  textEl.innerText = text;
  htmlEl.innerHTML = html;
  okButtonSpan.innerText = okText;
  cancelButtonSpan.innerText = cancelText;
}

function initInput(a) {
  let { inputEl, inputAttrs } = a;
  for (const key in inputAttrs) {
    if (inputAttrs.hasOwnProperty(key)) {
      const el = inputAttrs[key];
      inputEl.setAttribute(key, el);
    }
  }
  addEvent(inputEl, "input", (e) => {
    a.inputValue = e.target.value;
  });
  addEvent(inputEl, "keyup", (e) => {
    if (e.code === "Enter") {
      beforeClose(a, "ok");
    }
  });
}

function initArgs(a) {
  if (w.CocoConfig) {
    for (const key in initOptions) {
      if (w.CocoConfig[key] !== undefined) {
        initOptions[key] = w.CocoConfig[key];
      }
    }
  }
  for (const key in initOptions) {
    if (initOptions.hasOwnProperty(key)) {
      if (a[key] === undefined) {
        a[key] = initOptions[key];
      }
    }
  }
}

let CocoArgsArray = [];

function isObjectEqual(a, b) {
  let equal = true;
  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }

  for (const key in a) {
    if (typeof a[key] === "object" && typeof b[key] === "object") {
      equal = isObjectEqual(a[key], b[key]);
      if (!equal) {
        return false;
      }
    } else if (typeof a[key] === "function" && typeof b[key] === "function") {
      if (a[key].toString() != b[key].toString()) {
        return false;
      }
    } else if (a[key] != b[key]) {
      return false;
    }
  }
  return equal;
}

function coco(text = "", title, args = {}) {
  let a = {};
  let al = arguments.length;
  if (typeof text === "object") {
    args = text;
  } else {
    text = text.toString();
    if (typeof title === "string") {
      args.title = title;
    } else if (typeof title === "object") {
      args = title;
    }

    args.text = text;
  }
  if (arguments.length > 1 && arguments[al - 1] === "alert") {
    args.cancelButton = false;
    args.maskClose = false;
    args.closeButton = false;
  } else if (arguments.length > 1 && arguments[al - 1] === "confirm") {
    args.maskClose = false;
    args.closeButton = false;
  }
  a = args;
  args = Object.assign({}, args);

  for (let i = 0; i < CocoArgsArray.length; i++) {
    if (isObjectEqual(args, CocoArgsArray[i].args)) {
      CocoArgsArray[i].a.openModal();
      return CocoArgsArray[i].a;
    }
  }
  CocoArgsArray.push({
    args,
    a,
  });
  a.args = args;
  a.isLoading = false;
  a.notMount = true;
  a.isOpen = true;
  a.scrollbarWidth = scrollbarWidth;
  initArgs(a);

  a.close = function (type) {
    type = type ? type : "closeFunction";
    beforeClose(a, type);
  };
  a.openModal = function () {
    showModal(a);
  };
  a.onClose = function (fn) {
    a.beforeCloseFn = fn;
    return a;
  };
  a.destroyModal = function () {
    a.destroy = true;
  };
  createModalEl(a);
  initModal(a);

  addEvent(a.okButtonEl, "click", () => {
    beforeClose(a, "ok");
  });
  addEvent(a.okButtonEl, "keypress", (e) => {
    e.preventDefault();
  });

  addEvent(a.cancelButtonEl, "click", () => {
    beforeClose(a, "cancel");
  });
  a.showLoading = function () {
    a.isLoading = true;
    addClass(a.okButtonEl, "coco-is-loading");
    if (a.loadingEl) a.loadingEl.style.display = "inline-block";
  };
  a.hideLoading = function () {
    a.isLoading = false;
    removeClass(a.okButtonEl, "coco-is-loading");
    if (a.loadingEl) a.loadingEl.style.display = "none";
  };
  return a;
}

coco.alert = function (text, title, args) {
  return coco(text, title, args, "alert");
};
coco.confirm = function (text, title, args) {
  return coco(text, title, args, "confirm");
};

doc = w.document;
body = doc.body;
docEl = doc.documentElement;

scrollbarWidth = getBarWidth();

addSomeEvents();

function beforeCloseVue(a, way) {
  let isOk = way === "ok";
  a.closeType = way;
  let aa = Object.assign({}, a);
  if ((a.isLoading && way === "ok") || (way === "mask" && !a.maskClose)) {
    return;
  }
  if (a.onClose) {
    if (a.onClose.length < 2) {
      a.onClose(isOk);
      closeModal(a, true);
    } else if (a.onClose.length === 2) {
      a.onClose(isOk, aa);
      closeModal(a, true);
    } else {
      a.onClose(isOk, aa, () => {
        closeModal(a, true);
      });
    }
  } else {
    closeModal(a, true);
  }
}

export default {
  name: "CocoModal",

  props,

  data() {
    return {
      isOpen: false,
      openTime: 0,
      scrollTop: 0,
      inputEl: null,
      closeType: "",
      isLoading: false,
      inputValue: "",
      errorText: "",
      isInit: false,
      notMount: true,
      isClosed: true,
      visible: false,
      notChange: false,
    };
  },

  watch: {
    value(val) {
      this.visible = val;
    },
    visible(val) {
      if (this.notChange) {
        this.notChange = false;
        return;
      }
      if (val) {
        this.showModal();
      } else {
        this.isLoading = false;
        beforeCloseVue(this, "visibleChange");
      }
    },
  },

  methods: {
    showModal() {
      let a = this;
      if (!a.isInit) {
        for (const key in a.$refs) {
          a[key] = a.$refs[key];
        }
        let { inputAttrs, inputEl } = a;
        for (const key in inputAttrs) {
          if (inputAttrs.hasOwnProperty(key)) {
            const el = inputAttrs[key];
            inputEl.setAttribute(key, el);
          }
        }
        !wrapperArray.length && showMask(a);
        a.isInit = true;
      }

      showModal(a);
    },
    setErrorText(text) {
      this.errorText = text;
    },

    showLoading() {
      this.isLoading = true;
    },
    hideLoading() {
      this.isLoading = false;
    },
    beforeCloseFn(way) {
      beforeCloseVue(this, way);
    },
    scrollModal() {
      let a = this;
      let { wrapper, modal } = a;
      scrollOrigin(a, wrapper, modal);
    },
    close(type) {
      type = type ? type : "closeFunction";
      beforeCloseVue(this, type);
    },
  },

  mounted() {
    if (this.value) {
      this.showModal();
    }
  },
  coco() {
    return coco;
  },
};
</script>
<style >
@-webkit-keyframes coco-loading {
  0% {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes coco-loading {
  0% {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@-webkit-keyframes cocoFadeIn {
  0% {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes cocoFadeIn {
  0% {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@-webkit-keyframes cocoFadeOut {
  0% {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@keyframes cocoFadeOut {
  0% {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@-webkit-keyframes cocoZoomIn {
  0% {
    transform: scale3d(0.25, 0.25, 0.25);
    opacity: 0;
  }
  to {
    transform: scale3d(1, 1, 1);
    opacity: 1;
  }
}
@keyframes cocoZoomIn {
  0% {
    transform: scale3d(0.25, 0.25, 0.25);
    opacity: 0;
  }
  to {
    transform: scale3d(1, 1, 1);
    opacity: 1;
  }
}
@-webkit-keyframes cocoZoomOut {
  0% {
    transform: scale3d(1, 1, 1);
    opacity: 1;
  }
  to {
    transform: scale3d(0, 0, 0);
    opacity: 0;
  }
}
@keyframes cocoZoomOut {
  0% {
    transform: scale3d(1, 1, 1);
    opacity: 1;
  }
  to {
    transform: scale3d(0, 0, 0);
    opacity: 0;
  }
}
[class|="coco"],
[class|="coco"]::after,
[class|="coco"]::before {
  box-sizing: border-box;
  outline: 0;
}
.coco-modal-mask,
.coco-modal-wrapper {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
.coco-modal-wrapper {
  right: 0;
  bottom: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  z-index: 2020;
}
.coco-modal-mask {
  background-color: rgba(2, 2, 1, 0.425);
  z-index: 2008;
}
.coco-modal-mask.blur {
  background-color: rgba(2, 2, 1, 0.5);
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
}
.coco-modal {
  position: relative;
  margin: 0 auto;
  margin-top: 15vh;
  width: 500px;
  transform: translateZ(0);
  line-height: 1.66667;
  list-style: none;
  font-size: 14px;
}
.coco-modal-content {
  border-radius: 6px;
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.08), 0 0 5px 0 rgba(0, 0, 0, 0.08),
    0 1px 3px 0 rgba(0, 0, 0, 0.1);
  background-color: #fff;
}
.coco-modal-content.coco-no-shadow {
  box-shadow: none;
}
.fade-enter,
.fade-leave {
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-play-state: paused;
  animation-play-state: paused;
  -webkit-animation-timing-function: linear;
  animation-timing-function: linear;
  -webkit-animation-duration: 0.14s;
  animation-duration: 0.14s;
  transition: none;
  pointer-events: none;
  transform: translateZ(0);
  will-change: opacity;
}
.fade-enter {
  opacity: 0;
}
.fade-leave {
  -webkit-animation-delay: 0.08s;
  animation-delay: 0.08s;
}
.fade-enter.fade-enter-active {
  -webkit-animation-name: cocoFadeIn;
  animation-name: cocoFadeIn;
  -webkit-animation-play-state: running;
  animation-play-state: running;
}
.fade-leave.fade-leave-active,
.zoom-enter.zoom-enter-active,
.zoom-leave.zoom-leave-active {
  -webkit-animation-name: cocoFadeOut;
  animation-name: cocoFadeOut;
  -webkit-animation-play-state: running;
  animation-play-state: running;
}
.zoom-enter {
  -webkit-animation-duration: 0.3s;
  animation-duration: 0.3s;
}
.zoom-enter,
.zoom-leave {
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-play-state: paused;
  animation-play-state: paused;
  transition: none;
  pointer-events: none;
  transform: translateZ(0);
  will-change: opacity, transform;
}
.zoom-enter {
  -webkit-animation-delay: 0.08s;
  animation-delay: 0.08s;
  opacity: 0;
  -webkit-animation-timing-function: cubic-bezier(0.08, 0.8, 0.18, 1);
  animation-timing-function: cubic-bezier(0.08, 0.8, 0.18, 1);
}
.zoom-enter.zoom-enter-active,
.zoom-leave.zoom-leave-active {
  -webkit-animation-name: cocoZoomIn;
  animation-name: cocoZoomIn;
}
.zoom-leave {
  -webkit-animation-duration: 0.28s;
  animation-duration: 0.28s;
  -webkit-animation-timing-function: cubic-bezier(0.52, 0.3, 0.06, 1);
  animation-timing-function: cubic-bezier(0.52, 0.3, 0.06, 1);
}
.zoom-leave.zoom-leave-active {
  -webkit-animation-name: cocoZoomOut;
  animation-name: cocoZoomOut;
}

.coco-modal-close {
  position: absolute;
  width: 30px;
  height: 30px;
  right: 12px;
  top: 15px;
  z-index: 1;
  cursor: pointer;
}

.coco-modal-close::after,
.coco-modal-close::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) rotate(-45deg) scale(1);
  width: 2px;
  height: 13px;
  background-color: #afb0b6;
  transition: all 0.15s ease-out;
  display: block;
  border-radius: 2px;
}
.coco-modal-close::after {
  transform: translate(-50%, -50%) rotate(45deg) scale(1);
}

.coco-modal-body,
.coco-modal-header {
  position: relative;
  font-size: 18px;
  color: #111;
  text-align: left;
}
.coco-modal-body {
  padding: 16px 18px;
  font-size: 14px;
  color: #616469;
  overflow: auto;
}
.coco-modal-header {
  padding: 15px 18px;
}
.coco-modal-header::before {
  content: "";
  display: inline-block;
  vertical-align: middle;
  height: 100%;
}
.coco-modal-title {
  position: relative;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
  width: 100%;
  display: inline-block;
}
.coco-modal-footer {
  position: relative;
  text-align: right;
  padding: 15px 18px;
}
.coco-btn {
  font-size: 14px;
  text-decoration: none;
  padding: 6px 21px;
  white-space: nowrap;
  border-radius: 6px;
  font-weight: 500;
  display: inline-block;
  cursor: pointer;
  border: 0;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  line-height: normal;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.coco-btn.cancel {
  color: #525456;
  background-color: transparent;
}

.coco-btn,
.coco-btn span,
.coco-loading {
  position: relative;
}
.coco-btn.ok {
  margin-left: 10px;
  background-color: #0077ff;
  color: #fefeff;
}

.coco-btn.ok::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  transition: all 0.12s ease-out;
  background-color: transparent;
}

.coco-btn.ok:hover::before {
  background-color: rgba(255, 255, 255, 0.08);
}
.coco-btn.ok:active::before {
  transition: all 0.08s ease-out;
  background-color: rgba(0, 0, 0, 0.2);
}
.coco-btn.ok.coco-is-loading::before {
  background-color: transparent;
}
.coco-loading {
  width: 14px;
  height: 14px;
  border: 2px solid #fff;
  border-top: 2px solid transparent;
  border-radius: 7px;
  margin-right: 7px;
  display: none;
  -webkit-animation: coco-loading 1s linear infinite;
  animation: coco-loading 1s linear infinite;
}
.coco-is-loading {
  cursor: not-allowed;
}
.coco-hidden {
  visibility: hidden;
}

.coco-input {
  margin: 14px 0;
  width: 100%;
  height: 38px;
  border-radius: 6px;
  padding: 6px 15px;
  font-weight: 400;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  color: #212122;
  background-color: #f3f3f3;
  border: 1px solid transparent;
  font-size: 14px;
  box-shadow: 0 0 0 0 rgba(88, 161, 245, 0.2);
  line-height: normal;
  transition: all 0.1s ease-out;
}
.coco-input::-webkit-input-placeholder {
  line-height: 24px;
  color: #a2a2a3;
}
.coco-input::-moz-placeholder {
  line-height: 24px;
  color: #a2a2a3;
}
.coco-input:-ms-input-placeholder,
.coco-input::-ms-input-placeholder {
  line-height: 24px;
  color: #a2a2a3;
}
.coco-input::-webkit-input-placeholder {
  line-height: 24px;
  color: #a2a2a3;
}
.coco-input::-moz-placeholder {
  line-height: 24px;
  color: #a2a2a3;
}
.coco-input:-ms-input-placeholder {
  line-height: 24px;
  color: #a2a2a3;
}
.coco-input::-ms-input-placeholder {
  line-height: 24px;
  color: #a2a2a3;
}
.coco-input::placeholder {
  line-height: 24px;
  color: #a2a2a3;
}
.coco-input:hover {
  background-color: #efefef;
}
.coco-input:focus {
  transition: all 0.2s ease;
  background-color: #fff;
  box-shadow: 0 0 0 2px rgba(88, 161, 245, 0.2);
  border-color: rgba(66, 133, 255, 0.5);
}
.coco-input:active {
  transition: all 0.1s ease;
  background-color: #fff;
  border-color: #cecece;
  box-shadow: 0 0 0 0 rgba(88, 161, 245, 0.2);
}
.coco-error-text {
  font-size: 14px;
  color: #ea1e63;
  margin: 5px 10px;
}
.coco-p-e-n {
  pointer-events: none;
}
</style>