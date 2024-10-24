import { auth } from "../_lib/auth";

export const metadata = {
  title: "Guest area",
};

export default async function Page() {
  const session = await auth();

  const firstName = session.user.name.split(" ").at(0);

  return (
    <h2 className="font-semibold text-2xl text-accent-400 mb-7">
      Welcome, {firstName}
    </h2>
  );
}

// import { auth } from "../_lib/auth";

// export const metadata = {
//   title: "Guest area",
// };

// async function Page() {
//   const session = await auth();
//   const firstName = session.user.name.split(" ").at(0);
//   console.log(firstName);
//   return (
//     <h2 className="font-semibold text-2xl text-accent-400 mb-7">
//       Welcome, {firstName}
//       {/* Welcome, {session.user.name} */}
//     </h2>
//   );
// }

// export default Page;
// import Spinner from "@/app/_components/Spinner";

// export default function Loading() {
//   return <Spinner />;
// }
