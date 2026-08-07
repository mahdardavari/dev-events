interface FormAlertProps {
    type?: 'error' | 'success';
    children: React.ReactNode;
}

/**
 * Inline alert used by auth forms to surface action-state messages.
 */
export function FormAlert({type = 'error', children}: FormAlertProps) {
    const styles = type === 'error'
        ? 'bg-red-100 border-red-400 text-red-700'
        : 'bg-green-100 border-green-400 text-green-700';

    return (
        <div
            role={type === 'error' ? 'alert' : 'status'}
            className={`${styles} border px-4 py-3 rounded-md text-sm animate-[fadeInUp_300ms_ease-out]`}
        >
            {children}
        </div>
    );
}
