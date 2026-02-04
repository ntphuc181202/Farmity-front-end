import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import {
  FaPhoneAlt,
  FaTwitter,
  FaFacebookF,
  FaYoutube,
  FaLinkedinIn,
  FaEnvelope
} from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

import GalleryImage1 from '@/assets/images/Layout/Footer/gallery-1.webp';
import GalleryImage2 from '@/assets/images/Layout/Footer/gallery-2.webp';
import GalleryImage3 from '@/assets/images/Layout/Footer/gallery-3.webp';
import GalleryImage4 from '@/assets/images/Layout/Footer/gallery-4.webp';
import GalleryImage5 from '@/assets/images/Layout/Footer/gallery-5.webp';
import GalleryImage6 from '@/assets/images/Layout/Footer/gallery-6.webp';
import styles from './Footer.module.scss';
import VemsButton from '@/components/FarmityButton';

const cx = classNames.bind(styles);

const FooterSystem = () => {
  // useState -------------------------------------------------------------------------------------------------

  // useEffect -------------------------------------------------------------------------------------------------

  return (
    <>
      {/* Footer Start */}
      <div
        className={cx(
          'container-fluid animate__animated animate__fadeIn pt-5',
          'footer-container'
        )}
      >
        <div className={cx('footer-container-content', 'container')}>
          <div className={cx('row g-5')}>
            {/* Link Wrapper */}
            <div className={cx('col-lg-3 col-md-6')}>
              <h4 className={cx('footer-link-title', 'font-Nunito')}>VEMS</h4>
              <Link
                className={cx('footer-link-item', 'font-Nunito')}
                to=''
              >
                Thông Tin
              </Link>

              <Link
                className={cx('footer-link-item', 'font-Nunito')}
                to=''
              >
                Liên Hệ
              </Link>

              <Link
                className={cx('footer-link-item', 'font-Nunito')}
                to=''
              >
                Chính Sách Bảo Mật
              </Link>

              <Link
                className={cx('footer-link-item', 'font-Nunito')}
                to=''
              >
                Điều Khoản & Điều Kiện
              </Link>

              <Link
                className={cx('footer-link-item', 'font-Nunito')}
                to=''
              >
                Câu Hỏi Thường Gặp & Hỗ Trợ
              </Link>
            </div>

            {/* Contact */}
            <div className={cx('col-lg-3 col-md-6')}>
              <h4 className={cx('footer-link-title', 'font-Nunito')}>Liên Hệ</h4>
              <p className={cx('footer-contact-info')}>
                <FaLocationDot className={cx('footer-contact-info-icon')} />
                112 Nguyễn Văn Cừ, An Hòa, Ninh Kiều, Tp.Cần Thơ
              </p>
              <p className={cx('footer-contact-info')}>
                <FaPhoneAlt className={cx('footer-contact-info-icon')} />
                0909 68 68 68
              </p>
              <p className={cx('footer-contact-info')}>
                <FaEnvelope className={cx('footer-contact-info-icon')} />
                vems@gmail.com
              </p>

              {/* Social Wrapper */}
              <div className={cx('footer-contact-social-wrapper')}>
                <Link
                  className={cx('icon-social-wrapper')}
                  to=''
                >
                  <FaTwitter
                    color='#fff'
                    size={15}
                  />
                </Link>

                <Link
                  className={cx('icon-social-wrapper')}
                  to=''
                >
                  <FaFacebookF
                    color='#fff'
                    size={15}
                  />
                </Link>

                <Link
                  className={cx('icon-social-wrapper')}
                  to=''
                >
                  <FaYoutube
                    color='#fff'
                    size={15}
                  />
                </Link>

                <Link
                  className={cx('icon-social-wrapper')}
                  to=''
                >
                  <FaLinkedinIn
                    color='#fff'
                    size={15}
                  />
                </Link>
              </div>
            </div>

            {/* Gallery */}
            <div className='col-lg-3 col-md-6'>
              <h4 className={cx('footer-link-title', 'font-Nunito')}>Bộ Sưu Tập</h4>
              <div className={cx('row g-2')}>
                <div className='col-4'>
                  <img
                    className={cx('footer-gallery-img')}
                    src={GalleryImage1}
                    alt='gallery-image'
                  />
                </div>

                <div className='col-4'>
                  <img
                    className={cx('footer-gallery-img')}
                    src={GalleryImage2}
                    alt='gallery-image'
                  />
                </div>

                <div className='col-4'>
                  <img
                    className={cx('footer-gallery-img')}
                    src={GalleryImage3}
                    alt='gallery-image'
                  />
                </div>

                <div className='col-4'>
                  <img
                    className={cx('footer-gallery-img')}
                    src={GalleryImage4}
                    alt='gallery-image'
                  />
                </div>

                <div className='col-4'>
                  <img
                    className={cx('footer-gallery-img')}
                    src={GalleryImage5}
                    alt='gallery-image'
                  />
                </div>

                <div className='col-4'>
                  <img
                    className={cx('footer-gallery-img')}
                    src={GalleryImage6}
                    alt='gallery-image'
                  />
                </div>
              </div>
            </div>

            {/* Register */}
            <div className='col-lg-3 col-md-6'>
              <h4 className={cx('footer-link-title', 'font-Nunito')}>Nhận Thông Tin</h4>
              <p className={cx('footer-register-content')}>
                Nhận thông báo khi có cập nhật hệ thống mới.
              </p>
              <div className={cx('position-relative')}>
                <input
                  className={cx('form-control', 'footer-register-input')}
                  type='text'
                  placeholder='Nhập email'
                />
                <VemsButton
                  className={cx('footer-register-btn-search')}
                  title='Đăng Ký'
                />
              </div>
            </div>
          </div>
        </div>

        <div className='container'>
          <div className={cx('copyright')}>
            <div>
              &copy;{' '}
              <Link
                className='border-bottom'
                to='/'
              >
                VEMS
              </Link>
              , Bản quyền thuộc về. Thiết kế bởi{' '}
              <Link
                className='border-bottom'
                to='/'
              >
                VEMS.
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Footer End  */}
    </>
  );
};

export default FooterSystem;
