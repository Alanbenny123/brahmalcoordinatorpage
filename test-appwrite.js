/**
 * Appwrite Connection Diagnostic Tool
 * Run: node test-appwrite.js
 */

require('dotenv').config();
const { Client, Databases } = require('node-appwrite');

console.log('\n🔍 Appwrite Connection Diagnostic\n');
console.log('='.repeat(50));

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('  APPWRITE_ENDPOINT:', process.env.APPWRITE_ENDPOINT || '❌ NOT SET');
console.log('  APPWRITE_PROJECT_ID:', process.env.APPWRITE_PROJECT_ID ? process.env.APPWRITE_PROJECT_ID.substring(0, 20) + '...' : '❌ NOT SET');
console.log('  APPWRITE_API_KEY:', process.env.APPWRITE_API_KEY ? process.env.APPWRITE_API_KEY.substring(0, 20) + '...' : '❌ NOT SET');
console.log('  APPWRITE_DATABASE_ID:', process.env.APPWRITE_DATABASE_ID || '❌ NOT SET');

// Test connection
async function testConnection() {
  // First, test the endpoint from .env
  const envEndpoint = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
  
  const endpoints = [
    { name: 'Your Endpoint', url: envEndpoint },
    { name: 'US East', url: 'https://cloud.appwrite.io/v1' },
    { name: 'EU West', url: 'https://eu.cloud.appwrite.io/v1' },
    { name: 'Asia Pacific', url: 'https://ap.cloud.appwrite.io/v1' },
    { name: 'Singapore', url: 'https://sgp.cloud.appwrite.io/v1' }
  ];

  console.log('\n🌐 Testing Endpoints:');
  console.log('-'.repeat(50));

  for (const ep of endpoints) {
    try {
      const client = new Client();
      client
        .setEndpoint(ep.url)
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

      const databases = new Databases(client);
      
      // Try to get a database (this will verify project access)
      await databases.get(process.env.APPWRITE_DATABASE_ID);
      
      console.log(`  ✅ ${ep.name} (${ep.url}) - Project accessible!`);
      
      // Try to access the database
      try {
        const db = await databases.get(process.env.APPWRITE_DATABASE_ID);
        console.log(`     ✅ Database found: ${db.name}`);
        
        // Try to list collections
        const collections = await databases.listCollections(process.env.APPWRITE_DATABASE_ID);
        console.log(`     ✅ Collections found: ${collections.total}`);
        
        // Try to query events
        const events = await databases.listDocuments(
          process.env.APPWRITE_DATABASE_ID,
          process.env.APPWRITE_COLLECTION_EVENTS || 'events',
          []
        );
        console.log(`     ✅ Events collection accessible (${events.total} documents)`);
        
        if (events.total === 0) {
          console.log(`     ⚠️  No events found - you need to add test data!`);
        }
        
        return true; // Success!
      } catch (dbError) {
        console.log(`     ❌ Database error: ${dbError.message}`);
      }
      
    } catch (error) {
      const shortMsg = error.message.split('.')[0];
      console.log(`  ❌ ${ep.name} (${ep.url}) - ${shortMsg}`);
    }
  }

  return false;
}

// Run test
testConnection()
  .then(success => {
    console.log('\n' + '='.repeat(50));
    if (success) {
      console.log('\n✅ Connection successful!');
      console.log('\n📝 Next steps:');
      console.log('  1. Make sure test event exists in Appwrite');
      console.log('  2. Event ID: TEST001, Password: test123');
      console.log('  3. Restart server: npm start');
    } else {
      console.log('\n❌ Connection failed!');
      console.log('\n💡 Troubleshooting:');
      console.log('  1. Check Project ID in Appwrite Console → Settings → General');
      console.log('  2. Verify API Key has databases.read and databases.write permissions');
      console.log('  3. Ensure Database ID is correct');
      console.log('  4. Check if project is in a different region');
    }
    console.log('\n');
  })
  .catch(err => {
    console.error('\n❌ Fatal error:', err.message);
    process.exit(1);
  });

