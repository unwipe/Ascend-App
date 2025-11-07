/**
 * Microsoft Fluent Emoji Integration
 * 
 * Provides consistent emoji rendering across all devices using Microsoft's Fluent Emoji assets.
 * Uses 3D style as primary with Flat as fallback for maximum visual appeal.
 * 
 * Assets served from jsDelivr CDN (GitHub repo: microsoft/fluentui-emoji)
 * 
 * @see https://github.com/microsoft/fluentui-emoji
 */

// CDN base URLs for Fluent Emoji assets - GitHub repo via jsDelivr
const FLUENT_EMOJI_3D_CDN = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji/assets/3D';
const FLUENT_EMOJI_FLAT_CDN = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji/assets/Flat';

// Cache for emoji URL resolutions to improve performance
const emojiURLCache = new Map();
const emojiFailureCache = new Set(); // Track failed URLs to avoid repeated attempts

/**
 * Convert Unicode emoji to properly formatted codepoint string
 * Handles complex emoji including:
 * - Multi-codepoint sequences (families, professions)
 * - Skin tone modifiers
 * - Regional flags
 * - Variation selectors (VS16)
 * 
 * @param {string} emoji - Unicode emoji character(s)
 * @returns {string} - Formatted codepoint string (e.g., "1f525" or "1f468-200d-1f4bb")
 */
function emojiToCodepoint(emoji) {
  const codepoints = [];
  
  // Iterate through each code unit in the emoji
  for (let i = 0; i < emoji.length; i++) {
    const code = emoji.codePointAt(i);
    
    // Skip surrogate pairs (already captured by codePointAt)
    if (code > 0xFFFF) {
      i++; // Skip the low surrogate
    }
    
    // Include VS16 (FE0F) for emoji presentation, but skip VS15 (FE0E) for text
    // Keep ZWJ (200D) for multi-part sequences
    // Keep skin tone modifiers (1F3FB-1F3FF)
    if (code === 0xFE0E) {
      continue; // Skip text variation selector
    }
    
    codepoints.push(code.toString(16).toUpperCase());
  }
  
  return codepoints.join('-');
}

/**
 * Convert Unicode emoji to Fluent Emoji asset path
 * 
 * @param {string} emoji - Unicode emoji character(s)
 * @param {string} style - 'Color' (3D) or 'Flat'
 * @returns {string} - URL to Fluent Emoji SVG
 */
function getFluentEmojiURL(emoji, style = '3D') {
  const cacheKey = `${emoji}-${style}`;
  
  // Check cache first
  if (emojiURLCache.has(cacheKey)) {
    return emojiURLCache.get(cacheKey);
  }

  // Check if this URL previously failed
  if (emojiFailureCache.has(cacheKey)) {
    return null;
  }

  // Convert emoji to codepoint
  const codepoint = emojiToCodepoint(emoji);
  
  // Build URL based on style
  const baseCDN = style === '3D' ? FLUENT_EMOJI_3D_CDN : FLUENT_EMOJI_FLAT_CDN;
  const url = `${baseCDN}/${codepoint}.svg`;

  // Cache the URL
  emojiURLCache.set(cacheKey, url);

  return url;
}

/**
 * Regular expression to match emoji characters
 * Comprehensive pattern that captures most emoji including:
 * - Basic emoji
 * - Emoji with skin tone modifiers
 * - Multi-part emoji (flag sequences, family emoji, etc.)
 * - Emoji with variation selectors
 */
const EMOJI_REGEX = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;

/**
 * Apply Fluent Emoji rendering to all emoji in a container
 * 
 * @param {HTMLElement|Document} root - Root element to parse (default: document.body)
 * @param {Object} options - Configuration options
 * @param {string} options.className - CSS class for emoji images (default: 'fluent-emoji')
 * @returns {number} - Number of emoji replaced
 */
export function applyFluentEmoji(root = document.body, options = {}) {
  const { className = 'fluent-emoji' } = options;

  if (!root) return 0;

  let replacementCount = 0;

  // Get all text nodes in the container
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip script and style elements
        const parent = node.parentElement;
        if (!parent || parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') {
          return NodeFilter.FILTER_REJECT;
        }
        // Only process nodes with emoji
        if (EMOJI_REGEX.test(node.textContent)) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_REJECT;
      }
    }
  );

  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) {
    textNodes.push(node);
  }

  // Process each text node
  textNodes.forEach(textNode => {
    const text = textNode.textContent;
    const matches = [...text.matchAll(EMOJI_REGEX)];

    if (matches.length === 0) return;

    // Create a document fragment to build replacement
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    matches.forEach(match => {
      const emoji = match[0];
      const index = match.index;

      // Add text before emoji
      if (index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, index)));
      }

      // Create img element for emoji
      const img = document.createElement('img');
      img.src = getFluentEmojiURL(emoji);
      img.alt = emoji;
      img.className = className;
      img.draggable = false;
      img.loading = 'lazy';
      
      // Add title for accessibility
      img.title = emoji;

      fragment.appendChild(img);

      lastIndex = index + emoji.length;
      replacementCount++;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    // Replace text node with fragment
    textNode.parentNode.replaceChild(fragment, textNode);
  });

  return replacementCount;
}

/**
 * Debounced version of applyFluentEmoji for frequently updating content
 * 
 * @param {HTMLElement} element - Element to apply emoji to
 * @param {number} delay - Debounce delay in ms (default: 100)
 */
let emojiTimeout;
export function applyFluentEmojiDebounced(element, delay = 100) {
  clearTimeout(emojiTimeout);
  emojiTimeout = setTimeout(() => {
    applyFluentEmoji(element);
  }, delay);
}

/**
 * Get Fluent Emoji URL for a single emoji (for React components)
 * 
 * @param {string} emoji - Emoji character
 * @returns {string} - CDN URL for the emoji SVG
 * 
 * @example
 * const fireUrl = getEmojiURL('🔥');
 * <img src={fireUrl} alt="🔥" className="fluent-emoji" />
 */
export function getEmojiURL(emoji) {
  return getFluentEmojiURL(emoji);
}

/**
 * Preload commonly used emojis for better performance
 * Call this on app initialization
 * 
 * @param {string[]} emojis - Array of emoji to preload
 */
export function preloadEmojis(emojis) {
  emojis.forEach(emoji => {
    const url = getFluentEmojiURL(emoji);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'image';
    document.head.appendChild(link);
  });
}

/**
 * Clear the emoji URL cache
 * Useful for testing or if CDN changes
 */
export function clearEmojiCache() {
  emojiURLCache.clear();
}

/**
 * Common emoji used in the app for preloading
 */
export const COMMON_EMOJI = [
  '🔥', // Streaks
  '🌌', // Logo
  '📅', '⚡', '⭐', '🎯', // Quest types
  '🏆', '🎉', '✨', // Achievements
  '💰', '🪙', // Coins
  '⚔️', '🛡️', '🧪', // Items
  '❄️', '🔮', // Effects
  '🦅', // Phoenix avatar
  '👤', // Default avatar
];
