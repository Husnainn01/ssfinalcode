export async function fetchDashboardStats() {
  try {
    const response = await fetch('/api/dashboard/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch dashboard stats');
    }

    const data = await response.json();
    if (!data) {
      throw new Error('No data received from the server');
    }

    return data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error(`Failed to load dashboard data: ${error.message}`);
  }
}
