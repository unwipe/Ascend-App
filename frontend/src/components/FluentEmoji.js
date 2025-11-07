import React from 'react';
import { getEmojiURL } from '../utils/fluentEmoji';

/**
 * FluentEmoji Component
 * 
 * Renders a single emoji using Microsoft Fluent Emoji assets
 * Use this for explicit emoji rendering (avatars, icons, etc.) instead of DOM parsing
 * 
 * @param {Object} props
 * @param {string} props.emoji - Emoji character to render
 * @param {string} props.size - Size class: 'sm', 'md', 'lg', 'xl', '2xl', or custom
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

  return (
    <img
      src={getEmojiURL(emoji)}
      alt={alt || emoji}
      className={`fluent-emoji inline-block ${sizeClass} ${className}`.trim()}
      draggable={false}
      loading="lazy"
      title={emoji}
      style={style}
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
