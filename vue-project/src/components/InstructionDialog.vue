<!-- src/components/InstructionDialog.vue -->
<template>
    <el-dialog
      v-model="visible"
      title="Welcome to the Noise Visualization WebApp"
      width="600"
      close-on-click-modal="false"
      close-on-press-escape="false"
      show-close
    >
      <div style="line-height: 1.8; font-size: 16px">
        To use this noise visualization WebApp, please follow these steps:
        <ul style="margin-top: 10px; padding-left: 20px">
          <li><strong>Step 1:</strong> Click the top-left icon to open the control panel.</li>
          <li><strong>Step 2:</strong> In the control panel, select the eCar ratio and click Confirm.</li>
          <li><strong>Step 3:</strong> Return to the map view and click the Play button.</li>
          <li>Hint 1: Double-click the map and then click the icon that appears to view the noise history linechart.</li>
          <li>Hint 2: Click on a building to view a bar graph of population noise exposure.</li>
        </ul>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="visible = false">OK</el-button>
        </div>
      </template>
    </el-dialog>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { ElDialog, ElButton } from 'element-plus'
  import 'element-plus/es/components/dialog/style/css'
  import 'element-plus/es/components/button/style/css'

  
  const visible = ref(false)
  
  onMounted(() => {
    visible.value = true
  })
  </script>
  