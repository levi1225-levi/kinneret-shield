// ═══════════════════════════════════════════════════════════════════════
//  KINNERET SHIELD — Wall-Mounted NFC Check-In Device
//  Full Parametric Enclosure + Internal Component Model
//
//  Hardware: HermitX ESP32-S3 NFC Card Reader Module
//            + 2.42" SSD1309 OLED Display
//
//  PCB Ref: 99 × 62 mm (HermitX)
//  Components: PN532 NFC, MAX98357 I²S Amp, 8×WS2812B LEDs,
//              MicroSD, USB-C, ESP32-S3-WROOM-1
//
//  Author: Kinneret Engineering
//  Rev: 1.0 — March 2026
// ═══════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
//  RENDERING QUALITY
// ─────────────────────────────────────────────────────────────
$fn = 80;  // Set to 120+ for final render, 40 for preview

// ─────────────────────────────────────────────────────────────
//  VIEW CONTROLS — toggle what you see
// ─────────────────────────────────────────────────────────────
SHOW_TOP_SHELL       = true;
SHOW_BOTTOM_SHELL    = true;
SHOW_FRONT_PANEL     = true;
SHOW_PCB             = true;
SHOW_OLED            = true;
SHOW_INTERNALS       = true;
SHOW_WALL_BRACKET    = true;
SHOW_NFC_CARD        = false;  // demo card hovering near device
CROSS_SECTION         = false;  // slice for internal view
EXPLODED_VIEW         = false;  // spread components apart

// Exploded view offsets
exp_top    = EXPLODED_VIEW ? 30 : 0;
exp_front  = EXPLODED_VIEW ? 18 : 0;
exp_pcb    = EXPLODED_VIEW ? 8  : 0;
exp_oled   = EXPLODED_VIEW ? 14 : 0;
exp_brack  = EXPLODED_VIEW ? -20 : 0;

// ─────────────────────────────────────────────────────────────
//  MASTER DIMENSIONS (mm)
// ─────────────────────────────────────────────────────────────

// --- Enclosure exterior ---
enc_w       = 136;       // width  (X)
enc_h       = 96;        // height (Y)
enc_d       = 26;        // total depth (Z) — top + bottom shells
enc_r       = 4.0;       // corner radius
enc_wall    = 2.0;       // shell wall thickness
enc_chamfer = 0.6;       // cosmetic edge chamfer

// --- Shell split ---
top_shell_d    = 8;      // top (front-facing) shell depth
bottom_shell_d = enc_d - top_shell_d; // rear shell depth

// --- Front panel (press-fit decorative bezel) ---
fp_w = enc_w - 1.0;
fp_h = enc_h - 1.0;
fp_d = 1.6;             // panel thickness (PC/ABS)
fp_r = 3.5;

// --- HermitX PCB ---
pcb_w     = 99;
pcb_h     = 62;
pcb_d     = 1.6;
pcb_r     = 2.0;        // corner radius
pcb_z     = 5.0;        // height above bottom shell floor

// --- OLED Module (2.42" SSD1309 128×64) ---
oled_mod_w   = 65;       // module board width
oled_mod_h   = 30.5;     // module board height
oled_mod_d   = 2.0;      // module board thickness
oled_view_w  = 55.0;     // viewable area width
oled_view_h  = 27.5;     // viewable area height
oled_glass_w = 60.5;     // glass dimensions
oled_glass_h = 30.0;
oled_glass_d = 1.5;
oled_x       = 0;        // position relative to enclosure center
oled_y       = 19;       // pushed toward top

// --- NFC Tap Zone ---
nfc_zone_r     = 22;     // outer radius of tap zone circle
nfc_zone_y     = -16;    // center Y position (lower half)
nfc_recess_d   = 0.8;    // recess depth in front panel
nfc_ring_w     = 1.5;    // width of illumination ring

// --- WS2812B LEDs (5×5mm packages) ---
led_size    = 5.0;
led_h       = 1.6;       // package height
led_count   = 8;
led_ring_r  = 26;        // radius of LED ring on PCB
led_pipe_r  = 2.5;       // light pipe lens radius
led_pipe_h  = 6;         // light pipe height to front panel

// --- USB-C Port ---
usbc_w     = 9.0;
usbc_h     = 3.4;
usbc_r     = 1.7;        // end radius (pill shape)
usbc_x     = 0;
usbc_z     = pcb_z + pcb_d/2;

// --- Speaker (15mm, driven by MAX98357) ---
spk_dia    = 15;
spk_h      = 4.5;
spk_x      = 38;         // right side of PCB
spk_y      = 0;

