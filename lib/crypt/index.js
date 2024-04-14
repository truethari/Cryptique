const crypto = require("crypto");
const fsp = require("fs").promises;
const fs = require("fs");
const path = require("path");

export const encrypt = async (
  sourceFilePath,
  password,
  algorithm,
  progressCallback,
  errorCallback,
) => {
  const destFilePath = path.join(sourceFilePath + ".enc");

  try {
    // Attempt to delete the destination file if it exists
    if (fs.existsSync(destFilePath)) {
      await fsp.unlink(destFilePath);
    }
  } catch (err) {
    const errorMessage = "Error deleting existing encrypted file: " + err.message;
    console.error(errorMessage);
    errorCallback(errorMessage);
    return; // Stop execution if we cannot delete existing file
  }

  try {
    const salt = crypto.randomBytes(16);
    const key = crypto.scryptSync(password, salt, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const readStream = fs.createReadStream(sourceFilePath);
    const writeStream = fs.createWriteStream(destFilePath);
    const header = Buffer.concat([salt, iv]);

    const fileStats = await fsp.stat(sourceFilePath);
    const totalSize = fileStats.size;
    let encryptedSize = 0;

    return new Promise((resolve, reject) => {
      writeStream.on("open", () => {
        writeStream.write(header);

        readStream.on("data", (chunk) => {
          encryptedSize += chunk.length;
          const progress = ((encryptedSize / totalSize) * 100).toFixed(2);
          progressCallback(progress);
        });

        cipher.on("error", (err) => {
          console.error("Cipher stream error:", err);
          readStream.destroy(); // Stop reading
          writeStream.end(); // Close write stream
          const errorMessage = `Cipher operation failed: ${err.message}`;
          errorCallback(errorMessage);
          reject(new Error(errorMessage));
        });

        writeStream.on("error", (err) => {
          console.error("Write stream error:", err);
          readStream.destroy(); // Stop reading
          cipher.end(); // End cipher operation
          const errorMessage = `Write to disk failed: ${err.message}`;
          errorCallback(errorMessage);
          reject(new Error(errorMessage));
        });

        readStream
          .pipe(cipher)
          .pipe(writeStream)
          .on("finish", () => {
            console.log(`File has been encrypted and saved as ${destFilePath}`);
            resolve(destFilePath);
          })
          .on("error", (err) => {
            console.error("Piping streams failed:", err);
            const errorMessage = `Stream piping failed: ${err.message}`;
            errorCallback(errorMessage);
            reject(new Error(errorMessage));
          });
      });
    });
  } catch (err) {
    const errorMessage = "Encryption setup failed due to: " + err.message;
    console.error(errorMessage);
    errorCallback(errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
};

export const decrypt = async (
  sourceFilePath,
  password,
  algorithm,
  progressCallback,
  errorCallback,
) => {
  const destFilePath = path.join(
    path.dirname(sourceFilePath),
    `decrypted-${path.basename(sourceFilePath).replace(".enc", "")}`,
  );

  try {
    if (fs.existsSync(destFilePath)) {
      await fsp.unlink(destFilePath);
    }
  } catch (err) {
    if (err.code !== "ENOENT") {
      const errorMessage = "Error deleting existing decrypted file: " + err.message;
      console.error(errorMessage);
      errorCallback(errorMessage);
      return;
    }
  }

  let readStream;
  let writeStream;

  try {
    readStream = fs.createReadStream(sourceFilePath);
    writeStream = fs.createWriteStream(destFilePath);
  } catch (err) {
    const errorMessage = `Failed to create read/write streams: ${err.message}`;
    console.error(errorMessage);
    errorCallback(errorMessage);
    return Promise.reject(new Error(errorMessage));
  }

  return new Promise((resolve, reject) => {
    readStream.once("readable", () => {
      const header = readStream.read(32);
      if (!header) {
        const errorMessage = "Failed to read header from encrypted file.";
        console.error(errorMessage);
        reject(new Error(errorMessage));
        errorCallback(errorMessage);
        return;
      }

      let decipher;

      try {
        const salt = header.slice(0, 16);
        const iv = header.slice(16, 32);
        const key = crypto.scryptSync(password, salt, 32);
        decipher = crypto.createDecipheriv(algorithm, key, iv);
      } catch (err) {
        const errorMessage = `Failed to create decipher: ${err.message}`;
        console.error(errorMessage);
        errorCallback(errorMessage);
        reject(new Error(errorMessage));
        return;
      }

      let fileStats;
      try {
        fileStats = fs.statSync(sourceFilePath);
      } catch (err) {
        const errorMessage = `Failed to stat file: ${err.message}`;
        console.error(errorMessage);
        errorCallback(errorMessage);
        reject(new Error(errorMessage));
        return;
      }

      const totalSize = fileStats.size - header.length;
      let decryptedSize = 0;

      readStream.on("data", (chunk) => {
        decryptedSize += chunk.length;
        const progress = ((decryptedSize / totalSize) * 100).toFixed(2);
        progressCallback(progress);
      });

      decipher.on("error", (err) => {
        console.log("Decipher stream error", err);
        readStream.destroy(); // Prevent further reading
        writeStream.end(); // Prevent further writing
        const errorMessage = `Deciphering failed: ${err.message}`;
        errorCallback(errorMessage);
        reject(new Error(errorMessage));
      });

      writeStream.on("error", (err) => {
        console.log("Write stream error", err);
        readStream.destroy(); // Prevent further reading
        decipher.end(); // Prevent further deciphering
        const errorMessage = `Write to disk failed: ${err.message}`;
        errorCallback(errorMessage);
        reject(new Error(errorMessage));
      });

      readStream
        .pipe(decipher)
        .pipe(writeStream)
        .on("finish", () => {
          console.log(`File has been decrypted and saved as ${destFilePath}`);
          resolve(destFilePath);
        })
        .on("error", (err) => {
          const errorMessage = `Stream piping failed: ${err.message}`;
          errorCallback(errorMessage);
          reject(new Error(errorMessage));
        });
    });
  });
};
