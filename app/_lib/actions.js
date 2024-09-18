"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { getBookings } from "./data-service";
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

  if (error) throw new Error("Guest coul not be updated");
  revalidatePath("/account/profile");
}

export async function deleteReservation(bookingId) {
  await new Promise((res) => setTimeout(res, 2000));
  throw new Error("");
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const guestbookings = await getBookings(session.user.guestId);
  const guestbookingsIds = guestbookings.map((booking) => booking.id);

  if (!guestbookingsIds.includes(bookingId))
    throw new Error("You are not allowed to delete this booking");

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be deleted");
  }
  revalidatePath("/account/reservations");
}

export async function updateBooking(formData) {
  const bookingId = Number(formData.get("bookingId"));

  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const guestbookings = await getBookings(session.user.guestId);
  const guestbookingsIds = guestbookings.map((booking) => booking.id);

  if (!guestbookingsIds.includes(bookingId))
    throw new Error("You are not allowed to update this booking");

  const updateData = {
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
  };

  const { error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId)
    .select()
    .single();

  if (error) throw new Error("Booking could not be updated");
  //
  revalidatePath(`/account/reservations/edit/${bookingId}`);
  revalidatePath("/account/reservations");

  //
  redirect("/account/reservations");
}

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

// "use server";

// import { auth, signIn, signOut } from "./auth";

// export async function updateGuest(formData) {
//   const session = await auth();

//   if (!session) throw new Error("You must be logged in");
//   const nationalID = formData.get("nationalID");
//   const [nationality, countryFlag] = formData.get("nationality").split("%");

//   if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
//     throw new Error("Please provide a valid national ID");
//   const updateData = { nationality, countryFlag, nationalID };
// }

// export async function signInAction() {
//   await signIn("google", { redirectTo: "/account" });
// }

// export async function signOutAction() {
//   await signOut({ redirectTo: "/" });
// }
