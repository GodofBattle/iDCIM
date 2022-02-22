<template>
    <li :class="containerClass" :data-id="node.key" :data-depth="depth">
        <Skeleton
            class="i-tree-line"
            v-show="false"
            width="40%"
            height="0.3rem"
        ></Skeleton>
        <div
            :class="contentClass"
            :style="node.style"
            :aria-expanded="expanded"
            tabindex="0"
            role="treeitem"
            @click="onClick"
            @keydown="onKeyDown"
            @touchend="onTouchEnd"
            @mousedown="onMouseDown($event)"
            @dragstart="onDragStart($event, node)"
            @drag="onDrag($event)"
            @dragover="onDragOver($event, node)"
            @dragend="onDragEnd($event)"
            @drop="onDrop($event)"
        >
            <Button
                type="button"
                class="p-tree-toggler p-link"
                tabindex="-1"
                @click="toggle"
            >
                <span :class="toggleIcon"></span>
            </Button>
            <div v-if="checkboxMode" class="p-checkbox p-component">
                <div
                    :class="checkboxClass"
                    role="checkbox"
                    :aria-checked="checked"
                >
                    <span :class="checkboxIcon"></span>
                </div>
            </div>
            <span :class="icon"></span>
            <span class="p-treenode-label">
                <i-movable-tree-node-template
                    :node="node"
                    :template="templates[node.type] || templates['default']"
                ></i-movable-tree-node-template>
            </span>
        </div>
        <Skeleton
            class="i-tree-line"
            v-show="false"
            width="40%"
            height="0.3rem"
        ></Skeleton>
        <ul
            v-if="hasChildren && expanded"
            class="p-treenode-children"
            role="group"
        >
            <sub-treenode
                v-for="(childNode, index) in node.children"
                :key="childNode.key"
                :depth="depth + 1"
                :node="childNode"
                :templates="templates"
                :expanded-keys="expandedKeys"
                :selection-mode="selectionMode"
                :selection-keys="selectionKeys"
                :movable="movable"
                :order="index + 1"
                @node-toggle="onChildNodeToggle"
                @node-click="onChildNodeClick"
                @checkbox-change="propagateUp"
                @node-mousedown="onNodeMouseDown($event)"
                @node-dragstart="onNodeDragStart($event, childNode, node)"
                @node-drag="onNodeDrag($event)"
                @node-dragover="onNodeDragOver($event, childNode, node)"
                @node-dragend="onNodeDragEnd($event)"
                @node-drop="onNodeDrop($event)"
            ></sub-treenode>
        </ul>
    </li>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';
import DomHandler from '@/plugins/primevue.DomHandler';

@Component<IMovableTreeNode>({
    name: 'sub-treenode',
    props: {
        node: {
            type: Object,
            default: null,
        },
        expandedKeys: {
            type: undefined,
            default: null,
        },
        selectionMode: {
            type: String,
            default: null,
        },
        selectionKeys: {
            type: Object,
            default: null,
        },
        templates: {
            type: Object,
            default: null,
        },
        movable: {
            type: Boolean,
            default: false,
        },
        depth: {
            type: Number,
            default: 1,
        },
        order: {
            type: Number,
            default: 1,
        },
    },
    watch: {
        order(_new_order) {
            this.$props.node.order = _new_order;
        },
    },
})
export default class IMovableTreeNode extends Vue {
    nodeTouched: boolean = false;

    findLastVisibleDescendant(element: Element | null): Element | null {
        const childrenListElement = element?.children[1];
        if (childrenListElement) {
            const lastChildElement = childrenListElement.lastElementChild;
            return this.findLastVisibleDescendant(lastChildElement);
        } else {
            return element;
        }
    }

    findNextSiblingOfAncestor(htmlElement: HTMLElement | null): Element | null {
        const parentNodeElement = this.getParentNodeElement(htmlElement);
        if (parentNodeElement) {
            if (parentNodeElement.nextElementSibling) {
                return parentNodeElement.nextElementSibling;
            } else {
                return this.findNextSiblingOfAncestor(parentNodeElement);
            }
        } else {
            return null;
        }
    }

    focusNode(element: Element) {
        (element.firstElementChild as HTMLElement).focus();
    }

    getParentNodeElement(htmlElement: HTMLElement | null) {
        const parentNodeElement = htmlElement?.parentElement?.parentElement;
        return DomHandler.hasClass(parentNodeElement, 'p-treenode')
            ? parentNodeElement
            : null;
    }

    isCheckboxSelectionMode() {
        return this.$props.selectionMode === 'checkbox';
    }

    onChildNodeClick(event: any) {
        this.$emit('node-click', event);
    }

    onChildNodeToggle(node: any) {
        this.$emit('node-toggle', node);
    }

