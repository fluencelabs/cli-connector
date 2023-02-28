import * as React from "react";
import { ChakraProvider, Box, VStack, Grid, theme } from "@chakra-ui/react";
import { ColorModeSwitcher } from "../ColorModeSwitcher";
import { Button } from "@chakra-ui/react";
import { Buffer } from "buffer";
import { WalletConnectSettings } from "./WalletConnectSettings";
import { Wallet } from "../utils/Wallet";

// @ts-ignore
window.Buffer = Buffer;

export const App = () => {
  const [isWalletConnected, setWalletConnected] =
    React.useState<Boolean>(false);

  const connectToWallet = async () => {
    Wallet.getWallet()
      .provider.send("eth_requestAccounts", [])
      .then((accounts: any) => {
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
              <Button onClick={() => connectToWallet()} colorScheme="blue">
                Login with web3 wallet
              </Button>
            </VStack>
          )}
        </Grid>
      </Box>
    </ChakraProvider>
  );
};
