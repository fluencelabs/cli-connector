import WalletConnect from "@walletconnect/client";
import { Web3Wallet } from "./Web3Wallet";

export class WCProvider {
  private static wcProvider: WCProvider | null = null;

  public connector: WalletConnect;

  static async getWCProvider(
    wcString: string | null = null
  ): Promise<WCProvider> {
    if (this.wcProvider !== null) {
      if (wcString === null) {
        return this.wcProvider;
      } else {
        this.wcProvider.connector.killSession();
      }
    } else if (wcString === null) {
      throw new Error("wcString is null");
    }

    const connector = new WalletConnect({
      uri: wcString,
      clientMeta: {
        description: "Fluence ClI Connector",
        url: "http://localhost",
        icons: ["https://walletconnect.org/walletconnect-logo.png"],
        name: "Fluence CLI Connector",
      },
    });

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

    this.wcProvider = new WCProvider(connector);
    return this.wcProvider;
  }

  constructor(connector: WalletConnect) {
    this.connector = connector;
  }
}
