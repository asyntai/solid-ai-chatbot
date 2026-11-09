/**
 * Asyntai AI chatbot for Solid.
 *
 * <AiChatbot widgetId="asyntai_..." /> adds the Asyntai chat widget to a Solid
 * or SolidStart app. It renders nothing itself: the widget draws its own bubble.
 *
 * Plain JavaScript with no JSX, so it needs no compile step in the host app.
 * createEffect does not run during server rendering, so nothing here touches
 * window or document on the server.
 */

import { createEffect, onCleanup } from 'solid-js';

export const DEFAULT_SCRIPT_URL = 'https://widget.asyntai.com/static/js/chat-widget.js';

const WIDGET_ID_PATTERN = /^asyntai_[A-Za-z0-9]+$/;
const NAME = 'solid-ai-chatbot';

/** Returns the clean widget ID, or throws a message that says how to fix it. */
export function validateWidgetId(widgetId) {
  const id = typeof widgetId === 'string' ? widgetId.trim() : '';
  if (!id) {
    throw new Error(
      NAME +
        ': "widgetId" is required. Copy it from the Install page of your ' +
        'Asyntai dashboard, for example asyntai_1a2b3c4d5e6f.',
    );
  }
  if (!WIDGET_ID_PATTERN.test(id)) {
    throw new Error(
      NAME +
        ': "' +
        id +
        '" does not look like a widget ID. It starts with asyntai_, for ' +
        'example asyntai_1a2b3c4d5e6f.',
    );
  }
  return id;
}

/**
 * Adds the widget script to the page. A page that already has an Asyntai
 * snippet keeps it and gets no second one. Returns true when it added the tag.
 */
export function addWidgetScript(widgetId, scriptUrl) {
  if (document.querySelector('script[data-asyntai-id]')) {
    return false;
  }
  const script = document.createElement('script');
  script.src = scriptUrl || DEFAULT_SCRIPT_URL;
  script.async = true;
  script.setAttribute('data-asyntai-id', widgetId);
  document.head.appendChild(script);
  return true;
}

/**
 * The script waits for the page's load event. An ordinary script tag holds the
 * load event open until its own fetch finishes, so an unreachable server would
 * delay the host page. This cannot.
 */
export function AiChatbot(props) {
  createEffect(() => {
    if (props.enabled === false) {
      return;
    }
    let widgetId;
    try {
      widgetId = validateWidgetId(props.widgetId);
    } catch (err) {
      // A chat widget must never take the host app down, so this logs and stops.
      console.error(err.message);
      return;
    }
    const scriptUrl = props.scriptUrl;
    const load = () => addWidgetScript(widgetId, scriptUrl);

    if (document.readyState === 'complete') {
      load();
      return;
    }
    window.addEventListener('load', load, { once: true });
    onCleanup(() => window.removeEventListener('load', load));
  });

  return null;
}

export default AiChatbot;
