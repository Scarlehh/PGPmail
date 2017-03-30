function encrypt(message, publicKeys) {
	for(var i = 0; i < publicKeys.length; i++) {
		publicKeys[i] = openpgp.key.readArmored(publicKeys[i]).keys[0];
	}
	var options = {
		data: message,
		publicKeys: publicKeys
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
