/* Copyright G. Hemingway, @2023 - All rights reserved */
"use strict";

import React, { Fragment } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Link } from "react-router-dom";

/**
 * @return {string}
 */

const fontColor = "lightblue";

const HeaderLeftBase = styled.div`
  flex-grow: 1;
  font-style: italic;
  & > h2 {
    color: ${fontColor};
    margin: 0.75em 0 0.75em 0.5em;
  }
  & > a {
    text-decoration: none;
    & > h2 {
      color: ${fontColor};
      margin: 0.75em 0 0.75em 0.5em;
    }
  }
`;

const HeaderLeft = ({ user }) => {
  return (
    <HeaderLeftBase>
      {user !== "" ? (
        <Link to={`/profile/${user}`}>
          <h2>JaneCard</h2>
        </Link>
      ) : (
        <h2>JaneCard</h2>
      )}
    </HeaderLeftBase>
  );
};

HeaderLeft.propTypes = {
  user: PropTypes.string,
};

/*************************************************************************/

const HeaderRightBase = styled.div`
  display: flex;
  flex-direction: ${(props) => (props.$vertical ? "row" : "column")};
  justify-content: center;
  align-items: ${(props) => (props.$vertical ? "center" : "flex-end")};
  padding-right: 0.5em;
  & > a {
    color: ${fontColor};
    padding-right: ${(props) => (props.$vertical ? "0.5em" : "0")};
  }
`;

const HeaderRight = ({ user, avatar }) => {
  const isLoggedIn = user !== "";
  return (
    <HeaderRightBase $vertical={isLoggedIn}>
      {isLoggedIn ? (
        <Fragment>
          <Link to="/logout">Log Out</Link>
          <Link to={`/profile/${user}`}>
            <img
              alt="go to profile"
              src={avatar}
              style={{ width: "40px", height: "40px" }}
            />
          </Link>
        </Fragment>
      ) : (
        <Fragment>
          <Link id="loginLink" to="/login">
            Log In
          </Link>
          <Link id="regLink" to="/register">
            Register
          </Link>
        </Fragment>
      )}
    </HeaderRightBase>
  );
};

HeaderRight.propTypes = {
  user: PropTypes.string,
  email: PropTypes.string,
};

const HeaderBase = styled.div`
  grid-area: hd;
  display: flex;
  background: #002266;
`;

export const Header = ({ user = "", avatar = "" }) => (
  <HeaderBase>
    <HeaderLeft user={user} />
    <HeaderRight user={user} avatar={avatar} />
  </HeaderBase>
);

Header.propTypes = {
  user: PropTypes.string,
  avatar: PropTypes.string,
};
