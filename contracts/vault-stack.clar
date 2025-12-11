;; vault-stack Contract
;; Demonstrates Clarity 4's stacks-block-height feature
;; Users can deposit STX and earn interest based on actual time locked

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-insufficient-balance (err u101))
(define-constant err-vault-locked (err u102))
(define-constant err-vault-not-found (err u103))
(define-constant err-invalid-duration (err u104))
(define-constant err-invalid-amount (err u105))
(define-constant err-already-withdrawn (err u106))

;; Annual interest rate (in basis points: 500 = 5%)
(define-constant annual-interest-rate u500)

;; Minimum lock duration (7 days in seconds)
(define-constant min-lock-duration u604800)

;; Data Variables
(define-data-var total-deposits uint u0)
(define-data-var vault-counter uint u0)

;; Data Maps
(define-map vaults
  { vault-id: uint }
  {
    owner: principal,
    amount: uint,
    deposit-time: uint,
    unlock-time: uint,
    interest-earned: uint,
    withdrawn: bool
  }
)

(define-map user-vault-ids
  { user: principal }
  { vault-ids: (list 50 uint) }
)

;; Read-only functions

(define-read-only (get-vault (vault-id uint))
  (map-get? vaults { vault-id: vault-id })
)

(define-read-only (get-user-vaults (user principal))
  (default-to 
    { vault-ids: (list) }
    (map-get? user-vault-ids { user: user })
  )
)

(define-read-only (get-total-deposits)
  (ok (var-get total-deposits))
)

(define-read-only (get-vault-counter)
  (ok (var-get vault-counter))
)

(define-read-only (calculate-interest (amount uint) (duration uint))
  (let
    (
      ;; Convert duration from seconds to years (simplified: 365 days)
      (seconds-per-year u31536000)
      ;; Calculate interest: (amount * rate * duration) / (10000 * seconds_per_year)
      ;; We use 10000 as denominator because rate is in basis points
      (interest (/ (* (* amount annual-interest-rate) duration) 
                   (* u10000 seconds-per-year)))
    )
    (ok interest)
  )
)