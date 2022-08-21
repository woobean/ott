import { useQuery } from "react-query";
import styled from "styled-components";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import {
  getNowPlayingMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  IGetMoviesResult,
  getLatestMovies,
  IGenres,
} from "../../api";
import { makeImagePath } from "../../utils";
import { useState } from "react";
import { useMatch, useNavigate } from "react-router-dom";

const Banner = styled.div<{ bgphoto: string }>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 4%;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
    url(${(props) => props.bgphoto});
  background-size: cover;
`;

const Title = styled.h2`
  font-size: 4vw;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.45);
  margin-bottom: 20px; ;
`;

const Overview = styled.p`
  font-size: 1.2vw;
  font-weight: 500;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.45);
  width: 50%;
`;

const Btns = styled.div`
  display: flex;
  margin-top: 20px;
`;

const Btn = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background-color: rgba(109, 109, 110, 0.7);
  padding: 6px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2vw;
  font-weight: bold;

  &:hover {
    background-color: rgba(109, 109, 110, 0.4);
  }

  svg {
    width: 1.4vw;
    margin-right: 0.4vw;
  }
`;

const Arrow = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  width: 4%;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;

  &::after {
    content: "";
    position: absolute;
    top: calc(50% - 12px);
    left: calc(50% - 12px);
    width: 24px;
    height: 24px;
    box-sizing: border-box;
    border-top: 4px solid white;
    border-left: 4px solid white;
  }
`;

const PrevArrow = styled(Arrow)`
  left: 0;

  &::after {
    transform: translateX(4px) rotate(-45deg);
  }
`;

const NextArrow = styled(Arrow)`
  right: 0;

  &::after {
    transform: translateX(-4px) rotate(135deg);
  }
`;

const Slider = styled.div`
  position: relative;
  padding: 0 4%;
  height: calc(92vw / 6 * 9 / 16 + 40px);
  margin-top: -60px;
  margin-bottom: 80px;
  &:hover ${Arrow} {
    opacity: 1;
  }
`;

const Subject = styled.h4`
  margin-bottom: 8px;
  font-size: 1.5vw;
  font-weight: bold;
`;

const Row = styled(motion.div)`
  display: flex;
  gap: 5px;
  position: absolute;
  width: 92%;
`;

const Box = styled(motion.div)<{ bgphoto: string }>`
  width: calc(92vw / 6);
  background-color: white;
  background-image: url(${(props) => props.bgphoto});
  background-size: cover;
  background-position: center center;
  padding-bottom: calc(92vw / 6 * 9 / 16);
  cursor: pointer;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    font-size: 1vw;
    font-weight: 500;
  }
