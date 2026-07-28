import { IoIosSettings } from "react-icons/io";
import "./App.css";
import { useRef, useState } from "react";

function App() {
  const [contents, setContents] = useState([]);
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<"Giphy" | "Tenor" | "Klippy">(
    "Giphy",
  );
  const [searchInput,setSearchInput] = useState<string>("")
  const optionsRef = useRef<HTMLDivElement>(null);
  console.log(provider)
  return (
    <div className="w-full h-full overflow-hidden bg-[#282828] text-white">
      <div
        data-tauri-drag-region
        className="w-full select-none border-b-2 h-[8%]  gap-2 text-xl flex sticky justify-between px-2 py-1 items-center border-[#717171]"
      >
        GIFy
        <input
          type="text"
          placeholder="Search"
          className="w-[60%] placeholder:text-center select-text flex justify-center self-center items-center border-[#fffbe6] rounded-lg sticky border-2"
          onChange={(e)=>{
            setSearchInput(e.target.value)
          }}
          value = {searchInput}
        />
        <IoIosSettings
        className="cursor-pointer"
          onClick={() => {
            optionsRef?.current?.classList.toggle("hidden");
          }}
        />
      </div>
      <div className="relative h-full">
        <div className="absolute top-1 right-1 hidden h-fit w-[50%] bg-[#171717]/70 border-2 border-gray-900 rounded-xl flex flex-col " ref={optionsRef}>
        <div className="border-b-2 py-2 border-gray-300 w-full flex justify-around">Provider

          <select className="text-black bg-gray-400 rounded-xl" defaultValue={"Giphy"} onChange={(e)=>{
            if(!["Giphy","Tenor","Klippy"].includes(e.target.value)) return;
            setProvider(e.target.value)
          }}>
            <option value="Giphy">Giphy</option>
            <option value="Tenor">Tenor</option>
            <option value="Klippy">Klippy</option>
          </select>
        </div>
        <div className="border-b-2 py-2 border-gray-300 w-full flex justify-around">API Key</div>
        <div className="border-b-2 py-2 border-gray-300 w-full flex justify-around">Auto Start</div>
        <div className="py-2 border-gray-300 w-full flex justify-around">Keyboard Hotkey</div>
        {/* <div className="border-b-2 border-gray-300"></div> */}
        </div>
      </div>
    </div>
  );
}

export default App;
