// src/config/env.validation.ts

import { z } from "zod";

export const envSchema = z.object({
  // Server configuration
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  API_KEY: z.string().min(1, "API key is missing"),

  // Mantle configuration
  MANTLE_PRIVATE_KEY: z.string().min(1, "Mantle private key is required"),
  PUBLIC_ADDRESS: z.string().min(1, "Public address is required"),
  RPC_URL: z.string().url("Invalid RPC URL"),
  CHAIN_ID: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("5000"), // Mantle Mainnet chain ID

  // Service configuration
  ANTHROPIC_API_KEY: z.string().min(1, "Anthropic API key is required"),
  
  // Optional configurations with defaults
  NETWORK: z
    .enum(["mainnet", "testnet", "mantle"])
    .default("mantle"),
  DEBUG: z
    .string()
    .transform((val) => val === "true")
    .default("false"),

  // Optional service URLs
  SERVICE_URL: z
    .string()
    .url("Invalid service URL")
    .optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;