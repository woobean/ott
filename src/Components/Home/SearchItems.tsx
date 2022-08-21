import styled from "styled-components";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { IGenres } from "../../api";
import { makeImagePath } from "../../utils";
import { useState } from "react";
import { useMatch, useNavigate } from "react-router-dom";

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
  margin-bottom: 20px;
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

function SearchItems({
  keyword,
  type,
  data,
  genres,
}: {
  keyword: string;
  type: string;
  data?: any;
  genres?: IGenres[];
}) {
  const navigate = useNavigate();
  const bigMovieMatch = useMatch("/search/:searcId");
  const { scrollY } = useScroll();
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
  const onBoxClicked = (searcId: number) => {
    setModal(true);
    navigate(`/search/${searcId}?keyword=${keyword}`);
  };
  const onOverlayClick = () => {
    setModal(false);
    navigate(`/search?keyword=${keyword}`);
  };
  const clickedMovie =
    bigMovieMatch?.params.searcId &&
    data?.results.find(
      (movie: any) => movie.id === Number(bigMovieMatch?.params.searcId)
    );
  return (
    <>
      <Slider>
        <Subject>{type === "movies" ? "Movies" : "Tv Shows"}</Subject>
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
            {data?.results
              ?.slice(offset * index, offset * index + offset)
              .map((movie: any) => (
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
                        ?.filter((item) => movie?.genre_ids?.includes(item.id))
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
              layoutId={bigMovieMatch.params.searcId + type}
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

export default SearchItems;
