# Face-Action Treasure Hunt: Design Doc (v1.1)

**Names:** the display name is **Face-Action Treasure Hunt** (25 characters; short name "FA Treasure"). The in-game UI shows **"Face-Action Chasse au Trésor"** in French. The Play listing, web manifest and Android app label stay in English. The repo, URL (haitialways-pixel.github.io/face-action) and package `com.haitialways.faceaction` are unchanged.

## Concept
You're a helmeted treasure hunter (a drawn, race-neutral helmet with a visor and headlamp; it replaced the 🤠 emoji in v1.1) at the bottom of a cavern. Treasure falls toward you along with **guardians** that protect it. You play with your **face** through the front camera: look left or right to move, blink to strike, open your mouth to vacuum loot, and smile to unleash a special move. The run never ends. Each stage adds a new twist, and difficulty rises gently and levels off so players keep going.

**Improvements on the pitch:** combos, a special meter, 4 power-ups, 6 guardian types including bosses, "guarded" treasure (kill nearby guardians first to get full value), a 10-second calibration, built-in face rest breaks, a full touch/keyboard fallback, and a local high score.

## Controls
| Action | Face | Touch fallback |
|---|---|---|
| Move left/right | Look left / right (eye gaze) | ⬅️ ➡️ |
| Attack (throw) | Quick blink with both eyes (<0.6 s) | ⚔️ |
| Vacuum treasure | Open mouth (jawOpen) | 🌀 (hold) |
| Special "Treasure Nova" | Big smile for 0.5 s once the meter is full | ✨ |
| Block one hit | Puff cheeks or raise eyebrows (4 s cooldown) | 🛡️ (new in v1.1, same 4 s cooldown) |

Calibration records your neutral face for 2 s and subtracts it, so resting expressions don't trigger actions. The planned v0.2 adds per-player sensitivity sliders and wink controls (left wink and right wink as separate moves).

## Treasures
| Treasure | Points | Spawn weight |
|---|---|---|
| 🪙 Coin | 5 | 40% |
| 💍 Ring | 10 | 25% |
| 🏺 Urn | 20 | 15% |
| 👑 Crown | 40 | 10% |
| 💎 Diamond | 70 | 6% |
| 🏆 Golden Idol | 100 | 4% |

Combo multiplier: +10% per consecutive kill, up to ×2. The combo resets after 3 s or when you take a hit. Grabbing treasure while a guardian is still nearby pays only 50%.

## Guardians
| Guardian | Stage | Trait |
|---|---|---|
| 👺 Goblin | 1 | Basic, 1 HP |
| 🦇 Bat | 2 | Zig-zags |
| 🗿 Golem | 3 | 3 HP, slow |
| 👻 Ghost | 4 | Phases in and out; can only be hit when solid |
| 📦 Mimic | 5 | Looks like an urn until it gets close |
| 🐉 Dragon (boss) | every 5th stage | 8+ HP; HP grows each cycle |

## Power-ups (5% of spawns)
❤️ +1 heart (max 5; 14% of power-up drops since v1.1, previously 25%) · 🧲 magnet, 6 s · ⏳ slow-mo, 6 s · 🛡️ shield, 8 s

## Stage progression (gentle, endless)
- Kills to clear stage *s*: `5 + s` (v1.0 used `6 + floor(1.5·s)`)
- Fall speed: `60 · (1 + 0.08·min(s−1,15) + 0.02·max(0,s−16))` px/s. Speed rises 8% per stage until stage 16, then only 2% per stage.
- Spawn interval: `max(0.55, 1.35 · 0.93^(s−1))` s (v1.0 used `1.6 · 0.94^(s−1)`). The per-stage speed ramp is unchanged, so difficulty still rises only slightly each stage.
- **Relaxed speed** (⚙️ Settings): 75% fall speed, half the speed ramp, spawn interval `max(0.7, 1.6 · 0.965^(s−1))` s.
- Stages 1–7 each introduce one named twist. After that the twists rotate (faster, mixed horde, treasure frenzy, boss rematch). From stage 8, some stages have double spawns.
- **Face break:** a 15 s guided relaxation every 3 stages (skippable), in face mode only since v1.1. The game also pauses when the app goes to the background.

## Monetization ideas
- Free with optional rewarded ads (e.g. revive once per run, or double the stage reward). No forced interstitial ads during face play.
- Cosmetic IAP: hunter skins, treasure themes, cavern worlds.
- "Explorer Pass" subscription: daily challenges, weekly leaderboards, streak stats.
- Daily streaks and a "minutes of facial play" stat (an activity count, not a health metric).

