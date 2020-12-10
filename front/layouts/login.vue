<template>
  <div>
    <nuxt></nuxt>
    <!-- <div>footer</div> -->
  </div>
</template>

<script>
export default {

}
</script>

<style lang="stylus">
.login-container 
  width 100%
  min-height 100%
  .login-form
    width 520px
    padding 20px 0
    margin 0 auto
    overflow hidden
    .title-container 
      text-align center
      margin-bottom: 20px;
    .captcha-container
      width: 400px;
      position: relative;
      .captcha 
        position: absolute;
        right: -110px;
        .el-button 
          width: 90px;
          padding: 0;
          line-height: 40px;
        img 
          width: 90px;
          height: 40px;
          cursor: pointer;
</style>