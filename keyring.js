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
		//var result = JSON.stringify(key);
		//var url = 'data:application/json;base64,' + btoa(result);
		//chrome.downloads.download({
		//	url: url,
		//	filename: 'filename_of_exported_file.json'
		//});
	});
};

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
			// Set export button
			ebutton = document.createElement("button");
			ebutton.innerHTML = "&#8599;";
			ebutton.style.display = "inline";
			ebutton.style.margin = "5px";
			ebutton.onclick = exportKey;
			ebutton.id = key;
			ebutton.className = "btn btn-info btn-xs"
			// Set url
			p = document.createElement('p');
			p.style.display = "inline"
			p.innerText += key;
			// Stick inside div
			div = document.createElement("div")
			div.appendChild(xbutton);
            div.appendChild(p);
			div.appendChild(ebutton);

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
