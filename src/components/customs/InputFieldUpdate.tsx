import { FieldError, FieldValues, UseFormRegister } from "react-hook-form";

type InputFieldProps = {
  label: string;
  type?: string;
  name: string;
  defaultValue?: string | number ;
  error?: FieldError;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  className?: string;
};

const InputFieldUpdate = ({
  label,
  type = "text",
  name,
  defaultValue,
  error,
  inputProps,
  className,
}: InputFieldProps) => {
  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type={type}
        name={name}
        id={name}
        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
        {...inputProps}
        defaultValue={defaultValue}
      />
      {error?.message && (
        <p className="text-xs text-red-400">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputFieldUpdate;