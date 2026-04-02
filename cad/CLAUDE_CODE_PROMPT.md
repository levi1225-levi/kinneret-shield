# OpenSCAD Prompt — Kinneret Shield Enclosure

Write a single OpenSCAD file called `kinneret_shield.scad`. It produces a 3D-printable enclosure for the Kinneret Shield — a wall-mounted NFC check-in device used for school attendance. The file should output 3 separate printable parts: a bottom shell, a top shell, and a wall-mounting bracket. Only the enclosure — no PCB model, no electronics, no display graphics. Just the physical case and bracket, ready to export as STL and print on an FDM printer.

---

## Context — What the Enclosure Houses

You need to know what goes inside so you can place the right cutouts, standoffs, and openings. Do not model these components — only create the enclosure features that accommodate them.

The main board is a HermitX ESP32-S3 NFC Card Reader Module. The PCB is 99 mm wide by 62 mm tall and 1.6 mm thick, with rounded corners at 2 mm radius. It has 4 M2.5 mounting holes positioned at ±43.5 mm on the X axis and ±27 mm on the Y axis, measured from the board center. The PCB sits on standoffs 5.5 mm above the floor of the bottom shell. Everything that plugs into the PCB (USB-C, MicroSD) is physically soldered to this board, so their port cutouts in the enclosure walls MUST align with the PCB's Z height — they cannot be at the bottom of the walls.

Mounted above the PCB is a 2.42-inch SSD1309 OLED display module. The glass area is 60.5 by 30 mm. The viewable pixel area is 55 by 27.5 mm. It sits centered on the X axis and offset +19 mm on the Y axis from the enclosure center. It needs a window in the top shell front face.

On the PCB there are 8 WS2812B LEDs in 5 mm square packages. They sit in a ring with radius 26 mm, centered at X = 0 and Y = −16 relative to the enclosure center. The first LED is at the top of the ring (−90 degrees) and the rest are spaced every 45 degrees. These LEDs do NOT get holes through the front wall. Instead, the front wall has built-in diffuser spots at each LED position — the wall is thinned down to 0.6 mm at each spot in a circular area of radius 3.5 mm. The thin plastic itself acts as a diffuser, letting light glow through without any separate parts. This works well with white or natural PETG/PLA.

There is a 15 mm diameter speaker at X = +38, Y = 0. It needs a grille of hexagonal holes in the top shell.

A USB-C connector sits at the bottom edge of the PCB, centered on the X axis. It is pill-shaped, 9.2 mm wide and 3.4 mm tall. It is physically soldered to the PCB, so the cutout in the enclosure wall must be centered at Z = 6.3 mm from the bottom of the enclosure (the 5.5 mm standoff height plus half the 1.6 mm PCB thickness). It needs matching cutouts in both the bottom and top shell walls on the −Y edge at this exact height.

A MicroSD card slot sits on the left side of the PCB at Y = −8. It is 14 mm wide and 15 mm tall. It is soldered to the PCB, so its cutout in the −X wall of the bottom shell must also be at the PCB's Z height. The cutout should be 14.3 by 5.5 mm, centered vertically at Z = 6.3 mm.

There is a small status LED at the top-right area of the board. It sits at a position roughly 12 mm inward from the right edge and 10 mm inward from the top edge of the enclosure. It needs a built-in diffuser spot in the top shell, same as the ring LEDs — wall thinned to 0.6 mm in a 2 mm radius circle.

---

## Enclosure Overall Dimensions

The exterior box is 136 mm wide (X), 96 mm tall (Y), and 26 mm deep (Z). All four vertical edges are rounded with a 5 mm corner radius. The wall thickness is 2 mm everywhere. The enclosure splits horizontally into two halves: the bottom shell is 18 mm deep and faces the wall, and the top shell is 8 mm deep and faces the user.

---

## Critical Alignment Rule

The PCB screw bosses are in the bottom shell, rising up from its floor. The PCB screws in from the top, resting on top of the bosses. When the shells are assembled, the PCB is inside the bottom shell at Z = 5.5 mm (top of standoffs) to Z = 7.1 mm (top of PCB). Every port cutout (USB-C, MicroSD) must be centered at Z = 6.3 mm from the bottom of the enclosure. Do not place port cutouts at the bottom of the wall or at any other height — they must line up with the PCB.