// --- MicroSD slot ---
sd_w       = 14;
sd_h       = 15;
sd_d       = 2.0;
sd_x       = -38;        // left side of PCB
sd_y       = -10;

// --- ESP32-S3-WROOM-1 module ---
esp_w      = 18;
esp_h      = 25.5;
esp_d      = 3.2;
esp_x      = 0;
esp_y      = -14;        // lower center of PCB

// --- PN532 NFC IC + antenna trace ---
pn532_w    = 8;
pn532_h    = 8;
pn532_d    = 1.2;
pn532_x    = 0;
pn532_y    = 5;          // center-ish, near antenna
nfc_ant_r  = 20;         // antenna trace outer radius
nfc_ant_trace_w = 0.8;

// --- MAX98357 ---
amp_w      = 4;
amp_h      = 4;
amp_d      = 0.9;
amp_x      = 30;
amp_y      = 5;

// --- Wall bracket ---
brack_w     = 100;
brack_h     = 60;
brack_d     = 3.5;
brack_r     = 3;
brack_screw_r = 2.5;     // screw hole radius
brack_slot_w  = 6;       // keyhole slot width
brack_slot_h  = 12;

// --- Screw bosses (for PCB + shell assembly) ---
boss_r       = 3.5;
boss_hole_r  = 1.4;      // M2.5 screw
boss_h       = pcb_z - enc_wall;
pcb_mount_positions = [
    [ 43, 26], [-43, 26],
    [ 43,-26], [-43,-26]
];

// --- Tolerances ---
tol       = 0.15;        // general fit tolerance
tol_press = 0.08;        // press-fit tolerance


// ═══════════════════════════════════════════════════════════════
//  UTILITY MODULES
// ═══════════════════════════════════════════════════════════════

// Rounded rectangle (2D profile)
module rrect(w, h, r) {
    offset(r) offset(-r) square([w, h], center=true);
}

// Rounded box (3D)
module rounded_box(w, h, d, r) {
    hull() {
        for (x = [-w/2+r, w/2-r])
            for (y = [-h/2+r, h/2-r])
                translate([x, y, 0])
                    cylinder(r=r, h=d);
    }
}

// Rounded box centered in Z
module rounded_box_c(w, h, d, r) {
    translate([0, 0, -d/2]) rounded_box(w, h, d, r);
}

// Pill shape (USB-C profile, 2D)
module pill_2d(w, h) {
    r = h/2;
    hull() {
        translate([-(w/2-r), 0]) circle(r=r);
        translate([ (w/2-r), 0]) circle(r=r);
    }
}

// Chamfered edge ring (cosmetic)
module chamfer_ring(w, h, r, ch) {
    difference() {
        translate([0, 0, -0.01])
            linear_extrude(ch + 0.01)
                offset(r=0.01) rrect(w, h, r);
        translate([0, 0, -0.02])
            linear_extrude(ch + 0.04)
                offset(r=-ch) rrect(w, h, r);
    }
}

// Hex pattern for ventilation
module hex_grid(cols, rows, hex_r, spacing, depth) {
    dx = spacing * 1.5;
    dy = spacing * sin(60);
    for (c = [0:cols-1])
        for (r = [0:rows-1]) {
            ox = c * dx + (r % 2) * dx/2;
            oy = r * dy;
            translate([ox - (cols-1)*dx/2, oy - (rows-1)*dy/2, 0])
                cylinder(r=hex_r, h=depth, $fn=6);
        }
}

// NFC symbol (concentric arcs + dot)
module nfc_symbol(scale_f=1) {
    s = scale_f;
    // Center dot
    cylinder(r=1.2*s, h=0.5, $fn=32);
    // Three arcs
    for (i = [1:3]) {
        r_inner = 2.5*i*s;
        r_outer = r_inner + 0.8*s;
        difference() {
            cylinder(r=r_outer, h=0.5, $fn=64);
            translate([0, 0, -0.1])
                cylinder(r=r_inner, h=0.7, $fn=64);
            // Cut to arc (≈120°)
            translate([0, 0, -0.1])
                rotate([0, 0, -150])
                    linear_extrude(0.7)
                        polygon([
                            [0,0],
                            [r_outer*2, 0],
                            [r_outer*2, -r_outer*2],
                            [-r_outer*2, -r_outer*2],
                            [-r_outer*2, 0]
                        ]);
            translate([0, 0, -0.1])
                rotate([0, 0, 30])
                    linear_extrude(0.7)
                        polygon([
                            [0,0],
                            [r_outer*2, 0],
                            [r_outer*2, r_outer*2],
                            [-r_outer*2, r_outer*2],
                            [-r_outer*2, 0]
                        ]);
        }
    }
}


