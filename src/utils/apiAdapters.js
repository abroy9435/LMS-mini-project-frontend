export const apiFetch = async (url, options = {}, getToken) => {
  try {
    // 1. Get the latest Clerk token
    const token = await getToken();

    // 2. Setup standard headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // 3. Attach Authorization if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // 4. Fire the request
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 5. Standardize error handling
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Request Failed: ${response.status}`);
    }

    // 6. Return parsed JSON
    return await response.json();
  } catch (error) {
    console.error(`[API Fetch Error] ${url}:`, error);
    throw error;
  }
};