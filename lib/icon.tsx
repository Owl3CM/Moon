/**
 * icon.tsx — Moon-Style headless icon primitive.
 *
 * Provides the SVG-sprite-use mechanism only.
 * Zero styling, zero className assumptions, zero DS tokens.
 * The DS layer wraps this with classNames, size tokens and aria defaults.
 */

import React from "react";

// ── IconBase ──────────────────────────────────────────────────────────────────

export interface IconBaseProps {
  /** Icon id — must match a symbol id in the sprite. Typed as `IconName` by the DS layer. */
  name: string;
  /** Sprite href — e.g. `/icons/sprite.svg?v=123`. Provided by DS via the virtual module. */
  href: string;
  /** Raw size value (px number or CSS string). Token resolution is the DS layer's job. */
  size?: number | string;
  /** Allow any additional props (events, data-*, aria-*, style vars, etc.) */
  [key: string]: any;
}

/**
 * Headless SVG sprite icon.
 * Renders `<svg><use href="${href}#${name}"/></svg>` and nothing else.
 * All layout, color, aria defaults, and size tokens belong to the consumer.
 */
export function IconBase({ name, href, size = 18, ...props }: IconBaseProps) {
  return (
    <svg width={size} height={size} focusable="false" {...props}>
      <use href={`${href}#${name}`} />
    </svg>
  );
}
