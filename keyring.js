function newKeyPair(name, email, password) {
	var options = {
		userIds: [{
			name: name,
			email: email
		}],
		numBits: 4096,
		passphrase: password
	}

	openpgp.generateKey(options).then(function(key) {
		console.log("Generated key pair");
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
		console.log("Stored key at", email);
		window.location.reload();
	});
}

function removeKey() {
	var button = event.target;
	chrome.storage.local.remove(button.id);
	window.location.reload();
}

// Popup box for displaying public key to be exported
function infoBox(text) {
	var div = document.createElement("div");
	div.id = "infoPopup";
	div.className = "container"
	div.style = "z-index: 99; \
                 width: 100%; \
                 position: absolute; \
                 top: 0%; \
                 left: 0%; \
                 display: block;"

	var disp = document.createElement("p");
	disp.style = "margin: 5px";
	var html = "";
	var lines = text.split("\n");
	for(line in lines) {
		html += lines[line] + "<br>";
	}
	disp.innerHTML = html;

	var button = document.createElement("button");
	button.innerHTML = "Done";
	button.className = "btn btn-success";
	button.style = "margin: 5px";
	button.onclick = function() {
		document.getElementById("keyring").style="";
		document.getElementById("infoPopup").remove();
	};

	div.appendChild(disp);
	div.appendChild(button);
	document.body.appendChild(div);

	document.getElementById("keyring").style="visibility: hidden";
}

function exportKey() {
	var button = event.target;
	chrome.storage.local.get(button.id, function(key) {
		infoBox(key[button.id]["pubKey"]);
	});
};

// Popup of edit boxes for key to be edited
function editBox(emailAddress, key) {
	var div = document.createElement("div");
	div.id = "editPopup";
	div.className = "container"
	div.style = "z-index: 99; \
                 width: 100%; \
                 position: absolute; \
                 top: 0%; \
                 left: 0%; \
                 display: block;"

	var form = document.createElement("div");
	form.className = "form-group"
	var name = document.createElement("input");
	name.style = "margin: 5px";
	name.className = "form-control keyEdit";
	name.type = "text";
	name.placeholder="Name";
	name.name="name";
	name.value = key.name;
	var email = document.createElement("input");
	email.style = "margin: 5px";
	email.className = "form-control keyEdit";
	email.type = "email";
	email.placeholder="Email";
	email.name="email";
	email.style = "margin: 5px";
	email.value = emailAddress;
	var pubKey = document.createElement("textarea");
	pubKey.style = "margin: 5px";
	pubKey.className = "form-control keyEdit";
	pubKey.type = "text";
	pubKey.placeholder="Public Key";
	pubKey.name="pubkey";
	pubKey.style = "margin: 5px";
	pubKey.rows="20";
	pubKey.value = key.pubKey;
	var privKey = document.createElement("textarea");
	privKey.style = "margin: 5px";
	privKey.className = "form-control keyEdit";
	privKey.type = "text";
	privKey.placeholder="Private Key (Optional)";
	privKey.name="privkey";
	privKey.style = "margin: 5px";
	privKey.rows="20";
	if(key.privKey !== undefined) {
		privKey.value = key.privKey;
	}

	form.appendChild(name);
	form.appendChild(email);
	form.appendChild(pubKey);
	form.appendChild(privKey);

	var button = document.createElement("button");
	button.innerHTML = "Done";
	button.className = "btn btn-success";
	button.style = "margin: 5px";
	button.onclick = function() {
		document.getElementById("keyring").style="";
		var elements = document.getElementsByClassName("keyEdit");
		document.getElementById("editPopup").remove();
		console.log(elements);
		if(privKey.value === "") {
			storeKey(name.value,
					 email.value,
					 pubKey.value);
		} else {
			storeKeyPair(name.value,
						 email.value,
						 pubKey.value,
						 privKey.value);
		}
	};

	div.appendChild(form);
	div.appendChild(button);
	document.body.appendChild(div);

	document.getElementById("keyring").style="visibility: hidden";
}

function editKey() {
	var button = event.target;
	chrome.storage.local.get(button.id, function(key) {
		editBox(button.id, key[button.id]);
	});
};

// Set the popup list of public/private keys
function setEmailList() {
	chrome.storage.local.get(function(keys) {
		var pubList = document.getElementById("pubEmails");
		var privList = document.getElementById("privEmails");

		for(var key in keys) {
			// Set x button
			xbutton = document.createElement("button");
			xbutton.innerHTML = "&#10006;";
			xbutton.style.display = "inline";
			xbutton.style.margin = "5px";
			xbutton.onclick = removeKey;
			xbutton.id = key;
			xbutton.className = "btn btn-danger btn-xs"
			// Set edit button
			editButton = document.createElement("button");
			editButton.innerHTML = "&#9998;";
			editButton.style.display = "inline";
			editButton.style.margin = "5px";
			editButton.onclick = editKey;
			editButton.id = key;
			editButton.className = "btn btn-warning btn-xs"
			// Set export button
			exportButton = document.createElement("button");
			exportButton.innerHTML = "&#8599;";
			exportButton.style.display = "inline";
			exportButton.style.margin = "5px";
			exportButton.onclick = exportKey;
			exportButton.id = key;
			exportButton.className = "btn btn-info btn-xs"
			// Set url
			p = document.createElement('p');
			p.style.display = "inline"
			p.innerText += keys[key].name + " (" + key + ")";
			// Stick inside div
			div = document.createElement("div")
			div.appendChild(xbutton);
			div.appendChild(editButton);
			div.appendChild(exportButton);
            div.appendChild(p);

			if(keys[key].privKey !== undefined) {
				privList.appendChild(div);
			} else {
				pubList.appendChild(div);
			}
		}
	});
}

// Listen for new key generation/additions
document.addEventListener('DOMContentLoaded', function() {
	// Backend for key save
    var keySaveButton = document.getElementById('keySaveButton');
    keySaveButton.addEventListener('click', function() {
		var elements = document.getElementsByClassName("keySave");
		if(elements['privKey'].value === "") {
			storeKey(elements['name'].value,
					 elements['email'].value,
					 elements['pubKey'].value);
		} else {
			storeKeyPair(elements['name'].value,
						 elements['email'].value,
						 elements['pubKey'].value,
						 elements['privKey'].value);
		}
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
