"use server";

import { auth, signIn, signOut } from "./auth";
import { getBookings, getGuest } from "./data-service";
import { supabase } from "./supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateGuest(formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
    throw new Error("Please provide a valid national ID");

  const updateData = { nationality, countryFlag, nationalID };

  const { data, error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId);

  if (error) throw new Error("Guest could not be updated");

  revalidatePath("/account/profile");
}
// export async function createBooking(bookingData, formData) {
//   // 1. Authentication
//   const session = await auth();
//   if (!session) throw new Error("You must be logged in");

//   // 2. Check if guest exists
//   const guest = await getGuest(session.user.email);
//   let guestId;

//   if (!guest) {
//     // 3. Create guest if it doesn't exist
//     const newGuest = {
//       email: session.user.email,
//       fullName: session.user.name,
//     };

//     const { data: createdGuest, error: guestCreationError } = await createGuest(
//       newGuest
//     );

//     if (guestCreationError) {
//       console.error("Error creating guest:", guestCreationError);
//       throw new Error("Guest could not be created");
//     }

//     guestId = createdGuest[0].id; // Assign the created guest's ID
//   } else {
//     guestId = guest.id; // Assign the existing guest's ID
//   }

//   // 4. Create the booking
//   const newBooking = {
//     ...bookingData,
//     guestId: guestId, // Use the correct guestId here
//     numGuests: Number(formData.get("numGuests")),
//     observations: formData.get("observations").slice(0, 1000),
//     extrasPrice: 0,
//     totalPrice: bookingData.cabinPrice,
//     isPaid: false,
//     hasBreakfast: false,
//     status: "unconfirmed",
//   };

//   console.log(newBooking);

//   const { error: bookingError } = await supabase
//     .from("bookings")
//     .insert([newBooking]);

//   if (bookingError) {
//     console.error("Supabase insert error:", bookingError);
//     throw new Error("Booking could not be created");
//   }
//   console.log("YES!!!!! it has been created!");
//   revalidatePath(`/cabins/${bookingData.cabinId}`);

//   redirect("/cabins/thankyou");
// }

export async function createBooking(bookingData, formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const newBooking = {
    ...bookingData,
    guestId: session.user.guestId,
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
    extrasPrice: 0,
    totalPrice: bookingData.cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };

  console.log(newBooking, bookingData);
  // const { error } = await supabase.from("bookings").insert([newBooking]);
  const { error } = await supabase.from("bookings").insert([newBooking]);
  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error("Booking could not be created");
  }

  revalidatePath(`/cabins/${bookingData.cabinId}`);

  redirect("/cabins/thankyou");
}

export async function deleteBooking(bookingId) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingIds.includes(bookingId))
    throw new Error("You are not allowed to delete this booking");

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) throw new Error("Booking could not be deleted");

  revalidatePath("/account/reservations");
}

export async function updateBooking(formData) {
  const bookingId = Number(formData.get("bookingId"));

  // 1) Authentication
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  // 2) Authorization
  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingIds.includes(bookingId))
    throw new Error("You are not allowed to update this booking");

  // 3) Building update data
  const updateData = {
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
  };

  // 4) Mutation
  const { error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId)
    .select()
    .single();

  // 5) Error handling
  if (error) throw new Error("Booking could not be updated");

  // 6) Revalidation
  revalidatePath(`/account/reservations/edit/${bookingId}`);
  revalidatePath("/account/reservations");

  // 7) Redirecting
  redirect("/account/reservations");
}

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