## Marketing copy (compliant)
Avoid appearance and medical claims such as "better appearance", "anti-aging", "tones your face", or "reduces wrinkles". Stores and the FTC treat these as health claims that need evidence.
- **Tagline:** "Hunt treasure with your face. A fun facial workout game."
- "Blink, smile, and gape your way to gold. Every expression counts!"
- "Get your face moving: a playful way to stay expressive."
- "Built-in face breaks. Your camera never leaves your phone."
- Store disclaimer: "For entertainment only. Not a medical or cosmetic product."

## Privacy
All face tracking runs on-device (MediaPipe WASM). No video or images are uploaded. The store privacy labels should say "camera used on device; no data collected". You still need a privacy policy URL.

## Platform notes (built into the prototype)
- **iOS Safari:** `<video playsinline muted autoplay>`. `getUserMedia` is called directly from the "Play with Face" tap. The game doesn't use the Fullscreen API; for full screen, use Add to Home Screen (`display: standalone`, `apple-mobile-web-app-capable`). It respects safe areas (`viewport-fit=cover`), uses `100dvh`, and falls back from GPU to CPU for the model.
- **Android Chrome:** the same code path. Shows an install prompt from the manifest.
- **PWA:** `manifest.webmanifest` (portrait, standalone, 192/512/maskable icons), `apple-touch-icon` (180), and `sw.js` (caches the app shell plus the MediaPipe files after first load).
- Camera requires **HTTPS** (or localhost).

## Next steps to publish as native apps
1. **Host** as a PWA (see "Hosting" below), then test on a real iPhone and Android phone.
2. **Wrap with Capacitor:**
   ```
   npm init -y && npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
   npx cap init "Face-Action Treasure Hunt" com.haitialways.faceaction --web-dir=www
   mkdir www && cp -r index.html manifest.webmanifest sw.js icons www/
   npx cap add ios && npx cap add android && npx cap sync
   ```
   - iOS: add `NSCameraUsageDescription` to Info.plist ("Used on-device to read your facial expressions for gameplay"). WKWebView supports getUserMedia on iOS 14.3+. Bundle the MediaPipe wasm and model files locally (no CDN) for offline use and review stability. Build in Xcode with an Apple Developer account ($99/yr).
   - Android: add the `CAMERA` permission and grant it to the WebView (`onPermissionRequest`, which Capacitor handles via the Camera plugin or a small bridge). Build an AAB in Android Studio and upload it to Google Play ($25 one-time). Fill in the Data Safety form.
3. Replace emoji with original art and add sound/haptics. Add Game Center / Play Games leaderboards.
4. Store assets: screenshots, a privacy policy, an age rating, and the "entertainment only" disclaimer.
5. Optional: native ML (ARKit face blendshapes on iOS, MediaPipe Android SDK) for better battery life.

## Hosting (free)
Cloudflare Pages: drag and drop the `face-action` folder in the dashboard (Workers & Pages → Create → Pages → Upload assets), or run `npx wrangler pages deploy face-action --project-name face-action`. You get free HTTPS at `*.pages.dev`. GitHub Pages and Netlify also work.

## Sound
All sounds are synthesized in code with the Web Audio API (no audio files, no licensing). Effects: shot, guardian hit, guardian defeated, treasure collect (pitch rises with point value; extra sparkle for 70/100), power-up, combo (every 5), hurt, stage up, game over, Treasure Nova, and calibration countdown beeps. There's a light pentatonic music loop that only plays during active play. The 🔊 button cycles loud → quiet → mute and is saved on the device. Audio unlocks on the first tap (needed for iOS Safari).

## Monetization plan

Launch free. Earn from optional ads and small purchases, and never use camera data for ads.

1. **Rewarded ads (main earner):** the player chooses to watch a short video for a bonus, such as an extra life, double treasure for one run, or an instant special-meter refill. Limit to about 5 per day.
2. **Ads between rounds:** at most one short ad after every 3 or more game overs, and never during play or calibration. Skip them in a player's first few runs.
3. **"Remove ads" purchase:** one-time, $2.99 to $4.99. It removes the between-round ads, and rewarded bonuses stay available without ads.
4. **Cosmetics (after launch):** hunter skins, treasure themes, and cavern backgrounds. Nothing that makes the game pay-to-win.

**Tools:** Google AdMob for ads and Google Play Billing for purchases, connected through Capacitor plugins.
**Privacy:** use non-personalized ads by default, show Google's consent form where it's required, and update the privacy policy and Play Data safety answers before adding ads, because the ad SDK collects device data.
**Rollout:** launch v1.0 with no ads to get through the closed test and early reviews. Add rewarded ads and "remove ads" in v1.1, then cosmetics in v1.2.

