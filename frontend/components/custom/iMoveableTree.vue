<template>
    <div id="i-moveable-tree">
        <div ref="iFakeDragImage" class="i-fake-dragimage">.</div>

        <div
            v-show="nodeDragging"
            ref="iRealDragImage"
            class="i-real-dragimage"
        >
            <Chip :label="getDraggedNodeLabel" :icon="dragIconClass"></Chip>
        </div>

        <div :class="containerClass">
            <template v-if="loading">
                <div class="p-tree-loading-overlay p-component-overlay">
                    <i :class="loadingIconClass" />
                </div>
            </template>
            <div v-if="filter" class="p-tree-filter-container">
                <input
                    v-model="filterValue"
                    type="text"
                    autocomplete="off"
                    class="p-tree-filter p-inputtext p-component"
                    :placeholder="filterPlaceholder"
                    @keydown="onFilterKeydown"
                />
                <span class="p-tree-filter-icon pi pi-search"></span>
            </div>
            <ul class="p-tree-container" role="tree">
                <i-moveable-tree-node
                    v-for="(node, index) in valueToRender"
                    :key="node.key"
                    :node="node"
                    :order="index + 1"
                    :templates="$scopedSlots"
                    :selection-mode="selectionMode"
                    :expanded-keys="d_expandedKeys"
                    :selection-keys="selectionKeys"
                    :moveable="node_movable"
                    @node-toggle="onNodeToggle"
                    @node-click="onNodeClick"
                    @checkbox-change="onCheckboxChange"
                    @node-mousedown="onNodeMouseDown"
                    @node-dragstart="onNodeDragStart"
                    @node-drag="onNodeDrag"
                    @node-dragover="onNodeDragOver"
                    @node-dragend="onNodeDragEnd"
                    @node-drop="onNodeDrop"
                ></i-moveable-tree-node>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import ObjectUtils from '@/plugins/primevue.ObjectUtils';
import Component from '@/plugins/nuxt-class-component';
import DomHandler from '@/plugins/primevue.DomHandler';

