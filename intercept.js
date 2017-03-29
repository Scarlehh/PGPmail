InboxSDK.load('1.0', 'sdk_PGPmail_b4932b6799').then(function(sdk) {
	sdk.Compose.registerComposeViewHandler(function(composeView){

		composeView.addButton({
			title: "Encrypt",
			iconClass: "encryptButton",
			iconUrl: chrome.extension.getURL("resources/images/encryptButton.png"),
			onClick: function(event) {
				var address = composeView.getToRecipients()[0].emailAddress;
				chrome.storage.local.get(address, function(key) {
					for(var add in key) {
						encrypt(event.composeView.getHTMLContent(), key[add].pubKey)
							.then(function(ciphertext) {
								var html = "";
								var lines = ciphertext.data.split("\n");
								for(line in lines) {
									html += lines[line] + "<br>";
								}
								event.composeView.setBodyHTML(html);
							});
					}
				});
			},
			enabled: false
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
});
