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
		storeKeyPair(name, email,
					 key.publicKeyArmored,
					 key.privateKeyArmored);
	});
}

function storeKeyPair(name, email, pubKey, privKey) {
	var details = {};
	details[email] = {
		"name": name,
		"pubKey": pubKey,
		"privKey": privKey
	};
	chrome.storage.local.set(details, function() {
		console.log("Stored key pair at", email);
	});
}

function storeKey(name, email, pubKey) {
	var details = {};
	details[email] = {
		"name": name,
		"pubKey": pubKey
	};
	chrome.storage.local.set(details, function() {
		console.log("Stored key pair at", email);
	});
}

function getKeys() {
	chrome.storage.local.get(function(keys) {
		var emailList = document.getElementById("emails");
		for(var key in keys) {
			var item = document.createElement("li");
			item.innerHTML = key;
			emailList.appendChild(item);
		}
	});
}

getKeys();