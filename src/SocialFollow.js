import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTelegram,
  faDiscord,
  faTwitter,
  faInstagram
} from "@fortawesome/free-brands-svg-icons";

export default function SocialFollow() {
  return (
    <div className="social-container">
      <h3>Socials</h3>
      <a
        href="https://t.me/KITTYDINGER"
        className="Telegram social"
      >
        <FontAwesomeIcon icon={faTelegram} size="1x" />
      </a>
      <a
        href="https://discord.com/invite/evHSXcgba9"
        className="Discord social"
      >
        <FontAwesomeIcon icon={faDiscord} size="1x" />
      </a>
      <a href="https://twitter.com/KittyDinger?s=20" className="twitter social">
        <FontAwesomeIcon icon={faTwitter} size="1x" />
      </a>
      <a
        href="https://www.instagram.com/theschrodingerofficial/?utm_medium=copy_link"
        className="instagram social"
      >
        <FontAwesomeIcon icon={faInstagram} size="1x" />
      </a>
    </div>
  );
}
