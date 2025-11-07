/**
 * Emoji Utility - Microsoft/Fluent-style Emoji Rendering
 * 
 * Uses twemoji to normalize emoji rendering across all devices
 * Provides consistent Microsoft/Fluent emoji appearance
 * 
 * Usage:
 *   import { applyEmoji } from './utils/emoji';
 * 
 *   // Apply to entire document
 *   applyEmoji();
 * 
 *   // Apply to specific element (e.g., modal content)
 *   applyEmoji(modalRef.current);
 * 
 *   // Apply after dynamic content loads
 *   useEffect(() => {
 *     applyEmoji(contentRef.current);
 *   }, [content]);
 */

/**
 * Apply twemoji parsing to convert native emoji to SVG images
 * 
 * @param {HTMLElement|Document} root - The root element to parse (defaults to document.body)
 * @returns {Promise<void>}
 */
export async function applyEmoji(root = document.body) {
  try {
    // Dynamic import to avoid loading twemoji until needed
    const twemoji = await import('twemoji');
    
    // Parse emoji in the specified root element
    twemoji.default.parse(root, {
      folder: 'svg',
      ext: '.svg',
      base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
      // Note: To use Microsoft Fluent emoji in the future, change base to:
      // base: 'https://cdn.jsdelivr.net/npm/@fluentui/svg-icons/icons/'
      // For now, Twitter emoji (twemoji) provides excellent cross-platform consistency
    });
  } catch (error) {
    console.warn('Failed to apply emoji parsing:', error);
  }
}

/**
 * React hook to apply emoji parsing to a ref
 * 
 * Usage:
 *   const ref = useEmojiRef();
 *   return <div ref={ref}>🎉 Hello!</div>;
 */
export function useEmojiRef() {
  const ref = React.useRef(null);
  
  React.useEffect(() => {
    if (ref.current) {
      applyEmoji(ref.current);
    }
  }, []);
  
  return ref;
}

/**
 * Debounced emoji application for frequently updating content
 * 
 * @param {HTMLElement} element - Element to apply emoji to
 * @param {number} delay - Debounce delay in ms (default: 100)
 */
let emojiTimeout;
export function applyEmojiDebounced(element, delay = 100) {
  clearTimeout(emojiTimeout);
  emojiTimeout = setTimeout(() => {
    applyEmoji(element);
  }, delay);
}
