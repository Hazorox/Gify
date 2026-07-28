// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::sync::Arc;
use std::sync::atomic::AtomicBool;
use std::sync::atomic::Ordering::SeqCst;
use tauri::{
    Manager, WindowEvent,
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

struct DragState(Arc<AtomicBool>);
#[tauri::command]
fn set_dragging(drag: bool, state: tauri::State<DragState>) {
    state.0.store(drag, SeqCst);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let drag = Arc::new(AtomicBool::new(false));

    let main_key = Shortcut::new(Some(Modifiers::ALT | Modifiers::SHIFT), Code::KeyG);
    let handler = main_key.clone();
    tauri::Builder::default()
        .manage(DragState(drag.clone()))
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                // Listen for the shortcut
                .with_handler(move |app, shortcut, event| {
                    if shortcut == &handler {
                        match event.state() {
                            ShortcutState::Pressed => {
                                if let Some(win) = Manager::get_webview_window(app, "main") {
                                    if win.is_visible().unwrap() {
                                        let _ = win.hide();
                                        let _ = win.set_visible_on_all_workspaces(false);
                                    } else {
                                        let _ = win.show();
                                        let _ = win.set_focus();
                                        let _ = win.set_visible_on_all_workspaces(true);
                                    }
                                }
                            }
                            _ => {}
                        }
                    }
                })
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![set_dragging])
        .setup(move |app: &mut tauri::App| {
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
