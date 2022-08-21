import { useQuery } from "react-query";
import styled from "styled-components";
import { getGenresMovies } from "../api";
import Movies from "../Components/Home/Movies";

const Wrapper = styled.div`
  background: black;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

function Home() {
  const { data, isLoading } = useQuery(
    ["genres", "movieGenres"],
    getGenresMovies
  );
  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Movies type="nowPlaying" genres={data?.genres} />
          <Movies type="topRated" genres={data?.genres} />
          <Movies type="upcoming" genres={data?.genres} />
        </>
      )}
    </Wrapper>
  );
}
export default Home;
