function encrypt(message, publicKey) {
	var options = {
		data: message,
		publicKeys: openpgp.key.readArmored(publicKey).keys
	};

	return openpgp.encrypt(options);
}

function decrypt(cipher, privateKey, password) {
	var options = {
		privateKey: openpgp.key.readArmored(privateKey).keys[0],
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
