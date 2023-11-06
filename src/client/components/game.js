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

const CardRowGap = styled.div`
  flex-grow: 2;
`;

const GameBase = styled.div`
  grid-row: 2;
  grid-column: sb / main;
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
  // let [target, setTarget] = useState(undefined);
  // let [startDrag, setStartDrag] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const getGameState = async () => {
      const response = await fetch(`/v1/game/${id}`);
      const data = await response.json();
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

  const onClick = (ev) => {
    let target = ev.target;
    console.log(target.id);
  };

  return (
    <GameBase>
      <CardRow>
        <Pile cards={state.stack1} spacing={0} onClick={onClick} />
        <Pile cards={state.stack2} spacing={0} onClick={onClick} />
        <Pile cards={state.stack3} spacing={0} onClick={onClick} />
        <Pile cards={state.stack4} spacing={0} onClick={onClick} />
        <CardRowGap />
        <Pile cards={state.draw} spacing={0} onClick={onClick} />
        <Pile cards={state.discard} spacing={0} onClick={onClick} />
      </CardRow>
      <CardRow>
        <Pile cards={state.pile1} onClick={onClick} />
        <Pile cards={state.pile2} onClick={onClick} />
        <Pile cards={state.pile3} onClick={onClick} />
        <Pile cards={state.pile4} onClick={onClick} />
        <Pile cards={state.pile5} onClick={onClick} />
        <Pile cards={state.pile6} onClick={onClick} />
        <Pile cards={state.pile7} onClick={onClick} />
      </CardRow>
    </GameBase>
  );
};

Game.propTypes = {};
