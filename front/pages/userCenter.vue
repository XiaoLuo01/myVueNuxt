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
    <div class="cube-container" :style="{ width: cubeWidth + 'px' }">
      <div class="cube" v-for="chunk in chunks" :key="chunk.name">
        <div
          :class="{
            uploading: chunk.progress > 0 && chunk.progress < 100,
            success: chunk.progress == 100,
            error: chunk.progress < 0,
          }"
          :style="{ height: chunk.progress + '%' }"
        >
          <i
            style="color: #f56c6c"
            class="el-icon-loading"
            v-if="chunk.progress < 100 && chunk.progress > 0"
          ></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import sparkMD5 from 'spark-md5'
const CHUNK_SIZE = 1 * 1024 * 1024
export default {
  data() {
    return {
      file: null,
      // uploadProgress: 0,
      hashProgress: 0,
      chunks: [],
    }
  },
  computed: {
    cubeWidth() {
      return Math.ceil(Math.sqrt(this.chunks.length)) * 16
    },
    uploadProgress() {
      if (!this.file || this.chunks.length) {
        return 0
      }
      const loaded = this.chunks
        .map((item) => item.chunk.size * item.progress)
        .reduce((acc, cur) => accz + cur, 0)
      return Number(((loaded * 100) / this.file.size).toFixed(2))
    },
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
              resolve(spark.end())
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
    async calculateHashSimple() {
      return new Promise((resolve) => {
        const spark = new sparkMD5.ArrayBuffer()
        const reader = new FileReader()

        const file = this.file
        const size = file.size
        const offset = 2 * 1024 * 1024
        // 第一个切片2M全部取到
        let chunks = [file.slice(0, offset)]

        let cur = offset
        while (cur < size) {
          if (cur + offset >= size) {
            // 最后一个区块也是全部取值
            chunks.push(file.slice(cur, cur + offset))
          } else {
            // 中间区块取前中后各2个字节
            let mid = cur + offset / 2
            let end = cur + offset
            chunks.push(file.slice(cur, cur + 2))
            chunks.push(file.slice(mid, mid + 2))
            chunks.push(file.slice(end - 2, end))
          }
          cur += offset
        }
        reader.readAsArrayBuffer(new Blob(chunks))
        reader.onload = (e) => {
          spark.append(e.target.result)
          this.hashProgress = 100
          resolve(spark.end())
        }
      })
    },
    async uploadFile() {
      if (!this.file) {
        return
      }

      const chunks = this.createFileChunk(this.file)
      // const hash = await this.calculateHashWorker()
      // const hash1 = await this.calculateHashIdle()
      const hash = await this.calculateHashSimple()
      this.hash = hash

      // 上传文件之前问一下后端文件是否上传过，如果没有，是否有存在的切片
      const {
        data: { uploaded, uploadedList },
      } = await this.$http.post('/checkfile', {
        hash: this.hash,
        ext: this.file.name.split('.').pop(),
      })

      if (uploaded) {
        // 已经存在，直接秒传
        return this.$message.success('秒传成功！')
      }

      this.chunks = chunks.map((chunk, index) => {
        // 切片的名字 hash+index
        const name = hash + '-' + index
        return {
          name,
          index,
          hash,
          chunk: chunk.file,
          // 设置进度条，已经上传的设置为100
          progress: uploadedList.indexOf(name) > -1 ? 100 : 0,
        }
      })

      await this.uploadChunks(uploadedList)
    },
    async uploadChunks(uploadedList = []) {
      const requests = this.chunks
        .filter((chunk) => uploadedList.indexOf(chunk.name) == -1)
        .map((chunk, index) => {
          const form = new FormData()
          form.append('chunk', chunk.chunk)
          form.append('name', chunk.name)
          form.append('hash', chunk.hash)
          return { form, index: chunk.index, error: 0 }
        })

      // TODO 并发数控制
      // await Promise.all(requests)
      await this.sendRequest(requests)
      await this.mergeRequest()

      // if (!(await this.isImage(this.file))) {
      //   console.log('文件格式不对')
      // } else {
      //   console.log('格式正确')
      // }
    },
    async sendRequest(chunks, limit = 3) {
      return new Promise((resolve, reject) => {
        const len = chunks.length
        let counter = 0
        let isStop = false

        const start = async () => {
          if (isStop) {
            return
          }
          // 获取一个chunk
          const task = chunks.shift()
          if (task) {
            const { form, index } = task

            try {
              await this.$http.post('/uploadfile', form, {
                onUploadProgress: (progress) => {
                  // 每一个区块有自己的进度条
                  this.chunks[index].progress = Number(
                    ((progress.loaded / progress.total) * 100).toFixed(2)
                  )
                },
              })

              if (counter == len - 1) {
                // 这是最后一个任务
                resolve()
              } else {
                counter++
                // 启动下一个任务
                start()
              }
            } catch (err) {
              this.chunks[index].progress = -1
              // 小于3次尝试重新请求
              if (task.error < 3) {
                task.error++
                // 把任务又重新放回去，继续启动
                chunks.unshift(task)
                start()
              } else {
                // 已经错误了3次，结束整个
                isStop = true
                reject()
              }
            }
          }
        }

        while (limit > 0) {
          // 启动任务
          setTimeout(() => {
            start()
          }, Math.random() * 2000)
          limit -= 1
        }
      })
    },
    async mergeRequest() {
      this.$http.post('/mergefile', {
        ext: this.file.name.split('.').pop(), // 获取后缀
        size: CHUNK_SIZE,
        hash: this.hash,
      })
    },
    handleFileChange(e) {
      const [file] = e.target.files
      if (!file) {
        return
      }
      this.file = file
    },
  },
  async mounted() {
    const ret = await this.$http.get('/user/info')
    this.bindEvents()
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

.cube-container {
  .cube {
    width: 14px;
    height: 14px;
    line-height: 12px;
    border: 1px solid black;
    background: #eee;
    float: left;

    > .success {
      background: green;
    }

    > .error {
      background: red;
    }

    > .uploading {
      background: blue;
    }
  }
}
</style>

