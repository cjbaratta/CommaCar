---
title: "Why Your Car Might Not Work With openpilot: A Friendly Guide to Compatibility"
date: 2026-05-01T17:38:00.000-05:00
description: A tour of the six main reasons cars get left out of openpilot
category: Guide
readingTime: 5 min read
---
openpilot, the open-source advanced driver-assistance system (ADAS) maintained by comma.ai, currently runs on more than 300 supported car models and has been favorably reviewed for delivering a more "natural" driving experience than many factory ADAS systems. But if you have ever skimmed comma's compatibility list and noticed your car missing — or only some trims and model years included — you have probably wondered why. The short answer is that openpilot is essentially a polite hijacker: it talks to the same computers that your factory lane-keep and cruise systems use. If those computers do not exist, do not speak the same language, or are locked behind a digital deadbolt, openpilot cannot do its job. Below is a tour of the six main reasons cars get left off the list.

## 1. CAN Bus vs. FlexRay: A Language Barrier

Modern cars are essentially rolling networks of dozens of small computers (ECUs) that gossip with each other over an internal "bus." The most common is the **CAN bus** (Controller Area Network), a protocol Bosch introduced in 1983. CAN is broadcast-based, relatively simple, and extremely well-understood — it is the de-facto standard for in-vehicle communication, and every car openpilot supports today uses CAN (or its newer high-speed variant, CAN FD).

**FlexRay**, by contrast, is a faster (up to 10 Mbit/s), deterministic, dual-channel, fault-tolerant protocol developed by a consortium led by BMW and Daimler in the early 2000s. It is more expensive and more complex, with strict time-slot scheduling rather than simple message priorities. According to comma.ai's own documentation, "Most, if not all, vehicles from the following manufacturers use FlexRay instead of a CAN bus: BMW, Mercedes, Audi, Land Rover, and some Volvo." Because openpilot's hardware (the comma 4 and its panda interface) and software stack are built around CAN, talking to FlexRay cars would require new hardware, new firmware, and significant reverse engineering. Comma has stated these vehicles "may one day be supported, but we have no immediate plans to support FlexRay." So if you drive a BMW 3-Series, a Mercedes C-Class, an Audi A6, or a recent Volvo XC90, openpilot is effectively speaking the wrong language to your car.

## 2. No Adaptive Cruise Control (ACC) = No openpilot

openpilot does not bolt new actuators onto your steering rack or brake calipers. Instead, it sends commands to the gas, brake, and steering interfaces that are *already* in your car — the same ones used by factory adaptive cruise control (ACC) and lane-keeping assist (LKAS). If those interfaces are not there, there is nothing for openpilot to talk to.

Comma's docs put it plainly: "openpilot uses the existing steering, gas, and brake interfaces in your car. If your car lacks any one of these interfaces, openpilot will not be able to control the car. If your car has ACC and any form of LKAS/LCA, then it almost certainly has these interfaces." These features generally started shipping around **2016**, which is roughly the cutoff for compatibility. A 2014 Honda Civic LX with plain cruise control simply does not have a drive-by-wire braking command channel — there is no software switch openpilot can flip to slow the car down.

## 3. Unsupported Model Years: Same Badge, Different Brain

It is common to see a model supported in 2019 but not in 2017, or supported through 2022 and then dropped in 2023. Three things drive this:

- **Hardware revisions.** Manufacturers quietly swap ECUs, radar units, or cameras mid-generation. The 2022+ VW MQB cars, for example, may use a combined CAN gateway and BCM that requires a different harness than earlier models.
- **CAN FD migration.** Newer Hyundai, Kia, and Genesis models moved to CAN FD, which requires comma 3x or newer hardware (or a CAN FD panda kit) — older comma 2 devices cannot drive these cars at all.
- **New cryptographic protections.** The clearest current example is **Toyota Safety Sense (TSS) 3.0**. Starting with the RAV4 Prime/PHEV, 2021+ Sienna, 2021+ Venza, 2022+ Tundra, 2023+ Sequoia, bZ4X, and many newer Lexus models, Toyota added a "Toyota Security Key" / SecOC message-authentication scheme. Without that key, the camera and radar ECUs reject openpilot's messages. Comma's docs explicitly state: "openpilot does not yet support these Toyota models due to a new message authentication method." Ford has taken a similar direction with its Trusted Realtime Operating Network (TRON) on certain CAN FD vehicles starting with the 2023 Super Duty.

So a 2020 RAV4 Hybrid is fully supported, while a 2023 RAV4 Prime is not — same nameplate, very different electronics.

