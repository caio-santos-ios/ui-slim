"use client";

import "./style.css";

type TProp = {
  theme?: string;
  styleClassBtn?: string;
  text: string;
  isLoading?: boolean;
  disabled?: boolean;
  click?: () => void;
  type?: "button" | "submit" | "reset";
};

export const Button = ({
  isLoading,
  disabled,
  text,
  click,
  theme = "primary",
  styleClassBtn,
  type = "button",
}: TProp) => {
  return (
    <button
      type={type}
      onClick={click}
      className={`slim-btn slim-btn-${theme} ${styleClassBtn ?? ""}`}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <div className={`spinner slim-btn-spinner-${theme}`}></div>
      ) : (
        <span className="text-center w-full">{text}</span>
      )}
    </button>
  );
};