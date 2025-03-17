const bcrypt = require('bcryptjs');

async function testBcrypt() {
    const password = "12345678"; // Mot de passe à tester
    const hash = await bcrypt.hash(password, 10); // Hasher le mot de passe

    console.log("🔹 Hash généré:", hash);

    const isMatch = await bcrypt.compare(password, hash); // Vérifier avec bcrypt
    console.log("✅ Test comparaison immédiate:", isMatch);
}

testBcrypt();