// ═══════════════════════════════════════════════════════════════
//  BOTTOM SHELL (rear half, mounts to wall)
// ═══════════════════════════════════════════════════════════════

module bottom_shell() {
    color("DimGray", 0.85)
    difference() {
        // Outer shell
        rounded_box(enc_w, enc_h, bottom_shell_d, enc_r);

        // Hollow interior
        translate([0, 0, enc_wall])
            rounded_box(enc_w - enc_wall*2, enc_h - enc_wall*2,
                        bottom_shell_d, enc_r - enc_wall/2);

        // USB-C port cutout (bottom edge)
        translate([usbc_x, -enc_h/2 - 0.1, usbc_z])
            rotate([-90, 0, 0])
                linear_extrude(enc_wall + 0.2)
                    pill_2d(usbc_w + tol*2, usbc_h + tol*2);

        // MicroSD slot cutout (left edge)
        translate([-enc_w/2 - 0.1, sd_y, pcb_z - 1])
            cube([enc_wall + 0.2, sd_h + tol*2, sd_d + 3]);

        // Wall bracket snap slots (2 on each side)
        for (y = [-18, 18])
            for (x = [-enc_w/2 + enc_wall/2, enc_w/2 - enc_wall/2])
                translate([x, y, -0.1])
                    rounded_box(3, 8, enc_wall + 0.2, 0.5);

        // Bottom ventilation hex grid
        translate([0, 0, -0.1])
            hex_grid(8, 4, 2.2, 6, enc_wall + 0.2);
    }

    // PCB mounting bosses
    color("DimGray")
    for (pos = pcb_mount_positions)
        translate([pos[0], pos[1], enc_wall]) {
            difference() {
                cylinder(r=boss_r, h=boss_h);
                translate([0, 0, -0.1])
                    cylinder(r=boss_hole_r, h=boss_h + 0.2);
            }
        }

    // Shell alignment pins (4 corners)
    color("DimGray")
    for (x = [-enc_w/2 + 8, enc_w/2 - 8])
        for (y = [-enc_h/2 + 8, enc_h/2 - 8])
            translate([x, y, bottom_shell_d - 0.1])
                cylinder(r=1.5, h=3);

    // Internal ribs for rigidity
    color("DimGray")
    for (x = [-30, 0, 30])
        translate([x - 0.75, -enc_h/2 + enc_wall + 2, enc_wall])
            cube([1.5, enc_h - enc_wall*2 - 4, 3]);
}


// ═══════════════════════════════════════════════════════════════
//  TOP SHELL (front-facing half)
// ═══════════════════════════════════════════════════════════════

module top_shell() {
    color("SlateGray", 0.7)
    translate([0, 0, enc_d])
    mirror([0, 0, 1])
    difference() {
        // Outer shell
        rounded_box(enc_w, enc_h, top_shell_d, enc_r);

        // Hollow interior
        translate([0, 0, enc_wall])
            rounded_box(enc_w - enc_wall*2, enc_h - enc_wall*2,
                        top_shell_d, enc_r - enc_wall/2);

        // OLED display window (rectangular with rounded corners)
        translate([oled_x, oled_y, -0.1])
            linear_extrude(enc_wall + 0.2)
                rrect(oled_glass_w + 1, oled_glass_h + 1, 2.0);

        // LED light pipe holes (8 around NFC zone)
        for (i = [0:led_count-1]) {
            angle = i * 360/led_count - 90;
            lx = cos(angle) * led_ring_r + 0;
            ly = sin(angle) * led_ring_r + nfc_zone_y;
            translate([lx, ly, -0.1])
                cylinder(r=led_pipe_r + tol, h=enc_wall + 0.2);
        }

        // NFC zone recess (shallow circular dish)
        translate([0, nfc_zone_y, -0.1])
            cylinder(r=nfc_zone_r + 2, h=nfc_recess_d + 0.1);

        // NFC illumination ring slot
        translate([0, nfc_zone_y, -0.1])
            difference() {
                cylinder(r=nfc_zone_r + nfc_ring_w, h=enc_wall + 0.2);
                translate([0, 0, -0.05])
                    cylinder(r=nfc_zone_r, h=enc_wall + 0.3);
            }

        // Speaker grille (right side)
        translate([spk_x, spk_y, -0.1])
            hex_grid(3, 4, 1.5, 4.2, enc_wall + 0.2);

        // Status LED hole (top-right)
        translate([enc_w/2 - 12, enc_h/2 - 10, -0.1])
            cylinder(r=1.5, h=enc_wall + 0.2);

        // USB-C cutout (matching bottom shell)
        translate([usbc_x, -enc_h/2 - 0.1, enc_d - usbc_z - usbc_h/2 - tol])
            rotate([-90, 0, 0])
                linear_extrude(enc_wall + 0.2)
                    pill_2d(usbc_w + tol*2, usbc_h + tol*2);

        // Shell alignment pin holes
        for (x = [-enc_w/2 + 8, enc_w/2 - 8])
            for (y = [-enc_h/2 + 8, enc_h/2 - 8])
                translate([x, y, top_shell_d - 3.2])
                    cylinder(r=1.5 + tol, h=3.3);

        // Cosmetic top chamfer
        translate([0, 0, -0.01])
            chamfer_ring(enc_w, enc_h, enc_r, enc_chamfer);
    }
}


