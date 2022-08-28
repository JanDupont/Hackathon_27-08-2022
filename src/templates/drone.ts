/* eslint-disable max-len */
import { TemplateAPI } from "@livereader/graphly-d3";

const {
	Shape,
	SVGShape,
	ShapeStyle,
	OnZoom,
	LODStyle,
	Alignment,
	CollectionStyle,
	TextCollection,
	TagCollection,
	TagStyle,
	EmitEvent,
} = TemplateAPI;

export default {
	shapeSize: 400,
	shapeBuilder: shapeBuilder,
};

function shapeBuilder(data: any) {
	const shape = Shape.create("g");

	let jobPosX: number = 0;
	let jobPosY: number = 0;

	const highDetailBody = addHighDetailBody();
	const highDetailJob = addHighDetailJob();
	const lowDetailBody = addLowDetailBody();
	const lowDetailJob = addLowDetailJob(jobPosX, jobPosY);
	const warnShape = addWarnShape();

	OnZoom(data, 0.5, [
		LODStyle(lowDetailBody, "class", "hidden", (k) => k > 0.5),
		LODStyle(lowDetailJob, "class", "hidden", (k) => k > 0.5),
		LODStyle(highDetailBody, "class", "hidden", (k) => k < 0.5),
		LODStyle(highDetailJob, "class", "hidden", (k) => k < 0.5),
	]);

	function addHighDetailBody() {
		const bodyShape = Shape.Rectangle(618, 618, 40)
			.classed("body", true)
			.classed("gly-selectable", true)
			.classed("gly-animated", true);

		//Hintergrundbild für Zielort
		const destinationbg = SVGShape(`
			<defs>
				<pattern id="img1" patternUnits="userSpaceOnUse" width="308" height="200">
					<image href="https://i.imgur.com/pbnvckp.png" x="-3" y="0" width="308" height="199" />
				</pattern>
				<pattern id="img2" patternUnits="userSpaceOnUse" width="309" height="200">
					<image href="https://i.imgur.com/r2ieH95.png" x="35" y="0" width="309" height="199" />
				</pattern>
	  		</defs>
			<path d="M 309 2 L 40 2 C 30 2 0 0 0 50 L -00 199 L 309 199 L 309 0 Z" stroke="transparent" stroke-width="5" 
			  			fill="url(#img1)" />
			<path d="M 309 2 L 568 2 C 578 2 619 0 618 50 L 618 199 L 309 199 L 309 0 Z" stroke="transparent" stroke-width="5" 
						fill="url(#img2)" />

		`);

		const divider = SVGShape(`
        	<line y1="200" x2="618" y2="200" style="stroke:rgb(170,170,170);stroke-width:2" />
        	<line y1="500" x2="618" y2="500" style="stroke:rgb(170,170,170);stroke-width:2" />
        	<line x1="309" x2="309" y2="200" style="stroke:rgb(170,170,170);stroke-width:2" />
		`);

		const statusbar = SVGShape(`		
			<rect x="159" width="300" height="20"; style="stroke-width:0" fill="green"  stroke-width="0"/>
			<rect x="159" width="300" height="175" rx="15" ry="15" fill="green" stroke-width="0"/>
            <text id="organizationText" x="180" y="50">${data?.payload?.organization ?? ""}</text> 
            <text id="identificationNrText" x="320" y="50">${data?.payload?.identificationNr ?? ""}</text> 
		`);
		statusbar
			.select("#organizationText")
			.style("font-size", "x-large")
			.style("font-weight", "600")
			.attr("stroke", "none");
		statusbar
			.select("#identificationNrText")
			.style("font-size", "x-large")
			.style("font-weight", "600")
			.attr("stroke", "none");

		const battery = SVGShape(`
		<circle cx="583" cy="40" r="30" fill="white"/>
		<rect transform="translate(593,50) rotate(180)" width=20 height=${
			(29 * data?.payload?.battery) / 100 ?? 0
		} style="fill:green"/>
		<path transform="scale(2) translate(280,5)" fill="green" d="M16,18H8V6H16M16.67,4H15V2H9V4H7.33A1.33,1.33 0 0,0 6,5.33V20.67C6,21.4 6.6,22 7.33,22H16.67A1.33,1.33 0 0,0 18,20.67V5.33C18,4.6 17.4,4 16.67,4Z" />
		<text id="batteryText" x="585" y="62">${data?.payload?.battery ?? 0}%</text> 
		`);
		battery.style("stroke", "none");
		battery
			.select("#batteryText")
			.style("font-size", "small")
			.style("font-weight", "900")
			.style("fill", "#3D3737")
			.style("text-anchor", "middle")
			.style("dominant-baseline", "middle")
			.style("stroke", "none");

		let camera: any;
		if (data?.payload?.equipment?.camera == true) {
			camera = SVGShape(`
			<g transform="scale(0.60) translate(280,860)">
				<path d="M109.311 86.9399V64.5118C109.311 62.8123 108.634 61.1824 107.43 59.9807C106.225 58.7789 104.592 58.1038 102.889 58.1038H96.4662C110.852 47.7869 114.192 27.7939 103.852 13.2477C93.512 -0.978099 73.4744 -4.31027 59.0242 6.00664C54.7213 9.08249 51.2533 13.2477 48.9412 17.9255C33.8488 8.63392 14.0682 13.2477 4.75585 28.4347C-4.49226 43.4935 0.131793 63.2302 15.2884 72.5218C16.6371 73.2908 17.9858 74.1238 19.3987 74.6365V128.592C19.3987 130.291 20.0753 131.921 21.2797 133.123C22.4841 134.325 24.1177 135 25.821 135H102.889C104.592 135 106.225 134.325 107.43 133.123C108.634 131.921 109.311 130.291 109.311 128.592V106.164L135 131.796V61.3078L109.311 86.9399ZM77.1993 19.6557C80.6059 19.6557 83.873 21.006 86.2818 23.4094C88.6907 25.8129 90.0439 29.0727 90.0439 32.4717C90.0439 35.8708 88.6907 39.1306 86.2818 41.534C83.873 43.9375 80.6059 45.2878 77.1993 45.2878C73.7927 45.2878 70.5257 43.9375 68.1168 41.534C65.708 39.1306 64.3548 35.8708 64.3548 32.4717C64.3548 29.0727 65.708 25.8129 68.1168 23.4094C70.5257 21.006 73.7927 19.6557 77.1993 19.6557ZM32.2433 32.4717C35.6499 32.4717 38.9169 33.822 41.3258 36.2255C43.7346 38.6289 45.0879 41.8888 45.0879 45.2878C45.0879 48.6868 43.7346 51.9466 41.3258 54.3501C38.9169 56.7535 35.6499 58.1038 32.2433 58.1038C28.8367 58.1038 25.5696 56.7535 23.1608 54.3501C20.7519 51.9466 19.3987 48.6868 19.3987 45.2878C19.3987 41.8888 20.7519 38.6289 23.1608 36.2255C25.5696 33.822 28.8367 32.4717 32.2433 32.4717Z"/>
			</g>
				`);
			if (data?.payload?.active?.camera == true) {
				camera.style("fill", "#388e3c");
			} else {
				camera.style("fill", "#e5e5e5");
			}
		}

		let transport: any;
		if (data?.payload?.equipment?.transport == true) {
			transport = SVGShape(`
			<g transform="scale(0.60) translate(600,860)">
				<path d="M135 97.875C135 100.44 133.425 102.667 131.025 103.815L71.775 133.785C70.575 134.595 69.075 135 67.5 135C65.925 135 64.425 134.595 63.225 133.785L3.975 103.815C1.575 102.667 0 100.44 0 97.875V37.125C0 34.56 1.575 32.3325 3.975 31.185L63.225 1.215C64.425 0.405 65.925 0 67.5 0C69.075 0 70.575 0.405 71.775 1.215L131.025 31.185C133.425 32.3325 135 34.56 135 37.125V97.875ZM67.5 14.5125L53.325 21.735L97.5 44.6175L112.2 37.125L67.5 14.5125ZM22.8 37.125L67.5 59.7375L82.2 52.3125L38.1 29.3625L22.8 37.125ZM15 93.8925L60 116.708V71.415L15 48.6675V93.8925ZM120 93.8925V48.6675L75 71.415V116.708L120 93.8925Z"/>
			</g>
			`);
			if (data?.payload?.active?.transport == true) {
				transport.style("fill", "#388e3c");
			} else {
				transport.style("fill", "#e5e5e5");
			}
		}

		bodyShape.append(() => destinationbg.node());
		bodyShape.append(() => battery.node());
		bodyShape.append(() => divider.node());
		bodyShape.append(() => statusbar.node());
		bodyShape.append(() => camera.node());
		bodyShape.append(() => transport.node());

		const tags = addHighDetailedTags(bodyShape);

		shape.append(() => bodyShape.node());

		return bodyShape;
	}

	function addHighDetailJob() {
		let jobShape: any;
		if (data?.payload?.job === "observe") {
			jobShape = SVGShape(`
			<g transform="scale(0.70) translate(250,120)">
				<rect id="background" y="192.067" x="0" width="271.624" height="271.624" rx="56" transform="rotate(-45 0 192.067)"/>
				<path id="symbol" d="M290 155.965L273.086 165.815L233.288 97.85L250.202 88L290 155.965ZM169.611 146.115L199.46 197.335L260.152 162.86L230.303 111.64L169.611 146.115ZM185.53 193.395L165.631 158.92L122.848 183.545L142.747 218.02L185.53 193.395ZM93 212.11L102.949 228.855L128.818 214.08L118.869 197.335L93 212.11ZM192.495 206.2L189.51 202.26L146.727 226.885L149.712 230.825C151.702 233.78 154.687 236.735 157.672 238.705L141.753 285H161.652L175.581 242.645H176.576L191.5 285H211.399L192.495 229.84C197.47 222.945 197.47 214.08 192.495 206.2Z"/>
			</g>
			`);
			jobShape.select("#background").style("fill", "#A6A6A6");
			jobShape.select("#symbol").style("fill", "#1a1a1a");
		}
		shape.append(() => jobShape.node());
		return jobShape;
	}

	function addWarnShape() {
		const warningColor = "#E57373";
		if (data?.payload?.warning) {
			const warnShape = SVGShape(`
                <g transform="translate(210,540)">
                    <path id="warnTriangleBG" d="M91.2858 4.5C94.7499 -1.5 103.41 -1.5 106.874 4.5L196.941 160.5C200.405 166.5 196.075 174 189.147 174H9.01343C2.08523 174 -2.2449 166.5 1.2192 160.5L91.2858 4.5Z" fill="E57373"/>
                    <rect stroke="none" x="93.0801" y="40" width="12" height="67" fill="#3D3737"/>
                    <circle stroke="none" cx="98.5801" cy="145.5" r="10.5" fill="#3D3737"/>
                    <g transform="translate(-160, 180)" width="500" height="80">
                        <rect id="warnTextBG"  width="500" height="80" rx="25"/>
                        <text id="warnText" x="250" y="43">${data?.payload?.warningText}</text>  
                    </g>
                </g>
            `);
			warnShape
				.select("#warnTriangleBG")
				.style("fill", warningColor)
				.attr("stroke", "#1a1a1a")
				.attr("stroke-width", "3");
			warnShape
				.select("#warnTextBG")
				.style("fill", warningColor)
				.attr("stroke", "#1a1a1a")
				.attr("stroke-width", "3");
			warnShape
				.select("#warnText")
				.style("font-size", "xx-large")
				.style("font-weight", "600")
				.style("fill", "#3D3737")
				.style("text-anchor", "middle")
				.style("dominant-baseline", "middle")
				.style("stroke", "none");
			shape.append(() => warnShape.node());
		}
	}

	function addLowDetailBody() {
		let lowDetailShape: any = null;

		switch (data?.payload?.droneType) {
			case "plane":
				jobPosX = 312;
				jobPosY = 410;
				lowDetailShape = SVGShape(`
                    <path transform="translate(90,0)" d="M224.5 0L418.923 661.5H30.0773L224.5 0Z" fill="#D9D9D9"/>
                `);
				shape.append(() => lowDetailShape.node());
				break;
			case "blimp":
				jobPosX = 310;
				jobPosY = 410;
				lowDetailShape = SVGShape(`
				<g transform="scale(0.5) translate(0,500)" >
                    <path d="M317.5 0C275.805 0 234.519 8.21238 195.998 24.1682C157.477 40.1241 122.476 63.511 92.9936 92.9936C63.511 122.476 40.1241 157.477 24.1682 195.998C8.21238 234.519 -1.82253e-06 275.805 0 317.5C1.82253e-06 359.195 8.21238 400.481 24.1683 439.002C40.1241 477.523 63.511 512.524 92.9936 542.006C122.476 571.489 157.477 594.876 195.998 610.832C234.519 626.788 275.805 635 317.5 635L317.5 317.5L317.5 0Z" fill="#D9D9D9"/>
                    <path d="M908.5 635C950.195 635 991.481 626.788 1030 610.832C1068.52 594.876 1103.52 571.489 1133.01 542.006C1162.49 512.524 1185.88 477.523 1201.83 439.002C1217.79 400.481 1226 359.195 1226 317.5C1226 275.805 1217.79 234.519 1201.83 195.998C1185.88 157.477 1162.49 122.476 1133.01 92.9936C1103.52 63.511 1068.52 40.1241 1030 24.1682C991.481 8.21237 950.195 -3.64507e-06 908.5 0L908.5 317.5V635Z" fill="#D9D9D9"/>
                    <circle cx="612.5" cy="317.5" r="317.5" fill="#D9D9D9"/>
					</g>
                `);
				shape.append(() => lowDetailShape.node());
				break;
			case "hoverDrone":
				jobPosX = 309;
				jobPosY = 420;
				lowDetailShape = SVGShape(`
				<g transform="scale(0.7) translate(130,160)">
                    <circle cx="317.5" cy="487.5" r="317.5" fill="#D9D9D9"/> 
                    <ellipse cx="317.5" cy="57.5" rx="317.5" ry="57.5" fill="#D9D9D9"/>
                    <rect x="287" y="115" width="62" height="55" fill="#D9D9D9"/>
				</g>
                `);
				shape.append(() => lowDetailShape.node());
				break;
			case "quadcopter":
				jobPosX = 309;
				jobPosY = 309;

				lowDetailShape = SVGShape(`
                    <path d="M126.409 0C196.636 0 252.818 56.1818 252.818 126.409C252.818 151.129 245.795 174.164 233.435 193.827L236.245 196.636H381.755L384.565 193.827C372.205 174.164 365.182 151.129 365.182 126.409C365.182 56.1818 421.364 0 491.591 0C561.818 0 618 56.1818 618 126.409C618 196.636 561.818 252.818 491.591 252.818C466.871 252.818 443.836 245.795 424.173 233.435L393.273 264.335V353.665L424.173 384.565C443.836 372.205 466.871 365.182 491.591 365.182C561.818 365.182 618 421.364 618 491.591C618 561.818 561.818 618 491.591 618C421.364 618 365.182 561.818 365.182 491.591C365.182 466.871 372.205 443.836 384.565 424.173L381.755 421.364H236.245L233.435 424.173C245.795 443.836 252.818 466.871 252.818 491.591C252.818 561.818 196.636 618 126.409 618C56.1818 618 0 561.818 0 491.591C0 421.364 56.1818 365.182 126.409 365.182C151.129 365.182 174.164 372.205 193.827 384.565L224.727 353.665V264.335L193.827 233.435C174.164 245.795 151.129 252.818 126.409 252.818C56.1818 252.818 0 196.636 0 126.409C0 56.1818 56.1818 0 126.409 0ZM126.409 56.1818C107.784 56.1818 89.9211 63.5807 76.7509 76.7509C63.5807 89.9211 56.1818 107.784 56.1818 126.409C56.1818 145.035 63.5807 162.897 76.7509 176.067C89.9211 189.237 107.784 196.636 126.409 196.636C145.035 196.636 162.897 189.237 176.067 176.067C189.237 162.897 196.636 145.035 196.636 126.409C196.636 107.784 189.237 89.9211 176.067 76.7509C162.897 63.5807 145.035 56.1818 126.409 56.1818ZM126.409 421.364C107.784 421.364 89.9211 428.763 76.7509 441.933C63.5807 455.103 56.1818 472.965 56.1818 491.591C56.1818 510.216 63.5807 528.079 76.7509 541.249C89.9211 554.419 107.784 561.818 126.409 561.818C145.035 561.818 162.897 554.419 176.067 541.249C189.237 528.079 196.636 510.216 196.636 491.591C196.636 472.965 189.237 455.103 176.067 441.933C162.897 428.763 145.035 421.364 126.409 421.364ZM491.591 56.1818C472.965 56.1818 455.103 63.5807 441.933 76.7509C428.763 89.9211 421.364 107.784 421.364 126.409C421.364 145.035 428.763 162.897 441.933 176.067C455.103 189.237 472.965 196.636 491.591 196.636C510.216 196.636 528.079 189.237 541.249 176.067C554.419 162.897 561.818 145.035 561.818 126.409C561.818 107.784 554.419 89.9211 541.249 76.7509C528.079 63.5807 510.216 56.1818 491.591 56.1818ZM491.591 421.364C472.965 421.364 455.103 428.763 441.933 441.933C428.763 455.103 421.364 472.965 421.364 491.591C421.364 510.216 428.763 528.079 441.933 541.249C455.103 554.419 472.965 561.818 491.591 561.818C510.216 561.818 528.079 554.419 541.249 541.249C554.419 528.079 561.818 510.216 561.818 491.591C561.818 472.965 554.419 455.103 541.249 441.933C528.079 428.763 510.216 421.364 491.591 421.364ZM81.7446 456.477L113.487 475.017C117.139 472.208 121.634 470.523 126.409 470.523C131.997 470.523 137.355 472.742 141.307 476.693C145.258 480.645 147.477 486.003 147.477 491.591L147.196 494.4L178.939 512.659L171.074 526.705L139.331 508.165C135.679 510.974 131.185 512.659 126.409 512.659C120.821 512.659 115.463 510.439 111.512 506.488C107.561 502.537 105.341 497.179 105.341 491.591L105.622 488.782L73.8791 470.523L81.7446 456.477ZM73.8791 147.477L105.622 129.218L105.341 126.409C105.341 120.821 107.561 115.463 111.512 111.512C115.463 107.561 120.821 105.341 126.409 105.341C131.185 105.341 135.679 107.026 139.331 109.835L171.074 91.2955L178.939 105.341L147.196 123.6L147.477 126.409C147.477 131.997 145.258 137.355 141.307 141.307C137.355 145.258 131.997 147.477 126.409 147.477C121.634 147.477 117.139 145.792 113.487 142.983L81.7446 161.523L73.8791 147.477ZM446.926 91.2955L478.669 109.835C482.321 107.026 486.815 105.341 491.591 105.341C497.179 105.341 502.537 107.561 506.488 111.512C510.439 115.463 512.659 120.821 512.659 126.409L512.378 129.218L544.121 147.477L536.255 161.523L504.513 142.983C500.861 145.792 496.366 147.477 491.591 147.477C486.003 147.477 480.645 145.258 476.693 141.307C472.742 137.355 470.523 131.997 470.523 126.409L470.804 123.6L439.061 105.341L446.926 91.2955ZM439.061 512.659L470.523 491.591C470.523 486.003 472.742 480.645 476.693 476.693C480.645 472.742 486.003 470.523 491.591 470.523C496.366 470.523 500.861 472.208 504.513 475.017L536.255 456.477L544.121 470.523L512.659 491.591C512.659 497.179 510.439 502.537 506.488 506.488C502.537 510.439 497.179 512.659 491.591 512.659C486.815 512.659 482.321 510.974 478.669 508.165L446.926 526.705L439.061 512.659Z"/>
                `);
				lowDetailShape.attr("fill", data.payload.color).attr("stroke", "#1a1a1a").attr("stroke-width", "10");

				const rotArrow = SVGShape(`
				<g transform="scale(0.5) translate(515,515) rotate(${data?.payload?.directionDegree ?? 0},109,109)">
				<path d="M109 1208L14.6032 857.75H203.397L109 1208Z" fill="blue"/>
				</g>
			
				`);

				lowDetailShape.append(() => rotArrow.node());
				shape.append(() => lowDetailShape.node());
				break;
		}
		return lowDetailShape;
	}

	function addLowDetailJob(posX: number, posY: number) {
		let jobShape: any;
		if (data?.payload?.job === "observe") {
			jobShape = SVGShape(`
            <circle cx="${posX}" cy="${posY}" r="78" fill="#388E3C"/>
                <path transform="translate(${posX - 80}, ${
				posY - 80
			})"  d="M130 61.88L121.071 67.08L100.061 31.2L108.99 26L130 61.88ZM66.4444 56.68L82.202 83.72L114.242 65.52L98.4848 38.48L66.4444 56.68ZM74.8485 81.64L64.3434 63.44L41.7576 76.44L52.2626 94.64L74.8485 81.64ZM26 91.52L31.2525 100.36L44.9091 92.56L39.6566 83.72L26 91.52ZM78.5252 88.4L76.9495 86.32L54.3636 99.32L55.9394 101.4C56.9899 102.96 58.5657 104.52 60.1414 105.56L51.7374 130H62.2424L69.596 107.64H70.1212L78 130H88.505L78.5252 100.88C81.1515 97.24 81.1515 92.56 78.5252 88.4Z" fill="black"/>
        `);
		}
		if (data?.payload?.job === "transport") {
			jobShape = SVGShape(`
			<circle cx="${posX}" cy="${posY}" r="78" fill="#388E3C"/>
                <path transform="translate(${posX - 80}, ${
				posY - 80
			})" d="M177.083 151.042C185.729 151.042 192.708 144.062 192.708 135.417C192.708 126.771 185.729 119.792 177.083 119.792C168.438 119.792 161.458 126.771 161.458 135.417C161.458 144.062 168.438 151.042 177.083 151.042ZM192.708 57.2917H166.667V83.3333H213.125L192.708 57.2917ZM52.0833 151.042C60.7292 151.042 67.7083 144.062 67.7083 135.417C67.7083 126.771 60.7292 119.792 52.0833 119.792C43.4375 119.792 36.4583 126.771 36.4583 135.417C36.4583 144.062 43.4375 151.042 52.0833 151.042ZM197.917 41.6667L229.167 83.3333V135.417H208.333C208.333 152.708 194.375 166.667 177.083 166.667C159.792 166.667 145.833 152.708 145.833 135.417H83.3333C83.3333 152.708 69.375 166.667 52.0833 166.667C34.7917 166.667 20.8333 152.708 20.8333 135.417H0V20.8333C0 9.27083 9.27083 0 20.8333 0H166.667V41.6667H197.917ZM20.8333 20.8333V114.583H28.75C34.4792 108.229 42.8125 104.167 52.0833 104.167C61.3542 104.167 69.6875 108.229 75.4167 114.583H145.833V20.8333H20.8333ZM93.75 31.25L130.208 67.7083L93.75 104.167V78.125H41.6667V57.2917H93.75V31.25Z" fill="black"/>
			`);
		}
		if (data?.payload?.job === "data") {
			jobShape = SVGShape(`
			<circle cx="${posX}" cy="${posY}" r="78" fill="#388E3C"/>
                <path transform="translate(${posX - 80}, ${
				posY - 80
			})" d="M53.125 173.958L50 166.667L52.0833 162.5C32.2917 157.292 20.8333 148.958 20.8333 145.833V122.917C34.375 129.167 50 133.333 68.75 135.417C76.0417 127.083 85.4167 119.792 94.7917 114.583H83.3333C58.3333 114.583 34.375 108.333 20.8333 98.9583V68.75C36.4583 77.0833 58.3333 83.3333 83.3333 83.3333C108.333 83.3333 130.208 78.125 145.833 68.75V97.9167C142.708 100 139.583 102.083 135.417 104.167C145.833 104.167 156.25 106.25 166.667 110.417V41.6667C166.667 18.75 129.167 0 83.3333 0C37.5 0 0 18.75 0 41.6667V145.833C0 164.583 25 180.208 59.375 185.417C57.2917 182.292 55.2083 178.125 53.125 173.958ZM83.3333 20.8333C123.958 20.8333 145.833 36.4583 145.833 41.6667C145.833 46.875 123.958 62.5 83.3333 62.5C42.7083 62.5 20.8333 46.875 20.8333 41.6667C20.8333 36.4583 42.7083 20.8333 83.3333 20.8333ZM135.417 156.25C141.667 156.25 145.833 160.417 145.833 166.667C145.833 172.917 141.667 177.083 135.417 177.083C129.167 177.083 125 172.917 125 166.667C125 160.417 129.167 156.25 135.417 156.25ZM135.417 125C107.292 125 82.2917 142.708 72.9167 166.667C82.2917 190.625 107.292 208.333 135.417 208.333C163.542 208.333 188.542 190.625 197.917 166.667C188.542 142.708 163.542 125 135.417 125ZM135.417 192.708C120.833 192.708 109.375 181.25 109.375 166.667C109.375 152.083 120.833 140.625 135.417 140.625C150 140.625 161.458 152.083 161.458 166.667C161.458 181.25 150 192.708 135.417 192.708Z" fill="black"/>
			`);
		}
		shape.append(() => jobShape.node());
		return jobShape;
	}

	function addHighDetailedTags(targetShape: any) {
		const tagsData: any = [
			data?.payload?.speed ?? "0km/h",
			data?.payload?.direction ?? "??",
			data?.payload?.flightHeight ?? "??m",
		];
		const tagCollection = TagCollection(
			tagsData,
			CollectionStyle(100, 600, 6, 430, 100, 40, 1, Alignment.Center),
			TagStyle(
				[15, 25],
				[
					ShapeStyle("class", "gly-text", true),
					ShapeStyle("fill", "black", true),
					ShapeStyle("font-size", "24px", true),
					ShapeStyle("font-weight", "900", true),
				],
				[ShapeStyle("class", "gly_gray_fill", true)],
				30
			)
		);
		targetShape.append(() => tagCollection.node());
		return tagCollection;
	}

	return shape;
}
