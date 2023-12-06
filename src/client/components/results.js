/* Copyright G. Hemingway, @2023 - All rights reserved */
"use strict";

import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import PropTypes from "prop-types";
import { ErrorMessage, InfoBlock, InfoData, InfoLabels } from "./shared.js";


const formatDate = (date) => {
  if (!date) {
    return "--";
  }

  const month = date.toLocaleString("default", { month: "short" });
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${month} ${day} ${hours}:${minutes}:${seconds}`;
};

const Move = ({ move, index }) => {
  const cards = move.cards.map((card) => `${card.value} of ${card.suit}`);
  const cardsStr = cards.join(", ");

  const timePlayed = formatDate(new Date(move.date));
  

  return (
    <tr>
      <th>{move.id ? move.id : index + 1}</th>
      <th>{timePlayed}</th>
      <th>
        <Link to={`/profile/${move.user}`}>{move.user}</Link>
      </th>
      <th>{`${cardsStr} from ${move.src} to ${move.dest}`}</th>
    </tr>
  );
};

Move.propTypes = {
  move: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

const MovesListTable = styled.table`
  width: 90%;
  min-height: 4em;
  border: 1px solid black;
  text-align: center;
  @media (max-width: 499px) {
    & > tbody > tr > td:nth-of-type(2),
    & > thead > tr > th:nth-of-type(2) {
      display: none;
    }
  }
`;


const MovesList = ({ moves }) => {
  let moveElements = moves.map((move, index) => (
    <Move key={index} move={move} index={index} />
  ));
  return (
    <MovesListTable>
      <thead>
        <tr>
          <th>Id</th>
          <th>Time Moved</th>
          <th>Player</th>
          <th>Move Details</th>
        </tr>
      </thead>
      <tbody>{moveElements}</tbody>
    </MovesListTable>
  );
};

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const GameDetail = ({ start, moves, score, cards_remaining,won, active }) => {
  const duration = start ? (Date.now() - start) / 1000 : "--";
  return (
    <InfoBlock style={containerStyle}>
      <InfoLabels>
        <p>Duration:</p>
        <p>Number of Moves:</p>
        <p>Points:</p>
        <p>Cards Remaining:</p>
        <p>Game Status:</p>
      </InfoLabels>
      <InfoData>
        <p>{duration} seconds</p>
        <p>{moves.length}</p>
        <p>{score}</p>
        <p>{cards_remaining}</p>
        <p>{active ? "Active" : won? "Won" : "No Move Moves"}</p>
      </InfoData>
    </InfoBlock>
  );
};

GameDetail.propTypes = {
  start: PropTypes.number.isRequired,
  moves: PropTypes.array.isRequired,
  score: PropTypes.number.isRequired,
  cards_remaining: PropTypes.number.isRequired,
  active: PropTypes.bool.isRequired,
  won: PropTypes.bool.isRequired,
};

const ResultsBase = styled.div`
  grid-area: main;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;


export const Results = () => {
  const { id } = useParams();
  // Initialize the state
  let [game, setGame] = useState({
    owner: null,
    start: Date.now(),
    end: null,
    state: null,
    game: null,
    active: false,
    color: null,
    drawCount: null,
    score: 0,
    won: false,
    moves: [],
    cards_remaining: 52,
    num_moves: 0,
  });
  let [error, setError] = useState("");
  // Fetch data on load
  useEffect(() => {
    fetch(`/v1/game/${id}?moves`)
      .then((res) => res.json())
      .then((data) => {
        setGame({
            owner: data.owner,
            start: data.start,
            end: data.end,
            state: data.state,
            game: data.game,
            active: data.active,
            color: data.color,
            drawCount: data.drawCount,
            score: data.score,
            won: data.won,
            moves: data.move_details,
            cards_remaining: data.cards_remaining,
            num_moves: data.num_moves,
          });
        })
      .catch((err) => console.log(err));
  }, [id]);

  return (
    <ResultsBase>
      <ErrorMessage msg={error} hide={true} />
      <h2 style={{textAlign:"center"}}>Game Detail</h2>
      <GameDetail {...game} />
      <MovesList moves={game.moves} />
    </ResultsBase>
  );
};
