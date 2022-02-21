type TTree<T> = {
    children?: TTree<T>[];
} & T;

/**
 * @param list - flat list
 * @param param - { id, p_id }: id property name and parent_id propery name
 * @returns TTree
 */
const arrayToTree = <T>(
    list: T[],
    { id, p_id }: { id: string, p_id: string }
): TTree<T>[] | [] => {
    const map: number[] = [];
    const treeList: TTree<T>[] = list as TTree<T>[];

    for (let idx = 0; idx < treeList.length; idx++) {
        // by shkoh 20220221: initialize the map
        map[(treeList[idx] as TTree<T> & { [id: string]: number })[id]] = idx;
        // by shkoh 20220221: initialize the children
        treeList[idx].children = [];
    }

    let node: TTree<T> & { [p_id: string]: number };

    // by shkoh 20220221: Return value
    const roots: TTree<T>[] = [];
    for (const item of treeList) {
        node = item as TTree<T> & { [p_id: string]: number };
        if (node[p_id] !== null) {
            if (treeList[map[node[p_id]]] !== undefined) {
                if (treeList[map[node[p_id]]].children) {
                    treeList[map[node[p_id]]].children.push(node);
                }
            }
        } else {
            roots.push(node);
        }
    }

    return roots;
};

export default arrayToTree;