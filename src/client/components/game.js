/* Copyright G. Hemingway, @2023 - All rights reserved */
"use strict";

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Pile } from "./pile.js";

const CardRow = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 2em;
`;

// changed to 0.5 so draw 3 fits on screen
const CardRowGap = styled.div`
  flex-grow: 0.5;
`;

const GameBase = styled.div`
  grid-row: 2;
  grid-column: sb / main;
  width: 100vw;
  height: 100vh;
`;

export const Game = () => {
  const { id } = useParams();
  let [state, setState] = useState({
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
  // record what cards are selected
  let [target, setTarget] = useState(undefined);
  // record how many cards should be drawn
  let [drawcnt, setDrawcnt] = useState(1);
  // record if game is won
  let [won, setWon] = useState(null);
  // let [startDrag, setStartDrag] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const getGameState = async () => {
      const response = await fetch(`/v1/game/${id}`);
      const data = await response.json();
      setDrawcnt(data.drawCount);
      setState({
        pile1: data.pile1,
        pile2: data.pile2,
        pile3: data.pile3,
        pile4: data.pile4,
        pile5: data.pile5,
        pile6: data.pile6,
        pile7: data.pile7,
        stack1: data.stack1,
        stack2: data.stack2,
        stack3: data.stack3,
        stack4: data.stack4,
        draw: data.draw,
        discard: data.discard,
      });
      if(data.won){
        console.log("Game Won!")
        setWon("Game Won!");
      }
    };
    getGameState();
  }, [id]);

  // deselect all cards
  const deselect = () => {
    if (target) {
      setState({
        ...state,
        [target.pile]: state[target.pile].map((card) => {
          card.select = false;
          return card;
        }),
      });
      setTarget(undefined);
    }
  };

  // add event listener for escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        console.log("deselect");
        deselect();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [target]);

  // update game state
  const updateView = (move) => {
    fetch(`/v1/game/${id}`, {
      method: "PUT",
      body: JSON.stringify(move),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 400) {
            console.log("Invalid move");
          } else {
            console.log(`Error: ${response.status} - ${response.statusText}`);
          }
        } else {
          if (response.status === 201) {
            setWon("Game Won!");
            console.log("Game Won!");
          }
          response.json().then((data) => {
            setState({
              pile1: data.pile1,
              pile2: data.pile2,
              pile3: data.pile3,
              pile4: data.pile4,
              pile5: data.pile5,
              pile6: data.pile6,
              pile7: data.pile7,
              stack1: data.stack1,
              stack2: data.stack2,
              stack3: data.stack3,
              stack4: data.stack4,
              draw: data.draw,
              discard: data.discard,
            });
          });
        }
      })
      .catch((err) => {
        console.log("Ajax error: ", err);
      });
  };

  // handle drag start
  const onDragStart = (ev, card, pile) => {
    deselect();
    if (pile === "draw") {
      return;
    }
    if (card.up && pile !== "draw") {
      const idx = state[pile].indexOf(card);
      const cards =
        pile == "discard" ? state.discard.slice(-1) : state[pile].slice(idx);
      const updatedPile = state[pile].map((card) =>
        cards.includes(card) ? { ...card, select: true } : card
      );
      setState({ ...state, [pile]: updatedPile });
      setTarget({ cards: cards, pile: pile });
    } else {
      deselect();
      console.log("deselect");
    }
  };

  // handle drop
  const onDrop = (ev, card, pile) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (card.up && pile !== "draw") {
      if (target) {
        if (target.pile !== pile && pile !== "discard") {
          const updatedState = {
            ...state,
            [target.pile]: state[target.pile].map(
              ({ select, ...rest }) => rest
            ),
          };
          setState(updatedState);
          const move = {
            cards: target.cards,
            src: target.pile,
            dest: pile,
          };
          console.log(move);
          updateView(move);
        }
      }
    }
    deselect();
  };

  // handle drag over
  const onDragOver = (ev) => {
    ev.preventDefault();
  };

  // handle click
  const onClick = (ev, card, pile) => {
    ev.stopPropagation();
    if (card.up && pile !== "draw") {
      if (target) {
        if (target.pile !== pile && pile !== "discard") {
          const updatedState = {
            ...state,
            [target.pile]: state[target.pile].map(
              ({ select, ...rest }) => rest
            ),
          };
          setState(updatedState);
          const move = {
            cards: target.cards,
            src: target.pile,
            dest: pile,
          };
          console.log(move);
          updateView(move);
        }
        deselect();
      } else {
        const idx = state[pile].indexOf(card);
        const cards =
          pile == "discard" ? state.discard.slice(-1) : state[pile].slice(idx);
        const updatedPile = state[pile].map((card) =>
          cards.includes(card) ? { ...card, select: true } : card
        );
        setState({ ...state, [pile]: updatedPile });
        setTarget({ cards: cards, pile: pile });
      }
    } else if (pile === "draw") {
      deselect();
      const idx =
        drawcnt === 3
          ? state.draw.length - 3 < 0
            ? 0
            : state.draw.length - 3
          : -1;
      const move = {
        cards: state.draw.slice(idx),
        src: "draw",
        dest: "discard",
      };
      console.log(`draw ${drawcnt}`, move);
      updateView(move);
      setTarget(undefined);
    } else {
      deselect();
      console.log("deselect");
    }
  };

  // handle click on empty pile
  const onClickPile = (ev, pile) => {
    ev.stopPropagation();
    if (pile !== "discard" && pile !== "draw") {
      if (target) {
        const updatedState = {
          ...state,
          [target.pile]: state[target.pile].map(({ select, ...rest }) => rest),
        };
        setState(updatedState);
        const move = {
          cards: target.cards,
          src: target.pile,
          dest: pile,
        };
        console.log(move);
        updateView(move);
        deselect();
      }
    } else if (pile === "draw") {
      deselect();
      const move = {
        cards: [],
        src: "draw",
        dest: "discard",
      };
      console.log("reset draw");
      updateView(move);
    } else {
      deselect();
    }
  };

  // handle drop on empty pile
  const onDropPile = (ev, pile) => {
    ev.preventDefault();
    if (pile !== "discard" && pile !== "draw") {
      if (target) {
        const updatedState = {
          ...state,
          [target.pile]: state[target.pile].map(({ select, ...rest }) => rest),
        };
        setState(updatedState);
        const move = {
          cards: target.cards,
          src: target.pile,
          dest: pile,
        };
        console.log(move);
        updateView(move);
      }
    }
    deselect();
  };

  // render the game
  return (
    <GameBase onClick={deselect} onDragOver={onDragOver} onDrop={deselect}>
      <CardRow>
        <Pile
          cards={state.stack1}
          spacing={0}
          onClick={onClick}
          onClickPile={onClickPile}
          onDragStart={onDragStart}
          pile={"stack1"}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDropPile={onDropPile}
        />
        <Pile
          cards={state.stack2}
          spacing={0}
          onClick={onClick}
          onClickPile={onClickPile}
          onDragStart={onDragStart}
          pile={"stack2"}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDropPile={onDropPile}
        />
        <Pile
          cards={state.stack3}
          spacing={0}
          onClick={onClick}
          onClickPile={onClickPile}
          onDragStart={onDragStart}
          pile={"stack3"}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDropPile={onDropPile}
        />
        <Pile
          cards={state.stack4}
          spacing={0}
          onClick={onClick}
          onClickPile={onClickPile}
          onDragStart={onDragStart}
          pile={"stack4"}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDropPile={onDropPile}
        />
        <CardRowGap />
        <Pile
          cards={state.draw}
          spacing={0}
          onClick={onClick}
          onDragStart={onDragStart}
          onDrop={onDrop}
          onDragOver={onDragOver}
          pile={"draw"}
          onClickPile={onClickPile}
        />
        <Pile
          cards={
            state.discard.length > drawcnt
              ? state.discard.slice(-drawcnt)
              : state.discard
          }
          onClick={onClick}
          onDragStart={onDragStart}
          onDrop={onDrop}
          onDragOver={onDragOver}
          spacing={15}
          horizontal={true}
          pile={"discard"}
        />
      </CardRow>
      <CardRow>
        <Pile
          cards={state.pile1}
          onDragStart={onDragStart}
          onClick={onClick}
          onClickPile={onClickPile}
          pile={"pile1"}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDropPile={onDropPile}
        />
        <Pile
          cards={state.pile2}
          onDragStart={onDragStart}
          onClick={onClick}
          onClickPile={onClickPile}
          pile={"pile2"}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDropPile={onDropPile}
        />
        <Pile
          cards={state.pile3}
          onDragStart={onDragStart}
          onClick={onClick}
          onClickPile={onClickPile}
          pile={"pile3"}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDropPile={onDropPile}
        />
        <Pile
          cards={state.pile4}
          onDragStart={onDragStart}
          onClick={onClick}
          onClickPile={onClickPile}
          pile={"pile4"}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDropPile={onDropPile}
        />
        <Pile
          cards={state.pile5}
          onDragStart={onDragStart}
          onClick={onClick}
          onClickPile={onClickPile}
          pile={"pile5"}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDropPile={onDropPile}
        />
        <Pile
          cards={state.pile6}
          onDragStart={onDragStart}
          pile={"pile6"}
          onClick={onClick}
          onClickPile={onClickPile}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDropPile={onDropPile}
        />
        <Pile
          cards={state.pile7}
          onDragStart={onDragStart}
          pile={"pile7"}
          onClick={onClick}
          onClickPile={onClickPile}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDropPile={onDropPile}
        />
      </CardRow>
      {won ? (
        <div
          style={{
            position: "absolute",
            left: "40%",
          }}
        >
          <h1 style={{ color: "red" }}>{won}</h1>
        </div>
      ) : null}
    </GameBase>
  );
};

Game.propTypes = {};