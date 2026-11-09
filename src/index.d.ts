import type { JSX } from 'solid-js';

export interface AiChatbotProps {
  /** Your Asyntai widget ID, for example `asyntai_1a2b3c4d5e6f`. Required. */
  widgetId: string;
  /** Set to false to hold the widget back, for example until a visitor gives consent. */
  enabled?: boolean;
  /** Advanced. Load the widget script from another URL. */
  scriptUrl?: string;
}

/** Adds the Asyntai chat widget to the page. Renders nothing itself. */
export function AiChatbot(props: AiChatbotProps): JSX.Element;
export default AiChatbot;

export function validateWidgetId(widgetId: unknown): string;
export function addWidgetScript(widgetId: string, scriptUrl?: string): boolean;
export const DEFAULT_SCRIPT_URL: string;
