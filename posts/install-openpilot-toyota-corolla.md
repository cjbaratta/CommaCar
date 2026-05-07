---
title: How to Install openpilot on a Toyota Corolla
date: "2026-05-01T00:00:00.000Z"
description: |
  Step-by-step guide to installing openpilot on a Toyota Corolla. Covers hardware, harness selection, mounting, software setup, and first-drive calibration.
category: Installation
readingTime: 8 min read
---


The Toyota Corolla is one of the most popular openpilot platforms — it's widely available, affordable, and supported across a broad range of model years (2020–2022 with TSS-P, and 2023+ with the updated package). This guide walks you through everything you need to go from a stock Corolla to a fully operational openpilot installation.

> **Check compatibility first.** Use the [PilotCompatible vehicle finder](/) to confirm your exact model year is supported and to see which harness you need before ordering anything.

## What You'll Need

Before you start, gather the following hardware:
- **comma 4** — the current flagship device from Comma.ai. Available at [comma.ai/shop](https://comma.ai/shop).
- **Toyota Nidec harness** — required for 2020–2022 Corollas with TSS 2.0. The harness plugs inline with the existing LKAS camera connector; no cutting or splicing needed.
- **Mount** — an angled mount designed for the comma 4. Comma sells an official mount that clips to the windshield near the rearview mirror.
- **USB-C cable** (included with comma 4) for charging and data.
- **Small flathead screwdriver** for releasing the camera connector clip.

## Step 1 — Verify Your Trim and Package

Not every Corolla supports openpilot. You need a trim with Toyota Safety Sense (TSS), specifically a camera-based lane-centering system (LKAS). On 2020–2022 models, look for TSS 2.0. The easiest way to check: look at your windshield from outside the car. If you see a small forward-facing camera housing mounted near the rearview mirror, you have the right hardware.

The LE, SE, XLE, and XSE trims on 2020+ Corollas all include TSS 2.0 as standard equipment. The base L trim does *not* — avoid it.

## Step 2 — Order and Unbox

Order the comma 4 and the Toyota Nidec harness together from the Comma shop. Shipping is typically 2–4 business days within the US. In the box you'll find:
- comma 4 unit
- USB-C charging cable
- Windshield mount
- Quick-start card

The harness ships separately as a coiled cable with two OBD-style connectors.

## Step 3 — Mount the comma 4

Clean the inside of your windshield where the mount will attach — a smudge-free surface is important for camera calibration. Position the mount roughly 4 inches below the rearview mirror, centered on the windshield. Press the mount firmly against the glass for 30 seconds.

Slide the comma 4 into the mount from the bottom until it clicks. The device screen should face the driver with the camera array pointing forward through the windshield.

## Step 4 — Install the Harness

This is the most hands-on step, but it's straightforward. The Toyota Nidec harness plugs in-line with your vehicle's existing LKAS camera connector — no permanent modifications required.
1. Locate the camera module behind the rearview mirror. It's a small rectangular housing. On most Corollas you'll need to gently pull back the fabric headliner trim to access the connector.
2. Depress the release tab on the factory connector and unplug it from the camera module.
3. Plug one end of the harness into the factory connector (the side that goes to the car's wiring loom) and the other end into the camera module. The connectors are keyed — they only go in one way.
4. Route the harness cable neatly under the headliner trim toward the comma 4 mount. The harness has a USB-C tail that plugs directly into the comma 4.
5. Plug the USB-C end into the comma 4. The device will receive power from the car's accessory circuit and turn on automatically when you start the vehicle.

## Step 5 — First Boot and Software Setup

On first boot, the comma 4 will guide you through setup. You'll need a comma account (free) and a Wi-Fi connection for the initial software download. The device downloads the latest version of openpilot over the air — this takes about 10 minutes on a good connection.

During setup you'll be asked to confirm your car make, model, and year. Select **Toyota → Corolla → your year**. openpilot uses this to load the correct control parameters.

## Step 6 — Calibration Drive

openpilot must calibrate its camera before full features become available. This typically takes 15–25 miles of highway driving. A progress bar appears on the comma 4 screen. During calibration:
- Drive on a straight highway if possible — lane markings help calibration converge faster.
- Avoid tunnels and heavy rain, which obscure lane lines.
- You can use openpilot during calibration, but some features may be limited until it completes.

Once calibration finishes you'll get a confirmation on-screen. From this point, all features — lane centering, adaptive cruise, and automatic lane changes — are fully active.

## Safety Tips

- **Keep your hands on the wheel.** openpilot is a driver-assistance system, not autonomous driving. You must remain attentive and ready to take control at any moment.
- **Learn the disengagement cues.** The system disengages if you press the brake, turn the steering wheel too forcefully, or if road conditions exceed its capabilities. A distinct alert sounds when this happens.
- **Test on familiar roads first.** Get comfortable with how the system feels on a route you know well before using it in unfamiliar territory.
- **Keep firmware updated.** Comma releases regular openpilot updates with improvements and bug fixes. The device downloads and installs updates automatically when parked and on Wi-Fi.

## Troubleshooting Common Issues

### Device won't power on

Check the USB-C connection at both the harness tail and the comma 4. A loose fit is the most common cause. Also verify the harness connectors are fully seated at the camera module.

### Camera not detected error

Power off the device, disconnect and reconnect the harness connectors, and power back on. If the error persists, try reseating the harness at the factory camera connector — the release tab must be fully engaged.

### Lane centering feels jerky

This is normal during and shortly after calibration. If it persists after 30+ miles, verify the mount hasn't shifted and the windshield is clean in the camera's field of view.

> **Ready to find your Corolla?** The [PilotCompatible vehicle finder](/) lists every supported Corolla model year with the exact harness required. Filter by make, set Toyota, and cross-reference with marketplace listings to find one near you.

​
