<template>
    <li :class="containerClass">
        <div
            :class="contentClass"
            :style="node.style"
            :aria-expanded="expanded"
            tabindex="0"
            role="treeitem"
            @click="onClick"
            @keydown="onKeyDown"
            @touchend="onTouchEnd"
            @mousedown="onNodeMouseDown($event)"
            @dragstart="onNodeDragStart($event, node.key)"
            @dragover="onNodeDragOver($event, node.key)"
            @dragleave="onNodeDragLeave($event)"
            @dragend="onNodeDragEnd($event)"
            @drop="onNodeDrop($event)"
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
            <span v-if="movable" :class="movableClass"></span>
        </div>
        <ul
            v-if="hasChildren && expanded"
            class="p-treenode-children"
            role="group"
        >
            <sub-treenode
                v-for="childNode of node.children"
                :key="childNode.key"
                :node="childNode"
                :templates="templates"
                :expanded-keys="expandedKeys"
                :selection-mode="selectionMode"
                :selection-keys="selectionKeys"
                :movable="movable"
                @node-toggle="onChildNodeToggle"
                @node-click="onChildNodeClick"
                @checkbox-change="propagateUp"
                @node-mousedown="onChildNodeMouseDown($event)"
                @node-dragstart="onChildNodeDragStart($event, childNode.key)"
                @node-dragover="onChildNodeDragOver($event, childNode.key)"
                @node-dragleave="onChildNodeDragLeave($event)"
                @node-dragend="onChildNodeDragEnd($event)"
                @node-drop="onChildNodeDrop($event)"
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
            default: null
        },
        expandedKeys: {
            type: undefined,
            default: null
        },
        selectionMode: {
            type: String,
            default: null
        },
        selectionKeys: {
            type: Object,
            default: null
        },
        templates: {
            type: Object,
            default: null
        },
        movable: {
            type: Boolean,
            default: false
        }
    }
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
                node: this.$props.node
            });
        }

        this.nodeTouched = false;
    }

    onKeyDown(event: KeyboardEvent) {
        const nodeElement = (event.target as HTMLElement).parentElement;

        switch (event.code) {
            case 'ArrowDown': {
                const listElement = nodeElement?.children[1];
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
    onChildNodeMouseDown(event: any) {
        this.$emit('node-mousedown', event);
    }

    onChildNodeDragStart(event: any, key: string) {
        // by shkoh 20220209: Child Node는 부모의 이벤트를 먼저 수행하고 해당 인자를 전달 받음
        this.$emit('node-dragstart', {
            originalEvent: event.originalEvent,
            key
        });
    }

    onChildNodeDragOver(event: any, key: string) {
        // by shkoh 20220209: Child Node는 부모의 이벤트를 먼저 수행하고 해당 인자를 전달 받음
        this.$emit('node-dragover', {
            originalEvent: event.originalEvent,
            key
        });
    }

    onChildNodeDragLeave(event: any) {
        this.$emit('node-dragleave', event);
    }

    onChildNodeDragEnd(event: any) {
        this.$emit('node-dragend', event);
    }

    onChildNodeDrop(event: any) {
        this.$emit('node-drop', event);
    }

    onNodeMouseDown(event: MouseEvent) {
        this.$emit('node-mousedown', event);
    }

    onNodeDragStart(event: DragEvent, key: string) {
        this.$emit('node-dragstart', { originalEvent: event, key });
    }

    onNodeDragOver(event: DragEvent, key: string) {
        this.$emit('node-dragover', { originalEvent: event, key });
    }

    onNodeDragLeave(event: DragEvent) {
        this.$emit('node-dragleave', event);
    }

    onNodeDragEnd(event: DragEvent) {
        this.$emit('node-dragend', event);
    }

    onNodeDrop(event: DragEvent) {
        this.$emit('node-drop', event);
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
                partialChecked: false
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
                    partialChecked: true
                };
            else
                _selectionKeys[this.$props.node.key] = {
                    checked: false,
                    partialChecked: false
                };
        }

        this.$emit('checkbox-change', {
            node,
            check,
            selectionKeys: _selectionKeys
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
            selectionKeys: _selectionKeys
        });
    }

    get checkboxClass(): Array<string | object> {
        return [
            'p-checkbox-box',
            {
                'p-highlight': this.checked,
                'p-indeterminate': this.partialChecked
            }
        ];
    }

    get checkboxIcon(): Array<string | object> {
        return [
            'p-checkbox-icon',
            { 'pi pi-check': this.checked, 'pi pi-minus': this.partialChecked }
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
        return ['p-treenode', { 'p-treenode-leaf': this.leaf }];
    }

    get contentClass(): Array<string | object> {
        return [
            'p-treenode-content',
            'p-d-flex',
            this.$props.node.styleClass,
            {
                'p-treenode-selectable': this.selectable,
                'p-highlight': this.checkboxMode ? this.checked : this.selected
            }
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

    get movableClass(): Array<string | object> {
        return [
            'p-ml-auto p-p-2',
            {
                'pi pi-bars i-movable': this.$props.movable
            }
        ];
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
                'pi-chevron-right': !this.expanded
            }
        ];
    }
}
</script>

<style lang="scss" scoped>
.i-movable {
    cursor: move;
}

.i-movable:hover {
    background-color: var(--primary-color);
}

.i-movable-dragpoint-bottom {
    padding-bottom: 24px;
    // border-bottom: 20px solid var(--primary-color);
    // box-shadow: inset 0 2px 0 0 rgba(100, 181, 246, 0.16);
    // border-top: 20px solid var(--primary-color);
    // border-top-left-radius: 0;
    // border-top-right-radius: 0;
}

.i-movable-dragpoint-top {
    padding-top: 24px;
    // box-shadow: inset 0 -2px 0 0 rgba(100, 181, 246, 0.16);
    // border-bottom: 20px solid var(--primary-color);
    // border-bottom-left-radius: 0;
    // border-bottom-right-radius: 0;
}
</style>
