import { x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { createFacilitatorConfig } from "@coinbase/x402";
import { BASE_CHAIN_ID } from "../env.js";

const facilitatorClient = new HTTPFacilitatorClient(
  createFacilitatorConfig(),
);

export const x402Server = new x402ResourceServer(facilitatorClient).register(
  BASE_CHAIN_ID as `${string}:${string}`,
  new ExactEvmScheme(),
);
