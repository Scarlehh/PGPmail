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

function removeKey() {
	var button = event.target;
	chrome.storage.local.remove(button.id);
	window.location.reload();
}

function setEmailList() {
	chrome.storage.local.get(function(keys) {
		var pubList = document.getElementById("pubEmails");
		var privList = document.getElementById("privEmails");

		for(var key in keys) {
			// Set button
			button = document.createElement("button");
			button.innerText = "x";
			button.style.display = "inline";
			button.style.margin = "5px";
			button.onclick = removeKey;
			button.id = key;
			button.className = "btn btn-danger btn-xs"
			// Set url
			p = document.createElement('p');
			p.style.display = "inline"
			p.innerText += key;
			// Stick inside div
			div = document.createElement("div")
			div.appendChild(button);
            div.appendChild(p);

			if(keys[key].privKey !== undefined) {
				privList.appendChild(div);
			} else {
				pubList.appendChild(div);
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
