# solid-ai-chatbot

Add the [Asyntai](https://asyntai.com) AI chat assistant to any Solid or
SolidStart app with one component. It answers visitor questions from your own
content, in more than 80 languages.

## Install

```bash
npm install solid-ai-chatbot
```

Then add the component once, in the part of your app that every page shares:

```jsx
import { AiChatbot } from 'solid-ai-chatbot';

export default function App() {
  return (
    <>
      <MyRoutes />
      <AiChatbot widgetId="asyntai_1a2b3c4d5e6f" />
    </>
  );
}
```

With Solid Router or SolidStart, put it in the `root` layout:

```jsx
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense } from 'solid-js';
import { AiChatbot } from 'solid-ai-chatbot';

export default function App() {
  return (
    <Router
      root={(props) => (
        <>
          <Suspense>{props.children}</Suspense>
          <AiChatbot widgetId="asyntai_1a2b3c4d5e6f" />
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
```

The chat bubble is now on every page, and it stays open while visitors move
between routes.

## Where the widget ID comes from

Open the Install page in your [Asyntai dashboard](https://asyntai.com/dashboard).
The widget ID is the value of `data-asyntai-id` in the snippet shown there. It
starts with `asyntai_`.

Creating an account is free, and the Free plan is enough to try the widget.

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `widgetId` | string | required | Your Asyntai widget ID |
| `enabled` | boolean | `true` | Set to `false` to hold the widget back. It loads when the value turns `true` |
| `scriptUrl` | string | the Asyntai CDN | Advanced. Load the widget from another URL |

The props are reactive, so you can load the widget after a visitor gives consent:

```jsx
<AiChatbot widgetId="asyntai_1a2b3c4d5e6f" enabled={hasConsent()} />
```

A missing or malformed `widgetId` writes a message to the browser console that
says how to fix it. Your app keeps running.

## What the component does

- It renders nothing into your app. The widget draws its own bubble.
- It adds the widget script after the page's `load` event, so your own app always
  renders first.
- It runs only in the browser, so it is safe with SolidStart server rendering.
- A page that already has the Asyntai snippet keeps it and gets no second one.
- Once loaded, the widget stays until the next full page load, even when the
  component is removed.

## Answering from your content

Asyntai reads your published pages. Add your site URL in the dashboard, and the
assistant answers from the same pages the widget sits on. You can also add extra
documents and question and answer pairs.

## Compatibility

Solid 1.6 and later in the 1.x line, and SolidStart 1 and 2.

## Removing it

Delete the `<AiChatbot />` line and build again. The widget is gone.

## Support

Email [hello@asyntai.com](mailto:hello@asyntai.com), or read the
[Solid guide](https://asyntai.com/documentation/integrations/solid/).

## Licence

MIT. See [LICENSE](LICENSE).
