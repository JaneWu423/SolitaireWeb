/* Copyright G. Hemingway, @2023 - All rights reserved */
"use strict";

import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom";

export const Handle = (props) => {
  let navigate = useNavigate();
  const { username } = useParams();
  useEffect(() => {
    if (username) {
      props.logIn(username);
      navigate(`/profile/${username}`);
    } else {
      return <h1>Error Login with Github SSO</h1>;
    }
  },[]);
};

Handle.propTypes = {
  logIn: PropTypes.func.isRequired,
};
