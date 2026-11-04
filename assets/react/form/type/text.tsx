export const Text = ({ field }: { field: any }) => {
    const label = field.label ? <label className="form-label">{field.label}</label> : null;

    return (
        <div className="mb-0">
            {label}
            <input className="form-control" type={field.type === 'integer' ? 'number' : 'text'} />
        </div>
    );
};
