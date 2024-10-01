import React from "react";
import IconArrow from "./IconArrow";
import Discord from "./IconDiscord";
import Telegram from "./IconTelegram";
import Twitter from "./IconTwitter";
import IconScroll from "./IconScroll";
import IconSkip from "./IconSkip";

export const base = {
  IconArrow,
  Discord,
  Telegram,
  Twitter,
  IconScroll,
  IconSkip,
};

const Icon = ({ name, ...otherProps }) => {
  const I = base[name];
  return I ? <I {...otherProps} /> : null;
};

export default Icon;