@Component<IMoveableTree>({
    props: {
        value: {
            type: Array,
            default: null,
        },
        expandedKeys: {
            type: Object,
            default: null,
        },
        selectionKeys: {
            type: Object,
            default: null,
        },
        selectionMode: {
            type: String,
            default: null,
        },
        metaKeySelection: {
            type: Boolean,
            default: true,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        loadingIcon: {
            type: String,
            default: 'pi pi-spinner',
        },
        filter: {
            type: Boolean,
            default: false,
        },
        filterPlaceholder: {
            type: String,
            default: null,
        },
        filterBy: {
            type: String,
            default: 'label',
        },
        filterLocale: {
            type: String,
            default: undefined,
        },
        filterMode: {
            type: String,
            default: 'lenient',
        },
        moveable: {
            type: Boolean,
            default: false,
        },
        addableType: {
            type: Object,
            default: null,
        },
        moveableType: {
            type: Object,
            default: null,
        },
        onlyMoveableSameType: {
            type: Boolean,
            default: false,
        },
    },
    watch: {
        expandedKeys(new_value) {
            this.d_expandedKeys = new_value;
        },
    },
})
export default class IMoveableTree extends Vue {
    $refs!: {
        iFakeDragImage: HTMLElement;
        iRealDragImage: HTMLElement;
    };

    filterValue: null | string = null;
    d_expandedKeys: null | any = this.$props.expandedKeys || {};

    nodeDragging: boolean | null = null;

    treeContainer: Element | null = null;
    draggedIconState: string = 'bars';

    target: HTMLElement | null = null;
    targetNode: any | null = null;
    target_pNode: any | null = null;

    dest: HTMLElement | null = null;
    destNode: any | null = null;
    dest_pNode: any | null = null;

    findFilteredNodes(node: any, paramsWithoutNode: any) {
        if (node) {
            let matched = false;
            if (node.children) {
                const childNodes: Array<any> = [...node.children];
                node.children = [];

                for (const childNode of childNodes) {
                    const copyChildNode: any = { ...childNode };
                    if (
                        this.isFilterMatched(copyChildNode, paramsWithoutNode)
                    ) {
                        matched = true;
                        node.children.push(copyChildNode);
                    }
                }
            }

            if (matched) {
                return true;
            }
        }
    }

    handleSelectionWithMetaKey({ originalEvent, node }: any) {
        const metaKey = originalEvent.metaKey || originalEvent.ctrlKey;
        const selected = this.isNodeSelected(node);

        let _selectionKeys;
        if (selected && metaKey) {
            if (this.isSingleSelectionMode()) {
                _selectionKeys = {};
            } else {
                _selectionKeys = { ...this.$props.selectionKeys };
                delete _selectionKeys[node.key];
            }

            this.$emit('node-unselect', node);
        } else {
            if (this.isSingleSelectionMode()) {
                _selectionKeys = {};
            } else if (this.isMultipleSelectionMode()) {
                _selectionKeys = !metaKey
                    ? {}
                    : this.$props.selectionKeys
                    ? { ...this.$props.selectionKeys }
                    : {};
            }

            _selectionKeys[node.key] = true;
            this.$emit('node-select', node);
        }

        return _selectionKeys;
    }

    handleSelectionWithoutMetaKey({ node }: any) {
        const selected = this.isNodeSelected(node);

        let _selectionKeys: any;
        if (this.isSingleSelectionMode()) {
            if (selected) {
                _selectionKeys = {};
                this.$emit('node-unselect', node);
            } else {
                _selectionKeys = {};
                _selectionKeys[node.key] = true;
                this.$emit('node-select', node);
            }
        } else if (selected) {
            _selectionKeys = { ...this.$props.selectionKeys };
            delete _selectionKeys[node.key];

            this.$emit('node-unselect', node);
        } else {
            _selectionKeys = this.$props.selectionKeys
                ? { ...this.$props.selectionKeys }
                : {};
            _selectionKeys[node.key] = true;

            this.$emit('node-select', node);
        }

        return _selectionKeys;
    }

    isFilterMatched(node: any, { searchFields, filterText, strict }: any) {
        let matched = false;

        for (const field of searchFields) {
            const fieldValue = String(
                ObjectUtils.resolveFieldData(node, field)
            ).toLocaleLowerCase(this.$props.filterLocale);
            if (fieldValue.includes(filterText)) {
                matched = true;
            }
        }

        if (!matched || (strict && !this.isNodeLeaf(node))) {
            matched =
                this.findFilteredNodes(node, {
                    searchFields,
                    filterText,
                    strict,
                }) || matched;
        }

        return matched;
    }

    isNodeLeaf(node: any) {
        return node.leaf === false
            ? false
            : !(node.children && node.children.length);
    }

    isNodeSelected(node: any) {
        return this.$props.selectionMode && this.$props.selectionKeys
            ? this.$props.selectionKeys[node.key] === true
            : false;
    }

    isSingleSelectionMode() {
        return this.$props.selectionMode === 'single';
    }

    isMultipleSelectionMode() {
        return this.$props.selectionMode === 'multiple';
    }

    isChecked(node: any) {
        return this.$props.selectionKeys
            ? this.$props.selectionKeys[node.key] &&
                  this.$props.selectionKeys[node.key].checked
            : false;
    }

    onCheckboxChange(event: any) {
        this.$emit('update:selectionKeys', event.selectionKeys);

        if (event.check) {
            this.$emit('node-select', event.node);
        } else {
            this.$emit('node-unselect', event.node);
        }
    }

    onFilterKeydown(event: KeyboardEvent) {
        if (event.code === 'Enter') {
            event.preventDefault();
        }
    }

    onNodeClick(event: any) {
        if (
            this.$props.selectionMode !== null &&
            event.node.selectable !== false
        ) {
            const meteSelection = event.nodeTouched
                ? false
                : this.$props.metaKeySelection;
            const _selectionKeys = meteSelection
                ? this.handleSelectionWithMetaKey(event)
                : this.handleSelectionWithoutMetaKey(event);

            this.$emit('update:selectionKeys', _selectionKeys);
        }
    }

    // by shkoh 20220209: Tree에서 Node Item의 Drag & Drop에 관한 이벤트 처리 시작
    onNodeMouseDown(event: MouseEvent) {
        const element = event.currentTarget as HTMLElement;
        element.draggable = true;
    }

    onNodeDragStart({ originalEvent, node, p_node }: any) {
        const event = originalEvent as DragEvent;

        this.nodeDragging = true;
        this.targetNode = node;
        this.target_pNode = p_node;
        this.target = (event.currentTarget as Element).closest(
            '.i-moveable'
        ) as HTMLElement;

        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', 'b');

            event.dataTransfer.setDragImage(this.$refs.iFakeDragImage, 0, 0);
        }
    }

    onNodeDrag(event: DragEvent) {
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }

        if (!event.pageX && !event.pageY) return;

        if (this.nodeDragging) {
            this.$refs.iRealDragImage.style.left = `${event.pageX + 15}px`;
            this.$refs.iRealDragImage.style.top = `${event.pageY - 15}px`;
        }
    }

    onNodeDragOver({ originalEvent, node, p_node }: any) {
        const event = originalEvent as DragEvent;

        if (this.nodeDragging) {
            // by shkoh 20220216: dragover 이벤트 동안에 전체 tree-container를 가져옴
            const container = (event.target as HTMLElement).closest(
                '.p-tree-container'
            );

            if (container === null) {
                // by shkoh 20220215: tree 영역을 벗어난 경우에 이용할 수 없도록 표시
                this.draggedIconState = 'ban';
                this.removeDraggingNodeEffect();
            } else if (this.target?.getAttribute('data-id') === node.key) {
                // by shkoh 20220215: dragstart를 통해서 받아온 시작 Node와 dragover에서 받아온 현재 Node의 키를 비교하여 자기 자신에 대해서는 어떤 조치도 취하지 않음
                this.draggedIconState = 'ban';
            } else {
                // by shkoh 20220216: 일반적인 Drag 상황
                this.draggedIconState = 'bars';

                // by shkoh 20220216: 최종 목적 대상이 될 destination을 지정
                this.dest = (event.currentTarget as Element).closest(
                    '.i-moveable'
                ) as HTMLElement;
                this.destNode = node;
                this.dest_pNode = p_node;

                // by shkoh 20220216: 이동할 target이 존재할 경우
                if (this.target && this.dest) {
                    this.removeDraggingNodeEffect();

                    // by shkoh 20220216: 목적 Node의 위치와 크기를 계산
                    // by shkoh 20220222: this.dest의 위치와 크기를 계산할 때에는 this.dest의 i-moveable-content 클래스의 크기로만 계산함
                    // by shkoh 20220222: 그렇지 않으면 하위의 자식노드의 크기까지 계산하게 됨
                    const dest_content_element = this.dest.querySelector(
                        '.i-moveable-content'
                    ) as HTMLElement;
                    const item_h =
                        DomHandler.getOuterHeight(dest_content_element);
                    const item_pos = DomHandler.getOffset(dest_content_element);
                    const delta = item_h / 4;

                    // by shkoh 20220216: Node를 4등분하여, 한 개의 Node를 기준으로 상단에 커서가 위치하는 경우, 하단에 위치하는 경우, 중앙에 위치하는 경우로 분리
                    const itemOnTop =
                        event.pageY < item_pos.top + delta &&
                        this.moveableDragging;
                    const itemOnBottom =
                        item_pos.top + item_h - delta < event.pageY &&
                        this.moveableDragging;

                    // by shkoh 20220216: dragover 시, target node 위에 존재하는지 여부 판단에 사용
                    let on_target = false;
                    if (itemOnTop) {
                        this.draggedIconState = 'up';
                        // by shkoh 20220217: drag node의 바로 아래 노드의 up 부분을 선택할 때도 target 위에 존재하는 것으로 간주함
                        on_target = this.target.isEqualNode(
                            this.dest.previousElementSibling
                        );
                    } else if (itemOnBottom) {
                        this.draggedIconState = 'down';

                        // by shkoh 20220217: drag node의 바로 위 노드의 down 부분을 선택할 때도 target 위에 존재하는 것으로 간주함
                        on_target = this.target.isEqualNode(
                            this.dest.nextElementSibling
                        );
                    } else {
                        const is_addable_node =
                            this.$props.addableType[this.destNode.type];
                        this.draggedIconState = is_addable_node
                            ? 'plus'
                            : 'ban';
                    }

                    // by shkoh 20220222: add가 가능한 여부인지 데이터를 통해서 판단이 필요함

                    // by shkoh 20220216: target node 위에 dragover하고 있는 경우에는 move를 할 수 없다
                    if (on_target) {
                        this.draggedIconState = 'ban';
                    } else {
                        let is_ban = false;

                        // by shkoh 20220217: target node에 Drag를 하지 않더라도
                        const target_depth =
                            this.target.getAttribute('data-depth') ?? '-1';

                        // by shkoh 20220217: dest node의 부모들을 훑어서 target의 Depth까지 올라가 일치여부를 판단함. 일치할 경우에는 이동 작업 불가
                        const dest_ancestor = this.findClosestAcestor(
                            this.dest,
                            target_depth
                        );
                        if (dest_ancestor) {
                            is_ban = dest_ancestor.isEqualNode(this.target);
                        }

                        // by shkoh 20220217: target node의 바로 위 부모를 검색하여 dest node인 경우에는 아무 일도 일어나지 않음
                        const target_parent =
                            this.target.parentElement?.closest(`[data-depth]`);
                        if (!is_ban && target_parent) {
                            is_ban = target_parent.isEqualNode(this.dest);
                        }

                        if (is_ban) {
                            this.draggedIconState = 'ban';
                        }
                    }

                    // by shkoh 20220216: 현재 사용 중인 container를 지정함
                    this.treeContainer = container;

                    const hover_node = this.dest.querySelector(
                        '.i-moveable-content'
                    ) as HTMLElement;
                    const target_pos = DomHandler.getOffset(this.target);

                    if (this.draggedIconState === 'plus') {
                        DomHandler.addClass(hover_node, 'i-node-enter');
                    } else if (this.draggedIconState === 'up') {
                        let top_line: HTMLElement | null;
                        if (target_pos.top < target_pos.top) {
                            top_line = this.dest.children[0] as HTMLElement;
                        } else {
                            const prev = this.dest
                                .previousElementSibling as HTMLElement;
                            if (prev) {
                                top_line = prev.children[2] as HTMLElement;
                            } else {
                                top_line = this.dest.children[0] as HTMLElement;
                            }
                        }

                        if (top_line) {
                            top_line.style.display = 'block';
                            DomHandler.addClass(top_line, 'i-show');
                        }
                    } else if (this.draggedIconState === 'down') {
                        let bottom_line: HTMLElement | null;
                        if (target_pos.top < target_pos.top) {
                            bottom_line = this.dest.nextElementSibling
                                ?.children[0] as HTMLElement;
                        } else {
                            bottom_line = this.dest.children[2] as HTMLElement;
                        }

                        if (bottom_line) {
                            bottom_line.style.display = 'block';
                            DomHandler.addClass(bottom_line, 'i-show');
                        }
                    } else if (this.draggedIconState === 'ban') {
                        this.removeDraggingNodeEffect();
                    }
                } else {
                    // by shkoh 20220216: 마지막으로 선택된 노드에 대한 처리
                    this.removeDraggingNodeEffect();
                }
            }
        }

        event.preventDefault();
    }

    onNodeDragEnd(event: DragEvent) {
        const element = event.currentTarget as HTMLElement;
        element.draggable = false;

        if (
            this.draggedIconState === 'up' ||
            this.draggedIconState === 'down'
        ) {
            // by shkoh 20220216: move
            this.moveNode(this.draggedIconState === 'up' ? true : false);
        } else if (this.draggedIconState === 'plus') {
            // by shkoh 20220216: insert
            this.insertNode();
        }

        this.nodeDragging = false;
        this.targetNode = null;
        this.target = null;
        this.target_pNode = null;

        this.dest = null;
        this.destNode = null;
        this.dest_pNode = null;

        this.draggedIconState = 'bars';

        this.removeDraggingNodeEffect();
    }

    onNodeDrop(event: DragEvent) {
        event.preventDefault();
    }

    removeDraggingNodeEffect() {
        if (this.treeContainer) {
            this.treeContainer
                .querySelectorAll('.i-node-enter')
                .forEach((n: Element) => {
                    DomHandler.removeClass(n, 'i-node-enter');
                });

            this.treeContainer
                .querySelectorAll('.i-show')
                .forEach((n: Element) => {
                    DomHandler.removeClass(n, 'i-show');
                    (n as HTMLElement).style.display = 'none';
                });
            this.treeContainer = null;
        }
    }

    findClosestAcestor(
        ele: HTMLElement,
        target_depth: string
    ): HTMLElement | null {
        const parent = ele.parentElement?.closest(
            '[data-depth]'
        ) as HTMLElement;

        if (!parent) {
            return null;
        } else {
            const depth = parent.getAttribute('data-depth');
            if (depth === target_depth) {
                return parent;
            } else {
                return this.findClosestAcestor(parent, target_depth);
            }
        }
    }

    moveNode(is_up: boolean) {
        this.deleteNode();

        if (this.dest_pNode) {
            const dest_index = this.dest_pNode.children.findIndex(
                (n: any) => n.key === this.destNode.key
            );
            const idx = dest_index + (is_up ? 0 : 1);
            this.dest_pNode.children.splice(idx, 0, this.targetNode);

            this.targetNode.parent_key = this.dest_pNode.key;
            this.targetNode.order = idx + 1;
        }

        this.$emit('move-tree', this.targetNode, this.destNode);
    }

    insertNode() {
        this.deleteNode();

        this.destNode.children.push(this.targetNode);
        this.targetNode.parent_key = this.destNode.key;
        this.targetNode.order = this.destNode.children.length;
        if (!this.d_expandedKeys[this.destNode.key]) {
            this.onNodeToggle(this.destNode);
        }

        this.$emit('insert-tree', this.targetNode, this.destNode);
    }

    deleteNode() {
        if (this.target_pNode) {
            const target_index = this.target_pNode.children.findIndex(
                (n: any) => n.key === this.targetNode.key
            );

            if (target_index !== -1) {
                this.target_pNode.children.splice(target_index, 1);
            }
        }
    }
    // by shkoh 20220209: Tree에서 Node Item의 Drag & Drop에 관한 이벤트 처리 끝

    onNodeToggle(node: any) {
        const key = node.key;

        if (this.d_expandedKeys[key]) {
            delete this.d_expandedKeys[key];
            this.$emit('node-collapse', node);
        } else {
            this.d_expandedKeys[key] = true;
            this.$emit('node-expand', node);
        }

        this.d_expandedKeys = { ...this.d_expandedKeys };
        this.$emit('update:expandedKeys', this.d_expandedKeys);
    }

    get containerClass(): Array<String | Object> {
        return [
            'p-tree p-component',
            {
                'p-tree-selectable': this.$props.selectionMode !== null,
                'p-tree-loading': this.$props.loading,
            },
        ];
    }

    get loadingIconClass(): Array<String> {
        return ['p-tree-loading-icon pi-spin', this.$props.loadingIcon];
    }

    get filteredValue(): Array<any> {
        const filteredNodes: Array<any> = [];
        const searchFields = this.$props.filterBy.split(',');
        const filterText = this.filterValue
            ?.trim()
            .toLocaleLowerCase(this.$props.filterLocale);
        const strict = this.$props.filterMode === 'strict';

        for (const node of this.$props.value) {
            const _node = { ...node };
            const paramsWithoutNode = { searchFields, filterText, strict };

            if (
                (strict &&
                    (this.findFilteredNodes(_node, paramsWithoutNode) ||
                        this.isFilterMatched(_node, paramsWithoutNode))) ||
                (!strict &&
                    (this.isFilterMatched(_node, paramsWithoutNode) ||
                        this.findFilteredNodes(_node, paramsWithoutNode)))
            ) {
                filteredNodes.push(_node);
            }
        }

        return filteredNodes;
    }

    get valueToRender(): any | null {
        if (this.filterValue && this.filterValue.trim().length > 0) {
            return this.filteredValue;
        } else {
            return this.$props.value;
        }
    }

    get node_movable(): boolean {
        return (
            this.$props.moveable &&
            !(this.filterValue && this.filterValue.trim().length > 0)
        );
    }

    get moveableDragging(): boolean {
        const target_type = this.targetNode?.type;
        const dest_type = this.destNode?.type;
        const is_moveable_target =
            this.$props.moveableType[this.targetNode?.type];

        return is_moveable_target
            ? true
            : this.$props.onlyMoveableSameType
            ? target_type === dest_type
            : false;
    }

    get getDraggedNodeLabel(): string {
        return this.targetNode?.label ?? 'UNKNOWN';
    }

    get dragIconClass(): string {
        let icon = 'pi ';
        switch (this.draggedIconState) {
            case 'bars':
                icon += 'pi-bars';
                break;
            case 'plus':
                icon += 'pi-plus';
                break;
            case 'ban':
                icon += 'pi-ban';
                break;
            case 'up':
            case 'down':
                icon += 'pi-angle-double-right';
                break;
            default:
                break;
        }
        return icon;
    }
}
</script>

<style lang="scss" scoped>
#i-moveable-tree::v-deep {
    .i-fake-dragimage {
        display: block;
        pointer-events: none;
        opacity: 0;
    }
}

.i-real-dragimage {
    position: absolute;
    z-index: 1002;

    .p-chip {
        padding: 0.3rem 0.6rem;
        user-select: none;
        border-radius: 10px;
    }
}
</style>
