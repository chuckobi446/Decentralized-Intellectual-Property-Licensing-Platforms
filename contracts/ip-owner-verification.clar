;; IP Owner Verification Contract
;; This contract validates intellectual property owners

;; Define data variables
(define-data-var admin principal tx-sender)

;; Define data maps
(define-map ip-owners
  { ip-id: (string-utf8 36) }
  {
    owner: principal,
    title: (string-utf8 100),
    description: (string-utf8 500),
    creation-date: uint,
    registration-date: uint,
    verified: bool
  }
)

;; Define public functions
(define-public (register-ip (ip-id (string-utf8 36)) (title (string-utf8 100)) (description (string-utf8 500)) (creation-date uint))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u403))
    (asserts! (is-none (map-get? ip-owners { ip-id: ip-id })) (err u100))
    (ok (map-set ip-owners
      { ip-id: ip-id }
      {
        owner: tx-sender,
        title: title,
        description: description,
        creation-date: creation-date,
        registration-date: block-height,
        verified: false
      }
    ))
  )
)

(define-public (verify-ip (ip-id (string-utf8 36)))
  (let ((ip-data (unwrap! (map-get? ip-owners { ip-id: ip-id }) (err u404))))
    (begin
      (asserts! (is-eq tx-sender (var-get admin)) (err u403))
      (ok (map-set ip-owners
        { ip-id: ip-id }
        (merge ip-data { verified: true })
      ))
    )
  )
)

(define-public (transfer-ip-ownership (ip-id (string-utf8 36)) (new-owner principal))
  (let ((ip-data (unwrap! (map-get? ip-owners { ip-id: ip-id }) (err u404))))
    (begin
      (asserts! (is-eq tx-sender (get owner ip-data)) (err u403))
      (ok (map-set ip-owners
        { ip-id: ip-id }
        (merge ip-data { owner: new-owner })
      ))
    )
  )
)

;; Define read-only functions
(define-read-only (get-ip-owner (ip-id (string-utf8 36)))
  (map-get? ip-owners { ip-id: ip-id })
)

(define-read-only (is-ip-verified (ip-id (string-utf8 36)))
  (default-to false (get verified (map-get? ip-owners { ip-id: ip-id })))
)

;; Define private functions
(define-private (is-ip-owner (ip-id (string-utf8 36)) (user principal))
  (is-eq user (default-to tx-sender (get owner (map-get? ip-owners { ip-id: ip-id }))))
)
