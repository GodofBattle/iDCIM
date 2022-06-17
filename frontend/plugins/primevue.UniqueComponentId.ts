let lastId = 0;

const UniqueComponentId = () => {
    const prefix = 'pv_id_';
    lastId++;

    return `${prefix}${lastId}`;
}

export default UniqueComponentId;