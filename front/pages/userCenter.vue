<template>
  <div>
    <h1>用户中心</h1>
    <div id="drag" ref="drag">
      <input type="file" name="file" @change="handleFileChange" />
    </div>
    <div class="progress">
      <el-progress
        :stroke-width="20"
        :text-inside="true"
        :percentage="uploadProgress"
      ></el-progress>
    </div>
    <div>
      <el-button type="primary" @click="uploadFile">上传文件</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      file: null,
      uploadProgress: 0,
    }
  },
  async mounted() {
    const ret = await this.$http.get('/user/info')
    this.bindEvents()
  },
  methods: {
    bindEvents() {
      const drag = this.$refs.drag
      drag.addEventListener('dragover', (e) => {
        drag.style.borderColor = 'red'
        e.preventDefault()
      })
      drag.addEventListener('dragleave', (e) => {
        drag.style.borderColor = '#eee'
        e.preventDefault()
      })
      drag.addEventListener('drop', (e) => {
        this.file = e.dataTransfer.files[0]
        drag.style.borderColor = '#eee'
        e.preventDefault()
      })
    },
    async uploadFile() {
      const form = new FormData()
      form.append('name', 'file')
      form.append('file', this.file)

      const ret = await this.$http.post('/uploadfile', form, {
        onUploadProgress: (progress) => {
          this.uploadProgress = Number(
            ((progress.loaded / progress.total) * 100).toFixed(2)
          )
        },
      })
      console.log('upload:', ret)
    },
    handleFileChange(e) {
      const [file] = e.target.files
      if (!file) {
        return
      }
      this.file = file
    },
  },
}
</script>

<style lang="stylus">
#drag {
  // width: 800px;
  height: 200px;
  line-height: 200px;
  border: 2px dashed #eee;
  text-align: center;
  vertical-align: middle;
}

.progress {
  // width: 800px;
  margin-top: 5px;
  margin-bottom: 10px;
}
</style>

