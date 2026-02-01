type ErrorValidationMessagesProps = {
  messages: string[];
  styles?: object;
};

const ErrorValidationMessages = ({ messages, styles }: ErrorValidationMessagesProps) => {
  return (
    <div style={styles}>
      {messages.map(
        msg =>
          msg && (
            <p
              className='text-danger mt-2'
              style={{ textAlign: 'left' }}
              key={`error-msg-${messages.indexOf(msg)}`}
            >{`*${msg}`}</p>
          )
      )}
    </div>
  );
};

export default ErrorValidationMessages;