    onClick(event: PointerEvent | KeyboardEvent) {
        if (
            DomHandler.hasClass(event.target, 'p-tree-toggler') ||
            DomHandler.hasClass(
                (event.target as Element).parentElement,
                'p-tree-toggler'
            )
        ) {
            return;
        }

        if (this.isCheckboxSelectionMode()) {
            this.toggleCheckbox();
        } else {
            this.$emit('node-click', {
                originalEvent: event,
                nodeTouched: this.nodeTouched,
                node: this.$props.node,
            });
        }

        this.nodeTouched = false;
    }

    onKeyDown(event: KeyboardEvent) {
        const nodeElement = (event.target as HTMLElement).parentElement;

        switch (event.code) {
            case 'ArrowDown': {
                const listElement = nodeElement?.children[1];
                console.info(listElement);
                if (listElement) {
                    this.focusNode(listElement.children[0]);
                } else {
                    const nextNodeElement = nodeElement?.nextElementSibling;
                    if (nextNodeElement) {
                        this.focusNode(nextNodeElement);
                    } else {
                        const nextSiblingAncestor =
                            this.findNextSiblingOfAncestor(nodeElement);
                        if (nextSiblingAncestor) {
                            this.focusNode(nextSiblingAncestor);
                        }
                    }
                }

                event.preventDefault();
                break;
            }
            case 'ArrowUp': {
                const previousElement = nodeElement?.previousElementSibling;
                if (previousElement) {
                    const lastElement =
                        this.findLastVisibleDescendant(previousElement);
                    if (lastElement) {
                        this.focusNode(lastElement);
                    }
                } else {
                    const parentNodeElement =
                        this.getParentNodeElement(nodeElement);
                    if (parentNodeElement) {
                        this.focusNode(parentNodeElement);
                    }
                }

                event.preventDefault();
                break;
            }
            case 'ArrowLeft':
            case 'ArrowRight': {
                this.$emit('node-toggle', this.$props.node);
                event.preventDefault();
                break;
            }
            case 'Enter':
            case 'Space': {
                this.onClick(event);
                event.preventDefault();
                break;
            }
            default: {
                break;
            }
        }
    }

    // by shkoh 20220209: Tree에서 Node Item의 Drag & Drop에 관한 이벤트 처리 시작
    onMouseDown(event: MouseEvent) {
        if (this.$props.depth > 1 && this.$props.movable) {
            this.$emit('node-mousedown', event);
        }
    }

    onDragStart(event: DragEvent, node: any) {
        if (this.$props.depth > 1 && this.$props.movable) {
            this.$emit('node-dragstart', { originalEvent: event, node }, node);
        }
    }

    onDrag(event: DragEvent) {
        if (this.$props.depth > 1 && this.$props.movable)
            this.$emit('node-drag', event);
    }

    onDragOver(event: DragEvent, node: any) {
        if (this.$props.depth > 1 && this.$props.movable) {
            this.$emit('node-dragover', { originalEvent: event, node });
        }
    }

    onDragEnd(event: DragEvent) {
        if (this.$props.depth > 1 && this.$props.movable)
            this.$emit('node-dragend', event);
    }

    onDrop(event: DragEvent) {
        if (this.$props.depth > 1 && this.$props.movable)
            this.$emit('node-drop', event);
    }

    onNodeMouseDown(event: MouseEvent) {
        if (this.$props.movable) {
            this.$emit('node-mousedown', event);
        }
    }

    onNodeDragStart(event: any, child_node: any, parent_node: any) {
        // by shkoh 20220221: event parameter는 originalEvent와 최초 이벤트 발생 노드의 정보를 가지고 있다
        if (this.$props.movable) {
            // by shkoh 20220222: Drag가 시작하는 순간에 내 바로 위의 parent_node의 정보를 기록
            if (event.node && event.node.key === child_node.key) {
                event['p_node'] = parent_node;
            }
            this.$emit('node-dragstart', event, child_node);
        }
    }

    onNodeDrag(event: DragEvent) {
        if (this.$props.movable) {
            this.$emit('node-drag', event);
        }
    }

    onNodeDragOver(event: any, child_node: any, parent_node: any) {
        if (this.$props.movable) {
            if (event.node && event.node.key === child_node.key) {
                event['p_node'] = parent_node;
            }

            this.$emit('node-dragover', event);
        }
    }

    onNodeDragEnd(event: DragEvent) {
        if (this.$props.movable) {
            this.$emit('node-dragend', event);
        }
    }

    onNodeDrop(event: DragEvent) {
        if (this.$props.movable) {
            this.$emit('node-drop', event);
        }
    }
    // by shkoh 20220209: Tree에서 Node Item의 Drag & Drop에 관한 이벤트 처리 끝

    onTouchEnd() {
        this.nodeTouched = true;
    }

    propagteDown(node: any, check: boolean, selectionKeys: any) {
        if (check) {
            selectionKeys[node.key] = { checked: true, partialChecked: false };
        } else {
            delete selectionKeys[node.key];
        }

        if (node.children && node.children.length) {
            for (const child of node.children) {
                this.propagteDown(child, check, selectionKeys);
            }
        }
    }