## 4. Regional Differences: Same Car, Different Market

A car sold in the U.S., Europe, Japan, and China is rarely the same car under the skin. Different regions get different ECU firmware, different ADAS hardware bundles, and different CAN message databases. Comma's docs are sprinkled with footnotes about exactly this:

- The **Ford Focus** is supported only in the **Mk4 (C519)** sold in Europe, China, Taiwan, and Australasia — *not* the Mk3 (C346) sold in the Americas and Southeast Asia.
- The **VW Passat** entry refers only to the **MQB-based European B8 Passat**, *not* the NMS Passat sold in the U.S., China, and the Middle East.
- The **Škoda Kamiq** is supported except in China, where it is built on the older PQ34 platform.
- For non-U.S.-market **Subarus**, openpilot requires the car to come equipped with EyeSight *with Lane Keep Assistance* — a combination that is standard in the U.S. but optional or absent abroad.
- The 2019 Honda Civic 1.6L Diesel sedan (a European/Asian variant) does not get automated lane centering below 12 mph, while gas-engine North American Civics do.

In short: a "supported" listing usually references the U.S. market. Importing the same VIN-pattern car from another region can mean a totally different ECU stack and a non-functional install.

## 5. Security Gateways: The Digital Deadbolt

Starting in **model year 2018**, every vehicle from FCA (now Stellantis) — Chrysler, Dodge, Jeep, Ram, Fiat, Alfa Romeo, and Maserati — ships with a **Security Gateway Module (SGW/SGM)** sitting between the OBD-II port and the rest of the CAN network. FCA introduced it as a cybersecurity measure (a response to the infamous 2015 Jeep Cherokee remote-hack demonstration), but in practice it also blocks aftermarket scan tools, tuners, and ADAS retrofits from sending commands on the bus.

For openpilot, this means a stock 2019+ Ram 1500, Jeep Wrangler, Grand Cherokee, or Dodge Charger cannot be used as-delivered: the comma device can listen, but the car ignores its commands. The community workaround is a **bypass harness** (sometimes called a "12+8" cable, T-harness, or SGW bypass module) that physically reroutes the CAN-C and CAN-IHS lines around the gateway. Vendors like Z Automotive, OBD Genie, and KaodTech sell these. Comma's officially supported Chrysler/Jeep ports rely on community-built bypass solutions, which is part of why FCA/Stellantis vehicles remain "community supported" rather than fully plug-and-play.

## 6. Trims Without the Required Hardware

Even when a model appears on the supported list, the *specific trim* matters enormously, because ACC and LKAS are usually optional or bundled into higher trim packages. A car without the radar and camera modules has no drive-by-wire steering, gas, or brake interface for openpilot to use.

Examples are easy to find:

- On the 2016 Honda Civic, openpilot originally only supported the **Touring** trim because that was the only one with **Honda Sensing** (the package containing ACC + LKAS). LX and EX-T owners were out of luck until later years made Honda Sensing standard.
- General Motors Bolt EV support requires the **Premier or Premier Redline trim** — and crucially, *without* the Super Cruise package, which uses a different and currently unsupported control architecture.
- Many Toyota Camry 4-cylinder L, LE, and SE trims lack **Full-Speed Range Dynamic Radar Cruise Control**, so openpilot only works above 28 mph on those, while XLE/XSE trims with full-speed-range ACC work down to a stop.
- Hyundai/Kia owners often discover their LX or base trim lacks **Smart Cruise Control (SCC)** and Lane Following Assist (LFA), making installation impossible even though the EX trim of the same car is fully supported.

The good news: many manufacturers (Honda, Toyota, Subaru, Hyundai) have moved their ADAS suites to standard equipment on most trims since roughly 2020, so this is becoming less of an obstacle on newer cars.

## The Big Picture

openpilot's compatibility is a moving target shaped by industry trends pulling in opposite directions. On one hand, ACC and LKAS are now nearly universal on new cars, which should expand the eligible pool. On the other hand, manufacturers are migrating to FlexRay (premium European brands), Automotive Ethernet, message authentication (Toyota TSS 3.0, Ford TRON), and locked security gateways (Stellantis) — all of which raise the technical bar for any aftermarket ADAS. If your car was built between roughly 2016 and 2022, has CAN-based ECUs, came with factory ACC + LKAS, was sold in a region comma actively supports, and is not behind an unbypassed security gateway, your odds are excellent. Otherwise, the most reliable path is to check comma.ai's official supported cars list — by exact year, trim, *and* market — before buying a comma 4.
