// Quick diagnostic to check if data exists and API works
async function checkAdminStats() {
  try {
    const response = await fetch('/api/admin/stats');
    console.log('=== ADMIN STATS API CHECK ===');
    console.log('Response status:', response.status);
    console.log('Response OK:', response.ok);
    
    const data = await response.json();
    console.log('Response data:', data);
    console.log('Total Users:', data.totalUsers);
    console.log('Total Transactions:', data.totalTransactions);
    console.log('Open Disputes:', data.openDisputes);
    console.log('Platform Volume:', data.platformVolume);
    
    return data;
  } catch (error) {
    console.error('=== ERROR FETCHING ADMIN STATS ===', error);
  }
}

// Run it immediately when loaded
checkAdminStats();