---

## Bottom Shell

The bottom shell is a rounded rectangular box, 136 by 96 by 18 mm, with 5 mm corner radii. It is hollowed out with 2 mm thick walls, open on top.

Along the top inner edge, there is an interlocking lip — a 2 mm tall rim that protrudes upward. This lip inserts into a matching socket in the top shell when the two halves are assembled. Include 0.2 mm of clearance on each side so the parts fit together after printing.

Inside the shell, there are 4 screw bosses for mounting the PCB. Each boss sits at one of the PCB mounting hole positions. They are tapered cylinders — 4 mm radius at the base tapering to 3.5 mm at the top, so there are no overhangs steeper than 45 degrees. The height is 3.5 mm (the PCB standoff height of 5.5 mm minus the 2 mm wall/floor thickness). Each boss has a center hole of 1.35 mm radius for M2.5 self-tapping screws.

For structural rigidity, there are 3 vertical ribs running in the Y direction at X positions −28, 0, and +28. Each rib is 1.5 mm thick and 3 mm tall, spanning most of the interior Y length but stopping short of the screw bosses. There are also 2 horizontal cross-ribs running in the X direction at Y positions −20 and +20, same thickness and height. The ribs must not be taller than the screw bosses (3.5 mm) so the PCB can sit flat on the bosses without resting on the ribs.

The floor has a ventilation pattern: a hexagonal grid of holes covering roughly a 60 by 35 mm area in the center. Each hexagon has a 2 mm radius with 5.5 mm spacing between centers. The holes cut fully through the floor.

On the bottom edge wall (−Y side), there is a pill-shaped USB-C cutout. It is 9.5 mm wide and 3.7 mm tall (the USB-C dimensions plus 0.15 mm tolerance per side). It is centered on X. Its vertical center is at Z = 6.3 mm from the enclosure bottom (NOT at the bottom of the wall — it floats at PCB height).

On the left wall (−X side), there is a rectangular MicroSD cutout, 14.3 mm wide and 5.5 mm tall. It is centered at Y = −8 on the Y axis. Its vertical center is also at Z = 6.3 mm (PCB height).

In the floor of the bottom shell, there are 4 rectangular recesses for the wall bracket's snap-fit tabs. Each recess is 3.5 by 9 mm and cuts fully through the floor. They are positioned near the edges at ±(half the enclosure width minus 1 mm) on X, and ±16 mm on Y.

---

## Top Shell

The top shell is a rounded rectangular box, 136 by 96 by 8 mm, with 5 mm corner radii, hollowed with 2 mm walls. It sits on top of the bottom shell, so its Z range is from 18 to 26 mm. The front face (the user-facing side) is the outer surface.

The inner rim has a socket that receives the bottom shell's interlocking lip. This socket is a recess matching the lip dimensions with 0.2 mm clearance.

The front face has these features:

An OLED display window: a rectangular hole with 2.5 mm rounded corners, 61.5 mm wide and 31 mm tall. Centered on X, offset to Y = +19. There is a small 0.4 mm chamfer around the outer edge of this window for a clean bezel look.

An NFC tap zone: a shallow circular recess, 22 mm radius and 0.6 mm deep, centered at X = 0 and Y = −16. Inside this recess, an NFC symbol is engraved (cut into the surface about 0.35 mm deep). The NFC symbol consists of a solid center dot of about 1.4 mm radius and 3 concentric arc segments at increasing radii. Each arc spans roughly 120 degrees. The arcs should be made by intersecting a ring (the difference of two cylinders) with a triangular wedge sector. Do not use complex polygon subtractions as they cause rendering artifacts in OpenSCAD.

An NFC illumination ring: a ring-shaped slot that cuts fully through the front wall. The inner radius is 23 mm and the outer radius is 24.8 mm, centered at the same point as the NFC tap zone. This ring allows LED light to glow through.

