const bcrypt = require('bcryptjs');

const password = '$Fgff7#bd32';
console.log('Password to hash:', password);

const hash = bcrypt.hashSync(password, 10);
console.log('Generated hash:', hash);

const match = bcrypt.compareSync(password, hash);
console.log('Verification:', match ? '✅ MATCH' : '❌ NO MATCH');
