import { Routes, Route } from "react-router-dom";
import Title from "./Title";
import { SocketProvider } from "./providers/socket-provider.tsx";

const Home = () => {
  return (
    <SocketProvider>
      <Routes>
        <Route path="/main" element={<Title />} />
      </Routes>
    </SocketProvider>
  );
};

export default Home;
