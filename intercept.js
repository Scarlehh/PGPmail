InboxSDK.load('1.0', 'sdk_PGPmail_b4932b6799').then(function(sdk) {
	sdk.Compose.registerComposeViewHandler(function(composeView){
		composeView.addButton({
			title: "Encrypt",
			iconClass: "encryptButton",
			iconUrl: chrome.extension.getURL("encryptButton.png"),
			onClick: function(event) {
				event.composeView.setBodyText("ENCRYPTED");
			},
		});
	});
});
