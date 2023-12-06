/* Copyright G. Hemingway, @2023 - All rights reserved */
"use strict";

import React, { Fragment, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import { GameList } from "./game-list.js";
import {
  ErrorMessage,
  InfoBlock,
  InfoData,
  InfoLabels,
  ShortP,
  FormInput
} from "./shared.js";

const ProfileBlockBase = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto;
  grid-template-areas: "pic" "profile";
  padding: 1em;

  @media (min-width: 500px) {
    grid-template-columns: auto 1fr;
    grid-template-areas: "pic profile";
    padding: 2em;
  }
`;

const ProfileImage = styled.img`
  grid-area: pic;
  max-width: 150px;
  padding: 1em;
  @media (min-width: 500px) {
    padding: 0.5em;
    max-width: 200px;
  }
`;

const ProfileBlock = ({props, editOn, update}) => {
  return (
    <ProfileBlockBase>
      <ProfileImage src={props.avatar} />
      <InfoBlock style={{marginTop:"1em", marginLeft:"2em"}}>
        <InfoLabels>
          <p>Username:</p>
          <p>First Name:</p>
          <p>Last Name:</p>
          <p>City:</p>
          <p>Email Address:</p>
        </InfoLabels>
        <InfoData>
          <ShortP>{props.username}</ShortP>
          {editOn ?  <div style={{display:"flex",flexDirection:"column"}}><FormInput
            id="first_name"
            name="first_name"
            type="text"
            placeholder={props.first_name ? props.first_name : "-"}
            value={props.first_name}
            onChange={(ev) => update({...props, first_name: ev.target.value})}
          />
          <FormInput
            id="last_name"
            name="last_name"
            type="text"
            placeholder={props.last_name ? props.last_name : "-"}
            value={props.last_name}
            onChange={(ev) => update({...props, last_name: ev.target.value})}
          />
          <FormInput
            id="city"
            name="city"
            type="city"
            placeholder={props.city ? props.city : "-"}
            value={props.city}
            onChange={(ev) => update({...props, city: ev.target.value})}
          /> </div>:
            <Fragment>
              <ShortP>{props.first_name ? props.first_name : "-"}</ShortP>
              <ShortP>{props.last_name ? props.last_name : "-"}</ShortP>
              <ShortP>{props.city ? props.city : "-"}</ShortP>
            </Fragment>
          }
          <ShortP>{props.primary_email == "no@email.com"?"-":props.primary_email}</ShortP>
        </InfoData>
      </InfoBlock>
    </ProfileBlockBase>
  );
};


const EditLinkBase = styled.div`
  position: absolute;
  top: 10em;
  display: flex;
  flex-direction: column;
  & > a {
    text-decoration: none;
    color: #002266;
  }
  @media (min-width: 500px) {
    display: inherit;
  }
`;

const EditButton = styled.button`
  margin-top: 1em;
  max-width: 150px;
  min-width: 50px;
  max-height: 2em;
  background: #002266;
  color: #fff;
  border: none;
  border-radius: 5px;
  line-height: 2em;
  font-size: 0.8em;
  &:hover {
    background: lightblue;
    color: #fff;
  }
`;

const EditLink = ({ text, onFunc }) => {
  return (
    <EditLinkBase>
      {text.map((item, index) => (
        <EditButton
          key={index}
          style={{ marginLeft: "1em"}}
          onClick={onFunc[index]}
        >
          {item}
        </EditButton>
      ))}
    </EditLinkBase>
  );
};

const ProfileBase = styled.div`
  grid-area: main;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const Profile = (props) => {
  const { username } = useParams();
  let [state, setState] = useState({
    username: "",
    first_name: "",
    last_name: "",
    primary_email: "",
    city: "",
    games: [],
    error: "",
  });
  let [editOn, setEditOn] = useState(false);

  const fetchUser = (username) => {
    fetch(`/v1/user/${username}`)
      .then((res) => res.json())
      .then((data) => {
        setState(data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchUser(username);
  }, [username]);

  const onClick = () => {
    setEditOn(true);
  }

  const onCancel = () => {
    fetchUser(username);
    setEditOn(false);
  }

  const onSave = () => {
    fetch(`/v1/user`, {
      body: JSON.stringify({
        first_name: state.first_name,
        last_name: state.last_name,
        city: state.city,
      }),
      method: "PUT",
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
    }).then((res) => {
      if (res.ok) {
        setEditOn(false);
        fetchUser(username);
      } else {
          setState({ ...state, error: res.statusText });
      }
    });
  }

  // Is the logged-in user viewing their own profile
  const isUser = state.username === props.currentUser;
  return (
    <Fragment>
      {isUser && editOn ? (
        <EditLink text={["Save Edit", "Cancel"]} onFunc={[onSave, onCancel]} />
      ) : (
        isUser && (
          <EditLink text={["Edit Profile"]} onFunc={[onClick]} />
        )
      )}
      <ProfileBase>
        <ErrorMessage msg={state.error} hide={true} />
        <ProfileBlock props={state} editOn={editOn} update={setState} />
        <GameList toCreateGame={isUser} games={state.games} />
      </ProfileBase>
    </Fragment>
  );
};

Profile.propTypes = {
  gridPlacement: PropTypes.string,
  user: PropTypes.string,
};
