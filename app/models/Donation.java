package models;

import java.util.Date;
import java.util.List;

import org.bson.types.ObjectId;

import utils.DBHolder;

import com.google.code.morphia.annotations.Entity;
import com.google.code.morphia.annotations.Id;
import com.google.code.morphia.annotations.Reference;

@Entity
public class Donation {

	@Id
	public ObjectId id;

	public int amount;
	public Date date;
	
	@Reference
	public Destination destination;
	
	public void save() {
		DBHolder.ds.save(this);
	}

	public static List<Donation> findAllForDestination(Destination destination) {
		return DBHolder.ds.find(Donation.class).field("destination").equal(destination).asList();
	}
	
}
