package controllers;

import java.util.Date;
import java.util.List;

import models.Comment;
import models.Destination;
import models.Donation;

import org.bson.types.ObjectId;

import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;

import com.google.common.collect.Lists;

public class Api extends Controller {

//	public static Result getData() {
//		return ok(main.render()).as("text/json");
//	}

	public static Result addComment() {
		String commentText = form().bindFromRequest().get("comment-text");
		String destinationIdText = form().bindFromRequest().get("destination-id");
		
		Comment comment = new Comment();
		comment.text = commentText;
		comment.date = new Date();
		
		ObjectId destinationId = new ObjectId(destinationIdText);
		comment.destination = Destination.findById(destinationId);
		
		comment.save();
		
		return ok();
	}

	public static Result addDonation() {
		String amountText = form().bindFromRequest().get("amount");
		String destinationIdText = form().bindFromRequest().get("destination-id");
		
		Donation donation = new Donation();
		donation.amount = Integer.valueOf(amountText);
		donation.date = new Date();
		
		ObjectId destinationId = new ObjectId(destinationIdText);
		donation.destination = Destination.findById(destinationId);
		
		donation.save();
		
		return ok();
	}

	public static Result addDestination() {
		String name = form().bindFromRequest().get("name");
		String latText = form().bindFromRequest().get("lat");
		String lngText = form().bindFromRequest().get("lng");
		String distanceText = form().bindFromRequest().get("distance");
		
		Destination destination = new Destination();
		destination.name = name;
		destination.lat = Double.valueOf(latText);
		destination.lng = Double.valueOf(lngText);
		
		Double distanceInMeters = Double.valueOf(distanceText);
		int distanceInKm = (int) (distanceInMeters / 1000d);
		destination.distance = distanceInKm;
		
		destination.save();
		
		return ok();
	}

	public static Result listDestinations() {
		List<Destination> destinations = Destination.findAll();
		
		List<DestinationWithComments> result = Lists.newArrayList();
		
		for (Destination destination : destinations) {
			destination.currentDonation = calculateCurrentDonation(destination);
			List<Comment> comments = Comment.findAllForDestination(destination);
			
			result.add(new DestinationWithComments(destination, comments));
		}
		
		return ok(Json.toJson(result));
	}

	private static int calculateCurrentDonation(Destination destination) {
		List<Donation> donations = Donation.findAllForDestination(destination);
		
		int currentDonation = 0;
		for (Donation donation : donations) {
			currentDonation += donation.amount;
		}
		
		return currentDonation;
	}
	
	

	@SuppressWarnings("unused")
	private static class DestinationWithComments {
		public String destinationId;
		public Destination destination;
		public List<Comment> comments;
		
		public DestinationWithComments(Destination destination, List<Comment> comments) {
			super();
			this.destination = destination;
			this.destinationId = destination.id.toString();
			this.comments = comments;
		}
	}
}