// src/config/configuration.ts

import { envSchema, type EnvConfig } from "./env.validation";

export class ConfigurationService {
  private readonly config: EnvConfig;

  constructor(env: Record<string, unknown>) {
    const result = envSchema.safeParse(env);

    if (!result.success) {
      console.error(
        "❌ Invalid environment variables:",
        JSON.stringify(result.error.format(), null, 2),
      );
      throw new Error("Invalid environment variables");
    }

    this.config = result.data;
  }

  get port(): number {
    return this.config.PORT;
  }

  get nodeEnv(): string {
    return this.config.NODE_ENV;
  }

  get apiKey(): string {
    return this.config.API_KEY;
  }

  get mantle() {
    return {
      privateKey: this.config.MANTLE_PRIVATE_KEY,
      publicAddress: this.config.PUBLIC_ADDRESS,
      rpcUrl: this.config.RPC_URL,
      chainId: this.config.CHAIN_ID || 5000 // Default to Mantle Mainnet
    };
  }

  get anthropic() {
    return {
      apiKey: this.config.ANTHROPIC_API_KEY,
    };
  }

  get isDevelopment(): boolean {
    return this.config.NODE_ENV === "development";
  }

  get isProduction(): boolean {
    return this.config.NODE_ENV === "production";
  }

  get isTest(): boolean {
    return this.config.NODE_ENV === "test";
  }

  get debug(): boolean {
    return this.config.DEBUG;
  }

  get serviceUrl(): string | undefined {
    return this.config.SERVICE_URL;
  }

  get network(): string {
    return this.config.NETWORK || "mantle";
  }

  get fullConfig(): EnvConfig {
    return this.config;
  }

  // Helper method to validate configuration
  validate(): boolean {
    if (!this.config.API_KEY) {
      throw new Error("API_KEY is required");
    }
    if (!this.config.MANTLE_PRIVATE_KEY) {
      throw new Error("MANTLE_PRIVATE_KEY is required");
    }
    if (!this.config.PUBLIC_ADDRESS) {
      throw new Error("PUBLIC_ADDRESS is required");
    }
    if (!this.config.RPC_URL) {
      throw new Error("RPC_URL is required");
    }
    if (!this.config.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is required");
    }
    return true;
  }

  // Helper method to get a specific config value with type safety
  get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }

  // Helper method to check if a configuration exists
  has(key: keyof EnvConfig): boolean {
    return key in this.config;
  }

  // Format configuration for logging (hiding sensitive values)
  toSafeLog(): Record<string, unknown> {
    return {
      PORT: this.port,
      NODE_ENV: this.nodeEnv,
      API_KEY: "***",
      MANTLE_PRIVATE_KEY: "***",
      PUBLIC_ADDRESS: this.config.PUBLIC_ADDRESS,
      RPC_URL: this.config.RPC_URL,
      ANTHROPIC_API_KEY: "***",
      CHAIN_ID: this.config.CHAIN_ID,
      NETWORK: this.config.NETWORK,
      DEBUG: this.config.DEBUG,
      SERVICE_URL: this.config.SERVICE_URL,
    };
  }
}