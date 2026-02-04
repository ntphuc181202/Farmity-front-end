import type { ReactNode } from 'react';
import { Button } from 'reactstrap';
import type { ButtonProps } from 'reactstrap';
import FarmitysLoader from '../FarmityLoader';
import classNames from 'classnames/bind';

import styles from './FarmityButton.module.scss';

interface FarmityButtonProps extends ButtonProps {
  color?: string;
  title: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  onClick?: () => void;
  size?: 'md' | 'sm' | 'lg';
  isCenterIcon?: boolean;
}

const cx = classNames.bind(styles);

const FarmityButton = ({
  color,
  title,
  leftIcon,
  rightIcon,
  loading,
  onClick,
  size,
  isCenterIcon = false,
  ...restProps
}: FarmityButtonProps) => {
  const isIconVisible =
    leftIcon || rightIcon ? 'd-flex justify-content-center align-items-center' : '';
  const centerIconTrue = isCenterIcon
    ? 'd-flex justify-content-center align-items-center'
    : '';
  return (
    <Button
      color={color}
      onClick={onClick}
      {...restProps}
      className={cx('button', `${restProps.className}`)}
    >
      {loading ? (
        <>
          <FarmitysLoader useFor={'loginButton'} />
          <span className={cx(`${size ? size : 'sm'}`)}>{title}</span>
        </>
      ) : (
        <div className={isIconVisible + centerIconTrue}>
          <span className={centerIconTrue}>{leftIcon}</span>
          <span className={cx(`${size ? size : 'md'}`)}>{title}</span>
          <span className={centerIconTrue}>{rightIcon}</span>
        </div>
      )}
    </Button>
  );
};

export default FarmityButton;
