# Security Specification — Yi Lai Plastics Industry CMS

## 1. Data Invariants
1. All `create`, `update`, and `delete` operations across `/products/{productId}`, `/blog_posts/{postId}`, and `/seo_settings/{settingId}` require a verified Google account matching the owner email (`andrewandrre88@gmail.com`) with `request.auth.token.email_verified == true`.
2. Public visitors may only read published documents (`resource.data.published == true` on products/blog_posts; `resource.data.isPublic == true` on `seo_settings`) and are never permitted to list or read unpublished drafts unless authenticated as the verified admin.
3. Every document ID must satisfy `isValidId(id)` (`^[a-zA-Z0-9_-]+$`, `size() <= 128`).
4. Every create and update enforces strict key allowlisting (`keys().hasAll(...) && keys().hasOnly(...)` on create; `affectedKeys().hasOnly(...)` on update), `authorUid` immutability (`incoming().authorUid == existing().authorUid`), and server-enforced timestamps (`createdAt == request.time`, `updatedAt == request.time`).
5. Unbounded lists inside documents are forbidden (`paragraphs` bounded to `1 <= size <= 20`, first element validated as `string`).

## 2. Adversarial Payloads ("Dirty Dozen")
1. Unauthenticated write to `/products/custom-1` -> `PERMISSION_DENIED`
2. Authenticated non-admin (`other@gmail.com`, verified) write to `/products/custom-1` -> `PERMISSION_DENIED`
3. Spoofed unverified admin email (`andrewandrre88@gmail.com`, `email_verified: false`) -> `PERMISSION_DENIED`
4. Ghost/shadow field injection (`{ ...validProduct, isVerified: true }`) -> `PERMISSION_DENIED`
5. ID poisoning with 500-char or invalid characters (`../../etc/passwd`) -> `PERMISSION_DENIED`
6. Forged `authorUid` on create (`authorUid != request.auth.uid`) -> `PERMISSION_DENIED`
7. Mutating `authorUid` or `createdAt` during update -> `PERMISSION_DENIED`
8. Spoofed client timestamp (`createdAt != request.time` or `updatedAt != request.time`) -> `PERMISSION_DENIED`
9. Invalid category enum (`category: "electronics"`) -> `PERMISSION_DENIED`
10. Unbounded/non-string array (`paragraphs: []` or `paragraphs` > 20 items or `paragraphs[0]: 123`) -> `PERMISSION_DENIED`
11. Unauthenticated `list` on `/blog_posts` without `published == true` filter -> `PERMISSION_DENIED`
12. `seo_settings` update mutating `isPublic` to a non-boolean or injecting oversized 10KB strings -> `PERMISSION_DENIED`
