<template>
  <div ref="list" class="list-container" @scroll="scrollEvent($event)">
    <div class="list-phanom" :style="{ height: listHeight + 'px' }"></div>
    <div class="lists" :style="{ transform: getTransform }">
      <ArticleItem
        ref="items"
        class="infinite-list-item"
        v-for="item in visibleData"
        :artical="item"
        :key="item._id"
        :style="{ height: itemHight + 'px' }"
      ></ArticleItem>
    </div>
  </div>
</template>

<script>
import ArticleItem from './ArticleItem'
export default {
  name: 'VirtualList',
  components: { ArticleItem },
  props: {
    // 所有列表数据
    listData: {
      type: Array,
      default: () => [],
    },
    // 每项高度
    itemHight: {
      type: Number,
      default: 200,
    },
  },
  data() {
    return {
      screenHeight: 800, //可视区域高度
      startOffsest: 0, //偏移量
      start: 0, // 起始索引
      end: 4, // 结束索引
    }
  },
  computed: {
    // 列表总高度
    listHeight() {
      return this.listData.length * this.itemHight
    },
    // 偏移量对应的style
    getTransform() {
      return `translate3d(0,${this.startOffset}px,0)`
    },
    // 可显示的列表项数
    visibleCount() {
      return Math.ceil(this.screenHeight / this.itemHight)
    },
    // 获取真实显示列表数据
    visibleData() {
      return this.listData.slice(
        this.start,
        Math.min(this.end, this.listData.length)
      )
    },
  },
  mounted() {
    this.start = 0
    this.end = this.start + this.visibleCount
  },
  methods: {
    scrollEvent() {
      //当前滚动位置
      let scrollTop = this.$refs.list.scrollTop
      //此时的开始索引
      this.start = Math.floor(scrollTop / this.itemHight)
      //此时的结束索引
      this.end = this.start + this.visibleCount
      //此时的偏移量
      this.startOffsest = scrollTop - (scrollTop % this.itemHight)
    },
  },
}
</script>

<style lang="stylus" scoped>
.list-container {
  height: 100%;
  overflow: hidden;
  position: relative;
  text-align: center;
}

.list-phanom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.list {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
}

.infinite-list-item {
  padding: 10px;
  color: #555;
  border-bottom: 1px solid #999;
  text-align: center;
}
</style>