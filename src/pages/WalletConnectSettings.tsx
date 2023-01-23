import { useEffect, useState } from "react";
import { VStack, Input } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import WalletConnect from "@walletconnect/client";
import { Web3Wallet } from "../utils/Web3Wallet";
import { WCProvider } from "../utils/WCProvider";

export const WalletConnectSettings = () => {
  const [wcString, setWCString] = useState<string>("");
  const [isConnected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has("wc")) {
      if (
        urlParams.get("wc")!.length === 0 ||
        urlParams.get("bridge")!.length === 0 ||
        urlParams.get("key")!.length === 0
      ) {
        return;
      }

      const connectionString = `wc:${urlParams.get(
        "wc"
      )}?bridge=${urlParams.get("bridge")}&key=${urlParams.get("key")}`;
      setWCString(connectionString);
    }
  }, []);

  const connect = async (connectionString: string) => {
    console.log("Connecting to WalletConnect");

    await WCProvider.getWCProvider(connectionString);
    setConnected(true);
  };

  const disconnect = async () => {
    const wc = await WCProvider.getWCProvider();
    await wc.connector.killSession();
    setConnected(false);
  };

  return (
    <VStack spacing={8}>
      {isConnected === false ? (
        <>
          <Input
            width={"30%"}
            placeholder="WalletConnect connection string"
            value={wcString}
            onChange={(v) => setWCString(v.target.value)}
          />
          <Button colorScheme="blue" onClick={() => connect(wcString)}>
            Connect
          </Button>
        </>
      ) : (
        <Button colorScheme="blue" onClick={() => disconnect()}>
          Disconnect
        </Button>
      )}
    </VStack>
  );
};
