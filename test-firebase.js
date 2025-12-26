/**
 * Firebase Storage Connection Test
 * Run: node test-firebase.js
 */

const { storage } = require('./firebase');

async function testFirebase() {
  console.log('\n🧪 Testing Firebase Storage Connection...\n');

  if (!storage) {
    console.error('❌ Firebase Storage not initialized');
    console.error('   Make sure serviceAccountKey.json exists in project root');
    process.exit(1);
  }

  try {
    const bucket = storage.bucket();
    console.log('✅ Firebase Storage initialized successfully!');
    console.log(`📦 Bucket Name: ${bucket.name}`);
    
    // Test: List files (first 5)
    console.log('\n📁 Testing file access...');
    const [files] = await bucket.getFiles({ maxResults: 5 });
    console.log(`   Found ${files.length} file(s) in bucket`);
    
    if (files.length > 0) {
      console.log('   Sample files:');
      files.forEach((file, i) => {
        console.log(`   ${i + 1}. ${file.name}`);
      });
    } else {
      console.log('   (Bucket is empty - this is normal for new projects)');
    }

    // Test: Create a test file
    console.log('\n📤 Testing file upload...');
    const testFileName = `test/test-${Date.now()}.txt`;
    const testFile = bucket.file(testFileName);
    
    await testFile.save('Firebase Storage test file', {
      metadata: {
        contentType: 'text/plain',
      }
    });
    
    console.log(`   ✅ Test file created: ${testFileName}`);
    
    // Clean up: Delete test file
    await testFile.delete();
    console.log('   🗑️  Test file deleted (cleanup)');
    
    console.log('\n✅ All Firebase Storage tests passed!\n');
    
  } catch (error) {
    console.error('\n❌ Firebase Storage test failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.code === 'ENOENT') {
      console.error('\n   💡 Tip: Check if serviceAccountKey.json exists');
    } else if (error.code === 403) {
      console.error('\n   💡 Tip: Check Firebase Storage permissions');
    } else if (error.code === 404) {
      console.error('\n   💡 Tip: Verify bucket name in service account key');
    }
    
    process.exit(1);
  }
}

testFirebase();

