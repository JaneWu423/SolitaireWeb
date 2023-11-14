/* Copyright G. Hemingway, @2023 - All rights reserved */
"use strict";

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Pile } from "./pile.js";
import { set } from "../../server/models/card_state.cjs";

const CardRow = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 2em;
`;

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
  let [target, setTarget] = useState(undefined);
  let [drawcnt, setDrawcnt] = useState(1);
  let [won, setWon] = useState(null);
  let [startDrag, setStartDrag] = useState({ x: 0, y: 0 });

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
    };
    getGameState();
  }, [id]);

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
      console.log("deselect");
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        deselect();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [target]);

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
        } else if(response.status === 201){
          setWon("Game Won!")
          console.log("Game Won!")
        }
        else {
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
  const onClick = (ev, card, pile) => {
    ev.stopPropagation();
    if (card.up && pile !== "draw") {
      if (target) {
        if (target.pile !== pile && pile !== "discard") {
          console.log("destination: ", pile);
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
        console.log("select", card);
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
      console.log(move, state.discard.length, drawcnt);
      updateView(move);
      setTarget(undefined);
    } else {
      deselect();
      console.log("deselect");
    }
  };

  const onClickPile = (ev, pile) => {
    if (pile !== "discard" && pile !== "draw") {
      ev.stopPropagation();
      if (target) {
        console.log("destination: ", pile);
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

  return (
    <GameBase onClick={deselect}>
      <CardRow>
        <Pile
          cards={state.stack1}
          spacing={0}
          onClick={onClick}
          pile={"stack1"}
          onClickPile={onClickPile}
        />
        <Pile
          cards={state.stack2}
          spacing={0}
          onClick={onClick}
          pile={"stack2"}
          onClickPile={onClickPile}
        />
        <Pile
          cards={state.stack3}
          spacing={0}
          onClick={onClick}
          pile={"stack3"}
          onClickPile={onClickPile}
        />
        <Pile
          cards={state.stack4}
          spacing={0}
          onClick={onClick}
          pile={"stack4"}
          onClickPile={onClickPile}
        />
        <CardRowGap />
        <Pile
          cards={state.draw}
          spacing={0}
          onClick={onClick}
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
          spacing={15}
          horizontal={true}
          pile={"discard"}
          onClickPile={onClickPile}
        />
      </CardRow>
      <CardRow>
        <Pile
          cards={state.pile1}
          onClick={onClick}
          pile={"pile1"}
          onClickPile={onClickPile}
        />
        <Pile
          cards={state.pile2}
          onClick={onClick}
          pile={"pile2"}
          onClickPile={onClickPile}
        />
        <Pile
          cards={state.pile3}
          onClick={onClick}
          pile={"pile3"}
          onClickPile={onClickPile}
        />
        <Pile
          cards={state.pile4}
          onClick={onClick}
          pile={"pile4"}
          onClickPile={onClickPile}
        />
        <Pile
          cards={state.pile5}
          onClick={onClick}
          pile={"pile5"}
          onClickPile={onClickPile}
        />
        <Pile
          cards={state.pile6}
          onClick={onClick}
          pile={"pile6"}
          onClickPile={onClickPile}
        />
        <Pile
          cards={state.pile7}
          onClick={onClick}
          pile={"pile7"}
          onClickPile={onClickPile}
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
