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
