import "./StyledButton.css";
import PropTypes from "prop-types";

const toLength = (v) => (typeof v === "number" ? `${v}px` : v);

export const OrbButton = ({
  color = "#8F38C8",
  borderColor,
  size = 40,
  borderWidth,
  className = "",
  style,
  children,
  ...rest
}) => {
  const vars = {
    "--orb-color": color,
    "--orb-size": toLength(size),
    ...(borderColor && { "--orb-border-color": borderColor }),
    ...(borderWidth != null && { "--orb-border-width": toLength(borderWidth) }),
    ...(style ?? {}),
  };

  return (
    <button
      type="button"
      className={`orb ${className}`.trim()}
      style={vars}
      {...rest}
    >
      {children != null && <div className="orb__label">{children}</div>}
    </button>
  );
};

OrbButton.propTypes = {
  color: PropTypes.string,
  borderColor: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  borderWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
};

export const SimpleButton = ({
  text,
  onClick,
  active = false,
  disabled = false,
  className = "",
  ...rest
}) => (
  <button
    type="button"
    className={`simple-button ${active ? "simple-button--active" : ""} ${className}`.trim()}
    onClick={onClick}
    disabled={disabled}
    {...rest}
  >
    {text}
  </button>
);

SimpleButton.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};
