/**
 * PASSWORD HASH GENERATOR
 * 
 * Run this script to generate a bcrypt hash for your password:
 * node generate-hash.js YourSecurePassword
 * 
 * Then copy the output and paste it in the main-login route.ts file
 */

const bcrypt = require('bcryptjs');

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Please provide a password');
  console.log('\nUsage: node generate-hash.js YourSecurePassword\n');
  process.exit(1);
}

// Generate hash
const hash = bcrypt.hashSync(password, 10);

console.log('\n✅ Password hash generated successfully!\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Password:', password);
console.log('Hash:', hash);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📝 Copy the hash above and update this line in:');
console.log('   app/api/coordinator/main-login/route.ts\n');
console.log('   const MAIN_COORDINATOR_PASS = process.env.MAIN_COORDINATOR_PASS || "PASTE_HASH_HERE";\n');
