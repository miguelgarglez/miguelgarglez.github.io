---
title: "Keeping bookings and credits consistent under retries"
description: "A WellStudio build note on last-seat races, repeatable booking history, payment idempotency, and validation boundaries."
date: 2026-09-21
kind: "article"
lang: "en"
tags: ["wellstudio", "postgresql", "testing", "payments"]
featured: false
draft: true
project: "wellstudio-platform"
related: []
---

WellStudio lets someone browse a studio's schedule, book a class as a member, or
manage the day's sessions as staff. Bookings and payments connect these parts of
the app.

Two members can ask for the last place at once, and someone who cancels may want
to book that same session again. Payment confirmations can arrive twice too.
Those cases need to leave bookings and credit balances in a consistent state.

This is a portfolio demo with synthetic data. No live studio has adopted it, and
I have no commercial usage or load-test results to report. The September
stabilization work is integrated in Preview. The design has been checked locally,
in the sandbox, and on the deployed app, with different limits in each environment.

## One application with domain services

The [modular monolith decision](https://github.com/miguelgarglez/wellstudio-platform/blob/dee184b14908834c1b802daebd1b8240af9ecaa1/docs/adr/ADR-001-monolito-modular-nextjs.md)
keeps WellStudio in one Next.js deployment. Routes and UI call domain services
for reservations, eligibility, and payments. Supabase Auth handles identity.
The local PostgreSQL model holds membership, entitlements, and credits.

The [eligibility model](https://github.com/miguelgarglez/wellstudio-platform/blob/dee184b14908834c1b802daebd1b8240af9ecaa1/docs/adr/ADR-004-eligibility-and-cancellation-model.md)
separates paying from having permission to book. Each reservation records the
entitlement it used, so a cancellation can follow the refund policy.
[Prisma](https://github.com/miguelgarglez/wellstudio-platform/blob/dee184b14908834c1b802daebd1b8240af9ecaa1/docs/adr/ADR-005-prisma-as-v1-orm.md)
provides the typed data layer. SQL migrations enforce the database constraints.

## Booking the last place

Checking capacity before writing a reservation leaves a race: two requests can
both read the last available place. The booking service puts its checks and
writes in a serializable transaction and limits the number of retries after a
transaction conflict. Capacity and entitlement use must agree with the credit
debit and notification job when that transaction finishes.

[PR #10](https://github.com/miguelgarglez/wellstudio-platform/pull/10) adds a
PostgreSQL regression that deliberately overlaps two calls to the real booking
service. It checks what reached the database: one booking, one debit, one
entitlement use, and one notification job. That tests this particular race
locally. It does not measure throughput or cover every possible ordering of
requests in production.

## Letting members cancel and book again

The original unique key covered member, session, and status. It allowed one
cancelled reservation, but if the same member booked and cancelled the same
session again, the second cancellation collided with the first historical row.

PR #10 removes that global restriction and keeps partial unique indexes for
active reservations and waitlist entries. Cancelled reservations and other
terminal states can repeat in the history, while active entries stay unique.

The local regressions repeat book/cancel and join/leave cycles, then check the
history, credit movements, and constraints on active records. The migration work
also adds the missing initial baseline and tests both an empty database and an
upgrade from an existing one.

Before applying that baseline to a populated database, its actual schema and
migration history still need reconciliation. Replaying the baseline DDL without
that check is not a safe upgrade.

## When a payment confirmation arrives twice

The [payment fulfillment service](https://github.com/miguelgarglez/wellstudio-platform/blob/dee184b14908834c1b802daebd1b8240af9ecaa1/modules/payments/server/credit-pack-checkout.ts)
stores the provider event before it fulfills the purchase. If it has already
processed that event, it returns without granting more credits. It checks the
provider, checkout session, amount, currency, and purchased units against the
payment snapshot stored locally.

Inside the transaction, the payment identifies its credit account, the ledger
records the purchase, and the notification job uses an idempotency key. Checking
the event ID alone is not enough: those records also need stable identities so
that another confirmation cannot create a second purchase entitlement.

The application can then recognize work it has already processed and reject
inconsistent confirmations. External systems can still deliver an event more
than once.

## What the checks covered

Revision
[`f06e3df`](https://github.com/miguelgarglez/wellstudio-platform/tree/f06e3dfecb541c8545f31f61aab78d94cc90410b)
passed 402 unit tests, the auth gate, and hosted CI with PostgreSQL.
Separate suites run serially against Supabase sandbox passed three auth cases,
six reservation cases, and six simulated-payment cases. Opt-in registration was
skipped.

The payment simulator is separate from Stripe test mode. A hybrid check used a
local checkout with real Stripe TEST and the existing Preview webhook, all
against the shared sandbox. One 54 EUR test-card payment produced a processed
provider event, one active credit account, and one purchase ledger entry for six
credits. The UI went from eighteen to twenty-four credits and kept that balance
after reload.

That checkout was only partly hosted. Reloading checked persistence; it did not
replay the webhook. The notification job reached SENT, but inbox receipt was not
verified.

Two later requests replayed the original Stripe event to the Preview webhook.
They used signatures from the SDK's test helper, and both returned 200. Complete
snapshots of the dedicated member's payments, accounts, ledger, events, and
purchase job stayed unchanged. These were controlled requests to test endpoint
deduplication. They did not come from Stripe's redelivery or retry scheduler.

On deployed Preview `447bd261`, refreshing the schedule manually created twelve
future sessions. Repeating the request created none. Before-and-after hashes
showed no changes to seventeen activity and catalog tables or twenty-five
existing sessions.

The public agenda and showcase also worked in a fresh Chromium context at desktop
and mobile sizes, including keyboard navigation. Those checks cover the tested
viewports and interactions, rather than every device, browser, or accessibility
interaction.

The [validation record](https://github.com/miguelgarglez/wellstudio-platform/blob/b05bee259ba0bf314a522414880bf46f196bd27a/docs/runbooks/portfolio-maintenance.md)
lists the environments and revisions alongside the unfinished checks: successful
OTP with email receipt, provider-originated retries, automatic scheduled refresh,
and remote migration-history reconciliation. The functional tests do not measure
load or guarantee latency.

For upkeep,
[dependency maintenance](https://github.com/miguelgarglez/wellstudio-platform/pull/8)
handles package updates, though a dependency advisory remains unresolved.
The [rolling synthetic sessions](https://github.com/miguelgarglez/wellstudio-platform/pull/9)
job keeps future classes on the schedule without resetting member activity.
The [operational PR](https://github.com/miguelgarglez/wellstudio-platform/pull/15)
configures the daily refresh and monthly dependency updates on the default branch.
Enabling it requires an Actions secret and separate publication approval. The
first automatic scheduled run still needs verification; a passing manual refresh
does not establish that the schedule runs.

## Keeping the project useful

The existing screenshots help explain the interface. They cannot verify a
migration or a payment replay; the validation record ties those claims to tested
revisions and environments. Scheduled operation and inbox receipt still need
their own checks, and promoting the app to Production remains a separate step.

I want to keep this useful as a portfolio demo without taking on open-ended
maintenance. That means fixing security issues, broken demo flows, and broken
links. Any new feature needs a separate decision.
