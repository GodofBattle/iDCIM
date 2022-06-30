<template>
    <div
        v-if="isAdvanced"
        class="p-fileupload p-fileupload-advanced p-component"
    >
        <div class="p-fileupload-buttonbar">
            <span
                v-ripple
                :class="advancedChooseButtonClass"
                :style="buttonStyle"
                tabindex="0"
                @click="choose"
                @keydown.enter="choose"
                @focus="onFocus"
                @blur="onBlur"
            >
                <input
                    ref="fileInput"
                    type="file"
                    :multiple="multiple"
                    :accept="accept"
                    :disabled="chooseDisabled"
                    @change="onFileSelect"
                />
                <span
                    class="p-button-icon p-button-icon-left pi pi-fw pi-plus"
                ></span>
                <span class="p-button-label">{{ chooseButtonLabel }}</span>
            </span>
            <FileUploadButton
                v-if="showUploadButton"
                :label="uploadButtonLabel"
                icon="pi pi-upload"
                :disabled="uploadDisabled"
                @click="upload"
            />
            <FileUploadButton
                v-if="showCancelButton"
                :label="cancelButtonLabel"
                icon="pi pi-times"
                :disabled="cancelDisabled"
                @click="clear"
            />
        </div>
        <div
            ref="content"
            class="p-fileupload-content"
            @dragenter="onDragEnter"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @drop="onDrop"
        >
            <FileUploadProgressBar v-if="hasFiles" :value="progress" />
            <FileUploadMessage
                v-for="msg of messages"
                :key="msg"
                severity="error"
                >{{ msg }}</FileUploadMessage
            >
            <div v-if="hasFiles" class="p-fileupload-files">
                <div
                    v-for="(file, index) of files"
                    :key="file.name + file.type + file.size"
                    class="p-fileupload-row"
                >
                    <div>
                        <img
                            v-if="isImage(file)"
                            role="presentation"
                            :alt="file.name"
                            :src="file.objectURL"
                            :width="previewWidth"
                        />
                    </div>
                    <div class="p-fileupload-filename">{{ file.name }}</div>
                    <div>{{ formatSize(file.size) }}</div>
                    <div>
                        <FileUploadButton
                            type="button"
                            icon="pi pi-times"
                            @click="remove(index)"
                        />
                    </div>
                </div>
            </div>
            <div
                v-if="$scopedSlots.empty && !hasFiles"
                class="p-fileupload-empty"
            >
                <slot name="empty"></slot>
            </div>
        </div>
    </div>
    <div
        v-else-if="isBasic"
        class="p-fileupload p-fileupload-basic p-component"
    >
        <FileUploadMessage v-for="msg of messages" :key="msg" severity="error">
            {{ msg }}
        </FileUploadMessage>
        <span
            v-ripple
            :class="basicChooseButtonClass"
            :style="buttonStyle"
            tabindex="0"
            @mouseup="onBasicUploaderClick"
            @keydown.enter="choose"
            @focus="onFocus"
            @blur="onBlur"
        >
            <span :class="basicChooseButtonIconClass"></span>
            <span class="p-button-label">{{ basicChooseButtonLabel }}</span>
            <input
                v-if="!hasFiles"
                ref="fileInput"
                type="file"
                :accept="accept"
                :disabled="disabled"
                @change="onFileSelect"
                @focus="onFocus"
                @blur="onBlur"
            />
        </span>
        <FileUploadButton
            v-if="showCancelButton"
            class="p-button-rounded p-button-danger p-button-text"
            icon="pi pi-times"
            :disabled="cancelDisabled"
            style="width: 2.357rem"
            @click="clear"
        />
    </div>
</template>

<script>
import Message from 'primevue/message';
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import Ripple from 'primevue/ripple';
import DomHandler from 'primevue/utils/DomHandler';

