/* Copyright G. Hemingway, @2023 - All rights reserved */
"use strict";

import React from "react";
import styled from "styled-components";

const LandingBase = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  grid-area: main;
`;

export const Landing = () => (
  <LandingBase>
    <h1 style={{ color: "#002266" }}>This is my Solitaire game!</h1>
    <h3 style={{ color: "lightblue" }}>Task completed:</h3>
    <ul style={{ color: "#002266" }}>
      <li>Highlight selection & Draggable</li>
      <li>Enable modification of a user's profile</li>
      <li>Fully working "results" page</li>
      <li>
        each move is click-able and renders the state of the game after this
        move
      </li>
      <li>Register and log in via Github.</li>
      <li>Autocomplete button</li>
      <li>Recognize end of game</li>
    </ul>
  </LandingBase>
);