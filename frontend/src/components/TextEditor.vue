<template>
    <editor-content :editor="editor" />
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { Editor } from '@tiptap/core';
import { EditorContent } from '@tiptap/vue-3';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';

const editor = ref(null);

onMounted(() => {
    editor.value = new Editor({
    content: "<p>I'm running Tiptap with Vue.js. 🎉</p>",
    extensions: [Document, Paragraph, Text],
    });
});

onBeforeUnmount(() => {
    if (editor.value) {
    editor.value.destroy();
    }
});
</script>