import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'

export const useValueStore = defineStore('HeadValue', () => {
  const heatP = ref(5)
  const sel = ref('Speed')
  const map_data = ref(null)
  const selected = ref(null)
  const history = ref([])
  const idreceiver = ref(null)
  const FramebufferFactor = ref(0.2)
  const receiverCoordinates = ref(null)
  const heatLayercontrol = ref(true)
  const vehicleLocation = ref(null)
  const receiverstoBuilding = reactive(null)
  const iscounting = ref(false)

  // 定义 action 函数
  const addHistoryEntry = (entry) => {
    history.value = [...history.value, entry];  // 使用 actions 来修改数组
  }
  const resetHistory = () => {
    history.value = []
    idreceiver.value = null
  }



  // 返回状态和 action
  return { heatP, sel, map_data, selected, history, idreceiver, FramebufferFactor, receiverCoordinates,
     heatLayercontrol,vehicleLocation, receiverstoBuilding,iscounting, addHistoryEntry, resetHistory }
})