export default {
    components: {
        FileUploadMessage: Message,
        FileUploadButton: Button,
        FileUploadProgressBar: ProgressBar
    },
    directives: {
        ripple: Ripple
    },
    props: {
        name: {
            type: String,
            default: null
        },
        url: {
            type: String,
            default: null
        },
        mode: {
            type: String,
            default: 'advanced'
        },
        multiple: {
            type: Boolean,
            default: false
        },
        accept: {
            type: String,
            default: null
        },
        disabled: {
            type: Boolean,
            default: false
        },
        auto: {
            type: Boolean,
            default: false
        },
        maxFileSize: {
            type: Number,
            default: null
        },
        invalidFileSizeMessage: {
            type: String,
            default:
                '{0}: Invalid file size, file size should be smaller than {1}.'
        },
        invalidFileTypeMessage: {
            type: String,
            default: '{0}: Invalid file type, allowed file types: {1}.'
        },
        fileLimit: {
            type: Number,
            default: null
        },
        invalidFileLimitMessage: {
            type: String,
            default: 'Maximum number of files exceeded, limit is {0} at most.'
        },
        withCredentials: {
            type: Boolean,
            default: false
        },
        previewWidth: {
            type: Number,
            default: 50
        },
        chooseLabel: {
            type: String,
            default: null
        },
        uploadLabel: {
            type: String,
            default: null
        },
        cancelLabel: {
            type: String,
            default: null
        },
        customUpload: {
            type: Boolean,
            default: false
        },
        showUploadButton: {
            type: Boolean,
            default: true
        },
        showCancelButton: {
            type: Boolean,
            default: true
        },
        buttonStyle: null,
        buttonClass: null
    },
    duplicateIEEvent: false,
    data() {
        return {
            messages: null,
            files: [],
            focused: false,
            uploadedFileCount: 0,
            progress: null
        };
    },
    computed: {
        isAdvanced() {
            return this.mode === 'advanced';
        },
        isBasic() {
            return this.mode === 'basic';
        },
        basicChooseButtonClass() {
            return [
                'p-button p-component p-fileupload-choose',
                this.buttonClass,
                {
                    'p-fileupload-choose-selected': this.hasFiles,
                    'p-disabled': this.disabled,
                    'p-focus': this.focused,
                    'p-has-cancelbutton': this.showCancelButton
                }
            ];
        },
        basicChooseButtonIconClass() {
            return [
                'p-button-icon p-button-icon-left pi',
                {
                    'pi-plus': !this.hasFiles || this.auto,
                    'pi-upload': this.hasFiles && !this.auto
                }
            ];
        },
        basicChooseButtonLabel() {
            return this.auto
                ? this.chooseButtonLabel
                : this.hasFiles
                ? this.files[0].name
                : this.chooseButtonLabel;
        },
        hasFiles() {
            return this.files && this.files.length > 0;
        },
        chooseDisabled() {
            return (
                this.disabled ||
                (this.fileLimit &&
                    this.fileLimit <=
                        this.files.length + this.uploadedFileCount)
            );
        },
        uploadDisabled() {
            return (
                this.disabled ||
                !this.hasFiles ||
                (this.fileLimit && this.fileLimit < this.files.length)
            );
        },
        cancelDisabled() {
            return this.disabled || !this.hasFiles;
        },
        chooseButtonLabel() {
            return this.chooseLabel || this.$primevue.config.locale.choose;
        },
        uploadButtonLabel() {
            return this.uploadLabel || this.$primevue.config.locale.upload;
        },
        cancelButtonLabel() {
            return this.cancelLabel || this.$primevue.config.locale.cancel;
        }
    },
    methods: {
        onBasicUploaderClick() {
            if (this.hasFiles) this.upload();
            else this.$refs.fileInput.click();
        },
        upload() {
            if (this.customUpload) {
                if (this.fileLimit) {
                    this.uploadedFileCount += this.files.length;
                }

                this.$emit('uploader', { files: this.files });
            } else {
                const xhr = new XMLHttpRequest();
                const formData = new FormData();

                this.$emit('before-upload', { xhr, formData });

                for (const file of this.files) {
                    formData.append(
                        this.name.normalize('NFC'),
                        file,
                        file.name
                    );
                }

                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        this.progress = Math.round(
                            (event.loaded * 100) / event.total
                        );
                    }

                    this.$emit('progress', {
                        originalEvent: event,
                        progress: this.progress
                    });
                });

                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        this.progress = 0;

                        if (xhr.status >= 200 && xhr.status < 300) {
                            if (this.fileLimit) {
                                this.uploadedFileCount += this.files.length;
                            }

                            this.$emit('upload', {
                                xhr,
                                files: this.files
                            });
                        } else {
                            this.$emit('error', {
                                xhr,
                                files: this.files
                            });
                        }

                        this.clear();
                    }
                };

                xhr.open('POST', this.url, true);

                this.$emit('before-send', { xhr, formData });

                xhr.withCredentials = this.withCredentials;

                xhr.send(formData);
            }
        },
        clear() {
            this.files = [];
            this.messages = [];
            this.$emit('clear');

            if (this.isAdvanced) {
                this.clearInputElement();
            }
        },
        onFileSelect(event) {
            if (
                event.type !== 'drop' &&
                this.isIE11() &&
                this.duplicateIEEvent
            ) {
                this.duplicateIEEvent = false;
                return;
            }

            this.messages = [];
            this.files = this.files || [];
            const files = event.dataTransfer
                ? event.dataTransfer.files
                : event.target.files;

            for (const file of files) {
                if (!this.isFileSelected(file)) {
                    if (this.validate(file)) {
                        if (this.isImage(file)) {
                            file.objectURL = window.URL.createObjectURL(file);
                        }

                        this.files.push(file);
                    }
                }
            }

            this.$emit('select', { originalEvent: event, files: this.files });

            if (this.fileLimit) {
                this.checkFileLimit();
            }

            if (this.auto && this.hasFiles && !this.isFileLimitExceeded()) {
                this.upload();
            }

            if (event.type !== 'drop' && this.isIE11()) {
                this.clearIEInput();
            } else {
                this.clearInputElement();
            }
        },
        onFocus() {
            this.focused = true;
        },
        onBlur() {
            this.focused = false;
        },
        isIE11() {
            return !!window.MSInputMethodContext && !!document.documentMode;
        },
        isFileSelected(file) {
            if (this.files && this.files.length) {
                for (const sFile of this.files) {
                    if (
                        sFile.name.normalize('NFC') +
                            sFile.type +
                            sFile.size ===
                        file.name.normalize('NFC') + file.type + file.size
                    )
                        return true;
                }
            }

            return false;
        },
        validate(file) {
            if (this.accept && !this.isFileTypeValid(file)) {
                this.messages.push(
                    this.invalidFileTypeMessage
                        .replace('{0}', file.name.normalize('NFC'))
                        .replace('{1}', this.accept)
                );
                return false;
            }

            if (this.maxFileSize && file.size > this.maxFileSize) {
                this.messages.push(
                    this.invalidFileTypeMessage
                        .replace('{0}', file.name.normalize('NFC'))
                        .replace('{1}', this.formatSize(this.maxFileSize))
                );
                return false;
            }

            return true;
        },
        isFileTypeValid(file) {
            const acceptableTypes = this.accept
                .split(',')
                .map((type) => type.trim());
            for (const type of acceptableTypes) {
                const acceptable = this.isWildcard(type)
                    ? this.getTypeClass(file.type) === this.getTypeClass(type)
                    : file.type == type ||
                      this.getFileExtension(file).toLowerCase() ===
                          this.toLowerCase();

                if (acceptable) {
                    return true;
                }
            }

            return false;
        },
        isWildcard(fileType) {
            return fileType.includes('*');
        },
        getTypeClass(fileType) {
            return fileType.substring(0, fileType.indexOf('/'));
        },
        getFileExtension(file) {
            return '.' + file.name.normalize('NFC').split('.').pop();
        },
        isImage(file) {
            return /^image\//.test(file.type);
        },
        choose() {
            this.$refs.fileInput.click();
        },
        clearInputElement() {
            this.$refs.fileInput.value = '';
        },
        onDragEnter(event) {
            if (!this.disabled) {
                event.stopPropagation();
                event.preventDefault();
            }
        },
        onDragOver(event) {
            if (!this.disabled) {
                DomHandler.addClass(
                    this.$refs.content,
                    'p-fileupload-highlight'
                );
                event.stopPropagation();
                event.preventDefault();
            }
        },
        onDragLeave() {
            if (!this.disabled) {
                DomHandler.removeClass(
                    this.$refs.content,
                    'p-fileupload-highlight'
                );
            }
        },
        onDrop(event) {
            if (!this.disabled) {
                DomHandler.removeClass(
                    this.$refs.content,
                    'p-fileupload-highlight'
                );
                event.stopPropagation();
                event.preventDefault();

                const files = event.dataTransfer
                    ? event.dataTransfer.files
                    : event.target.files;
                const allowDrop =
                    this.multiple || (files && files.length === 1);

                if (allowDrop) {
                    this.onFileSelect(event);
                }
            }
        },
        remove(index) {
            this.clearInputElement();
            this.files.splice(index, 1);
            this.files = [...this.files];
            if (this.files.length <= this.fileLimit) {
                this.messages = [];
            }
        },
        clearInputElement() {
            this.$refs.fileInput.value = '';
        },
        clearIEInput() {
            if (this.$refs.fileInput) {
                this.duplicateIEEvent = true; // IE11 fix to prevent onFileChange trigger again
                this.$refs.fileInput.value = '';
            }
        },
        formatSize(bytes) {
            if (bytes === 0) {
                return '0 B';
            }
            const k = 1000;
            const dm = 3;
            const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));

            return (
                parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) +
                ' ' +
                sizes[i]
            );
        },
        isFileLimitExceeded() {
            if (
                this.fileLimit &&
                this.fileLimit <= this.files.length + this.uploadedFileCount &&
                this.focused
            ) {
                this.focused = false;
            }

            return (
                this.fileLimit &&
                this.fileLimit < this.files.length + this.uploadedFileCount
            );
        },
        checkFileLimit() {
            if (this.isFileLimitExceeded()) {
                this.messages.push(
                    this.invalidFileLimitMessage.replace(
                        '{0}',
                        this.fileLimit.toString()
                    )
                );
            }
        },
        forceInsertFile(file) {
            // by shkoh 20210914: 강제 데이터 삽입을 추가 구현함
            this.messages = [];
            this.files = [];

            if (!this.isFileSelected(file)) {
                if (this.validate(file)) {
                    if (this.isImage(file)) {
                        file.objectURL = window.URL.createObjectURL(file);
                    }

                    this.files.push(file);
                }
            }

            if (this.fileLimit) {
                this.checkFileLimit();
            }

            if (this.auto && this.hasFiles && !this.isFileLimitExceeded()) {
                this.upload();
            }

            if (this.isIE11()) {
                this.clearIEInput();
            } else if (this.isAdvanced) {
                this.clearInputElement();
            }
        }
    }
};
</script>

<style>
.p-fileupload-content {
    position: relative;
}

.p-fileupload-row {
    display: flex;
    align-items: center;
}

.p-fileupload-row > div {
    flex: 1 1 auto;
    width: 25%;
}

.p-fileupload-row > div:last-child {
    text-align: right;
}

.p-fileupload-content .p-progressbar {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
}

.p-button.p-fileupload-choose {
    position: relative;
    overflow: hidden;
}

.p-button.p-fileupload-choose input[type='file'] {
    display: none;
}

.p-fileupload-choose.p-fileupload-choose-selected input[type='file'] {
    display: none;
}

.p-fileupload-filename {
    word-break: break-all;
}

.p-fluid .p-fileupload .p-button {
    width: auto;
}
</style>
