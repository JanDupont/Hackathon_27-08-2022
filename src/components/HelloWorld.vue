<template>
	<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%">
		<GraphlyD3 ref="graphly" />
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { GraphlyD3 } from "@livereader/graphly-d3-vue";
import "@livereader/graphly-d3-vue/style.css";

import DroneTemplate from "../templates/drone";
import { AnchorType, Graph, Node } from "@livereader/graphly-d3";

const graphly = ref<any>(null);

const graph = ref<Graph>({ nodes: [], links: [] });

enum DroneType {
	Quadcopter = "quadcopter",
	Plane = "plane",
	Blimp = "blimp",
	HoverDrone = "hoverDrone",
}
enum Jobs {
	//TODO: Transport = "transport",
	Observe = "observe",
}

const testNode: Node = {
	id: Math.random().toString(),
	shape: { type: "drone", scale: 1 },
	anchor: { type: AnchorType.Soft, x: 0, y: 0 },
	payload: {
		droneType: DroneType.Blimp,
		color: "white",
		job: Jobs.Observe,
		battery: "50",
		warning: true,
		warningText: "Potentieller Waldbrand",
		organization: "Polizei",
		identificationNr: "1234-5678",
		speed: "973km/h",
		direction: "NW",
		directionDegree: "135",
		flightHeight: "400m",
		equipment: {
			camera: true,
			transport: true,
		},
		active: {
			camera: true,
			transport: false,
		},
	},
};

onMounted(() => {
	const simulation = graphly.value?.simulation;
	simulation.templateStore.add("drone", DroneTemplate);
	graph.value.nodes.push(testNode);
	simulation.render(graph.value);
});
</script>

<style scoped></style>
