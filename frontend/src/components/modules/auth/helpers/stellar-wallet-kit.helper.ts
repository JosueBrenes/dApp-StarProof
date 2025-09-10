import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  FreighterModule,
  AlbedoModule,
  xBullModule,
  LobstrModule,
  RabetModule,
  allowAllModules,
} from "@creit.tech/stellar-wallets-kit";
import { setAllowedWallets } from "@creit.tech/stellar-wallets-kit/state/store";

// Network passphrases
const NETWORK_PASSPHRASES = {
  TESTNET: "Test SDF Network ; September 2015",
  FUTURENET: "Test SDF Future Network ; October 2022",
  STANDALONE: "Standalone Network ; February 2017",
  PUBLIC: "Public Global Stellar Network ; September 2015",
} as const;

type NetworkPassphrase = typeof NETWORK_PASSPHRASES[keyof typeof NETWORK_PASSPHRASES];

/**
 * Get the wallet network based on the environment or default to TESTNET
 * @returns {WalletNetwork} The corresponding wallet network
 */
function getWalletNetwork(): WalletNetwork {
  // Default to TESTNET for StarProof development
  const networkPassphrase = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || NETWORK_PASSPHRASES.TESTNET;
  
  switch (networkPassphrase as NetworkPassphrase) {
    case NETWORK_PASSPHRASES.TESTNET:
      return WalletNetwork.TESTNET;
    case NETWORK_PASSPHRASES.FUTURENET:
      return WalletNetwork.FUTURENET;
    case NETWORK_PASSPHRASES.STANDALONE:
      return WalletNetwork.STANDALONE;
    case NETWORK_PASSPHRASES.PUBLIC:
      return WalletNetwork.PUBLIC;
    default:
      console.warn("Unknown network passphrase, defaulting to TESTNET");
      return WalletNetwork.TESTNET;
  }
}

/**
 * Stellar Wallets Kit for StarProof
 * @Reference URL: https://stellarwalletskit.dev
 */
export const stellarWalletKit: StellarWalletsKit = new StellarWalletsKit({
  network: getWalletNetwork(),
  selectedWalletId: FREIGHTER_ID,
  modules:
    process.env.NODE_ENV !== "production"
      ? allowAllModules()
      : [
          new FreighterModule(),
          new AlbedoModule(),
          new xBullModule(),
          new LobstrModule(),
          new RabetModule(),
        ],
});

// Force Lobstr and Rabet modules to be marked as available
stellarWalletKit.getSupportedWallets().then((wallets) => {
  const updated = wallets.map((w) =>
    w.id === "lobstr" || w.id === "rabet" ? { ...w, isAvailable: true } : w,
  );
  setAllowedWallets(updated);
});