import { ethers } from "ethers";

export class Wallet {
  private static web3Wallet: Wallet | null;

  public provider: ethers.providers.Web3Provider;

  static getWallet(): Wallet {
    if (this.web3Wallet == null) {
      this.web3Wallet = new Wallet(
        new ethers.providers.Web3Provider((window as any).ethereum)
      );
    }

    return this.web3Wallet;
  }

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;
  }
}
