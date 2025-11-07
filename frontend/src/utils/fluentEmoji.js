/**
 * Microsoft Fluent Emoji Integration
 * 
 * Provides consistent emoji rendering across all devices using Microsoft's Fluent Emoji assets.
 * Uses Color style (flat, colorful) which is more reliable and smaller than 3D.
 * 
 * Assets served from jsDelivr CDN (npm package: @fluentui/emoji)
 * 
 * @see https://github.com/microsoft/fluentui-emoji
 */

// CDN base URL for Fluent Emoji assets - using npm package which is more reliable
const FLUENT_EMOJI_CDN = 'https://cdn.jsdelivr.net/npm/@fluentui/emoji@latest/assets';

// Cache for emoji URL resolutions to improve performance
const emojiURLCache = new Map();

// Emoji to filename mapping for common emoji (fallback for complex sequences)
const EMOJI_TO_FILENAME = {
  '🔥': 'fire',
  '🌌': 'milky_way',
  '📅': 'calendar',
  '⚡': 'high_voltage',
  '⭐': 'star',
  '🎯': 'direct_hit',
  '🏆': 'trophy',
  '🎉': 'party_popper',
  '✨': 'sparkles',
  '💰': 'money_bag',
  '🪙': 'coin',
  '⚔️': 'crossed_swords',
  '🛡️': 'shield',
  '🧪': 'test_tube',
  '❄️': 'snowflake',
  '🔮': 'crystal_ball',
  '🦅': 'eagle',
  '👤': 'bust_in_silhouette',
  '😊': 'smiling_face_with_smiling_eyes',
  '🤓': 'nerd_face',
  '🎮': 'video_game',
  '🚀': 'rocket',
  '🌟': 'glowing_star',
  '💎': 'gem_stone',
  '🌈': 'rainbow',
  '👑': 'crown',
  '🦄': 'unicorn',
  '🐉': 'dragon',
  '🤖': 'robot',
  '👻': 'ghost',
  '🦁': 'lion',
  '🐯': 'tiger_face',
  '🦈': 'shark',
  '🦖': 'T-Rex',
};

/**
 * Convert Unicode emoji to Fluent Emoji asset path
 * 
 * @param {string} emoji - Unicode emoji character(s)
 * @returns {string} - URL to Fluent Emoji SVG
 */
function getFluentEmojiURL(emoji) {
  // Check cache first
  if (emojiURLCache.has(emoji)) {
    return emojiURLCache.get(emoji);
  }

  // Try filename mapping first (more reliable)
  const filename = EMOJI_TO_FILENAME[emoji];
  if (filename) {
    const url = `${FLUENT_EMOJI_CDN}/${filename}_color.svg`;
    emojiURLCache.set(emoji, url);
    return url;
  }

  // Fallback: Convert emoji to Unicode codepoint
  // Remove variation selectors and zero-width joiners for cleaner filenames
  const codepoint = [...emoji]
    .map(char => {
      const code = char.codePointAt(0);
      // Skip variation selectors (FE0F, FE0E) and ZWJ (200D)
      if (code === 0xFE0F || code === 0xFE0E || code === 0x200D) {
        return null;
      }
      return code.toString(16).toLowerCase();
    })
    .filter(Boolean)
    .join('_');

  // Try standard naming: codepoint_color.svg
  const url = `${FLUENT_EMOJI_CDN}/${codepoint}_color.svg`;

  // Cache the URL
  emojiURLCache.set(emoji, url);

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
