import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Input, Button } from "@nextui-org/react";
import { Tabs, Tab } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/react";
import { Progress } from "@nextui-org/react";

import FileInput from "./components/fileInput";

import { EyeFilledIcon } from "./icons/eyeFilledIcon";
import { EyeSlashFilledIcon } from "./icons/eyeSlashFilledIcon";

const _algorithms = ["aes-256-cbc", "aes-256-cfb", "aes-256-ctr", "aes-256-gcm", "aes-256-ofb"];

const algorithms = _algorithms.map((algorithm) => ({
  label: algorithm,
  value: algorithm,
}));

export default function App() {
  const [activeTab, setActiveTab] = useState("encrypt");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const [selectedAlgorithm, setSelectedAlgorithm] = useState(new Set(["aes-256-cbc"]));

  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [isSuccess, setIsSucess] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setProgress(0);
    setIsSucess(false);
    setIsError(false);
  }, [activeTab]);

  function updateProgress(progress) {
    setProgress(progress);
  }

  const errorToast = (icon, message) =>
    toast(message, {
      icon: `${icon}`,

      ariaProps: {
        role: "status",
        "aria-live": "polite",
      },

      style: {
        background: "red",
        color: "white",
      },
    });

  function updateError(error) {
    console.log("error", error);
    setIsError(true);

    toast.custom(
      <div className="flex flex-col bg-red-400 rounded-md justify-center p-3 text-sm w-[340px]">
        <div className="flex flex-col">
          <span>✋ There was an error processing the file.</span>
          <span>Reasons could be: </span>

          <ul className="list-disc ml-10">
            <li>Incorrect password</li>
            <li>File is not encrypted</li>
            <li>File is corrupted</li>
            <li>Algorithm mismatch</li>
          </ul>
        </div>
      </div>,
    );
  }

  const handleButton = async () => {
    if (!password || password.length === 0) return errorToast("🔑", "Please enter a password");

    const selectedAlgorithms = Array.from(selectedAlgorithm);
    if (selectedAlgorithms.length === 0) return errorToast("🔒", "Please select an algorithm");
    const _algo = selectedAlgorithms[0];

    console.log("algo", _algo);

    setIsSucess(false);
    setIsError(false);
    const filepath = file.path;
    try {
      if (activeTab === "encrypt") {
        await window.api.encrypt(filepath, password, _algo, updateProgress, updateError);
      } else {
        await window.api.decrypt(filepath, password, _algo, updateProgress, updateError);
      }
      setIsSucess(true);
    } catch (error) {
      console.log("errr", error);
    }
  };

  return (
    <>
      <Toaster />

      <div className="w-screen h-screen bg-black p-6 font-code text-green-600 dark">
        <div className="flex flex-col gap-4 items-center justify-center h-full">
          <h1 className="text-4xl font-bold">Cryptoque</h1>

          <Tabs
            aria-label="Options"
            variant="solid"
            color="success"
            size="lg"
            onSelectionChange={setActiveTab}
          >
            <Tab key="encrypt" title="Encrypt"></Tab>
            <Tab key="decrypt" title="Decrypt"></Tab>
          </Tabs>

          <FileInput setFile={setFile} />

          {file && (
            <>
              <div className="grid grid-cols-2 text-sm">
                <div>File name:</div>
                <div>{file.name}</div>

                <div>File size:</div>
                <div>{file.size} bytes</div>

                <div>File type:</div>
                <div>{file.type}</div>
              </div>
            </>
          )}

          <div className="flex gap-3 w-full justify-center">
            <Input
              type={isVisible ? "text" : "password"}
              placeholder="Enter password"
              className="w-[30%]"
              value={password}
              onValueChange={setPassword}
              endContent={
                <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                  {isVisible ? (
                    <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
            />

            <Select
              aria-label="Select algorithm"
              label=""
              className="w-[30%]"
              labelPlacement="outside-left"
              value={selectedAlgorithm}
              onSelectionChange={setSelectedAlgorithm}
              defaultSelectedKeys={["aes-256-cbc"]}
              multiple={false}
            >
              {algorithms.map((algorithm) => (
                <SelectItem key={algorithm.value} value={algorithm.value}>
                  {algorithm.label}
                </SelectItem>
              ))}
            </Select>

            <Button
              onClick={handleButton}
              color="success"
              isDisabled={!file || (!!progress && progress < 100)}
              isLoading={!!progress && progress < 100}
            >
              {activeTab === "encrypt" ? "Encrypt " : "Decrypt "} File
            </Button>
          </div>

          <div className="flex flex-col justify-center items-center gap-2 w-full">
            {progress > 0 && !isError && (
              <Progress
                isStriped
                aria-label="Loading..."
                color="success"
                value={progress}
                showValueLabel={true}
                className="w-[70%]"
              />
            )}

            {isSuccess && (
              <span>File {activeTab === "encrypt" ? "encrypted" : "decrypted"} successfully!</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
