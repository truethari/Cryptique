# Cryptique

---

![Cryptique Logo]("/assets/icons/linux/logo.png")

## Table of Contents

- [Introduction](#introduction)
- [Features](#-features)
- [Prerequisites](#prerequisites)
- [Installation](#-installation)
- [Usage](#-usage)
- [License](#-license)
- [Contributing](#-contributing)

---

## Introduction

Cryptique is a secure file encryption and decryption tool built with Electron and Node.js. It leverages the cryptographic functionality provided by Node.js's `crypto` module to perform AES-256-CBC encryption and decryption of files, ensuring that your sensitive data remains protected.

## 📚 Features

- **File Encryption**: Securely encrypts files using AES-256-CBC and more algorithms, ensuring that data cannot be accessed without the correct password.
- **File Decryption**: Decrypts previously encrypted files with the same password used for encryption.
- **Progress Reporting**: Displays encryption and decryption progress, updating in real-time.
- **Error Handling**: Comprehensive error reporting to help diagnose issues during the encryption or decryption processes.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js (v12.0.0 or higher)
- npm (v6.0.0 or higher)
- Electron

## 🛠 Installation

Clone the repository to your local machine:

```bash
git clone https://github.com/truethari/cryptoque.git
cd cryptoque
```

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## 🚀 Usage

### Encrypting a File

- Open the application.
- Switch to the "Encrypt" tab.
- Select a file using the file picker.
- Enter a secure password in the password field.
- Click "Encrypt File" to begin the encryption process.
- The encrypted file will be saved in the same directory as the original file with a .enc extension.

### Decrypting a File

- Open the application.
- Switch to the "Decrypt" tab.
- Select an encrypted file (.enc) using the file picker.
- Enter the password used during encryption.
- Click "Decrypt File" to begin the decryption process.
- The decrypted file will be restored under the same directory as the encrypted file.

## 📄 License

Distributed under the MIT License. See [LICENSE](https://github.com/truethari/Cryptique/blob/master/LICENSE) for more information.

## 🌱 Contribution

If you have any suggestions on what to improve in Reactfolio and would like to share them, feel free to leave an issue or fork project to implement your own ideas
