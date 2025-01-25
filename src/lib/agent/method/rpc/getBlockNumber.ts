import { rpcProvider } from "src/lib/agent/mantleAgent";

export const getBlockNumber = async () => {
  try {
    const blockNumber = await rpcProvider.getBlockNumber();

    return JSON.stringify({
      status: "success",
      blockNumber,
    });
  } catch (error) {
    return JSON.stringify({
      status: "failure",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
