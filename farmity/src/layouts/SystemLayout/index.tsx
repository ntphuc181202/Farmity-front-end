import classNames from "classnames/bind";
import { useState } from "react";
import type { ReactNode } from "react";

import styles from "./SystemLayout.module.scss";
import FooterSystem from "./Footer";
import SidebarSystem from "./Sidebar";
import HeaderSystem from "./Header";

const cx = classNames.bind(styles);

type SystemLayoutProps = {
  children: ReactNode;
};

const SystemLayout = ({ children }: SystemLayoutProps) => {
  // Use State -------------------------------------------------------------------------------------------------
  const [isToggleNavbar, setIsToggleNavbar] = useState(false);

  return (
    <div className={cx("wrapper")}>
      <SidebarSystem
        isToggleNavbar={isToggleNavbar}
        setIsToggleNavbar={setIsToggleNavbar}
      />

      <div
        className={cx(
          "content-wrapper",
          `${isToggleNavbar ? "toggle-nav" : ""}`,
        )}
      >
        <HeaderSystem isToggleNavbar={isToggleNavbar} />
        <div className={cx("content")}>{children}</div>
        <FooterSystem />
      </div>
    </div>
  );
};

export default SystemLayout;
