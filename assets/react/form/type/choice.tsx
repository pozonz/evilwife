export const Choice = ({ field }: { field: any }) => {
    const label = field.label ? <label className="form-label">{field.label}</label> : null;

    return (
        <div className="mb-0">
            {label}
            <select className="form-select" />
        </div>
    );
};