// ═══════════════════════════════════════════════════════════════
//  FRONT PANEL (decorative bezel, press-fit)
// ═══════════════════════════════════════════════════════════════

module front_panel() {
    color("MidnightBlue", 0.9)
    translate([0, 0, enc_d + 0.1])
    difference() {
        // Panel body
        linear_extrude(fp_d)
            rrect(fp_w, fp_h, fp_r);

        // OLED window cutout
        translate([oled_x, oled_y, -0.1])
            linear_extrude(fp_d + 0.2)
                rrect(oled_view_w + 0.5, oled_view_h + 0.5, 1.5);

        // OLED window chamfer (beveled edge for glass look)
        translate([oled_x, oled_y, fp_d - 0.3])
            linear_extrude(0.4)
                rrect(oled_glass_w + 0.5, oled_glass_h + 0.5, 2.0);

        // NFC tap zone — circular recess
        translate([0, nfc_zone_y, fp_d - nfc_recess_d])
            cylinder(r=nfc_zone_r, h=nfc_recess_d + 0.1);

        // NFC symbol engraved into recess
        translate([0, nfc_zone_y, fp_d - nfc_recess_d - 0.3])
            linear_extrude(0.35)
                offset(r=0.2)
                    circle(r=1); // placeholder, detailed symbol below

        // LED light pipe windows
        for (i = [0:led_count-1]) {
            angle = i * 360/led_count - 90;
            lx = cos(angle) * led_ring_r;
            ly = sin(angle) * led_ring_r + nfc_zone_y;
            // Conical light pipe opening (wider at front)
            translate([lx, ly, -0.1])
                cylinder(r1=led_pipe_r - 0.3, r2=led_pipe_r + 0.5, h=fp_d + 0.2);
        }

        // Speaker grille cutouts
        translate([spk_x, spk_y, -0.1])
            hex_grid(3, 4, 1.5, 4.2, fp_d + 0.2);

        // Status LED window
        translate([enc_w/2 - 12.5, enc_h/2 - 10.5, -0.1])
            cylinder(r=1.8, h=fp_d + 0.2);

        // Perimeter groove (cosmetic shadow line)
        translate([0, 0, fp_d - 0.2])
            difference() {
                linear_extrude(0.25)
                    rrect(fp_w - 0.5, fp_h - 0.5, fp_r - 0.2);
                translate([0, 0, -0.01])
                    linear_extrude(0.27)
                        rrect(fp_w - 1.5, fp_h - 1.5, fp_r - 0.5);
            }

        // "KINNERET SHIELD" text area (engraved bar, bottom)
        translate([-25, -enc_h/2 + 8, fp_d - 0.25])
            cube([50, 2.5, 0.3]);

        // Thin accent line above text
        translate([-30, -enc_h/2 + 11, fp_d - 0.15])
            cube([60, 0.4, 0.2]);
    }

    // NFC symbol raised from recess
    color("SteelBlue", 0.8)
    translate([0, nfc_zone_y, enc_d + 0.1 + fp_d - nfc_recess_d])
        nfc_symbol(1.2);

    // Illumination ring diffuser (translucent ring)
    color("White", 0.35)
    translate([0, nfc_zone_y, enc_d + 0.05])
        difference() {
            cylinder(r=nfc_zone_r + nfc_ring_w, h=0.8);
            translate([0, 0, -0.1])
                cylinder(r=nfc_zone_r - 0.3, h=1.0);
        }
}


// ═══════════════════════════════════════════════════════════════
//  OLED DISPLAY MODULE
// ═══════════════════════════════════════════════════════════════

