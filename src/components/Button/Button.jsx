import s from "./Button.module.css";

const Button = ({ type, onClick, className, children, disabled }) => {
  return (
    <button
      className={`${s.button} ${className}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
