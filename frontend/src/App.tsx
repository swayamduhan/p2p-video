import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Sender } from "./pages/Sender";
import { Receiver } from "./pages/Receiver";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sender" element={<Sender />} />
        <Route path="/receiver" element={<Receiver />} />
      </Routes>
    </BrowserRouter>
  );
}

function Home() {
  return (
    <div>
      <div>P2P - Video - WebRTC</div>
      <a href="/sender"><button>Sender</button></a>
      <a href="/receiver"><button>Receiver</button></a>
    </div>
  );
}

export default App;
