// API utility for backend communication
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

/**
 * Authenticate with Google OAuth token
 */
export const authenticateWithGoogle = async (googleToken) => {
  console.log('🔵 [API] authenticateWithGoogle called');
  console.log('🔵 [API] API_BASE_URL:', API_BASE_URL);
  console.log('🔵 [API] Sending POST to /api/auth/google');
  
  const requestBody = { token: googleToken };
  console.log('🔵 [API] Request body keys:', Object.keys(requestBody));
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('🔵 [API] Response status:', response.status, response.statusText);
    
    // Clone response before reading body to avoid "body already used" error
    const responseClone = response.clone();
    
    if (!response.ok) {
      try {
        const error = await response.json();
        console.error('🔴 [API] Backend error response:', error);
        throw new Error(error.detail || 'Authentication failed');
      } catch (jsonError) {
        // If JSON parsing fails, use text
        const errorText = await responseClone.text();
        console.error('🔴 [API] Backend error (text):', errorText);
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('🟢 [API] Backend success response received');
    return data;
  } catch (fetchError) {
    console.error('🔴 [API] Fetch error:', {
      message: fetchError.message,
      stack: fetchError.stack
    });
    throw fetchError;
  }
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
    try {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch user data');
    } catch {
      throw new Error(`Failed to fetch user data: ${response.status}`);
    }
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
    try {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update user data');
    } catch {
      throw new Error(`Failed to update user data: ${response.status}`);
    }
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
    try {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to redeem promo code');
    } catch {
      throw new Error(`Failed to redeem promo code: ${response.status}`);
    }
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
