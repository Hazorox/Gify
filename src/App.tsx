import { IoIosSettings } from "react-icons/io";
import "./App.css";
import { useEffect, useRef, useState } from "react";
import Switch from "react-switch";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { Grid } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";
import useDebounce from "./hooks/useDebounce";
import { load } from "@tauri-apps/plugin-store";
import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
import { useRecordHotkeys } from "react-hotkeys-hook";


// Modifiers and validation
const modifiers = new Set(["Ctrl", "Control", "Alt", "Shift", "Meta", "Super"]);
const validateMod = (key: string, normal = false) => {
  if (normal) return !modifiers.has(key);
  return modifiers.has(key);
};
const handleDragMouse = (_: React.MouseEvent) => {
  invoke("set_dragging", { drag: true });
  getCurrentWindow().startDragging();
};

function App() {
  const [store, setStore] = useState<Awaited<ReturnType<typeof load>> | null>(
    null,
  );
  const [apiKey, setApiKey] = useState("");
  const [autostart, setAutostart] = useState(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const [hotkey, setHotkey] = useState<string>("");
  const [error, setError] = useState(false);
  const [keys, { start, stop, isRecording }] = useRecordHotkeys();
  const debouncedSearch = useDebounce(searchInput, 200);
  const gf = new GiphyFetch(apiKey);

  useEffect(() => {
    const handleMouseUp = () => {
      invoke("set_dragging", { drag: false });
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);
  const optionsRef = useRef<HTMLDivElement>(null);
  const fetchGifs = (offset: number) =>
    gf.search(debouncedSearch, {
      lang: "en",
      offset,
      limit: 10,
      sort: "relevant",
    });

  useEffect(() => {
    const fetchStuff = async () => {
      const contents = await load("store.json", { autoSave: true });
      setStore(contents);
      setApiKey((await contents.get("apiKey")) ?? "");
      setAutostart(await isEnabled());
    };
    fetchStuff();
  }, []);
  return (
    <div className="w-full h-full overflow-hidden bg-[#282828] text-white">
      <div
        data-tauri-drag-region
        onMouseDown={handleDragMouse}
        className="w-full select-none border-b-2 h-[8%]  gap-2 text-xl flex sticky justify-between px-2 py-1 items-center border-[#717171]"
      >
        GIFy
        <input
          type="text"
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          placeholder="Search"
          className="w-[60%] placeholder:text-center focus:border-2 focus:border-gray-400 border-gray-500 select-text flex justify-center self-center text-center items-center rounded-lg sticky border-2"
          onChange={(e) => {
            setSearchInput(e.target.value);
          }}
          value={searchInput}
        />
        <IoIosSettings
          className="cursor-pointer"
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onClick={() => {
            optionsRef?.current?.classList.toggle("hidden");
          }}
        />
      </div>
      <div className="relative h-full">
        <div
          className="absolute top-1 right-1 hidden z-100 h-fit w-[60%] bg-[#171717]/70 border-2 border-gray-900 rounded-xl flex flex-col "
          ref={optionsRef}
        >
          <div className="border-b-2 py-2 border-gray-300 w-full flex justify-around">
            API Key{" "}
            <input
              onChange={async (e) => {
                setApiKey(e.target.value);
                await store?.set("apiKey", e.target.value);
              }}
              placeholder="Key"
              value={apiKey}
              className="rounded-xl bg-gray-400 placeholder:text-gray-800 flex justify-center items-center text-gray-800 w-1/2 px-1"
            />
          </div>
          <div className="border-b-2 py-2 border-gray-300 w-full flex justify-around">
            Auto Start
            <Switch
              onChange={async () => {
                const enabled = await isEnabled();
                if (enabled) {
                  await disable();
                } else {
                  await enable();
                }
                setAutostart(await isEnabled());
              }}
              checked={autostart}
            />
          </div>
          <div className="py-2 border-gray-300 flex-col gap-2 justify-center items-center w-full flex">
            Hotkey
            <span className="flex w-[90%]">
              <button
                onClick={() => {
                  if (isRecording) {
                    const keyz = Array.from(keys);
                    const mods = keyz
                      .map(
                        (key: string) =>
                          key[0].toLocaleUpperCase() + key.slice(1),
                      )
                      .filter((key) => validateMod(key));
                    let normal = keyz
                      .map(
                        (key: string) =>
                          key[0].toLocaleUpperCase() + key.slice(1),
                      )
                      .filter((key) => validateMod(key, true));
                    if (normal.length != 1 && mods.length != 2) {
                      setError(true);
                      return;
                    }else{
                      setError(false)
                    }
                    normal[0] = "Key" + normal[0].toLocaleUpperCase();
                    setHotkey([mods[0], mods[1], normal[0]].join("+"));
                    stop();
                  } else {
                    start();
                  }
                }}
                className="w-1/2 bg-gray-400 text-gray-800  cursor-pointer rounded-l-full border-r-2"
              >
                {isRecording ? "Press to stop" : "Record"}
              </button>
              <span className="bg-gray-400 text-sm w-1/2 flex justify-center items-center text-gray-800 rounded-r-full">
                {hotkey}
              </span>
            </span>
              {error && (
                <span className="text-red-500 text-center">
                  Invalid shortcut format.. 2 Modifiers and 1 Key
                </span>
              )}
          </div>
        </div>
        <div className="w-full h-full flex justify-center overflow-y-auto">
          <Grid
            key={debouncedSearch}
            width={window.innerWidth - 16}
            columns={2}
            fetchGifs={fetchGifs}
          />
        </div>
      </div>
      test
    </div>
  );
}

export default App;
