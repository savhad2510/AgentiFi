import { rpcProvider } from "src/lib/agent/mantleAgent";

export const getChainId = async () => {
  try {
    const chainId = await rpcProvider.getChainId();

    return JSON.stringify({
      status: "success",
      chainId,
    });
  } catch (error) {
    return JSON.stringify({
      status: "failure",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
