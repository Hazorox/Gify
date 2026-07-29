import { IoIosSettings } from "react-icons/io";
import "./App.css";
import { useEffect, useRef, useState } from "react";
import Switch from "react-switch"
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";

const handleDragMouse = (_:React.MouseEvent)=>{
  invoke("set_dragging",{drag:true})
  getCurrentWindow().startDragging()
}

function App() {
  const [contents, setContents] = useState([]);
  const [apiKey, setApiKey] = useState("");
  const [autostart,setAutostart] = useState<boolean>(false)
  const [searchInput, setSearchInput] = useState<string>("");
   useEffect(() => {
    const handleMouseUp = () => {
      invoke("set_drag", { dragging: false });
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);
  const optionsRef = useRef<HTMLDivElement>(null);
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
          placeholder="Search"
          className="w-[60%] placeholder:text-center focus:border-2 focus:border-gray-400 border-gray-500 select-text flex justify-center self-center text-center items-center rounded-lg sticky border-2"
          onChange={(e) => {
            setSearchInput(e.target.value);
          }}
          value={searchInput}
        />
        <IoIosSettings
          className="cursor-pointer"
          onClick={() => {
            optionsRef?.current?.classList.toggle("hidden");
          }}
        />
      </div>
      <div className="relative h-full">
        <div
          className="absolute top-1 right-1 hidden h-fit w-[60%] bg-[#171717]/70 border-2 border-gray-900 rounded-xl flex flex-col "
          ref={optionsRef}
        >
          <div className="border-b-2 py-2 border-gray-300 w-full flex justify-around">
            API Key{" "}
            <input
              onChange={(e) => {
                setApiKey(e.target.value);
              }}
              placeholder="Key"
              value={apiKey}
              className="rounded-xl bg-gray-400 placeholder:text-gray-800 flex justify-center items-center text-gray-800 w-1/2 px-1"
            />
          </div>
          <div className="border-b-2 py-2 border-gray-300 w-full flex justify-around">
            Auto Start
            <Switch onChange={()=>{setAutostart(prev=>!prev)}} checked={autostart}/>
          </div>
          <div className="py-2 border-gray-300 w-full flex justify-around">
            Hotkey
            <button className="w-1/2 bg-gray-400 text-gray-800 border cursor-pointer rounded-full">record</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
