<template>
  <div>
    <div class="write-btn">
      <el-button @click="submit" type="primary">提交</el-button>
    </div>
    <el-row>
      <el-col :span="12">
        <!-- markdown 编辑器的基本操作 -->
        <textarea
          ref="editor"
          class="md-editor"
          :value="content"
          @input="update"
          cols="30"
          rows="10"
        ></textarea>
      </el-col>
      <el-col :span="12">
        <!-- 显示 markdown 的内容 -->
        <div class="markdown-body" v-html="compileContent"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import marked from 'marked'
import hljs from 'highlight.js'
import javascript from 'highlight.js/lib/languages/javascript'
import 'highlight.js/styles/monokai-sublime.css'
export default {
  data() {
    return {
      content: `
# 紫罗兰

  - 上课
  - 吃饭
  - 写代码

\`\`\`javascript
var name = 'carol'
console.log(name)
\`\`\`
      `,
    }
  },
  computed: {
    compileContent() {
      return marked(this.content, {})
    },
  },
  mounted() {
    this.timer = null
    this.bindEvent()
    // 配置marked的样式
    marked.setOptions({
      rendered: new marked.Renderer(),
      highlight(code) {
        return hljs.highlightAuto(code).value
      },
    })
  },
  methods: {
    update(e) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.content = e.target.value
      }, 350)
    },
    async submit() {
      let ret = await this.$http.post('/artical/create', {
        content: this.content,
        compileContent: this.compileContent, // 显示只读取这一个
      })
    },
    bindEvent() {
      this.$refs.editor.addEventListener('paste', async (e) => {
        const file = e.clipboardData.files
        // 直接上传
      })
      this.$refs.editor.addEventListener('drop', async (e) => {
        const file = e.dataTransfer.files
        // 直接上传

        e.preventDefault()
      })
    },
  },
}
</script>

<style lang="stylus">
.md-editor {
  width: 100%;
  height: 100vh;
  outline: none;
}

.write-btn {
  position: fixed;
  z-index: 100;
  right: 30px;
  top: 10px;
}
</style>