module oled_display() {
    translate([oled_x, oled_y, enc_d - top_shell_d + enc_wall + 0.5]) {
        // PCB substrate
        color("DarkGreen", 0.9)
        translate([0, 0, 0])
            linear_extrude(oled_mod_d)
                rrect(oled_mod_w, oled_mod_h, 1.0);

        // Glass panel
        color("Black", 0.95)
        translate([0, 0, oled_mod_d])
            linear_extrude(oled_glass_d)
                rrect(oled_glass_w, oled_glass_h, 1.5);

        // Active display area (slightly emissive)
        color([0, 0.05, 0.15], 0.98)
        translate([0, 0, oled_mod_d + oled_glass_d + 0.01])
            linear_extrude(0.1)
                rrect(oled_view_w, oled_view_h, 0.5);

        // Simulated pixel content — "KINNERET SHIELD" header
        color([0, 0.8, 1.0])
        translate([-22, 8, oled_mod_d + oled_glass_d + 0.15])
            cube([44, 2.5, 0.05]);

        // Simulated content lines
        color([0, 0.6, 0.8])
        for (i = [0:3]) {
            w = 30 + (i % 2) * 10;
            translate([-w/2, 4 - i*4.5, oled_mod_d + oled_glass_d + 0.15])
                cube([w, 1.8, 0.05]);
        }

        // FPC connector (bottom of OLED board)
        color("Gold")
        translate([0, -oled_mod_h/2 + 2, -0.5])
            cube([20, 3, 0.5], center=true);

        // FPC ribbon cable (simplified)
        color("Orange", 0.7)
        translate([0, -oled_mod_h/2 - 3, -2])
            cube([16, 8, 0.15], center=true);
    }
}


// ═══════════════════════════════════════════════════════════════
//  HERMITX PCB + ALL ONBOARD COMPONENTS
// ═══════════════════════════════════════════════════════════════

