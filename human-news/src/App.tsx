import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./index.css";
function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="container flex flex-col  items-center w-full h-full min-h-screen bg-gray-600">
      <h1 className="text-10xl font-bold underline">Hello world!</h1>
    </div>
  );
}

export default App;
