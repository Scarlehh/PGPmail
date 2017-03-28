InboxSDK.load('1.0', 'sdk_PGPmail_b4932b6799').then(function(sdk) {
	sdk.Compose.registerComposeViewHandler(function(composeView){
		composeView.addButton({
			title: "Encrypt",
			iconClass: "encryptButton",
			iconUrl: chrome.extension.getURL("resources/images/encryptButton.png"),
			onClick: function(event) {
				event.composeView.setBodyText("ENCRYPTED");
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
