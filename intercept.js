InboxSDK.load('1.0', 'sdk_PGPmail_b4932b6799').then(function(sdk) {
	function passwordPrompt(callback) {
		var div = document.createElement("div");
		div.id = "passphrasePopup";
		div.style = "z-index: 99; \
                     width: 200px; \
                     height: 80px; \
                     padding: 10px 10px 30px 10px; \
                     background-color: #f1f1f1; \
                     background-image: -webkit-linear-gradient(top,#f5f5f5,#f1f1f1); \
                     position: absolute; \
                     top: 50%; \
                     left: 50%; \
                     margin: -70px 0 0 -170px; \
                     display: block; \
                     border: 1px solid rgba(0,0,0,0.1);"

		var pwDiv = document.createElement("h3");
		pwDiv.style = "margin: 5px";
		pwDiv.innerHTML = "Enter Passphrase";

		var input = document.createElement("input");
		input.id="pgpPassphrase";
		input.className = "gbqfif";
		input.style = "border: 1px solid rgba(0,0,0,0.1); \
                       margin: 5px; \
                       z-index: 6; \
                       left: 0px;";
		input.type = "password";

		var button = document.createElement("button");
		button.innerHTML = "Done";
		button.className = "T-I T-I-KE";
		button.style = "margin: 5px";
		button.onclick = callback;
		div.appendChild(pwDiv);
		div.appendChild(input);
		div.appendChild(button);
		document.body.appendChild(div);

		// Auto focus input box
		input.focus();
		input.select();
	}

	sdk.Compose.registerComposeViewHandler(function(composeView) {
		composeView.addButton({
			title: "Secure Send",
			iconClass: "encryptButton",
			iconUrl: chrome.extension.getURL("resources/images/encryptButton.png"),
			onClick: function(clickEvent) {
				var address = composeView.getToRecipients().concat(composeView.getCcRecipients());
				chrome.storage.local.get(function(keys) {
					var pubKeys = [];
					for(var i = 0; i < address.length; i++) {
						pubKeys = pubKeys.concat(keys[address[i].emailAddress].pubKey);
					}

					passwordPrompt(function() {
						var passphrase = document.getElementById("pgpPassphrase").value;
						document.getElementById("passphrasePopup").remove();

						decryptKey(keys[sdk.User.getEmailAddress()].privKey, passphrase)
							.then(function(decryptedKey) {
								encrypt(composeView.getHTMLContent(), pubKeys, decryptedKey)
									.then(function(ciphertext) {
									    var html = "";
									    var lines = ciphertext.data.split("\n");
									    for(line in lines) {
									    	html += lines[line] + "<br>";
									    }
									    composeView.setBodyHTML(html);
									    composeView.send();
									});
							});
					});
				});
			}
		});

		var encryptButton = document.getElementsByClassName("inboxsdk__button")[0];
		encryptButton.style = "display: none";

		composeView.on("recipientsChanged", function(event) {
			chrome.storage.local.get(function(keys) {
				if(canEncrypt(keys)) {
					encryptButton.style = "";
				} else {
					encryptButton.style = "display: none";
				}
			});
		});

		function canEncrypt(keys) {
			// Don't encrypt if people BCC'd
			if(composeView.getBccRecipients().length !== 0) {
				return false;
			}
			var recipients = composeView.getToRecipients().concat(composeView.getCcRecipients());
			var ownedKeys = 0;
			for(var i = 0; i < recipients.length; i++) {
				if(keys[recipients[i].emailAddress] !== undefined) {
					ownedKeys++;
				}
			}
			if(ownedKeys < recipients.length || ownedKeys === 0) {
				return false;
			}
			return true;
		}
	});

	sdk.Conversations.registerThreadViewHandler(function(threadView) {
		var messageViews = threadView.getMessageViewsAll();
		for(var i = 0; i < messageViews.length; i++) {
			messageViews[i].on("load", function(event) {
				event.messageView.addToolbarButton({
					section: sdk.Conversations.MessageViewToolbarSectionNames.MORE,
					title: "Decrypt",
					iconClass: "decryptButton",
					iconUrl: chrome.extension.getURL("resources/images/encryptButton.png"),
					onClick: function(clickEvent) {
						var message = event.messageView.getBodyElement();
						var rawMessage = message.textContent || message.innerText || "";
						var isEncrypted = /-----BEGIN PGP MESSAGE-----(.*\n)*-----END PGP MESSAGE-----/g;
						// If the message is encrypted
						if(isEncrypted.test(rawMessage)) {
							chrome.storage.local.get(sdk.User.getEmailAddress(), function(keys) {
								passwordPrompt(function() {
									var passphrase = document.getElementById("pgpPassphrase").value;
									document.getElementById("passphrasePopup").remove();

									var key = keys[sdk.User.getEmailAddress()];
									decryptKey(key["privKey"], passphrase).then(function(decryptedKey) {
										var sender = event.messageView.getSender().emailAddress;
										chrome.storage.local.get(sender, function(keys) {
											var sigKey = keys[sender];
											decrypt(rawMessage, sigKey["pubKey"], decryptedKey)
												.then(function(plaintext) {
													var html = "";
													if(plaintext.signatures[0].valid) {
														html += "<h4 style='background-color: #FCF8E3; border: 1px solid rgba(0, 0, 0, 0.0980392); padding: 10px'>Message has been verified <img src="+chrome.extension.getURL("resources/images/verified.png")+" style='height:15px'></h4>";
													}
													var lines = plaintext.data.split("\n");
													for(line in lines) {
														html += lines[line] + "<br>";
													}
													document.getElementById(message.id).firstChild.innerHTML = html;
												});
										});
									});
								});
							});
						}
					}
				});
			});
		}
	});
});
