$(function() {
	var startOfMapPaths = new google.maps.LatLng(50.075, 14.437);
	var map = initializeMap();
	var geocoder = new google.maps.Geocoder();
	var mapLines = [];
	var planeMarkers = [];
	
	function initializeMap() {
		var mapOptions = {
				center: startOfMapPaths,
				zoom: 5,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				mapTypeControl: false,
				streetViewControl: false,
				panControlOptions: {
					position: google.maps.ControlPosition.TOP_RIGHT
				},
				zoomControlOptions: {
					position: google.maps.ControlPosition.TOP_RIGHT
				}
		};
		return new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
	}
	
	function loadMainPanel(data) {
		var mainPanel = $('#app-panel');
		mainPanel.html('');
		clearPathsFromMap();

		var destinationsPanel = $('<div class="destinations"></div>');
		
		$.each(data, function(index, value) {
			value.destination.id = value.destinationId;
			value.destination.currentDistance = function() {
				return Math.round(this.currentDonation / pricePerKm(this));
			}
			destinationsPanel.append(createDestinationPanel(value.destination, value.comments));
			
			drawPathToMap(value.destination);
		});
		mainPanel.append(destinationsPanel);

		mainPanel.append(createAddDestinationPanel());
	}

	function createDestinationPanel(destination, comments) {
		var destinationPanel = $('<div class="destination"></div');
		destinationPanel.append('<div class="title">' + destination.name + '<span class="distance-total">(' + destination.distance + 'km)</span></div>');
		destinationPanel.append('<div class="distance-current">' + destination.currentDistance() + 'km</div>');
		
		destinationPanel.append(createDonationsPanel(destination));
		
		var commentsPanel = $('<div class="comments"></div>');
		$.each(comments, function(index, comment) {
			commentsPanel.append('<div class="comment">' + comment.text + '<div class="date">' + /*comment.date +*/ '</div></div>');
		});
		destinationPanel.append(commentsPanel);
		
		var textarea = $('<textarea name="comment-text" class="new-comment" title="Napište komentář..." placeholder="Napište komentář..."></textarea>');
		var form = $('<form method="post" action="/api/comment"><input type="hidden" name="destination-id" value="' + destination.id + '"></form');
		form.append(textarea);
		destinationPanel.append(form);
		
		textarea.keypress(function(e) {
			  if (e.keyCode == 13 && !e.shiftKey) {
			    e.preventDefault();
			    $.post(
			      "/api/comment",
			      form.serialize(),
			      function() {
			    	  textarea.val("");
			    	  refreshData();
			      },
			      "json"
			    );
			  }
			});

		return destinationPanel;
	}

	function createDonationsPanel(destination) {
		var donationsPanel = $('<div class="donations"></div>');
		$.each([200, 500, 1000, 2000, 5000], function(index, value) {
			var distancePerDonation = Math.round(value / pricePerKm(destination));
			var buttonDonate = $('<button>' + distancePerDonation + 'km<br>' + value + 'kč</button>');
			donationsPanel.append(buttonDonate);
			buttonDonate.click(function(e) {
				$.post(
					'/api/donation', 
					{amount: value, 'destination-id': destination.id}, 
					function() {
						refreshData();
					}, 
					"json");
			});
		});
		
		return donationsPanel;
	}
	
	function createAddDestinationPanel() {
		var panel = $('<div class="add-destination"><div class="description">Myslíte že by se nám líbilo jinde? Navrhněte nám nějaké hezké místo.</div></div');
		
		var textarea = $('<textarea name="destination-name" title="Kam bychom měli jet?" placeholder="Kam bychom měli jet?"></textarea>');
		var form = $('<form></form');
		form.append(textarea);
		panel.append(form);
		
		var newDestinationMarker = null;
		var newDestination = null;
		var buttonAdd = null;
		textarea.keypress(function(e) {
			  if (e.keyCode == 13 && !e.shiftKey) {
			    e.preventDefault();
			    
			    var address = textarea.val();
			    geocoder.geocode( { 'address': address}, function(results, status) {
			      if (status == google.maps.GeocoderStatus.OK) {
			    	var result = results[0];
			        map.setCenter(result.geometry.location);
			        
			        if (newDestinationMarker != null) {
			        	newDestinationMarker.setMap(null);
			        }
			        newDestinationMarker = new google.maps.Marker({
			            map: map,
			            position: result.geometry.location
			        });
			        
			        textarea.val(result.formatted_address);
			        
			        newDestination = {
			        	name: result.formatted_address,
			        	lat: result.geometry.location.lat(),
			        	lng: result.geometry.location.lng(),
			        	distance: google.maps.geometry.spherical.computeDistanceBetween(startOfMapPaths, result.geometry.location)
			        };
			        
			        if (buttonAdd == null) {
			        	textarea.css('width', '80%');
				        buttonAdd = $('<input type="submit" value="Přidat"></input>');
				        form.append(buttonAdd);
				        form.submit(function(e) {
				        	e.preventDefault();
				        	
						    $.post(
						      "/api/destination",
						      newDestination,
						      function() {
						    	  textarea.val("");
						    	  newDestinationMarker.setMap(null);
						    	  
						    	  refreshData();
						      },
						      "json"
						    );
				        });
			        }
			      } else {
			        alert("Místo, které jste zadali nebylo nalezeno. (Geocode was not successful for the following reason: " + status + ")");
			      }
			    });
			    
			  }
			});

		return panel;
	}
	
	function drawPathToMap(destination) {
		var path = [startOfMapPaths, new google.maps.LatLng(destination.lat, destination.lng)];
		var line = new google.maps.Polyline({
			path: path,
			strokeColor: "#555",
			strokeOpacity: 0.6,
			strokeWeight: 2,
			geodesic: true
		});

		line.setMap(map);
		mapLines.push(line);
		
		if (destination.currentDistance() > 0) {
			var heading = google.maps.geometry.spherical.computeHeading(path[0], path[1]);
			var currentEnd = google.maps.geometry.spherical.computeOffset(startOfMapPaths, destination.currentDistance() * 1000, heading);
	
			var currentPath = [startOfMapPaths, currentEnd];
			var currentLine = new google.maps.Polyline({
				path: currentPath,
				strokeColor: "#5D5",
				strokeOpacity: 0.8,
				strokeWeight: 2,
				geodesic: true
			});
	
			currentLine.setMap(map);
			
			mapLines.push(currentLine);
			
			var planeMarker = new google.maps.Marker({
			      position: currentEnd,
			      map: map,
			      icon: {
			    	  url: '/api/planeIcon/' + heading,
			    	  anchor: new google.maps.Point(22, 22)
			      },
			      rotation: 0.5
			  });
			
			planeMarkers.push(planeMarker);
		}
	}
	
	function clearPathsFromMap() {
		$.each(mapLines, function(index, line) {
			line.setMap(null);
		});
		$.each(planeMarkers, function(index, planeMarker) {
			planeMarker.setMap(null);
		});
	}

	function destinationPrice(destination) {
		if (destination.distance < 300) {
			return 2000;
		} else if (destination.distance < 500) {
			return 5000;
		} else if (destination.distance < 1000) {
			return 10000;
		} else if (destination.distance < 2000) {
			return 20000;
		} else {
			return 40000;
		}
	}
	
	function pricePerKm(destination) {
		var totalPrice = destinationPrice(destination);
		return totalPrice / destination.distance;
	}
	
	function refreshData() {
		$.get("/api/destinations", function(data) {
			loadMainPanel(data);
		});
	}

	refreshData();
});