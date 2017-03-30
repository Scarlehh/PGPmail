function newKeyPair(name, email, password) {
	var options = {
		userIds: [{
			name: name,
			email: email
		}],
		numBits: 4096,
		passphrase: password
	}

	console.log("generating");
	openpgp.generateKey(options).then(function(key) {
		console.log("generate");
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
		window.location.reload();
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

function setEmailList() {
	chrome.storage.local.get(function(keys) {
		var pubList = document.getElementById("pubEmails");
		var privList = document.getElementById("privEmails");
		for(var key in keys) {
			var item = document.createElement("li");
			item.innerHTML = key;
			if(keys[key].privKey !== undefined) {
				privList.appendChild(item);
			} else {
				pubList.appendChild(item);
			}
		}
	});
}

document.addEventListener('DOMContentLoaded', function() {
	// Backend for key save
    var keySaveButton = document.getElementById('keySaveButton');
    keySaveButton.addEventListener('click', function() {
		var elements = document.getElementsByClassName("keySave");
        storeKey(elements['name'].value,
				 elements['email'].value,
				 elements['pubKey'].value);
		window.location.reload();
    });

	// Backend for key gen
	var keyGenButton = document.getElementById('keyGenButton');
	keyGenButton.addEventListener('click', function() {
		var elements = document.getElementsByClassName("keyGen");
        newKeyPair(elements['name'].value,
				   elements['email'].value,
				   elements['passphrase'].value);
    });
});

setEmailList();
