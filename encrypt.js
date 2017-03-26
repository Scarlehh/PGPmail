function newKeyPair(name, email, password) {
	var options = {
		userIds: [{
			name: name,
			email: email,
		}],
		numBits: 4096,
		passphrase: password
	}

	openpgp.generateKey(options).then(function(key) {
		console.log(key.privateKeyArmored);
		console.log(pubkey = key.publicKeyArmored);
	});
}

function encrypt(message, publicKey) {
	var options = {
		data: message,
		publicKeys: openpgp.key.readArmored(pubkey).keys
	};

	return openpgp.encrypt(options).then(function(ciphertext) {
		console.log(ciphertext.data);
	});
}

function decrypt(cipher, privateKey, password) {
	var options = {
		privateKey: openpgp.key.readArmored(privkey).keys[0],
		passphrase: password
	};

	openpgp.decryptKey(options).then(function(decryptedKey) {
		options = {
			message: openpgp.message.readArmored(cipher),
			privateKey: decryptedKey.key
		};

		openpgp.decrypt(options).then(function(plaintext) {
			console.log(plaintext.data)
		});
	});
}
