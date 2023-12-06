/* Copyright G. Hemingway, @2023 - All rights reserved */
"use strict";

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  ErrorMessage,
  FormBase,
  FormLabel,
  FormInput,
  FormButton,
} from "./shared.js";

const ImageButton = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Login = (props) => {
  let navigate = useNavigate();
  let [username, setUser] = useState("");
  let [password, setPass] = useState("");
  let [error, setError] = useState("");

  const onSubmitGH = async (ev) => {
    ev.preventDefault();
    let res = await fetch("/loginGH");
    const data = await res.json();
    if (res.ok) {
      window.location.href = (data.ghPath);
    } else {
      setError(`Error: ${data.error}`);
    }
  }

  const onSubmit = async (ev) => {
    ev.preventDefault();
    let res = await fetch("/v1/session", {
      body: JSON.stringify({
        username,
        password,
      }),
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
    });
    const data = await res.json();
    if (res.ok) {
      props.logIn(data.username);
      navigate(`/profile/${data.username}`);
    } else {
      setError(`Error: ${data.error}`);
    }
  };

  useEffect(() => {
    document.getElementById("username").focus();
  }, []);

  return (
    <div style={{ gridArea: "main" }}>
      <ErrorMessage msg={error} />
      <FormBase>
        <FormLabel htmlFor="username">Username:</FormLabel>
        <FormInput
          id="username"
          name="username"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(ev) => setUser(ev.target.value.toLowerCase())}
        />
        <FormLabel htmlFor="password">Password:</FormLabel>
        <FormInput
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(ev) => setPass(ev.target.value)}
        />
        <div />
        <FormButton id="submitBtn" onClick={onSubmit}>
          Login
        </FormButton>
        <div />
        <FormButton id="loginGithub" onClick={onSubmitGH}>
          <ImageButton>
            Login with Github{" "}
            <img
              src="/images/githubicon.png"
              alt="GitHub Icon"
              style={{ marginLeft: "0.5em", width: "10%", height: "80%" }}
            />
          </ImageButton>
        </FormButton>
      </FormBase>
    </div>
  );
};

Login.propTypes = {
  logIn: PropTypes.func.isRequired,
};
