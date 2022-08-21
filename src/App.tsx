import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./Components/Header";
import Home from "./Routes/Home";
import Search from "./Routes/Search";
import Tv from "./Routes/Tv";

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Header />
      <Routes>
        <Route path="/" element={<Home />}>
          <Route path="/movies/:movieId" element={<Home />} />
        </Route>
        <Route path="/tv" element={<Tv />}>
          <Route path="/tv/:tvId" element={<Tv />} />
        </Route>
        <Route path="/search" element={<Search />}>
          <Route path="/search/:searcId" element={<Search />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