    propagateUp({ node, check, selectionKeys }: any) {
        const _selectionKeys = { ...selectionKeys };
        let checkedChildCount = 0;
        let childPartialSelected = false;

        for (const child of this.$props.node.children) {
            if (_selectionKeys[child.key] && _selectionKeys[child.key].checked)
                checkedChildCount++;
            else if (
                _selectionKeys[child.key] &&
                _selectionKeys[child.key].partialChecked
            )
                childPartialSelected = true;
        }

        if (check && checkedChildCount === this.$props.node.children.length) {
            _selectionKeys[this.$props.node.key] = {
                checked: true,
                partialChecked: false,
            };
        } else {
            if (!check) {
                delete _selectionKeys[this.$props.node.key];
            }

            if (
                childPartialSelected ||
                (checkedChildCount > 0 &&
                    checkedChildCount !== this.$props.node.children.length)
            )
                _selectionKeys[this.$props.node.key] = {
                    checked: false,
                    partialChecked: true,
                };
            else
                _selectionKeys[this.$props.node.key] = {
                    checked: false,
                    partialChecked: false,
                };
        }

        this.$emit('checkbox-change', {
            node,
            check,
            selectionKeys: _selectionKeys,
        });
    }

    toggle() {
        this.$emit('node-toggle', this.$props.node);
    }

    toggleCheckbox() {
        const _selectionKeys = this.$props.selectionKeys
            ? { ...this.$props.selectionKeys }
            : {};
        const _check = !this.checked;

        this.propagteDown(this.$props.node, _check, _selectionKeys);

        this.$emit('checkbox-change', {
            node: this.$props.node,
            check: _check,
            selectionKeys: _selectionKeys,
        });
    }

    get checkboxClass(): Array<string | object> {
        return [
            'p-checkbox-box',
            {
                'p-highlight': this.checked,
                'p-indeterminate': this.partialChecked,
            },
        ];
    }

    get checkboxIcon(): Array<string | object> {
        return [
            'p-checkbox-icon',
            { 'pi pi-check': this.checked, 'pi pi-minus': this.partialChecked },
        ];
    }

    get checkboxMode(): boolean {
        return (
            this.$props.selectionMode === 'checkbox' &&
            this.$props.node.selectable !== false
        );
    }

    get checked() {
        return this.$props.selectionKeys
            ? this.$props.selectionKeys[this.$props.node.key] &&
                  this.$props.selectionKeys[this.$props.node.key].checked
            : false;
    }

    get containerClass(): Array<string | object> {
        return [
            'p-treenode',
            {
                'p-treenode-leaf': this.leaf,
                'i-movable': this.$props.depth > 1 && this.$props.movable,
            },
        ];
    }

    get contentClass(): Array<string | object> {
        return [
            'p-treenode-content',
            'p-d-flex',
            this.$props.node.styleClass,
            {
                'p-treenode-selectable': this.selectable,
                'p-highlight': this.checkboxMode ? this.checked : this.selected,
                'i-movable-content':
                    this.$props.depth > 1 && this.$props.movable,
            },
        ];
    }

    get expanded(): boolean {
        return (
            this.$props.expandedKeys &&
            this.$props.expandedKeys[this.$props.node.key] === true
        );
    }

    get hasChildren(): boolean {
        return (
            this.$props.node.children && this.$props.node.children.length > 0
        );
    }

    get icon(): Array<string> {
        return ['p-treenode-icon', this.$props.node.icon];
    }

    get leaf(): boolean {
        return this.$props.node.leaf === false
            ? false
            : !(this.$props.node.children && this.$props.node.children.length);
    }

    get partialChecked(): boolean {
        return this.$props.selectionKeys
            ? this.$props.selectionKeys[this.$props.node.key] &&
                  this.$props.selectionKeys[this.$props.node.key].partialChecked
            : false;
    }

    get selectable(): boolean {
        return this.$props.node.selectable === false
            ? false
            : this.$props.selectionMode !== null;
    }

    get selected(): boolean {
        return this.$props.selectionMode && this.$props.selectionKeys
            ? this.$props.selectionKeys[this.$props.node.key] === true
            : false;
    }

    get toggleIcon(): Array<string | object> {
        return [
            'p-tree-toggler-icon pi pi-fw',
            {
                'pi-chevron-down': this.expanded,
                'pi-chevron-right': !this.expanded,
            },
        ];
    }
}
</script>

<style lang="scss" scoped>
.p-tree .p-tree-container .p-treenode .p-treenode-content.i-movable-content {
    user-select: none;

    &:focus {
        cursor: move;
    }
}

.i-tree-line {
    background-color: var(--primary-color);
}

.i-node-enter {
    outline: 1px dotted var(--text-color-secondary);
    opacity: 0.3;
    background-color: var(--primary-color);
}
</style>
