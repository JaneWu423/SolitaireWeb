"use strict";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { FormButton } from "./shared.js";

const GameBase = styled.div`
  grid-row: 2;
  grid-column: sb / main;
  width: 100vw;
  height: 100vh;
`;
const HolderStyle = styled.div`
  position: relative;
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 2em;
`;

const CardHoldStyle = styled.div`
  position: relative;
  margin: 5px;
  border: 2px dashed rgb(128, 128, 128);
  border-radius: 5px;
  width: 12%;
  aspect-ratio: 7/10;
`;
const CardHoldBlock = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`;
const Card = styled.img`
  position: absolute;
  height: auto;
  height: 100%;
`;

const CardHold = () => {
  return (
    <CardHoldStyle>
      <CardHoldBlock></CardHoldBlock>
    </CardHoldStyle>
  );
};

const PlaceCard = ({ cards, offset }) => {
  if (!cards) return <CardHold />;
  const cardBlocks = cards.map((card, index) => {
    const imagePath = card.up
      ? `/images/${card.value}_of_${card.suit}.png`
      : "/images/face_down.jpg";

    return (
      <Card
        style={offset ? { top: `${index * 8}%` } : {}}
        key={index}
        id={`${card.suit}:${card.value}`}
        src={imagePath}
      />
    );
  });
  return <CardHoldStyle>{cardBlocks}</CardHoldStyle>;
};

const CardHoldRow = ({ cards }) => {
  return (
    <HolderStyle>
      {Array.from({ length: 4 }, (_, index) => (
        <PlaceCard
          key={index}
          cards={cards[`stack${index + 1}`]}
          offset={false}
        />
      ))}
      <CardHoldStyle
        style={{
          border: "transparent",
          marginRight: "2em",
        }}
      ></CardHoldStyle>
      <PlaceCard cards={cards.draw} offset={false} />
      <PlaceCard cards={cards.discard} offset={false} />
    </HolderStyle>
  );
};
const CardPlayRow = ({ cards }) => {
  return (
    <HolderStyle>
      {Array.from({ length: 7 }, (_, index) => (
        <PlaceCard
          key={index}
          cards={cards[`pile${index + 1}`]}
          offset={true}
        />
      ))}
    </HolderStyle>
  );
};

// page for displaying each move, not clickable
export const Move = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState({
    pile1: [],
    pile2: [],
    pile3: [],
    pile4: [],
    pile5: [],
    pile6: [],
    pile7: [],
    stack1: [],
    stack2: [],
    stack3: [],
    stack4: [],
    draw: [],
    discard: [],
  });

  useEffect(() => {
    fetch(`/v1/moves/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCards(data.state);
      })
      .catch((err) => console.log(err));
  }, []);

  const goBack = () => {
    navigate(-1);
  };
  return (
    <GameBase>
      <CardHoldRow cards={cards} />
      <CardPlayRow cards={cards} />
      <FormButton
        style={{
          position: "absolute",
          marginTop:"2em",
          left: "50%",
        }}
        onClick={goBack}
      >
        Back to Results
      </FormButton>
    </GameBase>
  );
};
