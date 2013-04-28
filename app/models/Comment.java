package models;

import java.util.Date;
import java.util.List;

import org.bson.types.ObjectId;

import utils.DBHolder;

import com.google.code.morphia.annotations.Entity;
import com.google.code.morphia.annotations.Id;
import com.google.code.morphia.annotations.Reference;

@Entity
public class Comment {

	@Id
	public ObjectId id;

	public String text;
	public Date date;
	
	@Reference
	public Destination destination;
	
	public void save() {
		DBHolder.ds.save(this);
	}
	
	public static List<Comment> findAllForDestination(Destination destination) {
		return DBHolder.ds.find(Comment.class).field("destination").equal(destination).asList();
	}
}
