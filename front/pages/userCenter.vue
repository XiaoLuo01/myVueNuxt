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
    <div>
      <p>计算hash的进度</p>
      <el-progress
        :stroke-width="20"
        :text-inside="true"
        :percentage="hashProgress"
      ></el-progress>
    </div>
  </div>
</template>

<script>
import { sparkMD5 } from 'spark-md5'
const CHUNK_SIZE = 0.1 * 1024 * 1024
export default {
  data() {
    return {
      file: null,
      uploadProgress: 0,
      hashProgress: 0,
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
    blobtoString(blob) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          console.log('blob1:', reader.result)
          const ret = reader.result
            .split('')
            .map((v) => v.charCodeAt())
            .map((v) => v.toString(16).toUpperCase())
            .join(' ')
          resolve(ret)
        }
        reader.readAsBinaryString(blob)
      })
    },
    async isGif(file) {
      const ret = await this.blobtoString(file.slice(0, 6))
      return ret == '47 49 46 38 39 61' || ret == '47 49 46 38 37 61'
    },
    async isPng(file) {
      const ret = await this.blobtoString(file.slice(0, 8))
      return ret == '89 50 4E 47 D A 1A A'
    },
    async isJpg(file) {
      const len = file.size
      const start = await this.blobtoString(file.slice(0, 2))
      const tail = await this.blobtoString(file.slice(-2, len))
      return start == 'FF D8' && tail == 'FF D9'
    },
    async isImage(file) {
      return (
        (await this.isGif(file)) ||
        (await this.isPng(file)) ||
        (await this.isJpg(file))
      )
    },
    createFileChunk(file, size = CHUNK_SIZE) {
      const chunks = []
      let cur = 0
      // 把文件切片
      while (cur < file.size) {
        chunks.push({ index: cur, file: file.slice(cur, cur + size) })
        cur += size
      }
      return chunks
    },
    async calculateHashWorker() {
      return new Promise((resolve) => {
        const worker = new Worker('./hash.js')
        worker.postMessage({ chunks: this.chunks })
        worker.onmessage = (e) => {
          const { progress, hash } = e.data
          this.hashProgress = Number(progress.toFixed(2))
          if (hash) {
            resolve(hash)
          }
        }
      })
    },
    async calculateHashIdle() {
      const chunks = this.chunks
      return new Promise((resolve) => {
        const spark = new sparkMD5.ArrayBuffer()
        let count = 0

        const appendToSpart = async (file) => {
          return new Promise((resolve) => {
            // 处理文件的时间切片
            const reader = new FileReader()
            reader.readAsArrayBuffer(file)
            reader.onload = (e) => {
              spark.append(e.target.result)
              resolve()
            }
          })
        }

        const workloop = async (deadline) => {
          while (count < chunks.length && deadline.timeRemaining() > 1) {
            // 浏览器处于空闲时间且有任务
            await this.appendToSpart(chunks[count].file)
            count++

            if (count < chunks.length) {
              this.hashProgress = Number(
                ((100 * count) / chunks.length).toFixed(2)
              )
            } else {
              this.hashProgress = 100
              resolve(spark.end())
            }
          }
          window.requestIdleCallback(workloop)
        }
        window.requestIdleCallback(workloop)
      })
    },
    async uploadFile() {
      this.chunks = this.createFileChunk(this.file)
      console.log('chunks', this.chunks)
      const hash = await this.calculateHashWorker()
      const hash1 = await this.calculateHashIdle()
      console.log('hash', hash1)
      // if (!(await this.isImage(this.file))) {
      //   console.log('文件格式不对')
      // } else {
      //   console.log('格式正确')
      // }
      const form = new FormData()
      form.append('name', 'file')
      form.append('file', this.file)

      // const ret = await this.$http.post('/uploadfile', form, {
      //   onUploadProgress: (progress) => {
      //     this.uploadProgress = Number(
      //       ((progress.loaded / progress.total) * 100).toFixed(2)
      //     )
      //   },
      // })
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

