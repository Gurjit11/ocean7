import React, { useContext } from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import screw from "./assets/screw.png";
import logo from "./assets/logo.png";
import menu from "./assets/menu.png";
import redhat from "./assets/redhat.png";
import whitehat from "./assets/whitehat.png";
import sidelogo from "./assets/sidelogo.png";
import a from "./assets/a.png";
import b from "./assets/b.png";
import ocean7 from "./assets/ocean7.png";
import Confetti from "react-confetti";
import CardFlip from "./components/CardFlip";
import BetPopUp from "./BetPopUp";
import PlayerSelectionPopup from "./PlayerSelectionpopUp";
import WinnerModal from "./components/WinnerModal";
import { useFlip } from "./context/FlipContext";
// import { RefreshContext } from "./context/RefreshContext";
import { useNavigate } from "react-router-dom";

const AndarBaharPage = () => {
  const { toggleReveal } = useFlip();
  const [sectionId, setSectionId] = useState(0);
  const [section0Cards, setSection0Cards] = useState([]);
  const [section1Cards, setSection1Cards] = useState([]);
  const [cardValue, setCardValue] = useState('');
  const handleWin = () => {
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };
  const stopPush = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/myapp/api/stop-push/",
        {
          method: "POST",
        }
      );
      const data = await response.json();
      if (data.message === "Pushing stopped.") {
        setIsPushing(false); // Update the state to indicate pushing has stopped
      }
    } catch (error) {
      console.error("Error stopping the push:", error);
    }
  };
  const [won, setWon] = useState(-1);
  const [showModal, setShowModal] = useState(false);

  const fetchCardData = async (method, cardValue = "") => {
    try {
      const url = "http://127.0.0.1:8000/myapp/api/assign_card_to_section_A/";

      const config = {
        method,
        url,
        headers: {
          "Content-Type": "application/json",
        },
        data: method === "PUT" ? { value: cardValue } : undefined,

      };

      // Axios call
      const response = await axios(config);

      if (response.data.success) {
        const { value, section_id } = response.data;

        // POST: Append the card
        if (method === "POST") {
          if (section_id === 0) {
            setSection0Cards((prev) => [...prev, value]);
            console.log("section0Cards", section0Cards);
          } else if (section_id === 1) {
            setSection1Cards((prev) => [...prev, value]);
            console.log("section1Cards", section1Cards);
          }
          const result = response.data.result;
          console.log("result", result);

        // Check the "result" field and give alerts accordingly
        if (result === "0 wins") {
          setWon(0);
          stopPush();
          handleWin();
         
        } else if (result === "1 wins") {
          // alert(" 1 wins");
          setWon(1);
          stopPush();
          handleWin();
         

          // Trigger confetti on win
        }
        }

        // PUT/PATCH: Pop the last card and replace it with the updated one
        if (method === "PUT") {
          // PUT: Pop the last card and log it
          if (section_id === 0) {
            setSection0Cards((prev) => {
              const updatedCards = [...prev];
              const poppedCard = updatedCards.pop();
              updatedCards.push(value); // Push the new card
              console.log("Popped from section0Cards: ", poppedCard); // Log the popped card
              return updatedCards;
            });
          } 
          else if (section_id === 1) {
            setSection1Cards((prev) => {
              const updatedCards = [...prev];
              const poppedCard = updatedCards.pop();
              updatedCards.push(value); // Push the new card

              console.log("Popped from section1Cards: ", poppedCard); // Log the popped card
              return updatedCards;
            });
          }
          const result = response.data.result;

        // Check the "result" field and give alerts accordingly
        if (result === "0 wins") {
          setWon(0);
          handleWin();
          stopPush();
        } else if (result === "1 wins") {
          // alert(" 1 wins");
          setWon(1);
          handleWin();
          stopPush();

          // Trigger confetti on win
        }
        }
      }
    } catch (error) {
      console.error("Error handling card operation:", error);
    }
  };
  return (
    <div className="min-h-screen bg-[#450A03] ">
            <WinnerModal show={showModal} onClose={handleCloseModal} winner={won} />

      <TopMenu fetchCardData={fetchCardData}
        cardValue={cardValue}
        setCardValue={setCardValue} />
      <div className="flex flex-col lg:flex-row justify-between p-2">
        <AndarBaharSection
          setSectionId={setSectionId}
          section0Cards={section0Cards}
          setSection0Cards={setSection0Cards}
          section1Cards={section1Cards}
          setSection1Cards={setSection1Cards}
          fetchCardData={fetchCardData} // Pass function down to AndarBaharSection

        />

        <ScoreAndJokerSection
          sectionId={sectionId}
          section0Cards={section0Cards}
          section1Cards={section1Cards}
        />
      </div>
    </div>
  );
};
const allPlayers = ["page1", "page2", "page3", "page4", "page5", "page6"];
const TopMenu = ({ fetchCardData }, ) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showBet, setShowBet] = useState(false);
  const [cardValue, setCardValue] = useState(""); // To store the card value from input

  const current_players = [
    "page1",
    "page2",
    "page3",
    "page4",
    "page5",
    "page6",
  ];
  const updateCard = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/myapp/api/update_last_card/"
      );
      if (response.data) {
        const updatedCard = response.data.value; // New card value
        const sectionId = response.data.section_id; // Section ID of the card to be updated

        // Update the last card in the respective section
        if (sectionId === 1) {
          setSection1Cards((prev) => {
            const updatedCards = [...prev];
            updatedCards[updatedCards.length - 1] = updatedCard; // Replace the last card
            return updatedCards;
          });
          revealCard(updatedCard, "section1"); // Optional: Trigger reveal animation
        } else if (sectionId === 0) {
          setSection0Cards((prev) => {
            const updatedCards = [...prev];
            updatedCards[updatedCards.length - 1] = updatedCard; // Replace the last card
            return updatedCards;
          });
          revealCard(updatedCard, "section0"); // Optional: Trigger reveal animation
        }

        console.log("Card updated successfully:", updatedCard);
      }
    } catch (error) {
      console.error("Error updating the card:", error);
    }
  };
  const [isPushing, setIsPushing] = useState(false); // To track the pushing status

  const startPush = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/myapp/api/start-push/",
        {
          method: "POST",
        }
      );
      const data = await response.json();
      if (data.message === "Pushing started.") {
        setIsPushing(true); // Update the state to indicate pushing has started
      }
    } catch (error) {
      console.error("Error starting the push:", error);
    }
  };

  const stopPush = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/myapp/api/stop-push/",
        {
          method: "POST",
        }
      );
      const data = await response.json();
      if (data.message === "Pushing stopped.") {
        setIsPushing(false); // Update the state to indicate pushing has stopped
      }
    } catch (error) {
      console.error("Error stopping the push:", error);
    }
  };
  const handleReset = async () => {
    // setRefreshKey((oldKey) => oldKey + 1);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/myapp/api/reset_collections/"
      );

      if (response.status === 200) {
        console.log("Reset successful:", response.data);
        alert("Collections have been reset!");

        // Emit an event indicating the API call was successful
        // apiEventEmitter.emit('apiCalled', { success: true, data: response.data });
      } else {
        console.log("Reset failed with status:", response.status);

        // Emit an event indicating the API call failed
        // apiEventEmitter.emit('apiCalled', { success: false, status: response.status });
      }

      // Optionally, if you have a function like refreshPage1(), you can call it here:
      // refreshPage1();
    } catch (error) {
      console.error("Error resetting collections:", error);

      // Emit an event indicating an error occurred during the API call
      // apiEventEmitter.emit('apiCalled', { success: false, error: error.message });
    }
    window.location.reload();
  };

  const [currentPlayers, setCurrentPlayers] = useState([]);

  useEffect(() => {
    // Fetch current players from the API
    const fetchCurrentPlayers = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/myapp/api/player-round/"
        );
        const data = await response.json();
        // console.log(data.currentPlayers);
        // Check if current players list is provided, else leave empty
        setCurrentPlayers(data.current_players);
        console.log(`current player:${currentPlayers}`);
      } catch (error) {
        console.error("Error fetching current players:", error);
      }
    };

    fetchCurrentPlayers();
  }, []);

  return (
    <div className="flex flex-col md:flex-row justify-between  bg-[url('./assets/wood.png')] shadow-lg border-2 border-yellow-600">
      {/* Left Section */}
      <div className="font-questrial p-4 rounded-lg shadow-lg text-left md:w-1/4 w-full relative">
        <img
          src={screw}
          alt="screw"
          className="absolute top-2 left-2 w-8 h-8"
        />
        <img
          src={screw}
          alt="screw"
          className="absolute top-2 right-2 w-8 h-8"
        />
        <div className="flex-col justify-center items-center">
          <div className="flex justify-center items-center">
            <img src={logo} alt="logo" className="h-14" />
          </div>
          <div className="text-xl text-center text-yellow-300">Table 1234</div>
        </div>
      </div>

      <div className="flex py-5 border px-5 gap-3 overflow-x-auto">
        {allPlayers.map((player, index) => (
          <img
            key={index}
            src={currentPlayers?.includes(player) ? whitehat : redhat}
            alt={currentPlayers?.includes(player) ? "white hat" : "red hat"}
            className="h-16"
          />
        ))}
      </div>

      {/* Right Section with Menu and Dropdown */}
      <div className="font-questrial p-4 rounded-lg shadow-lg text-left md:w-1/4 w-full relative">
        <img
          src={screw}
          alt="screw"
          className="absolute top-2 left-2 w-8 h-8"
        />
        <img
          src={screw}
          alt="screw"
          className="absolute top-2 right-2 w-8 h-8"
        />
        <div className="flex-col justify-center items-center relative">
          <div
            className="flex justify-center items-center cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img src={menu} alt="menu" className="h-20" />
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-[#971909] text-yellow-300 border-2 border-[#D6AB5D] shadow-lg p-2 gap-2">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-red-700"
                onClick={() => {
                  handleReset();
                  setShowDropdown(false);
                }}
              >
                Reset
              </button>

              <button
                className="block w-full text-left px-4 py-2 hover:bg-red-700"
                onClick={() => {
                  // handleSetBidValue();
                  setShowDropdown(false);
                }}
              >
                Set Bid Value
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-red-700"
                onClick={() => setShowPopup(true)}
              >
                Select Player
              </button>

              {/* Render Popup Conditionally */}
              {showPopup && (
                <PlayerSelectionPopup setShowPopup={setShowPopup} />
              )}
              <button
                onClick={() => setShowBet(true)}
                className="block w-full text-left px-4 py-2 hover:bg-red-700"
              >
                Change Bets
              </button>

              {showBet && <BetPopUp setShowBet={setShowBet} />}
              <button
                onClick={startPush}
                disabled={isPushing} // Disable the start button when pushing is active
                className={`block w-full text-left px-4 py-2 hover:bg-red-700 ${isPushing ? "opacity-50" : ""
                  }`}
              >
                Start Automatic Game
              </button>
              <button
              onClick={() => fetchCardData("PUT", cardValue)}  // Pass the cardValue to the updateCard function
              className="block w-full text-left px-4 py-2 hover:bg-red-700"
            >
              Update Card
            </button>            </div>
          )}
        </div>
      </div>
      <div className="font-questrial p-4 rounded-lg shadow-lg text-left md:w-1/4 w-full relative">

        <div className="flex justify-center items-center mt-3">
          <input
            type="text"
            value={cardValue}
            onChange={(e) => setCardValue(e.target.value)} // Update state on input change
            placeholder="Enter Card Value"
            className="p-2 border border-yellow-600 rounded-md"
          />
        </div>

        {showDropdown && (
          <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-[#971909] text-yellow-300 border-2 border-[#D6AB5D] shadow-lg p-2 gap-2">
           

            <button
              onClick={() => fetchCardData("PUT", cardValue)}  // Pass the cardValue to the updateCard function
              className="block w-full text-left px-4 py-2 hover:bg-red-700"
            >
              Update Card
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AndarBaharSection = ({
  setSectionId,
  section0Cards,
  setSection0Cards,
  section1Cards,
  setSection1Cards,
  fetchCardData, // Receive the fetchCardData function

}) => {
  // const [section0Cards, setSection0Cards] = useState([]);
  // const [section1Cards, setSection1Cards] = useState([]);
  const [revealedCards, setRevealedCards] = useState({});
  const [won, setWon] = useState(-1);
  const [isAutoFetching, setIsAutoFetching] = useState(true);





  useEffect(() => {
    if (isAutoFetching) {
      const interval = setInterval(() => {
        fetchCardData("POST");
      }, 5000);

      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [isAutoFetching]);
  const [showModal, setShowModal] = useState(false);

  const handleWin = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };
  const stopPush = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/myapp/api/stop-push/",
        {
          method: "POST",
        }
      );
      const data = await response.json();

    } catch (error) {
      console.error("Error stopping the push:", error);
    }
  };
  return (
    <div className="flex flex-col w-full lg:w-3/4 bg-[#971909] p-4 shadow-lg border-2 border-[#D6AB5D]">
      <WinnerModal show={showModal} onClose={handleCloseModal} winner={won} />
      <div className="flex relative h-1/2 justify-between p-4 border-b-4 border-yellow-600">
        <div className="text-white font-ramaraja text-6xl mt-10 font-bold mr-4">
          A
        </div>
        <div className="border-dashed border-2 border-yellow-600 rounded-lg w-full h-60 bg-[#450A0366] flex pl-32 items-center justify-left">
          {section0Cards.length > 0 &&
            section0Cards.map((card, index) => (
              <CardFlip
                key={index}
                index={index}
                frontImage={`./cards/${card}.png`}
                list={section0Cards}
                isRevealed={revealedCards[card] || false}
                frontContent={`Card ${card}`}
              />
            ))}
        </div>
      </div>

      <div className="flex h-1/2 justify-center p-4">
        <div className="text-white font-ramaraja text-6xl mt-10 font-bold mr-4">
          B
        </div>
        <div className="border-dashed border-2 border-yellow-600 rounded-lg w-full h-60 bg-[#450A0366] flex pl-32 items-center justify-left">
          {section1Cards.length > 0 &&
            section1Cards.map((card, index) => (
              <CardFlip
                key={index}
                index={index}
                frontImage={`./cards/${card}.png`}
                list={section1Cards}
                isRevealed={revealedCards[card] || false}
                frontContent={`Card ${card}`}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

const ScoreAndJokerSection = ({ sectionId, section0Cards, section1Cards }) => {
  const [jokerValue, setJokerValue] = useState(null);
  const { toggleReveal } = useFlip();

  // Function to fetch the joker value from the backend
  const fetchJokerValue = () => {
    axios
      .get("http://127.0.0.1:8000/myapp/api/get_joker_value/")
      .then((response) => {
        const { value } = response.data.data;

        // If the value is not empty, set the joker value
        if (value) {
          setJokerValue(value); // Example: "6H"
        } else {
          // Retry after a delay if value is empty
          setTimeout(fetchJokerValue, 500); // Retry every 3 seconds
        }
      })
      .catch((error) => {
        // console.error("Error fetching joker value:", error);
        // Retry after a delay in case of error
        setTimeout(fetchJokerValue, 500); // Retry every 3 seconds
      });
  };

  useEffect(() => {
    fetchJokerValue();
  }, []);
  return (
    <div className="flex flex-col justify-start w-full lg:w-1/4 ">
      {/* Score */}
      <div className="p-2">
        <div
          className={`flex justify-between items-center p-5 ${sectionId === 1 ? "bg-[#07740C]" : "bg-[#FFF8D6]"
            } text-black text-2xl font-bold mb-2`}
        >
          <div className="flex items-center space-x-2">
            <div className="w-12 h-16 overflow-clip">
              <img src={a} alt="a" className="w-16 " />
            </div>
            <span className="text-black text-5xl">{section0Cards.length}</span>
          </div>
        </div>
        <div
          className={`flex justify-between items-center p-5 ${sectionId === 0 ? "bg-[#07740C]" : "bg-[#FFF8D6]"
            } text-black text-2xl font-bold`}
        >
          <div className="flex items-center space-x-2">
            <div className="w-12 h-16 pt-1 overflow-clip">
              <img src={b} alt="b" className="w-16 " />
            </div>
            <span className="text-black text-5xl">{section1Cards.length}</span>
          </div>
        </div>
      </div>
      {/* Joker Section */}
      <div className="h-full bg-[#971909] p-4  shadow-lg border-2 border-[#D6AB5D]">
        <div className="text-white font-ramaraja text-5xl mt-5 font-bold text-center">
          JOKER
        </div>
        <div className="flex justify-center items-center">
          <div className="border-dashed border-2 flex justify-center items-center border-yellow-600 rounded-lg w-40 h-60 bg-[#450A0366] mt-4 ">
            {jokerValue ? (
              <img
                src={`./cards/${jokerValue}.png`} // Dynamically update the joker image
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
      </div>

    </div>
  );
};

export default AndarBaharPage;
