import classNames from 'classnames/bind';
import { FaUser } from 'react-icons/fa6';
import { IoMdClose } from 'react-icons/io';
import { RiLockPasswordFill } from 'react-icons/ri';
import { Label, Modal, ModalBody } from 'reactstrap';

import styles from './SignIn.module.scss';
import FarmityInput from '@/components/FarmityInput';
import LoginLogo from '@/assets/images/Layout/Navbar/logo-login.png';
import { Link } from 'react-router-dom';
import FarmityButton from '@/components/FarmityButton';

const cx = classNames.bind(styles);

type SignInModalProps = {
  isCloseLogin: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setIsCloseLogin: any;
};

const SignInModal = ({ isCloseLogin, setIsCloseLogin }: SignInModalProps) => {
  return (
    <>
      <Modal
        isOpen={isCloseLogin}
        className={cx('login-wrapper')}
      >
        <ModalBody>
          <div className={cx('login-content')}>
            {/* Title */}
            <div className={cx('login-header-wrapper')}>
              <img
                src={LoginLogo}
                alt='logo-login'
                className={cx('login-logo', 'img-fluid')}
              />
              <h2 className={cx('login-title', 'font-Nunito')}>Đăng nhập vào VEMS</h2>
              <div
                className={cx('login-icon-close')}
                onClick={() => {
                  setIsCloseLogin(false);
                }}
              >
                <IoMdClose
                  size={38}
                  color='#ccc'
                />
              </div>
            </div>
            {/* Title */}

            <div className={cx('form-wrapper')}>
              {/* Username */}
              <div className={cx('field-wrapper')}>
                <div>
                  <Label
                    htmlFor='username'
                    className={cx('login-label')}
                  >
                    <FaUser className={cx('field-icon')} /> Tài khoản *
                  </Label>
                </div>
                <FarmityInput
                  className={cx('field-input')}
                  name={'username'}
                  placeholder='Nhập tài khoản'
                />
              </div>
              {/* Username */}

              {/* Password */}
              <div className={cx('field-wrapper')}>
                <div>
                  <Label
                    htmlFor='password'
                    className={cx('login-label')}
                  >
                    <RiLockPasswordFill className={cx('field-icon')} /> Mật khẩu *
                  </Label>
                </div>
                <FarmityInput
                  className={cx('field-input')}
                  name={'password'}
                  placeholder='Nhập mật khẩu'
                  type='password'
                />
              </div>
              {/* Password */}

              {/* Forgot Password */}
              <div className={cx('login-forget-password')}>
                <Link to={''}>Quên mật khẩu?</Link>
              </div>
              {/* Forgot Password */}

              <div className={cx('button-login-wrapper')}>
                <FarmityButton
                  title={'Đăng nhập'}
                  className={cx('button-login')}
                  size='lg'
                />
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default SignInModal;
