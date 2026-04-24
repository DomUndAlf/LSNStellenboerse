import "reflect-metadata";
import { DATA_SOURCE } from "../Config/data-source";
import { Location } from "../Models/Entities/Location";
import { DeleteResult, Repository } from "typeorm";


/**
 * New Location will be inserted into the Database.
 * The LocationID is the Primary key and it is automatically generated.
 * @param street
 * @param housenumber
 * @param postalcode
 * @param city
 * @throws Error
 */
export async function createLocation(
  street: string,
  housenumber: string,
  postalcode: string,
  city: string,
): Promise<number> {
  const LOCATION_REPO: Repository<Location> = DATA_SOURCE.getRepository(Location);

  const NEW_LOCATION: Location = LOCATION_REPO.create({
    Street: street,
    HouseNumber: housenumber,
    PostalCode: postalcode,
    City: city,
  });
  const SAVED_LOCATION: Location = await LOCATION_REPO.save(NEW_LOCATION);
  return SAVED_LOCATION.LocationID;
}

/**
 * Retrieves all Locations from The database
 * @returns Array of Location
 * @throws Error
 */
export async function readAllLocation(): Promise<Location[]> {
  const LOCATION_REPO: Repository<Location> = DATA_SOURCE.getRepository(Location);
  return await LOCATION_REPO.find();
}

/**
 * Retrieves a Location with unique locationid from the Database.
 * @param locationid
 * @returns an Object of a class of Location.
 * @throws Error
 */
export async function readLocation(locationid: number): Promise<Location | null> {
  const LOCATION_REPO: Repository<Location> = DATA_SOURCE.getRepository(Location);
  return await LOCATION_REPO.findOneBy({ LocationID: locationid });
}

/**
 * Warning: Throws error if no location with given LocationID exists.
 * The Attributes of Location with unique LocationID will be changed.
 * The LocationID cannot be changed, since it is the Primary key.
 * @param locationid
 * @param new_street
 * @param new_housenumber
 * @param new_postalcode
 * @param new_city
 * @returns the updated Location
 * @throws Error
 */
export async function updateLocation(
  locationid: number,
  new_street: string,
  new_housenumber: string,
  new_postalcode: string,
  new_city: string,
): Promise<boolean> {
  const LOCATION_REPO: Repository<Location> = DATA_SOURCE.getRepository(Location);
  let updatingLocation: Location | null = await LOCATION_REPO.findOneBy({
    LocationID: locationid,
  });

  if (!updatingLocation) {
    return false;
  }
  updatingLocation.Street = new_street;
  updatingLocation.City = new_city;
  updatingLocation.HouseNumber = new_housenumber;
  updatingLocation.PostalCode = new_postalcode;

  await LOCATION_REPO.save(updatingLocation);
  return true;
}

/**
 * A Location with unique LocationID will be deleted from the database.
 * @param locationid
 * @returns number of affected Entities
 * @throws Error
 */
export async function deleteLocation(locationid: number): Promise<boolean> {
  const LOCATION_REPO: Repository<Location> = DATA_SOURCE.getRepository(Location);
  const RESULT: DeleteResult = await LOCATION_REPO.delete(locationid);
  if (RESULT.affected == 0) {
    return false;
  } else {
    return true;
  }
}
