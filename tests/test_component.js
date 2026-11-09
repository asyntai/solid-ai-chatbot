/**
 * Tests for solid-ai-chatbot, with the real Solid client runtime and jsdom.
 *
 * The browser condition selects Solid's client build. Without it, Node gets the
 * server build, where effects do not run.
 *
 * Run from plugins/solid: npm test
 */

import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { JSDOM } from 'jsdom';
import { createRoot, createSignal } from 'solid-js';
import AiChatbotDefault, {
  AiChatbot,
  DEFAULT_SCRIPT_URL,
  addWidgetScript,
  validateWidgetId,
} from '../src/index.js';

const ID = 'asyntai_1a2b3c4d5e6f';

// jsdom sets readyState itself. This keeps the page in the state a test needs.
function freshPage(readyState = 'complete') {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');
  Object.defineProperty(dom.window.document, 'readyState', {
    configurable: true,
    get: () => readyState,
  });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  return dom;
}

function scripts() {
  return [...document.querySelectorAll('script[data-asyntai-id]')];
}

function capturedErrors(fn) {
  const original = console.error;
  const seen = [];
  console.error = (message) => seen.push(String(message));
  try {
    fn();
  } finally {
    console.error = original;
  }
  return seen;
}

function mount(props) {
  return createRoot((dispose) => {
    const output = AiChatbot(props);
    return { dispose, output };
  });
}

beforeEach(() => freshPage());

test('the default export is the component', () => {
  assert.equal(AiChatbotDefault, AiChatbot);
});

test('a valid ID is returned trimmed', () => {
  assert.equal(validateWidgetId(`  ${ID} `), ID);
});

for (const bad of [undefined, null, '', '   ', 42, {}]) {
  test(`a missing ID is refused: ${JSON.stringify(bad)}`, () => {
    assert.throws(() => validateWidgetId(bad), /is required/);
  });
}

for (const bad of ['abc', 'asyntai_', 'asyntai_a-b', '<script>', 'asyntai_a b', 'ASYNTAI_abc']) {
  test(`a malformed ID is refused: ${bad}`, () => {
    assert.throws(() => validateWidgetId(bad), /does not look like a widget ID/);
  });
}

test('the component renders nothing into the app', () => {
  const { output, dispose } = mount({ widgetId: ID });
  assert.equal(output, null);
  dispose();
});

test('a loaded page gets the script at once, with the right attributes', () => {
  const { dispose } = mount({ widgetId: ID });
  const [script] = scripts();
  assert.equal(scripts().length, 1);
  assert.equal(script.parentNode, document.head);
  assert.equal(script.src, DEFAULT_SCRIPT_URL);
  assert.equal(script.async, true);
  assert.equal(script.getAttribute('data-asyntai-id'), ID);
  dispose();
});

test('a page still loading gets the script only after the load event', () => {
  freshPage('loading');
  const { dispose } = mount({ widgetId: ID });
  assert.equal(scripts().length, 0);
  window.dispatchEvent(new window.Event('load'));
  assert.equal(scripts().length, 1);
  dispose();
});

test('removal before the load event cancels the load', () => {
  freshPage('loading');
  const { dispose } = mount({ widgetId: ID });
  dispose();
  window.dispatchEvent(new window.Event('load'));
  assert.equal(scripts().length, 0);
});

test('removal after the load keeps the widget, because it has no destroy call', () => {
  const { dispose } = mount({ widgetId: ID });
  dispose();
  assert.equal(scripts().length, 1);
});

test('two components add one script', () => {
  const first = mount({ widgetId: ID });
  const second = mount({ widgetId: ID });
  assert.equal(scripts().length, 1);
  first.dispose();
  second.dispose();
});

test('mount, remove, mount again adds no second script', () => {
  mount({ widgetId: ID }).dispose();
  const again = mount({ widgetId: ID });
  assert.equal(scripts().length, 1);
  again.dispose();
});

test('a page with the normal snippet keeps it and gets no second one', () => {
  const snippet = document.createElement('script');
  snippet.setAttribute('data-asyntai-id', 'asyntai_existing');
  document.body.appendChild(snippet);
  const { dispose } = mount({ widgetId: ID });
  assert.equal(scripts().length, 1);
  assert.equal(scripts()[0].getAttribute('data-asyntai-id'), 'asyntai_existing');
  dispose();
});

test('scriptUrl replaces the default URL', () => {
  const { dispose } = mount({ widgetId: ID, scriptUrl: 'https://example.com/w.js' });
  assert.equal(scripts()[0].src, 'https://example.com/w.js');
  dispose();
});

test('enabled false holds the widget back', () => {
  const { dispose } = mount({ widgetId: ID, enabled: false });
  assert.equal(scripts().length, 0);
  dispose();
});

test('enabled undefined means on', () => {
  const { dispose } = mount({ widgetId: ID, enabled: undefined });
  assert.equal(scripts().length, 1);
  dispose();
});

test('a signal that turns enabled on loads the widget', () => {
  const [consent, setConsent] = createSignal(false);
  const { dispose } = mount({
    widgetId: ID,
    get enabled() {
      return consent();
    },
  });
  assert.equal(scripts().length, 0);
  setConsent(true);
  assert.equal(scripts().length, 1);
  dispose();
});

test('a widget ID that arrives later loads the widget', () => {
  const [id, setId] = createSignal(undefined);
  let mounted;
  const errors = capturedErrors(() => {
    mounted = mount({
      get widgetId() {
        return id();
      },
    });
    setId(ID);
  });
  assert.equal(errors.length, 1);
  assert.equal(scripts()[0].getAttribute('data-asyntai-id'), ID);
  mounted.dispose();
});

test('a bad ID logs the fix, adds nothing and does not throw', () => {
  const errors = capturedErrors(() => mount({ widgetId: 'wrong' }).dispose());
  assert.equal(errors.length, 1);
  assert.match(errors[0], /solid-ai-chatbot/);
  assert.match(errors[0], /does not look like a widget ID/);
  assert.equal(scripts().length, 0);
});

test('a missing ID logs the fix, adds nothing and does not throw', () => {
  const errors = capturedErrors(() => mount({}).dispose());
  assert.equal(errors.length, 1);
  assert.match(errors[0], /is required/);
  assert.equal(scripts().length, 0);
});

test('addWidgetScript reports what it did', () => {
  assert.equal(addWidgetScript(ID), true);
  assert.equal(addWidgetScript(ID), false);
});
