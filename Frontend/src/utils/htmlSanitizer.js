// src/utils/htmlSanitizer.js
import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks while preserving safe formatting
 * @param {string} html - The HTML string to sanitize
 * @param {Object} options - DOMPurify configuration options
 * @returns {string} - Sanitized HTML string
 */
export const sanitizeHtml = (html, options = {}) => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const defaultOptions = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'a', 'span', 'div', 'hr'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id'],
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    ...options
  };

  return DOMPurify.sanitize(html, defaultOptions);
};

/**
 * Sanitizes HTML and creates a safe dangerouslySetInnerHTML object
 * @param {string} html - The HTML string to sanitize
 * @param {Object} options - DOMPurify configuration options
 * @returns {Object} - Object with __html property for dangerouslySetInnerHTML
 */
export const createSafeHtml = (html, options = {}) => {
  return {
    __html: sanitizeHtml(html, options)
  };
};

/**
 * Converts plain text with line breaks to HTML
 * @param {string} text - Plain text with line breaks
 * @returns {string} - HTML with <br> tags
 */
export const textToHtml = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(.*)$/, '<p>$1</p>')
    .replace(/<p><\/p>/g, '');
};

/**
 * Truncates HTML content while preserving tags and adds ellipsis
 * @param {string} html - The HTML string to truncate
 * @param {number} maxLength - Maximum character length (excluding HTML tags)
 * @param {string} suffix - Suffix to add when truncated (default: '...')
 * @returns {string} - Truncated HTML string
 */
export const truncateHtml = (html, maxLength = 100, suffix = '...') => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Remove HTML tags to count actual text length
  const textOnly = html.replace(/<[^>]*>/g, '');
  
  if (textOnly.length <= maxLength) {
    return html;
  }

  // Find a good breaking point
  const truncatedText = textOnly.substring(0, maxLength);
  const lastSpaceIndex = truncatedText.lastIndexOf(' ');
  const breakPoint = lastSpaceIndex > 0 ? lastSpaceIndex : maxLength;
  
  // Truncate the original HTML while trying to preserve tags
  let truncatedHtml = '';
  let textCount = 0;
  let tagDepth = 0;
  
  for (let i = 0; i < html.length; i++) {
    const char = html[i];
    
    if (char === '<') {
      tagDepth++;
      truncatedHtml += char;
    } else if (char === '>') {
      tagDepth--;
      truncatedHtml += char;
    } else if (tagDepth === 0) {
      if (textCount >= breakPoint) {
        break;
      }
      truncatedHtml += char;
      textCount++;
    } else {
      truncatedHtml += char;
    }
  }
  
  return truncatedHtml + suffix;
};
