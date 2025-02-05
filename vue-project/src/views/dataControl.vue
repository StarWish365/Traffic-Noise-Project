<template>
  <div class="container">
    <input type="file" accept=".csv" @change="handleFileUpload" class="file-input">

    <div class="table-container" v-bind="containerProps">
      <div class="table-wrapper" v-bind="wrapperProps">
        <table>
          <thead>
            <tr>
              <th v-for="(col, index) in tableHeaders" :key="index">{{ col }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in list" :key="item.index">
              <td v-for="(col, colIndex) in tableHeaders" :key="colIndex">
                {{ item.data[col] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useVirtualList } from "@vueuse/core";

const tableHeaders = ref([]);
const tableData = ref([]);

// 使用 useVirtualList
const { list, containerProps, wrapperProps } = useVirtualList(tableData, {
  itemHeight: 35,
});

// 处理 CSV 上传
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    parseCSV(e.target.result);
  };
  reader.readAsText(file);
};

// 解析 CSV
const parseCSV = (csvText) => {
  const rows = csvText.split("\n").map(row => row.trim()).filter(row => row);
  if (rows.length < 2) return;

  tableHeaders.value = rows[0].split(",").map(col => col.trim());
  tableData.value = rows.slice(1).map(row => {
    const values = row.split(",").map(col => col.trim());
    return tableHeaders.value.reduce((obj, key, index) => {
      obj[key] = values[index] || "";
      return obj;
    }, {});
  });
};
</script>

<style scoped>
.container {
  width: 800px;
  margin: 20px auto;
}
.file-input {
  margin-bottom: 10px;
}
.table-container {
  height: 400px;
  overflow-y: auto;
  border: 1px solid #ddd;
}
.table-wrapper {
  width: 100%;
}
table {
  width: 100%;
  border-collapse: collapse; 
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  white-space: nowrap;
}
thead {
  position: sticky;
  top: 0;
  background: #f8f8f8;
  z-index: 2;
}
tbody {
  width: 100%;
}
</style>
