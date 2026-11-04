export const Textarea = ({ field }: { field: any }) => {
    const label = field.label ? <label className="form-label">{field.label}</label> : null;

    return (
        <div className="mb-0">
            {label}
            <textarea className="form-control" rows={3} />
        </div>
    );
};
