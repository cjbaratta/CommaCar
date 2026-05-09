---
title: Used Car Buying Checklist for openpilot Shoppers
category: Guide
readingTime: 7 min
date: "2026-05-08T05:00:00.000Z"
description: "Everything you need to verify before buying a used car you plan to run openpilot on — from trim-level gotchas to harness availability "
---
So you've decided to go the openpilot route — smart move. Comma.ai's open-source driver assistance system now supports 325+ car models and delivers a genuinely human-like driving experience that often outperforms the factory ADAS it replaces. But buying the *wrong* used car is a costly mistake that catches a lot of first-timers off guard. A car that looks perfect on paper can still fail to work with openpilot because of a missing trim package, a cracked windshield, or a mid-cycle hardware revision the listing didn't mention.

This checklist will walk you through everything to verify before you hand over your money.

---

## Before You Even Visit the Car

### ✅ 1. Confirm the Exact Year, Make, Model, and Trim

This is the most critical step. openpilot support is often **trim-specific**, and a one-trim-level difference can mean the difference between full support and a paperweight. For example:
- Some Chevrolet models require a specific trim *without* the Super Cruise package
- Toyota support varies significantly across sub-models and production years
- Honda models from the same year can ship with different camera/radar hardware depending on region

**What to do:**
- Cross-reference the VIN against the [comma.ai supported vehicles list](https://comma.ai/vehicles) and the [openpilot docs](https://docs.comma.ai/CARS/)
- Don't rely solely on the listing title — sellers often get trim levels wrong
- Look up the build sheet or window sticker via the VIN if possible

> **Pro tip:** openpilot identifies your car by scanning ECU firmware versions at startup. If your exact firmware isn't in its database, it falls back to dashcam-only mode. Confirming the trim upfront saves a lot of frustration.

---

### ✅ 2. Verify ACC and Lane Centering Are Equipped

openpilot works by taking over the steering, gas, and brake interfaces that your car's existing ADAS already uses. If those interfaces aren't there, openpilot simply can't function. The golden rule: **if the car has Adaptive Cruise Control (ACC) and any form of Lane Keep Assist (LKAS) or Lane Centering Assist (LCA), it almost certainly has the CAN bus interfaces openpilot needs.**

These features generally started appearing on cars around 2016, so anything older is a long shot unless it's a luxury trim.

**What to check:**
- Confirm ACC is listed as a feature — not just cruise control
- Confirm LKAS, LCA, or a similar lane assistance feature is present
- Be aware that some makes use FlexRay instead of CAN bus (BMW, Mercedes, Audi, Land Rover, some Volvo) — these are not currently supported

---

### ✅ 3. Check Comma Harness Availability

The comma harness is the physical connector that allows your comma device to interface with the car's existing camera and ECU. Each supported car requires a **specific harness**, and not every supported model has a harness sold directly by comma.

**What to do:**
- Check the [comma store](https://comma.ai/shop) to confirm your exact vehicle has a harness available *before* buying
- Some cars use community-built harnesses (like the ASCM harness for certain GM vehicles) — factor in lead time and availability
- Note that disconnecting some modules (like the Toyota DSU or GM ASCM) disables Automatic Emergency Braking — understand the tradeoffs for your specific car

---

## At the Dealership or Private Sale

### ✅ 4. Inspect the Windshield and Camera Mounting Area

The comma device mounts near the rearview mirror and uses a forward-facing camera that needs a clear, undamaged view of the road. A compromised windshield is a dealbreaker.

**Look for:**
- Cracks, chips, or deep scratches in the camera's field of view (typically the top-center of the windshield)
- Previous windshield replacements — aftermarket glass can have different tinting or coatings that affect camera performance
- Heated windshields (common on some Škoda and European models) — these are known to interfere with GPS signal on the comma 3X
- Obstructions or aftermarket tinting on the upper windshield band

**Also check the mount area** for signs of previous dash cam or GPS installations — adhesive residue, drill holes, or damage to the headliner near the mirror.

---

### ✅ 5. Run a Recall Check

Open safety recalls are common on used vehicles and occasionally affect the very ADAS components openpilot depends on — cameras, radar units, steering modules, and ECUs. An unrepaired recall could mean your car's hardware gets reflashed or replaced after purchase, potentially breaking openpilot compatibility.

**What to do:**
- Enter the VIN at [nhtsa.gov/recalls](https://www.nhtsa.gov/recalls) for the official NHTSA database
- Ask the seller if any open recalls have been addressed and get documentation
- Pay extra attention to any recalls involving the camera, radar, ADAS module, or steering system

---

### ✅ 6. Test Drive the Stock ADAS

Before you commit, test the factory driver assistance system thoroughly. openpilot replaces and improves on what's already there — but if the underlying hardware is faulty, no software can fix it.

**During the test drive:**
- Activate ACC and verify it holds speed and follows the car ahead smoothly
- Engage lane keep/centering and confirm the steering responds
- Check that the ADAS camera isn't throwing warning lights or error messages on the dash
- Drive on a highway if possible — many systems only activate above a minimum speed threshold
- Note any error tones, sudden disengagements, or erratic behavior

If the stock ADAS feels glitchy, assume the hardware has a problem. Walk away, or factor in repair costs.

---

### ✅ 7. Check the CAN Bus Hasn't Been Tampered With

Some modified or fleet vehicles have had aftermarket modules installed (dashcams wired to OBD, trailer brake controllers, remote starters) that can interfere with CAN bus communication. openpilot is sensitive to unusual traffic on the bus.

**Look for:**
- Aftermarket OBD dongles left plugged in
- Wiring that's been run behind the dash or through the firewall
- Evidence of previous telematics or fleet tracking hardware

---

## Before You Buy the Hardware

### ✅ 8. Verify the Return Policy Before Purchasing Your Comma Device

Comma.ai offers a **30-day money-back return policy** on their hardware. Don't let that window expire before you've confirmed everything works with your specific car. Buy the car first, then order the device.

**Best practice:**
- Order your comma device only after taking possession of the car
- Test the full setup — including fingerprinting, harness fit, and a real drive — well within the 30-day window
- Keep all original packaging until you're confident everything works

---

## Quick Reference Checklist

| # | Check                                                            | Status |
| - | ---------------------------------------------------------------- | ------ |
| 1 | Confirmed exact year/trim against supported vehicles list        | ☐      |
| 2 | ACC and lane centering confirmed as equipped                     | ☐      |
| 3 | Comma harness is available for this specific vehicle             | ☐      |
| 4 | Windshield and camera area inspected — no cracks or obstructions | ☐      |
| 5 | VIN recall check completed via NHTSA                             | ☐      |
| 6 | Stock ADAS test driven and functioning normally                  | ☐      |
| 7 | No aftermarket CAN bus interference found                        | ☐      |
| 8 | Comma device not ordered until car is in hand                    | ☐      |

---

## Best Bets for Used openpilot Shoppers

If you don't have a specific car in mind yet, the community broadly considers these platforms to offer the best openpilot experience on the used market:
- **Honda/Acura (2017–2022):** Excellent support, mature harnesses, great longitudinal control
- **Toyota/Lexus (2018–2021):** Very solid, though some newer models have moved to a new message authentication method that currently breaks support — check the list carefully
- **Hyundai/Kia/Genesis (2019–2023):** Strong support, increasingly popular in the community
- **GM (Chevrolet/GMC, 2017–2019):** Good support on specific trims, but harness situation is more complex

Avoid anything using FlexRay (most BMW, Mercedes, Audi, Land Rover) until official support arrives.

---

## Final Thoughts

Buying a used car for openpilot isn't harder than buying any other used car — it just requires a few extra homework steps. Get the VIN early, check it against the supported car list, physically inspect the windshield, and test the ADAS before you sign anything. Do those things and you'll be merging onto the highway in comma-assisted comfort before you know it.

*Always check* [*comma.ai/vehicles*](https://comma.ai/vehicles) *for the most up-to-date compatibility information, as support is actively expanding.*
