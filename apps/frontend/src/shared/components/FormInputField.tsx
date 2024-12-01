import type React from "react";

interface FormInputFieldProps {
  displayName: string;
  type?: React.HTMLInputTypeAttribute;
  name?: string;
  value?: string | number | readonly string[];
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  errorMessage?: string;
}

export function FormInputField({
  displayName,
  type,
  name,
  value,
  onChange,
  errorMessage,
}: FormInputFieldProps): JSX.Element {
  return (
    <div className="flex w-full flex-col">
      <label className="">{displayName}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="rounded-md border border-gray-300 bg-white p-2 text-background"
      />
      {errorMessage ?
        <div className="h-8">
          <p className="text-red-500">{errorMessage}</p>
        </div>
      : null}
    </div>
  );
}
