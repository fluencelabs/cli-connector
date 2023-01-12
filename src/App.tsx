import * as React from "react";
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
  useDisclosure,
  ModalOverlay,
  ModalContent,
  Modal,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
} from "@chakra-ui/react";
import { ColorModeSwitcher } from "./ColorModeSwitcher";
import { Logo } from "./Logo";
import { Button } from "@chakra-ui/react";
import { ethers } from "ethers";
import WalletConnect from "@walletconnect/client";
import { Buffer } from "buffer";
import { disconnect } from "process";

// @ts-ignore
window.Buffer = Buffer;

class Web3Wallet {
  private static web3Wallet: Web3Wallet | null;

  public provider: ethers.providers.Web3Provider;

  static getWallet(): Web3Wallet {
    if (this.web3Wallet == null) {
      this.web3Wallet = new Web3Wallet(
        new ethers.providers.Web3Provider((window as any).ethereum)
      );
    }

    return this.web3Wallet;
  }

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;
  }
}

export const App = () => {
  const [isWalletConnected, setWalletConnected] =
    React.useState<Boolean>(false);

  const connect = async () => {
    const providers = new ethers.providers.Web3Provider(
      (window as any).ethereum
    );
    providers.send("eth_requestAccounts", []).then((accounts: any) => {
      console.log(accounts);
      if (accounts.length > 0) {
        setWalletConnected(true);
      }
    });
  };

  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <ColorModeSwitcher justifySelf="flex-end" />

          {isWalletConnected ? (
            <WalletConnectSettings />
          ) : (
            <VStack spacing={8}>
              <Button onClick={() => connect()} colorScheme="blue">
                Login with web3 wallet
              </Button>
            </VStack>
          )}
        </Grid>
      </Box>
    </ChakraProvider>
  );
};

export const WalletConnectSettings = () => {
  const [wcString, setWCString] = React.useState<string>("");
  const [walletConnect, setWalletConnect] =
    React.useState<WalletConnect | null>();

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    console.log(
      `wc:${urlParams.get("wc")}?bridge=${urlParams.get(
        "bridge"
      )}&key=${urlParams.get("key")}`
    );
    if (urlParams.has("wc")) {
      setWCString(
        `wc:${urlParams.get("wc")}?bridge=${urlParams.get(
          "bridge"
        )}&key=${urlParams.get("key")}`
      );
    }
  });

  React.useEffect(() => {
    // TODO: regexp
    if (
      wcString.startsWith("wc:") === false ||
      wcString.split("wc:").length !== 2 ||
      wcString.split("@1?bridge=").length !== 2 ||
      wcString.split("&key=").length !== 2
    ) {
      return;
    }

    connect();
  }, [wcString]);

  const connect = async () => {
    console.log("Connecting to WalletConnect");
    const connector = new WalletConnect({
      uri: wcString,
      clientMeta: {
        description: "Fluence ClI Connector",
        url: "http://localhost",
        icons: ["https://walletconnect.org/walletconnect-logo.png"],
        name: "Fluence CLI Connector",
      },
    });

    if (connector.connected) {
      await connector.killSession();
      await connector.createSession();
    }
    connector.on("session_request", async (error, payload) => {
      console.log(payload);
      if (error) {
        throw error;
      }

      const walletChainId = (await Web3Wallet.getWallet().provider.getNetwork())
        .chainId;

      if (walletChainId !== payload.params[0].chainId) {
        alert(
          "ChainId mismatch. Please change your wallet to the correct network."
        );
        return;
      }

      connector.approveSession({
        accounts: [
          await Web3Wallet.getWallet().provider.getSigner().getAddress(),
        ],
        chainId: payload.params[0].chainId, // required
      });

      setWalletConnect(connector);
    });

    connector.on("call_request", async (error, payload) => {
      console.log(payload);

      if (error) {
        throw error;
      }

      const result = await Web3Wallet.getWallet().provider.send(
        payload.method,
        payload.params
      );

      console.log(result);
      connector.approveRequest({
        id: payload.id,
        result: result,
      });
    });

    connector.on("disconnect", (error, payload) => {
      console.log(payload);

      if (error) {
        throw error;
      }

      // Delete connector
    });
  };

  const disconnect = async () => {
    walletConnect!.killSession();
    setWalletConnect(null);
  };

  return (
    <VStack spacing={8}>
      {walletConnect == null ? (
        <>
          <Input
            width={"30%"}
            placeholder="WalletConnect connection string"
            value={wcString}
            onChange={(v) => setWCString(v.target.value)}
          />
          <Button colorScheme="blue" onClick={() => connect()}>
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
