import {FieldError, UseFormRegisterReturn} from 'react-hook-form';

interface FormFieldProps {
    label: string;
    name: string;
    error?: FieldError;
    required?: boolean;
    children: (props: {
        className: string;
        id: string;
        'aria-invalid'?: boolean;
        'aria-describedby'?: string;
    }) => React.ReactNode;
}

const inputBaseClasses = "w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors";
const errorClasses = "border-red-500 focus:ring-red-500";

export function FormField({label, name, error, required, children}: FormFieldProps) {
    const errorId = `${name}-error`;
    const className = `${inputBaseClasses} ${error ? errorClasses : ''}`;

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium mb-1 text-gray-300">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {children({
                className,
                id: name,
                'aria-invalid': !!error,
                'aria-describedby': error ? errorId : undefined,
            })}
            {error && (
                <p id={errorId} className="text-red-400 text-sm mt-1" role="alert">
                    {error.message}
                </p>
            )}
        </div>
    );
}

interface InputFieldProps extends Omit<FormFieldProps, 'children'> {
    type?: string;
    placeholder?: string;
    register: UseFormRegisterReturn;
}

export function InputField({register, type = 'text', ...props}: InputFieldProps) {
    return (
        <FormField {...props}>
            {(fieldProps) => (
                <input
                    type={type}
                    placeholder={props.placeholder}
                    {...register}
                    {...fieldProps}
                />
            )}
        </FormField>
    );
}

interface TextareaFieldProps extends Omit<FormFieldProps, 'children'> {
    placeholder?: string;
    rows?: number;
    register: UseFormRegisterReturn;
}

export function TextareaField({register, rows = 3, ...props}: TextareaFieldProps) {
    return (
        <FormField {...props}>
            {(fieldProps) => (
                <textarea
                    placeholder={props.placeholder}
                    rows={rows}
                    {...register}
                    {...fieldProps}
                />
            )}
        </FormField>
    );
}

interface SelectFieldProps extends Omit<FormFieldProps, 'children'> {
    options: {value: string; label: string}[];
    register: UseFormRegisterReturn;
}

export function SelectField({register, options, ...props}: SelectFieldProps) {
    return (
        <FormField {...props}>
            {(fieldProps) => (
                <select {...register} {...fieldProps}>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            )}
        </FormField>
    );
}
