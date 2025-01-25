import { config } from "dotenv";

config();

// Mantle Mainnet Chain ID
export const MANTLE_CHAIN_ID = 5000;

// Mantle Mainnet RPC URL
export const RPC_URL = process.env.RPC_URL || "https://rpc.mantle.xyz";

// Mantle token addresses
export const tokenAddresses: { [key: string]: string } = {
  MNT: "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000", // Mantle native token
  USDC: "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9", // USDC on Mantle
  USDT: "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE", // USDT on Mantle
  WETH: "0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111", // Wrapped ETH on Mantle
};

// Error messages
export const INTERNAL_SERVER_ERROR = "Something went wrong, please try again later!";
export const RESSOURCE_NOT_FOUND = "NOT FOUND";
export const UNAUTHORIZED = "Unauthorized";
export const FORBIDDEN = "Forbidden";
export const BAD_REQUEST = "Bad request";



const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
  
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m"
};

const colorLog = {
  error: (msg: string) => console.log(`${colors.red}${msg}${colors.reset}`),
  success: (msg: string) => console.log(`${colors.green}${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.cyan}${msg}${colors.reset}`),
  debug: (msg: string) => console.log(`${colors.magenta}${msg}${colors.reset}`),
  custom: (msg: string, color: keyof typeof colors) => console.log(`${colors[color]}${msg}${colors.reset}`)
};