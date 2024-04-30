import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";

export default async function Home() {
  db.set("hello", "hello");
  return (
    <>
      <div className="text-red-200">hello world</div>
      <Button>Hello</Button>
    </>
  );
}
