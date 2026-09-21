---
title: "Keeping bookings and credits consistent under retries"
description: "A WellStudio build note on last-seat races, repeatable booking history, payment idempotency, and the limits of local validation."
date: 2026-09-21
kind: "article"
lang: "en"
tags: ["wellstudio", "postgresql", "testing", "payments"]
featured: false
draft: true
project: "wellstudio-platform"
related: []
---

WellStudio started with three connected journeys: someone browsing a studio's
schedule, a member booking a class, and staff managing the day. The useful
engineering questions appear where those journeys touch the same records.

What happens when two members want the last place? Can someone cancel and book
the same session again? If a payment confirmation arrives twice, does it create
two credit balances?

This is a portfolio demo with synthetic data. It has not been adopted by a live
studio, and I have no commercial usage or load-test results to report. The
September closure work is still under review. This draft records the design and
the evidence available before integrated validation.

## One application, explicit boundaries

The [modular monolith decision](https://github.com/miguelgarglez/wellstudio-platform/blob/dee184b14908834c1b802daebd1b8240af9ecaa1/docs/adr/ADR-001-monolito-modular-nextjs.md)
keeps the application in one Next.js deployment. Routes and UI call domain
services for reservations, eligibility, and payments. Supabase Auth supplies
identity; the local PostgreSQL model owns membership, entitlements, and credits.

The [eligibility model](https://github.com/miguelgarglez/wellstudio-platform/blob/dee184b14908834c1b802daebd1b8240af9ecaa1/docs/adr/ADR-004-eligibility-and-cancellation-model.md)
separates paying from having permission to book. A reservation records which
entitlement it used, so cancellation can follow an explicit refund policy.
[Prisma](https://github.com/miguelgarglez/wellstudio-platform/blob/dee184b14908834c1b802daebd1b8240af9ecaa1/docs/adr/ADR-005-prisma-as-v1-orm.md)
provides the typed data layer; database invariants also require SQL migrations.

## The last place is a transaction

A capacity check made before writing a reservation is insufficient: two requests
can read the same available place. The booking service groups its checks and
writes in a serializable transaction, with bounded retries for transaction
conflicts. Capacity, entitlement consumption, the credit debit, and the
notification job need to agree after the transaction.

[PR #10](https://github.com/miguelgarglez/wellstudio-platform/pull/10) adds a
PostgreSQL regression that deliberately overlaps two real booking-service calls.
It checks the persisted outcome: one booking, one debit, one entitlement use, and
one notification job. That local result is evidence for a specific race. It is
not a throughput benchmark or a claim that every production interleaving has
been tested.

## History needs different uniqueness rules

The previous global unique key included member, session, and status. It could
represent one cancelled reservation for a member and session, but a second
cancellation collided with the historical row.

The correction in PR #10 drops that global restriction while retaining partial
unique indexes for active reservations and waitlist entries. Historical terminal
states can repeat. An active place remains unique.

The local regressions repeat book/cancel and join/leave cycles, then inspect
history, credit movements, and active-state constraints. The migration work also
adds the missing initial baseline and tests both an empty database and an
existing-database upgrade path. An existing database still needs reconciliation
of its actual schema and migration history; blindly replaying baseline DDL
against populated tables is not a rollout strategy.

## Payment confirmation can arrive again

The [payment fulfillment service](https://github.com/miguelgarglez/wellstudio-platform/blob/dee184b14908834c1b802daebd1b8240af9ecaa1/modules/payments/server/credit-pack-checkout.ts)
stores the provider event before fulfillment. Already processed events return
without granting credits again. The service checks provider, checkout session,
amount, currency, and purchased units against the local payment snapshot.

Within the transaction, the payment identifies its credit account, the ledger
records the purchase, and the notification job uses an idempotency key. These
stable identities matter beyond deduplicating a single event ID: a repeated
confirmation must not become another purchase entitlement.

This does not promise exactly-once delivery from external systems. It gives the
application a way to recognize work it has already processed and reject
inconsistent confirmations.

## A passing local check has a boundary

The implementation handoffs for PR #10 and the dependent
[CI proposal in PR #11](https://github.com/miguelgarglez/wellstudio-platform/pull/11)
report successful local migration, PostgreSQL regression, lint, typecheck, unit,
and build checks. PR #11 adds an isolated PostgreSQL service to CI while retaining
the existing foundation and smoke gates. Those handoffs did not establish final
hosted CI or deployed behavior.

The earlier payment validation used the application's sandbox simulator.
It did not complete a real Stripe test-mode Checkout and webhook journey.
Private auth/reservation journeys, auth latency, controlled-inbox email receipt,
and the hosted scheduler still need integrated verification.

Two other proposals address upkeep:
[dependency maintenance](https://github.com/miguelgarglez/wellstudio-platform/pull/8),
which still reports an unresolved dependency advisory, and
[rolling synthetic sessions](https://github.com/miguelgarglez/wellstudio-platform/pull/9),
which aims to keep a future schedule without resetting member activity.
Neither a PR nor a local test demonstrates that the current Preview alias runs
those changes.

## Keeping the project useful

The intended maintenance scope is security, broken demo journeys, and broken
links. Further features need a new decision. The existing screenshots remain
useful illustrations, but they cannot verify a migration or payment replay.

Before publishing this note, I need the integrated revision, its CI results,
the revision deployed to Preview, and the remaining validation limits recorded
together. Until then, the repository and the reviewable diffs are the evidence;
the project stays a demo under validation.