## v1.1: features ported from Falling Bricks v0.4–v0.6
- **Start screen:** 👆 Play with Touch comes first, with 😀 Play with Face below it in the same style and a different color. Below those: the Daily Challenge card, a chapter chip, and a 🏆 Collection · ⚙️ Settings · ❓ How to Play row. 🎯 Recalibrate moved into Settings.
- **Camera explainer:** the camera is requested only after you tap Play with Face and then "Turn on camera" on an explainer screen. A low-light warning appears during calibration (mean frame brightness below 60/255).
- **Daily Challenge:** the same seeded run for everyone each day (mulberry32 seeded with `fa-YYYY-MM-DD`). Separate daily bests for face and touch. 🔥 streak rewards: day 3 ⚡ Treasure boost, day 7 Ruby helmet, day 14 Jade, day 30 Cosmic. The boost fills the special meter at the start and makes 40+ point treasure 2.2× more likely for one normal game; it never applies to the daily.
- **Celebrations:** hype banners at kill combos 5/10/15/20 (NICE!, ON FIRE!, UNSTOPPABLE!, LEGENDARY!), JACKPOT! on an unguarded 🏆 idol, STAGE CLEAR! with confetti and coins, DRAGON DEFEATED! with fireworks and a fanfare. A new record freezes play for 1 s with fireworks, and game over offers a 1080×1350 share card.
- **Continue?:** once per game, "Watch ad (+1 ❤️)" calls `showRewardedAd()`. That is currently a 2-second placeholder marked `TODO(AdMob)`. No ad SDK is included.
- **Chapters:** 3 missions each. Ch 1: defeat 15 guardians, collect 1 golden idol, use Treasure Nova once. Ch 2: defeat 40, block 3 hits, reach stage 4. Later chapters are seeded from the mission pool (kills, idols, novas, blocks, stage, score, combo, boss, treasure). Completing a chapter grants a ⚡ boost.
- **Collection:** helmet skins Gold (free), Ruby (1500 pts or 🔥 7), Jade (4000 or 🔥 14), Cosmic (8000 or 🔥 30). Badges: Dragon Slayer, Guardian Hunter (200 kills), Idol Collector (10), Iron Wall (25 blocks), and 3/7/14/30-day streaks.
- **Accessibility:** "Shape outlines" is a colorblind aid, on by default: bold outlines plus ✖ (guardians), ◆ (treasure) and ■ (power-ups) markers. 🐢 Relaxed speed is also available.
- **Kept:** separate face and touch bests, EN/FR, mute, pause (now with 🏠 Menu), and the camera turning off on pause, break, game over or background.
- **Skipped:** Falling Bricks' decaying point values (they don't fit the treasure-value system) and its per-color fill patterns (entities here are already shape-coded, so outlines and markers were used instead).
- **Bug fix:** treasure and power-ups had no fall speed (`sp`), so their position became NaN and they never appeared in v1.0. They now fall at 0.8× guardian speed.
- **Session length:** in a headless bot simulation (N=50, 1.1.0 build), median game times were 2:35 (casual bot), 3:43 (typical) and 5:26 (skilled), and 8:45 for the typical bot in Relaxed. The bot steers perfectly, so a real typical player sits near the casual profile, at about 2–3 min.

## Start-screen identity (v1.1, Oct 18 2026)
The start screen must not look like Falling Bricks', even as a thumbnail. Treasure Hunt uses an adventure/fantasy look:
- **Background:** a night-cavern gradient (deep purple to black) with a crescent moon and twinkling stars. A dragon silhouette flies across, gold coins drift down with sparkles, torches flicker on both sides, and the bottom edge is a jagged rock silhouette.
- **Hero art:** the helmeted hunter with cyan eye-lasers (`art/hero.webp`, 288 px, about 23 KB, taken from the store icon) in a gold medallion.
- **Title:** carved-gold serif "Face-Action" with a treasure-chest icon and a torch-orange letter-spaced subtitle.
- **Buttons:** amber-gold (Touch) and cyan (Face) plaques with a dark stone border and gem studs. The daily card, chapter chip and secondary buttons use dark wood/stone with gold trim.
- **Performance:** a canvas (DPR capped at 2) runs only while the start screen is visible and the tab is shown. It holds 14 coins, 22 sparkles and 50 stars. With prefers-reduced-motion it draws one static frame.
- **Theme color:** `#170b24`.
