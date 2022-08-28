<template>
	<GraphlyD3 ref="graphly" />
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { GraphlyD3 } from "@livereader/graphly-d3-vue";
import "@livereader/graphly-d3-vue/style.css";

const graphly = ref<any>(null);

onMounted(() => {
	const simulation = graphly.value?.simulation;
	simulation.render({
		nodes: [],
		links: [],
	});
});
</script>

<style scoped></style>