module hermitx_pcb() {
    translate([0, 0, pcb_z]) {

        // ── Main PCB ──
        color([0.05, 0.35, 0.12])
        difference() {
            linear_extrude(pcb_d)
                rrect(pcb_w, pcb_h, pcb_r);

            // Mounting holes
            for (pos = pcb_mount_positions)
                translate([pos[0], pos[1], -0.1])
                    cylinder(r=boss_hole_r + 0.1, h=pcb_d + 0.2);

            // NFC antenna keep-out (ground plane removed)
            translate([pn532_x, pn532_y + 5, -0.1])
                cylinder(r=nfc_ant_r - 2, h=pcb_d + 0.2);
        }

        // ── Copper traces (top layer, simplified) ──
        color([0.72, 0.45, 0.2], 0.6)
        translate([0, 0, pcb_d]) {
            // Power rail (top edge)
            translate([-pcb_w/2 + 5, pcb_h/2 - 4, 0])
                cube([pcb_w - 10, 0.6, 0.035]);
            // Ground rail (bottom edge)
            translate([-pcb_w/2 + 5, -pcb_h/2 + 3, 0])
                cube([pcb_w - 10, 0.6, 0.035]);
            // Data bus traces
            for (i = [-2:2])
                translate([i * 6, -pcb_h/2 + 6, 0])
                    cube([0.3, 20, 0.035]);
        }

        // ── NFC Antenna Trace (spiral on PCB) ──
        color("Gold", 0.8)
        translate([pn532_x, pn532_y + 5, pcb_d])
        for (turn = [0:3]) {
            r = nfc_ant_r - turn * 2.5;
            difference() {
                cylinder(r=r + nfc_ant_trace_w/2, h=0.035);
                translate([0, 0, -0.01])
                    cylinder(r=r - nfc_ant_trace_w/2, h=0.055);
                // Gap for spiral feed
                translate([0, -r-1, -0.02])
                    cube([nfc_ant_trace_w + 1, 3, 0.08]);
            }
        }

        // ── ESP32-S3-WROOM-1 Module ──
        color([0.12, 0.12, 0.12])
        translate([esp_x, esp_y, pcb_d]) {
            // Metal shield can
            cube([esp_w, esp_h, esp_d], center=true);
            translate([0, 0, esp_d/2])
                cube([esp_w, esp_h, 0.1], center=true);  // top label
            // Antenna area (exposed PCB)
            color("DarkGreen")
            translate([0, -esp_h/2 - 2, -esp_d/2 + 0.5])
                cube([esp_w - 2, 4, 0.5], center=true);
        }
        // ESP32 label
        color("White")
        translate([esp_x - 5, esp_y + 2, pcb_d + esp_d/2 + 0.06])
            cube([10, 1.5, 0.02]);

        // ── PN532 NFC Controller IC ──
        color([0.08, 0.08, 0.08])
        translate([pn532_x, pn532_y, pcb_d])
            cube([pn532_w, pn532_h, pn532_d], center=true);
        // QFP leads
        color("Silver")
        for (side = [0:3])
            rotate([0, 0, side * 90])
                translate([0, pn532_h/2 + 0.3, pcb_d + 0.1])
                    for (i = [-3:3])
                        translate([i * 0.65, 0, 0])
                            cube([0.3, 0.8, 0.15], center=true);

        // ── MAX98357 I²S Audio Amp ──
        color([0.1, 0.1, 0.1])
        translate([amp_x, amp_y, pcb_d])
            cube([amp_w, amp_h, amp_d], center=true);

        // ── 8× WS2812B LEDs (ring layout) ──
        for (i = [0:led_count-1]) {
            angle = i * 360/led_count - 90;
            lx = cos(angle) * led_ring_r;
            ly = sin(angle) * led_ring_r + nfc_zone_y;

            translate([lx, ly, pcb_d]) {
                // LED package body (5×5mm)
                color("White")
                cube([led_size, led_size, led_h], center=true);

                // LED lens (dome)
                color([0, 1, 0.4], 0.7)
                translate([0, 0, led_h/2])
                    cylinder(r=2, h=0.5);

                // Solder pads
                color("Silver")
                for (px = [-1.5, 1.5])
                    for (py = [-1.5, 1.5])
                        translate([px, py, -led_h/2 - 0.05])
                            cube([1.2, 1.0, 0.1], center=true);
            }
        }

        // ── Light Pipes (from LED to front panel) ──
        color("White", 0.3)
        for (i = [0:led_count-1]) {
            angle = i * 360/led_count - 90;
            lx = cos(angle) * led_ring_r;
            ly = sin(angle) * led_ring_r + nfc_zone_y;

            translate([lx, ly, pcb_d + led_h])
                cylinder(r1=led_pipe_r - 0.5, r2=led_pipe_r, h=led_pipe_h);
        }

        // ── Speaker (15mm, on right side) ──
        translate([spk_x, spk_y, pcb_d]) {
            // Speaker body
            color("DarkSlateGray")
            cylinder(r=spk_dia/2, h=spk_h);
            // Cone
            color([0.15, 0.15, 0.15])
            translate([0, 0, spk_h])
                cylinder(r=spk_dia/2 - 1, h=0.3);
            // Center dome
            color("Silver")
            translate([0, 0, spk_h + 0.2])
                sphere(r=2.5);
            // Solder terminals
            color("Silver")
            for (a = [0, 180])
                rotate([0, 0, a])
                    translate([spk_dia/2 - 1, 0, 0])
                        cube([1.5, 0.8, 1], center=true);
        }

        // ── MicroSD Card Slot ──
        translate([sd_x, sd_y, pcb_d]) {
            color("Silver")
            difference() {
                cube([sd_w, sd_h, sd_d + 1], center=true);
                translate([0, -1, 0.5])
                    cube([sd_w - 1.5, sd_h - 2, sd_d + 0.5], center=true);
            }
            // Inserted SD card peek
            color("DarkBlue", 0.8)
            translate([0, 2, 0.3])
                cube([11, 10, 1], center=true);
        }

        // ── USB-C Connector ──
        translate([usbc_x, -pcb_h/2 + 2, 0]) {
            // Shell
            color("Silver")
            translate([0, 0, pcb_d/2])
            rotate([-90, 0, 0])
                linear_extrude(7)
                    pill_2d(usbc_w, usbc_h);
            // Inner contacts
            color("Gold")
            translate([0, 1, pcb_d/2])
            rotate([-90, 0, 0])
                linear_extrude(5)
                    pill_2d(usbc_w - 2, usbc_h - 1.5);
        }

        // ── Passive Components (capacitors, resistors — cosmetic) ──
        color([0.08, 0.06, 0.04])
        // 0402/0603 chip components scattered around
        for (pos = [
            [15, 20], [-15, 20], [25, 10], [-25, 10],
            [10, -5], [-10, -5], [20, -20], [-20, -20],
            [35, 15], [-35, 15], [30, -10], [-30, -10],
            [5, 15], [-5, -18], [15, -25], [-15, -25],
            [25, -5], [-25, 5], [12, 8], [-12, 8],
            [8, -12], [-8, -12], [32, 0], [-32, 0]
        ])
            translate([pos[0], pos[1], pcb_d])
                cube([1.6, 0.8, 0.5], center=true);

        // Larger electrolytic caps
        color("DarkSlateGray")
        for (pos = [[20, 20], [-20, -15]])
            translate([pos[0], pos[1], pcb_d])
                cylinder(r=2.5, h=5);

        // Crystal oscillator
        color("Silver")
        translate([10, esp_y + 5, pcb_d])
            cube([3.2, 2.5, 0.9], center=true);

        // Voltage regulator
        color([0.1, 0.1, 0.1])
        translate([-30, -20, pcb_d])
            cube([3, 3, 1.5], center=true);
        // Regulator heatsink pad
        color("Silver")
        translate([-30, -20, pcb_d + 0.8])
            cube([4, 4, 0.1], center=true);

        // ── Silkscreen labels (simplified as thin white bars) ──
        color("White")
        translate([0, 0, pcb_d + 0.01]) {
            // Component outlines
            for (pos = [
                [esp_x - esp_w/2, esp_y - esp_h/2, esp_w, esp_h],
                [pn532_x - pn532_w/2, pn532_y - pn532_h/2, pn532_w, pn532_h]
            ]) {
                difference() {
                    translate([pos[0] - 0.5, pos[1] - 0.5, 0])
                        cube([pos[2] + 1, pos[3] + 1, 0.02]);
                    translate([pos[0] + 0.2, pos[1] + 0.2, -0.01])
                        cube([pos[2] - 0.4, pos[3] - 0.4, 0.04]);
                }
            }
            // Logo area
            translate([-8, pcb_h/2 - 8, 0])
                cube([16, 3, 0.02]);
            // "HermitX" text bar
            translate([pcb_w/2 - 20, -pcb_h/2 + 3, 0])
                cube([15, 2, 0.02]);
        }
    }
}


