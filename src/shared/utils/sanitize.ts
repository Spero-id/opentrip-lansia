import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "br",
  "hr",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "mark",
  "small",
  "sub",
  "sup",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "code",
  "pre",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "span",
  "div",
];

const ALLOWED_ATTR: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "title", "width", "height", "loading"],
  code: ["class"],
  pre: ["class"],
  span: ["class"],
  div: ["class"],
  th: ["colspan", "rowspan", "scope"],
  td: ["colspan", "rowspan"],
  table: ["class"],
  ul: ["class"],
  ol: ["class"],
  li: ["class"],
  blockquote: ["class"],
};

const ALLOWED_CLASSES: sanitizeHtml.IOptions["allowedClasses"] = {
  div: ["prose", "not-prose"],
  span: [/^text-/, /^bg-/, /^font-/],
  pre: [/^language-/],
  code: [/^language-/],
  blockquote: ["note"],
};

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: ALLOWED_ATTR,
  allowedClasses: ALLOWED_CLASSES,
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowedSchemesAppliedToAttributes: ["href", "src", "cite"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
    img: (tagName, attribs) => {
      const src = attribs.src || "";
      if (/^https?:\/\//i.test(src) || src.startsWith("/")) {
        return { tagName: "img", attribs };
      }
      return { tagName: "img", attribs: { alt: attribs.alt || "" } };
    },
  },
};

export function sanitizeBlogContent(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, sanitizeOptions);
}
