import { useEffect, useState } from "react"

const useDebounce = <T>(value:T,delay:number)=>{
    const [debounce,setDebounce] = useState(value)
    useEffect(()=>{
        const timer = setTimeout(()=>setDebounce(value),delay)
        return () => clearTimeout(timer)
    },[value,delay])

    return debounce
}

export default useDebounce;