// ═══════════════════════════════════════════════════════════════
//  WALL MOUNTING BRACKET
// ═══════════════════════════════════════════════════════════════

module wall_bracket() {
    color("DarkGray", 0.9)
    translate([0, 0, -brack_d - 1])
    difference() {
        // Main plate
        linear_extrude(brack_d)
            rrect(brack_w, brack_h, brack_r);

        // Center cable routing hole
        translate([0, 0, -0.1])
            cylinder(r=8, h=brack_d + 0.2);

        // Keyhole mounting slots (for drywall screws)
        for (x = [-30, 30]) {
            // Wide entry
            translate([x, 0, -0.1])
                cylinder(r=brack_screw_r + 1.5, h=brack_d + 0.2);
            // Narrow slot
            translate([x, -brack_slot_h/2, -0.1])
                hull() {
                    cylinder(r=brack_screw_r, h=brack_d + 0.2);
                    translate([0, brack_slot_h, 0])
                        cylinder(r=brack_screw_r + 1.5, h=brack_d + 0.2);
                }
            // Countersink at top of slot
            translate([x, brack_slot_h/2, brack_d - 1])
                cylinder(r1=brack_screw_r + 1.5, r2=brack_screw_r + 3, h=1.1);
        }

        // Weight-reduction cutouts
        for (x = [-15, 15])
            for (y = [-15, 15])
                translate([x, y, -0.1])
                    rounded_box(12, 12, brack_d + 0.2, 2);
    }

    // Snap-fit tabs (engage with bottom shell slots)
    color("DarkGray")
    translate([0, 0, -1])
    for (y = [-18, 18])
        for (x_sign = [-1, 1]) {
            translate([x_sign * (enc_w/2 - enc_wall/2 - 1), y, 0]) {
                // Tab body
                cube([2.5, 7, 4], center=true);
                // Snap hook
                translate([x_sign * 1, 0, 2])
                    rotate([0, x_sign * -15, 0])
                        cube([1, 6, 1.5], center=true);
            }
        }

    // Spirit level reference notch (for installation)
    color("DarkGray")
    translate([0, brack_h/2 - 2, -brack_d - 1 + brack_d])
        cube([20, 0.5, 0.5], center=true);
}


// ═══════════════════════════════════════════════════════════════
//  NFC CARD (demo, hovering near device)
// ═══════════════════════════════════════════════════════════════

module nfc_card() {
    translate([0, nfc_zone_y, enc_d + fp_d + 15])
    rotate([5, -3, 8])  // slight angle for realism
    {
        // Card body (CR80 standard: 85.6 × 53.98 × 0.76 mm)
        color("White", 0.9)
        linear_extrude(0.76)
            rrect(85.6, 54, 3.18);

        // TanenbaumCHAT logo area
        color("Navy")
        translate([-30, 10, 0.77])
            cube([35, 8, 0.05]);

        // Student photo area
        color("LightGray")
        translate([-35, -15, 0.77])
            cube([20, 22, 0.05]);

        // Name text lines
        color("Black")
        for (i = [0:2])
            translate([-10, -8 - i*5, 0.77])
                cube([30 - i*8, 2, 0.05]);

        // NFC chip area (visible as slight bump)
        color("Gold", 0.5)
        translate([20, 5, 0.3])
            cube([10, 8, 0.2], center=true);

        // Internal antenna coil (visible through card)
        color("Copper", 0.2)
        translate([0, 0, 0.38])
            difference() {
                linear_extrude(0.02)
                    rrect(70, 40, 5);
                translate([0, 0, -0.01])
                    linear_extrude(0.04)
                        rrect(66, 36, 4);
            }
    }
}


