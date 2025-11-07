import React from 'react';
import { getEmojiURL, markEmojiFailure } from '../utils/fluentEmoji';

/**
 * FluentEmoji Component
 * 
 * Renders a single emoji using Microsoft Fluent Emoji assets with cascading fallbacks:
 * 1. Try 3D style from Microsoft Fluent Emoji
 * 2. Fall back to Flat style if 3D fails
 * 3. Fall back to native emoji if both CDN attempts fail
 * 
 * @param {Object} props
 * @param {string} props.emoji - Emoji character to render
 * @param {string} props.size - Size class: 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', or custom
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.alt - Alt text (defaults to emoji)
 * @param {Object} props.style - Inline styles
 * 
 * @example
 * <FluentEmoji emoji="🔥" size="lg" />
 * <FluentEmoji emoji="🌌" className="animate-spin" />
 * <FluentEmoji emoji={gameState.avatar} size="2xl" />
 */
const FluentEmoji = ({ 
  emoji, 
  size = 'md', 
  className = '', 
  alt,
  style = {},
  ...props 
}) => {
  const [currentSrc, setCurrentSrc] = React.useState(() => {
    const urls = getEmojiURL(emoji);
    return urls.primary;
  });
  const [useFallback, setUseFallback] = React.useState(false);
  const [useNative, setUseNative] = React.useState(false);

  // Size mapping
  const sizeClasses = {
    xs: 'w-4 h-4',      // 16px
    sm: 'w-5 h-5',      // 20px
    md: 'w-6 h-6',      // 24px
    lg: 'w-8 h-8',      // 32px
    xl: 'w-12 h-12',    // 48px
    '2xl': 'w-16 h-16', // 64px
    '3xl': 'w-24 h-24', // 96px
  };

  const sizeClass = sizeClasses[size] || size;

  // Handle image load error with cascading fallbacks
  const handleError = React.useCallback(() => {
    const urls = getEmojiURL(emoji);
    
    if (!useFallback) {
      // First error: try Flat style
      markEmojiFailure(emoji, '3D');
      setCurrentSrc(urls.fallback);
      setUseFallback(true);
    } else if (!useNative) {
      // Second error: fall back to native emoji
      markEmojiFailure(emoji, 'Flat');
      setUseNative(true);
    }
  }, [emoji, useFallback, useNative]);

  // Reset state when emoji changes
  React.useEffect(() => {
    const urls = getEmojiURL(emoji);
    setCurrentSrc(urls.primary);
    setUseFallback(false);
    setUseNative(false);
  }, [emoji]);

  // If both CDN attempts failed, render native emoji
  if (useNative) {
    return (
      <span
        className={`inline-block ${sizeClass} ${className}`.trim()}
        style={{ fontSize: 'inherit', lineHeight: 1, ...style }}
        title={emoji}
        {...props}
      >
        {emoji}
      </span>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt || emoji}
      className={`fluent-emoji inline-block ${sizeClass} ${className}`.trim()}
      draggable={false}
      loading="lazy"
      title={emoji}
      style={style}
      onError={handleError}
      {...props}
    />
  );
};

export default FluentEmoji;

/**
 * FluentEmojiText Component
 * 
 * Renders text with inline Fluent Emoji
 * Automatically converts emoji in text to Fluent Emoji images
 * 
 * @param {Object} props
 * @param {string} props.children - Text with emoji
 * @param {string} props.className - CSS classes for container
 * 
 * @example
 * <FluentEmojiText>Complete 3 quests today! 🔥</FluentEmojiText>
 */
export const FluentEmojiText = ({ children, className = '', ...props }) => {
  const EMOJI_REGEX = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;

  const renderTextWithEmoji = (text) => {
    if (typeof text !== 'string') return text;

    const parts = [];
    let lastIndex = 0;
    let match;
    let key = 0;

    const regex = new RegExp(EMOJI_REGEX);
    
    while ((match = regex.exec(text)) !== null) {
      // Add text before emoji
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Add emoji as FluentEmoji component
      parts.push(
        <FluentEmoji 
          key={`emoji-${key++}`} 
          emoji={match[0]} 
          size="md" 
          className="inline-block align-middle"
        />
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <span className={className} {...props}>
      {renderTextWithEmoji(children)}
    </span>
  );
};
