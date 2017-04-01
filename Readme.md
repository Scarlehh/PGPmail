# OpenPGP
A chrome extension for sending and receiving inline PGP encrypted and signed emails on the Gmail web client.

## Features
- 4096 bit key pair generation
- Save existing key pairs
- Add contacts public keys
- Encryption with multiple keys
- Automatic verification of signed emails
- Automatic signing

## Getting Started
1. `git clone git@github.com:Scarlehh/PGPmail.git`
2. Open `chrome://extensions/`
3. Turn on "Developer Mode"
4. Load unpacked extension

## Keyring
- Add your key pairs or generate new ones associated with your email
    - Used for automatic signing and decryption
- Add your contacts public keys
    - Used for automatic encryption and verification
- Export public keys

## Email
- Encrypted send button appears if all recipient's public keys are available

> Note: Will not encrypt emails if there are any bcc'd recipients

- Decrypt button appears in the dropdown menu if email is encrypted with inline PGP
