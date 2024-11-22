import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import screw from "./assets/screw.png";
import logo from "./assets/logo.png";
import menu from "./assets/menu.png";
import redhat from "./assets/redhat.png";
import whitehat from "./assets/whitehat.png";
import sidelogo from "./assets/sidelogo.png";
import a from "./assets/a.png";
import b from "./assets/b.png";
import ocean7 from "./assets/ocean7.png";
import stat from "./assets/stat2.png";
import CardFlip from "./components/CardFlip";
// import { RefreshContext } from "./context/RefreshContext";
import WinnerModal from "./components/WinnerModal";

const Page1 = () => {
  const { width, height } = useWindowSize();
  // const { refreshKey } = useContext(RefreshContext);

  // useEffect(() => {
  //   // This effect will run when refreshKey changes
  //   console.log("Page1 re-rendered");
  // }, [refreshKey]);

  return (
    <div className=" ">
      <JokerAndCards />
      <div className="flex justify-between   bg-[url('./assets/wood.png')]  shadow-lg border-2 border-yellow-600">
        <BettingSection />
        <Statistics />
        <AndarBaharButtons />
      </div>
    </div>
  );
};


const JokerAndCards = () => {
  const [jokerValue, setJokerValue] = useState(null);
  const [section0Cards, setSection0Cards] = useState([]);
  const [section1Cards, setSection1Cards] = useState([]);
  const [revealedCards, setRevealedCards] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [won, setWon] = useState(-1);
  // const [lastTimestamp, setLastTimestamp] = useState({}); 


  // Function to fetch the reset status
  // const checkResetStatus = async () => {
  //   try {
  //     const response = await axios.get("http://127.0.0.1:8000/myapp/api/reset_collections/");
  //     const currentTimestamp = response.data.timestamp;

  //     if (currentTimestamp !== lastTimestamp) {
  //       // If the timestamp has changed, reset the states and reload the page
      
  //       setLastTimestamp(currentTimestamp);
  //       console.log("Current timestamp:", currentTimestamp);
  //       console.log("last timestamp:", lastTimestamp);
  //       console.log("State has been reset");
  //       window.location.reload();
  //            console.log("reload now")

  //     } else {
  const [prevId,setPrevId] = useState(null);
  const fetchJokerValue = () => {
    axios
      .get("http://127.0.0.1:8000/myapp/api/get_joker_value/")
      .then((response) => {
        const { value } = response.data.data;
        if (value) {
          setJokerValue(value);
        } else {
          setTimeout(fetchJokerValue, 500);
        }
      })
      .catch((error) => {
        console.error("Error fetching joker value:", error);
        setTimeout(fetchJokerValue, 500);
      });
  };

  useEffect(() => {
    fetchJokerValue();
  }, []);

  const fetchCardData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/myapp/api/assign_card_to_player/");
      if (response.data) {
        const newCard = response.data.value;
        const sectionId = response.data.section_id;
        const documentId= response.data.document_id;
console.log("documentId",documentId);
console.log("prevId",prevId);

        if (sectionId === 0) {
          if (prevId !== documentId){
            setSection0Cards((prev) => [...prev, newCard]);
            revealCard(newCard, "section0");
          }
          else{
            setSection1Cards((prev) => {
                const updatedCards = [...prev];
                updatedCards.pop(); // Remove the last card
                updatedCards.push(newCard); // Add the new card
                return updatedCards;
            });
            revealCard(newCard, "section0");
        }

         
        } else if (sectionId === 1) {

          if (prevId !== documentId){
            setSection1Cards((prev) => [...prev, newCard]);
            revealCard(newCard, "section1");
          }
          else {
            setSection0Cards((prev) => {
                const updatedCards = [...prev];
                updatedCards.pop(); // Remove the last card
                updatedCards.push(newCard); // Add the new card
                return updatedCards;
            });
            revealCard(newCard, "section1");
        }
        }

        const result = response.data.result;
        if (result === "0 wins") {
          setWon(0);
          handleWin();
          setTimeout(() => {
            window.location.reload();
        }, 7000);
        } else if (result === "1 wins") {
          setWon(1);
          handleWin();
          setTimeout(() => {
            window.location.reload();
        }, 7000);

        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const revealCard = (card, section) => {
    setRevealedCards((prev) => ({ ...prev, [card]: true }));
    setTimeout(() => {
      setRevealedCards((prev) => ({ ...prev, [card]: false }));
    }, 500);
  };

  useEffect(() => {
    const intervalId = setInterval(fetchCardData, 500);
    return () => clearInterval(intervalId);
  }, []);
  const handleWin = () => {
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
  };
  return (
    <div className="bg-[#8F1504] p-4 border-8 border-yellow-600">
      <WinnerModal show={showModal} onClose={handleCloseModal} winner={won} />
      <div className="flex items-center justify-center mx-auto border-b-4 border-yellow-600 pb-4 mb-4">
        <div className="text-white ml-2 font-ramaraja text-4xl font-bold">JOKER</div>
        <div className="w-40 h-60 border-dashed ml-5 border-2 border-yellow-600 bg-[#450A0366] rounded-lg flex justify-center items-center">
          {jokerValue ? (
            <img
              src={`./cards/${jokerValue}.png`}
              alt="Ocean 7 Casino"
              className="h-52"
            />
          ) : (
            <div className="flex justify-center items-center h-52">
              <img src={ocean7} alt="ocean7" className="w-24 h-24" />
            </div>
          )}
        </div>
      </div>

      <div className="flex relative h-1/2 justify-between p-4 border-b-4 border-yellow-600">
        <div className="text-white font-ramaraja text-6xl mt-10 font-bold mr-4">A</div>
        <div className="border-dashed border-2 border-yellow-600 rounded-lg w-full h-60 bg-[#450A0366] flex pl-32 items-center justify-left">
          {section0Cards.length > 0 &&
            section0Cards.map((card, index) => (
              <CardFlip
                key={index}
                index={index}
                frontImage={`./cards/${card}.png`}
                list={section0Cards}
                isRevealed={revealedCards[card] || true}
                frontContent={`Card ${card}`}
              />
            ))}
        </div>
      </div>

      <div className="flex h-1/2 justify-center p-4">
        <div className="text-white font-ramaraja text-6xl mt-10 font-bold mr-4">B</div>
        <div className="border-dashed border-2 border-yellow-600 rounded-lg w-full h-60 bg-[#450A0366] flex pl-32 items-center justify-left">
          {section1Cards.length > 0 &&
            section1Cards.map((card, index) => (
              <CardFlip
                key={index}
                index={index}
                frontImage={`./cards/${card}.png`}
                list={section1Cards}
                isRevealed={revealedCards[card] || true}
                frontContent={`Card ${card}`}
              />
            ))}
        </div>
      </div>
    </div>
  );
};


const BettingSection = () => {
  const [minBet, setMinBet] = useState(null);
  const [maxBet, setMaxBet] = useState(null);
  const [newMinBet, setNewMinBet] = useState("");
  const [newMaxBet, setNewMaxBet] = useState("");

  // Fetch current bets when the component mounts
  useEffect(() => {
    getBet();
  }, []);
  const getBet = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/myapp/api/get-bet/");
      const data = await response.json();
      if (response.ok) {
        setMinBet(data.min_bet);
        setMaxBet(data.max_bet);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.error("Error fetching bet data:", error);
    }
  };
  return (
    <div className="font-questrial p-4 rounded-lg  shadow-lg text-left w-1/4 relative">
      <img src={screw} alt="screw" className="absolute top-2 left-2 w-8 h-8" />
      <img src={screw} alt="screw" className="absolute top-2 right-2 w-8 h-8" />
      <div className="text-[#f3be39] text-center font-semibold">
        <p className="text-3xl font-bold font-ramaraja ">Bets</p>
        <div className="flex-col items-start justify-start">
          <p className="text-lg">Max:{maxBet}</p>
          <p className="text-lg">Min: {minBet}</p>
        </div>
      </div>
    </div>
  );
};

const Statistics = () => {
  const [recentWins, setRecentWins] = useState([]);
  const [winPercentages, setWinPercentages] = useState({});

  useEffect(() => {
    // Fetch data from the API
    const fetchRecentWins = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/myapp/api/get_recent_wins/"
        );
        const data = await response.json();

        if (data.success) {
          const wins = data.recent_wins.reverse().slice(0, 50);
          setRecentWins(wins);

          const sectionWins = wins.reduce((acc, win) => {
            acc[win.section_id] = (acc[win.section_id] || 0) + 1;
            return acc;
          }, {});

          const totalWins = wins.length;
          const percentages = {};

          for (const [sectionId, count] of Object.entries(sectionWins)) {
            percentages[sectionId] = ((count / totalWins) * 100).toFixed(2);
          }

          setWinPercentages(percentages); // Store win percentages in state
          console.log("Win Percentages:", percentages);
        }
      } catch (error) {
        console.error("Error fetching recent wins:", error);
      }
    };
    console.log(winPercentages);
    fetchRecentWins();
  }, []);
  return (
    <div className="  text-[#f3be39] p-4 border-2 border-gray-400 shadow-lg w-2/4">
      <div className="text-center font-ramaraja text-4xl font-bold ">
        STATISTICS
      </div>

      <div className="flex justify-center items-center overflow-clip -mt-5 space-x-2 bg-brown-800 p-4 rounded-lg">
        {/* A Coin Side */}
        <div className="flex justify-center items-center w-[100%] relative">
          <div className="absolute -mt-2 ml-2 left-0 w-16 h-20 overflow-clip">
            <img src={a} alt="a" className="w-16 " />
          </div>
          <div
            style={{ width: `${winPercentages[0] - 20}%` }}
            className="flex w-[30%] border-4 border-yellow-400  items-center space-x-2 bg-red-700 rounded px-2 py-1"
          >
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400 font-semibold">
                {Math.round(winPercentages[0])}
              </span>
            </div>
          </div>

          {/* B Coin Side */}
          <div className="absolute mr-2 -mt-2 right-0 w-16 h-20 pt-1 overflow-clip">
            <img src={b} alt="b" className="w-16 " />
          </div>
          <div
            style={{ width: `${winPercentages[1] - 20}%` }}
            className="flex w-[30%] border-4 border-yellow-400 justify-end items-center space-x-2 bg-blue-700 rounded px-2 py-1"
          >
            <div className="flex items-center justify-end space-x-1">
              <div className="text-yellow-400  font-semibold">
                {Math.round(winPercentages[1])}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AndarBaharButtons = () => {
  return (
    <div className="flex relative font-questrial justify-center items-center space-x-6 w-1/4">
      <img src={screw} alt="screw" className="absolute top-2 left-2 w-8 h-8" />
      <img src={screw} alt="screw" className="absolute top-2 right-2 w-8 h-8" />

      <div className="flex flex-col items-center">
        <div className="w-12 h-16 overflow-clip">
          <img src={a} alt="a" className="w-12 " />
        </div>
        <div className="text-[#f3be39] text-2xl font-semibold">Andar</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-12 h-16 pt-1 overflow-clip">
          <img src={b} alt="b" className="w-12 " />
        </div>
        <div className="text-[#f3be39]  text-2xl font-semibold">Bahar</div>
      </div>
    </div>
  );
};

export default Page1;