<template>
  <el-container>
    <el-header>
      <el-menu mode="horizontal">
        <el-menu-item index="0">
          <img class="logo" src="./../static/logo.png" alt="" />
        </el-menu-item>

        <el-menu-item index="1">
          <nuxt-link to="/">首页</nuxt-link>
        </el-menu-item>

        <template v-if="userInfo.id">
          <el-menu-item index="3" class="pull-right">
            <a href="" @click="logout">退出</a>
          </el-menu-item>

          <el-menu-item index="4" class="pull-right">
            <UserDisplay :user="userInfo"> </UserDisplay>
          </el-menu-item>

          <el-menu-item index="3" class="pull-right">
            <nuxt-link to="/editor/new">
              <el-button type="primary">写文章</el-button>
            </nuxt-link>
          </el-menu-item>
        </template>

        <template v-if="!userInfo.id">
          <el-menu-item index="2" class="pull-right">
            <nuxt-link to="/register">注册</nuxt-link>
          </el-menu-item>

          <el-menu-item index="3" class="pull-right">
            <nuxt-link to="/login">登录</nuxt-link>
          </el-menu-item>
        </template>
      </el-menu>
    </el-header>
    <el-main>
      <Nuxt />
    </el-main>
    <el-footer></el-footer>
  </el-container>
</template>

<script>
import UserDisplay from '~/components/UserDisplay.vue'
export default {
  components: { UserDisplay },
  mounted() {
    this.getUserInfo()
  },
  computed: {
    userInfo() {
      return this.$store.state.user
    },
  },
  methods: {
    logout() {
      localStorage.removeItem('token')
      this.$store.commit('user/LOGOUT')
    },
    async getUserInfo() {
      const token = localStorage.getItem('token')
      if (token) {
        this.$store.dispatch('user/detail')
      }
    },
  },
}
</script>

<style>
html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
  background: #eee;
}
.pull-right {
  float: right !important;
}
*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}
.logo {
  height: 37px;
}
a {
  text-decoration: none;
}
.kkb-container {
  width: 980px;
  height: 80vh;
  margin: 0 auto;
  background: #fff;
  padding: 20px;
}
.el-menu--horizontal > .el-menu-item.is-active {
  border: none;
}
</style>
