package models;

import java.util.List;

import org.bson.types.ObjectId;

import utils.DBHolder;

import com.google.code.morphia.annotations.Entity;
import com.google.code.morphia.annotations.Id;

@Entity
public class Destination {

	@Id
	public ObjectId id;
	
	public String name;
	public double lat;
	public double lng;
	public int distance;
	
	public int currentDonation;
	
	public void save() {
		DBHolder.ds.save(this);
	}
	
	public static List<Destination> findAll() {
		return DBHolder.ds.find(Destination.class).asList();
	}

	public static Destination findById(ObjectId id) {
		return DBHolder.ds.find(Destination.class).field("id").equal(id).get();
	}
	
//	currentDistance: 450000
}
