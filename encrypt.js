function encrypt(message, publicKey) {
	var options = {
		data: message,
		publicKeys: openpgp.key.readArmored(publicKey).keys
	};

	return openpgp.encrypt(options);
}

function decryptKey(privateKey, password) {
	var options = {
		privateKey: openpgp.key.readArmored(privateKey).keys[0],
		passphrase: password
	};

	return openpgp.decryptKey(options);
}

function decrypt(cipher, decryptedKey) {
	options = {
		message: openpgp.message.readArmored(cipher),
		privateKey: decryptedKey.key
	};

	return openpgp.decrypt(options);
}
