# Update Prompt — Kinneret Shield Enclosure (Real Measured Dimensions)

Don't start over. Update the existing model with these corrections. I have measured the actual hardware and several positions and sizes were wrong. Here are all the real numbers.

---

## PCB Reference System

All component positions below are measured from the BOTTOM-LEFT corner of the HermitX PCB (99 × 62 mm) when viewed from the top. X goes right, Y goes up. PCB center is at (49.5, 31).

---

## 1. Mounting Holes — New positions

The 4 mounting holes are M3 (not M2.5). The spacing is 90.7 mm horizontal and 53.5 mm vertical.

Measured from bottom-left corner of PCB:
- Bottom-left hole: X = 3.2 mm, Y = 3.5 mm
- Bottom-right hole: X = 93.9 mm, Y = 3.5 mm (that's 3.2 + 90.7)
- Top-left hole: X = 3.2 mm, Y = 57 mm (that's 3.5 + 53.5)
- Top-right hole: X = 93.9 mm, Y = 57 mm

In enclosure-center coordinates (assuming PCB is centered in the enclosure):
- Bottom-left: (−46.3, −27.5)
- Bottom-right: (+44.4, −27.5)
- Top-left: (−46.3, +26)
- Top-right: (+44.4, +26)

Note: the holes are NOT perfectly symmetric — they're slightly offset. The bottom holes are 3.5 mm from the bottom edge, the top holes are 5 mm from the top edge. Update all 4 screw boss positions in the bottom shell and all 4 screw access holes in the top shell to match these exact positions. The screw hole diameter should be 1.4 mm (for M3 self-tapping into plastic).

---

## 2. USB-C Port — Not centered

The USB-C connector is on the bottom edge of the PCB (−Y side), but it is NOT centered. Its center is 63.2 mm from the left edge of the PCB, which is 13.7 mm to the RIGHT of PCB center.

Move the USB-C cutout in both the bottom shell and top shell −Y walls so it is offset 13.7 mm to the right of the enclosure center (assuming the PCB is centered in the enclosure). Keep the cutout size the same (pill shape, 9.5 × 3.7 mm). Keep the vertical center at Z = 6.3 mm from the enclosure bottom (PCB height).

---

## 3. MicroSD Slot — Same edge as USB-C

Looking at the actual board, the MicroSD slot is in the same corner as the USB-C port — both are at the bottom-right of the PCB. The MicroSD card inserts from the BOTTOM edge of the board (same edge as USB-C), not from the left side.

Remove the old MicroSD cutout from the −X (left) wall. Add a new rectangular MicroSD cutout in the SAME wall as the USB-C (the −Y / bottom edge wall). The MicroSD center is 83 mm from the left edge of the PCB, which is 33.5 mm right of PCB center. The cutout should be 14.3 mm wide and 5.5 mm tall, centered at X = +33.5 from enclosure center, with its vertical center at Z = 6.3 mm (PCB height). The USB-C cutout (at X = +13.7) and MicroSD cutout (at X = +33.5) are both on this same bottom wall, about 20 mm apart.

---

## 4. Speaker — Much bigger, rectangular

The speaker is NOT a 15 mm diameter circle. It is a rectangle: 32 mm wide × 24 mm long × 6 mm tall. It is adhesive-mounted (no screw holes). Its connector center is at 48 mm from the left edge of the PCB, which is approximately centered.

The speaker grille in the top shell front face must be resized to cover the speaker. Make the grille area at least 30 × 22 mm (slightly smaller than the speaker to leave a border). Keep using hexagonal holes, hex radius 1.4 mm, spacing 3.8 mm. Move the grille to be centered on the speaker position.

---

## 5. NFC Antenna — Separate board, adhesive

The NFC antenna is NOT traces on the PCB. It is a separate flat board: 37.1 mm wide × 37 mm long × 1 mm thick. It is adhesive-mounted with no screw holes. Its connector on the PCB is 31 mm from the bottom edge of the PCB, which is dead center vertically.

The antenna board will be adhesive-mounted to the inside face of the top shell, directly behind the NFC tap zone. This means the NFC tap zone recess on the front face should have a flat area on the inside face behind it (no ribs, no pockets, no obstructions) that is at least 38 × 38 mm so the antenna board can be stuck down flat.

---

## 6. LEDs — They ARE in a line (not a ring)

I was wrong earlier. The 8 WS2812B LEDs are physically soldered to the PCB in a straight horizontal line. This is correct in the current model — do NOT change them to a ring.

The first LED center is 8 mm from the left edge of the PCB. The last LED center is 87 mm from the left edge. That's a span of 79 mm with 8 LEDs, so they're spaced 11.3 mm apart.

In enclosure-center coordinates, the line runs from X = −41.5 to X = +37.5.

Keep the LED diffuser spots in a straight horizontal line at these positions. Each diffuser spot should still be a thin-wall area (0.6 mm remaining wall, 3.5 mm radius circular pocket on the inside face). Space them evenly: 8 spots, starting at X = −41.5, each 11.3 mm apart.

I don't have the exact Y position of the LED line on the PCB. It appears to be between the OLED area and the NFC antenna area. Keep the Y position where it currently is in the model — it looks correct in the renders.

---

## 7. Component Clearance Height

The tallest component on top of the PCB (above the PCB surface) is 4 mm. The enclosure has 16.9 mm of clearance between the PCB top surface and the top shell inner face, so everything fits easily. No changes needed to the enclosure depth, but make sure no internal features (ribs, posts) in the top shell extend more than 10 mm inward from the inner face, or they could collide with PCB components.

---

## 8. OLED Module — Correct dimensions

The OLED is a HiLetgo 2.42" SSD1309 128x64 IIC module. Real dimensions:
- Overall PCB: 71 × 43.5 mm
- Glass panel: 60.5 × 37 mm
- Viewable area: 55 × 27.5 mm
- 4 mounting holes in corners, M3 (3 mm diameter), spacing approximately 66 × 38.5 mm center-to-center
- Total module thickness with components: approximately 6 mm
- 4-pin I2C header (GND, VDD, SCL, SDA) on top edge and right edge
- FPC ribbon cable on the back, center

Update the OLED window to show the viewable area plus a small margin: approximately 57 × 29.5 mm, with 2 mm rounded corners. Move the OLED center to Y = +23 from enclosure center (so there's a gap between the window bottom and the NFC zone top). Add 4 OLED mounting posts on the inside of the top shell at the OLED mounting hole positions, with M3 screw holes. Add a 1 mm display ledge around the inside of the window so the glass can't push through.

---

## 9. Rib and boss heights

Make sure structural ribs in the bottom shell (3 mm tall) are shorter than the screw bosses (which should be 3.5 mm tall, rising from the 2 mm floor to hold the PCB at 5.5 mm). The PCB must only rest on the 4 bosses, not on the ribs.

---

## 10. Keyholes only on bracket

Keyhole slots for wall mounting belong only on the wall bracket. The bottom shell should have simple rectangular snap-tab recesses (3.5 × 9 mm), not keyholes. Make sure these are not mixed up.

---

## 11. RESET and BOOT buttons — Add access pinholes

The board has two tactile push-buttons labeled RESET and BOOT near the ESP32 module. These are used during development and firmware flashing. Add two small pinholes (1.5 mm radius each) in the bottom shell wall near where these buttons sit, so a paperclip or pin can reach them without opening the case. They are near the bottom-right area of the PCB (same corner as USB-C), roughly at X = +10 and X = +20 from enclosure center. These can be in the −Y wall (same wall as USB-C) or in the floor — whichever is easier to reach.

---

## 12. Wire routing clearance

The board has a 7-pin GPIO header on the left edge (near the LEDs) where the OLED display's I2C wires connect, and power pins (+5V, +3V3, GND) on the right side. Make sure there is at least 5 mm of clearance between the inner enclosure walls and the PCB edges on all sides so wires don't get pinched. No ribs should run right along the PCB edges where headers and connectors sit.

---

## Summary — What's already correct, don't change

- Overall enclosure shape (136 × 96 × 26 mm), corner radius, wall thickness
- Two-piece shell split (18 mm bottom, 8 mm top)
- NFC tap zone recess with concentric ring engraving on front face
- Interlocking lip between shells
- Wall bracket design (keyholes, cable routing, snap tabs)
- Bottom ventilation hex grid
- Cosmetic groove and text engraving
- LED spots in a horizontal line (just update positions per measurements above)
