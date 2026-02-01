import { FormGroup, FormGroupProps } from 'reactstrap';

const VemsFromGroup = ({ children, ...restProps }: FormGroupProps) => {
  return (
    <>
      <FormGroup
        row
        {...restProps}
      >
        {children}
      </FormGroup>
    </>
  );
};
export default VemsFromGroup;
