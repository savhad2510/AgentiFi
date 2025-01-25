import { BlockIdAndContractAddressParams } from "src/lib/agent/schema";
import { rpcProvider } from "src/lib/agent/mantleAgent";
import { BlockNumber } from "mantle";

export const getNonceForAddress = async (
  params: BlockIdAndContractAddressParams,
) => {
  try {
    let blockIdentifier: BlockNumber | string = params.blockId || "latest";

    if (
      typeof blockIdentifier === "string" &&
      !isNaN(Number(blockIdentifier)) &&
      blockIdentifier !== "latest"
    ) {
      blockIdentifier = Number(blockIdentifier);
    }

    const contractClass = await rpcProvider.getNonceForAddress(
      params.contractAddress,
      blockIdentifier,
    );

    return JSON.stringify({
      status: "success",
      contractClass,
    });
  } catch (error) {
    return JSON.stringify({
      status: "failure",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
