<template>
  <div class="login-container">
    <el-form class="login-form" status-icon label-width="100px" :rules="rules" :model="form" ref="loginForm">
      <div class="title-container">
        <img src="/logo.png" alt="">
      </div>

      <el-form-item prop="email" label="邮箱">
        <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
      </el-form-item>

      <el-form-item prop="password" label="密码">
        <el-input v-model="form.password" placeholder="请输入密码" type="password"></el-input>
      </el-form-item>
      
      <el-form-item prop="emailCode" label="邮箱验证码" class="captcha-container">
         <div class="captcha">
           <el-button type="primary" @click="sendEmailCode" :disabled="send.timer>0">{{sendText}}</el-button>
         </div>
        <el-input v-model="form.emailCode" placeholder="请输入邮箱验证码"></el-input>
      </el-form-item>
      
       <el-form-item prop="captcha" label="验证码" class="captcha-container">
         <div class="captcha">
           <img :src="code.captcha" alt="" @click="updateCaptcha">
         </div>
        <el-input v-model="form.captcha" placeholder="请输入验证码"></el-input>
      </el-form-item>

      <el-form-item prop="" label="">
        <el-button type="primary" @click.native.prevent="handleLogin">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import md5 from 'md5'
export default {
  layout:'login',
  data() {
    return {
      send:{
        timer:0
      },
      form:{
        email:'1428620591@qq.com',
        captcha:'',
        password:'123456',
        emailCode:''
      },
      rules:{
        email:[
          {required:true,message:'请输入邮箱'},
          {type:'email',message:'请输入正确的邮箱格式'}
        ],
        captcha:[
          {required:true,message:'请输入验证码'}
        ],
        emailCode:[
          {required:true,message:'请输入邮箱验证码'}
        ],
        password:[
          {required:true,pattern:/^[\w-_]{6,12}$/g,message:'请输入6-12位密码'}
        ]
      },
      code:{
        captcha: '/api/captcha?t_' + new Date().getTime()
      }
    }
  },
  computed: {
    sendText() {
      if(this.send.timer<=0) {
        return '发送'
      }
      return `${this.send.timer}s后发送`
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(async valid => {
        if(valid) {
          console.log('校验成功');
          let data = {
            email: this.form.email,
            password: md5(this.form.password),
            captcha: this.form.captcha,
            emailCode: this.form.emailCode
          }
          let ret = await this.$http.post('/user/login',data)
          console.log(ret);
          if(ret.code == 0) {
            // 返回token，存储
            this.$message.success('登录成功')
            // 存取token
            localStorage.setItem('token',ret.data.token)
            setTimeout(() => {
              this.$router.push('/')
            },500)
          }else {
            // 登录失败
            this.$message.error(ret.message)
          }
        } else {
          console.log('校验失败');
        }
      })
    },
    updateCaptcha() {
      this.code.captcha = '/api/captcha?t_' + new Date().getTime()
    },
    async sendEmailCode() {
      // TODO 发送接口
      await this.$http.get('/sendcode?email=' + this.form.email)

      this.send.timer = 5
      this.timer = setInterval(() => {
        this.send.timer -= 1
        if(this.send.timer===0) {
          clearInterval(this.timer)
        }
      }, 1000);
    }
  }
}
</script>

<style lang="stylus">

</style>