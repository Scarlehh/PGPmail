InboxSDK.load('1.0', 'sdk_PGPmail_b4932b6799').then(function(sdk) {
	sdk.Compose.registerComposeViewHandler(function(composeView) {
		composeView.addButton({
			title: "Secure Send",
			iconClass: "encryptButton",
			iconUrl: chrome.extension.getURL("resources/images/encryptButton.png"),
			onClick: function(clickEvent) {
				var address = composeView.getToRecipients()[0].emailAddress;
				chrome.storage.local.get(address, function(key) {
					for(var add in key) {
						console.log(clickEvent);
						encrypt(composeView.getHTMLContent(), key[add].pubKey)
							.then(function(ciphertext) {
								var html = "";
								var lines = ciphertext.data.split("\n");
								for(line in lines) {
									html += lines[line] + "<br>";
								}
								composeView.setBodyHTML(html);
								composeView.send();
							});
					}
				});
			}
		});

		var encryptButton = document.getElementsByClassName("inboxsdk__button")[0];
		encryptButton.style = "display: none";

		composeView.on("toContactAdded", function(event) {
			console.log(event.contact.emailAddress, "added.");
			chrome.storage.local.get(function(keys) {
				for(var key in keys) {
					if(key === event.contact.emailAddress) {
						encryptButton.style = "";
					}
				}
			});
		});

		composeView.on("toContactRemoved", function(event) {
			console.log(event.contact.emailAddress, "removed.");
			encryptButton.style = "display: none";
		});
	});

	sdk.Conversations.registerThreadViewHandler(function(threadView) {
		var messageViews = threadView.getMessageViewsAll();
		for(var i = 0; i < messageViews.length; i++) {
			messageViews[i].on("load", function(event) {
				var recipients = event.messageView.getRecipients();
				for(var j = 0; j < recipients.length; j++) {
					// If the message is sent to the user logged in
					if(recipients[j].emailAddress === sdk.User.getEmailAddress()) {
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
										decrypt(rawMessage, key["privKey"], passphrase);
									});
								}
							}
						});
					}
				}
			});
		}
	});
});
