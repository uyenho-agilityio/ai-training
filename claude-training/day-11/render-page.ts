import type { CartItem } from "../day-2/app/cart.ts";
import type { CartPageView } from "./types.ts";

/** Escape text that is inserted into HTML. */
export const escapeHtml = (value: string): string => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
};

/** Render one saved item, or the empty-cart line. */
const renderItems = (items: readonly CartItem[]): string => {
  if (items.length === 0) {
    return '<li class="empty">No items yet.</li>';
  }

  return items
    .map((item: CartItem): string => {
      const name: string = escapeHtml(item.name);
      const price: string = escapeHtml(String(item.price));
      return `<li>${name} — ${price}</li>`;
    })
    .join("");
};

/** Render the rejection line only when the last submit failed. */
const renderNotice = (notice: string): string => {
  if (notice.length === 0) {
    return "";
  }

  return `<p class="notice" role="alert">${escapeHtml(notice)}</p>`;
};

/** Fill the Day 11 HTML template from the current cart view. */
export const renderCartPage = (template: string, view: CartPageView): string => {
  const replacements: Record<string, string> = {
    nameValue: escapeHtml(view.nameValue),
    priceValue: escapeHtml(view.priceValue),
    noticeBlock: renderNotice(view.notice),
    disabledAttr: view.notice.length > 0 ? "disabled" : "",
    count: escapeHtml(String(view.count)),
    total: escapeHtml(String(view.total)),
    items: renderItems(view.items),
  };

  return template.replaceAll(
    /\{\{(\w+)\}\}/g,
    (_match: string, key: string): string => replacements[key] ?? "",
  );
};
