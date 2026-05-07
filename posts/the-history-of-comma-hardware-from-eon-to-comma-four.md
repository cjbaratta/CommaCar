---
title: "The History of comma Hardware: From EON to comma four"
category: Guide
date: "2026-05-07T05:00:00.000Z"
readingTime: 10 min
description: See the hardware evolution of Comma AI devices
---


Over the last decade, comma.ai has gone from a tiny startup experimenting with smartphone-based driver assistance to one of the most influential names in the open-source ADAS world. Their hardware evolution mirrors the growth of openpilot itself: better cameras, more compute, wider car compatibility, and increasingly refined user experiences.

Today, the latest device — the comma four — represents the company’s most polished and consumer-friendly hardware yet. But getting there required several generations of experimentation and iteration.

---

# The Beginning: EON DevKit

The original comma hardware was the **EON DevKit**, released around 2016. At the time, comma’s approach was radically different from traditional automotive suppliers.

Instead of designing a fully custom automotive computer from scratch, the EON combined:
- An Android smartphone
- A custom CAN interface (“Panda”)
- openpilot software
- Windshield mounting hardware

The goal was simple: use commodity mobile hardware and machine learning to create a driver assistance system that could rival OEM lane centering systems.

Capabilities at the time included:
- Adaptive cruise control integration
- Lane centering
- Basic highway autonomy
- Driver monitoring through the interior camera

Compared to today’s systems, the EON was primitive, but it proved something important: modern smartphones already had enough compute and sensor capability to run advanced driver assistance software.

This laid the foundation for everything that followed.

---

# comma two: The First Mainstream Device

Released in 2019, the comma two was the first device that felt like a true consumer product rather than a developer kit.

Major improvements included:
- Integrated hardware instead of modified smartphones
- Better thermals
- Improved reliability
- Wider vehicle compatibility
- Simplified installation

The comma two helped openpilot grow dramatically in popularity. For many users, it became a significantly better lane-centering experience than the stock systems offered by manufacturers.

However, the hardware still had limitations:
- Limited compute headroom
- Thermal throttling in hot climates
- Lower quality cameras
- Less sophisticated driver monitoring

As openpilot models became more advanced, the comma two eventually began reaching its limits.

---

# comma three: A Major Leap Forward

The comma three marked a massive redesign and became the foundation for modern openpilot hardware.

Key upgrades included:
- Triple-camera system
- Wide road-facing cameras
- Dedicated driver monitoring camera
- Dramatically improved thermals
- Much faster compute
- Higher quality OLED display
- Improved GPS and sensors

The triple-camera setup was especially important. It gave openpilot:
- Better depth perception
- Wider environmental awareness
- Improved performance in curves and merges
- Better low-light driving

This generation also pushed openpilot further into “end-to-end” machine learning driving models.

For many enthusiasts, the comma three was the first device that felt genuinely futuristic during everyday driving.

---

# comma 3X: Refinement and CAN FD Support

In 2023, comma released the comma 3X as a refined version of the comma three.

The comma 3X kept much of the same core architecture but improved:
- Manufacturing reliability
- Camera sensors
- Compatibility with newer vehicles
- CAN FD support for modern cars
- Power efficiency

Important specs included:
- Snapdragon 845
- 6-inch OLED display
- 128GB storage
- 360° vision system
- Upgraded HDR cameras
- Integrated Red Panda CAN interface

This generation dramatically expanded support for newer Hyundai, Kia, Honda, GM, Volkswagen, and other modern vehicles that use newer CAN FD communication systems.

comma also emphasized reliability and in-house manufacturing with the 3X generation.

---

# comma four: The Current Generation

The newest device, the comma four, launched in late 2025 and represents comma’s most mature hardware platform so far.

Interestingly, comma focused less on raw compute increases and more on:
- Miniaturization
- Manufacturing scalability
- Faster setup
- Better usability
- Lower cost

According to comma, the comma four packs essentially the same sensor suite and compute capability as the comma 3X into a dramatically smaller package.

Key improvements include:
- Much smaller physical footprint
- New OLED touchscreen UI
- Faster installation process
- No 48-hour mount cure time
- Improved speakers and alerts
- Simplified onboarding
- Refined thermal behavior

comma also redesigned the interface to make openpilot feel more approachable to non-enthusiasts.

The device currently supports over 325 vehicles through openpilot compatibility.

At launch, the comma four retailed for $999, with upgrade trade-in programs available for existing users.

---

# What openpilot Can Actually Do

Across modern hardware generations, openpilot capabilities generally include:
- Highway lane centering
- Adaptive cruise control integration
- Stop-and-go traffic handling
- Driver monitoring
- Automatic lane changes (on supported setups)
- Traffic light and stop sign handling in Experimental Mode
- End-to-end neural network driving models

Depending on the vehicle, openpilot can feel dramatically smoother and more confident than factory ADAS systems.

However, it is important to remember:
- openpilot is still a Level 2 driver assistance system
- The driver must remain attentive
- Hands-free operation legality varies by region and vehicle

---

# Support for Older Hardware

One of the biggest questions in the community is how comma handles older devices as new hardware launches.

The good news is that comma has historically supported older hardware for fairly long periods.

## Current Support Situation

### comma two

The comma two is effectively legacy hardware at this point. Modern openpilot versions eventually outgrew its compute and thermal limitations.

Most users have moved to newer hardware generations.

### comma three

The original comma three has entered long-term support status. Community discussions and official commentary indicate:
- Critical bug fixes still continue
- Some future software features may eventually diverge
- openpilot support has become more limited compared to newer hardware

### comma 3X

The comma 3X remains fully supported and continues receiving modern openpilot updates alongside comma four hardware.

comma representatives have explicitly stated there are no immediate plans to abandon 3X users, and that both platforms currently receive the same updates.

---

# Why Older Hardware Eventually Falls Behind

The main reason older devices lose feature parity is not artificial lockouts — it is compute demand.

Modern end-to-end driving models require:
- More neural network compute
- Better thermal headroom
- Faster memory bandwidth
- Higher quality sensors

As models improve, older devices may:
- Continue receiving safety fixes
- Still run stable releases
- But eventually miss newer experimental features

This is similar to how smartphones or gaming consoles age over time.

---

# The Future of comma Hardware

One especially interesting direction mentioned by comma is external compute expansion.

During early comma four discussions, comma talked about “comma compute,” an external higher-power compute box intended for much larger future driving models.

The long-term vision appears to be:
- Lightweight windshield hardware
- Expandable external compute
- Larger neural driving models
- Continuous OTA improvements

If that vision succeeds, future comma hardware may evolve more like a modular computing ecosystem than a traditional automotive accessory.

---

# Final Thoughts

comma’s hardware journey is one of the most interesting stories in modern automotive technology.

What began as a hacked smartphone evolved into:
- A fully custom automotive AI platform
- A community-driven ecosystem
- One of the most capable aftermarket ADAS solutions available

The comma four is currently the cleanest expression of that vision:
- Small
- Refined
- Easier to install
- Widely compatible
- Still deeply connected to the open-source openpilot ecosystem

And unlike many automotive systems, older users are not immediately abandoned. While aging hardware eventually reaches practical limitations, comma has generally continued offering bug fixes and transitional support longer than many people expect in consumer electronics.
