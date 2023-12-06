/* Copyright G. Hemingway, @2023 - All rights reserved */
"use strict";

import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const ErrorBase = styled.div`
  grid-column: 1 / 3;
  color: red;
  display: flex;
  justify-content: center;
  padding: 1em;
  min-height: 1.2em;
`;

export const ErrorMessage = ({ msg = "", hide = false }) => {
  return (
    <ErrorBase style={{ display: hide ? "none" : "inherit" }}>{msg}</ErrorBase>
  );
};

ErrorMessage.propTypes = {
  msg: PropTypes.string,
  hide: PropTypes.bool,
};

const NotifyBase = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const NotifyBox = styled.div`
  padding: 2em;
  border: 1px solid #000;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #fff;
`;

export const ModalNotify = ({ msg = "", onAccept, ...props }) => {
  return (
    <NotifyBase {...props}>
      <NotifyBox>
        <p>{msg}</p>
        {onAccept ? <FormButton onClick={onAccept}>Ok</FormButton> : null}
      </NotifyBox>
    </NotifyBase>
  );
};

export const FormBase = styled.form`
  display: grid;
  grid-template-columns: 35% 70%;
  grid-auto-rows: minmax(10px, auto);
  padding: 0.1em;
  @media (min-width: 500px) {
    padding: 1em;
  }
`;

export const FormLabel = styled.label`
  padding: 0.5em 0.5em;
  text-align: right;
  font-weight: bold;
`;

export const FormInput = styled.input`
  margin: 0.5em 0;
  width: 40%;
  padding-left: 5px;
`;

export const FormButton = styled.button`
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

export const FormSelect = styled.select`
  font-size: 1em;
`;

export const FormHeader = styled.h2`
  grid-column: 1 / 3;
`;

export const InfoBlock = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto;
  grid-template-areas: "labels info";
`;

export const InfoData = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  & > p {
    margin: 0.5em 0.25em;
  }
`;

export const InfoLabels = styled(InfoData)`
  align-items: flex-end;
  font-weight: bold;
`;

export const ShortP = styled.p`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const FormButtonR = styled(FormButton)`
  background-color: lightblue;
  &:hover {
    background-color: #00bfff;
  }
`;

const ImageButton = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const GitHubButton = () => {
  const onSubmitGH = async (ev) => {
    ev.preventDefault();
    let res = await fetch("/loginGH");
    const data = await res.json();
    if (res.ok) {
      window.location.href = data.ghPath;
    } else {
      setError(`Error: ${data.error}`);
    }
  };
  return (
    <FormButtonR id="loginGithub" onClick={onSubmitGH}>
      <ImageButton>
        Login with Github
        <img
          src="/images/githubicon.png"
          alt="GitHub Icon"
          style={{ marginLeft: "1em", width: "10%", height: "80%" }}
        />
      </ImageButton>
    </FormButtonR>
  );
};
