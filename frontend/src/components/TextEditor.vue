<template>
    <editor-content :editor="editor" />
</template>

<script setup>
    import { useEditor, EditorContent } from '@tiptap/vue-3'
    import StarterKit from '@tiptap/starter-kit'
    import Document from '@tiptap/extension-document'
    import Paragraph from '@tiptap/extension-paragraph'
    import Text from '@tiptap/extension-text'

    const editor = useEditor({
        content: "<p>I'm running Tiptap with Vue.js. 🎉</p>",
        extensions: [Document, Paragraph],
    })
</script>
  