`;

const Genres = styled.div`
  margin-top: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;

  div {
    padding: 2px 4px;
    font-size: 0.75vw;
    border: 1px solid white;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  z-index: 9;
`;

const BigMovie = styled(motion.div)`
  position: absolute;
  width: 40vw;
  height: 80vh;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-radius: 15px;
  overflow-y: auto;
  background-color: ${(props) => props.theme.black.lighter};
  z-index: 10;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const BigCover = styled.div`
  width: 100%;
  padding-bottom: 56.25%;
  background-size: cover;
  background-position: center center;
`;

const BigGenres = styled.div`
  padding: 1vw;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;

  div {
    padding: 2px 4px;
    font-size: 0.75vw;
    border: 1px solid white;
  }
`;

const BigTitle = styled.h3`
  color: ${(props) => props.theme.white.lighter};
  padding: 1vw;
  font-size: 2vw;
  position: relative;
`;

const BigOverview = styled.p`
  padding: 1vw;
  position: relative;
  color: ${(props) => props.theme.white.lighter};
`;

const rowVariants = {
  hidden: (custom: boolean) => ({
    x: custom ? -window.outerWidth - 5 : window.outerWidth + 5,
  }),
  visible: {
    x: 0,
  },
  exit: (custom: boolean) => ({
    x: custom ? window.outerWidth + 5 : -window.outerWidth - 5,
  }),
};

const boxVariants = {
  normal: {
    scale: 1,
  },
  hover: {
    scale: 1.3,
    y: -80,
    transition: {
      delay: 0.5,
      duaration: 0.1,
      type: "tween",
    },
  },
};

const infoVariants = {
  hover: {
    opacity: 1,
    transition: {
      delay: 0.5,
      duaration: 0.1,
      type: "tween",
    },
  },
};

const offset = 6;

function Movies({ type, genres }: { type: string; genres?: IGenres[] }) {
  const navigate = useNavigate();
  const bigMovieMatch = useMatch("/movies/:movieId");
  const { scrollY } = useScroll();
  const { data: nowPlaying } = useQuery<IGetMoviesResult>(
    ["movies", "nowPlaying"],
    getNowPlayingMovies
  );
  const { data: topRated } = useQuery<IGetMoviesResult>(
    ["movies", "topRated"],
    getTopRatedMovies
  );
  const { data: upcoming } = useQuery<IGetMoviesResult>(
    ["movies", "upcoming"],
    getUpcomingMovies
  );
  const { data: latest } = useQuery<IGetMoviesResult>(
    ["movies", "latest"],
    getLatestMovies
  );
  const data =
    type === "topRated"
      ? topRated
      : type === "upcoming"
      ? upcoming
      : type === "latest"
      ? latest
      : nowPlaying;
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [back, setBack] = useState(false);
  const increaseIndex = () => {
    setBack(false);
    if (data) {
      if (leaving) return;
      toggleLeaving();
      const totalMovies = data.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const decreaseIndex = () => {
    if (index === 0) return;
    setBack(true);
    if (data) {
      if (leaving) return;
      toggleLeaving();
      setIndex((prev) => (prev === 0 ? 0 : prev - 1));
    }
  };
  const toggleLeaving = () => setLeaving((prev) => !prev);
  const [modal, setModal] = useState(false);
  const onBoxClicked = (movieId: number) => {
    setModal(true);
    navigate(`/movies/${movieId}`);
  };
  const onOverlayClick = () => {
    setModal(false);
    navigate("/");
  };
  const clickedMovie =
    bigMovieMatch?.params.movieId &&
    data?.results.find(
      (movie) => movie.id === Number(bigMovieMatch?.params.movieId)
    );
  return (
    <>
      {type === "nowPlaying" && (
        <Banner bgphoto={makeImagePath(data?.results[0].backdrop_path || "")}>
          <Title>{data?.results[0].title}</Title>
          <Overview>{data?.results[0].overview}</Overview>
          <Btns>
            <Btn onClick={() => onBoxClicked(Number(data?.results[0].id))}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3ZM1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12ZM13 10V18H11V10H13ZM12 8.5C12.8284 8.5 13.5 7.82843 13.5 7C13.5 6.17157 12.8284 5.5 12 5.5C11.1716 5.5 10.5 6.17157 10.5 7C10.5 7.82843 11.1716 8.5 12 8.5Z"
                  fill="currentColor"
                ></path>
              </svg>
              More Info
            </Btn>
          </Btns>
        </Banner>
      )}
      <Slider>
        <Subject>
          {type === "topRated"
            ? "Top Rated"
            : type === "upcoming"
            ? "Upcoming"
            : type === "latest"
            ? "Latest"
            : "Now Playing"}
        </Subject>
        <AnimatePresence
          initial={false}
          onExitComplete={toggleLeaving}
          custom={back}
        >
          <Row
            variants={rowVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "tween", duration: 1 }}
            key={index}
            custom={back}
          >
            {type === "nowPlaying"
              ? data?.results
                  .slice(1)
                  .slice(offset * index, offset * index + offset)
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + type}
                      key={movie.id}
                      whileHover="hover"
                      initial="normal"
                      variants={boxVariants}
                      onClick={() => onBoxClicked(movie.id)}
                      transition={{ type: "tween" }}
                      bgphoto={makeImagePath(movie.backdrop_path, "w500")}
                    >
                      <Info variants={infoVariants}>
                        <h4>{movie.title}</h4>
                        <Genres>
                          {genres
                            ?.filter((item) =>
                              movie?.genre_ids?.includes(item.id)
                            )
                            .map((item) => (
                              <div key={item.id}>{item.name}</div>
                            ))}
                        </Genres>
                      </Info>
                    </Box>
                  ))
              : data?.results
                  ?.slice(offset * index, offset * index + offset)
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + type}
                      key={movie.id}
                      whileHover="hover"
                      initial="normal"
                      variants={boxVariants}
                      onClick={() => onBoxClicked(movie.id)}
                      transition={{ type: "tween" }}
                      bgphoto={makeImagePath(movie.backdrop_path, "w500")}
                    >
                      <Info variants={infoVariants}>
                        <h4>{movie.title}</h4>
                        <Genres>
                          {genres
                            ?.filter((item) =>
                              movie?.genre_ids?.includes(item.id)
                            )
                            .map((item) => (
                              <div key={item.id}>{item.name}</div>
                            ))}
                        </Genres>
                      </Info>
                    </Box>
                  ))}
          </Row>
        </AnimatePresence>
        <PrevArrow onClick={decreaseIndex} />
        <NextArrow onClick={increaseIndex} />
      </Slider>
      <AnimatePresence>
        {modal && bigMovieMatch ? (
          <>
            <Overlay
              onClick={onOverlayClick}
              exit={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
            <BigMovie
              style={{
                top: scrollY.get() + 100,
              }}
              layoutId={bigMovieMatch.params.movieId + type}
            >
              {clickedMovie && (
                <>
                  <BigCover
                    style={{
                      backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(
                        clickedMovie.backdrop_path,
                        "w500"
                      )})`,
                    }}
                  />
                  <BigGenres>
                    {genres
                      ?.filter((item) =>
                        clickedMovie.genre_ids?.includes(item.id)
                      )
                      .map((item) => (
                        <div key={item.id}>{item.name}</div>
                      ))}
                  </BigGenres>
                  <BigTitle>{clickedMovie.title}</BigTitle>
                  <BigOverview>
                    {clickedMovie.release_date} · ⭐{clickedMovie.vote_average}
                  </BigOverview>
                  <BigOverview>{clickedMovie.overview}</BigOverview>
                </>
              )}
            </BigMovie>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default Movies;
