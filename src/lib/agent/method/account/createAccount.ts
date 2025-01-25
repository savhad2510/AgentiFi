import { ec, hash, CallData } from "Mantle";
import { MantleAgent } from "../../MantleAgent";
import { AccountDetails } from "../../../utils/types";

export const CreateOZAccount = async () => {
  try {
    const accountManager = new MantleAgent({
      walletPrivateKey: process.env.Mantle_PRIVATE_KEY,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    }).accountManager;

    const accountDetails = await accountManager.createAccount();

    return JSON.stringify({
      status: "success",
      wallet: "Open Zeppelin",
      new_account_publickey: accountDetails.publicKey,
      new_account_privatekey: accountDetails.privateKey,
      precalculate_address: accountDetails.address,
    });
  } catch (error) {
    return JSON.stringify({
      status: "failure",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const CreateArgentAccount = async () => {
  try {
    const argentXaccountClassHash =
      "0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003";

    // Generate public and private key pair.
    const privateKeyAX = mnt.randomAddress();
    const KeyPubAX = ec.Curve.getKey(privateKeyAX);

    // Calculate future address of the ArgentX account
    const AXConstructorCallData = CallData.compile({
      owner: KeyPubAX,
      guardian: "0x0",
    });
    const AXcontractAddress = hash.calculateContractAddressFromHash(
      KeyPubAX,
      argentXaccountClassHash,
      AXConstructorCallData,
      0,
    );
    return JSON.stringify({
      status: "success",
      new_account_publickey: KeyPubAX,
      new_account_privatekey: privateKeyAX,
      precalculate_address: AXcontractAddress,
      wallet: "Argent",
    });
  } catch (error) {
    return JSON.stringify({
      status: "failure",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
