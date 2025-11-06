// API utility for backend communication
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

/**
 * Authenticate with Google OAuth token
 */
export const authenticateWithGoogle = async (googleToken) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: googleToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Authentication failed');
  }

  return response.json();
};

/**
 * Get user data by Google ID
 */
export const getUserData = async (googleId, jwtToken) => {
  const response = await fetch(`${API_BASE_URL}/api/user/${googleId}`, {
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch user data');
  }

  return response.json();
};

/**
 * Update user data
 */
export const updateUserData = async (updateData, jwtToken) => {
  const response = await fetch(`${API_BASE_URL}/api/user/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`,
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update user data');
  }

  return response.json();
};

/**
 * Redeem promo code
 */
export const redeemPromoCode = async (code, jwtToken) => {
  const response = await fetch(`${API_BASE_URL}/api/promo/redeem`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`,
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to redeem promo code');
  }

  return response.json();
};

/**
 * Check if user is online (can reach backend)
 */
export const checkOnlineStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/`, {
      method: 'GET',
      cache: 'no-cache',
    });
    return response.ok;
  } catch {
    return false;
  }
};
