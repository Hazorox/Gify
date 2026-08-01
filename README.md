# Gify - Univseral GIF Picker
## By [Hazoro](https://github.com/hazorox)
### [Download Latest Release](https://github.com/Hazorox/Gify/releases)
A Tauri ( React - Rust) application built for windows

DEMO : 

<video src="images/GIFy_DEMO.mp4" controls width="600" />

Lives in system tray and shows up with a user-defined hotkey ( Alt + Shift + G on initial launch )

- Search for a GIF
- Press it
- Boom! Copied to Clipboard :D

# BEFORE USAGE
1. Head to [Giphy Developers](https://developers.giphy.com/dashboard/)
2. Create a Dev Account
3. Press "Create an API Key" (Select any, SDK or API)
4. Copy the provided key and paste in the GIFy settings

This enables the app to fetch GIFs from Giphy


# Project Process
- Window Management & Hotkeys with Rust as a Rusty Rookie ( 3 Hours )
- Autostart ( 20~30 Minutes )
- Frontend Design ( 3~4 Hours)
- Search debounce (30 Minutes)
- Lazy load ( spent 1.5 hours but failed so uhmm.. In an upcoming release T-T )
- Build & Release !!

# AI Declaration (Claude)
- Debugging window crashing on hotkey press
- Debounce logic and timing range
- Guide through rust basics alongside the docs when too stuck