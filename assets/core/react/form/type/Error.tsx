type Props = {
    id: string;
    errors: string[];
};

export const Error = ({ id, errors }: Props) => {
    if (!errors.length) {
        return <div id={id + '-error'} className="invalid-feedback d-none" />;
    }

    return (
        <div id={id + '-error'} className="invalid-feedback d-block">
            {errors.map((message) => (
                <div key={message} className="invalid-feedback d-block">{message}</div>
            ))}
        </div>
    );
};
