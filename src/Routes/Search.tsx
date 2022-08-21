import { useQuery } from "react-query";
import { useLocation } from "react-router";
import { API_KEY, BASE_PATH } from "../api";
import SearchItems from "../Components/Home/SearchItems";

function Search() {
  const location = useLocation();
  const keyword = new URLSearchParams(location.search).get("keyword");
  const { data: movies } = useQuery(
    "movies",
    async () =>
      await fetch(
        `${BASE_PATH}/search/movie?api_key=${API_KEY}&query=${keyword}`
      ).then((response) => response.json())
  );
  const { data: tvShow } = useQuery(
    "tvShow",
    async () =>
      await fetch(
        `${BASE_PATH}/search/tv?api_key=${API_KEY}&query=${keyword}`
      ).then((response) => response.json())
  );
  return (
    <>
      <div style={{ height: "68px" }}></div>
      <SearchItems keyword={keyword ?? ""} type="movies" data={movies} />
      <SearchItems keyword={keyword ?? ""} type="tvShow" data={tvShow} />
    </>
  );
}
export default Search;
