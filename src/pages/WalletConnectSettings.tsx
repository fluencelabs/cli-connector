import { useEffect, useState } from "react";
import { VStack, Input, Text, Center } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { WCProvider } from "../utils/WCProvider";
import { Spinner } from "@chakra-ui/react";

const wcProvider = new WCProvider();

export const WalletConnectSettings = () => {
  const [wcString, setWCString] = useState<string>("");
  const [isConnected, setConnected] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    wcProvider.init().then((x) => setLoading(false));
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has("wc")) {
      if (
        urlParams.get("wc")!.length === 0 ||
        urlParams.get("relay-protocol")!.length === 0 ||
        urlParams.get("symKey")!.length === 0
      ) {
        return;
      }

      const connectionString = `wc:${urlParams.get(
        "wc"
      )}?relay-protocol=${urlParams.get(
        "relay-protocol"
      )}&symKey=${urlParams.get("symKey")}`;
      setWCString(connectionString);
    }
  }, []);

  const connect = (connectionString: string) => {
    console.log("Connecting to WalletConnect");

    setLoading(true);
    wcProvider
      .connect(connectionString)
      .then(() => {
        setConnected(true);
      })
      .finally(() => setLoading(false));
  };

  const disconnect = () => {
    setLoading(true);
    wcProvider
      .disconnect()
      .then(() => {
        setConnected(false);
      })
      .finally(() => setLoading(false));
  };

  if (isLoading)
    return (
      <VStack>
        <Spinner
          thickness="4px"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </VStack>
    );

  return (
    <VStack spacing={8}>
      {isConnected === false ? (
        <>
          <Text>Write connection string below</Text>
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
        <>
          <Text>Wait transaction in your wallet</Text>
          <Button colorScheme="blue" onClick={() => disconnect()}>
            Disconnect
          </Button>
        </>
      )}
    </VStack>
  );
};
