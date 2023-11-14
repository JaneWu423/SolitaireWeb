/* Copyright G. Hemingway, @2023 - All rights reserved */
"use strict";

import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const CardImg = styled.img`
  position: absolute;
  height: auto;
  width: 100%;
`;

export const Card = ({ card, top, left, onClick, pile }) => {
  const source = card.up
    ? `/images/${card.value}_of_${card.suit}.png`
    : "/images/face_down.jpg";
  const style = card.select
    ? {
        left: `${left}%`,
        top: `${top}%`,
        border: "solid 2px yellow",
        borderRadius: "5px"
      }
    : { left: `${left}%`, top: `${top}%` };
  const id = `${card.suit}:${card.value}`;
  return <CardImg id={id} onClick={(ev) => onClick(ev, card, pile)} style={style} src={source} />;
};

const PileBase = styled.div`
  margin: 5px;
  position: relative;
  display: inline-block;
  border: dashed 2px #808080;
  border-radius: 5px;
  width: 12%;
`;

const PileFrame = styled.div`
  margin-top: 140%;
`;

export const Pile = ({ cards, spacing, horizontal, onClick, pile, onClickPile }) => {
  const children = cards.map((card, i) => {
    const top = horizontal ? 0 : i * spacing;
    const left = horizontal ? i * spacing : 0;
    return (
      <Card
        key={i}
        card={card}
        top={top}
        left={left}
        pile={pile}
        onClick={onClick}
      />
    );
  });
  return (
    <PileBase
      onClick={children.length === 0 ? (ev) => onClickPile(ev, pile) : null}
    >
      <PileFrame />
      {children}
    </PileBase>
  );
};

Pile.propTypes = {
  cards: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClick: PropTypes.func,
  horizontal: PropTypes.bool,
  spacing: PropTypes.number,
  maxCards: PropTypes.number,
  top: PropTypes.number,
  left: PropTypes.number,
};
Pile.defaultProps = {
  horizontal: false, // Layout horizontal?
  spacing: 8, // In percent,
  cards: [],
};
