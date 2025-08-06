import DOMPurify from 'dompurify';

export const sanitizeHtml = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['a', 'img', 'br', 'p', 'div', 'span', 'strong', 'em'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
  });
};
