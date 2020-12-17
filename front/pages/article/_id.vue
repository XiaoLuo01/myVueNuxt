<template>
  <div class="kkb-container">
    <UserDisplay :user="artical.author">
      <el-button v-if="isFollow" type="success" @click="cancelfollow"
        >已关注</el-button
      >
      <el-button v-else @click="follow">关注</el-button>
    </UserDisplay>

    <el-divider></el-divider>
    <div class="artical" v-html="artical.artical_html"></div>
    <el-divider></el-divider>
    <el-button @click="likeAction" :type="likeStatus ? 'success' : 'default'">
      <i class="el-icon-thumb">{{ artical.like }}</i>
    </el-button>
  </div>
</template>

<script>
import UserDisplay from '~/components/UserDisplay.vue'
export default {
  components: { UserDisplay },
  mounted() {
    let { id } = this.$route.params
    this.id = id
    this.getartical()

    // 用户已登录
    const token = localStorage.getItem('token')
    this.token = token
  },
  data() {
    return {
      isFollow: false,
      likeStatus: false,
      dislikeStatus: false,
      artical: {
        title: '',
        author: {},
      },
    }
  },
  methods: {
    async getLikeStatus() {
      // 修改likeStatus
      let ret = await this.$http.get('/user/article/' + this.id)
      if (ret.code == 0) {
        this.likeStatus = ret.data.like
        this.dislikeStatus = ret.data.dislike
      }

      // if(ret.code==0){
      // this.likeStatus = ret.data.like
      // this.dislikeStatus = ret.data.dislike
      // }
    },
    async likeAction() {
      // 点赞和取消
      let type = this.likeStatus ? 'delete' : 'put'

      let ret = await this.$http[type]('/user/likearticle/' + this.id)
      if (ret.code == 0) {
        // 取巧，简单粗暴
        this.getartical()
        // this.getLikeStatus()
        this.$notify({
          title: ret.message,
          type: 'success',
        })
      }
    },

    async getartical() {
      let ret = await this.$http.get('/artical/' + this.id)
      this.artical = ret.data
      if (this.token) {
        this.checkFollowStatus()
        this.getLikeStatus()
      }
    },
    async checkFollowStatus() {
      // 获取关注状态
      let ret = await this.$http.get('/user/follow/' + this.artical.author._id)
      if (ret.code == 0) {
        this.isFollow = ret.data.isFollow
      }
    },
    async follow() {
      let ret = await this.$http.put('/user/follow/' + this.artical.author._id)
      this.checkFollowStatus()
    },
    async cancelfollow() {
      let ret = await this.$http.delete(
        '/user/follow/' + this.artical.author._id
      )
      this.checkFollowStatus()
    },
  },
}
</script>

<style>
.artical {
  padding: 10px;
}

.rotate {
  transform: rotate(180deg);
}
</style>