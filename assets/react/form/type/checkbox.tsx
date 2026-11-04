export const Checkbox = ({ field }: { field: any }) => (
    <div className="form-check">
        <input className="form-check-input" type="checkbox" />
        <label className="form-check-label">{field.label || ''}</label>
    </div>
);
