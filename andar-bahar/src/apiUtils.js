import axios from "axios";

export const fetchCardData = async (method) => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/myapp/api/assign_card_to_player/");
      if (response.data) {
        const newCard = response.data.value;
        const sectionId = response.data.section_id;
if (method=="POST"){
  console.log("post method");
  if (sectionId === 0) {
    setSection0Cards((prev) => [...prev, newCard]);
    revealCard(newCard, "section0");
  } else if (sectionId === 1) {
    setSection1Cards((prev) => [...prev, newCard]);
    revealCard(newCard, "section1");
  }
}
else if (method=="PUT"){
  console.log("put method");

sectionId= (sectionId-1)%2;
if (sectionId === 0) {
  setSection0Cards((prev) => {
    const updatedCards = [...prev];
    const poppedCard = updatedCards.pop();
    // updatedCards.push(value); // Push the new card
    console.log("Popped from section0Cards: ", poppedCard); // Log the popped card
    return updatedCards;
  });
} 
else if (sectionId === 1) {
  setSection1Cards((prev) => {
    const updatedCards = [...prev];
    const poppedCard = updatedCards.pop();
    // updatedCards.push(value); // Push the new card

    console.log("Popped from section1Cards: ", poppedCard); // Log the popped card
    return updatedCards;
  });
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