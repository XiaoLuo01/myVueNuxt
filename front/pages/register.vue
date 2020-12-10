<template>
  <div class="login-container">
    <el-form class="login-form" status-icon label-width="100px" :rules="rules" :model="form" ref="registerForm">
      <div class="title-container">
        <img src="/logo.png" alt="">
      </div>

      <el-form-item prop="email" label="邮箱">
        <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
      </el-form-item>
      
       <el-form-item prop="captcha" label="验证码" class="captcha-container">
         <div class="captcha">
           <img :src="code.captcha" alt="" @click="registerCaptcha">
         </div>
        <el-input v-model="form.captcha" placeholder="请输入验证码"></el-input>
      </el-form-item>

      <el-form-item prop="nickname" label="昵称">
        <el-input v-model="form.nickname" placeholder="请输入昵称"></el-input>
      </el-form-item>

      <el-form-item prop="password" label="密码">
        <el-input v-model="form.password" placeholder="请输入密码" type="password"></el-input>
      </el-form-item>

      <el-form-item prop="repassword" label="确认密码">
        <el-input v-model="form.repassword" placeholder="请再次输入密码" type="password"></el-input>
      </el-form-item>

      <el-form-item prop="" label="">
        <el-button type="primary" @click.native.prevent="handleRegister">注册</el-button>
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
      form:{
        email:'1428620591@qq.com',
        captcha:'',
        nickname:'Violet',
        password:'123456',
        repassword:'123456',
      },
      rules:{
        email:[
          {required:true,message:'请输入邮箱'},
          {type:'email',message:'请输入正确的邮箱格式'}
        ],
        captcha:[
          {required:true,message:'请输入验证码'}
        ],
        nickname:[
          {required:true,message:'请输入昵称'}
        ],
        password:[
          {required:true,pattern:/^[\w-_]{6,12}$/g,message:'请输入6-12位密码'}
        ],
        repassword:[
          {required:true,message:'请再次输入密码'},
          {validator:(rule,value,callback)=> {
            if(value!== this.form.password) {
              callback(new Error('两次密码不一样'))
            }
            callback()
          }}
        ]
      },
      code:{
        captcha: '/api/captcha?t_' + new Date().getTime()
      }
    }
  },
  methods: {
    handleRegister() {
      this.$refs.registerForm.validate(async valid => {
        if(valid) {
          console.log('校验成功');
          let data = {
            email: this.form.email,
            nickname: this.form.nickname,
            password: md5(this.form.password),
            captcha: this.form.captcha
          }
          let ret = await this.$http.post('/user/register',data)
          console.log(ret);
          if(ret.code == 0) {
            // 注册成功
            this.$alert('注册成功','成功',{
              confirmButtonText:'去登录',
              callback:() => {
                this.$router.push('/login')
              }
            })
          }else {
            // 注册失败
            this.$message.error(ret.message)
          }
        } else {
          console.log('校验失败');
        }
      })
    },
    registerCaptcha() {
      this.code.captcha = '/api/captcha?t_' + new Date().getTime()
    }
  }
}
</script>

<style lang="stylus">

</style>