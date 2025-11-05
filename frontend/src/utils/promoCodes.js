// Promo Codes System

/**
 * Available promo codes
 * Structure: 
 * 'CODE': { type: 'xp'|'coins'|'item', amount: number, description: string, reusable: boolean }
 */
export const PROMO_CODES = {
  'TESTXP150': { 
    type: 'xp', 
    amount: 150, 
    description: '+150 XP',
    reusable: true // Can be used multiple times (for testing)
  },
  // Future promo codes can be added here
  // Examples:
  // 'WELCOME100': { type: 'coins', amount: 100, description: '+100 Coins', reusable: false },
  // 'BOOST2X': { type: 'item', itemId: 'xp_multiplier', amount: 1, description: 'Free XP Multiplier', reusable: false },
};

/**
 * Validate and redeem a promo code
 * @param {string} code - The promo code to redeem
 * @param {Array} usedCodes - Array of previously used codes
 * @returns {Object} - { success: boolean, reward: Object|null, message: string }
 */
export const redeemPromoCode = (code, usedCodes = []) => {
  const upperCode = code.trim().toUpperCase();
  
  // Check if code exists
  if (!PROMO_CODES[upperCode]) {
    return {
      success: false,
      reward: null,
      message: '❌ Invalid promo code'
    };
  }
  
  const promoData = PROMO_CODES[upperCode];
  
  // Check if code is already used (for non-reusable codes)
  if (!promoData.reusable && usedCodes.includes(upperCode)) {
    return {
      success: false,
      reward: null,
      message: '❌ Promo code already used'
    };
  }
  
  // Return success with reward data
  return {
    success: true,
    reward: {
      type: promoData.type,
      amount: promoData.amount,
      itemId: promoData.itemId,
      code: upperCode
    },
    message: `✅ Promo code redeemed! ${promoData.description}`
  };
};

/**
 * Get list of all promo codes (for admin/debug purposes)
 */
export const getAllPromoCodes = () => {
  return Object.keys(PROMO_CODES);
};

/**
 * Check if a code is reusable
 */
export const isCodeReusable = (code) => {
  const upperCode = code.trim().toUpperCase();
  return PROMO_CODES[upperCode]?.reusable || false;
};
