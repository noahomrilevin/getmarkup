(() => {
  // node_modules/css-selector-generator/esm/utilities-iselement.js
  function isElement(input) {
    return typeof input === "object" && input !== null && input.nodeType === Node.ELEMENT_NODE;
  }

  // node_modules/css-selector-generator/esm/types.js
  var OPERATOR = {
    NONE: "",
    DESCENDANT: " ",
    CHILD: " > "
  };
  var CSS_SELECTOR_TYPE = {
    id: "id",
    class: "class",
    tag: "tag",
    attribute: "attribute",
    nthchild: "nthchild",
    nthoftype: "nthoftype"
  };

  // node_modules/css-selector-generator/esm/utilities-typescript.js
  function isEnumValue(haystack, needle) {
    return Object.values(haystack).includes(needle);
  }

  // node_modules/css-selector-generator/esm/utilities-messages.js
  var libraryName = "CssSelectorGenerator";
  function showWarning(id = "unknown problem", ...args) {
    console.warn(`${libraryName}: ${id}`, ...args);
  }

  // node_modules/css-selector-generator/esm/utilities-options.js
  var DEFAULT_OPTIONS = {
    selectors: [
      CSS_SELECTOR_TYPE.id,
      CSS_SELECTOR_TYPE.class,
      CSS_SELECTOR_TYPE.tag,
      CSS_SELECTOR_TYPE.attribute
    ],
    // if set to true, always include tag name
    includeTag: false,
    whitelist: [],
    blacklist: [],
    combineWithinSelector: true,
    combineBetweenSelectors: true,
    root: null,
    maxCombinations: Number.POSITIVE_INFINITY,
    maxCandidates: Number.POSITIVE_INFINITY,
    useScope: false
  };
  function sanitizeBoolean(input) {
    return !!input;
  }
  function sanitizeSelectorTypes(input) {
    if (!Array.isArray(input)) {
      return [];
    }
    return input.filter((item) => isEnumValue(CSS_SELECTOR_TYPE, item));
  }
  function isRegExp(input) {
    return input instanceof RegExp;
  }
  function isCssSelectorMatch(input) {
    return ["string", "function"].includes(typeof input) || isRegExp(input);
  }
  function sanitizeCssSelectorMatchList(input) {
    if (!Array.isArray(input)) {
      return [];
    }
    return input.filter(isCssSelectorMatch);
  }
  function isNode(input) {
    return input instanceof Node;
  }
  function isParentNode(input) {
    const validParentNodeTypes = [
      Node.DOCUMENT_NODE,
      Node.DOCUMENT_FRAGMENT_NODE,
      // this includes Shadow DOM root
      Node.ELEMENT_NODE
    ];
    return isNode(input) && validParentNodeTypes.includes(input.nodeType);
  }
  function sanitizeRoot(input, element) {
    if (isParentNode(input)) {
      if (!input.contains(element)) {
        showWarning("element root mismatch", "Provided root does not contain the element. This will most likely result in producing a fallback selector using element's real root node. If you plan to use the selector using provided root (e.g. `root.querySelector`), it will not work as intended.");
      }
      return input;
    }
    const rootNode = element.getRootNode({ composed: false });
    if (isParentNode(rootNode)) {
      if (rootNode !== document) {
        showWarning("shadow root inferred", "You did not provide a root and the element is a child of Shadow DOM. This will produce a selector using ShadowRoot as a root. If you plan to use the selector using document as a root (e.g. `document.querySelector`), it will not work as intended.");
      }
      return rootNode;
    }
    return getRootNode(element);
  }
  function sanitizeMaxNumber(input) {
    return typeof input === "number" ? input : Number.POSITIVE_INFINITY;
  }
  function sanitizeOptions(element, custom_options = {}) {
    const options = Object.assign(Object.assign({}, DEFAULT_OPTIONS), custom_options);
    return {
      selectors: sanitizeSelectorTypes(options.selectors),
      whitelist: sanitizeCssSelectorMatchList(options.whitelist),
      blacklist: sanitizeCssSelectorMatchList(options.blacklist),
      root: sanitizeRoot(options.root, element),
      combineWithinSelector: sanitizeBoolean(options.combineWithinSelector),
      combineBetweenSelectors: sanitizeBoolean(options.combineBetweenSelectors),
      includeTag: sanitizeBoolean(options.includeTag),
      maxCombinations: sanitizeMaxNumber(options.maxCombinations),
      maxCandidates: sanitizeMaxNumber(options.maxCandidates),
      useScope: sanitizeBoolean(options.useScope),
      maxResults: sanitizeMaxNumber(options.maxResults)
    };
  }

  // node_modules/css-selector-generator/esm/utilities-data.js
  function getIntersection(items = []) {
    const [firstItem = [], ...otherItems] = items;
    if (otherItems.length === 0) {
      return firstItem;
    }
    return otherItems.reduce((accumulator, currentValue) => {
      return accumulator.filter((item) => currentValue.includes(item));
    }, firstItem);
  }
  function flattenArray(input) {
    return [].concat(...input);
  }
  function wildcardToRegExp(input) {
    return input.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replace(/\*/g, ".+");
  }
  function createPatternMatcher(list) {
    const matchFunctions = list.map((item) => {
      if (isRegExp(item)) {
        return (input) => item.test(input);
      }
      if (typeof item === "function") {
        return (input) => {
          const result = item(input);
          if (typeof result !== "boolean") {
            showWarning("pattern matcher function invalid", "Provided pattern matching function does not return boolean. It's result will be ignored.", item);
            return false;
          }
          return result;
        };
      }
      if (typeof item === "string") {
        const re = new RegExp("^" + wildcardToRegExp(item) + "$");
        return (input) => re.test(input);
      }
      showWarning("pattern matcher invalid", "Pattern matching only accepts strings, regular expressions and/or functions. This item is invalid and will be ignored.", item);
      return () => false;
    });
    return (input) => matchFunctions.some((matchFunction) => matchFunction(input));
  }

  // node_modules/css-selector-generator/esm/utilities-dom.js
  function testSelector(elements, selector, root) {
    const result = Array.from(sanitizeRoot(root, elements[0]).querySelectorAll(selector));
    return result.length === elements.length && elements.every((element) => result.includes(element));
  }
  function getElementParents(element, root) {
    root = root !== null && root !== void 0 ? root : getRootNode(element);
    const result = [];
    let parent = element;
    while (parent && parent !== root) {
      if (isElement(parent)) {
        result.push(parent);
      }
      parent = parent.parentNode;
    }
    return result;
  }
  function getParents(elements, root) {
    return getIntersection(elements.map((element) => getElementParents(element, root)));
  }
  function getRootNode(element) {
    return element.ownerDocument.querySelector(":root");
  }

  // node_modules/css-selector-generator/esm/constants.js
  var SELECTOR_SEPARATOR = ", ";
  var INVALID_ID_RE = new RegExp([
    "^$",
    // empty or not set
    "\\s"
    // contains whitespace
  ].join("|"));
  var INVALID_CLASS_RE = new RegExp([
    "^$"
    // empty or not set
  ].join("|"));
  var SELECTOR_PATTERN = [
    CSS_SELECTOR_TYPE.nthoftype,
    CSS_SELECTOR_TYPE.tag,
    CSS_SELECTOR_TYPE.id,
    CSS_SELECTOR_TYPE.class,
    CSS_SELECTOR_TYPE.attribute,
    CSS_SELECTOR_TYPE.nthchild
  ];

  // node_modules/css-selector-generator/esm/selector-attribute.js
  var attributeBlacklistMatch = createPatternMatcher([
    "class",
    "id",
    // Angular attributes
    "ng-*"
  ]);
  function attributeNodeToSimplifiedSelector({ name }) {
    return `[${name}]`;
  }
  function attributeNodeToSelector({ name, value }) {
    return `[${name}='${value}']`;
  }
  function isValidAttributeNode({ nodeName, nodeValue }, element) {
    const tagName = element.tagName.toLowerCase();
    if (["input", "option"].includes(tagName) && nodeName === "value") {
      return false;
    }
    if (nodeName === "src" && (nodeValue === null || nodeValue === void 0 ? void 0 : nodeValue.startsWith("data:"))) {
      return false;
    }
    return !attributeBlacklistMatch(nodeName);
  }
  function sanitizeAttributeData({ nodeName, nodeValue }) {
    return {
      name: sanitizeSelectorItem(nodeName),
      value: sanitizeSelectorItem(nodeValue !== null && nodeValue !== void 0 ? nodeValue : void 0)
    };
  }
  function getElementAttributeSelectors(element) {
    const validAttributes = Array.from(element.attributes).filter((attributeNode) => isValidAttributeNode(attributeNode, element)).map(sanitizeAttributeData);
    return [
      ...validAttributes.map(attributeNodeToSimplifiedSelector),
      ...validAttributes.map(attributeNodeToSelector)
    ];
  }
  function getAttributeSelectors(elements) {
    const elementSelectors = elements.map(getElementAttributeSelectors);
    return getIntersection(elementSelectors);
  }

  // node_modules/css-selector-generator/esm/selector-class.js
  function getElementClassSelectors(element) {
    var _a;
    return ((_a = element.getAttribute("class")) !== null && _a !== void 0 ? _a : "").trim().split(/\s+/).filter((item) => !INVALID_CLASS_RE.test(item)).map((item) => `.${sanitizeSelectorItem(item)}`);
  }
  function getClassSelectors(elements) {
    const elementSelectors = elements.map(getElementClassSelectors);
    return getIntersection(elementSelectors);
  }

  // node_modules/css-selector-generator/esm/selector-id.js
  function getElementIdSelectors(element) {
    var _a;
    const id = (_a = element.getAttribute("id")) !== null && _a !== void 0 ? _a : "";
    const selector = `#${sanitizeSelectorItem(id)}`;
    const rootNode = element.getRootNode({ composed: false });
    return !INVALID_ID_RE.test(id) && testSelector([element], selector, rootNode) ? [selector] : [];
  }
  function getIdSelector(elements) {
    return elements.length === 0 || elements.length > 1 ? [] : getElementIdSelectors(elements[0]);
  }

  // node_modules/css-selector-generator/esm/selector-nth-child.js
  function getElementNthChildSelector(element) {
    const parent = element.parentNode;
    const siblings = parent && "children" in parent ? parent.children : null;
    if (siblings) {
      for (let i = 0; i < siblings.length; i++) {
        if (siblings[i] === element) {
          return [`:nth-child(${String(i + 1)})`];
        }
      }
    }
    return [];
  }
  function getNthChildSelector(elements) {
    return getIntersection(elements.map(getElementNthChildSelector));
  }

  // node_modules/css-selector-generator/esm/selector-tag.js
  function getElementTagSelectors(element) {
    return [
      sanitizeSelectorItem(element.tagName.toLowerCase())
    ];
  }
  function getTagSelector(elements) {
    const selectors = [
      ...new Set(flattenArray(elements.map(getElementTagSelectors)))
    ];
    return selectors.length === 0 || selectors.length > 1 ? [] : [selectors[0]];
  }

  // node_modules/css-selector-generator/esm/selector-nth-of-type.js
  function getElementNthOfTypeSelector(element) {
    const tag = getTagSelector([element])[0];
    const parent = element.parentNode;
    const parentElement = parent && "children" in parent ? parent : null;
    if (parentElement) {
      const siblings = Array.from(parentElement.children).filter((element2) => element2.tagName.toLowerCase() === tag);
      const elementIndex = siblings.indexOf(element);
      if (elementIndex > -1) {
        return [
          `${tag}:nth-of-type(${String(elementIndex + 1)})`
        ];
      }
    }
    return [];
  }
  function getNthOfTypeSelector(elements) {
    return getIntersection(elements.map(getElementNthOfTypeSelector));
  }

  // node_modules/css-selector-generator/esm/utilities-powerset.js
  function* powerSetGenerator(input = [], { maxResults = Number.POSITIVE_INFINITY } = {}) {
    let resultCounter = 0;
    let offsets = generateOffsets(1);
    while (offsets.length <= input.length && resultCounter < maxResults) {
      resultCounter += 1;
      const result = offsets.map((offset) => input[offset]);
      yield result;
      offsets = bumpOffsets(offsets, input.length - 1);
    }
  }
  function getPowerSet(input = [], { maxResults = Number.POSITIVE_INFINITY } = {}) {
    return Array.from(powerSetGenerator(input, { maxResults }));
  }
  function bumpOffsets(offsets = [], maxValue = 0) {
    const size = offsets.length;
    if (size === 0) {
      return [];
    }
    const result = [...offsets];
    result[size - 1] += 1;
    for (let index = size - 1; index >= 0; index--) {
      if (result[index] > maxValue) {
        if (index === 0) {
          return generateOffsets(size + 1);
        } else {
          result[index - 1]++;
          result[index] = result[index - 1] + 1;
        }
      }
    }
    if (result[size - 1] > maxValue) {
      return generateOffsets(size + 1);
    }
    return result;
  }
  function generateOffsets(size = 1) {
    return Array.from(Array(size).keys());
  }

  // node_modules/css-selector-generator/esm/utilities-cartesian.js
  function* cartesianProductGenerator(input = {}) {
    const entries = Object.entries(input);
    if (entries.length === 0)
      return;
    const stack = [
      { index: entries.length - 1, partial: {} }
    ];
    while (stack.length > 0) {
      const item = stack.pop();
      if (!item)
        break;
      const { index, partial } = item;
      if (index < 0) {
        yield partial;
        continue;
      }
      const [key, values] = entries[index];
      for (let i = values.length - 1; i >= 0; i--) {
        stack.push({
          index: index - 1,
          partial: Object.assign(Object.assign({}, partial), { [key]: values[i] })
        });
      }
    }
  }

  // node_modules/css-selector-generator/esm/utilities-selectors.js
  var ESCAPED_COLON = ":".charCodeAt(0).toString(16).toUpperCase();
  var SPECIAL_CHARACTERS_RE = /[ !"#$%&'()\[\]{|}<>*+,./;=?@^`~\\]/;
  function sanitizeSelectorItem(input = "") {
    return CSS ? CSS.escape(input) : legacySanitizeSelectorItem(input);
  }
  function legacySanitizeSelectorItem(input = "") {
    return input.split("").map((character) => {
      if (character === ":") {
        return `\\${ESCAPED_COLON} `;
      }
      if (SPECIAL_CHARACTERS_RE.test(character)) {
        return `\\${character}`;
      }
      return escape(character).replace(/%/g, "\\");
    }).join("");
  }
  var SELECTOR_TYPE_GETTERS = {
    tag: getTagSelector,
    id: getIdSelector,
    class: getClassSelectors,
    attribute: getAttributeSelectors,
    nthchild: getNthChildSelector,
    nthoftype: getNthOfTypeSelector
  };
  var ELEMENT_SELECTOR_TYPE_GETTERS = {
    tag: getElementTagSelectors,
    id: getElementIdSelectors,
    class: getElementClassSelectors,
    attribute: getElementAttributeSelectors,
    nthchild: getElementNthChildSelector,
    nthoftype: getElementNthOfTypeSelector
  };
  function getElementSelectorsByType(element, selectorType) {
    return ELEMENT_SELECTOR_TYPE_GETTERS[selectorType](element);
  }
  function getSelectorsByType(elements, selector_type) {
    const getter = SELECTOR_TYPE_GETTERS[selector_type];
    return getter(elements);
  }
  function filterSelectors(list = [], matchBlacklist, matchWhitelist) {
    return list.filter((item) => matchWhitelist(item) || !matchBlacklist(item));
  }
  function orderSelectors(list = [], matchWhitelist) {
    return list.sort((a, b) => {
      const a_is_whitelisted = matchWhitelist(a);
      const b_is_whitelisted = matchWhitelist(b);
      if (a_is_whitelisted && !b_is_whitelisted) {
        return -1;
      }
      if (!a_is_whitelisted && b_is_whitelisted) {
        return 1;
      }
      return 0;
    });
  }
  function* allSelectorsGenerator(elements, options) {
    const yieldedSelectors = /* @__PURE__ */ new Set();
    const selectors_list = getSelectorsList(elements, options);
    for (const selector of selectorTypeCombinationsGenerator(selectors_list, options)) {
      if (!yieldedSelectors.has(selector)) {
        yieldedSelectors.add(selector);
        yield selector;
      }
    }
  }
  function getSelectorsList(elements, options) {
    const { blacklist, whitelist, combineWithinSelector, maxCombinations } = options;
    const matchBlacklist = createPatternMatcher(blacklist);
    const matchWhitelist = createPatternMatcher(whitelist);
    const reducer = (data, selector_type) => {
      const selectors_by_type = getSelectorsByType(elements, selector_type);
      const filtered_selectors = filterSelectors(selectors_by_type, matchBlacklist, matchWhitelist);
      const found_selectors = orderSelectors(filtered_selectors, matchWhitelist);
      data[selector_type] = combineWithinSelector ? Array.from(powerSetGenerator(found_selectors, { maxResults: maxCombinations })) : found_selectors.map((item) => [item]);
      return data;
    };
    return getSelectorsToGet(options).reduce(reducer, {});
  }
  function getSelectorsToGet(options) {
    const { selectors, includeTag } = options;
    const selectors_to_get = [...selectors];
    if (includeTag && !selectors_to_get.includes("tag")) {
      selectors_to_get.push("tag");
    }
    return selectors_to_get;
  }
  function addTagTypeIfNeeded(list) {
    return list.includes(CSS_SELECTOR_TYPE.tag) || list.includes(CSS_SELECTOR_TYPE.nthoftype) ? [...list] : [...list, CSS_SELECTOR_TYPE.tag];
  }
  function combineSelectorTypes(options) {
    const { selectors, combineBetweenSelectors, includeTag, maxCandidates } = options;
    const combinations = combineBetweenSelectors ? getPowerSet(selectors, { maxResults: maxCandidates }) : selectors.map((item) => [item]);
    return includeTag ? combinations.map(addTagTypeIfNeeded) : combinations;
  }
  function* selectorTypeCombinationsGenerator(selectors_list, options) {
    for (const item of combineSelectorTypes(options)) {
      yield* constructedSelectorsGenerator(item, selectors_list);
    }
  }
  function* constructedSelectorsGenerator(selector_types, selectors_by_type) {
    const data = {};
    for (const selector_type of selector_types) {
      const selector_variants = selectors_by_type[selector_type];
      if (selector_variants && selector_variants.length > 0) {
        data[selector_type] = selector_variants;
      }
    }
    for (const combination of cartesianProductGenerator(data)) {
      yield constructSelector(combination);
    }
  }
  function constructSelectorType(selector_type, selectors_data) {
    return selectors_data[selector_type] ? selectors_data[selector_type].join("") : "";
  }
  function constructSelector(selectorData = {}) {
    const pattern = [...SELECTOR_PATTERN];
    if (selectorData[CSS_SELECTOR_TYPE.tag] && selectorData[CSS_SELECTOR_TYPE.nthoftype]) {
      pattern.splice(pattern.indexOf(CSS_SELECTOR_TYPE.tag), 1);
    }
    return pattern.map((type) => constructSelectorType(type, selectorData)).join("");
  }
  function generateCandidateCombinations(selectors, rootSelector) {
    return [
      ...selectors.map((selector) => rootSelector + OPERATOR.DESCENDANT + selector),
      ...selectors.map((selector) => rootSelector + OPERATOR.CHILD + selector)
    ];
  }
  function* candidatesGenerator(selectors, rootSelector) {
    if (rootSelector === "") {
      yield* selectors;
    } else {
      for (const selector of selectors) {
        yield* generateCandidateCombinations([selector], rootSelector);
      }
    }
  }
  function* selectorWithinRootGenerator(elements, root, rootSelector = "", options) {
    const elementSelectorsIterator = allSelectorsGenerator(elements, options);
    for (const candidateSelector of candidatesGenerator(elementSelectorsIterator, rootSelector)) {
      if (testSelector(elements, candidateSelector, root)) {
        yield candidateSelector;
      }
    }
    return;
  }
  function* closestIdentifiableParentGenerator(elements, root, rootSelector = "", options) {
    if (elements.length === 0) {
      return null;
    }
    const candidatesList = [
      elements.length > 1 ? elements : [],
      ...getParents(elements, root).map((element) => [element])
    ];
    for (const currentElements of candidatesList) {
      for (const selectorWithinRoot of selectorWithinRootGenerator(currentElements, root, rootSelector, options)) {
        yield {
          foundElements: currentElements,
          selector: selectorWithinRoot
        };
      }
    }
  }
  function* selectorGenerator({ elements, root, rootSelector = "", options }) {
    let currentRoot = root;
    let partialSelector = rootSelector;
    let shouldContinue = true;
    while (shouldContinue) {
      let foundAny = false;
      for (const item of closestIdentifiableParentGenerator(elements, currentRoot, partialSelector, options)) {
        const { foundElements, selector } = item;
        foundAny = true;
        if (testSelector(elements, selector, root)) {
          yield selector;
        } else {
          currentRoot = foundElements[0];
          partialSelector = selector;
          break;
        }
      }
      if (!foundAny) {
        shouldContinue = false;
      }
    }
  }
  function sanitizeSelectorNeedle(needle) {
    if (needle instanceof NodeList || needle instanceof HTMLCollection) {
      needle = Array.from(needle);
    }
    const elements = (Array.isArray(needle) ? needle : [needle]).filter(isElement);
    return [...new Set(elements)];
  }

  // node_modules/css-selector-generator/esm/utilities-element-data.js
  function createElementSelectorData(selector) {
    return {
      value: selector,
      include: false
    };
  }
  function createElementData(element, selectorTypes, operator = OPERATOR.NONE) {
    const selectors = {};
    selectorTypes.forEach((selectorType) => {
      Reflect.set(selectors, selectorType, getElementSelectorsByType(element, selectorType).map(createElementSelectorData));
    });
    return {
      element,
      operator,
      selectors
    };
  }
  function constructElementSelector({ selectors, operator }) {
    let pattern = [...SELECTOR_PATTERN];
    if (selectors[CSS_SELECTOR_TYPE.tag] && selectors[CSS_SELECTOR_TYPE.nthoftype]) {
      pattern = pattern.filter((item) => item !== CSS_SELECTOR_TYPE.tag);
    }
    let selector = "";
    pattern.forEach((selectorType) => {
      var _a;
      const selectorsOfType = (_a = selectors[selectorType]) !== null && _a !== void 0 ? _a : [];
      selectorsOfType.forEach(({ value, include }) => {
        if (include) {
          selector += value;
        }
      });
    });
    return operator + selector;
  }

  // node_modules/css-selector-generator/esm/selector-fallback.js
  function getElementFallbackSelector(element, root) {
    const parentElements = getElementParents(element, root).reverse();
    const isShadowRoot = root instanceof ShadowRoot;
    const elementsData = parentElements.map((element2, index) => {
      var _a;
      const elementData = createElementData(
        element2,
        [CSS_SELECTOR_TYPE.nthchild],
        // do not use child combinator for the first element in ShadowRoot
        isShadowRoot && index === 0 ? OPERATOR.NONE : OPERATOR.CHILD
      );
      ((_a = elementData.selectors.nthchild) !== null && _a !== void 0 ? _a : []).forEach((selectorData) => {
        selectorData.include = true;
      });
      return elementData;
    });
    const prefix = isShadowRoot ? "" : root ? ":scope" : ":root";
    return [prefix, ...elementsData.map(constructElementSelector)].join("");
  }
  function getFallbackSelector(elements, root) {
    return elements.map((element) => getElementFallbackSelector(element, root)).join(SELECTOR_SEPARATOR);
  }

  // node_modules/css-selector-generator/esm/index.js
  function getCssSelector(needle, custom_options = {}) {
    const options = Object.assign(Object.assign({}, custom_options), { maxResults: 1 });
    const generator = cssSelectorGenerator(needle, options);
    const firstResult = generator.next();
    return firstResult.value;
  }
  function* cssSelectorGenerator(needle, custom_options = {}) {
    var _a;
    const elements = sanitizeSelectorNeedle(needle);
    const options = sanitizeOptions(elements[0], custom_options);
    const root = (_a = options.root) !== null && _a !== void 0 ? _a : getRootNode(elements[0]);
    let foundResults = 0;
    for (const selector of selectorGenerator({
      elements,
      options,
      root,
      rootSelector: ""
    })) {
      yield selector;
      foundResults++;
      if (foundResults >= options.maxResults) {
        return;
      }
    }
    if (elements.length > 1) {
      yield elements.map((element) => getCssSelector(element, options)).join(SELECTOR_SEPARATOR);
      foundResults++;
      if (foundResults >= options.maxResults) {
        return;
      }
    }
    const rootWasProvided = custom_options.root !== void 0;
    yield getFallbackSelector(elements, options.useScope || rootWasProvided ? root : void 0);
  }

  // src/content/content.js
  console.log("Markup content script ready");
  var RING_ID = "__markup-ring";
  var CURSOR_STYLE_ID = "__markup-cursor";
  var HIGHLIGHT_COLOR = "#FF8400";
  var ring = null;
  var selectedEl = null;
  var isActive = false;
  window.__markupReady = true;
  function injectCursorOverride() {
    if (document.getElementById(CURSOR_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = CURSOR_STYLE_ID;
    style.textContent = "body { cursor: default !important; }";
    (document.head || document.documentElement).appendChild(style);
  }
  function removeCursorOverride() {
    document.getElementById(CURSOR_STYLE_ID)?.remove();
  }
  function ensureRing() {
    if (!isActive) return ring;
    if (ring) return ring;
    ring = document.createElement("div");
    ring.id = RING_ID;
    Object.assign(ring.style, {
      position: "fixed",
      pointerEvents: "none",
      zIndex: "2147483646",
      // Fix 1: start in hover style (dashed, 50% opacity)
      border: "2px dashed rgba(255, 132, 0, 0.5)",
      borderRadius: "2px",
      boxSizing: "border-box",
      display: "none"
    });
    document.documentElement.appendChild(ring);
    return ring;
  }
  function setRingMode(mode) {
    const r = ensureRing();
    if (mode === "selected") {
      r.style.border = `2px solid ${HIGHLIGHT_COLOR}`;
    } else {
      r.style.border = "2px dashed rgba(255, 132, 0, 0.5)";
    }
  }
  function positionRing(el) {
    if (!isActive) return;
    const r = ensureRing();
    const rect = el.getBoundingClientRect();
    r.style.display = "block";
    r.style.top = rect.top + "px";
    r.style.left = rect.left + "px";
    r.style.width = rect.width + "px";
    r.style.height = rect.height + "px";
  }
  function hideRing() {
    if (ring) ring.style.display = "none";
  }
  function getSelector(el) {
    if (el === document.documentElement || el === document.head || el === document.body || el.id === RING_ID) {
      return null;
    }
    try {
      return getCssSelector(el);
    } catch {
      return null;
    }
  }
  function sendToSidebar(message) {
    chrome.runtime.sendMessage(message).catch(() => {
    });
  }
  function clearSelection() {
    selectedEl = null;
    hideRing();
    sendToSidebar({ type: "ELEMENT_DESELECTED" });
  }
  function onMouseover(e) {
    if (!isActive || selectedEl) return;
    const target = e.target;
    if (target === ring || target === document.documentElement || target === document.body) {
      return;
    }
    setRingMode("hover");
    positionRing(target);
    const selector = getSelector(target);
    if (selector) {
      sendToSidebar({ type: "ELEMENT_HOVERED", selector });
    }
  }
  function onMouseout() {
    if (!isActive || selectedEl) return;
    hideRing();
    sendToSidebar({ type: "ELEMENT_HOVER_END" });
  }
  function onClick(e) {
    const target = e.target;
    if (target === ring || target.id === RING_ID) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (target === selectedEl) {
      clearSelection();
      return;
    }
    const selector = getSelector(target);
    if (!selector) return;
    selectedEl = target;
    setRingMode("selected");
    positionRing(target);
    sendToSidebar({ type: "ELEMENT_SELECTED", selector });
  }
  function onScroll() {
    if (selectedEl) positionRing(selectedEl);
  }
  function onKeydown(e) {
    if (e.key === "Escape") clearSelection();
  }
  function activate() {
    if (isActive) return;
    isActive = true;
    selectedEl = null;
    hideRing();
    injectCursorOverride();
    ensureRing();
    document.addEventListener("mouseover", onMouseover, { capture: true, passive: true });
    document.addEventListener("mouseout", onMouseout, { capture: true, passive: true });
    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    document.addEventListener("keydown", onKeydown);
    sendToSidebar({ type: "MARKUP_ACTIVATED" });
  }
  function deactivate() {
    if (!isActive) return;
    isActive = false;
    clearSelection();
    hideRing();
    removeCursorOverride();
    document.removeEventListener("mouseover", onMouseover, { capture: true });
    document.removeEventListener("mouseout", onMouseout, { capture: true });
    document.removeEventListener("click", onClick, { capture: true });
    document.removeEventListener("scroll", onScroll, { capture: true });
    document.removeEventListener("keydown", onKeydown);
    sendToSidebar({ type: "MARKUP_DEACTIVATED" });
  }
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "MARKUP_ACTIVATE") activate();
    if (message.type === "MARKUP_DEACTIVATE") deactivate();
  });
})();
