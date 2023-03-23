import { Wallet } from "./Wallet";
import { Core } from "@walletconnect/core";
import WalletConnect from "@walletconnect/web3wallet";
import { Web3Wallet } from "@walletconnect/web3wallet/dist/types/client";
import { getSdkError } from "@walletconnect/utils";

export class WCProvider {
  public connector: Web3Wallet | null = null;

  async init() {
    const core = new Core({
      projectId: "70c1c5ed2a23e7383313de1044ddce7e",
    });

    const web3wallet = await WalletConnect.init({
      core,
      metadata: {
        name: "Fluence CLI Connector",
        description: "",
        url: "https://cli-connector.fluence.dev",
        icons: [],
      },
    });

    web3wallet.on("session_proposal", async (proposal) => {
      console.log("session_proposal", proposal);
      const walletChainId = (await Wallet.getWallet().provider.getNetwork())
        .chainId;
      const chainId = `eip155:${walletChainId}`;
      if (
        !proposal.params.requiredNamespaces[`eip155`].chains?.includes(chainId)
      ) {
        alert(
          "ChainId mismatch. Please change your wallet to the correct network."
        );
        return;
      }

      await web3wallet.approveSession({
        id: proposal.id,
        namespaces: {
          eip155: {
            accounts: (
              await Wallet.getWallet().provider.listAccounts()
            ).map((x) => `eip155:${walletChainId}:${x}`),
            chains: [chainId],
            methods: [
              "eth_sendTransaction",
              "eth_signTransaction",
              "eth_sign",
              "personal_sign",
              "eth_signTypedData",
            ],
            events: ["chainChanged", "accountsChanged"],
          },
        },
      });
    });

    web3wallet.on("session_request", async (request) => {
      console.log("session_request", request);
      if (request.params.request.method === "eth_sendTransaction") {
        const req = request.params.request.params[0];
        request.params.request.params[0] = {
          data: req.data,
          from: req.from,
          to: req.to,
        };

        console.log(request.params.request.params);
      }
      const result = await Wallet.getWallet().provider.send(
        request.params.request.method,
        request.params.request.params
      );

      const response = { id: request.id, result: result, jsonrpc: "2.0" };

      await web3wallet.respondSessionRequest({
        topic: request.topic,
        response,
      });
    });

    this.connector = web3wallet;
  }

  async connect(wcString: string) {
    if (this.connector == null) {
      throw new Error("Please initialize the provider first");
    }

    await this.connector!.core.pairing.pair({ uri: wcString! });
  }

  async disconnect() {
    if (this.connector == null) {
      throw new Error("Connector is not set");
    }

    let sessions = this.connector!.core.pairing.getPairings();
    if (sessions.length === 0) {
      return;
    }

    console.log("sessions", sessions);
    await this.connector!.disconnectSession({
      topic: sessions[sessions.length - 1].topic,
      reason: getSdkError("USER_DISCONNECTED"),
    });
  }
}
