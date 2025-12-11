import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;

// Constants from the contract
const MIN_LOCK_DURATION = 604800; // 7 days in seconds
const ANNUAL_INTEREST_RATE = 500; // 5% in basis points
const SECONDS_PER_YEAR = 31536000;

describe("vault-stack contract", () => {
  
  describe("Initialization and Read-Only Functions", () => {
    it("ensures simnet is well initialised", () => {
      expect(simnet.blockHeight).toBeDefined();
    });

    it("returns correct initial total deposits", () => {
      const { result } = simnet.callReadOnlyFn(
        "vault-stack",
        "get-total-deposits",
        [],
        address1
      );
      expect(result).toBeOk(Cl.uint(0));
    });

    it("returns correct initial vault counter", () => {
      const { result } = simnet.callReadOnlyFn(
        "vault-stack",
        "get-vault-counter",
        [],
        address1
      );
      expect(result).toBeOk(Cl.uint(0));
    });

    it("gets current time (block height)", () => {
      const { result } = simnet.callReadOnlyFn(
        "vault-stack",
        "get-current-time",
        [],
        address1
      );
      expect(result).toBeOk(Cl.uint(simnet.blockHeight));
    });

    it("returns none for non-existent vault", () => {
      const { result } = simnet.callReadOnlyFn(
        "vault-stack",
        "get-vault",
        [Cl.uint(999)],
        address1
      );
      expect(result).toBeNone();
    });

    it("returns empty list for user with no vaults", () => {
      const { result } = simnet.callReadOnlyFn(
        "vault-stack",
        "get-user-vaults",
        [Cl.principal(address1)],
        address1
      );
      expect(result).toBeTuple({ "vault-ids": Cl.list([]) });
    });
  });

  describe("Interest Calculation", () => {
    it("calculates interest correctly for 1 year lock", () => {
      const amount = 1000000; // 1 STX
      const duration = SECONDS_PER_YEAR;
      const expectedInterest = Math.floor(
        (amount * ANNUAL_INTEREST_RATE * duration) / (10000 * SECONDS_PER_YEAR)
      );

      const { result } = simnet.callReadOnlyFn(
        "vault-stack",
        "calculate-interest",
        [Cl.uint(amount), Cl.uint(duration)],
        address1
      );
      expect(result).toBeOk(Cl.uint(expectedInterest));
    });

    it("calculates interest correctly for minimum lock duration", () => {
      const amount = 1000000;
      const duration = MIN_LOCK_DURATION;
      const expectedInterest = Math.floor(
        (amount * ANNUAL_INTEREST_RATE * duration) / (10000 * SECONDS_PER_YEAR)
      );

      const { result } = simnet.callReadOnlyFn(
        "vault-stack",
        "calculate-interest",
        [Cl.uint(amount), Cl.uint(duration)],
        address1
      );
      expect(result).toBeOk(Cl.uint(expectedInterest));
    });