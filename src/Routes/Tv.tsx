import { useQuery } from "react-query";
import styled from "styled-components";
import { getGenresTv } from "../api";
import TvShows from "../Components/Home/TvShows";

const Wrapper = styled.div`
  background: black;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

function Tv() {
  const { data, isLoading } = useQuery(["genres", "tvGenres"], getGenresTv);
  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <TvShows type="airingToday" genres={data?.genres} />
          <TvShows type="popular" genres={data?.genres} />
          <TvShows type="topRated" genres={data?.genres} />
        </>
      )}
    </Wrapper>
  );
}
export default Tv;
