/**
 * 设计链表
 */
function Listnode(val) {
  this.val = val
  this.next = null
}

var myLinkedList = function () {
  this.head = null
  this.tail = null
  this.length = 0
}

myLinkedList.prototype.get = function (index) {
  if (index >= 0 || index < this.length) {
    let i = 0
    let cur = this.head
    while (i < index && cur) {
      cur = cur.next
      i++
    }
    return cur && cur.val
  } else {
    return -1
  }
}

myLinkedList.prototype.addAtHead = function (val) {
  const lastHead = this.head
  const newNode = new Listnode(val)
  this.head = newNode
  this.head.next = lastHead
  if (!this.tail) {
    this.tail = newNode
    this.tail.next = null
  }
  this.length++
}

myLinkedList.prototype.addAtTail = function (val) {
  const lastTail = this.tail
  const newNode = new Listnode(val)
  this.tail = newNode
  if (lastTail) {
    lastTail.next = this.tail
  }
  if (!this.head) {
    this.head = newNode
    this.head.next = null
  }
  this.length++
}

myLinkedList.prototype.addAtIndex = function (index, val) {
  if (index == this.length) {
    this.addAtTail(val)
  } else if (index <= 0) {
    this.addAtHead(val)
  } else if (index > 0 && index < this.length) {
    let i = 0
    let cur = this.head
    while (i < index - 1) {
      cur = cur.next
      i++
    }
    const newNode = new Listnode(val)
    newNode.next = cur.next
    cur.next = newNode
    this.length++
  }
}

myLinkedList.prototype.deleteAtIndex = function (index) {
  if (index > 0 && index < this.length) {
    let i = 0
    let cur = this.head
    let prev = null
    while (i < index) {
      prev = cur
      cur = cur.next
      i++
    }
    prev.next = cur.next
    if (index === this.length - 1) {
      this.tail = prev
    }
    this.length--
  } else if (index == 0) {
    this.head = this.head.next
    this.length--
  }
}

const linkedList = new myLinkedList()
linkedList.addAtHead(1)
linkedList.addAtTail(3)
linkedList.addAtIndex(1, 2) // 1->2->3
const first = linkedList.get(1) //返回2
linkedList.deleteAtIndex(1) //现在链表是1-> 3
const second = linkedList.get(1)
console.log(first, linkedList, second)
