// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::sync::atomic::AtomicBool;
use std::sync::atomic::Ordering::SeqCst;
use std::sync::{Arc, Mutex};
use tauri::{
    Emitter, Manager, WindowEvent,
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use tauri_plugin_store::StoreExt;

// Managing Drag
struct DragState(Arc<AtomicBool>);
#[tauri::command]
fn set_dragging(drag: bool, state: tauri::State<DragState>) {
    state.0.store(drag, SeqCst);
}


// Update Hotkey Command ( With some Claude Help.. Im a rotten rusty :< )
struct HotkeyState(Mutex<Shortcut>);
#[tauri::command]
fn update_hotkey(
    app: tauri::AppHandle,
    key: String,
    shortcut_state: tauri::State<HotkeyState>,
) -> Result<(), String> {
    let new_key = key
        .parse::<Shortcut>()
        .map_err(|e| format!("Invalid Shortcut {:?}", e))?;
    let mut current_key = shortcut_state.0.lock().unwrap();

    let _ = app
        .global_shortcut()
        .unregister(*current_key)
        .map_err(|err| format!("Error unregistering old key {:?}", err));
    let _ = app
        .global_shortcut()
        .register(new_key)
        .map_err(|err| format!("Error unregistering old key {:?}", err));

    let store = app.store("store.json").unwrap();
    store.set("key", key);
    let _ = store.save();
    *current_key = new_key;
    Ok(())
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let drag = Arc::new(AtomicBool::new(false));

    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .manage(DragState(drag.clone()))
        .manage(HotkeyState(Mutex::new(Shortcut::new(
            Some(Modifiers::ALT | Modifiers::SHIFT),
            Code::KeyG,
        ))))
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                // Listen for the shortcut
                .with_handler(move |app, _shortcut, event| match event.state() {
                    ShortcutState::Pressed => {
                        if let Some(win) = Manager::get_webview_window(app, "main") {
                            if win.is_visible().unwrap() {
                                let _ = win.hide();
                                let _ = win.set_visible_on_all_workspaces(false);
                            } else {
                                let _ = win.show();
                                let _ = win.set_focus();
                                let _ = win.set_visible_on_all_workspaces(true);
                                let _ = win.emit("window-shown", ());
                            }
                        }
                    }
                    _ => {}
                })
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            set_dragging,
            update_hotkey
            
        ])
        .setup(move |app: &mut tauri::App| {
            // Load config file
            let store = app.store("store.json").unwrap();

            // Managing Hotkey
            let default_key = Shortcut::new(Some(Modifiers::ALT | Modifiers::SHIFT), Code::KeyG);

            // Got some help for fetching store_key from Claude
            let store_key = store
                .get("key")
                .and_then(|v| v.as_str().map(|s| s.to_string()));

            let main_key = match store_key {
                // Parse the string to a valid Hotkey
                Some(key_string) => key_string.parse::<Shortcut>().unwrap_or(default_key),
                None => default_key,
            };

            // Update hotkey state for later usage during application runtime
            *app.state::<HotkeyState>().0.lock().unwrap() = main_key;

            // register the shortcut
            app.global_shortcut().register(main_key)?;

            // Listening for when focus lost, to hide app
            let window = app.get_webview_window("main").unwrap();
            let window_clone = window.clone();
            window.on_window_event(move |event| {
                if let WindowEvent::Focused(_focused) = event {
                    let win = window_clone.clone();
                    std::thread::spawn(move || {
                        // Sleep for 100 milliseconds then close if not focused ( Got some help in this from Claude )
                        std::thread::sleep(std::time::Duration::from_millis(100));
                        if let Ok(false) = win.is_focused() {
                            let _ = win.hide();
                        }
                    });
                }
            });

            // Registering tray buttons and setup
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_i])?;
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        println!("Exiting App...");
                        app.exit(0);
                    }
                    _ => {
                        println!("Unknown option")
                    }
                })
                .icon(app.default_window_icon().unwrap().clone())
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
