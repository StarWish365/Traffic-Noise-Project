import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useValueStore = defineStore('HeadValue', () => {
  const cellsize = ref(10)
  const reduction = ref(1)
  const radius = ref(100)
  const sel = ref('Speed')
  const show_car_noice = ref(false)
  const car_id = ref(null)
  const map_data = ref(null)
  const selected = ref(null)
  const history = ref(null)
  return { cellsize, reduction, radius, sel, show_car_noice, car_id, map_data, selected, history }
})
