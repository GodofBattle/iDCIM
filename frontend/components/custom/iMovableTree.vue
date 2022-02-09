<template>
    <div id="i-movable-tree" :class="containerClass">
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
            <i-movable-tree-node
                v-for="node of valueToRender"
                :key="node.key"
                :node="node"
                :templates="$scopedSlots"
                :selection-mode="selectionMode"
                :expanded-keys="d_expandedKeys"
                :selection-keys="selectionKeys"
                :movable="movable"
                @node-click="onNodeClick"
                @node-dragstart="onNodeDragStart"
                @node-dragover="onNodeDragOver"
                @node-dragleave="onNodeDragLeave"
                @node-dragend="onNodeDragEnd"
                @node-drop="onNodeDrop"
                @node-mousedown="onNodeMouseDown"
                @node-toggle="onNodeToggle"
                @checkbox-change="onCheckboxChange"
            ></i-movable-tree-node>
        </ul>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import ObjectUtils from '@/plugins/primevue.ObjectUtils';
import Component from '@/plugins/nuxt-class-component';
import DomHandler from '~/plugins/primevue.DomHandler';

@Component<IMovableTree>({
    props: {
        value: {
            type: Array,
            default: null
        },
        expandedKeys: {
            type: Object,
            default: null
        },
        selectionKeys: {
            type: Object,
            default: null
        },
        selectionMode: {
            type: String,
            default: null
        },
        metaKeySelection: {
            type: Boolean,
            default: true
        },
        loading: {
            type: Boolean,
            default: false
        },
        loadingIcon: {
            type: String,
            default: 'pi pi-spinner'
        },
        filter: {
            type: Boolean,
            default: false
        },
        filterPlaceholder: {
            type: String,
            default: null
        },
        filterBy: {
            type: String,
            default: 'label'
        },
        filterLocale: {
            type: String,
            default: undefined
        },
        filterMode: {
            type: String,
            default: 'lenient'
        },
        movable: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        expandedKeys(new_value) {
            this.d_expandedKeys = new_value;
        }
    }
})
export default class IMovableTree extends Vue {
    filterValue: null | string = null;
    d_expandedKeys: null | any = this.$props.expandedKeys || {};

    nodeDragging: boolean | null = null;
    draggedNodeKey: string | null = null;
    droppedNodeKey: string | null = null;

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
                    strict
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
    onNodeMouseDown(event: any) {
        if (DomHandler.hasClass(event.target, 'i-movable')) {
            event.currentTarget.draggable = true;
        } else {
            event.currentTarget.draggable = false;
        }
    }

    onNodeDragStart({ originalEvent, key }: any) {
        this.nodeDragging = true;
        this.draggedNodeKey = key;

        // by shkoh 20220208: 이유는 모르지만 firebfox
        originalEvent.dataTransfer.setData('text', 'b');

        console.info('start');
    }

    onNodeDragOver({ originalEvent, key }: any) {
        const event = originalEvent as DragEvent;

        if (this.nodeDragging) {
            const node_element = event.currentTarget as HTMLElement;

            if (this.draggedNodeKey === key) {
                const offset = DomHandler.getOffset(node_element);
                const scrolltop = DomHandler.getWindowScrollTop();
                const row_y = offset.top + scrolltop;
                const page_y = event.pageY;
                const ele_outer_h = DomHandler.getOuterHeight(
                    node_element,
                    true
                );
                const row_mid_y = row_y + ele_outer_h / 2;

                console.info(
                    `${offset.top}, ${scrolltop}, ${row_y}, ${page_y}, ${ele_outer_h}, ${row_mid_y}`
                );

                if (page_y > row_mid_y) {
                    DomHandler.addClass(
                        node_element,
                        'i-movable-dragpoint-bottom'
                    );
                } else if (page_y < row_mid_y) {
                    DomHandler.addClass(
                        node_element,
                        'i-movable-dragpoint-top'
                    );
                }
            } else if (this.draggedNodeKey !== key) {
                console.info('new_over');
            }

            event.preventDefault();
        }

        // if (this.nodeDragging && this.draggedNodeKey !== key) {
        //     const node_element = event.currentTarget as HTMLElement;

        //     const row_y =
        //         DomHandler.getOffset(node_element).top +
        //         DomHandler.getWindowScrollTop();

        //     const page_y = event.pageY;

        //     const row_mid_y =
        //         row_y + DomHandler.getOuterHeight(node_element, true) / 2;

        //     const prev_node_element =
        //         node_element.previousElementSibling as HTMLElement;

        //     if (page_y < row_mid_y) {
        //         DomHandler.removeClass(
        //             node_element,
        //             'i-movable-dragpoint-bottom'
        //         );

        //         this.droppedNodeKey = key;
        //         if (prev_node_element) {
        //             DomHandler.addClass(
        //                 prev_node_element,
        //                 'i-movable-dragpoint-bottom'
        //             );
        //         } else {
        //             DomHandler.addClass(
        //                 node_element,
        //                 'i-movable-dragpoint-top'
        //             );
        //         }
        //     } else {
        //         if (prev_node_element) {
        //             DomHandler.removeClass(
        //                 prev_node_element,
        //                 'i-movable-dragpoint-bottom'
        //             );
        //         } else {
        //             DomHandler.addClass(
        //                 node_element,
        //                 'i-movable-dragpoint-top'
        //             );
        //         }

        //         this.droppedNodeKey = key;
        //         DomHandler.addClass(node_element, 'i-movable-dragpoint-bottom');
        //     }

        //     event.preventDefault();
        // }
    }

    onNodeDragLeave(event: DragEvent) {
        const node_element = event.currentTarget as HTMLElement;
        const prev_node_element = node_element.previousElementSibling;

        if (prev_node_element) {
            DomHandler.removeClass(
                prev_node_element,
                'i-movable-dragpoint-bottom'
            );
        }

        DomHandler.removeClass(node_element, 'i-movable-dragpoint-bottom');
        DomHandler.removeClass(node_element, 'i-movable-dragpoint-top');

        console.info('onNodeDragLeave');
        event.preventDefault();
    }

    onNodeDragEnd(event: DragEvent) {
        this.nodeDragging = false;
        this.draggedNodeKey = null;
        this.droppedNodeKey = null;
        (event.currentTarget as HTMLElement).draggable = false;
    }

    onNodeDrop(event: DragEvent) {
        if (this.droppedNodeKey !== null) {
            console.info('onNodeDrop');
        }

        // by shkoh 20220209: Drag 내용 정리
        this.onNodeDragLeave(event);
        this.onNodeDragEnd(event);
        event.preventDefault();
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
                'p-tree-loading': this.$props.loading
            }
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
            return this.$props.filteredValue;
        } else {
            return this.$props.value;
        }
    }
}
</script>
