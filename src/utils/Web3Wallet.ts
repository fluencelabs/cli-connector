import { ethers } from "ethers";

export class Web3Wallet {
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
