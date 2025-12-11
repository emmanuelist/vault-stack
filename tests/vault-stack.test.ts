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

    it("calculates zero interest for zero amount", () => {
      const { result } = simnet.callReadOnlyFn(
        "vault-stack",
        "calculate-interest",
        [Cl.uint(0), Cl.uint(MIN_LOCK_DURATION)],
        address1
      );
      expect(result).toBeOk(Cl.uint(0));
    });
  });

  describe("Create Vault", () => {
    it("successfully creates a vault with valid parameters", () => {
      const amount = 1000000; // 1 STX
      const lockDuration = MIN_LOCK_DURATION;

      const { result, events } = simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockDuration)],
        address1
      );

      expect(result).toBeOk(Cl.uint(1)); // First vault ID is 1

      // Check STX transfer event
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe("stx_transfer_event");
    });

    it("increments vault counter after creating vaults", () => {
      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(1000000), Cl.uint(MIN_LOCK_DURATION)],
        address1
      );

      const { result } = simnet.callReadOnlyFn(
        "vault-stack",
        "get-vault-counter",
        [],
        address1
      );
      expect(result).toBeOk(Cl.uint(1));
    });

    it("stores vault details correctly", () => {
      const amount = 2000000;
      const lockDuration = MIN_LOCK_DURATION * 2;

      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockDuration)],
        address1
      );

      const { result } = simnet.callReadOnlyFn(
        "vault-stack",
        "get-vault",
        [Cl.uint(1)],
        address1
      );

      // Check that vault was created with the correct data
      expect(result).toBeSome(
        Cl.tuple({
          owner: Cl.principal(address1),
          amount: Cl.uint(amount),
          "deposit-time": Cl.uint(simnet.blockHeight),
          "unlock-time": Cl.uint(simnet.blockHeight + lockDuration),
          "interest-earned": Cl.uint(
            Math.floor((amount * ANNUAL_INTEREST_RATE * lockDuration) / (10000 * SECONDS_PER_YEAR))
          ),
          withdrawn: Cl.bool(false),
        })
      );
    });

    it("adds vault ID to user's vault list", () => {
      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(1000000), Cl.uint(MIN_LOCK_DURATION)],
        address1
      );

      const { result } = simnet.callReadOnlyFn(
        "vault-stack",
        "get-user-vaults",
        [Cl.principal(address1)],
        address1
      );

      expect(result).toBeTuple({ "vault-ids": Cl.list([Cl.uint(1)]) });
    });

    it("allows multiple vaults per user", () => {
      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(1000000), Cl.uint(MIN_LOCK_DURATION)],
        address1
      );

      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(2000000), Cl.uint(MIN_LOCK_DURATION * 2)],
        address1
      );

      const { result } = simnet.callReadOnlyFn(
        "vault-stack",
        "get-user-vaults",
        [Cl.principal(address1)],
        address1
      );

      expect(result).toBeTuple({
        "vault-ids": Cl.list([Cl.uint(1), Cl.uint(2)]),
      });
    });

    it("updates total deposits correctly", () => {
      const amount1 = 1000000;
      const amount2 = 2000000;

      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(amount1), Cl.uint(MIN_LOCK_DURATION)],
        address1
      );

      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(amount2), Cl.uint(MIN_LOCK_DURATION)],
        address2
      );

      const { result } = simnet.callReadOnlyFn(
        "vault-stack",
        "get-total-deposits",
        [],
        address1
      );

      expect(result).toBeOk(Cl.uint(amount1 + amount2));
    });

    it("fails with invalid amount (zero)", () => {
      const { result } = simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(0), Cl.uint(MIN_LOCK_DURATION)],
        address1
      );

      expect(result).toBeErr(Cl.uint(105)); // err-invalid-amount
    });

    it("fails with lock duration too short", () => {
      const { result } = simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(1000000), Cl.uint(MIN_LOCK_DURATION - 1)],
        address1
      );

      expect(result).toBeErr(Cl.uint(104)); // err-invalid-duration
    });
  });

  describe("Vault Status", () => {
    it("returns correct vault status for locked vault", () => {
      const amount = 1000000;
      const lockDuration = MIN_LOCK_DURATION;

      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockDuration)],
        address1
      );

      const { result } = simnet.callReadOnlyFn(
        "vault-stack",
        "get-vault-status",
        [Cl.uint(1)],
        address1
      );

      // Verify the status
      expect(result).toBeOk(
        Cl.tuple({
          "vault-id": Cl.uint(1),
          owner: Cl.principal(address1),
          amount: Cl.uint(amount),
          "deposit-time": Cl.uint(simnet.blockHeight),
          "unlock-time": Cl.uint(simnet.blockHeight + lockDuration),
          "current-time": Cl.uint(simnet.blockHeight),
          "is-unlocked": Cl.bool(false),
          "time-remaining": Cl.uint(lockDuration),
          "interest-earned": Cl.uint(
            Math.floor((amount * ANNUAL_INTEREST_RATE * lockDuration) / (10000 * SECONDS_PER_YEAR))
          ),
          withdrawn: Cl.bool(false),
        })
      );
    });

    it("returns correct vault status for unlocked vault", () => {
      const amount = 1000000;
      const lockDuration = MIN_LOCK_DURATION;

      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockDuration)],
        address1
      );

      // Advance time past unlock time
      simnet.mineEmptyBlocks(lockDuration);

      const { result } = simnet.callReadOnlyFn(
        "vault-stack",
        "get-vault-status",
        [Cl.uint(1)],
        address1
      );

      expect(result).toBeOk(
        Cl.tuple({
          "vault-id": Cl.uint(1),
          owner: Cl.principal(address1),
          amount: Cl.uint(amount),
          "deposit-time": Cl.uint(simnet.blockHeight - lockDuration),
          "unlock-time": Cl.uint(simnet.blockHeight),
          "current-time": Cl.uint(simnet.blockHeight),
          "is-unlocked": Cl.bool(true),
          "time-remaining": Cl.uint(0),
          "interest-earned": Cl.uint(
            Math.floor((amount * ANNUAL_INTEREST_RATE * lockDuration) / (10000 * SECONDS_PER_YEAR))
          ),
          withdrawn: Cl.bool(false),
        })
      );
    });

    it("fails for non-existent vault", () => {
      const { result } = simnet.callReadOnlyFn(
        "vault-stack",
        "get-vault-status",
        [Cl.uint(999)],
        address1
      );

      expect(result).toBeErr(Cl.uint(103)); // err-vault-not-found
    });
  });

  describe("Withdraw from Vault", () => {
    it("successfully withdraws after unlock time", () => {
      const amount = 1000000;
      const lockDuration = MIN_LOCK_DURATION;
      const expectedInterest = Math.floor(
        (amount * ANNUAL_INTEREST_RATE * lockDuration) / (10000 * SECONDS_PER_YEAR)
      );

      // Fund contract first
      simnet.callPublicFn(
        "vault-stack",
        "fund-contract",
        [Cl.uint(expectedInterest)],
        deployer
      );

      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockDuration)],
        address1
      );

      // Advance time past unlock time
      simnet.mineEmptyBlocks(lockDuration);

      const { result, events } = simnet.callPublicFn(
        "vault-stack",
        "withdraw-from-vault",
        [Cl.uint(1)],
        address1
      );

      expect(result).toBeOk(Cl.uint(amount + expectedInterest));

      // Check STX transfer event
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe("stx_transfer_event");
    });

    it("marks vault as withdrawn after successful withdrawal", () => {
      const amount = 1000000;
      const lockDuration = MIN_LOCK_DURATION;
      const expectedInterest = Math.floor(
        (amount * ANNUAL_INTEREST_RATE * lockDuration) / (10000 * SECONDS_PER_YEAR)
      );

      // Fund contract first
      simnet.callPublicFn(
        "vault-stack",
        "fund-contract",
        [Cl.uint(expectedInterest)],
        deployer
      );

      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockDuration)],
        address1
      );

      const depositHeight = simnet.blockHeight;
      simnet.mineEmptyBlocks(lockDuration);

      simnet.callPublicFn(
        "vault-stack",
        "withdraw-from-vault",
        [Cl.uint(1)],
        address1
      );

      const { result } = simnet.callReadOnlyFn(
        "vault-stack",
        "get-vault",
        [Cl.uint(1)],
        address1
      );

      expect(result).toBeSome(
        Cl.tuple({
          owner: Cl.principal(address1),
          amount: Cl.uint(amount),
          "deposit-time": Cl.uint(depositHeight),
          "unlock-time": Cl.uint(depositHeight + lockDuration),
          "interest-earned": Cl.uint(expectedInterest),
          withdrawn: Cl.bool(true),
        })
      );
    });

    it("updates total deposits after withdrawal", () => {
      const amount = 1000000;
      const lockDuration = MIN_LOCK_DURATION; // Keep minimum duration
      const expectedInterest = Math.floor(
        (amount * ANNUAL_INTEREST_RATE * lockDuration) / (10000 * SECONDS_PER_YEAR)
      );

      // Fund contract first
      simnet.callPublicFn(
        "vault-stack",
        "fund-contract",
        [Cl.uint(expectedInterest)],
        deployer
      );

      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockDuration)],
        address1
      );

      simnet.mineEmptyBlocks(lockDuration);

      simnet.callPublicFn(
        "vault-stack",
        "withdraw-from-vault",
        [Cl.uint(1)],
        address1
      );

      const { result } = simnet.callReadOnlyFn(
        "vault-stack",
        "get-total-deposits",
        [],
        address1
      );

      expect(result).toBeOk(Cl.uint(0));
    });

    it("fails to withdraw before unlock time", () => {
      const amount = 1000000;
      const lockDuration = MIN_LOCK_DURATION;

      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockDuration)],
        address1
      );

      const { result } = simnet.callPublicFn(
        "vault-stack",
        "withdraw-from-vault",
        [Cl.uint(1)],
        address1
      );

      expect(result).toBeErr(Cl.uint(102)); // err-vault-locked
    });

    it("fails if non-owner tries to withdraw", () => {
      const amount = 1000000;
      const lockDuration = MIN_LOCK_DURATION;

      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockDuration)],
        address1
      );

      simnet.mineEmptyBlocks(lockDuration);

      const { result } = simnet.callPublicFn(
        "vault-stack",
        "withdraw-from-vault",
        [Cl.uint(1)],
        address2 // Different user
      );

      expect(result).toBeErr(Cl.uint(100)); // err-owner-only
    });

    it("fails if vault already withdrawn", () => {
      const amount = 1000000;
      const lockDuration = MIN_LOCK_DURATION;
      const expectedInterest = Math.floor(
        (amount * ANNUAL_INTEREST_RATE * lockDuration) / (10000 * SECONDS_PER_YEAR)
      );

      // Fund contract first
      simnet.callPublicFn(
        "vault-stack",
        "fund-contract",
        [Cl.uint(expectedInterest)],
        deployer
      );

      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockDuration)],
        address1
      );

      simnet.mineEmptyBlocks(lockDuration);

      simnet.callPublicFn(
        "vault-stack",
        "withdraw-from-vault",
        [Cl.uint(1)],
        address1
      );

      // Try to withdraw again
      const { result } = simnet.callPublicFn(
        "vault-stack",
        "withdraw-from-vault",
        [Cl.uint(1)],
        address1
      );

      expect(result).toBeErr(Cl.uint(106)); // err-already-withdrawn
    });

    it("fails for non-existent vault", () => {
      const { result } = simnet.callPublicFn(
        "vault-stack",
        "withdraw-from-vault",
        [Cl.uint(999)],
        address1
      );

      expect(result).toBeErr(Cl.uint(103)); // err-vault-not-found
    });
  });

  describe("Emergency Withdraw", () => {
    it("successfully withdraws principal without interest", () => {
      const amount = 1000000;
      const lockDuration = MIN_LOCK_DURATION;

      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockDuration)],
        address1
      );

      const { result } = simnet.callPublicFn(
        "vault-stack",
        "emergency-withdraw",
        [Cl.uint(1)],
        address1
      );

      expect(result).toBeOk(Cl.uint(amount)); // Only principal, no interest
    });

    it("marks vault as withdrawn after emergency withdrawal", () => {
      const amount = 1000000;
      const lockDuration = MIN_LOCK_DURATION;

      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockDuration)],
        address1
      );

      const depositHeight = simnet.blockHeight;

      simnet.callPublicFn(
        "vault-stack",
        "emergency-withdraw",
        [Cl.uint(1)],
        address1
      );

      const { result } = simnet.callReadOnlyFn(
        "vault-stack",
        "get-vault",
        [Cl.uint(1)],
        address1
      );

      expect(result).toBeSome(
        Cl.tuple({
          owner: Cl.principal(address1),
          amount: Cl.uint(amount),
          "deposit-time": Cl.uint(depositHeight),
          "unlock-time": Cl.uint(depositHeight + lockDuration),
          "interest-earned": Cl.uint(
            Math.floor((amount * ANNUAL_INTEREST_RATE * lockDuration) / (10000 * SECONDS_PER_YEAR))
          ),
          withdrawn: Cl.bool(true),
        })
      );
    });

    it("updates total deposits after emergency withdrawal", () => {
      const amount = 1000000;
      const lockDuration = MIN_LOCK_DURATION;

      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockDuration)],
        address1
      );

      simnet.callPublicFn(
        "vault-stack",
        "emergency-withdraw",
        [Cl.uint(1)],
        address1
      );

      const { result } = simnet.callReadOnlyFn(
        "vault-stack",
        "get-total-deposits",
        [],
        address1
      );

      expect(result).toBeOk(Cl.uint(0));
    });

    it("allows emergency withdraw before unlock time", () => {
      const amount = 1000000;
      const lockDuration = MIN_LOCK_DURATION;

      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockDuration)],
        address1
      );

      // No time advancement - still locked

      const { result } = simnet.callPublicFn(
        "vault-stack",
        "emergency-withdraw",
        [Cl.uint(1)],
        address1
      );

      expect(result).toBeOk(Cl.uint(amount));
    });

    it("fails if non-owner tries emergency withdraw", () => {
      const amount = 1000000;
      const lockDuration = MIN_LOCK_DURATION;

      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockDuration)],
        address1
      );

      const { result } = simnet.callPublicFn(
        "vault-stack",
        "emergency-withdraw",
        [Cl.uint(1)],
        address2 // Different user
      );

      expect(result).toBeErr(Cl.uint(100)); // err-owner-only
    });

    it("fails if vault already withdrawn", () => {
      const amount = 1000000;
      const lockDuration = MIN_LOCK_DURATION;

      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockDuration)],
        address1
      );

      simnet.callPublicFn(
        "vault-stack",
        "emergency-withdraw",
        [Cl.uint(1)],
        address1
      );

      // Try to emergency withdraw again
      const { result } = simnet.callPublicFn(
        "vault-stack",
        "emergency-withdraw",
        [Cl.uint(1)],
        address1
      );

      expect(result).toBeErr(Cl.uint(106)); // err-already-withdrawn
    });
  });

  describe("Fund Contract", () => {
    it("allows contract owner to fund the contract", () => {
      const fundAmount = 5000000;

      const { result, events } = simnet.callPublicFn(
        "vault-stack",
        "fund-contract",
        [Cl.uint(fundAmount)],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe("stx_transfer_event");
    });

    it("increases contract balance after funding", () => {
      const fundAmount = 5000000;

      simnet.callPublicFn(
        "vault-stack",
        "fund-contract",
        [Cl.uint(fundAmount)],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        "vault-stack",
        "get-contract-balance",
        [],
        deployer
      );

      expect(result).toBeOk(Cl.uint(fundAmount));
    });

    it("fails if non-owner tries to fund contract", () => {
      const { result } = simnet.callPublicFn(
        "vault-stack",
        "fund-contract",
        [Cl.uint(1000000)],
        address1 // Not the owner
      );

      expect(result).toBeErr(Cl.uint(100)); // err-owner-only
    });
  });

  describe("Contract Balance", () => {
    it("returns correct contract balance with vaults and funding", () => {
      const vaultAmount = 1000000;
      const fundAmount = 500000;

      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(vaultAmount), Cl.uint(MIN_LOCK_DURATION)],
        address1
      );

      simnet.callPublicFn(
        "vault-stack",
        "fund-contract",
        [Cl.uint(fundAmount)],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        "vault-stack",
        "get-contract-balance",
        [],
        deployer
      );

      expect(result).toBeOk(Cl.uint(vaultAmount + fundAmount));
    });
  });

  describe("Integration Tests", () => {
    it("handles complete vault lifecycle with interest payment", () => {
      const amount = 10000000; // 10 STX
      const lockDuration = MIN_LOCK_DURATION; // Use minimum valid duration
      const expectedInterest = Math.floor(
        (amount * ANNUAL_INTEREST_RATE * lockDuration) / (10000 * SECONDS_PER_YEAR)
      );

      // Fund contract with enough for interest
      simnet.callPublicFn(
        "vault-stack",
        "fund-contract",
        [Cl.uint(expectedInterest)],
        deployer
      );

      // Create vault
      const createResult = simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockDuration)],
        address1
      );
      expect(createResult.result).toBeOk(Cl.uint(1));

      // Vault should be locked initially - we'll verify after time advances

      // Advance time
      simnet.mineEmptyBlocks(lockDuration);

      // Vault should now be unlocked after time advance

      // Withdraw with interest
      const withdrawResult = simnet.callPublicFn(
        "vault-stack",
        "withdraw-from-vault",
        [Cl.uint(1)],
        address1
      );
      expect(withdrawResult.result).toBeOk(Cl.uint(amount + expectedInterest));
    });

    it("handles multiple users with multiple vaults", () => {
      // User 1 creates 2 vaults
      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(1000000), Cl.uint(MIN_LOCK_DURATION)],
        address1
      );

      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(2000000), Cl.uint(MIN_LOCK_DURATION * 2)],
        address1
      );

      // User 2 creates 1 vault
      simnet.callPublicFn(
        "vault-stack",
        "create-vault",
        [Cl.uint(3000000), Cl.uint(MIN_LOCK_DURATION)],
        address2
      );

      // Check user 1 vaults
      const user1Vaults = simnet.callReadOnlyFn(
        "vault-stack",
        "get-user-vaults",
        [Cl.principal(address1)],
        address1
      );
      expect(user1Vaults.result).toBeTuple({
        "vault-ids": Cl.list([Cl.uint(1), Cl.uint(2)]),
      });

      // Check user 2 vaults
      const user2Vaults = simnet.callReadOnlyFn(
        "vault-stack",
        "get-user-vaults",
        [Cl.principal(address2)],
        address2
      );
      expect(user2Vaults.result).toBeTuple({
        "vault-ids": Cl.list([Cl.uint(3)]),
      });

      // Check total deposits
      const totalDeposits = simnet.callReadOnlyFn(
        "vault-stack",
        "get-total-deposits",
        [],
        address1
      );
      expect(totalDeposits.result).toBeOk(Cl.uint(6000000));
    });
  });
});
