function main() {

	Vue.component("evidence-list-item", {
		props: ["evidence"],
		template: "<li class='list-group-item' :data-id='evidence.id' > {{ evidence.lat }} {{ evidence.lon }} {{evidence.formattedDate}} <i v-if='evidence.important' class='material-icons'>feedback</i></li>"
	})

	function createEvidenceListFromResponse(response){
		return JSON.parse(response);
	}

	var activeID = -1;

	function evidenceListIsEmpty(evidenceList){
		return typeof evidenceList === 'undefined' || evidenceList.length === 0;
	}

	function clearVideo(){
		$("video").attr("src","static/test.mp4");
	}

	function hasActiveID(){
		return activeID > -1;
	}

	function getActiveIndexFromEvidenceList(evidenceList, activeID){
		for(var i = 0; i < evidenceList.length; i++){
			if(evidenceList[i].id === activeID){
				return i;
			}
		}

		return -1;
	}

	function selectInEvidenceList(activeIndex){
		var list = $("#sideMenu ul li");
		list.removeClass("active");
		$(list[activeIndex]).addClass("active");	
	}

	function updateVideo(activeEvidence){
		if($("video").attr("src") !== activeEvidence.video_url){
			$("video").attr("src", activeEvidence.video_url);
		}
	}

	function unixTimeToNormalTime(unixTime){
		return new Date(parseInt(unixTime));
	}

	function formatTime(evidenceList){
		for(var i = 0; i < evidenceList.length; i++){
			evidenceList[i].formattedDate = unixTimeToNormalTime(evidenceList[i].date);
		}

		return evidenceList;
	}

	function updateGUI(){

		sideMenu.evidenceList = formatTime(sideMenu.evidenceList);

		updateGeneralMap(sideMenu.evidenceList);

		if(evidenceListIsEmpty(sideMenu.evidenceList)){
			clearSpecificMap();
			clearVideo();
			return;
		}

		var activeIndex = -1;
		if(hasActiveID()){
			activeIndex = getActiveIndexFromEvidenceList(sideMenu.evidenceList, activeID);
		}

		if(activeIndex !== -1){
			selectInEvidenceList(activeIndex);
		}else{
			selectInEvidenceList(0);
			activeIndex = 0;
		}

		updateSpecificMap(sideMenu.evidenceList, activeIndex);
		selectMarkerInGeneralMap(activeIndex);
		updateVideo(sideMenu.evidenceList[activeIndex]);
	}

	var sideMenu = new Vue({
		el: "#sideMenu",
		data: {
			evidenceList: []
		},
		methods: {
			loadData: function () {
				$.ajax({
					url: 'http://eyewit.azurewebsites.net/home/getevents',
					data: {
						importantOnly: document.getElementById('importantOnly').checked
					},
					success: function (response) {

						newEvidenceList = createEvidenceListFromResponse(response);
						formatTime(newEvidenceList);
						sideMenu.evidenceList = newEvidenceList;

						updateGUI();
					
					},
					error: function (xhr, exception){
						updateGUI();
					}
				});
			},
			selectItem: function (event) {
				activeID = parseInt($(event.target).data("id"));
				updateGUI();
			},
			toggleImportant: function (event) {
				if(event.keyCode == 32){
					if($(".active").length <= 0){
						return;
					}

					$.post(
						'http://eyewit.azurewebsites.net/home/changeeventstate',
						{id : $(".active").data("id"),
						importantOnly: document.getElementById('importantOnly').checked},
						function(response){

							newEvidenceList = createEvidenceListFromResponse(response);
							formatTime(newEvidenceList);
							sideMenu.evidenceList = newEvidenceList;

							updateGUI();
						}
					).fail(function(xhr, exception){
						console.log(xhr);
					});
    			}
			}
		},
		created: function (){
			window.addEventListener('keyup', this.toggleImportant);
		},
		mounted: function () {

			this.loadData();

			setInterval(function () {
				this.loadData();
			}.bind(this), 10000);
		}
	})

	// needs generalization
	var evidenceView = new Vue({
		el: "#evidenceView",
		data: {
			displayView: true
		},
		methods: {
			showEvidence: function() {
				this.displayView = true;
				mapView.displayView = false;
			}
		},
		mounted: function() {
			if(!this.displayView){
				return;
			}
			initSpecificMap();
		},
		updated: function() {
			if(!this.displayView){
				return;
			}
			initSpecificMap();
			updateGUI();
		}
	})

	var mapView = new Vue({
		el: "#mapView",
		data: {
			displayView: false
		},
		methods: {
			showMap: function() {
				this.displayView = true;
				evidenceView.displayView = false;
			}
		},
		mounted: function() {
			if(!this.displayView){
				return;
			}
			initGeneralMap();
		},
		updated: function() {
			if(!this.displayView){
				return;
			}
			initGeneralMap();
			updateGUI();
		}
	})

	var displayPartNav = new Vue({
		el: "#displayPartNav",
		methods: {
			showInfo: function() {
				evidenceView.showEvidence();
			},
			showMap: function() {
				mapView.showMap();
			}
		}
	})

	function updateGeneralMap(evidenceList){
	  removeGeneralMarkers();
	  for(var i = 0; i < evidenceList.length; i++){
	    generalMarkers.push(
	      new google.maps.Marker({
	        position: {lat: parseFloat(evidenceList[i].lat), lng: parseFloat(evidenceList[i].lon)},
	        map: generalMap,
	        evidenceID: evidenceList[i].id
	      })
	    );

	    generalMarkers[generalMarkers.length-1].addListener("click", function (){
	      
	      activeID = this.evidenceID;
	      updateGUI();
	    });
	  }
	}
}

$(document).ready(main());