// ═══════════════════════════════════════════════════════════════
//  STATUS LED MODULE (top-right, through-hole)
// ═══════════════════════════════════════════════════════════════

module status_led() {
    translate([enc_w/2 - 12, enc_h/2 - 10, pcb_z + pcb_d]) {
        // LED body
        color([0, 0.9, 0], 0.7)
        union() {
            cylinder(r=1.5, h=3);
            translate([0, 0, 3])
                sphere(r=1.5);
        }
        // LED leads
        color("Silver")
        for (x = [-0.6, 0.6])
            translate([x, 0, -3])
                cube([0.4, 0.4, 3], center=true);
    }
}


// ═══════════════════════════════════════════════════════════════
//  RUBBER FEET (bottom of case for desk use)
// ═══════════════════════════════════════════════════════════════

module rubber_feet() {
    color("Black", 0.95)
    for (x = [-enc_w/2 + 10, enc_w/2 - 10])
        for (y = [-enc_h/2 + 10, enc_h/2 - 10])
            translate([x, y, -0.5])
                cylinder(r1=4, r2=3.5, h=1.5);
}


// ═══════════════════════════════════════════════════════════════
//  GASKET / SEAL (between top and bottom shell)
// ═══════════════════════════════════════════════════════════════

module shell_gasket() {
    color("DarkRed", 0.6)
    translate([0, 0, bottom_shell_d])
    difference() {
        linear_extrude(0.8)
            rrect(enc_w - enc_wall - 0.5, enc_h - enc_wall - 0.5, enc_r - 1);
        translate([0, 0, -0.1])
            linear_extrude(1.0)
                rrect(enc_w - enc_wall - 2.0, enc_h - enc_wall - 2.0, enc_r - 1.5);
    }
}


// ═══════════════════════════════════════════════════════════════
//  ASSEMBLY
// ═══════════════════════════════════════════════════════════════

module full_assembly() {
    // Optional cross-section
    if (CROSS_SECTION) {
        difference() {
            assembly_parts();
            // Cut plane (right half)
            translate([0, -200, -50])
                cube([400, 400, 200]);
        }
    } else {
        assembly_parts();
    }
}

module assembly_parts() {
    // Wall bracket
    if (SHOW_WALL_BRACKET)
        translate([0, 0, exp_brack])
            wall_bracket();

    // Bottom shell
    if (SHOW_BOTTOM_SHELL)
        bottom_shell();

    // Gasket
    if (SHOW_BOTTOM_SHELL && SHOW_TOP_SHELL)
        shell_gasket();

    // PCB + all components
    if (SHOW_PCB)
        translate([0, 0, exp_pcb])
            hermitx_pcb();

    // OLED display
    if (SHOW_OLED)
        translate([0, 0, exp_oled])
            oled_display();

    // Internal components
    if (SHOW_INTERNALS) {
        translate([0, 0, exp_pcb])
            status_led();
        rubber_feet();
    }

    // Top shell
    if (SHOW_TOP_SHELL)
        translate([0, 0, exp_top])
            top_shell();

    // Front panel
    if (SHOW_FRONT_PANEL)
        translate([0, 0, exp_front])
            front_panel();

    // Demo NFC card
    if (SHOW_NFC_CARD)
        nfc_card();
}

// ── RENDER ──
full_assembly();


// ═══════════════════════════════════════════════════════════════
//  PRINT-READY PLATE LAYOUT (uncomment to use)
// ═══════════════════════════════════════════════════════════════

/*
module print_plate() {
    // Bottom shell (print upside down)
    translate([-80, 0, bottom_shell_d])
        rotate([180, 0, 0])
            bottom_shell();

    // Top shell (print face down)
    translate([80, 0, top_shell_d])
        rotate([180, 0, 0])
            top_shell();

    // Front panel (print flat)
    translate([0, 70, 0])
        front_panel_printable();

    // Wall bracket (print flat)
    translate([0, -70, 0])
        wall_bracket();
}
// print_plate();
*/