Eight built-in LED diffuser spots: at each of the 8 LED positions (ring of radius 26 mm from center (0, −16), starting at −90 degrees, every 45 degrees), the front wall is thinned from its normal 2 mm thickness down to 0.6 mm, in a circular area of 3.5 mm radius. This is done by creating a shallow cylindrical pocket on the inside surface of the front wall, 1.4 mm deep and 3.5 mm radius, at each LED position. The remaining 0.6 mm of plastic acts as a built-in light diffuser — no separate light pipes needed, no through-holes. The thin spots let LED light glow through the plastic.

A speaker grille: a patch of hexagonal holes roughly 16 by 18 mm, with individual hex radius of 1.4 mm and 3.8 mm spacing. Centered at X = +38 and Y = 0. Cuts fully through the front wall.

A status LED diffuser spot: same concept as the ring LEDs. The front wall is thinned to 0.6 mm in a 2 mm radius circle at the top-right area (approximately 12 mm from the right edge, 10 mm from the top edge). A shallow pocket on the inside face, no through-hole.

A USB-C cutout on the −Y wall matching the one in the bottom shell, at the same Z height (6.3 mm from the enclosure bottom), so the port opening is continuous when assembled.

A cosmetic perimeter groove: 0.7 mm wide and 0.3 mm deep, running around the front face, inset 2 mm from the outer edge. This is purely decorative, creating a subtle shadow line.

An engraved text placeholder at the bottom of the front face: a rectangular recess 48 mm wide by 2.5 mm tall and 0.3 mm deep, at Y = −40 (near the bottom edge). Above it, a thin accent line — 60 mm wide, 0.5 mm tall, 0.2 mm deep — sits about 3.5 mm higher.

Four screw-access holes on the inner surface: cylinders of radius 3 mm at each PCB mounting hole position, recessed into the inner face of the top shell so a screwdriver can reach through to the bosses in the bottom shell.

---

## Wall Mounting Bracket

A flat plate, 100 mm wide by 60 mm tall by 3.5 mm thick, with 3 mm corner radii.

In the center, a cable routing hole: a rounded rectangle 16 by 10 mm with 3 mm corner radii, cut fully through.

Two keyhole mounting slots, positioned at X = −32 and X = +32. Each keyhole has a wide circle at the bottom (3.5 mm radius), a narrow channel (2.2 mm radius) extending 8 mm upward, and another wide circle (3.5 mm radius) at the top. The top circle has a countersink on the back face — 0.8 mm deep, flaring from 3.5 mm to 5 mm radius. This lets the bracket slide down onto wall screws.

Four weight-reduction pockets: rounded rectangles 10 by 10 mm with 2 mm corner radii, at positions ±14 on both X and Y, cut fully through.

Four snap-fit tabs protruding upward from the top face. They are positioned to engage the rectangular recesses in the bottom shell's floor — at ±(half the enclosure width minus 1) on X, and ±16 on Y. Each tab is a block 2.8 mm wide by 8 mm long by 3.5 mm tall, with a small snap hook at the top that angles outward about 20 degrees (0.8 mm thick, 7 mm long, 1.2 mm tall). The hook catches the edge of the floor recess to hold the bracket in place.

Two small alignment nubs on the top surface: cylinders 1.2 mm radius and 1.5 mm tall, at X = ±40.

---

## Code Requirements

All dimensions should be named variables at the top of the file so the design is fully parametric. Changing any one dimension should cascade correctly.

Use a render quality variable set to 72 segments for curves, with a note that 48 is fine for previewing and 120 is better for the final STL export.

Each of the 3 printable parts should be its own named module.

Include boolean toggle variables at the top to show or hide each part, plus an exploded-view toggle that separates the parts vertically for inspection, and a cross-section toggle that slices the assembly in half.

Color each part differently so they are easy to distinguish in the OpenSCAD preview.

Include a commented-out print-plate module that lays all 3 parts flat on the build plane with correct print orientations: the bottom shell prints open-side up, the top shell prints with its front face down on the bed, and the bracket prints flat.

All boolean cut operations must have the cutting body extend at least 0.1 mm past every surface it crosses, to avoid zero-thickness geometry and non-manifold edges in the exported STL. This means using small offsets like −0.1 on starting positions and +0.2 on heights throughout.
