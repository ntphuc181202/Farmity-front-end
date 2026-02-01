import classNames from 'classnames/bind';
import { BiSolidSchool } from 'react-icons/bi';
import { IoMdNotifications } from 'react-icons/io';
import { Link, useLocation } from 'react-router-dom';
import { MdCalendarMonth, MdSpaceDashboard } from 'react-icons/md';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { GiTeacher } from 'react-icons/gi';
import { PiStudent } from 'react-icons/pi';
import { useEffect, useState } from 'react';

import styles from './Header.module.scss';

const cx = classNames.bind(styles);

type HeaderSystemProps = {
  isToggleNavbar: boolean;
};

const HeaderSystem = ({ isToggleNavbar }: HeaderSystemProps) => {
  const router = useLocation();

  const sidebarList = [
    {
      name: 'Bảng điều khiển',
      icon: <MdSpaceDashboard className={cx('navbar-item-inner-icon')} />,
      link: 'dashboard'
    },

    {
      name: 'Thời khóa biểu',
      icon: <MdCalendarMonth className={cx('navbar-item-inner-icon')} />,
      link: 'schedule-management'
    },
    {
      name: 'Danh sách lớp',
      icon: <GiTeacher className={cx('navbar-item-inner-icon')} />,
      link: 'class-management'
    },
    {
      name: 'Danh sách học sinh',
      icon: <PiStudent className={cx('navbar-item-inner-icon')} />,
      link: 'student-management'
    },
    {
      name: 'Danh sách giáo viên',
      icon: <FaChalkboardTeacher className={cx('navbar-item-inner-icon')} />,
      link: 'teacher-management'
    }
  ];

  // useState -------------------------------------------------------------------------------------------------
  // Route
  const [routeActive, setRouteActive] = useState<any>(undefined);

  // useEffect -------------------------------------------------------------------------------------------------
  // Route
  useEffect(() => {
    const value: any = sidebarList.find(i => `/${i.link}` === router.pathname);
    setRouteActive(value);
  }, [router.pathname]);

  return (
    <div className={cx('header-wrapper')}>
      <div className={cx('header-content')}>
        <h2
          className={cx(
            'school-name',
            'title',
            'font-Nunito',
            `${isToggleNavbar ? 'isToggleSidebar' : ''}`
          )}
        >
          <BiSolidSchool className={cx('school-icon')} /> Trường thpt Châu Văn Liêm
        </h2>

        <div className={cx('notification-wrapper-first')}>
          <div className={cx('notification-wrapper-second')}>
            <IoMdNotifications className={cx('notification-icon')} />
          </div>
        </div>
      </div>

      <div className={cx('link-wrapper')}>
        <nav aria-label='breadcrumb'>
          <ol className={cx('breadcrumb justify-content-center align-items-center mb-0')}>
            <li className={cx('breadcrumb-item', 'bg-hero-breadcrumb-item')}>
              <Link
                style={{
                  color: 'var(--text-nav-link) !important',
                  position: 'relative',
                  zIndex: 10
                }}
                to={'/dashboard'}
              >
                <p className={cx('dashboard-link-wrapper')}>
                  <MdSpaceDashboard className={cx('dashboard-link-icon')} />
                  Bảng điều khiển{' '}
                </p>
              </Link>
            </li>
            {routeActive?.link !== 'dashboard' && (
              <li
                className={cx('breadcrumb-item', 'bg-hero-breadcrumb-item')}
                aria-current='page'
              >
                {routeActive?.name}
              </li>
            )}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default HeaderSystem;
