import classNames from 'classnames/bind';
import {
  FaPhoneAlt,
  FaTwitter,
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube
} from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { IoIosMail } from 'react-icons/io';
import { Link, useLocation } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { useEffect, useMemo, useState } from 'react';

import styles from './Navbar.module.scss';
import LogoVemsWhite from '@/assets/images/logo-white.png';
import LogoVemsBlack from '@/assets/images/logo-black.png';
import VemsButton from '@/components/FarmityButton';
import SignInModal from './SignInModal';

const cx = classNames.bind(styles);

const NavbarHomepage = () => {
  const router = useLocation();

  // useState -------------------------------------------------------------------------------------------------
  // Image logo
  const [isChangeLogo, setIsChangeLogo] = useState<boolean>(true);

  // Login-----------------------------------------------------
  const [isCloseLogin, setIsCloseLogin] = useState(false);

  const routeChange = [
    {
      route: '/'
    },
    {
      route: '/contact',
      title: 'Liên hệ',
      urlDescription: 'Liên hệ'
    },
    {
      route: '/service',
      title: 'Dịch vụ',
      urlDescription: 'Dịch vụ'
    }
  ];

  // Route-----------------------------------------------------
  const routeActive = useMemo(() => {
    return routeChange.find(i => i.route === router.pathname);
  }, [router.pathname]);

  // useEffect -------------------------------------------------------------------------------------------------
  // Route
  // useEffect(() => {
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   const value: any = routeChange.find(i => i.route === router.pathname);
  //   setRouteActive(value);
  // }, [router.pathname]);

  // Navbar
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector(`.${styles.navbar}`);
      if (navbar) {
        if (window.scrollY > 45) {
          navbar.classList.add(styles.stickyTop, styles.shadowScroll);
          navbar.classList.remove(styles.shadowNoScroll);
          setIsChangeLogo(false);
        } else {
          navbar.classList.add(styles.shadowNoScroll);
          navbar.classList.remove(styles.stickyTop, styles.shadowScroll);
          setIsChangeLogo(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Event -------------------------------------------------------------------------------------------------
  const isActive = (href: string) => {
    return router.pathname === href ? 'active' : '';
  };

  return (
    <>
      {/* TopBar Start  */}
      <div>
        <div className={cx('header-container')}>
          <Row>
            <Col md={8}>
              <div className={cx('header-wrapper-left')}>
                <p className={cx('icon-text-wrapper', 'me-3 text-light')}>
                  <FaLocationDot className='me-2' />
                  112 Nguyễn Văn Cừ, An Hòa, Ninh Kiều, Tp.Cần Thơ
                </p>
                <p className={cx('icon-text-wrapper', 'me-3 text-light')}>
                  <FaPhoneAlt className='me-2' />
                  0909 68 68 68
                </p>
                <p className={cx('icon-text-wrapper', 'me-3 text-light')}>
                  <IoIosMail
                    className='me-2'
                    size={26}
                  />
                  vems@gmail.com
                </p>
              </div>
            </Col>
            <Col
              md={4}
              className={cx('d-flex justify-content-end')}
            >
              <div className={cx('header-wrapper-right')}>
                <Link
                  className={cx('icon-social-wrapper')}
                  to={''}
                >
                  <FaTwitter
                    color='#fff'
                    size={15}
                  />
                </Link>
                <Link
                  className={cx('icon-social-wrapper')}
                  to={''}
                >
                  <FaFacebookF
                    color='#fff'
                    size={15}
                  />
                </Link>
                <Link
                  className={cx('icon-social-wrapper')}
                  to={''}
                >
                  <FaLinkedinIn
                    color='#fff'
                    size={15}
                  />
                </Link>
                <Link
                  className={cx('icon-social-wrapper')}
                  to={''}
                >
                  <FaInstagram
                    color='#fff'
                    size={15}
                  />
                </Link>
                <Link
                  className={cx('icon-social-wrapper')}
                  to={''}
                >
                  <FaYoutube
                    color='#fff'
                    size={15}
                  />
                </Link>
              </div>
            </Col>
          </Row>
        </div>
      </div>
      {/* TopBar End  */}

      {/* Navbar & Hero Start  */}
      {/* Navbar  */}
      <div className={cx('position-relative')}>
        <nav className={cx('navbar', 'navbar-light', 'shadowNoScroll')}>
          {/* Logo Vems */}
          <Link
            to='/'
            className={cx('navbar-brand')}
          >
            {isChangeLogo ? (
              <img
                className={cx('nav-logo-white')}
                src={LogoVemsWhite}
                alt='logo-vems-white'
              />
            ) : (
              <img
                className={cx('nav-logo-black')}
                src={LogoVemsBlack}
                alt='logo-vems-black'
              />
            )}
          </Link>

          {/* Nav Link & Button Wrapper */}
          <div
            className={cx('navbar-link-wrapper')}
            id='navbarCollapse'
          >
            {/* Nav Link  */}
            <div className={cx('navbar-link-list')}>
              <Link
                to='/'
                className={cx('nav-link-item', `${isActive('/')}`, 'font-Nunito')}
              >
                Trang chủ
              </Link>
              <Link
                to='/service'
                className={cx('nav-link-item', `${isActive('/service')}`, 'font-Nunito')}
              >
                Dịch vụ
              </Link>
              <Link
                to='/contact'
                className={cx('nav-link-item', `${isActive('/contact')}`, 'font-Nunito')}
              >
                Liên hệ
              </Link>
            </div>
            {/* Nav Button  */}
            <div>
              <VemsButton
                className={cx('nav-btn', 'rounded-pill')}
                title='Đăng nhập'
                onClick={() => {
                  setIsCloseLogin(true);
                }}
              />
            </div>

            {isCloseLogin && (
              <SignInModal
                isCloseLogin={isCloseLogin}
                setIsCloseLogin={setIsCloseLogin}
              />
            )}
          </div>
        </nav>
      </div>

      {/* Hero  */}
      <div className={cx('hero-header', 'container-fluid')}>
        <div className={cx('container py-5')}>
          <div className={cx('row justify-content-center py-5')}>
            <div className={cx('col-lg-10 pt-lg-5 mt-lg-5 text-center')}>
              <h1
                className={cx(
                  'bg-hero-title',
                  'animate__animated animate__slideInDown font-Nunito'
                )}
              >
                {router.pathname === '/'
                  ? 'Quản lý trường học dễ dàng và hiệu quả với giải pháp của chúng tôi'
                  : routeActive?.title}
              </h1>

              {router.pathname !== '/' && (
                <nav aria-label='breadcrumb'>
                  <ol className={cx('breadcrumb justify-content-center')}>
                    <li className={cx('breadcrumb-item', 'bg-hero-breadcrumb-item')}>
                      <p
                        style={{
                          color: 'var(--text-nav-link)'
                        }}
                      >
                        Trang chủ
                      </p>
                    </li>
                    <li
                      className={cx(
                        'breadcrumb-item text-white',
                        'bg-hero-breadcrumb-item'
                      )}
                      aria-current='page'
                    >
                      {routeActive?.urlDescription}
                    </li>
                  </ol>
                </nav>
              )}

              {router.pathname === '/' && (
                <p
                  className={cx(
                    'bg-hero-sub-title',
                    'animate__animated animate__slideInDown'
                  )}
                >
                  Cùng chúng tôi nâng cao hiệu quả quản lý và chất lượng giảng dạy trong
                  môi trường học tập của bạn!
                </p>
              )}

              {router.pathname === '/' && (
                <div
                  className={cx(
                    'position-relative w-75 mx-auto animate__animated animate__slideInDown'
                  )}
                >
                  <input
                    className={cx('form-control rounded-pill', 'bg-hero-input-search')}
                    type='text'
                    placeholder='Tìm kiếm thông tin...'
                  />
                  <VemsButton
                    className={cx('bg-hero-btn-search', 'rounded-pill')}
                    title='Tìm kiếm'
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navbar & Hero End  */}
    </>
  );
};

export default NavbarHomepage;
