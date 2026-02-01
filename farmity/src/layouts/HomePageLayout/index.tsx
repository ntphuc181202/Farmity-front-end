import classNames from 'classnames/bind';

import styles from './HomePageLayout.module.scss';
import NavbarHomepage from './Navbar';
import FooterHomepage from './Footer';
import { ReactNode } from 'react';

const cx = classNames.bind(styles);

type HomePageLayoutProps = {
  children: ReactNode;
};

const HomePageLayout = ({ children }: HomePageLayoutProps) => {
  return (
    <div className={cx('wrapper')}>
      <NavbarHomepage />
      <div className={cx('content')}>{children}</div>
      <FooterHomepage />
    </div>
  );
};

export default HomePageLayout;
