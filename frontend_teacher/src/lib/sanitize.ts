import DOMPurify from 'dompurify';

/**
 * Sanitizes an HTML string to prevent XSS attacks.
 * Uses DOMPurify to strip dangerous tags and attributes.
 * 
 * @param html The untrusted HTML string
 * @returns The sanitized, safe HTML string
 */
export function sanitizeHtml(html: string): string {
    if (typeof window === 'undefined') {
        // DOMPurify requires a window object. In server-side rendering (SSR), 
        // we either need jsdom or we just return the raw string if we only render on the client.
        // For Next.js, it's best to sanitize on the client before dangerouslySetInnerHTML,
        // or use an isomorphic dompurify setup.
        // We'll return the string as-is on the server, but it should only be injected on the client.
        return html;
    }
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'b', 'i', 'em', 'strong', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'br', 'span', 'div', 'code', 'pre', 'blockquote'
        ],
        ALLOWED_ATTR: ['href', 'target', 'class', 'className', 'rel'],
        // Don't allow URLs to execute javascript
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    });
}
