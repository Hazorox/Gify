import { IoIosSettings } from "react-icons/io";
import "./App.css";

function App() {
  return (
    <div className="w-full h-full bg-[#282828] text-white">
      <div data-tauri-drag-region className="w-full border-b-2 h-[8%]  gap-2 text-xl flex flex-none justify-between px-2 py-1 items-center border-[#717171]">
        GIFy
        <input type="text" placeholder="Search for GIFs" className="w-[60%] placeholder:text-center flex justify-center self-center items-center border-[#fffbe6] rounded-lg sticky border-2"  />
        <IoIosSettings />
      </div>
      <div className="flex-1">contents</div>
      <div className="bottom-0 absolute w-full justify-around flex items-center flex-none h-[8%] border-t-2 border-[#717171]">Footer</div>
    </div>
  );
}

export default App;
