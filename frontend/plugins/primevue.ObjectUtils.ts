class ObjectUtils {
    private isFunction(obj: any) {
        return !!(obj && obj.constructor && obj.call && obj.apply);
    }

    resolveFieldData(data: any, field: any): string | null {
        if (data && Object.keys(data).length && field) {
            if (this.isFunction(field)) {
                return field(data);
            } else if (!field.includes('.')) {
                return data[field];
            } else {
                const fields = field.split('.');
                let value = data;

                for (let i = 0, len = fields.length; i < len; ++i) {
                    if (value == null) {
                        return null;
                    }

                    value = value[fields[i]];
                }

                return value;
            }
        } else {
            return null;
        }
    }
}

export default new ObjectUtils();
