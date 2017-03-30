InboxSDK.load('1.0', 'sdk_PGPmail_b4932b6799').then(function(sdk) {
	sdk.Compose.registerComposeViewHandler(function(composeView) {
		composeView.addButton({
			title: "Secure Send",
			iconClass: "encryptButton",
			iconUrl: chrome.extension.getURL("resources/images/encryptButton.png"),
			onClick: function(clickEvent) {
				var address = composeView.getToRecipients();//[0].emailAddress;
				chrome.storage.local.get(function(keys) {
					var pubKeys = [];
					for(var i = 0; i < address.length; i++) {
						pubKeys = pubKeys.concat(keys[address[i].emailAddress].pubKey);
					}
					encrypt(composeView.getHTMLContent(), pubKeys)
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
								var passphrase = prompt("Enter your passphrase");
								var key = keys[sdk.User.getEmailAddress()];
								decryptKey(key["privKey"], passphrase).then(function(decryptedKey) {
									console.log("decrypting key");
									decrypt(rawMessage, decryptedKey).then(function(plaintext) {
										var html = "";
										var lines = plaintext.data.split("\n");
										for(line in lines) {
											html += lines[line] + "<br>";
										}
										document.getElementById(message.id).firstChild.innerHTML = html;
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
