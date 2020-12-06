<template>
  <div class="login-container">
    <el-form class="login-form" >
      <el-form-item props="email">
        <span>
          <i class="el-icon-mobile"></i>
        </span>
        <el-input placeholder="邮箱" v-model="email"></el-input>
      </el-form-item>
      <el-form-item props="password">
        <span>
          <i class="el-icon-lock"></i>
        </span>
        <el-input placeholder="密码" type="password"></el-input>
      </el-form-item>
      <el-form-item props="captcha">
        <el-input placeholder="验证码"></el-input>
        <img @click="updateCaptcha" :src="captcha" alt="">
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  layout:'login',
  data() {
    return {
      email:'',
      rules: [],
      captcha: '/api/captcha?t_' + new Date().getTime()
    }
  },
  methods: {
    updateCaptcha() {
      this.captcha = '/api/captcha?t_' + new Date().getTime()
    }
  }
}
</script>

<style lang="stylus">
.login-form 
  width 800px
  margin 50px auto

</style>