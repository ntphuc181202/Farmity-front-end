import { Fragment } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FarmityFragment = (props: any) => {
  return <Fragment key={props.key}>{props.children}</Fragment>;
};
export default FarmityFragment;
