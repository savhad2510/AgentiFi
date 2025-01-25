import { ProviderInterface } from "mantle";

export interface AccountDetails {
  address: string;
  privateKey: string;
  publicKey: string;
  deployStatus: boolean;
}

export interface TransactionResult {
  status: "success" | "failure";
  transactionHash?: string;
  error?: string;
}

export interface BaseUtilityClass {
  provider: ProviderInterface;
}

export interface ContractDeployResult {
  transactionHash: string;
  contractAddress: string | string[];
}

export interface TokenAmount {
  amount: string;
  decimals: number;
}

export type TypedData = {
  types: {
    MANTLEDomain?: TypeElement[];
    [additionalProperties: string]: TypeElement[] | undefined;
  };
  primaryType: string;
  domain: MANTLEDomain;
  message: Record<string, any>;
};

export type TypeElement = {
  name: string;
  type: string;
};

export type MANTLEDomain = {
  name: string;
  version: string;
  chainId: string | number;
};

export type WeierstrassSignatureType = {
  r: string;
  s: string;
  recoveryParam?: number | null;
};
