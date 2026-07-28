// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{
    Manager,
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let main_key = Shortcut::new(Some(Modifiers::ALT | Modifiers::SHIFT), Code::KeyG);
    let handler = main_key.clone();
    let exit_key = Shortcut::new(None, Code::Escape);
    tauri::Builder::default()
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
        .invoke_handler(tauri::generate_handler![greet])
        .setup(move |app: &mut tauri::App| {
            // register the shortcut
            app.global_shortcut().register(main_key)?;
            app.global_shortcut().register(exit_key)?;

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
