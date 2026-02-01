import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import type { Dispatch, SetStateAction } from 'react';
import { RiMenuFold2Fill, RiMenuFoldFill } from 'react-icons/ri';
import { MdLogout, MdSpaceDashboard } from 'react-icons/md';

import LogoVems from '@/assets/images/Layout/Navbar/logo-login.png';
import AvatarImage from '@/assets/images/Homepage/avatar-test.jpg';
import NoAvatarImage from '@/assets/images/no-avatar.png';
import styles from './Sidebar.module.scss';
import FarmityImage from '@/components/FarmityImage';

const cx = classNames.bind(styles);

type SidebarSystemProps = {
  isToggleNavbar: boolean;
  setIsToggleNavbar: Dispatch<SetStateAction<boolean>>;
};

const SidebarSystem = ({ isToggleNavbar, setIsToggleNavbar }: SidebarSystemProps) => {
  // Variables -------------------------------------------------------------------------------------------------
  const sidebarList = [
    {
      name: 'Bảng điều khiển',
      icon: <MdSpaceDashboard className={cx('navbar-item-inner-icon')} />,
      link: 'dashboard'
    }
  ];

  return (
    <>
      <nav className={cx('navbar', `${isToggleNavbar ? 'toggle' : ''}`)}>
        <div>
          {/* Logo Start */}
          <div className={cx('navbar-logo')}>
            <div className={cx('navbar-item-inner-logo')}>
              <img
                className={cx('navbar-logo-img')}
                src={LogoVems}
                alt='logo-vems-black'
              />
            </div>

            {isToggleNavbar ? (
              <div
                className={cx('icon-menu-wrapper')}
                onClick={() => {
                  setIsToggleNavbar(false);
                }}
              >
                <RiMenuFoldFill
                  size={26}
                  className={cx('icon-menu')}
                />
              </div>
            ) : (
              <div
                className={cx('icon-menu-wrapper')}
                onClick={() => {
                  setIsToggleNavbar(true);
                }}
              >
                <RiMenuFold2Fill
                  size={26}
                  className={cx('icon-menu')}
                />
              </div>
            )}
          </div>
          {/* Logo End */}

          {/* Item Start */}
          <ul className={cx('navbar-items')}>
            {sidebarList &&
              sidebarList.map((sidebarItem, index) => (
                <li
                  key={index}
                  className={cx('navbar-item')}
                >
                  <Link
                    className={cx('navbar-item-inner')}
                    to={sidebarItem.name ? `/${sidebarItem.link}` : '#'}
                  >
                    <div className={cx('navbar-item-inner-icon-wrapper')}>
                      {sidebarItem?.icon}
                    </div>
                    <div className={cx('link-text-wrapper')}>
                      <span className={cx('link-text')}>{sidebarItem?.name}</span>
                    </div>
                  </Link>
                </li>
              ))}
          </ul>
          {/* Item End */}
        </div>

        {/* Profile Start */}
        <div className={cx('profile-wrapper')}>
          <div className={cx('profile-item')}>
            {/* Profile */}
            <Link
              className={cx('profile-item-inner')}
              to={''}
            >
              <div className={cx('profile-item-inner-icon-wrapper')}>
                <div className={cx('avatar-wrapper')}>
                  <FarmityImage
                    src={AvatarImage}
                    alt={'avatar'}
                    className={cx('user-avatar')}
                    fallback={NoAvatarImage}
                  />
                </div>
              </div>
              <div className={cx('link-text-wrapper')}>
                <span className={cx('link-text')}>Hồ sơ cá nhân</span>
              </div>
            </Link>
          </div>

          <div className={cx('profile-item', 'log-out-wrapper')}>
            {/* Log out */}
            <Link
              className={cx('profile-item-inner')}
              to={''}
            >
              <div className={cx('profile-item-inner-icon-wrapper')}>
                <MdLogout className={cx('profile-item-inner-icon')} />
              </div>
              <div className={cx('link-text-wrapper')}>
                <span className={cx('link-text')}>Đăng xuất</span>
              </div>
            </Link>
          </div>
        </div>
        {/* Profile End */}
      </nav>
    </>
  );
};

export default SidebarSystem;
